# Herramientas para Matemática Web

Este directorio contiene herramientas útiles para el mantenimiento y gestión del sitio Matemática Web.

## Generador de índices de recursos

Esta herramienta escanea las carpetas de recursos (HTML, PDF, imágenes) y genera archivos `index.json` con la información de los archivos encontrados. Estos índices son utilizados por el administrador de recursos para mostrar los archivos disponibles y por el editor de secciones para proporcionar selectores al crear secciones de tipo HTML, PDF o imagen.

### Uso

#### Windows

Ejecute el archivo batch `generate_indexes.bat`:

```
tools\generate_indexes.bat
```

Este script intentará ejecutar automáticamente el generador de índices utilizando Python o Node.js, dependiendo de cuál esté disponible en su sistema.

#### Python

Si tiene Python instalado, puede ejecutar el script directamente:

```
python tools/generate_resource_indexes.py
```

Para obtener información detallada durante la ejecución, use la opción `--verbose` o `-v`:

```
python tools/generate_resource_indexes.py --verbose
```

#### Node.js

Si tiene Node.js instalado, puede ejecutar el script JavaScript:

```
node tools/generate_resource_indexes.js
```

Para obtener información detallada durante la ejecución, use la opción `--verbose` o `-v`:

```
node tools/generate_resource_indexes.js --verbose
```

### Estructura de los archivos de índice

Los archivos de índice generados (`index.json`) tienen la siguiente estructura:

```json
{
  "files": [
    {
      "name": "nombre_archivo.ext",
      "size": 12345,
      "lastModified": "2023-09-15T12:00:00Z"
    },
    ...
  ],
  "lastUpdated": "2023-09-15T12:00:00Z"
}
```

Donde:
- `files`: Lista de archivos encontrados en la carpeta
  - `name`: Nombre del archivo
  - `size`: Tamaño del archivo en bytes
  - `lastModified`: Fecha de última modificación del archivo en formato ISO
- `lastUpdated`: Fecha de generación del índice en formato ISO

### Carpetas escaneadas

La herramienta escanea las siguientes carpetas:

- `activities/html`: Archivos HTML para secciones de tipo HTML
- `activities/pdf`: Archivos PDF para secciones de tipo PDF
- `activities/images`: Archivos de imagen para secciones de tipo imagen

### Notas

- La herramienta creará las carpetas si no existen
- Los archivos `index.json` existentes serán sobrescritos
- La herramienta ignora subcarpetas y el propio archivo `index.json`

## Flujo de trabajo recomendado

1. Coloque sus archivos HTML, PDF e imágenes en las carpetas correspondientes
2. Ejecute el generador de índices para actualizar los archivos `index.json`
3. Abra el administrador de recursos (`/admin/resource-manager.html`) para verificar que los archivos se muestren correctamente
4. Utilice el editor de secciones (`/admin/section-editor.html`) para crear secciones utilizando los recursos disponibles
