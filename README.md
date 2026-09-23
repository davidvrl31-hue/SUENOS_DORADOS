# 🛏️ Sueños Dorados — Sistema de Gestión y E-commerce

Sistema completo para la tienda **Sueños Dorados**, compuesto por cuatro módulos integrados: API REST, tienda web, app móvil y aplicación de escritorio para administración.

---

## 📁 Estructura del monorepo

```
SUENOS_DORADOS/
├── suenos-dorados-api/        # Backend — NestJS + PostgreSQL
├── suenos-dorados-web/        # Tienda web — Next.js 15
├── suenos-dorados-movil/      # App móvil — Expo (React Native)
└── suenos-dorados-escritorio/ # Panel de administración — Python (Tkinter)
```

---

## 📄 Documentación del proyecto

Toda la documentación académica y técnica del proyecto (diseño, diagramas, manual de usuario, etc.) está disponible en:

📂 **[Carpeta del proyecto en Google Drive](https://drive.google.com/drive/folders/1TuxD7wbI1qmpe3KjWInjBVfGosTlAtui?usp=drive_link)**

---

## 🧱 Tecnologías

| Módulo        | Tecnología                              |
|---------------|-----------------------------------------|
| API           | NestJS · TypeORM · PostgreSQL · PDFKit  |
| Web           | Next.js 15 · Tailwind CSS · TypeScript  |
| Móvil         | Expo SDK 57 · React Native · NativeWind |
| Escritorio    | Python 3 · Tkinter · SQLAlchemy         |
| Pagos         | Bold (PSE, Nequi, Tarjeta, Bancolombia) |
| Tiempo real   | Socket.IO (stock en vivo)               |

---

## ⚙️ Configuración por módulo

Cada módulo tiene un archivo `.env.example` con las variables de entorno necesarias.  
**Copia el ejemplo y completa los valores antes de ejecutar.**

### 1. API — `suenos-dorados-api`

```bash
cd suenos-dorados-api
cp .env.example .env        # Completa con tus credenciales
npm install
npm run start:dev
```

Requiere PostgreSQL corriendo con la base de datos `suenos_dorados`.  
El script SQL inicial está en `reset_admin.sql` en la raíz del proyecto.

### 2. Web — `suenos-dorados-web`

```bash
cd suenos-dorados-web
cp .env.local.example .env.local   # Apunta a la URL de la API
npm install
npm run dev
```

### 3. Móvil — `suenos-dorados-movil`

```bash
cd suenos-dorados-movil
cp .env.example .env               # Usa la IP local de tu máquina, no localhost
npm install
npx expo start
```

> La IP en `EXPO_PUBLIC_API_URL` debe ser la IP real de tu máquina en la red local (ej: `http://192.168.1.X:3000`), ya que el dispositivo móvil no puede resolver `localhost`.

### 4. Escritorio — `suenos-dorados-escritorio`

```bash
cd suenos-dorados-escritorio
cp .env.example .env               # Completa credenciales de BD y URL de la API
pip install -r requirements.txt
python main.py
```

---

## 🗃️ Base de datos

- Motor: **PostgreSQL**
- Nombre: `suenos_dorados`
- El script `reset_admin.sql` en la raíz crea el usuario administrador inicial

---

## 🔐 Variables de entorno

Ningún archivo `.env` real está incluido en el repositorio.  
Consulta los archivos `.env.example` de cada módulo para saber qué configurar.

| Módulo        | Archivo de ejemplo              |
|---------------|---------------------------------|
| API           | `suenos-dorados-api/.env.example`           |
| Web           | `suenos-dorados-web/.env.local.example`     |
| Móvil         | `suenos-dorados-movil/.env.example`         |
| Escritorio    | `suenos-dorados-escritorio/.env.example`    |

---

## 👥 Autores

Proyecto de grado — Sueños Dorados © 2026
