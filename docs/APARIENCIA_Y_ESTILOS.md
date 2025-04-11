# APARIENCIA Y ESTILOS - MATEMÁTICA WEB

## Introducción

Este documento describe la apariencia visual y los estilos utilizados en el proyecto Matemática Web. Se detallan los archivos CSS principales, la paleta de colores, los componentes visuales y las consideraciones de diseño para mantener una experiencia de usuario coherente y atractiva en todos los dispositivos y entornos.

## Estructura de Archivos CSS

El proyecto utiliza varios archivos CSS organizados según su función para mantener una estructura modular y facilitar el mantenimiento:

| Archivo | Descripción |
|---------|-------------|
| `main.css` | Estilos generales del sitio, layout y componentes principales |
| `admin.css` | Estilos específicos para el panel de administración |
| `components.css` | Estilos para componentes reutilizables en todo el sitio |
| `activities.css` | Estilos para actividades interactivas y sus elementos |
| `course-editor.css` | Estilos específicos para el editor de cursos |
| `selectors.css` | Estilos para selectores de colores e iconos en formularios |
| `text-editor.css` | Estilos para el editor de texto enriquecido con soporte para ecuaciones |
| `activity-creator.css` | Estilos para el creador y editor de actividades |

## Organización de Estilos

### Enfoque de Diseño

El proyecto sigue un enfoque de diseño modular con estas características:

1. **Mobile-First**: Diseño optimizado primero para dispositivos móviles y luego adaptado a pantallas más grandes
2. **Componentes Reutilizables**: Elementos visuales consistentes que se utilizan en todo el sitio
3. **Variables CSS**: Uso de variables para colores, espaciados y tipografía para mantener consistencia
4. **Compatibilidad con Modo Oscuro**: Soporte para preferencias de color del sistema mediante `prefers-color-scheme`

## Paleta de Colores

### Colores Principales
- **Azul primario**: `#007bff` - Utilizado para elementos principales, botones de acción y enlaces
- **Gris claro**: `#f8f9fa` - Fondo de encabezados, pies de página y contenedores secundarios
- **Blanco**: `#fff` - Fondo principal de contenido
- **Gris oscuro**: `#343a40` - Texto principal
- **Gris medio**: `#6c757d` - Texto secundario y elementos desactivados

### Colores de Estado
- **Éxito**: `#28a745` - Confirmaciones y acciones exitosas
- **Advertencia**: `#ffc107` - Alertas y advertencias
- **Peligro**: `#dc3545` - Errores y acciones destructivas
- **Info**: `#17a2b8` - Mensajes informativos

### Colores Personalizables
- Los cursos pueden tener colores personalizados que se aplican a sus tarjetas y encabezados
- Se garantiza la legibilidad del texto mediante el uso de colores de texto contrastantes

## Componentes Visuales

### Tarjetas de Curso

Las tarjetas de curso son un elemento central del diseño y utilizan un estilo consistente con:
- Bordes redondeados (`border-radius: 8px`)
- Sombras sutiles (`box-shadow: 0 2px 10px rgba(0,0,0,0.1)`)
- Efecto de elevación al pasar el cursor (`transform: translateY(-5px)`)
- Cabecera con imagen o icono con color de fondo personalizable
- Contenido con título, descripción y estadísticas
- Diseño flexible que se adapta a diferentes tamaños de pantalla

```css
.course-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    background-color: white;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.course-header {
    height: 120px;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.course-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: white;
    font-size: 3rem;
}
```

### Botones y Controles

Los botones siguen un estilo consistente en toda la plataforma:
- Bordes redondeados (`border-radius: 5px`)
- Padding adecuado (`padding: 8px 16px`)
- Fuente semi-negrita (`font-weight: 500`)
- Iconos de Font Awesome para mejorar la comprensión visual
- Estados hover y active con transiciones suaves
- Variantes de color según su función (primario, secundario, éxito, peligro)

```css
.btn {
    border-radius: 5px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
```

### Contenedores de Sección

Los contenedores de sección utilizan un diseño que enfatiza la legibilidad y organización del contenido:
- Fondo blanco para maximizar el contraste con el texto
- Bordes sutiles para delimitar el contenido
- Sombras ligeras para dar profundidad y jerarquía visual
- Espaciado interno consistente para mejorar la legibilidad
- Cabeceras distintivas con iconos y numeración

