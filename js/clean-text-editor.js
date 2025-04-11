/**
 * Editor de texto limpio para WebMatematica
 *
 * Este editor reemplaza al editor matemático anterior y proporciona una interfaz
 * más simple y estable para editar contenido de texto con formato.
 */

// Variable global para mantener referencia al editor
window.cleanTextEditor = null;

/**
 * Inicializa el editor de texto limpio
 * @param {string} targetId - ID del textarea que se convertirá en editor
 * @returns {boolean} - true si se inicializó correctamente, false en caso contrario
 */
function initCleanTextEditor(targetId) {
    console.log(`Inicializando editor de texto limpio para: ${targetId}`);

    // Verificar que existe el textarea
    const textarea = document.getElementById(targetId);
    if (!textarea) {
        console.error(`No se encontró el textarea con ID: ${targetId}`);
        return false;
    }

    try {
        // Limpiar cualquier instancia previa
        cleanupEditor();

        // Crear el contenedor para el editor
        const editorContainer = document.createElement('div');
        editorContainer.className = 'clean-text-editor-container';
        editorContainer.style.border = '1px solid #ced4da';
        editorContainer.style.borderRadius = '0.25rem';
        editorContainer.style.marginBottom = '1rem';

        // Crear la barra de herramientas
        const toolbar = createToolbar();
        editorContainer.appendChild(toolbar);

        // Crear el área editable
        const editorContent = document.createElement('div');
        editorContent.id = 'cleanTextEditorContent';
        editorContent.className = 'clean-text-editor-content';
        editorContent.contentEditable = true;
        editorContent.style.padding = '10px';
        editorContent.style.minHeight = '200px';
        editorContent.style.outline = 'none';

        // Guardar referencia al textarea asociado
        editorContent.dataset.targetTextareaId = targetId;

        // Establecer el contenido inicial desde el textarea
        editorContent.innerHTML = textarea.value || '';

        // Añadir el área editable al contenedor
        editorContainer.appendChild(editorContent);

        // Insertar el editor antes del textarea
        textarea.parentNode.insertBefore(editorContainer, textarea);

        // Ocultar el textarea original
        textarea.style.display = 'none';

        // Guardar referencia global al editor
        window.cleanTextEditor = editorContent;

        // Inicializar eventos
        initEditorEvents(editorContent, textarea);

        // Añadir estilos
        addEditorStyles();

        console.log('Editor de texto limpio inicializado correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar el editor de texto limpio:', error);
        return false;
    }
}

/**
 * Crea la barra de herramientas del editor
 * @returns {HTMLElement} - El elemento de la barra de herramientas
 */
function createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'clean-text-editor-toolbar';
    toolbar.style.backgroundColor = '#f8f9fa';
    toolbar.style.borderBottom = '1px solid #ced4da';
    toolbar.style.padding = '8px';
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '5px';

    // HTML para la barra de herramientas
    toolbar.innerHTML = `
        <!-- Formato de texto -->
        <div class="toolbar-group">
            <button type="button" class="editor-btn" data-command="bold" title="Negrita">
                <i class="fas fa-bold"></i>
            </button>
            <button type="button" class="editor-btn" data-command="italic" title="Cursiva">
                <i class="fas fa-italic"></i>
            </button>
            <button type="button" class="editor-btn" data-command="underline" title="Subrayado">
                <i class="fas fa-underline"></i>
            </button>
            <button type="button" class="editor-btn" id="textColorBtn" title="Color de texto">
                <i class="fas fa-palette"></i>
            </button>
            <button type="button" class="editor-btn" id="fontSizeBtn" title="Tamaño de letra">
                <i class="fas fa-text-height"></i>
            </button>
        </div>

        <!-- Listas -->
        <div class="toolbar-group">
            <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Lista con viñetas">
                <i class="fas fa-list-ul"></i>
            </button>
            <button type="button" class="editor-btn" data-command="insertOrderedList" title="Lista numerada">
                <i class="fas fa-list-ol"></i>
            </button>
        </div>

        <!-- Alineación -->
        <div class="toolbar-group">
            <button type="button" class="editor-btn" data-command="justifyLeft" title="Alinear a la izquierda">
                <i class="fas fa-align-left"></i>
            </button>
            <button type="button" class="editor-btn" data-command="justifyCenter" title="Centrar">
                <i class="fas fa-align-center"></i>
            </button>
            <button type="button" class="editor-btn" data-command="justifyRight" title="Alinear a la derecha">
                <i class="fas fa-align-right"></i>
            </button>
        </div>

        <!-- Tablas -->
        <div class="toolbar-group">
            <button type="button" class="editor-btn" id="insertTableBtn" title="Insertar tabla">
                <i class="fas fa-table"></i>
            </button>
        </div>

        <!-- Expresiones matemáticas -->
        <div class="toolbar-group">
            <button type="button" class="editor-btn" id="mathExpressionBtn" title="Insertar expresión matemática">
                <i class="fas fa-square-root-alt"></i>
            </button>
        </div>
    `;

    return toolbar;
}

