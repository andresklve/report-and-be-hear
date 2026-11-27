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

**IA (opcional):** para que la clasificación de reclamos use Google Gemini, cree una clave en https://aistudio.google.com/api-keys y agréguela en `report-and-be-hear-api/local.properties`:
```properties
gemini.api.key=SU_CLAVE
```
Sin clave, la app funciona igual y clasifica con reglas por palabras clave.

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
Cuentas demo (usuario): `ana.torres` (ciudadana), `municipalidad` y `admin`. La contraseña está en `datos-prueba/inyectar_datos.py`.

## Despliegue

**Backend (AWS).** Se usa el `Dockerfile` de `report-and-be-hear-api/` y se definen estas variables de entorno
(`local.properties` no se sube, así que en el servidor todo va por variables):

| Variable | Qué es |
|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | PostgreSQL en AWS, por ejemplo `jdbc:postgresql://<host>:5432/BDReportAndBeHeard` |
| `JWT_SECRET` | Clave para firmar el JWT, de 64 caracteres o más y distinta a la de desarrollo |
| `GEMINI_API_KEY` | Clave de Google AI Studio para clasificar reclamos con IA |
| `FRONT_URL` | URL del front en Netlify (`https://<sitio>.netlify.app`). Se permite en CORS |
| `CORS_ORIGINS` | Opcional: otros orígenes permitidos, separados por coma |

El backend tiene que responder por **https**: el front en Netlify usa https y el navegador bloquea las llamadas a una API por http.

**Frontend (Netlify).** El repo tiene `netlify.toml`, así que Netlify toma solo la carpeta, el comando de build y las rutas.
Solo hay que definir en *Site configuration → Environment variables*:

| Variable | Qué es |
|---|---|
| `API_URL` | URL del backend en AWS, con https (por ejemplo `https://api.tudominio.com`) |

Sin `API_URL` el build en Netlify falla a propósito, para no publicar un front que llama a `localhost`.
