-- Mas datos de prueba para ReclamaYA (se corre sobre una base que ya tiene usuarios, zonas y reclamos).
-- Va directo a PostgreSQL porque la API siempre pone la fecha de hoy y aqui se necesita
-- historia de 12 meses para que los graficos de tendencia tengan sentido.
--
--   psql -h localhost -U postgres -d BDReportAndBeHeard -f datos-prueba/mas_datos.sql
--
-- Que hace:
--   1. Reparte en los ultimos 12 meses los reclamos de prueba que se crearon todos el mismo dia.
--   2. Agrega ~1500 reclamos nuevos (mismas zonas, coordenadas dentro del distrito).
--   3. Registra moderaciones con costo para los reclamos atendidos, resueltos o descartados.
--   4. Agrega comentarios, apoyos y notificaciones.

BEGIN;
SELECT setseed(0.2026);

-- Fecha aleatoria en los ultimos 12 meses, con mas reclamos en los meses recientes
CREATE OR REPLACE FUNCTION pg_temp.fecha_reciente() RETURNS timestamp AS $$
  SELECT (date '2026-11-23' - (power(random(), 1.7) * 360)::int)
         + make_interval(hours => 7 + (random() * 14)::int, mins => (random() * 59)::int)
$$ LANGUAGE sql VOLATILE;

-- ---------- 1. Reclamos de prueba repartidos en el tiempo ----------
UPDATE testimonios SET fecha_creacion = pg_temp.fecha_reciente()
WHERE fecha_creacion::date = date '2026-11-05';
UPDATE testimonios SET fecha_actualizacion = fecha_creacion WHERE fecha_actualizacion IS NOT NULL;

-- ---------- 2. Reclamos nuevos ----------
CREATE TEMP TABLE base AS            -- reclamos de prueba existentes (dan zona y coordenadas)
  SELECT id_zona, latitud, longitud FROM testimonios WHERE id_testimonio BETWEEN 31 AND 2428;
CREATE TEMP TABLE cat AS
  SELECT id_categoria, nombre_categoria, row_number() OVER (ORDER BY id_categoria) n
  FROM categorias WHERE nombre_categoria IN ('Baches', 'Basura', 'Seguridad', 'Alumbrado', 'Agua y desague');
CREATE TEMP TABLE ciud AS
  SELECT u.id_usuario, row_number() OVER (ORDER BY u.id_usuario) n
  FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE r.nombre_rol = 'CIUDADANO';
CREATE TEMP TABLE equipo AS
  SELECT u.id_usuario, u.nombres, row_number() OVER (ORDER BY u.id_usuario) n
  FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE r.nombre_rol IN ('MUNICIPALIDAD', 'ADMINISTRADOR');

-- Listas como arreglos para elegir al azar en cada fila
CREATE TEMP TABLE arr AS SELECT
  (SELECT array_agg(id_categoria ORDER BY n) FROM cat)  AS ca,
  (SELECT array_agg(id_usuario ORDER BY n) FROM ciud)   AS cu,
  (SELECT array_agg(id_usuario ORDER BY n) FROM equipo) AS eq,
  (SELECT count(*) FROM base)::int                      AS nb;
ALTER TABLE base ADD COLUMN k serial;

CREATE TEMP TABLE nuevos AS
SELECT b.id_zona,
       b.latitud  + ((random() - .5) * .004)::numeric(9,6) AS latitud,
       b.longitud + ((random() - .5) * .004)::numeric(9,6) AS longitud,
       a.ca[1 + floor(power(random(), 1.3) * array_length(a.ca, 1))::int] AS id_categoria,
       a.cu[1 + floor(random() * array_length(a.cu, 1))::int] AS id_usuario,
       pg_temp.fecha_reciente() AS fecha,
       (ARRAY['Av. Principal','Jr. Lima','Av. Grau','Jr. Bolognesi','Av. Túpac Amaru','Jr. Junín','Av. Arequipa',
              'Jr. Ayacucho','Av. Los Incas','Calle Real','Av. Bolívar','Jr. San Martín','Av. Sucre'])[1 + floor(random() * 13)::int] AS via,
       random() AS r
FROM (SELECT g, 1 + floor(random() * (SELECT nb FROM arr))::int AS k FROM generate_series(1, 1500) g) x
JOIN base b ON b.k = x.k
CROSS JOIN arr a;