/**
 * Inicializa los eventos del editor
 * @param {HTMLElement} editorContent - El elemento del editor
 * @param {HTMLElement} textarea - El textarea asociado
 */
function initEditorEvents(editorContent, textarea) {
    // Sincronizar con el textarea cuando cambia el contenido
    editorContent.addEventListener('input', function() {
        textarea.value = editorContent.innerHTML;
    });

    // Inicializar eventos para los botones de formato
    const formatButtons = document.querySelectorAll('.editor-btn[data-command]');
    formatButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const command = this.dataset.command;
            if (!command) return;

            // Enfocar el editor antes de aplicar el comando
            editorContent.focus();

            // Aplicar el comando
            document.execCommand(command, false, null);

            // Actualizar el estado de los botones
            updateButtonStates();

            // Sincronizar con el textarea
            textarea.value = editorContent.innerHTML;
        });
    });

    // Inicializar el selector de color
    initColorPicker(editorContent, textarea);

    // Inicializar el botón de tabla
    initTableButton(editorContent, textarea);

    // Inicializar el botón de tamaño de letra
    initFontSizeButton(editorContent, textarea);

    // Inicializar el botón de expresiones matemáticas
    if (window.initMathExpressionButton) {
        window.initMathExpressionButton(editorContent, textarea);
    } else {
        console.warn('El editor de expresiones matemáticas no está disponible');
    }

    // Eventos para actualizar el estado de los botones
    editorContent.addEventListener('mouseup', updateButtonStates);
    editorContent.addEventListener('keyup', function(e) {
        const relevantKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Backspace', 'Delete'];
        if (relevantKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
            updateButtonStates();
        }
    });

    // Llamar a updateButtonStates una vez al inicio
    updateButtonStates();
}

/**
 * Actualiza el estado de los botones según el formato actual
 */