```css
.section-content {
    background: white;
    border: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    padding: 20px;
    margin-bottom: 20px;
}

.section-header {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    transition: background-color 0.2s;
}

.section-number {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #0d6efd;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    margin-right: 15px;
}
```

## Panel de Administración

El panel de administración tiene un diseño específico optimizado para la gestión de contenido educativo:

### Encabezado Administrativo

El encabezado del panel administrativo proporciona contexto y navegación global:

```css
.admin-header {
    background-color: #f8f9fa;
    padding: 1rem 0;
    margin-bottom: 2rem;
    border-bottom: 1px solid #ddd;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.admin-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

### Navegación Administrativa

La navegación del panel administrativo utiliza un sistema de pestañas intuitivo:

```css
.admin-nav .nav-link {
    color: #495057;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    transition: all 0.2s;
}

.admin-nav .nav-link.active {
    background-color: #007bff;
    color: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.admin-nav .nav-link:hover:not(.active) {
    background-color: #e9ecef;
}
```

### Tarjetas de Estadísticas

Las tarjetas de estadísticas proporcionan información rápida sobre el contenido del sitio:

```css
.stats-card {
    background-color: white;
    border-radius: 0.25rem;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 1.5rem;
    text-align: center;
    transition: transform 0.3s;
}

.stats-card:hover {
    transform: translateY(-5px);
}

.stats-card .stats-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #007bff;
}
```

## Actividades Interactivas

Las actividades interactivas tienen un diseño especial que enfatiza la usabilidad y la claridad:

### Contenedor Principal

```css
.activity-container {
    width: 100%;
    min-height: 500px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    margin: 20px 0;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
}
```

### Encabezado de Actividad

El encabezado proporciona contexto y muestra el progreso:

```css
.activity-header {
    padding: 15px 20px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.activity-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
}

.activity-progress {
    font-size: 1rem;
    color: #6c757d;
    font-weight: 500;
}
```

### Opciones de Preguntas

Las opciones de respuesta tienen un diseño intuitivo con estados visuales claros:

```css
.options-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.option {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.option:hover {
    background-color: #e9ecef;
    transform: translateX(5px);
}

.option.selected {
    background-color: #e7f1ff;
    border-color: #0d6efd;
}

.option.correct {
    background-color: rgba(40, 167, 69, 0.1);
    border-color: #28a745;
}

.option.incorrect {
    background-color: rgba(220, 53, 69, 0.1);
    border-color: #dc3545;
}
```

## Editor de Texto

El editor de texto enriquecido es una herramienta fundamental para crear contenido educativo con soporte para ecuaciones matemáticas:

### Barra de Herramientas

```css
.text-editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    padding: 8px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
}

.text-editor-toolbar button {
    width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s;
}

.text-editor-toolbar button:hover {
    background-color: #e9ecef;
}

.text-editor-toolbar button.active {
    background-color: #e7f1ff;
    border-color: #0d6efd;
    color: #0d6efd;
}
```

### Área de Edición

```css
.text-editor-content {
    min-height: 200px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 0 0 4px 4px;
    background-color: #fff;
    color: #212529;
    overflow-y: auto;
    line-height: 1.6;
    font-size: 1rem;
}

/* Estilos para ecuaciones matemáticas */
.math-equation {
    display: inline-block;
    padding: 2px 5px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    margin: 0 2px;
}
```

### Soporte para Modo Oscuro

```css
@media (prefers-color-scheme: dark) {
    .text-editor-toolbar,
    .equation-preview {
        background-color: #343a40;
        color: #f8f9fa;
    }

    .text-editor-content,
    .equation-modal-content {
        background-color: #212529;
        color: #f8f9fa;
    }

    .math-equation {
        background-color: #2b3035;
        border-color: #495057;
    }
}
```

## Diseño Responsivo

El sitio implementa un diseño completamente responsivo que se adapta a diferentes dispositivos y tamaños de pantalla:

### Sistema de Grid Flexible

```css
.courses-grid, .activities-grid, .resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px 0;
}

/* Ajustes para dispositivos móviles */
@media (max-width: 768px) {
    .courses-grid, .activities-grid, .resources-grid {
        grid-template-columns: 1fr;
    }

    .course-header {
        height: 100px;
    }

    .admin-header h1 {
        font-size: 1.25rem;
    }
}
```

### Navegación Adaptativa

```css
/* Menú de navegación colapsable */
.navbar-collapse {
    transition: all 0.3s ease;
}

