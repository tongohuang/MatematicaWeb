# ESTRUCTURA DE DATOS - MATEMÁTICA WEB

## Introducción

Este documento describe la estructura de datos utilizada en el proyecto Matemática Web, incluyendo el flujo de datos, el almacenamiento y la recuperación de información. Es crucial seguir estas pautas para mantener la consistencia y el correcto funcionamiento del sitio.

## Principios Fundamentales

1. **Sistema de Persistencia Dual**: Los datos se almacenan tanto en localStorage (para uso local) como en archivos JSON (para el repositorio).
2. **localStorage como Fuente Principal**: Toda la información se almacena y recupera principalmente de localStorage durante el desarrollo.
3. **JSON como Exportación y Fuente en Producción**: Los archivos JSON se utilizan para exportar datos al repositorio y como fuente principal en el entorno de producción (Netlify).
4. **Compatibilidad con Netlify**: Se han implementado soluciones específicas para garantizar el funcionamiento en Netlify.
5. **Consistencia entre Páginas**: Todas las páginas deben seguir el mismo enfoque para cargar y guardar datos.

## Estructura de Almacenamiento

### Jerarquía de Datos

```
Cursos
  └── Temas
       └── Secciones
            ├── Texto
            ├── Video
            ├── GeoGebra
            ├── HTML
            └── Actividad
```

### Claves de localStorage

| Clave | Descripción |
|-------|-------------|
| `courseData` | Objeto principal que contiene toda la estructura de datos del sitio |
| `matematicaweb_courses` | Array de objetos de cursos (sistema antiguo, mantenido para compatibilidad) |
| `matematicaweb_topics` | Array de objetos de temas (sistema antiguo, mantenido para compatibilidad) |
| `activity_data_[ID]` | Datos de una actividad específica |
| `activity_registry` | Registro de todas las actividades |
| `jsonData_courses` | Datos JSON de cursos para sincronización con el repositorio |
| `jsonData_topics` | Datos JSON de temas para sincronización con el repositorio |
| `jsonData_settings` | Datos JSON de configuración para sincronización con el repositorio |
| `jsonData_activities` | Datos JSON de actividades para sincronización con el repositorio |
| `jsonData_courseData` | Datos JSON combinados para sincronización con el repositorio (compatibilidad) |

### Estructura de Objetos

#### Curso
```javascript
{
  id: Number,           // Identificador único del curso
  title: String,        // Título del curso
  description: String,  // Descripción del curso
  color: String,        // Color en formato hexadecimal
  icon: String          // Clase de icono (Font Awesome)
}
```

#### Tema
```javascript
{
  id: Number,           // Identificador único del tema
  courseId: Number,     // ID del curso al que pertenece
  title: String,        // Título del tema
  description: String,  // Descripción del tema
  icon: String,         // Clase de icono (Font Awesome)
  sections: Array       // Array de objetos de secciones
}
```

#### Sección
```javascript
{
  id: Number,           // Identificador único de la sección
  title: String,        // Título de la sección
  type: String,         // Tipo de sección (text, youtube, geogebra, html, activity)
  content: String/Number // Contenido o ID de referencia según el tipo
}
```

#### Actividad
```javascript
{
  id: String,           // Identificador único de la actividad (ej: "activity_1234567890")
  title: String,        // Título de la actividad
  description: String,  // Descripción de la actividad
  type: String,         // Tipo de actividad (multiple-choice, true-false, short-answer)
  questions: [          // Array de preguntas
    {
      id: String,       // Identificador único de la pregunta
      text: String,      // Texto de la pregunta
      // Campos específicos según el tipo de actividad
      options: Array,    // Para multiple-choice: Array de opciones
      correctOption: Number, // Para multiple-choice: Índice de la opción correcta
      correctAnswer: Boolean, // Para true-false: Valor correcto
      correctAnswers: Array,  // Para short-answer: Array de respuestas aceptadas
      caseSensitive: Boolean  // Para short-answer: Si es sensible a mayúsculas/minúsculas
    }
  ]
}
```

## Sistema de Persistencia

### Estructura del Sistema de Persistencia

El sistema de persistencia (`DataPersistence`) mantiene una estructura de datos organizada de la siguiente manera:

```javascript
dataStructure: {
    // Datos persistentes (nunca se borran)
    persistent: {
        courses: {},  // Objetos de cursos indexados por ID
        topics: {},   // Objetos de temas indexados por ID
        sections: {}, // Objetos de secciones indexados por ID
        activities: {} // Objetos de actividades indexados por ID
    },
    // Cambios locales no sincronizados
    unsynced: {}
}
```

