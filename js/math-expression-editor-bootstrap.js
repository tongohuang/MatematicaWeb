/**
 * Editor de Expresiones Matemáticas (Versión Bootstrap)
 *
 * Esta versión utiliza un modal Bootstrap para mostrar ejemplos visuales
 * de las expresiones matemáticas y permitir la edición del código LaTeX.
 */

// Variables globales
let currentEditorContent = null;
let currentTextarea = null;
let savedRange = null;
let bootstrapModal = null;

/**
 * Inicializa el botón de expresiones matemáticas en el editor de texto
 */
function initMathExpressionButton(editorContent, textarea) {
    console.log('Inicializando botón de expresiones matemáticas (versión Bootstrap)...');

    // Crear el modal Bootstrap si no existe
    if (!document.getElementById('mathExpressionBootstrapModal')) {
        createBootstrapModal();
    }

    const mathBtn = document.getElementById('mathExpressionBtn');
    if (!mathBtn) {
        console.error('Botón de expresiones matemáticas no encontrado');
        return;
    }

    mathBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Guardar referencias globales
        currentEditorContent = editorContent;
        currentTextarea = textarea;

        // Guardar la selección actual del texto
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            savedRange = selection.getRangeAt(0).cloneRange();
        }

        // Mostrar el modal Bootstrap
        showBootstrapModal();
    });

    // Añadir manejadores de eventos para el editor
    addMathEditorHandlers(editorContent);

    // Añadir observador de mutaciones
    addMathObserver(editorContent);

    // Asegurarse de que MathJax renderice las expresiones existentes
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([editorContent])
            .catch(err => {
                console.error('Error al renderizar LaTeX inicial:', err);
            });
    }
}

/**
 * Crea el modal Bootstrap para el editor de expresiones matemáticas
 */
