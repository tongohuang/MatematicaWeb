# FUNCIONAMIENTO DE LA WEB - MATEMÁTICA WEB

## Introducción

Este documento describe el funcionamiento general de la plataforma Matemática Web, incluyendo la navegación del usuario, el panel de administración, y las diferentes funcionalidades disponibles. Esta guía está orientada a desarrolladores y administradores que necesiten entender cómo funciona el sistema en su conjunto, cómo se cargan los datos y cómo interaccionan los diferentes componentes.

## Arquitectura General

Matemática Web es una aplicación web estática que funciona completamente en el navegador del cliente, sin necesidad de un servidor backend para la funcionalidad principal. La arquitectura se basa en los siguientes principios:

1. **Almacenamiento Local**: Utiliza localStorage como almacenamiento principal durante el desarrollo.
2. **Archivos JSON**: Emplea archivos JSON para persistencia de datos en el repositorio y como fuente principal en producción.
3. **Sistema de Persistencia Dual**: Implementa un sistema que combina localStorage y JSON para garantizar la compatibilidad con Netlify.
4. **Carga Dinámica**: Carga contenido dinámicamente mediante JavaScript para crear una experiencia fluida.
5. **Detección de Entorno**: Detecta automáticamente si está en entorno de desarrollo o producción para ajustar su comportamiento.

## Navegación del Usuario

### Estructura de Navegación

La plataforma sigue una estructura jerárquica de navegación con rutas bien definidas:

1. **Página Principal** (`index.html`)
   - Muestra los cursos disponibles cargados mediante `loadFeaturedCourses()`
   - Proporciona acceso al panel de administrador mediante un botón discreto en la esquina superior
   - Inicializa el sistema de datos con `initializeDataSystem()` para cargar la información necesaria

2. **Listado de Cursos** (`courses/index.html`)
   - Muestra todos los cursos disponibles en formato de tarjetas usando `DataManager.getCourses()`
   - Cada tarjeta incluye título, descripción, icono/imagen y estadísticas básicas
   - Implementa un sistema de grid responsivo que se adapta a diferentes tamaños de pantalla

3. **Vista de Curso** (`courses/view.html?id=X`)
   - Muestra los detalles del curso seleccionado obtenido mediante `DataManager.getCourseById(courseId)`
   - Lista los temas disponibles dentro del curso usando `DataManager.getTopicsByCourse(courseId)`
   - Proporciona navegación jerárquica para explorar el contenido del curso

4. **Vista de Tema** (`topics/view.html?id=Y&courseId=X`)
   - Muestra todas las secciones del tema seleccionado
   - Organiza el contenido en un formato secuencial y estructurado con secciones colapsables
   - Permite navegar entre las diferentes secciones y volver al curso principal
   - Carga las secciones desde `DataManager` o directamente desde localStorage

5. **Vista de Sección** (`sections/view.html?id=Z&topicId=Y`)
   - Muestra el contenido específico de la sección (texto, video, actividad, etc.)
   - Carga el contenido adecuado según el tipo de sección mediante `loadSectionContent()`
   - Proporciona controles de navegación para moverse entre secciones
   - Implementa funcionalidades específicas según el tipo de contenido

### Experiencia de Usuario

- **Navegación Intuitiva**:
  - El sistema utiliza breadcrumbs (migas de pan) para mostrar la ruta de navegación actual
  - Implementa menús de navegación jerárquicos con indicadores visuales claros
  - Mantiene un botón de "Inicio" visible en todas las páginas para volver a la página principal
  - Incluye enlaces para navegar entre niveles relacionados (curso → tema → sección)

- **Diseño Responsivo**:
  - La interfaz se adapta automáticamente a diferentes tamaños de pantalla
  - Utiliza un sistema de grid flexible que reorganiza el contenido según el dispositivo
  - Implementa menús colapsables en dispositivos móviles para optimizar el espacio
  - Ajusta tamaños de fuente y espaciado para mantener la legibilidad en todas las pantallas

