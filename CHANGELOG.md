# CHANGE LOG\nRegistro de cambios principales realizados en el proyecto WebMatematica\n\n## Formato\nCada entrada de cambio debe seguir el siguiente formato:\n\nFecha: [YYYY-MM-DD]\nAutor: [Nombre del Autor]\nTipo: [Nueva Característica/Corrección/Mejora]\nDescripción: [Descripción detallada del cambio]\nArchivos Modificados: [Lista de archivos principales modificados]\n\n## Cambios\n\n
Fecha: 2023-08-19
Autor: Admin
Tipo: Nueva Característica
Descripción: Implementación de visualización de secciones agrupadas en la vista de usuario. Ahora las secciones que fueron agrupadas en el panel de administración se muestran como una única unidad en la vista de usuario, compartiendo espacio visual y mostrando solo el nombre del grupo. Los contenidos se muestran sin separaciones por título, facilitando la experiencia educativa al combinar por ejemplo un video con su actividad correspondiente.
Archivos Modificados:
- topics/view.html: Modificación de la lógica de carga y visualización de secciones para soportar grupos
- css/section-editor.css: Adición de estilos para visualización de grupos de secciones

Fecha: 2023-08-18
Autor: Admin
Tipo: Nueva Característica
Descripción: Implementación de agrupación de secciones en el editor de temas, permitiendo agrupar múltiples secciones en una sola unidad visual y funcional. Esta característica mejora la organización del contenido educativo, facilitando la combinación de diferentes tipos de contenido como vídeos e interactividades.
Archivos Modificados:
- js/section-editor.js: Implementación de funciones para agrupar/desagrupar secciones
- admin/section-editor.html: Agregado de modales para la funcionalidad de agrupación
- css/admin.css: Estilos para la visualización de grupos de secciones


Fecha: 2025-04-04
Autor: Admin
Tipo: Nueva Característica
Descripción: Implementación de agrupación de secciones en el editor de temas, permitiendo agrupar múltiples secciones en una sola unidad visual y funcional.
Archivos Modificados: js/section-editor.js, admin/section-editor.html, js/data-manager.js


Fecha: 2025-04-04
Autor: Admin
Tipo: Nueva Característica
Descripción: Implementación de agrupación de secciones en el editor de temas, permitiendo agrupar múltiples secciones en una sola unidad visual y funcional.
Archivos Modificados: js/section-editor.js, admin/section-editor.html, js/data-manager.js


Fecha: 2025-04-04
Autor: Admin
Tipo: Nueva Característica
Descripción: Implementación de agrupación de secciones en el editor de temas, permitiendo agrupar múltiples secciones en una sola unidad visual y funcional. Se agregaron modales para la selección de secciones y nombramiento de grupos, además de estilos CSS para mejorar la visualización.
Archivos Modificados:
- js/section-editor.js: Implementación de funciones para agrupar/desagrupar secciones
- admin/section-editor.html: Agregado de modales para la funcionalidad de agrupación
- css/admin.css: Estilos para la visualización de grupos de secciones

## [0.2.0] - 2024-07-29
### Mejorado
- **Editor de Texto (Secciones):** Se rediseñó la barra de herramientas del editor de texto enriquecido.
  - Se reemplazaron los botones de texto por iconos de Font Awesome para una interfaz más limpia.
  - Se mejoró el estilo de los botones, incluyendo estados hover y activo.
  - Se añadió CSS dinámico para controlar la apariencia y posicionamiento de los menús desplegables (color, símbolos matemáticos).
  - Se ampliaron las opciones de símbolos matemáticos disponibles en el menú desplegable.
  - Se aseguró la funcionalidad de todos los botones de la barra de herramientas.
  - Se agregó renderizado automático de ecuaciones MathJax existentes al cargar contenido.
  - **Archivos Editados:** `js/math-editor.js`


