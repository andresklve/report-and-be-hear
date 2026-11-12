"""
Inyeccion de datos de prueba para Report And Be Heard.

Inserta los datos usando la API REST del backend (los mismos POST que usa el frontend),
asi que NO modifica el codigo del backend. Si una tabla ya tiene registros, no la toca.

Uso:  python3 datos-prueba/inyectar_datos.py            (backend en http://localhost:8084)
      python3 datos-prueba/inyectar_datos.py http://otro-host:8084
"""
import json
import sys
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8084").rstrip("/")


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            txt = r.read().decode()
            return json.loads(txt) if txt else None
    except urllib.error.HTTPError as e:
        print(f"  ! {method} {path} -> {e.code}: {e.read().decode()[:200]}")
        return None


def sembrar(nombre, path, filas, id_campo):
    existentes = api("GET", path) or []
    if existentes:
        print(f"- {nombre}: ya tiene {len(existentes)} registro(s), se usan los existentes")
        return existentes
    creados = [x for x in (api("POST", path, f) for f in filas) if x]
    print(f"+ {nombre}: {len(creados)} insertado(s)")
    return creados


try:
    api("GET", "/apis/roles")
except urllib.error.URLError:
    sys.exit(f"No se pudo conectar con {BASE}. ¿Esta corriendo el backend?")

roles = sembrar("Roles", "/apis/roles", [
    {"nombreRol": "ADMINISTRADOR", "descripcionRol": "Gestiona toda la plataforma"},
    {"nombreRol": "MUNICIPALIDAD", "descripcionRol": "Atiende y modera los testimonios"},
    {"nombreRol": "CIUDADANO", "descripcionRol": "Reporta problemas de su ciudad"},
], "idRol")

zonas = sembrar("Zonas", "/apis/zonas", [
    {"nombreZona": "Miraflores", "provinciaZona": "Lima", "departamentoZona": "Lima", "latitudZona": -12.1211, "longitudZona": -77.0297},
    {"nombreZona": "San Isidro", "provinciaZona": "Lima", "departamentoZona": "Lima", "latitudZona": -12.0977, "longitudZona": -77.0365},
    {"nombreZona": "Surco", "provinciaZona": "Lima", "departamentoZona": "Lima", "latitudZona": -12.1450, "longitudZona": -76.9915},
    {"nombreZona": "San Juan de Lurigancho", "provinciaZona": "Lima", "departamentoZona": "Lima", "latitudZona": -11.9827, "longitudZona": -77.0060},
    {"nombreZona": "Callao", "provinciaZona": "Callao", "departamentoZona": "Callao", "latitudZona": -12.0566, "longitudZona": -77.1181},
    {"nombreZona": "Cercado de Arequipa", "provinciaZona": "Arequipa", "departamentoZona": "Arequipa", "latitudZona": -16.3989, "longitudZona": -71.5350},
], "idZona")

categorias = sembrar("Categorias", "/apis/categorias", [
    {"nombreCategoria": "Baches", "descripcionCategoria": "Huecos en pistas y veredas", "activo": True},
    {"nombreCategoria": "Alumbrado", "descripcionCategoria": "Postes o luminarias apagadas", "activo": True},
    {"nombreCategoria": "Basura", "descripcionCategoria": "Acumulacion de residuos", "activo": True},
    {"nombreCategoria": "Seguridad", "descripcionCategoria": "Zonas inseguras o robos", "activo": True},
    {"nombreCategoria": "Agua y desague", "descripcionCategoria": "Fugas o aniegos", "activo": True},
], "idCategoria")

usuarios = sembrar("Usuarios", "/apis/usuarios", [
    {"nombres": "Ana", "apellidos": "Torres", "username": "ana.torres", "passwordHash": "Demo1234"},
    {"nombres": "Luis", "apellidos": "Quispe", "username": "luis.quispe", "passwordHash": "Demo1234"},
    {"nombres": "Rosa", "apellidos": "Mendoza", "username": "rosa.mendoza", "passwordHash": "Demo1234"},
], "idUsuario")