- **Carga Optimizada**:
  - Implementa carga diferida (lazy loading) para contenido multimedia
  - Utiliza el sistema de persistencia para cargar datos de manera eficiente
  - Muestra indicadores de carga (spinners) durante la obtención de datos
  - Implementa manejo de errores con mensajes claros cuando la carga falla

- **Consistencia Visual**:
  - Mantiene una paleta de colores, tipografía y espaciado coherentes en toda la plataforma
  - Utiliza componentes visuales estandarizados (tarjetas, botones, formularios)
  - Implementa transiciones y animaciones sutiles para mejorar la experiencia
  - Proporciona feedback visual para acciones del usuario (hover, click, selección)

### Flujo de Carga de Datos

El proceso de carga de datos sigue un patrón consistente en todas las páginas:

1. **Inicialización**: La página llama a `initializeDataSystem()` para preparar el sistema de persistencia
2. **Detección de Entorno**: El sistema determina si está en producción o desarrollo
3. **Carga de Datos**:
   - En desarrollo: Carga datos desde localStorage
   - En producción: Carga datos desde archivos JSON y los sincroniza con localStorage
4. **Renderizado**: Utiliza los datos cargados para generar el contenido HTML dinámicamente
5. **Interactividad**: Configura los eventos y comportamientos interactivos de la página

## Panel de Administración

El panel de administración es el centro de control donde los administradores pueden crear, editar y gestionar todo el contenido educativo de la plataforma.

### Acceso al Panel

- Enlace discreto en la esquina superior derecha de la página principal (`admin-access-button`)
- Requiere autenticación mediante el sistema `auth.js` que verifica credenciales de administrador
- Implementa redirección automática a la página de login si el usuario no está autenticado
- Utiliza localStorage para mantener la sesión del administrador entre visitas

### Estructura del Panel

1. **Dashboard Principal** (`admin/index.html`)
   - Proporciona una visión general del contenido mediante tarjetas de estadísticas
   - Muestra contadores de cursos, temas, secciones y actividades
   - Incluye accesos rápidos a las funciones más utilizadas
   - Ofrece herramientas para sincronizar datos con el repositorio

2. **Gestor de Cursos** (`admin/courses-manager.html`)
   - Lista todos los cursos existentes en formato de tabla
   - Permite crear nuevos cursos mediante un formulario modal
   - Implementa funciones para editar y eliminar cursos existentes
   - Proporciona herramientas de búsqueda y filtrado por nombre o categoría

3. **Editor de Curso** (`admin/course-editor.html?id=X`)
   - Permite editar los detalles del curso (título, descripción, imagen)
   - Incluye selectores visuales para elegir color e icono del curso
   - Gestiona la lista de temas asociados al curso
   - Proporciona previsualización en tiempo real de los cambios

4. **Editor de Temas** (`admin/topic-editor.html?courseId=X`)
   - Permite crear y editar temas dentro de un curso específico
   - Implementa funcionalidad de arrastrar y soltar para reordenar temas
   - Gestiona la visibilidad y metadatos de cada tema
   - Proporciona navegación directa al editor de secciones

5. **Editor de Secciones** (`admin/section-editor.html?topicId=Y`)
   - Permite crear y editar secciones dentro de un tema
   - Soporta múltiples tipos de contenido con interfaces especializadas:
     - Editor de texto enriquecido con soporte para ecuaciones matemáticas
     - Selector de videos de YouTube con previsualización
     - Integrador de applets de GeoGebra
     - Creador de actividades interactivas
   - Implementa funcionalidad de arrastrar y soltar para reordenar secciones
   - Permite agrupar secciones en grupos temáticos

6. **Gestor de Actividades** (`admin/activities-manager.html`)
   - Centraliza la gestión de todas las actividades interactivas
   - Muestra qué actividades están en uso y en qué secciones/temas/cursos
   - Permite eliminar actividades que no están en uso
   - Proporciona herramientas para visualizar detalles de cada actividad
   - Implementa filtros para encontrar actividades por tipo o estado

### Capacidades del Administrador

#### Gestión de Cursos

El sistema proporciona herramientas completas para la gestión de cursos:

- **Crear cursos** con:
  - Título y descripción detallada
  - Imagen personalizada o icono de Font Awesome
  - Color de tema personalizable mediante selector visual
  - Metadatos adicionales como duración estimada y nivel de dificultad

- **Editar cursos** existentes:
  - Actualización de cualquier propiedad en tiempo real
  - Previsualización de cambios antes de guardar
  - Historial de modificaciones con fecha y usuario

- **Eliminar cursos**:
  - Confirmación de seguridad antes de eliminar
  - Eliminación en cascada de temas y secciones asociadas
  - Opción para mantener actividades reutilizables

- **Organizar cursos**:
  - Control del orden de visualización mediante sistema de prioridad
  - Agrupación por categorías o niveles
  - Opciones de visibilidad (publicado/borrador)

#### Gestión de Temas

Las herramientas para gestionar temas dentro de los cursos incluyen:

- **Crear temas** con:
  - Título, descripción e icono personalizado
  - Asociación automática al curso actual
  - Opciones de visibilidad y estado

- **Editar temas** existentes:
  - Modificación de propiedades básicas y metadatos
  - Gestión de la relación con el curso padre
  - Previsualización de cambios en tiempo real

- **Eliminar temas**:
  - Confirmación de seguridad con resumen de contenido afectado
  - Eliminación en cascada de secciones asociadas
  - Registro de eliminación para auditoría

- **Organizar temas**:
  - Reordenamiento mediante interfaz de arrastrar y soltar
  - Numeración automática basada en el orden
  - Agrupación por unidades o módulos

#### Gestión de Secciones

El editor de secciones ofrece herramientas especializadas para diferentes tipos de contenido:

- **Crear secciones** de múltiples tipos:
  - **Texto**: Editor WYSIWYG con soporte para ecuaciones matemáticas
  - **Video**: Integración con YouTube con previsualización y opciones de reproducción
  - **GeoGebra**: Incorporación de applets interactivos con configuración personalizada
  - **HTML**: Editor de código HTML para contenido avanzado
  - **Actividad**: Creador de actividades interactivas integrado

- **Editar secciones** existentes:
  - Interfaz especializada según el tipo de contenido
  - Guardado automático de borradores para prevenir pérdida de datos
  - Historial de versiones para recuperar cambios anteriores

- **Organizar secciones**:
  - Reordenamiento mediante interfaz de arrastrar y soltar
  - Agrupación en conjuntos temáticos
  - Control de visibilidad individual y por grupos

- **Funciones avanzadas**:
  - Duplicación de secciones para crear variantes
  - Conversión entre tipos de sección cuando es posible
  - Previsualización del contenido como lo verá el estudiante

#### Gestión de Actividades

El sistema de actividades interactivas incluye herramientas especializadas:

- **Crear actividades** de diferentes tipos:
  - **Opción múltiple**: Preguntas con múltiples opciones y una o varias respuestas correctas
  - **Verdadero/falso**: Afirmaciones que el estudiante debe evaluar
  - **Respuesta corta**: Preguntas que requieren una respuesta textual específica

- **Configurar actividades**:
  - Definición de retroalimentación personalizada para respuestas correctas e incorrectas
  - Configuración de intentos máximos y puntuación mínima
  - Opciones para aleatorizar preguntas y respuestas

- **Administrar actividades**:
  - Visualización centralizada de todas las actividades en el gestor
  - Identificación de actividades en uso y su ubicación
  - Eliminación segura de actividades no utilizadas

## Tipos de Contenido

### Texto Enriquecido

Las secciones de texto utilizan un editor enriquecido con las siguientes características:

- **Barra de herramientas completa**:
  - **Formato de texto**: Negrita, cursiva, subrayado, tachado, superscript, subscript
  - **Estilos de párrafo**: Títulos (H1-H6), párrafos, citas
  - **Alineación**: Izquierda, centro, derecha, justificado
  - **Listas**: Ordenadas, no ordenadas, con sangría
  - **Enlaces**: Inserción y edición de hipervinculos
  - **Tablas**: Creación y edición de tablas con opciones de formato
  - **Imágenes**: Carga e inserción de imágenes con opciones de tamaño y alineación
  - **Colores**: Selector de color para texto y fondo

