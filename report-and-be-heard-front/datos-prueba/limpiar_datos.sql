-- Limpia datos de pruebas antiguas que ensucian los graficos.
--   psql -h localhost -U postgres -d BDReportAndBeHeard -f datos-prueba/limpiar_datos.sql
--
-- 1. Categorias repetidas en mayusculas (BASURA, AGUA_CONTAMINADA, QUEMA_RESIDUOS, OTROS, RUIDO_MOLESTO):
--    sus reclamos pasan a la categoria equivalente y luego se borran.
-- 2. Estados que la app no usa: PROCESADO -> RESUELTO, PUBLICADO -> EN_PROCESO
--    (y sus moderaciones: ATENDIDO -> RESUELTO, APROBADO -> EN_PROCESO).

BEGIN;

-- ---------- 1. Categorias ----------
UPDATE testimonios t SET id_categoria = (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Basura')
WHERE t.id_categoria IN (SELECT id_categoria FROM categorias WHERE nombre_categoria IN ('BASURA', 'QUEMA_RESIDUOS'));

UPDATE testimonios t SET id_categoria = (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Agua y desague')
WHERE t.id_categoria IN (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'AGUA_CONTAMINADA');

-- OTROS: segun lo que dice cada reclamo
UPDATE testimonios t SET id_categoria = (SELECT id_categoria FROM categorias WHERE nombre_categoria =
         CASE WHEN t.descripcion_texto ILIKE ANY (ARRAY['%desag%', '%aguas servidas%']) THEN 'Agua y desague'
              WHEN t.descripcion_texto ILIKE ANY (ARRAY['%desmonte%', '%basura%'])        THEN 'Basura'
              ELSE 'Seguridad' END)
WHERE t.id_categoria IN (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'OTROS');

DELETE FROM categorias
WHERE nombre_categoria IN ('BASURA', 'AGUA_CONTAMINADA', 'QUEMA_RESIDUOS', 'OTROS', 'RUIDO_MOLESTO');

-- ---------- 2. Estados ----------
UPDATE testimonios SET estado = 'RESUELTO'   WHERE estado = 'PROCESADO';
UPDATE testimonios SET estado = 'EN_PROCESO' WHERE estado = 'PUBLICADO';
UPDATE moderaciones SET accion = 'RESUELTO'   WHERE accion = 'ATENDIDO';
UPDATE moderaciones SET accion = 'EN_PROCESO' WHERE accion = 'APROBADO';

COMMIT;

SELECT c.nombre_categoria, count(t.id_testimonio) AS reclamos
FROM categorias c LEFT JOIN testimonios t ON t.id_categoria = c.id_categoria
GROUP BY c.nombre_categoria ORDER BY 2 DESC;
SELECT estado, count(*) FROM testimonios GROUP BY estado ORDER BY 2 DESC;