function updateButtonStates() {
    try {
        const formatButtons = document.querySelectorAll('.editor-btn[data-command]');
        formatButtons.forEach(button => {
            const command = button.dataset.command;
            if (!command) return;

            const isActive = document.queryCommandState(command);
            if (isActive) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('Error al actualizar estados de botones:', error);
    }
}

/**
 * Inicializa el selector de color
 * @param {HTMLElement} editorContent - El elemento del editor
 * @param {HTMLElement} textarea - El textarea asociado
 */
function initColorPicker(editorContent, textarea) {
    // Eliminar cualquier paleta existente
    const existingPalette = document.getElementById('colorPalette');
    if (existingPalette) {
        existingPalette.remove();
    }

    // Crear la paleta de colores
    const colorPalette = document.createElement('div');
    colorPalette.id = 'colorPalette';
    colorPalette.className = 'color-palette';
    colorPalette.style.position = 'absolute';
    colorPalette.style.zIndex = '9999';
    colorPalette.style.backgroundColor = '#fff';
    colorPalette.style.border = '1px solid #ced4da';
    colorPalette.style.borderRadius = '4px';
    colorPalette.style.padding = '12px';
    colorPalette.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
    colorPalette.style.display = 'none';
    colorPalette.style.width = '220px';

    // Título
    const title = document.createElement('div');
    title.textContent = 'Seleccionar color';
    title.style.fontSize = '14px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.style.textAlign = 'center';
    title.style.color = '#333';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '5px';
    colorPalette.appendChild(title);

    // Contenedor de colores
    const colorGrid = document.createElement('div');
    colorGrid.style.display = 'grid';
    colorGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
    colorGrid.style.gap = '6px';
    colorPalette.appendChild(colorGrid);

    // Colores
    const colors = [
        // Negros y grises
        '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
        '#FFFFFF',

        // Rojos
        '#FF0000', '#FF3333', '#CC0000', '#990000', '#FFCCCC',
        '#800000',

        // Naranjas
        '#FF8000', '#FF9933', '#CC6600', '#FFCC99',

        // Amarillos
        '#FFFF00', '#FFFF66', '#CCCC00', '#FFFFCC', '#808000',

        // Verdes
        '#00FF00', '#33FF33', '#00CC00', '#009900', '#CCFFCC',
        '#008000',

        // Turquesas
        '#00FFCC', '#33FFCC', '#00CCCC', '#CCFFFF', '#008080',

        // Azules
        '#0000FF', '#3333FF', '#0000CC', '#000099', '#CCCCFF',
        '#000080', '#00FFFF',

        // Morados
        '#8000FF', '#9933FF', '#6600CC', '#CC99FF', '#800080',

        // Rosas
        '#FF00FF', '#FF33FF', '#CC00CC', '#FFCCFF',

        // Marrones
        '#996633', '#CC9966', '#663300', '#FFCC99'
    ];

    // Variable para almacenar la selección
    let savedRange = null;

    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.style.width = '24px';
        colorOption.style.height = '24px';
        colorOption.style.backgroundColor = color;
        colorOption.style.cursor = 'pointer';
        colorOption.style.border = '1px solid #dee2e6';
        colorOption.style.borderRadius = '3px';
        // Añadir tooltip con el nombre del color
        const colorNames = {
            '#000000': 'Negro', '#333333': 'Gris oscuro', '#666666': 'Gris medio',
            '#999999': 'Gris claro', '#CCCCCC': 'Gris muy claro', '#FFFFFF': 'Blanco',
            '#FF0000': 'Rojo', '#FF3333': 'Rojo claro', '#CC0000': 'Rojo oscuro',
            '#990000': 'Rojo muy oscuro', '#FFCCCC': 'Rojo pastel', '#800000': 'Granate',
            '#FF8000': 'Naranja', '#FF9933': 'Naranja claro', '#CC6600': 'Naranja oscuro',
            '#FFCC99': 'Naranja pastel',
            '#FFFF00': 'Amarillo', '#FFFF66': 'Amarillo claro', '#CCCC00': 'Amarillo oscuro',
            '#FFFFCC': 'Amarillo pastel', '#808000': 'Oliva',
            '#00FF00': 'Verde', '#33FF33': 'Verde claro', '#00CC00': 'Verde oscuro',
            '#009900': 'Verde muy oscuro', '#CCFFCC': 'Verde pastel', '#008000': 'Verde bosque',
            '#00FFCC': 'Turquesa', '#33FFCC': 'Turquesa claro', '#00CCCC': 'Turquesa oscuro',
            '#CCFFFF': 'Turquesa pastel', '#008080': 'Verde azulado',
            '#0000FF': 'Azul', '#3333FF': 'Azul claro', '#0000CC': 'Azul oscuro',
            '#000099': 'Azul muy oscuro', '#CCCCFF': 'Azul pastel', '#000080': 'Azul marino',
            '#00FFFF': 'Cian',
            '#8000FF': 'Morado', '#9933FF': 'Morado claro', '#6600CC': 'Morado oscuro',
            '#CC99FF': 'Morado pastel', '#800080': 'Púrpura',
            '#FF00FF': 'Magenta', '#FF33FF': 'Rosa claro', '#CC00CC': 'Rosa oscuro',
            '#FFCCFF': 'Rosa pastel',
            '#996633': 'Marrón', '#CC9966': 'Marrón claro', '#663300': 'Marrón oscuro',
            '#FFCC99': 'Marrón pastel'
        };

        colorOption.title = colorNames[color.toUpperCase()] || color;

        // Borde para colores claros
        if (color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#ffffcc' || color.toLowerCase() === '#ffcccc' ||
            color.toLowerCase() === '#ccffcc' || color.toLowerCase() === '#ccffff' || color.toLowerCase() === '#ccccff' ||
            color.toLowerCase() === '#ffccff') {
            colorOption.style.border = '1px solid #ccc';
        }

        // Evento para aplicar el color
        colorOption.addEventListener('click', function() {
            // Enfocar el editor
            editorContent.focus();

            // Restaurar la selección guardada si existe
            if (savedRange) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(savedRange);
            }

            // Aplicar el color
            document.execCommand('foreColor', false, color);

            // Sincronizar con el textarea
            textarea.value = editorContent.innerHTML;

            // Ocultar la paleta
            colorPalette.style.display = 'none';
        });

        colorGrid.appendChild(colorOption);
    });

    // Instrucción
    const instruction = document.createElement('div');
    instruction.textContent = 'Haga clic para aplicar color';
    instruction.style.marginTop = '10px';
    instruction.style.paddingTop = '8px';
    instruction.style.borderTop = '1px solid #eee';
    instruction.style.fontSize = '12px';
    instruction.style.color = '#666';
    instruction.style.textAlign = 'center';
    instruction.style.fontStyle = 'italic';
    colorPalette.appendChild(instruction);

    // Añadir al DOM
    document.body.appendChild(colorPalette);

    // Configurar el botón de color
    const colorBtn = document.getElementById('textColorBtn');
    if (colorBtn) {
        colorBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Guardar la selección actual
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }

            // Posicionar la paleta cerca del botón
            const buttonRect = colorBtn.getBoundingClientRect();
            colorPalette.style.top = (buttonRect.bottom + window.scrollY + 5) + 'px';
            colorPalette.style.left = (buttonRect.left + window.scrollX) + 'px';

            // Mostrar la paleta
            colorPalette.style.display = 'block';
        });
    }

    // Cerrar la paleta al hacer clic fuera de ella
    document.addEventListener('click', function(e) {
        if (colorPalette.style.display === 'block' &&
            !colorPalette.contains(e.target) &&
            e.target.id !== 'textColorBtn' &&
            !e.target.closest('#textColorBtn')) {
            colorPalette.style.display = 'none';
        }
    });

    // Asegurarse de que la paleta se cierre cuando se cierra el editor
    window.addEventListener('beforeunload', function() {
        colorPalette.remove();
    });
}