INSERT INTO testimonios (id_usuario, id_categoria, id_zona, descripcion_texto, foto_url, direccion_texto_extraida,
                         latitud, longitud, estado, fecha_creacion, fecha_actualizacion)
SELECT n.id_usuario, n.id_categoria, n.id_zona,
       CASE c.nombre_categoria
         WHEN 'Baches'    THEN (ARRAY['Bache profundo en la ','Pista llena de huecos en la ','Vereda rota en la ','Hundimiento de pista en la '])[1 + floor(random() * 4)::int]
         WHEN 'Basura'    THEN (ARRAY['Basura acumulada en la esquina de la ','El camión recolector no pasa por la ','Desmonte abandonado en la '])[1 + floor(random() * 3)::int]
         WHEN 'Seguridad' THEN (ARRAY['Robos frecuentes en el paradero de la ','Zona oscura y peligrosa en la ','Asaltos a la salida del colegio en la '])[1 + floor(random() * 3)::int]
         WHEN 'Alumbrado' THEN (ARRAY['Postes apagados en toda la cuadra de la ','Luminaria parpadeando en la ','El parque de la '])[1 + floor(random() * 3)::int]
         ELSE                  (ARRAY['Aniego en la ','Fuga de agua potable en la ','Buzón de desagüe colapsado en la '])[1 + floor(random() * 3)::int]
       END || n.via || ', ' || z.nombre_zona || '.',
       '', n.via || ' ' || (100 * (1 + floor(random() * 30)::int)),
       n.latitud, n.longitud,
       -- los reclamos antiguos tienen mas probabilidad de estar resueltos
       CASE WHEN n.r < .08 THEN 'RECHAZADO'
            WHEN n.r < .08 + .55 * (date '2026-11-23' - n.fecha::date) / 360.0 + .12 THEN 'RESUELTO'
            WHEN n.r < .85 THEN 'EN_PROCESO'
            ELSE 'PENDIENTE' END,
       n.fecha, n.fecha
FROM nuevos n JOIN cat c ON c.id_categoria = n.id_categoria JOIN zonas z ON z.id_zona = n.id_zona;

-- ---------- 3. Moderaciones de los reclamos nuevos ----------
INSERT INTO moderaciones (id_testimonio, id_usuario_admin, accion, motivo, costo, fecha_accion)
SELECT t.id_testimonio,
       a.eq[1 + floor(random() * array_length(a.eq, 1))::int],
       t.estado,
       CASE t.estado
         WHEN 'EN_PROCESO' THEN (ARRAY['Cuadrilla programada para esta semana','Se coordinó con el área de obras','Inspección técnica realizada'])[1 + floor(random() * 3)::int]
         WHEN 'RESUELTO'   THEN (ARRAY['Trabajo terminado y verificado','Se reparó la zona reportada','Se atendió con el serenazgo'])[1 + floor(random() * 3)::int]
         ELSE                   (ARRAY['Reporte duplicado','No corresponde a la jurisdicción','No se encontró el problema en la visita'])[1 + floor(random() * 3)::int]
       END,
       CASE WHEN t.estado = 'RECHAZADO' THEN 0
            ELSE (ARRAY[150,300,450,800,1200,1800,2500,4000])[1 + floor(random() * 8)::int] END,
       LEAST(t.fecha_creacion + make_interval(days => 1 + floor(random() * 20)::int, hours => floor(random() * 8)::int),
             timestamp '2026-11-24 09:00')
FROM testimonios t CROSS JOIN arr a
WHERE t.id_testimonio > 2430 AND t.estado IN ('EN_PROCESO', 'RESUELTO', 'RECHAZADO');

-- Moderaciones antiguas: que ocurran despues de su reclamo (ya que las fechas se movieron)
UPDATE moderaciones m
SET fecha_accion = LEAST(t.fecha_creacion + make_interval(days => 1 + floor(random() * 20)::int, hours => floor(random() * 8)::int),
                         timestamp '2026-11-24 09:00')
FROM testimonios t
WHERE t.id_testimonio = m.id_testimonio AND m.fecha_accion < t.fecha_creacion;