### Archivos JSON en el Repositorio

El sistema utiliza los siguientes archivos JSON para almacenar datos en el repositorio:

```javascript
JSON_FILES: {
    courses: '/data/courses.json',    // Array de objetos de cursos
    topics: '/data/topics.json',      // Array de objetos de temas
    settings: '/data/settings.json',  // Configuración del sitio
    activities: '/data/activities.json' // Array de objetos de actividades
}
```

Adicionalmente, se mantiene un archivo combinado para compatibilidad:
```javascript
JSON_FILE_PATH: '/data/courseData.json' // Datos combinados (formato antiguo)
```

## Flujo de Datos

### Inicialización del Sistema

1. **Detección de Entorno**: El sistema detecta automáticamente si está en entorno de producción (Netlify) o desarrollo.
2. **Carga de Datos**:
   - En producción: Carga datos desde archivos JSON del repositorio.
   - En desarrollo: Usa exclusivamente datos de localStorage.
3. **Combinación de Datos**: Combina datos del repositorio y localStorage según el entorno.
4. **Verificación de Tipos Especiales**: Verifica secciones de tipo HTML o Activity y las registra.

### Guardado de Datos

1. **Creación/Edición**: Los datos se crean o editan en la interfaz de usuario.
2. **Almacenamiento en Sistema de Persistencia**:
   - Se guardan en `dataStructure.persistent`.
   - Se marcan como no sincronizados en `dataStructure.unsynced`.
3. **Guardado en localStorage**: La estructura completa se guarda en localStorage.
4. **Sincronización con JSON** (opcional): Si se solicita, se generan los archivos JSON.
5. **Compatibilidad**: Se actualiza también en el sistema antiguo para mantener compatibilidad.

### Recuperación de Datos

1. **Carga desde Sistema de Persistencia**: Los datos se cargan desde `DataPersistence.getData()`.
2. **Fallback a Sistema Antiguo**: Si no se encuentran, se intenta con el sistema antiguo.
3. **Procesamiento**: Los datos se procesan y se muestran en la interfaz.

### Flujo de Datos entre Páginas

1. **Navegación Principal**:
   - `index.html` → Lista de cursos (carga datos usando `initializeDataSystem()` y `loadFeaturedCourses()`)
   - `courses/index.html` → Lista de cursos (carga datos usando `initializeDataSystem()` y `loadCourses()`)
   - `courses/view.html?id=X` → Detalles del curso X (carga datos usando `initializeDataSystem()` y `loadCourseData()`)
   - `topics/view.html?id=Y&courseId=X` → Detalles del tema Y del curso X (carga datos usando `initializeDataSystem()` y `loadData()`)
   - `sections/view.html?id=Z&topicId=Y` → Visualización de la sección Z del tema Y (carga datos usando `loadData()`)

2. **Navegación Administrativa**:
   - `admin/index.html` → Panel de administración
   - `admin/courses-manager.html` → Gestión de cursos
   - `admin/course-editor.html?id=X` → Editor del curso X
   - `admin/topic-editor.html?courseId=X` → Editor de temas del curso X
   - `admin/section-editor.html?topicId=Y` → Editor de secciones del tema Y
   - `admin/activities-manager.html` → Gestor de actividades (muestra todas las actividades y su uso)

3. **Flujo de Datos Coherente**:
   - Al crear un curso en `courses-manager.html`, debe aparecer en `courses/index.html` y `index.html`
   - Al crear un tema en `topic-editor.html`, debe aparecer en `courses/view.html`
   - Al crear una sección en `section-editor.html`, debe aparecer en `topics/view.html`
   - Al crear una actividad en `section-editor.html`, debe registrarse en el sistema y ser accesible desde `activities-manager.html`

## Consideraciones para Netlify

### Restricciones de Netlify

1. **Sitio Estático**: Netlify aloja sitios estáticos, sin backend.
2. **Sin Persistencia de Servidor**: No hay almacenamiento en servidor.
3. **Limitaciones de CORS**: Restricciones para cargar recursos externos.

### Soluciones Implementadas

1. **Polyfill Local**: Se utiliza una versión local de polyfill para evitar dependencias externas.
2. **Detección de Entorno**: Se detecta automáticamente si estamos en Netlify.
3. **Versiones Estáticas**: Para actividades, se utilizan versiones estáticas en Netlify.
4. **Manejo de Errores Robusto**: Sistema de recuperación ante fallos de carga.

## Tipos de Secciones

### Texto
- Contenido HTML con soporte para ecuaciones matemáticas.
- Se guarda directamente en el objeto de sección.