- **Sistema de ecuaciones matemáticas**:
  - Integración con MathJax para renderizado de alta calidad
  - Editor visual de ecuaciones con sintaxis LaTeX
  - Biblioteca de plantillas de ecuaciones comunes
  - Previsualización en tiempo real de ecuaciones
  - Inserción fluida en el texto con marcado especial

- **Características avanzadas**:
  - Modo de edición HTML para usuarios avanzados
  - Guardado automático de borradores
  - Historial de cambios
  - Previsualización del contenido formateado antes de guardar
  - Compatibilidad con modo oscuro

### Videos

Las secciones de video ofrecen una integración completa con plataformas de video online:

- **Integración con plataformas**:
  - YouTube: Inserción mediante ID de video con previsualización
  - Vimeo: Soporte para videos de Vimeo mediante ID
  - Compatibilidad con otras plataformas mediante código de incrustación

- **Opciones de configuración**:
  - Control de dimensiones (ancho/alto) y relación de aspecto
  - Configuración de reproducción (autoplay, controles, bucle)
  - Punto de inicio personalizable (segundos específicos)
  - Opciones de privacidad mejorada

- **Características adicionales**:
  - Campo para añadir descripciones o instrucciones junto al video
  - Soporte para subtítulos y transcripciones
  - Detección automática de miniaturas
  - Carga optimizada mediante lazy loading

### Applets de GeoGebra

Las secciones de GeoGebra permiten incorporar applets interactivos de matemáticas:

- **Integración con GeoGebra**:
  - Inserción mediante ID de material de GeoGebra
  - Previsualización del applet antes de guardar
  - Soporte para diferentes tipos de applets (gráficos, geometría, 3D)

- **Opciones de configuración**:
  - Control de dimensiones y escala
  - Configuración de herramientas disponibles
  - Personalización de la interfaz del applet
  - Opciones de interactividad y restricciones

- **Contexto educativo**:
  - Campo para añadir instrucciones o contexto para el applet
  - Posibilidad de incluir preguntas guiadas
  - Integración con el flujo de contenido de la sección

### Actividades Interactivas

Las actividades interactivas proporcionan evaluación formativa con retroalimentación inmediata:

- **Tipos de actividades**:
  - **Opción múltiple**: Con una o varias respuestas correctas posibles
  - **Verdadero/falso**: Para evaluar afirmaciones
  - **Respuesta corta**: Para respuestas textuales específicas

- **Características avanzadas**:
  - Retroalimentación personalizada para cada respuesta
  - Aleatorización de preguntas y opciones
  - Límite de intentos configurable
  - Puntuación mínima para aprobar
  - Temporizador opcional

- **Experiencia del estudiante**:
  - Interfaz intuitiva y accesible
  - Retroalimentación inmediata tras cada respuesta
  - Resumen de resultados al finalizar
  - Indicadores visuales claros de éxito/error

## Herramientas Especiales

### Editor de Texto Enriquecido

El editor de texto WYSIWYG (What You See Is What You Get) es una herramienta central del sistema:

- **Arquitectura modular**:
  - Implementado como clase JavaScript reutilizable
  - Eventos personalizables para diferentes contextos
  - Integración con el sistema de persistencia

- **Interfaz intuitiva**:
  - Barra de herramientas organizada por categorías
  - Atajos de teclado para operaciones comunes
  - Indicadores visuales del formato actual
  - Modo responsivo para diferentes dispositivos

- **Implementación técnica**:
```javascript
// Inicialización del editor de texto
function initTextEditor(containerId, textareaId, options = {}) {
    // Crear instancia del editor
    window.currentTextEditor = new TextEditor(containerId, textareaId, {
        toolbarItems: options.toolbarItems || 'full',
        height: options.height || '300px',
        mathEnabled: options.mathEnabled !== false,
        autoSave: options.autoSave !== false,
        onChange: options.onChange || null
    });

    // Configurar eventos
    window.currentTextEditor.on('change', function(content) {
        // Guardar borrador automáticamente
        if (options.autoSave) {
            localStorage.setItem(`draft_${textareaId}`, content);
        }
    });

    // Aplicar foco al editor
    window.currentTextEditor.focus();

    return window.currentTextEditor;
}
```