-- ---------- 4a. Comentarios ----------
INSERT INTO comentarios (id_testimonio, id_usuario, texto, fecha_creacion)
SELECT t.id_testimonio,
       a.cu[1 + floor(random() * array_length(a.cu, 1))::int],
       (ARRAY['A mí también me afecta, paso por ahí todos los días.','Sigue igual, nadie ha venido.',
              'Ya van varias semanas con este problema.','Gracias por reportarlo, es un peligro para los niños.',
              'Confirmo, hoy en la mañana seguía así.','Ojalá lo atiendan pronto.',
              'Los vecinos ya reclamamos en la municipalidad.','De noche es peor.'])[1 + floor(random() * 8)::int],
       t.fecha_creacion + make_interval(hours => 2 + floor(random() * 200)::int)
FROM testimonios t CROSS JOIN arr a CROSS JOIN generate_series(1, 2) k
WHERE random() < .35;

-- Respuestas de la municipalidad en reclamos que estan en atencion o resueltos
INSERT INTO comentarios (id_testimonio, id_usuario, texto, fecha_creacion)
SELECT m.id_testimonio,
       m.id_usuario_admin,
       (ARRAY['Hola, ya derivamos tu reporte al área correspondiente.','La cuadrilla pasará esta semana.',
              'Gracias por avisar, ya estamos trabajando en la zona.'])[1 + floor(random() * 3)::int],
       m.fecha_accion + interval '1 hour'
FROM moderaciones m
WHERE m.accion IN ('EN_PROCESO', 'RESUELTO') AND random() < .25;

UPDATE comentarios SET fecha_creacion = timestamp '2026-11-24 09:00' WHERE fecha_creacion > timestamp '2026-11-24 09:00';

-- ---------- 4b. Apoyos (un ciudadano apoya una sola vez cada reclamo) ----------
INSERT INTO apoyos (id_testimonio, id_usuario, fecha_apoyo)
SELECT t.id_testimonio, c.id_usuario,
       LEAST(t.fecha_creacion + make_interval(hours => 1 + floor(random() * 300)::int), timestamp '2026-11-24 09:00')
FROM testimonios t CROSS JOIN ciud c
WHERE c.id_usuario <> t.id_usuario AND random() < .06
ON CONFLICT DO NOTHING;

-- ---------- 4c. Notificaciones al autor (igual que el backend: ESTADO y COMENTARIO) ----------
INSERT INTO notificaciones (id_usuario, id_testimonio, tipo, mensaje, leida, fecha_creacion)
SELECT t.id_usuario, t.id_testimonio, 'ESTADO',
       CASE m.accion
         WHEN 'EN_PROCESO' THEN 'La municipalidad está atendiendo tu reporte ' || format('RYA-%s', lpad(t.id_testimonio::text, 4, '0')) || '.'
         WHEN 'RESUELTO'   THEN 'Tu reporte ' || format('RYA-%s', lpad(t.id_testimonio::text, 4, '0')) || ' fue resuelto.'
         ELSE                   'Tu reporte ' || format('RYA-%s', lpad(t.id_testimonio::text, 4, '0')) || ' fue descartado.'
       END,
       m.fecha_accion < timestamp '2026-11-15', m.fecha_accion
FROM moderaciones m JOIN testimonios t ON t.id_testimonio = m.id_testimonio
WHERE t.id_usuario <> m.id_usuario_admin;

INSERT INTO notificaciones (id_usuario, id_testimonio, tipo, mensaje, leida, fecha_creacion)
SELECT t.id_usuario, t.id_testimonio, 'COMENTARIO',
       u.nombres || ' comentó tu reporte ' || format('RYA-%s', lpad(t.id_testimonio::text, 4, '0')) || '.',
       c.fecha_creacion < timestamp '2026-11-15', c.fecha_creacion
FROM comentarios c JOIN testimonios t ON t.id_testimonio = c.id_testimonio JOIN usuarios u ON u.id_usuario = c.id_usuario
WHERE c.id_usuario <> t.id_usuario;

COMMIT;

-- Resumen
SELECT (SELECT count(*) FROM testimonios) AS reclamos, (SELECT count(*) FROM moderaciones) AS moderaciones,
       (SELECT count(*) FROM comentarios) AS comentarios, (SELECT count(*) FROM apoyos) AS apoyos,
       (SELECT count(*) FROM notificaciones) AS notificaciones;