/* Ajustes para paneles laterales */
.course-sidebar {
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
}

@media (max-width: 992px) {
    .course-sidebar {
        position: static;
        max-height: none;
    }
}
```

## Animaciones y Transiciones

Se utilizan animaciones y transiciones sutiles para mejorar la experiencia del usuario sin comprometer el rendimiento:

### Transiciones Suaves

```css
/* Transición general para elementos interactivos */
.btn, .nav-link, .course-card, .activity-item, .section-header {
    transition: all 0.2s ease-in-out;
}

/* Animación de entrada */
.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Animación de carga */
.spinner-border {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

## Componentes Especializados

### Gestor de Actividades

El gestor de actividades utiliza un diseño de tarjetas con indicadores visuales claros:

```css
.activity-card {
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s;
    margin-bottom: 10px;
}

/* Indicador visual para actividades en uso */
.activity-card[data-in-use="true"] {
    border-left: 4px solid #198754; /* verde para actividades en uso */
}

/* Indicador visual para actividades sin usar */
.activity-card[data-in-use="false"] {
    border-left: 4px solid #6c757d; /* gris para actividades sin usar */
}

.activity-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
}
```

### Creador de Actividades

El creador de actividades utiliza un diseño intuitivo para facilitar la creación de contenido educativo:

```css
.activity-type-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.activity-type-option {
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    height: 100%;
}

.activity-type-option:hover {
    border-color: #0d6efd;
    background-color: #f8f9fa;
}

.activity-type-option.selected {
    border-color: #0d6efd;
    background-color: #e7f1ff;
}
```

## Consideraciones para Implementación

1. **Consistencia Visual**: Mantener la coherencia en colores, espaciado y tipografía en todas las páginas para crear una experiencia unificada.

2. **Accesibilidad**:
   - Asegurar suficiente contraste entre texto y fondo (relación mínima de 4.5:1)
   - Utilizar tamaños de fuente legibles (mínimo 16px para texto principal)
   - Implementar elementos interactivos claramente identificables
   - Incluir atributos ARIA para mejorar la compatibilidad con lectores de pantalla

3. **Rendimiento**:
   - Minimizar el uso de sombras complejas y animaciones en dispositivos de gama baja
   - Optimizar imágenes y recursos multimedia
   - Implementar carga diferida (lazy loading) para contenido fuera de la vista inicial

4. **Compatibilidad**:
   - Probar en diferentes navegadores (Chrome, Firefox, Safari, Edge)
   - Verificar la experiencia en diferentes dispositivos y tamaños de pantalla
   - Utilizar prefijos de proveedor para propiedades CSS experimentales

5. **Personalización**:
   - Permitir la personalización de colores de cursos manteniendo la legibilidad del texto
   - Implementar validación de contraste para colores personalizados
   - Ofrecer opciones predefinidas para garantizar la coherencia visual

## Integración con Bibliotecas Externas

El proyecto integra varias bibliotecas externas para mejorar la funcionalidad y apariencia:

- **Bootstrap 5**: Framework CSS base para layout y componentes
  - Proporciona un sistema de grid responsivo
  - Ofrece componentes prediseñados (botones, tarjetas, navegación)
  - Incluye utilidades CSS para espaciado, flexbox y más

- **Font Awesome 6**: Biblioteca de iconos vectoriales
  - Proporciona iconografía consistente en todo el sitio
  - Ofrece variantes de estilo (regular, solid, light)
  - Permite personalizar tamaño y color de los iconos

- **MathJax/MathQuill**: Bibliotecas para renderizado de ecuaciones matemáticas
  - Permiten la visualización de notación matemática compleja
  - Soportan sintaxis LaTeX para ecuaciones
  - Ofrecen herramientas interactivas para edición de ecuaciones

## Conclusión

La apariencia visual de Matemática Web está diseñada para ser limpia, profesional y enfocada en el contenido educativo. El diseño prioriza la legibilidad, usabilidad y accesibilidad, creando una experiencia de usuario coherente y atractiva en todos los dispositivos.

Los estilos están organizados modularmente para facilitar el mantenimiento y las actualizaciones futuras, siguiendo buenas prácticas de desarrollo front-end. La combinación de componentes personalizados con bibliotecas externas proporciona una base sólida para una plataforma educativa moderna y funcional.
