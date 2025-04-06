# WebMatematica - Editor de Secciones Optimizado

Este proyecto incluye un editor de secciones matemáticas optimizado con carga diferida (lazy loading) para mejorar el rendimiento y la experiencia de usuario.

## Optimizaciones Implementadas

### 1. Sistema de Carga Perezosa (Lazy Loading)

Se ha implementado un sistema de carga perezosa que:

- Carga los recursos JavaScript y CSS sólo cuando son necesarios
- Reduce la cantidad de solicitudes HTTP iniciales
- Minimiza el tiempo de carga inicial de la página
- Ofrece retroalimentación visual mientras se cargan los componentes

### 2. Estructura de Archivos

El sistema ahora está organizado de la siguiente manera:

- `editor-loader.js`: Gestiona la carga de recursos y proporciona funciones de utilidad
- `section-editor.js`: Contiene la lógica específica para la edición de secciones
- `math-editor.js`: Contiene la implementación del editor matemático
- Archivos CSS separados con carga optimizada

### 3. Reducción de Logs en Consola

- Filtrado de mensajes de consola en producción
- Mantenimiento de logs críticos para la depuración
- Opciones para habilitar logs detallados en entorno de desarrollo

### 4. Gestión de Recursos

- Almacenamiento en caché de scripts y estilos cargados
- Carga asíncrona de dependencias
- Detección y reutilización de recursos ya cargados

### 5. Limpieza Centralizada

- Sistema centralizado para gestionar la limpieza de componentes
- Prevención de pérdidas de memoria y elementos huérfanos en el DOM
- Eliminación adecuada de listeners de eventos

## Funciones Principales

### ResourceManager

- `loadScript(url)`: Carga asíncrona de scripts
- `loadStyle(url)`: Carga de hojas de estilo
- `loadResources(resources)`: Carga múltiples recursos en paralelo

### Editor de Secciones

- `showContentFields()`: Muestra campos específicos según el tipo de sección
- `saveSection()`: Guarda los datos de la sección en el tema actual
- `loadSections()`: Carga y muestra las secciones del tema actual
- `editSection(sectionId)`: Carga una sección existente en el formulario

## MathJax Optimizado

- Configuración para carga bajo demanda
- Procesamiento de fórmulas matemáticas sólo cuando es necesario
- Integración con el editor de texto enriquecido

## Uso

Para utilizar el editor optimizado:

1. Abre `admin/section-editor.html?id=X` donde X es el ID del tema
2. Las dependencias se cargarán automáticamente cuando sean necesarias
3. El editor se inicializará con indicadores visuales de carga
4. Los cambios se guardarán de manera eficiente

## Requerimientos

- Navegador moderno con soporte para ES6
- Bootstrap 5.x
- Font Awesome 5.x o superior 