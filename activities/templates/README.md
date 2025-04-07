# Plantillas de Actividades

Esta carpeta contiene plantillas para actividades interactivas que se pueden incrustar en las secciones de tipo "activity".

## Estructura de archivos

Cada archivo HTML en esta carpeta debe ser una plantilla de actividad que se pueda cargar en un iframe.

## Cómo referenciar

Para referenciar una plantilla de actividad en una sección, simplemente usa el nombre del archivo como contenido de la sección:

```json
{
  "id": 1,
  "title": "Mi Actividad Interactiva",
  "type": "activity",
  "content": "basic-exercise.html"
}
```

Esto cargará el archivo `activities/templates/basic-exercise.html` en un iframe cuando se visualice la sección.
