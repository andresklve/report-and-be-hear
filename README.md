# ReclamaYA

Plataforma para reportar problemas de la ciudad y ver los reclamos en un mapa del Perú.

| Carpeta | Contenido |
|---|---|
| [`report-and-be-hear-api/`](report-and-be-hear-api) | Backend REST – Java 21, Spring Boot, PostgreSQL (puerto 8084) |
| [`report-and-be-heard-front/`](report-and-be-heard-front) | Frontend – Angular 21 + Angular Material + Leaflet (puerto 4200) |

## Requisitos
- Java 21
- Node.js 22+
- PostgreSQL con una base llamada `BDReportAndBeHeard` (las tablas se crean solas al arrancar)

## Ejecutar

**1. Datos de su PostgreSQL** (solo la primera vez)

Por defecto el backend usa `localhost:5432`, el usuario `postgres` y la contraseña `postgres`. Si los suyos son otros:
```bash
cd report-and-be-hear-api
cp local.properties.example local.properties   # y edite usuario, contraseña y puerto
```
`local.properties` no se sube a git.

**2. Backend**
```bash
cd report-and-be-hear-api
./mvnw spring-boot:run          # en Windows: mvnw.cmd spring-boot:run
```

**3. Frontend** (en otra terminal)
```bash
cd report-and-be-heard-front
npm install
npm start                       # http://localhost:4200
```

**4. Datos de prueba** (opcional, con el backend encendido y la base vacía)
```bash
cd report-and-be-heard-front
python3 datos-prueba/inyectar_datos.py   # roles, catálogos y cuentas demo
python3 datos-prueba/inyectar_peru.py    # zonas en las 196 provincias, reclamos y moderaciones
```
Cuentas demo: `ana.torres@demo.pe` (ciudadana), `municipalidad@demo.pe` y `admin@demo.pe`. La contraseña está en `datos-prueba/inyectar_datos.py`.
