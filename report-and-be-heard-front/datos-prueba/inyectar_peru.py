"""
Inyeccion de datos a escala nacional para el mapa de calor.

- Crea zonas (distritos INEI) en las 196 provincias: todos los distritos de Lima Metropolitana,
  Callao y las ciudades grandes, y el distrito capital de cada una de las demas provincias.
- Crea ciudadanos de prueba y ~1000 testimonios con coordenadas DENTRO de cada distrito,
  con mas carga en ciudades grandes (para que el mapa muestre verde / naranja / rojo).
- Registra moderaciones (con costo) para los testimonios en atencion, resueltos o descartados.

Todo se inserta por la API REST del backend (no toca el codigo del backend).
Correr DESPUES de inyectar_datos.py.   Uso: python3 -I datos-prueba/inyectar_peru.py
"""
import json
import os
import random
import sys
import unicodedata
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8084").rstrip("/")
GEO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "geo", "distritos")
rnd = random.Random(2026)


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            txt = r.read().decode()
            return json.loads(txt) if txt else None
    except urllib.error.HTTPError as e:
        print(f"  ! {method} {path} -> {e.code}: {e.read().decode()[:160]}")
        return None


def norm(s):
    s = unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower()
    return " ".join(s.replace("-", " ").split())


def en_poligono(x, y, geom):
    for poly in geom["coordinates"]:
        dentro = False
        ring = poly[0]
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, yi = ring[i]
            xj, yj = ring[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                dentro = not dentro
            j = i
        if dentro:
            return True
    return False


def punto_dentro(f):
    x0, y0, x1, y1 = f["properties"]["bbox"]
    for _ in range(200):
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        if en_poligono(x, y, f["geometry"]):
            return round(y, 6), round(x, 6)
    lat, lng = f["properties"]["centro"]
    return lat, lng


# ---------- 0. Comprobaciones ----------
try:
    existentes = api("GET", "/apis/testimonios") or []
except urllib.error.URLError:
    sys.exit(f"No se pudo conectar con {BASE}")
if len(existentes) > 300:
    sys.exit(f"Ya hay {len(existentes)} testimonios; no se vuelve a inyectar.")

# ---------- 1. Distritos elegidos ----------
CIUDADES = {"1501": 1.0, "0701": .7, "0401": .55, "1301": .5, "1401": .45, "2001": .45, "0801": .4, "1201": .35,
            "0201": .3, "1601": .3, "2101": .25, "1101": .25}  # Lima, Callao, Arequipa, Trujillo, Chiclayo, Piura, Cusco, Huancayo, Chimbote, Maynas, Puno, Ica
elegidos = []  # (feature, peso)
for archivo in sorted(os.listdir(GEO)):
    pid = archivo[:4]
    with open(os.path.join(GEO, archivo)) as fh:
        feats = json.load(fh)["features"]
    if pid in CIUDADES:
        for f in feats:
            elegidos.append((f, CIUDADES[pid] * rnd.uniform(.25, 1.0)))
    else:
        capital = min(feats, key=lambda f: f["properties"]["id"])
        # algunas provincias casi sin reportes para que se vea el verde
        elegidos.append((capital, rnd.choice([0, .02, .04, .06, .08, .12, .18])))
print(f"{len(elegidos)} distritos elegidos en {len(set(f['properties']['prov'] for f, _ in elegidos))} provincias")

# ---------- 2. Zonas ----------
zonas = api("GET", "/apis/zonas") or []
clave = {(norm(z["nombreZona"]), norm(z["provinciaZona"])): z for z in zonas}
nuevas = []
for f, _ in elegidos:
    p = f["properties"]
    if (norm(p["nombre"]), norm(p["provNombre"])) not in clave:
        lat, lng = p["centro"]
        nuevas.append({"nombreZona": p["nombre"], "provinciaZona": p["provNombre"], "departamentoZona": p["depNombre"],
                       "latitudZona": lat, "longitudZona": lng})
with ThreadPoolExecutor(8) as ex:
    for z in ex.map(lambda b: api("POST", "/apis/zonas", b), nuevas):
        if z:
            clave[(norm(z["nombreZona"]), norm(z["provinciaZona"]))] = z
print(f"+ Zonas: {len(nuevas)} nuevas (total {len(clave)})")

# ---------- 3. Ciudadanos ----------
NOMBRES = [("Jorge", "Huamán Quispe"), ("María", "Flores Condori"), ("Lucía", "Ramírez Torres"), ("Carlos", "Mamani Ccahuana"),
           ("Rosa", "Chávez Paredes"), ("Miguel", "Rojas Vargas"), ("Elena", "Gutiérrez Salazar"), ("Pedro", "Castillo Huanca"),
           ("Carmen", "Vásquez Ríos"), ("José", "Mendoza Aguilar"), ("Ana", "Sánchez Poma"), ("Luis", "Díaz Apaza")]
usuarios = api("GET", "/apis/usuarios") or []
correos = {u["correo"] for u in usuarios}
for n, a in NOMBRES:
    correo = norm(n + "." + a.split()[0]).replace(" ", "") + "@demo.pe"
    if correo not in correos:
        u = api("POST", "/apis/usuarios", {"nombres": n, "apellidos": a, "correo": correo, "passwordHash": "Demo1234"})
        if u:
            usuarios.append(u)
roles = {r["idRol"]: r["nombreRol"] for r in (api("GET", "/apis/roles") or [])}
ciudadanos = [u["idUsuario"] for u in usuarios if roles.get(u["idRol"]) == "CIUDADANO"]
equipo = [u["idUsuario"] for u in usuarios if roles.get(u["idRol"]) in ("MUNICIPALIDAD", "ADMINISTRADOR")] or ciudadanos[:1]
print(f"+ Ciudadanos disponibles: {len(ciudadanos)}")

# ---------- 4. Testimonios ----------
cats = {c["nombreCategoria"]: c["idCategoria"] for c in (api("GET", "/apis/categorias") or [])}
TEXTOS = {
    "Baches": ["Bache profundo en la {via}, ya hubo accidentes de motos", "Pista llena de huecos en la {via}",
               "Vereda rota frente al mercado de la {via}", "Hundimiento de pista en la {via} después de las lluvias"],
    "Alumbrado": ["Postes apagados en toda la cuadra de la {via}", "El parque de la {via} está a oscuras hace semanas",
                  "Luminaria parpadeando en la {via}, de noche no se ve nada"],
    "Basura": ["Basura acumulada en la esquina de la {via}", "El camión recolector no pasa por la {via} hace días",
               "Botadero informal junto al colegio de la {via}", "Desmonte abandonado en la {via}"],
    "Seguridad": ["Robos frecuentes en el paradero de la {via}", "Zona oscura y peligrosa en la {via}",
                  "Asaltos a la salida del colegio en la {via}"],
    "Agua y desague": ["Aniego en la {via}, el agua llega a las casas", "Fuga de agua potable en la {via}",
                       "Buzón de desagüe colapsado en la {via}"],
}
VIAS = ["Av. Principal", "Jr. Lima", "Av. Grau", "Jr. Bolognesi", "Av. Túpac Amaru", "Jr. Junín", "Av. Arequipa",
        "Jr. Ayacucho", "Av. Los Incas", "Calle Real", "Av. Bolívar", "Jr. San Martín", "Av. Sucre", "Jr. Huáscar"]
ESTADOS = ["PENDIENTE"] * 45 + ["EN_PROCESO"] * 25 + ["RESUELTO"] * 22 + ["RECHAZADO"] * 8
peso_cat = [c for c in TEXTOS if c in cats for _ in range({"Baches": 4, "Basura": 3, "Seguridad": 3}.get(c, 2))]

cuerpos = []
for f, peso in elegidos:
    p = f["properties"]
    z = clave.get((norm(p["nombre"]), norm(p["provNombre"])))
    if not z:
        continue
    n = int(round(peso * 26 + (rnd.random() < peso * 3)))
    for _ in range(n):
        cat = rnd.choice(peso_cat)
        lat, lng = punto_dentro(f)
        via = rnd.choice(VIAS)
        cuerpos.append({"idUsuario": rnd.choice(ciudadanos), "idCategoria": cats[cat], "idZona": z["idZona"],
                        "descripcionTexto": rnd.choice(TEXTOS[cat]).format(via=via) + f", {p['nombre']}.",
                        "fotoUrl": "", "direccionTextoExtraida": f"{via} {rnd.randint(1, 30) * 100}",
                        "latitud": lat, "longitud": lng, "estado": rnd.choice(ESTADOS)})
with ThreadPoolExecutor(8) as ex:
    creados = [t for t in ex.map(lambda b: api("POST", "/apis/testimonios", b), cuerpos) if t]
print(f"+ Testimonios: {len(creados)}")

# ---------- 5. Moderaciones ----------
NOTAS = {"EN_PROCESO": ["Cuadrilla programada para esta semana", "Se coordinó con el área de obras", "Inspección técnica realizada"],
         "RESUELTO": ["Trabajo terminado y verificado", "Se reparó la zona reportada", "Se atendió con el serenazgo"],
         "RECHAZADO": ["Reporte duplicado", "No corresponde a la jurisdicción", "No se encontró el problema en la visita"]}
mods = [{"idTestimonio": t["idTestimonio"], "idUsuarioAdmin": rnd.choice(equipo), "accion": t["estado"],
         "motivo": rnd.choice(NOTAS[t["estado"]]),
         "costo": 0 if t["estado"] == "RECHAZADO" else rnd.choice([150, 300, 450, 800, 1200, 1800, 2500, 4000])}
        for t in creados if t["estado"] in NOTAS]
with ThreadPoolExecutor(8) as ex:
    ok = sum(1 for m in ex.map(lambda b: api("POST", "/apis/moderaciones", b), mods) if m)
print(f"+ Moderaciones: {ok}")
print("\nListo. Recarga http://localhost:4200")