### Video (YouTube)
- ID del video de YouTube.
- Se embebe directamente en la página.

### GeoGebra
- ID del applet de GeoGebra.
- Se embebe directamente en la página.

### HTML
- Archivos HTML personalizados.
- Se cargan mediante AJAX.

### Actividad
- Actividades interactivas (opción múltiple, verdadero/falso, respuesta corta).
- Se guardan en localStorage con claves específicas.
- En Netlify se utilizan versiones estáticas.

#### Gestión de Actividades

1. **Creación de Actividades**:
   - Las actividades se crean desde el panel de administración en `admin/section-editor.html`.
   - Al crear una actividad, se genera un ID único con formato `activity_[timestamp]`.
   - Los datos de la actividad se guardan en localStorage de varias formas:
     - Con la clave `activity_data_[ID]` (formato principal)
     - Con la clave `[ID]` (formato simple para compatibilidad)
   - Se registra la actividad en el registro global con la clave `activity_registry`.
   - Opcionalmente, se sincroniza con el sistema de persistencia en `DataPersistence.dataStructure.persistent.activities`.

2. **Plantillas de Actividades**:
   - Las actividades utilizan plantillas HTML estáticas ubicadas en `activities/templates/`.
   - Existen tres tipos principales de actividades:
     - Opción múltiple: `activity_template_multiple_choice.html`
     - Verdadero/Falso: `activity_template_true_false.html`
     - Respuesta corta: `activity_template_short_answer.html`
   - Se utiliza `activity-loader.html` como cargador universal que detecta el tipo de actividad.

3. **Visualización de Actividades**:
   - En el panel de administración: `admin/activity-loader.html?id=[ID]`
   - En la navegación del sitio: Se carga la plantilla correspondiente y se inyectan los datos desde localStorage.
   - El cargador intenta obtener los datos de la actividad de múltiples fuentes en este orden:
     1. `localStorage.getItem('activity_data_[ID]')` (clave principal)
     2. `localStorage.getItem('[ID]')` (clave simple)
     3. `DataPersistence.getData('activities', [ID])` (sistema de persistencia)

4. **Gestión de Actividades**:
   - El administrador de actividades (`admin/activities-manager.html`) permite:
     - Ver todas las actividades almacenadas en localStorage
     - Identificar qué actividades están en uso y en qué secciones/temas/cursos
     - Eliminar actividades que no están en uso
     - Ver detalles de cada actividad (título, tipo, preguntas, etc.)

5. **Compatibilidad con Netlify**:
   - Las actividades funcionan completamente en el cliente sin necesidad de backend.
   - Los datos de las actividades se almacenan en localStorage en desarrollo y se cargan desde JSON en producción.
   - Las plantillas HTML son estáticas y compatibles con el despliegue en Netlify.
   - En entorno Netlify, se utiliza una versión estática (`activity-static.html`) para mayor compatibilidad.

## Configuración de Archivos para Carga Coherente de Datos

### Estructura de Archivos JavaScript

1. **data-persistence.js**: Sistema principal de persistencia de datos.
   - Implementa el sistema dual de almacenamiento (localStorage y JSON).
   - Proporciona métodos para inicializar, cargar, guardar y sincronizar datos.
   - Gestiona la detección de entorno (producción vs. desarrollo).
   - Maneja la exportación de datos a archivos JSON para el repositorio.

2. **data-manager.js**: Capa de compatibilidad y acceso simplificado a datos.
   - Proporciona una interfaz unificada para acceder a los datos.
   - Implementa funciones para cargar y guardar datos desde/hacia el sistema de persistencia.
   - Mantiene compatibilidad con el sistema antiguo (arrays en localStorage).
   - Ofrece métodos específicos para cada tipo de dato (cursos, temas, secciones).

3. **main.js**: Inicialización y funciones comunes.
   - Implementa `initializeDataSystem()` para inicializar el sistema de persistencia.
   - Detecta automáticamente el entorno (producción vs. desarrollo).
   - Proporciona funciones comunes utilizadas en múltiples páginas.

4. **Orden de Carga de Scripts**:
   ```html
   <!-- Primero: Bibliotecas externas -->
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

   <!-- Segundo: Utilidades y datos de muestra -->
   <script src="../js/utils.js"></script>
   <script src="../js/auth.js"></script>
   <script src="../js/sample-data.js"></script>

   <!-- Tercero: Gestión de datos -->
   <script src="../js/data-persistence.js"></script>
   <script src="../js/data-manager.js"></script>

   <!-- Cuarto: Lógica común y específica -->
   <script src="../js/main.js"></script>
   <script src="../js/page-specific.js"></script>
   ```