function createBootstrapModal() {
    // Definir las plantillas de expresiones matemáticas
    const templates = [
        { name: 'Fracción', latex: '\\frac{a}{b}', example: '\\frac{a}{b}' },
        { name: 'Raíz cuadrada', latex: '\\sqrt{x}', example: '\\sqrt{x}' },
        { name: 'Raíz n-ésima', latex: '\\sqrt[n]{x}', example: '\\sqrt[n]{x}' },
        { name: 'Potencia', latex: 'x^{n}', example: 'x^{n}' },
        { name: 'Sumatoria', latex: '\\sum_{i=1}^{n} x_i', example: '\\sum_{i=1}^{n} x_i' },
        { name: 'Productoria', latex: '\\prod_{i=1}^{n} x_i', example: '\\prod_{i=1}^{n} x_i' },
        { name: 'Integral', latex: '\\int_{a}^{b} f(x) dx', example: '\\int_{a}^{b} f(x) dx' },
        { name: 'Límite', latex: '\\lim_{x \\to a} f(x)', example: '\\lim_{x \\to a} f(x)' },
        { name: 'Derivada', latex: '\\frac{d}{dx}f(x)', example: '\\frac{d}{dx}f(x)' },
        { name: 'Matriz', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', example: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
        { name: 'Casos', latex: '\\begin{cases} a & \\text{si } x > 0 \\\\ b & \\text{si } x \\leq 0 \\end{cases}', example: '\\begin{cases} a & \\text{si } x > 0 \\\\ b & \\text{si } x \\leq 0 \\end{cases}' },
        { name: 'Combinatoria', latex: '\\binom{n}{k}', example: '\\binom{n}{k}' }
    ];

    // Crear el modal
    const modalHTML = `
        <div class="modal fade" id="mathExpressionBootstrapModal" tabindex="-1" role="dialog" aria-labelledby="mathExpressionModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="mathExpressionModalLabel">Insertar expresión matemática</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="form-group">
                                    <label for="mathTemplateSelector">Seleccione un tipo de expresión:</label>
                                    <select class="form-control" id="mathTemplateSelector">
                                        ${templates.map((template, index) =>
                                            `<option value="${index}">${template.name}</option>`
                                        ).join('')}
                                        <option value="custom">Personalizada</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="latexInputBootstrap">Código LaTeX:</label>
                                    <textarea class="form-control" id="latexInputBootstrap" rows="3"></textarea>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        Ejemplo
                                    </div>
                                    <div class="card-body text-center" id="mathExamplePreview">
                                        <div>\\(\\frac{a}{b}\\)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="insertMathExpressionBtn">Insertar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Añadir el modal al DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    // Inicializar el modal Bootstrap
    bootstrapModal = new bootstrap.Modal(document.getElementById('mathExpressionBootstrapModal'), {
        keyboard: true,
        backdrop: true
    });

    // Guardar las plantillas para uso posterior
    window.mathTemplates = templates;

    // Inicializar eventos del modal
    initBootstrapModalEvents();
}

/**
 * Inicializa los eventos del modal Bootstrap
 */
function initBootstrapModalEvents() {
    // Selector de plantillas
    const templateSelector = document.getElementById('mathTemplateSelector');
    if (templateSelector) {
        templateSelector.addEventListener('change', function() {
            const selectedIndex = this.value;
            const latexInput = document.getElementById('latexInputBootstrap');

            if (selectedIndex === 'custom') {
                // Opción personalizada
                latexInput.value = '';
                latexInput.focus();
            } else {
                // Plantilla predefinida
                const template = window.mathTemplates[selectedIndex];
                latexInput.value = template.latex;

                // Actualizar el ejemplo
                updateMathExample(template.example);
            }
        });
    }

    // Campo de texto LaTeX
    const latexInput = document.getElementById('latexInputBootstrap');
    if (latexInput) {
        latexInput.addEventListener('input', function() {
            updateMathExample(this.value);
        });
    }

    // Botón de insertar
    const insertBtn = document.getElementById('insertMathExpressionBtn');
    if (insertBtn) {
        insertBtn.addEventListener('click', function() {
            const latex = document.getElementById('latexInputBootstrap').value.trim();

            if (latex) {
                insertMathExpression(latex);
                bootstrapModal.hide();
            } else {
                alert('Por favor, ingrese una expresión matemática.');
            }
        });
    }
}

/**
 * Actualiza el ejemplo de la expresión matemática
 */
function updateMathExample(latex) {
    const examplePreview = document.getElementById('mathExamplePreview');
    if (!examplePreview) return;

    if (!latex) {
        examplePreview.innerHTML = '<div class="text-muted">Sin vista previa</div>';
        return;
    }

    examplePreview.innerHTML = `<div>\\(${latex}\\)</div>`;

    // Renderizar con MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([examplePreview])
            .catch(err => {
                console.error('Error al renderizar LaTeX:', err);
                examplePreview.innerHTML = '<div class="text-danger">Error al renderizar la expresión</div>';
            });
    }
}

/**
 * Muestra el modal Bootstrap
 */
function showBootstrapModal() {
    if (!bootstrapModal) {
        console.error('Modal Bootstrap no inicializado');
        return;
    }

    // Resetear el selector y el campo de texto
    const templateSelector = document.getElementById('mathTemplateSelector');
    if (templateSelector) {
        templateSelector.value = '0'; // Seleccionar la primera opción

        // Disparar el evento change para actualizar el campo de texto y el ejemplo
        const event = new Event('change');
        templateSelector.dispatchEvent(event);
    }

    // Mostrar el modal
    bootstrapModal.show();
}

/**
 * Inserta la expresión matemática en el editor
 */
function insertMathExpression(latex) {
    console.log('Insertando expresión matemática:', latex);

    if (!currentEditorContent || !currentTextarea) {
        console.error('No hay editor o textarea disponible');
        return;
    }

    try {
        // Crear un span para la expresión matemática
        const mathSpan = document.createElement('span');
        mathSpan.className = 'math-tex';
        mathSpan.setAttribute('data-latex', latex);
        mathSpan.innerHTML = '\\(' + latex + '\\)';

        // Hacer que el span sea contentEditable para que pueda recibir formato
        mathSpan.contentEditable = 'true';

        // Añadir atributo para identificarlo como una expresión matemática
        mathSpan.setAttribute('data-math-expression', 'true');

        // Aplicar estilos para que se comporte como texto normal
        mathSpan.style.display = 'inline';
        mathSpan.style.verticalAlign = 'baseline';
        mathSpan.style.cursor = 'text';
        mathSpan.style.userSelect = 'text';
        mathSpan.style.margin = '0';
        mathSpan.style.padding = '0 1px';
        mathSpan.style.borderRadius = '2px';
        mathSpan.style.backgroundColor = 'transparent';

        // Convertir a HTML
        const mathHtml = mathSpan.outerHTML;

        // Enfocar el editor
        currentEditorContent.focus();

        // Restaurar la selección guardada si existe
        if (savedRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange);
        }

        // Insertar la expresión matemática
        document.execCommand('insertHTML', false, mathHtml);

        // Asegurarse de que el cursor se posicione después de la expresión
        setTimeout(() => {
            // Buscar la expresión recién insertada
            const mathElements = currentEditorContent.querySelectorAll('.math-tex');
            const lastMathElement = mathElements[mathElements.length - 1];

            if (lastMathElement) {
                // Crear un rango después de la expresión
                const selection = window.getSelection();
                const range = document.createRange();
                range.setStartAfter(lastMathElement);
                range.setEndAfter(lastMathElement);
                selection.removeAllRanges();
                selection.addRange(range);

                // Asegurarse de que el cursor esté visible
                lastMathElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 10);

        // Renderizar la expresión con MathJax si está disponible
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([currentEditorContent])
                .catch(err => {
                    console.error('Error al renderizar LaTeX en el editor:', err);
                });
        }

        // Agregar observador de mutaciones para re-renderizar cuando cambie el estilo
        addMathObserver(currentEditorContent);

        // Sincronizar con el textarea
        currentTextarea.value = currentEditorContent.innerHTML;
    } catch (e) {
        console.error('Error al insertar la expresión matemática:', e);
        alert('Ocurrió un error al insertar la expresión matemática. Por favor, inténtelo de nuevo.');
    }
}

/**
 * Agrega un observador de mutaciones para re-renderizar expresiones matemáticas cuando cambian de estilo
 * @param {HTMLElement} container - El contenedor donde buscar expresiones matemáticas
 */
function addMathObserver(container) {
    // Verificar si ya existe un observador
    if (window.mathObserver) {
        return;
    }

    // Crear un observador de mutaciones
    const observer = new MutationObserver(function(mutations) {
        let needsUpdate = false;
        let affectedMathElements = [];

        mutations.forEach(function(mutation) {
            // Si cambió un atributo de estilo
            if (mutation.type === 'attributes' &&
                (mutation.attributeName === 'style' ||
                 mutation.attributeName === 'class')) {

                const target = mutation.target;
                // Verificar si el target es una expresión matemática o contiene una
                if (target.classList && target.classList.contains('math-tex')) {
                    needsUpdate = true;
                    affectedMathElements.push(target);
                } else {
                    const mathElements = target.querySelectorAll('.math-tex');
                    if (mathElements.length > 0) {
                        needsUpdate = true;
                        mathElements.forEach(el => affectedMathElements.push(el));
                    }
                }
            }

            // Si se añadieron o eliminaron nodos
            if (mutation.type === 'childList') {
                // Verificar si se añadieron o eliminaron expresiones matemáticas
                if (Array.from(mutation.addedNodes).some(node =>
                    node.classList && node.classList.contains('math-tex') ||
                    (node.querySelectorAll && node.querySelectorAll('.math-tex').length > 0))) {
                    needsUpdate = true;
                }
            }
        });

        // Re-renderizar con MathJax si es necesario
        if (needsUpdate && window.MathJax && window.MathJax.typesetPromise) {
            // Si hay elementos específicos afectados, renderizar solo esos
            if (affectedMathElements.length > 0) {
                window.MathJax.typesetPromise(affectedMathElements)
                    .catch(err => {
                        console.error('Error al re-renderizar LaTeX específico:', err);
                        // Intentar renderizar todo el contenedor como fallback
                        window.MathJax.typesetPromise([container])
                            .catch(err => {
                                console.error('Error al re-renderizar LaTeX completo:', err);
                            });
                    });
            } else {
                // Renderizar todo el contenedor
                window.MathJax.typesetPromise([container])
                    .catch(err => {
                        console.error('Error al re-renderizar LaTeX:', err);
                    });
            }
        }
    });

    // Configurar el observador
    observer.observe(container, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['style', 'class', 'data-*']
    });

    // Guardar el observador para referencia futura
    window.mathObserver = observer;

    // Añadir un manejador para los comandos de formato (color, tamaño, etc.)
    document.addEventListener('selectionchange', function() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const mathElements = container.querySelectorAll('.math-tex');

            mathElements.forEach(function(mathElement) {
                // Verificar si la selección incluye una expresión matemática usando una función compatible
                const intersects = (
                    (range.startContainer === mathElement || mathElement.contains(range.startContainer)) ||
                    (range.endContainer === mathElement || mathElement.contains(range.endContainer)) ||
                    (mathElement.contains(range.startContainer) && mathElement.contains(range.endContainer))
                );

                if (intersects) {
                    // Asegurarse de que MathJax renderice correctamente
                    if (window.MathJax && window.MathJax.typesetPromise) {
                        window.MathJax.typesetPromise([mathElement])
                            .catch(err => {
                                console.error('Error al re-renderizar LaTeX en selectionchange:', err);
                            });
                    }
                }
            });
        }
    });
}

/**
 * Añade un manejador de eventos para el editor de texto
 * @param {HTMLElement} editorContent - El elemento del editor
 */
function addMathEditorHandlers(editorContent) {
    // Permitir la edición de formato pero no el contenido de las expresiones matemáticas
    editorContent.addEventListener('keydown', function(e) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const mathElement = range.startContainer.closest ?
                                range.startContainer.closest('.math-tex') :
                                (range.startContainer.parentNode ? range.startContainer.parentNode.closest('.math-tex') : null);

            if (mathElement) {
                // Permitir teclas de navegación, copiar, cortar, etc.
                const allowedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                                    'Home', 'End', 'PageUp', 'PageDown',
                                    'c', 'v', 'x', 'a', // c, v, x, a con Ctrl para copiar, pegar, cortar, seleccionar todo
                                    'Delete', 'Backspace']; // Permitir borrar la expresión completa

                // Permitir teclas de formato (Ctrl+B, Ctrl+I, etc.)
                if (e.ctrlKey) {
                    allowedKeys.push('b', 'i', 'u'); // Negrita, cursiva, subrayado
                }

                if (!allowedKeys.includes(e.key) && !(e.ctrlKey && allowedKeys.includes(e.key.toLowerCase()))) {
                    // Para otras teclas, seleccionar toda la expresión
                    e.preventDefault();
                    range.selectNode(mathElement);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
    });

    // Manejar eventos de formato (color, tamaño, etc.)
    editorContent.addEventListener('input', function() {
        // Re-renderizar con MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([editorContent])
                .catch(err => {
                    console.error('Error al re-renderizar LaTeX después de input:', err);
                });
        }
    });

    // Agregar manejador de clic para las expresiones matemáticas
    editorContent.addEventListener('click', function(e) {
        // Buscar si el clic fue en una expresión matemática o dentro de ella
        let target = e.target;
        const mathElement = target.closest('.math-tex');

        if (mathElement) {
            // Seleccionar toda la expresión matemática con un doble clic
            if (e.detail === 2) { // Doble clic
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNode(mathElement);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    });

    // Manejar clics cerca de expresiones matemáticas para posicionar el cursor
    editorContent.addEventListener('mousedown', function(e) {
        // Obtener la posición exacta del clic
        const x = e.clientX;
        const y = e.clientY;

        // Obtener el elemento en esa posición
        const element = document.elementFromPoint(x, y);

        // Si el clic fue cerca de una expresión matemática pero no directamente en ella
        if (element && element.nodeName === '#text' && element.parentNode) {
            const parentNode = element.parentNode;
            const prevSibling = parentNode.previousElementSibling;
            const nextSibling = parentNode.nextElementSibling;

            // Verificar si hay una expresión matemática adyacente
            if ((prevSibling && prevSibling.classList && prevSibling.classList.contains('math-tex')) ||
                (nextSibling && nextSibling.classList && nextSibling.classList.contains('math-tex'))) {
                // Permitir que el cursor se posicione normalmente
                // No hacemos nada especial, dejamos que el comportamiento predeterminado funcione
            }
        }
    });

    // Manejar la navegación con teclado alrededor de expresiones matemáticas
    editorContent.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const node = range.startContainer;
                const offset = range.startOffset;

                // Buscar expresiones matemáticas cercanas
                const mathElements = editorContent.querySelectorAll('.math-tex');

                for (const mathElement of mathElements) {
                    // Si estamos justo antes de una expresión y presionamos derecha
                    if (e.key === 'ArrowRight' &&
                        node === mathElement.previousSibling &&
                        offset === node.length) {
                        // Mover el cursor después de la expresión
                        const newRange = document.createRange();
                        if (mathElement.nextSibling) {
                            newRange.setStart(mathElement.nextSibling, 0);
                            newRange.setEnd(mathElement.nextSibling, 0);
                        } else if (mathElement.parentNode) {
                            newRange.setStartAfter(mathElement);
                            newRange.setEndAfter(mathElement);
                        }
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                        e.preventDefault();
                        break;
                    }

                    // Si estamos justo después de una expresión y presionamos izquierda
                    if (e.key === 'ArrowLeft' &&
                        node === mathElement.nextSibling &&
                        offset === 0) {
                        // Mover el cursor antes de la expresión
                        const newRange = document.createRange();
                        if (mathElement.previousSibling) {
                            newRange.setStart(mathElement.previousSibling, mathElement.previousSibling.length);
                            newRange.setEnd(mathElement.previousSibling, mathElement.previousSibling.length);
                        } else if (mathElement.parentNode) {
                            newRange.setStartBefore(mathElement);
                            newRange.setEndBefore(mathElement);
                        }
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                        e.preventDefault();
                        break;
                    }
                }
            }
        }
    });

    // Manejar eventos de selección
    editorContent.addEventListener('mouseup', function(e) {
        // Si el evento fue manejado por el clic en una expresión, no hacer nada
        if (e.target.closest('.math-tex')) {
            return;
        }

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const mathElements = editorContent.querySelectorAll('.math-tex');

            // Verificar si la selección incluye una expresión matemática
            mathElements.forEach(function(mathElement) {
                // Comprobar si la selección intersecta con la expresión matemática
                // usando una función compatible con todos los navegadores
                const intersects = (
                    (range.startContainer === mathElement || mathElement.contains(range.startContainer)) ||
                    (range.endContainer === mathElement || mathElement.contains(range.endContainer)) ||
                    (mathElement.contains(range.startContainer) && mathElement.contains(range.endContainer))
                );

                // Comprobar si la selección contiene completamente la expresión
                // Usando métodos compatibles con todos los navegadores
                let startBeforeMath = false;
                let endAfterMath = false;

                try {
                    // Verificar si el inicio de la selección está antes de la expresión
                    if (range.startContainer === mathElement.parentNode) {
                        // Si el contenedor de inicio es el padre de la expresión
                        const mathIndex = Array.from(mathElement.parentNode.childNodes).indexOf(mathElement);
                        startBeforeMath = range.startOffset <= mathIndex;
                    } else if (mathElement.contains(range.startContainer)) {
                        // Si la expresión contiene el contenedor de inicio
                        startBeforeMath = false;
                    } else if (range.startContainer.compareDocumentPosition) {
                        // Usar compareDocumentPosition si está disponible
                        const position = range.startContainer.compareDocumentPosition(mathElement);
                        startBeforeMath = !!(position & Node.DOCUMENT_POSITION_FOLLOWING);
                    } else {
                        // Fallback: asumir que no está antes
                        startBeforeMath = false;
                    }

                    // Verificar si el final de la selección está después de la expresión
                    if (range.endContainer === mathElement.parentNode) {
                        // Si el contenedor de fin es el padre de la expresión
                        const mathIndex = Array.from(mathElement.parentNode.childNodes).indexOf(mathElement);
                        endAfterMath = range.endOffset > mathIndex;
                    } else if (mathElement.contains(range.endContainer)) {
                        // Si la expresión contiene el contenedor de fin
                        endAfterMath = false;
                    } else if (range.endContainer.compareDocumentPosition) {
                        // Usar compareDocumentPosition si está disponible
                        const position = range.endContainer.compareDocumentPosition(mathElement);
                        endAfterMath = !!(position & Node.DOCUMENT_POSITION_PRECEDING);
                    } else {
                        // Fallback: asumir que no está después
                        endAfterMath = false;
                    }
                } catch (e) {
                    console.error('Error al comprobar la posición de la selección:', e);
                    // Fallback seguro
                    startBeforeMath = false;
                    endAfterMath = false;
                }

                const containsCompletely = startBeforeMath && endAfterMath;

                if (intersects && !containsCompletely) {
                    // Si la selección intersecta pero no contiene completamente la expresión,
                    // extender la selección para incluir toda la expresión
                    if (range.startContainer === mathElement || mathElement.contains(range.startContainer)) {
                        range.setStartBefore(mathElement);
                    }
                    if (range.endContainer === mathElement || mathElement.contains(range.endContainer)) {
                        range.setEndAfter(mathElement);
                    }
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            });
        }
    });
}

// Añadir estilos CSS para las expresiones matemáticas
function addMathExpressionStyles() {
    if (document.getElementById('math-expression-styles-bootstrap')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'math-expression-styles-bootstrap';
    style.textContent = `
        .math-tex {
            display: inline;
            vertical-align: baseline;
            margin: 0;
            padding: 0 1px;
            border-radius: 2px;
            background-color: transparent;
            cursor: text;
            user-select: text;
            position: relative;
            /* Importante: Heredar color y tamaño del texto */
            color: inherit;
            font-size: inherit;
            /* Comportarse como texto normal */
            white-space: normal;
            /* Asegurarse de que no rompa el flujo del texto */
            float: none;
            clear: none;
        }

        .math-tex:hover {
            background-color: rgba(0, 0, 0, 0.07);
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        /* Cuando está seleccionado */
        .math-tex::selection,
        .math-tex *::selection {
            background-color: rgba(0, 123, 255, 0.3);
        }

        /* Asegurarse de que el contenido herede estilos */
        .math-tex * {
            /* Importante: Heredar color y tamaño */
            color: inherit !important;
            font-size: inherit !important;
            /* Comportarse como texto normal */
            display: inline !important;
            vertical-align: baseline !important;
            white-space: normal !important;
        }

        /* Asegurarse de que MathJax herede los estilos y se comporte como texto normal */
        .math-tex .MathJax,
        .math-tex .MJX-TEX,
        .math-tex .mjx-chtml,
        .math-tex .mjx-math,
        .math-tex .mjx-mrow {
            color: inherit !important;
            font-size: inherit !important;
            display: inline !important;
            vertical-align: baseline !important;
            white-space: normal !important;
            float: none !important;
            clear: none !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* Evitar que el cursor entre en la expresión */
        .math-tex:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
        }

        #mathExamplePreview {
            min-height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;

    document.head.appendChild(style);
}

// Inicializar estilos cuando se carga el documento
document.addEventListener('DOMContentLoaded', addMathExpressionStyles);

// Exponer funciones globalmente
window.initMathExpressionButton = initMathExpressionButton;