### Sistema de Ecuaciones Matemáticas

El sistema de ecuaciones matemáticas integra MathJax para renderizado de alta calidad:

- **Componentes principales**:
  - Editor visual con sintaxis LaTeX
  - Biblioteca de plantillas organizadas por categorías
  - Previsualizador en tiempo real
  - Sistema de inserción en el flujo de texto

- **Flujo de trabajo**:
  1. El usuario selecciona "Insertar ecuación" en el editor
  2. Se abre un modal con el editor de ecuaciones
  3. El usuario puede escribir LaTeX o seleccionar una plantilla
  4. La ecuación se previsualiza en tiempo real
  5. Al confirmar, la ecuación se inserta en el texto con marcado especial

- **Renderizado**:
  - Las ecuaciones se renderizan mediante MathJax
  - Se mantiene el código LaTeX original para ediciones posteriores
  - Soporte para modo inline y modo bloque

### Sistema de Previsualización

El sistema incluye previsualizadores especializados para diferentes tipos de contenido:

- **Previsualizador de texto**:
  - Muestra el contenido exactamente como aparecerá para el estudiante
  - Renderiza ecuaciones matemáticas, tablas e imágenes
  - Aplica estilos consistentes con la vista final

- **Previsualizador de actividades**:
  - Muestra la actividad en un modal o ventana flotante
  - Permite interactuar con la actividad como lo haría un estudiante
  - Oculta las respuestas correctas para simular la experiencia real
  - Incluye todos los elementos de interfaz (botones, retroalimentación)

- **Previsualizador de curso/tema**:
  - Muestra cómo se verán las tarjetas en la página principal
  - Previsualiza la estructura de navegación
  - Simula la experiencia completa del usuario

## Flujo de Trabajo Típico

### Creación de un Curso Completo

El proceso completo de creación de contenido educativo sigue estos pasos:

1. **Crear un nuevo curso** desde el gestor de cursos:
   - Acceder a `admin/courses-manager.html` y hacer clic en "Nuevo Curso"
   - Completar el formulario con título, descripción, color e icono
   - Guardar el curso, lo que genera un ID único y lo almacena en el sistema de persistencia

2. **Añadir temas al curso** desde el editor de curso:
   - Acceder a `admin/course-editor.html?id=X` donde X es el ID del curso
   - Utilizar el formulario de "Nuevo Tema" para crear temas
   - Organizar los temas mediante la interfaz de arrastrar y soltar
   - Guardar los cambios, que actualiza la estructura del curso en localStorage

3. **Añadir secciones a cada tema** desde el editor de secciones:
   - Acceder a `admin/section-editor.html?topicId=Y` donde Y es el ID del tema
   - Seleccionar el tipo de sección a crear (texto, video, GeoGebra, actividad)
   - Utilizar las herramientas especializadas para crear el contenido
   - Organizar las secciones mediante la interfaz de arrastrar y soltar
   - Agrupar secciones relacionadas si es necesario
   - Guardar los cambios, que actualiza la estructura del tema en localStorage

4. **Crear actividades interactivas** integradas en las secciones:
   - Dentro del editor de secciones, seleccionar el tipo "Actividad"
   - Utilizar el creador de actividades para diseñar preguntas y respuestas
   - Configurar opciones de retroalimentación, intentos y puntuación
   - Previsualizar la actividad para verificar su funcionamiento
   - Guardar la actividad, que genera un ID único y la almacena en localStorage

5. **Revisar y refinar el contenido**:
   - Utilizar los previsualizadores para verificar cómo se verá el contenido
   - Navegar por el curso como lo haría un estudiante
   - Realizar ajustes en textos, actividades o estructura según sea necesario
   - Verificar la coherencia visual y pedagógica del curso completo

