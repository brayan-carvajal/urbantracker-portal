# urbantracker-portal
# UrbanTracker 🚍

**UrbanTracker** es una plataforma de monitoreo de transporte público en tiempo real. Este README se enfoca en las dos interfaces web principales del sistema:

- `Web-Client`: aplicación para usuarios finales del transporte.
- `Web-Admin`: panel administrativo para gestión del sistema.

> Asegúrate de tener **Node.js** instalado para ejecutar ambos proyectos localmente.

---

## 🌐 Web-Client

### 📋 Propósito

La carpeta **`Web-Client`** contiene la aplicación web orientada a usuarios finales. Permite visualizar rutas disponibles y la ubicación de buses en tiempo real desde el navegador.

### 🛠️ Tecnologías

![React](https://img.shields.io/badge/react-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

> Framework Next.js con React y TypeScript. Estilos construidos con Tailwind CSS.

### ▶️ Instalación y ejecución

```bash
# 1. Navega al directorio
cd Web-Client

# 2. Instala las dependencias
npm install

# 3. Ejecuta en modo desarrollo
npm run dev
```

---

## 🛠️ Web-Admin

### 📋 Propósito

La carpeta **`Web-Admin`** contiene la aplicación administrativa. Ofrece un panel para gestionar rutas, conductores y vehículos del sistema, con vista en tiempo real del servicio.

### 🛠️ Tecnologías

![React](https://img.shields.io/badge/react-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-6E56CF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDY0IDY0IiB3aWR0aD0iMTI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00MyA2NEgxMFYxMGgzM1Y2NHptNS0zNWgtM3YzM2gtM1YzMmgzdjNoM3YzM2gzdjNoM3YzM2gzdjNoM3YzM2gzdjNoM3YzM2gzdjNoM3YzM2gzdjNoM3YzM2gzdjNoM3YzM2gzdjNoM3YzM2gzdjNoM3YzM2g3eiIvPjwvc3ZnPg==)

> Framework Next.js con React y TypeScript. UI mejorada con Tailwind CSS y librerías como Radix UI para componentes.

### ▶️ Instalación y ejecución

```bash
# 1. Navega al directorio
cd Web-Admin

# 2. Instala las dependencias
npm install

# 3. Ejecuta en modo desarrollo
npm run dev
```


---

📌 *Ambas aplicaciones se comunican con el backend de UrbanTracker. Para funcionalidad completa, asegúrate de tener la API activa.*