# Cuentas del equipo (el registro publico siempre crea CIUDADANO; luego se cambia el rol con PUT)
ROL = {r["nombreRol"]: r["idRol"] for r in (api("GET", "/apis/roles") or [])}
todos = api("GET", "/apis/usuarios") or []
for nombres, apellidos, username, rol in [
    ("Carla", "Ramos", "municipalidad", "MUNICIPALIDAD"),
    ("Admin", "General", "admin", "ADMINISTRADOR"),
]:
    u = next((x for x in todos if x["username"] == username), None)
    if u is None:
        u = api("POST", "/apis/usuarios", {"nombres": nombres, "apellidos": apellidos,
                                            "username": username, "passwordHash": "Demo1234"})
    if u and rol in ROL and u.get("idRol") != ROL[rol]:
        if api("PUT", "/apis/usuarios", {**u, "idRol": ROL[rol], "passwordHash": "Demo1234"}):
            print(f"+ Cuenta {rol}: {username}")

if not (zonas and categorias and usuarios):
    sys.exit("Faltan zonas, categorias o usuarios; no se insertan testimonios.")

Z = {z["nombreZona"]: z for z in zonas}
C = {c["nombreCategoria"]: c["idCategoria"] for c in categorias}
U = [u["idUsuario"] for u in usuarios]

# (zona, categoria, descripcion, estado) -> mas testimonios en algunas zonas para que se note el mapa de calor
datos = [
    ("Miraflores", "Baches", "Bache profundo en la Av. Larco cerca al parque Kennedy", "PENDIENTE"),
    ("Miraflores", "Alumbrado", "Tres postes apagados en la calle Berlin", "EN_PROCESO"),
    ("Miraflores", "Basura", "Basura acumulada en la esquina de Benavides con Larco", "RESUELTO"),
    ("Miraflores", "Baches", "Vereda rota frente al mercado de Surquillo", "PENDIENTE"),
    ("Miraflores", "Seguridad", "Robos frecuentes en el malecon de noche", "PENDIENTE"),
    ("San Juan de Lurigancho", "Agua y desague", "Aniego en la Av. Proceres de la Independencia", "EN_PROCESO"),
    ("San Juan de Lurigancho", "Basura", "Botadero informal junto al colegio", "PENDIENTE"),
    ("San Juan de Lurigancho", "Seguridad", "Paradero sin iluminacion y peligroso", "PENDIENTE"),
    ("San Juan de Lurigancho", "Baches", "Pista destruida en la Av. Wiesse", "RECHAZADO"),
    ("Surco", "Alumbrado", "Parque sin luz desde hace una semana", "RESUELTO"),
    ("Surco", "Baches", "Huecos en la Av. Caminos del Inca", "PENDIENTE"),
    ("San Isidro", "Basura", "Contenedores llenos en la calle Las Begonias", "RESUELTO"),
    ("Callao", "Agua y desague", "Fuga de agua en la Av. Saenz Pena", "PENDIENTE"),
    ("Callao", "Seguridad", "Asaltos en el puente del Callao", "EN_PROCESO"),
    ("Cercado de Arequipa", "Baches", "Bache grande en la calle Mercaderes", "PENDIENTE"),
]
testimonios = sembrar("Testimonios", "/apis/testimonios", [
    {"idUsuario": U[i % len(U)], "idCategoria": C[cat], "idZona": Z[zona]["idZona"],
     "descripcionTexto": desc, "fotoUrl": "", "direccionTextoExtraida": "",
     "latitud": round(Z[zona]["latitudZona"] + (i % 3 - 1) * 0.002, 6),
     "longitud": round(Z[zona]["longitudZona"] + (i % 2) * 0.002, 6),
     "estado": est}
    for i, (zona, cat, desc, est) in enumerate(datos) if zona in Z and cat in C
], "idTestimonio")

if testimonios:
    sembrar("Moderaciones", "/apis/moderaciones", [
        {"idTestimonio": t["idTestimonio"], "idUsuarioAdmin": U[0], "accion": acc, "motivo": mot, "costo": costo}
        for t, (acc, mot, costo) in zip(testimonios[:5], [
            ("APROBADO", "Se envio cuadrilla de mantenimiento", 1500),
            ("EN_PROCESO", "Cambio de luminarias programado", 800),
            ("RESUELTO", "Se recogieron los residuos", 300),
            ("APROBADO", "Reparacion de vereda", 2200),
            ("RECHAZADO", "Reporte duplicado", 0),
        ])
    ], "idModeracion")

print("\nListo. Abre http://localhost:4200 para ver los datos.")
