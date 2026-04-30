yarn dev

# Collabs Frontend

![Next.js](https://img.shields.io/badge/next.js-000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-000?style=for-the-badge&logo=vercel&logoColor=white)
![API REST](https://img.shields.io/badge/api%20rest-4B8BBE?style=for-the-badge&logo=fastapi&logoColor=white)
![JWT](https://img.shields.io/badge/jwt-black?style=for-the-badge&logo=JSON%20web%20tokens)
---

## 📌 Introducción

**Collabs Frontend** es la interfaz web para la gestión colaborativa de espacios de trabajo, tareas y miembros. Su objetivo es ofrecer una experiencia de usuario fluida, segura y eficiente, integrándose con microservicios backend desacoplados.

## Problema que resuelve

- Centraliza la colaboración en equipos distribuidos.
- Facilita la gestión de tareas y miembros en tiempo real.
- Proporciona autenticación robusta y control de acceso.

---

## 🛠️ Tecnologías y Herramientas

- **Next.js** – Framework React y rutas modernas
- **TypeScript** – Tipado estricto para robustez y mantenibilidad
- **CSS Modules** – Estilos encapsulados y rendimiento óptimo
- **Context API** – Manejo de estado global (auth, workspace)
- **Vercel** – Despliegue serverless y CI/CD
- **API REST** – Consumo de endpoints protegidos y públicos
- **JWT** – Autenticación y persistencia de sesión

---

## Características Clave

**🔐 Seguridad y UX**
- Autenticación JWT y rutas protegidas
- Validaciones y feedback visual inmediato
- Manejo de errores centralizado

**🛣️ Orquestación de Experiencia**
- Navegación segmentada por dominio (auth, dashboard, workspace)
- Modales reutilizables para CRUD de entidades
- Estado global desacoplado y persistente

**📊 Comunicación Eficiente**
- Consumo de APIs backend desacopladas
- Sincronización de cambios en tiempo real vía API REST

---

## Arquitectura y Flujo

### Estructura del Proyecto

```
collabs-frontend/
├── src/
│   ├── app/                # Routing y layouts por dominio
│   ├── components/         # UI modular (modals, dropdowns, layout)
│   ├── context/            # Estado global (Auth, Workspace)
│   ├── services/           # Abstracción de llamadas HTTP
│   ├── types/              # Tipado estricto
│   └── ...                 # Otros módulos y utilidades
├── public/                 # Recursos estáticos
├── README.md
└── ...
```

### Flujo: Autenticación y Gestión de Tareas

```
1. Usuario accede y se autentica (login/register)
2. Selecciona o crea un workspace
3. Visualiza y administra tareas, miembros y perfil
4. Interactúa con modales para crear/editar/eliminar entidades
5. Cambios sincronizados vía API REST
6. Sesión persistente con JWT en storage
```

---

## 🏗️ Construcción y Resultados

- ✅ UI desacoplada, modular y escalable
- ✅ Experiencia de usuario optimizada para colaboración
- ✅ Autenticación segura y rutas protegidas
- ✅ Despliegue continuo en Vercel
- ✅ Integración robusta con backend vía API REST

---

## Aprendizajes Clave

**Técnico:**  
- Diseño por dominio aceleró la evolución independiente de componentes
- Modularización y tipado estricto previnieron errores y facilitaron refactorización
- Seguridad: JWT + validaciones; pendiente hashing adaptativo (bcrypt) en backend

**Colaborativo:**  
- Comunicación clara y asíncrona: reuniones focalizadas
- Priorización de entregas con mejoras continuas
- Colaboración en debugging 

---

## 👥 Equipo

| Nombre | Rol / Contribución | GitHub |
|--------|--------------------|--------|
| Diego Alberto Zárate | Frontend, UI/UX, maquetado, prototipado, testing | [@Diego-Zarate18](https://github.com/Diego-Zarate18) |
| Juan Camacho | Despliegue, documentación, QA | [@juanmcamacho](https://github.com/juanmcamacho) |
| Brian Luis Ruiz Pérez | Backend, arquitectura, testing de API | [@MrX-zeta](https://github.com/MrX-zeta) |

---

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Collabs-UP/collabs-frontend.git
cd collabs-frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Variables de Entorno

Crea un archivo `.env.local` y configura las variables necesarias para el entorno y endpoints del backend.

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```
Accede en [http://localhost:3000](http://localhost:3000)

---

## Testing

- Validación manual de flujos críticos: login, registro, gestión de tareas y miembros
- Pruebas unitarias sugeridas para hooks y servicios (no incluidas por alcance)

---

## 🎓 El Proceso de Desarrollo

Collabs se construyó bajo un enfoque ágil y colaborativo, priorizando la entrega continua y la toma de decisiones técnicas fundamentadas. Cada fase requirió ajustes y validaciones constantes, asegurando calidad y alineación con los objetivos del producto.

---

## Notas

Proyecto de práctica para la materia Aplicaciones Web Orientadas a Servicios, UPchiapas.