### Patrón de Carga de Datos en Páginas HTML

Todas las páginas deben seguir este patrón para cargar datos:

1. **Inicialización del Sistema de Persistencia**:
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar componentes comunes
    loadComponent('header', '../components/header.html');
    loadComponent('footer', '../components/footer.html');

    // Inicializar sistema de persistencia
    if (typeof initializeDataSystem === 'function') {
        console.log('Inicializando sistema de persistencia...');
        await initializeDataSystem();
    }

    // Cargar datos específicos de la página
    loadData();
});
```

2. **Carga de Datos Específicos**:
```javascript
function loadData() {
    console.log('Cargando datos...');

    // Obtener parámetros de la URL si es necesario
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    try {
        // 1. Intentar cargar desde DataManager (que usa el sistema de persistencia)
        const data = DataManager.getData(id);
        if (data) {
            processData(data);
            return;
        }

        // 2. Si no hay datos en DataManager, intentar directamente con localStorage
        const localData = JSON.parse(localStorage.getItem('matematicaweb_key'));
        if (localData && (Array.isArray(localData) ? localData.length > 0 : Object.keys(localData).length > 0)) {
            processData(localData);
            return;
        }

        // 3. Si no hay datos, mostrar mensaje apropiado
        showNoDataMessage();
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showError('Error al cargar datos', error.message);
    }
}
```

### Interrelación de Datos entre Páginas

1. **Navegación con Parámetros**:
   - Usar parámetros URL para pasar IDs entre páginas: `?id=123&courseId=456`
   - Extraer parámetros con `URLSearchParams`:
     ```javascript
     const urlParams = new URLSearchParams(window.location.search);
     const id = urlParams.get('id');
     ```

2. **Verificación Cruzada de Datos**:
   - Al cargar un tema, verificar si su curso existe.
   - Al cargar una sección, verificar si su tema existe.
   - Implementar recuperación de datos faltantes:
     ```javascript
     // Si tenemos un tema pero no su curso
     if (topic && !course) {
         course = loadCourseById(topic.courseId);
     }
     ```

3. **Actualización Coherente**:
   - Al modificar un curso, actualizar todos sus temas.
   - Al modificar un tema, actualizar todas sus secciones.
   - Al eliminar un elemento, eliminar todos sus dependientes.

## Buenas Prácticas

1. **Usar el Sistema de Persistencia**: Utilizar siempre `DataPersistence` para operaciones de datos.
2. **Inicializar Correctamente**: Llamar a `initializeDataSystem()` antes de acceder a los datos.
3. **Siempre Verificar**: Después de guardar, verificar que los datos estén en localStorage.
4. **Usar Logs Detallados**: Mantener logs detallados para facilitar la depuración.
5. **Manejar Errores**: Implementar manejo de errores robusto con fallbacks.
6. **Compatibilidad**: Mantener compatibilidad con sistemas anteriores.
7. **Pruebas**: Probar en local antes de desplegar a Netlify.
8. **Consistencia**: Usar el mismo enfoque en todas las páginas.
9. **Verificación Cruzada**: Verificar relaciones entre datos (cursos-temas-secciones).
10. **Sincronización**: Utilizar `DataPersistence.synchronizeData()` para generar los archivos JSON.

## Despliegue en Netlify

1. **Sincronización de Datos**: Utilizar el panel de administración para sincronizar los datos con los archivos JSON.
2. **Push a GitHub**: Los cambios se envían al repositorio de GitHub.
3. **Despliegue Automático**: Netlify detecta los cambios y despliega automáticamente.
4. **Verificación**: Verificar que todo funcione correctamente en Netlify.

## Diferencias entre Entornos

### Desarrollo Local
1. **Fuente de Datos**: Usa exclusivamente localStorage como fuente principal.
2. **Sincronización**: La sincronización con archivos JSON es manual y opcional.
3. **Actividades**: Las actividades se cargan directamente desde plantillas dinámicas.

### Producción (Netlify)
1. **Fuente de Datos**: Carga datos desde archivos JSON del repositorio.
2. **Sincronización**: Los datos se sincronizan con localStorage al cargar la página.
3. **Actividades**: Utiliza versiones estáticas de las plantillas para mayor compatibilidad.

---

**IMPORTANTE**: Cualquier modificación a la estructura de datos debe respetar estos principios para garantizar el correcto funcionamiento del sitio tanto en local como en Netlify. La consistencia entre páginas es crucial para mantener la integridad de los datos.