/**
 * Esta función ya no se usa, ha sido integrada en initColorPicker
 */
function createColorPalette_DEPRECATED() {
    // Eliminar paleta existente si hay
    const existingPalette = document.getElementById('colorPalette');
    if (existingPalette) {
        existingPalette.remove();
    }

    // Crear la paleta
    const colorPalette = document.createElement('div');
    colorPalette.id = 'colorPalette';
    colorPalette.className = 'color-palette';
    colorPalette.style.position = 'absolute';
    colorPalette.style.zIndex = '9999';
    colorPalette.style.backgroundColor = '#fff';
    colorPalette.style.border = '1px solid #ced4da';
    colorPalette.style.borderRadius = '4px';
    colorPalette.style.padding = '10px';
    colorPalette.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
    colorPalette.style.display = 'none';
    colorPalette.style.width = '160px';

    // Agregar estilo para la clase show
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .color-palette.show {
            display: block !important;
        }
    `;
    document.head.appendChild(styleElement);

    // Título
    const title = document.createElement('div');
    title.textContent = 'Seleccionar color';
    title.style.fontSize = '14px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.style.textAlign = 'center';
    title.style.color = '#333';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '5px';
    colorPalette.appendChild(title);

    // Contenedor de colores
    const colorGrid = document.createElement('div');
    colorGrid.style.display = 'grid';
    colorGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    colorGrid.style.gap = '5px';
    colorPalette.appendChild(colorGrid);

    // Colores
    const colors = [
        '#000000', '#434343', '#666666', '#999999', '#b7b7b7',
        '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
        '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00',
        '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
        '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3',
        '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'
    ];

    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.style.width = '22px';
        colorOption.style.height = '22px';
        colorOption.style.backgroundColor = color;
        colorOption.style.cursor = 'pointer';
        colorOption.style.border = '1px solid #dee2e6';
        colorOption.style.borderRadius = '3px';
        colorOption.style.transition = 'transform 0.1s ease';
        colorOption.title = color;

        // Borde para colores claros
        if (color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#f3f3f3' || color.toLowerCase() === '#efefef') {
            colorOption.style.border = '1px solid #ccc';
        }

        // Evento para aplicar el color
        colorOption.addEventListener('click', function() {
            // Obtener el editor
            const editorContent = document.getElementById('cleanTextEditorContent');
            if (!editorContent) {
                console.error('No se encontró el editor de texto');
                return;
            }

            // Enfocar el editor
            editorContent.focus();

            // Intentar restaurar la selección guardada
            let selectionRestored = false;

            try {
                // Verificar si hay una selección guardada en la paleta
                if (colorPalette.dataset.savedSelection) {
                    try {
                        const savedSelData = JSON.parse(colorPalette.dataset.savedSelection);

                        // Obtener la selección actual
                        const selection = window.getSelection();

                        // Si no hay texto seleccionado, intentar usar la selección guardada
                        if (selection.toString().trim() === '') {
                            // Intentar restaurar usando la función restoreSelection
                            const savedSel = saveSelection(); // Obtener la estructura actual
                            if (savedSel && savedSel.range) {
                                selectionRestored = restoreSelection(savedSel);
                            }
                        } else {
                            // Ya hay una selección activa, usarla
                            selectionRestored = true;
                        }
                    } catch (e) {
                        console.warn('Error al restaurar la selección guardada:', e);
                    }
                }
            } catch (e) {
                console.warn('Error al procesar la selección guardada:', e);
            }

            // Si no se pudo restaurar la selección, intentar seleccionar algo
            if (!selectionRestored) {
                try {
                    // Intentar obtener la posición del cursor
                    const selection = window.getSelection();
                    if (selection.rangeCount === 0) {
                        // Crear un nuevo rango en la posición actual
                        const range = document.createRange();
                        range.setStart(editorContent, 0);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                } catch (e) {
                    console.warn('No se pudo crear una selección:', e);
                }
            }

            // Aplicar el color
            document.execCommand('foreColor', false, color);

            // Sincronizar con el textarea
            const targetId = editorContent.dataset.targetTextareaId;
            if (targetId) {
                const textarea = document.getElementById(targetId);
                if (textarea) {
                    textarea.value = editorContent.innerHTML;
                }
            }

            // Ocultar la paleta
            colorPalette.style.display = 'none';
            colorPalette.classList.remove('show');
            console.log('Ocultando paleta de colores');

            // Limpiar la selección guardada
            delete colorPalette.dataset.savedSelection;
        });

        // Efecto hover
        colorOption.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 0 3px rgba(0, 0, 0, 0.2)';
        });

        colorOption.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });

        colorGrid.appendChild(colorOption);
    });

    // Instrucción
    const instruction = document.createElement('div');
    instruction.textContent = 'Haga clic para aplicar color';
    instruction.style.marginTop = '8px';
    instruction.style.paddingTop = '8px';
    instruction.style.borderTop = '1px solid #eee';
    instruction.style.fontSize = '12px';
    instruction.style.color = '#666';
    instruction.style.textAlign = 'center';
    colorPalette.appendChild(instruction);

    // Cerrar la paleta al hacer clic fuera de ella
    document.addEventListener('click', function(e) {
        const palette = document.getElementById('colorPalette');
        if (!palette) return;

        if ((palette.classList.contains('show') || palette.style.display === 'block') &&
            !palette.contains(e.target) &&
            e.target.id !== 'textColorBtn' &&
            !e.target.closest('#textColorBtn')) {
            console.log('Cerrando paleta por clic fuera');
            palette.style.display = 'none';
            palette.classList.remove('show');
        }
    }, true);

    // Añadir al DOM
    document.body.appendChild(colorPalette);
}

/**
 * Inicializa el botón de tabla
 * @param {HTMLElement} editorContent - El elemento del editor
 * @param {HTMLElement} textarea - El textarea asociado
 */
function initTableButton(editorContent, textarea) {
    const tableBtn = document.getElementById('insertTableBtn');
    if (tableBtn) {
        tableBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Guardar la selección actual
            let savedRange = null;
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }

            // Eliminar modal existente si hay
            const existingModal = document.getElementById('tableModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Crear el modal para configurar la tabla
            const modal = document.createElement('div');
            modal.id = 'tableModal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';

            // Contenido del modal
            modal.innerHTML = `
                <div style="background-color: #fff; border-radius: 5px; padding: 20px; width: 400px; max-width: 90%; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; font-size: 18px;">Insertar tabla</h3>
                        <button id="closeTableModal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">&times;</button>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label for="tableRows" style="display: block; margin-bottom: 5px; font-weight: bold;">Filas:</label>
                        <input type="number" id="tableRows" min="1" max="20" value="3" style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label for="tableCols" style="display: block; margin-bottom: 5px; font-weight: bold;">Columnas:</label>
                        <input type="number" id="tableCols" min="1" max="10" value="3" style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;">
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button id="cancelTableBtn" style="padding: 8px 15px; border: 1px solid #ced4da; background-color: #f8f9fa; border-radius: 4px; cursor: pointer;">Cancelar</button>
                        <button id="confirmTableBtn" style="padding: 8px 15px; border: none; background-color: #0d6efd; color: white; border-radius: 4px; cursor: pointer;">Insertar</button>
                    </div>
                </div>
            `;

            // Añadir el modal al DOM
            document.body.appendChild(modal);

            // Enfocar el input de filas
            setTimeout(() => {
                document.getElementById('tableRows').focus();
            }, 100);

            // Manejar el cierre del modal
            document.getElementById('closeTableModal').addEventListener('click', function() {
                modal.remove();
            });

            document.getElementById('cancelTableBtn').addEventListener('click', function() {
                modal.remove();
            });

            // Manejar la inserción de la tabla
            document.getElementById('confirmTableBtn').addEventListener('click', function() {
                // Obtener filas y columnas
                const rows = parseInt(document.getElementById('tableRows').value) || 3;
                const cols = parseInt(document.getElementById('tableCols').value) || 3;

                // Validar límites
                const validRows = Math.min(Math.max(rows, 1), 20);
                const validCols = Math.min(Math.max(cols, 1), 10);

                // Generar HTML de la tabla
                let tableHTML = `<table style="width:100%; border-collapse:collapse; margin:10px 0;">`;

                // Generar filas y columnas
                for (let i = 0; i < validRows; i++) {
                    tableHTML += `<tr>`;
                    for (let j = 0; j < validCols; j++) {
                        tableHTML += `<td style="border:1px solid #ced4da; padding:8px;"></td>`;
                    }
                    tableHTML += `</tr>`;
                }

                tableHTML += `</table>`;

                // Insertar la tabla en el editor
                editorContent.focus();

                // Restaurar la selección guardada si existe
                if (savedRange) {
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(savedRange);
                }

                document.execCommand('insertHTML', false, tableHTML);

                // Sincronizar con el textarea
                textarea.value = editorContent.innerHTML;

                // Cerrar el modal
                modal.remove();
            });

            // Cerrar el modal al hacer clic fuera
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // Permitir cerrar con Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.getElementById('tableModal')) {
                    modal.remove();
                }
            });
        });
    }
}

/**
 * Inicializa el botón de tamaño de letra
 * @param {HTMLElement} editorContent - El elemento del editor
 * @param {HTMLElement} textarea - El textarea asociado
 */
function initFontSizeButton(editorContent, textarea) {
    // Eliminar paleta existente si hay
    const existingPalette = document.getElementById('fontSizePalette');
    if (existingPalette) {
        existingPalette.remove();
    }

    // Crear la paleta de tamaños
    const fontSizePalette = document.createElement('div');
    fontSizePalette.id = 'fontSizePalette';
    fontSizePalette.style.position = 'absolute';
    fontSizePalette.style.zIndex = '9999';
    fontSizePalette.style.backgroundColor = '#fff';
    fontSizePalette.style.border = '1px solid #ced4da';
    fontSizePalette.style.borderRadius = '4px';
    fontSizePalette.style.padding = '12px';
    fontSizePalette.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
    fontSizePalette.style.display = 'none';
    fontSizePalette.style.width = '220px';

    // Título
    const title = document.createElement('div');
    title.textContent = 'Seleccionar tamaño de letra';
    title.style.fontSize = '14px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.style.textAlign = 'center';
    title.style.color = '#333';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '5px';
    fontSizePalette.appendChild(title);

    // Contenedor de tamaños
    const sizeGrid = document.createElement('div');
    sizeGrid.style.display = 'grid';
    sizeGrid.style.gridTemplateColumns = '1fr';
    sizeGrid.style.gap = '6px';
    fontSizePalette.appendChild(sizeGrid);

    // Variable para almacenar la selección
    let savedRange = null;

    // Tamaños de letra
    const sizes = [
        { value: '1', label: 'Muy pequeño', size: '10px' },
        { value: '2', label: 'Pequeño', size: '13px' },
        { value: '3', label: 'Normal', size: '16px' },
        { value: '4', label: 'Mediano', size: '18px' },
        { value: '5', label: 'Grande', size: '24px' },
        { value: '6', label: 'Muy grande', size: '32px' },
        { value: '7', label: 'Extra grande', size: '48px' }
    ];

    sizes.forEach(size => {
        const sizeOption = document.createElement('div');
        sizeOption.style.padding = '8px 10px';
        sizeOption.style.cursor = 'pointer';
        sizeOption.style.borderRadius = '3px';
        sizeOption.style.fontSize = size.size;
        sizeOption.textContent = size.label;
        sizeOption.title = `Tamaño ${size.label}`;

        // Efecto hover
        sizeOption.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f0f0f0';
        });

        sizeOption.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
        });

        // Evento para aplicar el tamaño
        sizeOption.addEventListener('click', function() {
            // Enfocar el editor
            editorContent.focus();

            // Restaurar la selección guardada si existe
            if (savedRange) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(savedRange);
            }

            // Aplicar el tamaño de letra
            document.execCommand('fontSize', false, size.value);

            // Sincronizar con el textarea
            textarea.value = editorContent.innerHTML;

            // Ocultar la paleta
            fontSizePalette.style.display = 'none';
        });

        sizeGrid.appendChild(sizeOption);
    });

    // Instrucción
    const instruction = document.createElement('div');
    instruction.textContent = 'Haga clic para aplicar tamaño';
    instruction.style.marginTop = '10px';
    instruction.style.paddingTop = '8px';
    instruction.style.borderTop = '1px solid #eee';
    instruction.style.fontSize = '12px';
    instruction.style.color = '#666';
    instruction.style.textAlign = 'center';
    instruction.style.fontStyle = 'italic';
    fontSizePalette.appendChild(instruction);

    // Añadir al DOM
    document.body.appendChild(fontSizePalette);

    // Configurar el botón de tamaño de letra
    const fontSizeBtn = document.getElementById('fontSizeBtn');
    if (fontSizeBtn) {
        fontSizeBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Guardar la selección actual
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }

            // Posicionar la paleta cerca del botón
            const buttonRect = fontSizeBtn.getBoundingClientRect();
            fontSizePalette.style.top = (buttonRect.bottom + window.scrollY + 5) + 'px';
            fontSizePalette.style.left = (buttonRect.left + window.scrollX) + 'px';

            // Mostrar la paleta
            fontSizePalette.style.display = 'block';
        });
    }

    // Cerrar la paleta al hacer clic fuera de ella
    document.addEventListener('click', function(e) {
        if (fontSizePalette.style.display === 'block' &&
            !fontSizePalette.contains(e.target) &&
            e.target.id !== 'fontSizeBtn' &&
            !e.target.closest('#fontSizeBtn')) {
            fontSizePalette.style.display = 'none';
        }
    });

    // Asegurarse de que la paleta se cierre cuando se cierra el editor
    window.addEventListener('beforeunload', function() {
        fontSizePalette.remove();
    });
}



/**
 * Añade estilos CSS para el editor
 */
function addEditorStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('clean-text-editor-styles')) {
        return;
    }

    // Crear elemento de estilo
    const style = document.createElement('style');
    style.id = 'clean-text-editor-styles';
    style.textContent = `
        .clean-text-editor-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            padding: 8px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #ced4da;
        }

        .toolbar-group {
            display: flex;
            align-items: center;
            border-right: 1px solid #dee2e6;
            padding-right: 5px;
            margin-right: 5px;
        }

        .toolbar-group:last-child {
            border-right: none;
            padding-right: 0;
            margin-right: 0;
        }

        .editor-btn {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
            padding: 5px 8px;
            cursor: pointer;
            font-size: 14px;
            color: #495057;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 32px;
            min-height: 32px;
            margin: 0 2px;
        }

        .editor-btn:hover {
            background-color: #f8f9fa;
        }

        .editor-btn.active {
            background-color: #e2e6ea;
            border-color: #dae0e5;
        }

        .color-palette {
            display: none;
        }

        /* Estilos para expresiones matemáticas */
        .math-tex {
            display: inline-block;
            vertical-align: middle;
            margin: 0 2px;
            padding: 2px 4px;
            border-radius: 3px;
            background-color: rgba(0, 0, 0, 0.02);
            cursor: default;
            user-select: all;
            position: relative;
        }

        .math-tex:hover {
            background-color: rgba(0, 0, 0, 0.05);
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .color-palette.show {
            display: block;
        }

        .clean-text-editor-content {
            padding: 10px;
            min-height: 200px;
            outline: none;
        }

        .clean-text-editor-content:focus {
            outline: none;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
    `;

    // Añadir al DOM
    document.head.appendChild(style);
}

/**
 * Limpia el editor y libera recursos
 */
function cleanupEditor() {
    try {
        // Eliminar el contenedor del editor
        const editorContainer = document.querySelector('.clean-text-editor-container');
        if (editorContainer) {
            editorContainer.remove();
        }

        // Eliminar la paleta de colores
        const colorPalette = document.getElementById('colorPalette');
        if (colorPalette) {
            colorPalette.remove();
        }

        // Limpiar la referencia global
        window.cleanTextEditor = null;

        return true;
    } catch (error) {
        console.error('Error al limpiar el editor:', error);
        return false;
    }
}

// Exponer funciones globalmente
window.initCleanTextEditor = initCleanTextEditor;
window.cleanupEditor = cleanupEditor;
