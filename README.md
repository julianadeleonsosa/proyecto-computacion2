# ⚽ Penca del Mundial 2026

Sistema web completo para gestionar una penca del Mundial FIFA 2026.
Permite registrar participantes, ingresar pronósticos, calcular puntajes automáticamente y mostrar una clasificación actualizada.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Base de datos | MySQL 8+ |
| Backend | Python 3.10+ · Flask |
| Frontend | HTML5 · CSS3 · JavaScript (Vanilla) |
| Planilla | Excel (openpyxl) |

---

## Instalación rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/penca-mundial-2026.git
cd penca-mundial-2026
```

### 2. Configurar la base de datos

```bash
mysql -u root -p < database/01_create_db.sql
mysql -u root -p < database/02_insert_data.sql
```

### 3. Instalar dependencias Python

```bash
cd python
pip install -r requirements.txt
```

### 4. Configurar variables de entorno (opcional)

Crear archivo `python/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=penca_mundial2026
SECRET_KEY=clave-secreta-cambiar
```

### 5. Ejecutar el servidor

```bash
cd python
python app.py
```

Abrir en el navegador: **http://localhost:5000**

---

## Credenciales por defecto

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@penca.com | admin123 |

> **Importante:** Cambiar la contraseña del admin en producción.

---

## Estructura del proyecto

```
penca-mundial-2026/
├── database/
│   ├── 01_create_db.sql       # Crea tablas, vistas y procedimientos
│   └── 02_insert_data.sql     # Inserta los 48 equipos y 48 partidos
├── python/
│   ├── app.py                 # Servidor Flask (API REST)
│   ├── penca.py               # Lógica de negocio
│   ├── models.py              # Estructuras de datos
│   ├── db_connection.py       # Conexión MySQL
│   └── requirements.txt
├── web/
│   ├── index.html             # Página principal
│   ├── pronosticos.html       # Ingresar pronósticos
│   ├── clasificacion.html     # Tabla de posiciones
│   ├── admin.html             # Panel administrador
│   ├── css/estilos.css
│   └── js/
│       ├── api.js             # Comunicación con Flask
│       ├── app.js             # Lógica compartida
│       ├── pronosticos.js
│       ├── ranking.js
│       └── admin.js
├── excel/
│   └── penca_mundial_v1.xlsx  # Versión Excel standalone
└── README.md
```

---

## Sistema de puntuación

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto (ej: 2-1 y acertás 2-1) | **3 pts** |
| Diferencia correcta (ej: gana por 1 y acertás diferencia) | **2 pts** |
| Ganador / empate correcto | **1 pt** |
| Pronóstico incorrecto | **0 pts** |

---

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/login` | Iniciar sesión |
| POST | `/api/logout` | Cerrar sesión |
| POST | `/api/registro` | Registrar participante |
| GET | `/api/session` | Verificar sesión activa |
| GET | `/api/partidos` | Listar partidos |
| POST | `/api/pronostico` | Guardar pronóstico |
| GET | `/api/mis-pronosticos` | Pronósticos del usuario |
| POST | `/api/resultado` | Ingresar resultado (admin) |
| GET | `/api/ranking` | Clasificación actualizada |
| GET | `/api/estadisticas` | Estadísticas generales |

---

## Mundial 2026 — Datos

- **Sede:** Estados Unidos, Canadá y México
- **Formato:** 16 grupos de 3 equipos → 48 partidos de fase de grupos
- **Total partidos:** 104 (grupos + eliminatorias + final)
- **Equipos:** 48 selecciones clasificadas

---

## Contribución

1. Hacer fork del repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m "feat: descripción del cambio"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request hacia `develop`

---

## Licencia

MIT — Proyecto académico de libre uso educativo.