6. **Sincronizar y publicar**:
   - Desde el panel de administración, utilizar la herramienta de sincronización
   - Generar los archivos JSON actualizados con todo el contenido
   - Confirmar que los datos se han exportado correctamente
   - Actualizar el repositorio para hacer visible el contenido a los estudiantes

### Flujo de Datos Durante la Creación

```
Interfaz de Usuario → DataManager.saveData() → DataPersistence.saveData() → localStorage
                                                                          ↓
                                                                    (Sincronización)
                                                                          ↓
                                                                    Archivos JSON
                                                                          ↓
                                                                    Repositorio Git
                                                                          ↓
                                                                    Despliegue Netlify
```

## Consideraciones Técnicas

### Sistema de Persistencia Dual

- **localStorage como Almacenamiento Principal**:
  - Todos los datos se guardan primero en localStorage
  - Estructura organizada en `courseData.persistent` con objetos indexados por ID
  - Cambios no sincronizados se marcan en `courseData.unsynced`
  - Implementación de respaldo automático para prevenir pérdida de datos

- **Archivos JSON para Persistencia**:
  - Los datos se exportan a archivos JSON separados por tipo:
    - `courses.json`: Información de cursos
    - `topics.json`: Temas y su estructura
    - `activities.json`: Actividades interactivas
    - `settings.json`: Configuración del sitio
  - Se mantiene `courseData.json` para compatibilidad con versiones anteriores

- **Sincronización Inteligente**:
  - Sistema que detecta cambios no sincronizados
  - Generación de archivos JSON solo para los datos modificados
  - Interfaz de usuario para controlar el proceso de sincronización

### Compatibilidad con Netlify

- **Detección Automática de Entorno**:
  - El sistema detecta si está en producción (Netlify) o desarrollo local
  - Ajusta su comportamiento según el entorno detectado

- **Estrategias de Carga**:
  - En desarrollo: Usa exclusivamente localStorage
  - En producción: Carga desde JSON y sincroniza con localStorage

- **Rutas Relativas**:
  - Todas las rutas son relativas para garantizar la navegación correcta
  - Implementación de fallbacks para recursos no encontrados

- **Versiones Estáticas**:
  - Actividades con versiones estáticas para entorno de producción
  - Manejo especial de contenido dinámico en entorno estático

### Optimización de Rendimiento

- **Estrategias de Carga**:
  - Implementación de lazy loading para imágenes y contenido multimedia
  - Carga diferida de componentes no visibles inicialmente
  - Priorización de contenido visible (above the fold)

- **Optimización de Recursos**:
  - Compresión de imágenes y recursos multimedia
  - Uso de CDN para bibliotecas externas (Bootstrap, Font Awesome)
  - Minimización de solicitudes HTTP mediante consolidación

- **Rendimiento de JavaScript**:
  - Uso eficiente de localStorage con operaciones por lotes
  - Implementación de debouncing para operaciones frecuentes
  - Manejo optimizado de grandes conjuntos de datos

## Conclusión

Matemática Web es una plataforma educativa completa diseñada para crear y gestionar contenido matemático interactivo. Su arquitectura basada en cliente permite un funcionamiento ágil sin dependencia de servidores backend, mientras que su sistema de persistencia dual garantiza la compatibilidad con entornos estáticos como Netlify.

La plataforma combina:

- **Estructura jerárquica** de cursos, temas y secciones para una organización clara del contenido
- **Herramientas especializadas** para crear contenido matemático con soporte para ecuaciones, gráficos y actividades interactivas
- **Panel de administración intuitivo** que permite a educadores sin conocimientos técnicos crear experiencias de aprendizaje ricas
- **Sistema de persistencia robusto** que garantiza la seguridad de los datos y facilita su sincronización con el repositorio

El enfoque en la usabilidad, tanto para administradores como para estudiantes, junto con las herramientas especializadas para contenido matemático, hacen de Matemática Web una solución completa para la creación de recursos educativos digitales de alta calidad.
