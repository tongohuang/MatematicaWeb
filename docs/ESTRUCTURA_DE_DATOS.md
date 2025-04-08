# ESTRUCTURA DE DATOS - MATEMÁTICA WEB

## Introducción

Este documento describe la estructura de datos utilizada en el proyecto Matemática Web, incluyendo el flujo de datos, el almacenamiento y la recuperación de información. Es crucial seguir estas pautas para mantener la consistencia y el correcto funcionamiento del sitio.

## Principios Fundamentales

1. **localStorage como Fuente Principal**: Toda la información se almacena y recupera principalmente de localStorage.
2. **JSON como Exportación**: Los archivos JSON se utilizan únicamente para exportar datos al repositorio.
3. **Compatibilidad con Netlify**: Se han implementado soluciones específicas para garantizar el funcionamiento en Netlify.
4. **Consistencia entre Páginas**: Todas las páginas deben seguir el mismo enfoque para cargar y guardar datos.

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
| `matematicaweb_courses` | Array de objetos de cursos |
| `matematicaweb_topics` | Array de objetos de temas |
| `activity_data_[ID]` | Datos de una actividad específica |
| `activity_registry` | Registro de todas las actividades |

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

## Flujo de Datos

### Guardado de Datos

1. **Creación/Edición**: Los datos se crean o editan en la interfaz de usuario.
2. **Almacenamiento en localStorage**: Los datos se guardan directamente en localStorage.
3. **Verificación**: Se verifica que los datos se hayan guardado correctamente.
4. **Compatibilidad**: Se actualiza también en DataManager para mantener compatibilidad.

### Recuperación de Datos

1. **Carga desde localStorage**: Los datos se cargan directamente desde localStorage.
2. **Fallback**: Si no se encuentran en localStorage, se intenta con DataManager.
3. **Procesamiento**: Los datos se procesan y se muestran en la interfaz.

### Flujo de Datos entre Páginas

1. **Navegación Principal**:
   - `index.html` → Lista de cursos
   - `courses/index.html` → Lista de cursos
   - `courses/view.html?id=X` → Detalles del curso X
   - `topics/view.html?id=Y&courseId=X` → Detalles del tema Y del curso X

2. **Navegación Administrativa**:
   - `admin/index.html` → Panel de administración
   - `admin/courses-manager.html` → Gestión de cursos
   - `admin/course-editor.html?id=X` → Editor del curso X
   - `admin/topic-editor.html?courseId=X` → Editor de temas del curso X
   - `admin/section-editor.html?topicId=Y` → Editor de secciones del tema Y

3. **Flujo de Datos Coherente**:
   - Al crear un curso en `courses-manager.html`, debe aparecer en `courses/index.html`
   - Al crear un tema en `topic-editor.html`, debe aparecer en `courses/view.html`
   - Al crear una sección en `section-editor.html`, debe aparecer en `topics/view.html`

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
   - Los datos de la actividad se guardan en localStorage con la clave `activity_data_[ID]`.
   - Se registra la actividad en el registro global con la clave `activity_registry`.

2. **Plantillas de Actividades**:
   - Las actividades utilizan plantillas HTML estáticas ubicadas en `activities/templates/`.
   - Existen tres tipos principales de actividades:
     - Opción múltiple: `activity_template_multiple_choice.html`
     - Verdadero/Falso: `activity_template_true_false.html`
     - Respuesta corta: `activity_template_short_answer.html`

3. **Visualización de Actividades**:
   - En el panel de administración: `admin/activity-loader.html?id=[ID]`
   - En la navegación del sitio: Se carga la plantilla correspondiente y se inyectan los datos desde localStorage.

4. **Compatibilidad con Netlify**:
   - Las actividades funcionan completamente en el cliente sin necesidad de backend.
   - Los datos de las actividades se almacenan en localStorage.
   - Las plantillas HTML son estáticas y compatibles con el despliegue en Netlify.

## Configuración de Archivos para Carga Coherente de Datos

### Estructura de Archivos JavaScript

1. **data-manager.js**: Punto central para la gestión de datos.
   - Debe cargarse en todas las páginas HTML que necesiten acceder a los datos.
   - Implementa funciones para cargar y guardar datos desde/hacia localStorage.
   - Proporciona fallbacks para compatibilidad con sistemas anteriores.

2. **Orden de Carga de Scripts**:
   ```html
   <!-- Primero: Bibliotecas externas -->
   <script src="../lib/bootstrap.bundle.min.js"></script>

   <!-- Segundo: Utilidades y configuración -->
   <script src="../js/config.js"></script>
   <script src="../js/utils.js"></script>

   <!-- Tercero: Gestión de datos -->
   <script src="../js/data-manager.js"></script>
   <script src="../js/data-persistence.js"></script>

   <!-- Cuarto: Lógica específica de la página -->
   <script src="../js/page-specific.js"></script>
   ```

### Patrón de Carga de Datos en Páginas HTML

Todas las páginas deben seguir este patrón para cargar datos:

```javascript
// 1. Intentar cargar directamente desde localStorage
try {
    const data = JSON.parse(localStorage.getItem('matematicaweb_key'));
    if (data && data.length > 0) {
        // Usar los datos de localStorage
        processData(data);
    } else {
        // 2. Si no hay datos en localStorage, intentar con DataManager
        const managerData = DataManager.getData();
        processData(managerData);
    }
} catch (error) {
    console.error('Error al cargar datos:', error);
    // 3. Fallback a DataManager en caso de error
    const managerData = DataManager.getData();
    processData(managerData);
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

1. **Siempre Verificar**: Después de guardar, verificar que los datos estén en localStorage.
2. **Usar Logs Detallados**: Mantener logs detallados para facilitar la depuración.
3. **Manejar Errores**: Implementar manejo de errores robusto.
4. **Compatibilidad**: Mantener compatibilidad con sistemas anteriores.
5. **Pruebas**: Probar en local antes de desplegar a Netlify.
6. **Consistencia**: Usar el mismo enfoque en todas las páginas.
7. **Verificación Cruzada**: Verificar relaciones entre datos (cursos-temas-secciones).

## Despliegue en Netlify

1. **Push a GitHub**: Los cambios se envían al repositorio de GitHub.
2. **Despliegue Automático**: Netlify detecta los cambios y despliega automáticamente.
3. **Verificación**: Verificar que todo funcione correctamente en Netlify.

---

**IMPORTANTE**: Cualquier modificación a la estructura de datos debe respetar estos principios para garantizar el correcto funcionamiento del sitio tanto en local como en Netlify. La consistencia entre páginas es crucial para mantener la integridad de los datos.
