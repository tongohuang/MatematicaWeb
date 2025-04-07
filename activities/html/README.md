# Actividades HTML

Esta carpeta contiene actividades HTML personalizadas que se pueden incrustar en las secciones de tipo "html".

## Estructura de archivos

Cada archivo HTML en esta carpeta debe ser una actividad completa y autónoma que se pueda cargar en un iframe.

## Cómo referenciar

Para referenciar una actividad HTML en una sección, simplemente usa el nombre del archivo como contenido de la sección:

```json
{
  "id": 1,
  "title": "Mi Actividad HTML",
  "type": "html",
  "content": "ejemplo.html"
}
```

Esto cargará el archivo `activities/html/ejemplo.html` en un iframe cuando se visualice la sección.
