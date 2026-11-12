-- Migracion: el usuario ya no usa correo, usa username.
-- Si la base es de antes (columna "correo"), se renombra a "username" y cada correo
-- pasa a su parte antes de la @ (ana.torres@demo.pe -> ana.torres). En una base nueva
-- o ya migrada no hace nada. Se ejecuta antes de que Hibernate actualice las tablas.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'correo')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'username') THEN
    ALTER TABLE usuarios RENAME COLUMN correo TO username;
    UPDATE usuarios u
       SET username = CASE WHEN s.repetidos > 1 THEN s.base || u.id_usuario ELSE s.base END
      FROM (SELECT id_usuario,
                   lower(split_part(username, '@', 1)) AS base,
                   count(*) OVER (PARTITION BY lower(split_part(username, '@', 1))) AS repetidos
              FROM usuarios) s
     WHERE s.id_usuario = u.id_usuario;
  END IF;
END $$;
^^^END^^^
