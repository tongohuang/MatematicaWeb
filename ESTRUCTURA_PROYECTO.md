# Estructura del Proyecto WebMatematica

Este documento detalla la estructura y funcionalidades del proyecto WebMatematica, una plataforma educativa para la enseñanza y aprendizaje de matemáticas con soporte para contenido interactivo y ecuaciones matemáticas.

## 1. Visión General del Proyecto

WebMatematica es una plataforma web diseñada para crear y gestionar contenido educativo matemático. Permite a los profesores (administradores) crear cursos estructurados con temas y secciones, incorporando contenido enriquecido con ecuaciones matemáticas, actividades interactivas y recursos multimedia.

### Características Principales:
- Editor de contenido matemático con soporte para ecuaciones (MathQuill/MathJax)
- Sistema de gestión de cursos, temas y secciones
- Actividades interactivas personalizables
- Carga optimizada de recursos (lazy loading)
- Interfaz de administración para educadores
- Visualización estructurada del contenido para estudiantes

## 2. Estructura de Archivos

```
/WebMatematica
  ├── index.html                # Página principal
  ├── login.html                # Página de inicio de sesión
  ├── css/                      # Estilos CSS
  ├── js/                       # Scripts JavaScript
  │   ├── main.js               # Funcionalidad principal
  │   ├── auth.js               # Autenticación de usuarios
  │   ├── data-manager.js       # Gestión de datos
  │   ├── courses.js            # Gestión de cursos
  │   ├── activities.js         # Gestión de actividades
  │   ├── section-editor.js     # Editor de secciones
  │   ├── math-editor.js        # Editor matemático
  │   ├── editor-loader.js      # Carga optimizada de recursos
  │   ├── equation-editor.js    # Editor de ecuaciones
  │   ├── text-editor.js        # Editor de texto enriquecido
  │   └── utils.js              # Utilidades generales
  ├── admin/                    # Área de administración
  │   ├── index.html            # Panel de administración
  │   ├── courses.html          # Gestión de cursos
  │   └── activities.html       # Gestión de actividades
  ├── activities/               # Actividades interactivas
  ├── components/               # Componentes reutilizables
  ├── courses/                  # Visualización de cursos
  ├── sections/                 # Contenido de secciones
  └── topics/                   # Gestión de temas
```

## 3. Componentes Principales

### 3.1 Sistema de Autenticación (auth.js)
- Gestión de inicio de sesión y cierre de sesión
- Verificación de roles (administrador/usuario)
- Almacenamiento de sesión en localStorage
- Redirección basada en roles

### 3.2 Gestión de Datos (data-manager.js)
- Almacenamiento y recuperación de datos
- Gestión de cursos, temas y secciones
- Interfaz para CRUD de entidades
- Persistencia en localStorage (simulando base de datos)

### 3.3 Editor de Secciones (section-editor.js)
- Creación y edición de secciones de contenido
- Soporte para diferentes tipos de secciones (texto, video, actividad)
- Interfaz de arrastrar y soltar para ordenar secciones
- Agrupación de secciones relacionadas

### 3.4 Editor Matemático (math-editor.js)
- Integración con MathQuill para edición de ecuaciones
- Barra de herramientas para inserción de símbolos matemáticos
- Renderizado de ecuaciones con MathJax
- Soporte para formato de texto enriquecido

### 3.5 Cargador Optimizado (editor-loader.js)
- Sistema de carga perezosa (lazy loading) de recursos
- Gestión de dependencias JavaScript y CSS
- Caché de recursos cargados
- Reducción de logs en producción

## 4. Flujos de Trabajo Principales

### 4.1 Creación de Contenido Educativo
1. El administrador inicia sesión
2. Crea o selecciona un curso existente
3. Crea o selecciona un tema dentro del curso
4. Añade secciones al tema (texto, video, actividad)
5. Utiliza el editor matemático para añadir ecuaciones
6. Guarda los cambios

### 4.2 Visualización de Contenido por Estudiantes
1. El estudiante accede a la página principal
2. Navega por los cursos disponibles
3. Selecciona un curso para ver sus temas
4. Explora las secciones dentro de cada tema
5. Interactúa con el contenido y actividades

## 5. Tecnologías Utilizadas

### 5.1 Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 (framework CSS)
- Font Awesome (iconos)
- jQuery (para algunas funcionalidades específicas)

### 5.2 Bibliotecas Matemáticas
- MathQuill (editor de ecuaciones)
- MathJax (renderizado de ecuaciones)

### 5.3 Almacenamiento
- localStorage (almacenamiento del lado del cliente)

## 6. Optimizaciones Implementadas

### 6.1 Rendimiento
- Carga diferida (lazy loading) de recursos
- Caché de scripts y estilos
- Reducción de solicitudes HTTP iniciales

### 6.2 Experiencia de Usuario
- Indicadores visuales durante la carga
- Interfaz intuitiva para edición de contenido
- Navegación jerárquica por cursos, temas y secciones

### 6.3 Mantenimiento
- Sistema centralizado de limpieza de componentes
- Gestión de logs (filtrado en producción)
- Estructura modular del código

## 7. Áreas de Mejora Potencial

### 7.1 Técnicas
- Migración a una base de datos real (desde localStorage)
- Implementación de una API RESTful
- Soporte para PWA (Progressive Web App)
- Optimización para dispositivos móviles

### 7.2 Funcionales
- Sistema de evaluación automática
- Herramientas de gamificación
- Foros de discusión integrados
- Generador de ejercicios paramétricos

### 7.3 Experiencia de Usuario
- Modo oscuro
- Personalización de temas visuales
- Previsualización instantánea de contenido
- Accesibilidad mejorada

## 8. Estructura de Datos

### 8.1 Curso
```javascript
{
  id: Number,
  title: String,
  description: String,
  color: String,
  icon: String,
  image: String
}
```

### 8.2 Tema
```javascript
{
  id: Number,
  courseId: Number,
  title: String,
  description: String,
  order: Number
}
```

### 8.3 Sección
```javascript
{
  id: Number,
  topicId: Number,
  title: String,
  type: String, // 'text', 'video', 'activity', etc.
  content: String,
  order: Number,
  groupId: Number // Para secciones agrupadas
}
```

### 8.4 Actividad
```javascript
{
  id: Number,
  title: String,
  type: String, // 'multiple-choice', 'true-false', etc.
  description: String,
  filename: String
}
```

## 9. Conclusión

WebMatematica es un proyecto educativo con un enfoque en la enseñanza de matemáticas que combina contenido textual, ecuaciones matemáticas y actividades interactivas. Su arquitectura modular y las optimizaciones implementadas proporcionan una base sólida para futuras mejoras y expansiones.

El sistema de carga optimizada y la estructura bien organizada permiten una experiencia fluida tanto para creadores de contenido como para estudiantes, mientras que el soporte matemático especializado facilita la creación de material educativo de calidad.
