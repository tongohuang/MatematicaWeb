/**
 * Editor de texto enriquecido para MatemáticaWeb
 * Permite formatear texto con negrita, cursiva, subrayado, color, etc.
 * También permite insertar ecuaciones matemáticas usando LaTeX
 */

class TextEditor {
    constructor(containerId, textareaId) {
        this.container = document.getElementById(containerId);
        this.textarea = document.getElementById(textareaId);

        if (!this.container || !this.textarea) {
            console.error('No se encontró el contenedor o el textarea');
            return;
        }

        // Crear el editor
        this.createEditor();

        // Inicializar eventos
        this.initEvents();

        // Sincronizar el contenido inicial
        this.syncContent();
    }

    createEditor() {
        // Ocultar el textarea original
        this.textarea.style.display = 'none';

        // Crear el contenedor del editor
        const editorContainer = document.createElement('div');
        editorContainer.className = 'text-editor-container';

        // Crear la barra de herramientas
        const toolbar = document.createElement('div');
        toolbar.className = 'text-editor-toolbar';
        toolbar.innerHTML = this.getToolbarHTML();

        // Crear el área editable
        const editorContent = document.createElement('div');
        editorContent.className = 'text-editor-content';
        editorContent.contentEditable = true;
        editorContent.id = 'textEditorContent';

        // Agregar los elementos al contenedor
        editorContainer.appendChild(toolbar);
        editorContainer.appendChild(editorContent);

        // Agregar el editor al contenedor principal
        this.container.appendChild(editorContainer);

        // Guardar referencias
        this.editorContent = editorContent;
        this.toolbar = toolbar;

        // Crear modales
        // Asegurarse de que los modales se creen después de que el DOM esté completamente cargado
        setTimeout(() => {
            this.createEquationModal();
            this.createTableModal();
            this.createLatexTemplatesModal();
        }, 0);
    }

    getToolbarHTML() {
        return `
            <div class="text-editor-toolbar-group">
                <button type="button" class="text-editor-btn" data-command="bold" title="Negrita">
                    <i class="fas fa-bold"></i>
                </button>
                <button type="button" class="text-editor-btn" data-command="italic" title="Cursiva">
                    <i class="fas fa-italic"></i>
                </button>
                <button type="button" class="text-editor-btn" data-command="underline" title="Subrayado">
                    <i class="fas fa-underline"></i>
                </button>
            </div>

            <div class="text-editor-toolbar-group">
                <button type="button" class="text-editor-btn" data-command="insertUnorderedList" title="Lista con viñetas">
                    <i class="fas fa-list-ul"></i>
                </button>
                <button type="button" class="text-editor-btn" data-command="insertOrderedList" title="Lista numerada">
                    <i class="fas fa-list-ol"></i>
                </button>
            </div>

            <div class="text-editor-toolbar-group">
                <button type="button" class="text-editor-btn" data-command="justifyLeft" title="Alinear a la izquierda">
                    <i class="fas fa-align-left"></i>
                </button>
                <button type="button" class="text-editor-btn" data-command="justifyCenter" title="Centrar">
                    <i class="fas fa-align-center"></i>
                </button>
                <button type="button" class="text-editor-btn" data-command="justifyRight" title="Alinear a la derecha">
                    <i class="fas fa-align-right"></i>
                </button>
            </div>

            <div class="text-editor-toolbar-group">
                <div class="color-picker-container">
                    <button type="button" class="text-editor-btn" id="textColorBtn" title="Color de texto">
                        <i class="fas fa-palette"></i>
                    </button>
                    <div class="color-picker-dropdown" id="colorPickerDropdown">
                        <div class="color-picker-grid">
                            <!-- Negros y grises -->
                            <div class="color-picker-item" style="background-color: #000000;" data-color="#000000" title="Negro"></div>
                            <div class="color-picker-item" style="background-color: #333333;" data-color="#333333" title="Gris oscuro"></div>
                            <div class="color-picker-item" style="background-color: #666666;" data-color="#666666" title="Gris medio"></div>
                            <div class="color-picker-item" style="background-color: #999999;" data-color="#999999" title="Gris claro"></div>
                            <div class="color-picker-item" style="background-color: #CCCCCC;" data-color="#CCCCCC" title="Gris muy claro"></div>
                            <div class="color-picker-item" style="background-color: #FFFFFF;" data-color="#FFFFFF" title="Blanco" style="border: 1px solid #ccc;"></div>

                            <!-- Rojos -->
                            <div class="color-picker-item" style="background-color: #FF0000;" data-color="#FF0000" title="Rojo"></div>
                            <div class="color-picker-item" style="background-color: #FF3333;" data-color="#FF3333" title="Rojo claro"></div>
                            <div class="color-picker-item" style="background-color: #CC0000;" data-color="#CC0000" title="Rojo oscuro"></div>
                            <div class="color-picker-item" style="background-color: #990000;" data-color="#990000" title="Rojo muy oscuro"></div>
                            <div class="color-picker-item" style="background-color: #FFCCCC;" data-color="#FFCCCC" title="Rojo pastel"></div>
                            <div class="color-picker-item" style="background-color: #800000;" data-color="#800000" title="Granate"></div>

                            <!-- Naranjas -->
                            <div class="color-picker-item" style="background-color: #FF8000;" data-color="#FF8000" title="Naranja"></div>
                            <div class="color-picker-item" style="background-color: #FF9933;" data-color="#FF9933" title="Naranja claro"></div>
                            <div class="color-picker-item" style="background-color: #CC6600;" data-color="#CC6600" title="Naranja oscuro"></div>
                            <div class="color-picker-item" style="background-color: #FFCC99;" data-color="#FFCC99" title="Naranja pastel"></div>

                            <!-- Amarillos -->
                            <div class="color-picker-item" style="background-color: #FFFF00;" data-color="#FFFF00" title="Amarillo"></div>
                            <div class="color-picker-item" style="background-color: #FFFF66;" data-color="#FFFF66" title="Amarillo claro"></div>
                            <div class="color-picker-item" style="background-color: #CCCC00;" data-color="#CCCC00" title="Amarillo oscuro"></div>
                            <div class="color-picker-item" style="background-color: #FFFFCC;" data-color="#FFFFCC" title="Amarillo pastel"></div>
                            <div class="color-picker-item" style="background-color: #808000;" data-color="#808000" title="Oliva"></div>

                            <!-- Verdes -->
                            <div class="color-picker-item" style="background-color: #00FF00;" data-color="#00FF00" title="Verde"></div>
                            <div class="color-picker-item" style="background-color: #33FF33;" data-color="#33FF33" title="Verde claro"></div>
                            <div class="color-picker-item" style="background-color: #00CC00;" data-color="#00CC00" title="Verde oscuro"></div>
                            <div class="color-picker-item" style="background-color: #009900;" data-color="#009900" title="Verde muy oscuro"></div>
                            <div class="color-picker-item" style="background-color: #CCFFCC;" data-color="#CCFFCC" title="Verde pastel"></div>
                            <div class="color-picker-item" style="background-color: #008000;" data-color="#008000" title="Verde bosque"></div>

                            <!-- Turquesas -->
                            <div class="color-picker-item" style="background-color: #00FFCC;" data-color="#00FFCC" title="Turquesa"></div>
                            <div class="color-picker-item" style="background-color: #33FFCC;" data-color="#33FFCC" title="Turquesa claro"></div>
                            <div class="color-picker-item" style="background-color: #00CCCC;" data-color="#00CCCC" title="Turquesa oscuro"></div>
                            <div class="color-picker-item" style="background-color: #CCFFFF;" data-color="#CCFFFF" title="Turquesa pastel"></div>
                            <div class="color-picker-item" style="background-color: #008080;" data-color="#008080" title="Verde azulado"></div>

                            <!-- Azules -->
                            <div class="color-picker-item" style="background-color: #0000FF;" data-color="#0000FF" title="Azul"></div>
                            <div class="color-picker-item" style="background-color: #3333FF;" data-color="#3333FF" title="Azul claro"></div>
                            <div class="color-picker-item" style="background-color: #0000CC;" data-color="#0000CC" title="Azul oscuro"></div>
                            <div class="color-picker-item" style="background-color: #000099;" data-color="#000099" title="Azul muy oscuro"></div>
                            <div class="color-picker-item" style="background-color: #CCCCFF;" data-color="#CCCCFF" title="Azul pastel"></div>
                            <div class="color-picker-item" style="background-color: #000080;" data-color="#000080" title="Azul marino"></div>
                            <div class="color-picker-item" style="background-color: #00FFFF;" data-color="#00FFFF" title="Cian"></div>

                            <!-- Morados -->
                            <div class="color-picker-item" style="background-color: #8000FF;" data-color="#8000FF" title="Morado"></div>
                            <div class="color-picker-item" style="background-color: #9933FF;" data-color="#9933FF" title="Morado claro"></div>
                            <div class="color-picker-item" style="background-color: #6600CC;" data-color="#6600CC" title="Morado oscuro"></div>
                            <div class="color-picker-item" style="background-color: #CC99FF;" data-color="#CC99FF" title="Morado pastel"></div>
                            <div class="color-picker-item" style="background-color: #800080;" data-color="#800080" title="Púrpura"></div>

                            <!-- Rosas -->
                            <div class="color-picker-item" style="background-color: #FF00FF;" data-color="#FF00FF" title="Magenta"></div>
                            <div class="color-picker-item" style="background-color: #FF33FF;" data-color="#FF33FF" title="Rosa claro"></div>
                            <div class="color-picker-item" style="background-color: #CC00CC;" data-color="#CC00CC" title="Rosa oscuro"></div>
                            <div class="color-picker-item" style="background-color: #FFCCFF;" data-color="#FFCCFF" title="Rosa pastel"></div>

                            <!-- Marrones -->
                            <div class="color-picker-item" style="background-color: #996633;" data-color="#996633" title="Marrón"></div>
                            <div class="color-picker-item" style="background-color: #CC9966;" data-color="#CC9966" title="Marrón claro"></div>
                            <div class="color-picker-item" style="background-color: #663300;" data-color="#663300" title="Marrón oscuro"></div>
                            <div class="color-picker-item" style="background-color: #FFCC99;" data-color="#FFCC99" title="Marrón pastel"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-editor-toolbar-group">
                <button type="button" class="text-editor-btn" id="insertEquationBtn" title="Insertar ecuación">
                    <i class="fas fa-square-root-alt"></i>
                </button>
                <button type="button" class="text-editor-btn" id="latexTemplatesBtn" title="Plantillas de ecuaciones">
                    <i class="fas fa-superscript"></i>
                </button>
                <button type="button" class="text-editor-btn" id="insertTableBtn" title="Insertar tabla">
                    <i class="fas fa-table"></i>
                </button>
            </div>
        `;
    }

    createEquationModal() {
        // Eliminar el modal existente si ya existe
        const existingModal = document.getElementById('equationModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'equation-modal';
        modal.id = 'equationModal';
        modal.innerHTML = `
            <div class="equation-modal-content">
                <div class="equation-modal-header">
                    <h5 class="equation-modal-title">Insertar Ecuación</h5>
                    <button type="button" class="equation-modal-close" id="closeEquationModal">&times;</button>
                </div>
                <div class="equation-modal-body">
                    <div class="mb-3">
                        <label for="equationInput" class="form-label">Ecuación en formato LaTeX</label>
                        <input type="text" class="form-control" id="equationInput" placeholder="\\frac{a}{b}">
                        <div class="form-text">Escribe la ecuación en formato LaTeX. Ejemplos: \\frac{a}{b}, \\sqrt{x}, \\int_{a}^{b}</div>
                    </div>
                    <div class="equation-preview" id="equationPreview">
                        <div class="text-center text-muted">
                            <small>La vista previa aparecerá aquí</small>
                        </div>
                    </div>
                </div>
                <div class="equation-modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelEquationBtn">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="insertEquationModalBtn">Insertar</button>
                </div>
            </div>
        `;

        // Agregar el modal al final del body para asegurar que esté por encima de todo
        document.body.appendChild(modal);
    }

    createLatexTemplatesModal() {
        // Eliminar el modal existente si ya existe
        const existingModal = document.getElementById('latexTemplatesModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'latex-templates-modal';
        modal.id = 'latexTemplatesModal';
        modal.innerHTML = `
            <div class="latex-templates-modal-content">
                <div class="latex-templates-modal-header">
                    <h5 class="latex-templates-modal-title">Plantillas de Ecuaciones</h5>
                    <button type="button" class="latex-templates-modal-close" id="closeLatexTemplatesModal">&times;</button>
                </div>
                <div class="latex-templates-modal-body">
                    <div class="latex-templates-tabs">
                        <button class="latex-tab-btn active" data-tab="basic">Básicas</button>
                        <button class="latex-tab-btn" data-tab="fractions">Fracciones</button>
                        <button class="latex-tab-btn" data-tab="exponents">Exponentes/Raíces</button>
                        <button class="latex-tab-btn" data-tab="calculus">Cálculo</button>
                        <button class="latex-tab-btn" data-tab="symbols">Símbolos</button>
                    </div>
                    <div class="latex-templates-content">
                        <div class="latex-templates-tab" id="basic-tab">
                            <div class="latex-template-grid">
                                <div class="latex-template-item" data-latex="x + y">$x + y$</div>
                                <div class="latex-template-item" data-latex="x - y">$x - y$</div>
                                <div class="latex-template-item" data-latex="x \\times y">$x \\times y$</div>
                                <div class="latex-template-item" data-latex="x \\div y">$x \\div y$</div>
                                <div class="latex-template-item" data-latex="\\pi">$\\pi$</div>
                                <div class="latex-template-item" data-latex="\\theta">$\\theta$</div>
                                <div class="latex-template-item" data-latex="\\alpha">$\\alpha$</div>
                                <div class="latex-template-item" data-latex="\\beta">$\\beta$</div>
                                <div class="latex-template-item" data-latex="\\gamma">$\\gamma$</div>
                                <div class="latex-template-item" data-latex="\\delta">$\\delta$</div>
                                <div class="latex-template-item" data-latex="\\infty">$\\infty$</div>
                                <div class="latex-template-item" data-latex="\\neq">$\\neq$</div>
                            </div>
                        </div>
                        <div class="latex-templates-tab" id="fractions-tab" style="display:none;">
                            <div class="latex-template-grid">
                                <div class="latex-template-item" data-latex="\\frac{a}{b}">$\\frac{a}{b}$</div>
                                <div class="latex-template-item" data-latex="\\frac{1}{2}">$\\frac{1}{2}$</div>
                                <div class="latex-template-item" data-latex="\\frac{1}{3}">$\\frac{1}{3}$</div>
                                <div class="latex-template-item" data-latex="\\frac{1}{4}">$\\frac{1}{4}$</div>
                                <div class="latex-template-item" data-latex="\\frac{3}{4}">$\\frac{3}{4}$</div>
                                <div class="latex-template-item" data-latex="\\frac{x+y}{x-y}">$\\frac{x+y}{x-y}$</div>
                                <div class="latex-template-item" data-latex="\\frac{\\partial f}{\\partial x}">$\\frac{\\partial f}{\\partial x}$</div>
                                <div class="latex-template-item" data-latex="\\frac{dy}{dx}">$\\frac{dy}{dx}$</div>
                            </div>
                        </div>
                        <div class="latex-templates-tab" id="exponents-tab" style="display:none;">
                            <div class="latex-template-grid">
                                <div class="latex-template-item" data-latex="x^2">$x^2$</div>
                                <div class="latex-template-item" data-latex="x^3">$x^3$</div>
                                <div class="latex-template-item" data-latex="x^n">$x^n$</div>
                                <div class="latex-template-item" data-latex="x^{y+z}">$x^{y+z}$</div>
                                <div class="latex-template-item" data-latex="\\sqrt{x}">$\\sqrt{x}$</div>
                                <div class="latex-template-item" data-latex="\\sqrt[3]{x}">$\\sqrt[3]{x}$</div>
                                <div class="latex-template-item" data-latex="\\sqrt[n]{x}">$\\sqrt[n]{x}$</div>
                                <div class="latex-template-item" data-latex="\\sqrt{x^2 + y^2}">$\\sqrt{x^2 + y^2}$</div>
                                <div class="latex-template-item" data-latex="x_i">$x_i$</div>
                                <div class="latex-template-item" data-latex="x_{i,j}">$x_{i,j}$</div>
                            </div>
                        </div>
                        <div class="latex-templates-tab" id="calculus-tab" style="display:none;">
                            <div class="latex-template-grid">
                                <div class="latex-template-item" data-latex="\\int f(x) dx">$\\int f(x) dx$</div>
                                <div class="latex-template-item" data-latex="\\int_{a}^{b} f(x) dx">$\\int_{a}^{b} f(x) dx$</div>
                                <div class="latex-template-item" data-latex="\\sum_{i=1}^{n} x_i">$\\sum_{i=1}^{n} x_i$</div>
                                <div class="latex-template-item" data-latex="\\prod_{i=1}^{n} x_i">$\\prod_{i=1}^{n} x_i$</div>
                                <div class="latex-template-item" data-latex="\\lim_{x \\to 0} f(x)">$\\lim_{x \\to 0} f(x)$</div>
                                <div class="latex-template-item" data-latex="\\frac{d}{dx}f(x)">$\\frac{d}{dx}f(x)$</div>
                                <div class="latex-template-item" data-latex="\\frac{\\partial^2 f}{\\partial x^2}">$\\frac{\\partial^2 f}{\\partial x^2}$</div>
                                <div class="latex-template-item" data-latex="\\nabla f">$\\nabla f$</div>
                            </div>
                        </div>
                        <div class="latex-templates-tab" id="symbols-tab" style="display:none;">
                            <div class="latex-template-grid">
                                <div class="latex-template-item" data-latex="\\lt">$\\lt$</div>
                                <div class="latex-template-item" data-latex="\\gt">$\\gt$</div>
                                <div class="latex-template-item" data-latex="\\leq">$\\leq$</div>
                                <div class="latex-template-item" data-latex="\\geq">$\\geq$</div>
                                <div class="latex-template-item" data-latex="\\approx">$\\approx$</div>
                                <div class="latex-template-item" data-latex="\\equiv">$\\equiv$</div>
                                <div class="latex-template-item" data-latex="\\in">$\\in$</div>
                                <div class="latex-template-item" data-latex="\\notin">$\\notin$</div>
                                <div class="latex-template-item" data-latex="\\subset">$\\subset$</div>
                                <div class="latex-template-item" data-latex="\\cup">$\\cup$</div>
                                <div class="latex-template-item" data-latex="\\cap">$\\cap$</div>
                                <div class="latex-template-item" data-latex="\\forall">$\\forall$</div>
                                <div class="latex-template-item" data-latex="\\exists">$\\exists$</div>
                                <div class="latex-template-item" data-latex="\\nexists">$\\nexists$</div>
                                <div class="latex-template-item" data-latex="\\emptyset">$\\emptyset$</div>
                                <div class="latex-template-item" data-latex="\\implies">$\\implies$</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="latex-templates-modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelLatexTemplatesBtn">Cerrar</button>
                </div>
            </div>
        `;

        // Agregar el modal al final del body para asegurar que esté por encima de todo
        document.body.appendChild(modal);
    }

    createTableModal() {
        // Eliminar el modal existente si ya existe
        const existingModal = document.getElementById('tableModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'table-modal';
        modal.id = 'tableModal';
        modal.innerHTML = `
            <div class="table-modal-content">
                <div class="table-modal-header">
                    <h5 class="table-modal-title">Insertar Tabla</h5>
                    <button type="button" class="table-modal-close" id="closeTableModal">&times;</button>
                </div>
                <div class="table-modal-body">
                    <div class="mb-3">
                        <label class="form-label">Selecciona el tamaño de la tabla</label>
                        <div class="table-size-grid" id="tableSizeGrid"></div>
                        <div class="table-size-label" id="tableSizeLabel">0 x 0</div>
                    </div>
                </div>
                <div class="table-modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelTableBtn">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="insertTableModalBtn">Insertar</button>
                </div>
            </div>
        `;

        // Agregar el modal al final del body para asegurar que esté por encima de todo
        document.body.appendChild(modal);

        // Crear la cuadrícula de selección de tamaño
        const tableSizeGrid = document.getElementById('tableSizeGrid');
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cell = document.createElement('div');
                cell.className = 'table-size-cell';
                cell.dataset.row = i + 1;
                cell.dataset.col = j + 1;
                tableSizeGrid.appendChild(cell);
            }
        }
    }

    initEvents() {
        if (!this.toolbar || !this.editorContent) {
            console.error('No se pudieron inicializar los eventos del editor');
            return;
        }

        // Eventos para los botones de la barra de herramientas
        this.toolbar.querySelectorAll('.text-editor-btn[data-command]').forEach(button => {
            button.addEventListener('click', () => {
                const command = button.dataset.command;
                document.execCommand(command, false, null);
                this.updateActiveButtons();
                this.syncContent();
            });
        });

        // Evento para sincronizar el contenido cuando se edita
        this.editorContent.addEventListener('input', () => {
            this.syncContent();
            this.updateActiveButtons();
        });

        // Evento para actualizar botones activos cuando se selecciona texto
        this.editorContent.addEventListener('mouseup', () => {
            this.updateActiveButtons();
        });
        this.editorContent.addEventListener('keyup', () => {
            this.updateActiveButtons();
        });

        // Evento para el selector de color
        const textColorBtn = document.getElementById('textColorBtn');
        const colorPickerDropdown = document.getElementById('colorPickerDropdown');

        if (textColorBtn && colorPickerDropdown) {
            textColorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                colorPickerDropdown.classList.toggle('show');
            });

            // Cerrar el selector de color al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (textColorBtn && colorPickerDropdown && !textColorBtn.contains(e.target) && !colorPickerDropdown.contains(e.target)) {
                    colorPickerDropdown.classList.remove('show');
                }
            });

            // Evento para los elementos de color
            colorPickerDropdown.querySelectorAll('.color-picker-item').forEach(item => {
                item.addEventListener('click', () => {
                    const color = item.dataset.color;
                    document.execCommand('foreColor', false, color);
                    colorPickerDropdown.classList.remove('show');
                    this.syncContent();
                });
            });
        }

        // Evento para el botón de ecuación
        const insertEquationBtn = document.getElementById('insertEquationBtn');
        const equationModal = document.getElementById('equationModal');
        const equationInput = document.getElementById('equationInput');
        const equationPreview = document.getElementById('equationPreview');
        const closeEquationModal = document.getElementById('closeEquationModal');
        const cancelEquationBtn = document.getElementById('cancelEquationBtn');
        const insertEquationModalBtn = document.getElementById('insertEquationModalBtn');

        if (insertEquationBtn && equationModal) {
            insertEquationBtn.addEventListener('click', () => {
                equationModal.style.display = 'block';
                if (equationInput) {
                    equationInput.value = '';
                }
                if (equationPreview) {
                    equationPreview.innerHTML = '<div class="text-center text-muted"><small>La vista previa aparecerá aquí</small></div>';
                }
            });

            if (closeEquationModal) {
                closeEquationModal.addEventListener('click', () => {
                    equationModal.style.display = 'none';
                });
            }

            if (cancelEquationBtn) {
                cancelEquationBtn.addEventListener('click', () => {
                    equationModal.style.display = 'none';
                });
            }

            if (equationInput && equationPreview) {
                equationInput.addEventListener('input', () => {
                    const latex = equationInput.value;
                    if (latex.trim() === '') {
                        equationPreview.innerHTML = '<div class="text-center text-muted"><small>La vista previa aparecerá aquí</small></div>';
                    } else {
                        equationPreview.innerHTML = `<span class="math-preview">$$${latex}$$</span>`;
                        // Renderizar la ecuación con MathJax si está disponible
                        if (typeof MathJax !== 'undefined') {
                            MathJax.typeset([equationPreview]);
                        }
                    }
                });
            }

            if (insertEquationModalBtn && equationInput) {
                insertEquationModalBtn.addEventListener('click', () => {
                    const latex = equationInput.value;
                    if (latex.trim() !== '') {
                        const editorContent = document.getElementById('textEditorContent');
                        if (editorContent && window.currentTextEditor) {
                            // Crear un span renderizable para la ecuación
                            const equationSpan = document.createElement('span');
                            equationSpan.className = 'math-equation';
                            equationSpan.setAttribute('data-latex', latex);

                            // Usar doble dólar para modo display
                            equationSpan.innerHTML = `$$${latex}$$`;

                            // Forzar el foco en el editor
                            editorContent.focus();

                            // Insertar la ecuación
                            window.currentTextEditor.insertNodeAtCursor(equationSpan);

                            // Agregar un espacio después de la ecuación para permitir seguir escribiendo
                            const spaceNode = document.createTextNode(' ');
                            editorContent.appendChild(spaceNode);

                            // Sincronizar el contenido
                            window.currentTextEditor.syncContent();

                            // Renderizar la ecuación con MathJax
                            if (typeof MathJax !== 'undefined') {
                                MathJax.typeset([equationSpan]);
                            }
                        }
                    }
                    equationModal.style.display = 'none';
                });
            }
        }

        // Evento para el botón de plantillas de ecuaciones LaTeX
        const latexTemplatesBtn = document.getElementById('latexTemplatesBtn');
        const latexTemplatesModal = document.getElementById('latexTemplatesModal');
        const closeLatexTemplatesModal = document.getElementById('closeLatexTemplatesModal');
        const cancelLatexTemplatesBtn = document.getElementById('cancelLatexTemplatesBtn');

        if (latexTemplatesBtn && latexTemplatesModal) {
            latexTemplatesBtn.addEventListener('click', () => {
                latexTemplatesModal.style.display = 'block';

                // Renderizar las ecuaciones con MathJax si está disponible
                if (typeof MathJax !== 'undefined') {
                    MathJax.typeset();
                }
            });

            if (closeLatexTemplatesModal) {
                closeLatexTemplatesModal.addEventListener('click', () => {
                    latexTemplatesModal.style.display = 'none';
                });
            }

            if (cancelLatexTemplatesBtn) {
                cancelLatexTemplatesBtn.addEventListener('click', () => {
                    latexTemplatesModal.style.display = 'none';
                });
            }

            // Eventos para las pestañas
            const tabButtons = latexTemplatesModal.querySelectorAll('.latex-tab-btn');
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tab = button.dataset.tab;

                    // Quitar clase activa de todos los botones
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    // Agregar clase activa al botón clickeado
                    button.classList.add('active');

                    // Ocultar todos los tabs
                    latexTemplatesModal.querySelectorAll('.latex-templates-tab').forEach(tabContent => {
                        tabContent.style.display = 'none';
                    });

                    // Mostrar el tab seleccionado
                    const selectedTab = document.getElementById(`${tab}-tab`);
                    if (selectedTab) {
                        selectedTab.style.display = 'block';
                    }
                });
            });

            // Eventos para los elementos de plantilla
            latexTemplatesModal.querySelectorAll('.latex-template-item').forEach(item => {
                item.addEventListener('click', () => {
                    const latex = item.dataset.latex;
                    if (latex) {
                        const editorContent = document.getElementById('textEditorContent');
                        if (editorContent && window.currentTextEditor) {
                            // Crear un span renderizable para la ecuación
                            const equationSpan = document.createElement('span');
                            equationSpan.className = 'math-equation';
                            equationSpan.setAttribute('data-latex', latex);

                            // Usar doble dólar para modo display
                            equationSpan.innerHTML = `$$${latex}$$`;

                            // Forzar el foco en el editor
                            editorContent.focus();

                            // Insertar la ecuación
                            window.currentTextEditor.insertNodeAtCursor(equationSpan);

                            // Agregar un espacio después de la ecuación para permitir seguir escribiendo
                            const spaceNode = document.createTextNode(' ');
                            window.currentTextEditor.insertNodeAtCursor(spaceNode);

                            // Sincronizar el contenido
                            window.currentTextEditor.syncContent();

                            // Renderizar la ecuación con MathJax
                            if (typeof MathJax !== 'undefined') {
                                MathJax.typeset([equationSpan]);
                            }
                        }
                    }
                    latexTemplatesModal.style.display = 'none';
                });
            });
        }

        // Evento para el botón de tabla
        const insertTableBtn = document.getElementById('insertTableBtn');
        const tableModal = document.getElementById('tableModal');
        const tableSizeGrid = document.getElementById('tableSizeGrid');
        const tableSizeLabel = document.getElementById('tableSizeLabel');
        const closeTableModal = document.getElementById('closeTableModal');
        const cancelTableBtn = document.getElementById('cancelTableBtn');
        const insertTableModalBtn = document.getElementById('insertTableModalBtn');

        if (insertTableBtn && tableModal && tableSizeGrid) {
            insertTableBtn.addEventListener('click', () => {
                tableModal.style.display = 'block';

                // Resetear selección
                tableSizeGrid.querySelectorAll('.table-size-cell').forEach(cell => {
                    cell.classList.remove('selected');
                });
                if (tableSizeLabel) {
                    tableSizeLabel.textContent = '0 x 0';
                }
            });

            if (closeTableModal) {
                closeTableModal.addEventListener('click', () => {
                    tableModal.style.display = 'none';
                });
            }

            if (cancelTableBtn) {
                cancelTableBtn.addEventListener('click', () => {
                    tableModal.style.display = 'none';
                });
            }

            // Eventos para la cuadrícula de selección de tamaño
            let selectedRows = 0;
            let selectedCols = 0;

            tableSizeGrid.querySelectorAll('.table-size-cell').forEach(cell => {
                cell.addEventListener('mouseover', () => {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);

                    // Actualizar la etiqueta de tamaño
                    if (tableSizeLabel) {
                        tableSizeLabel.textContent = `${row} x ${col}`;
                    }

                    // Marcar celdas seleccionadas
                    tableSizeGrid.querySelectorAll('.table-size-cell').forEach(c => {
                        const r = parseInt(c.dataset.row);
                        const c2 = parseInt(c.dataset.col);

                        if (r <= row && c2 <= col) {
                            c.classList.add('selected');
                        } else {
                            c.classList.remove('selected');
                        }
                    });

                    // Guardar tamaño seleccionado
                    selectedRows = row;
                    selectedCols = col;
                });

                cell.addEventListener('click', () => {
                    // Insertar tabla al hacer clic
                    if (selectedRows > 0 && selectedCols > 0) {
                        this.insertTable(selectedRows, selectedCols);
                        tableModal.style.display = 'none';
                    }
                });
            });

            if (insertTableModalBtn) {
                insertTableModalBtn.addEventListener('click', () => {
                    if (selectedRows > 0 && selectedCols > 0) {
                        this.insertTable(selectedRows, selectedCols);
                        tableModal.style.display = 'none';
                    }
                });
            }
        }
    }

    updateActiveButtons() {
        if (!this.toolbar) return;

        // Actualizar estado de botones según el formato actual
        this.toolbar.querySelectorAll('.text-editor-btn[data-command]').forEach(button => {
            const command = button.dataset.command;

            // Para comandos que se pueden consultar con document.queryCommandState
            if (['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList',
                 'justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {

                if (document.queryCommandState(command)) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
    }

    insertTable(rows, cols) {
        // Crear la tabla
        let tableHTML = '<div class="table-container"><table class="text-editor-table">';

        // Crear filas y columnas
        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                // Primera fila como encabezados
                if (i === 0) {
                    tableHTML += '<th>Encabezado</th>';
                } else {
                    tableHTML += '<td>Celda</td>';
                }
            }
            tableHTML += '</tr>';
        }

        tableHTML += '</table></div>';

        // Insertar la tabla en el editor
        this.editorContent.focus();
        document.execCommand('insertHTML', false, tableHTML);
        this.syncContent();
    }

    insertNodeAtCursor(node) {
        try {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(node);

                // Mover el cursor después del nodo insertado
                range.setStartAfter(node);
                range.setEndAfter(node);
                selection.removeAllRanges();
                selection.addRange(range);

                // Trigger para MathJax
                if (typeof MathJax !== 'undefined' && node.classList.contains('math-equation')) {
                    setTimeout(() => {
                        MathJax.typeset([node]);
                    }, 10);
                }
            }
        } catch (error) {
            console.error('Error al insertar nodo:', error);
        }
    }

    syncContent() {
        // Sincronizar el contenido del editor con el textarea
        this.textarea.value = this.editorContent.innerHTML;
    }

    setContent(html) {
        // Establecer el contenido del editor
        this.editorContent.innerHTML = html;
        this.syncContent();
        this.updateActiveButtons();
    }
}

// Función para inicializar el editor de texto
function initTextEditor() {
    const textEditorContainer = document.getElementById('textEditorContainer');
    const textContent = document.getElementById('textContent');

    if (textEditorContainer && textContent) {
        // Limpiar el editor existente si lo hay
        if (window.currentTextEditor) {
            try {
                // Eliminar eventos y modales existentes
                const editorContent = document.getElementById('textEditorContent');
                if (editorContent) {
                    // Clonar y reemplazar para eliminar eventos
                    const newEditorContent = editorContent.cloneNode(true);
                    editorContent.parentNode.replaceChild(newEditorContent, editorContent);
                }

                // Eliminar modales existentes
                ['equationModal', 'tableModal', 'latexTemplatesModal'].forEach(id => {
                    const modal = document.getElementById(id);
                    if (modal) modal.remove();
                });

                // Limpiar el contenedor
                textEditorContainer.innerHTML = `<textarea class="form-control" id="textContent" rows="6" required></textarea>`;
                textContent = document.getElementById('textContent');
            } catch (e) {
                console.error('Error al limpiar el editor existente:', e);
            }
        }

        // Crear nuevo editor
        window.currentTextEditor = new TextEditor('textEditorContainer', 'textContent');

        // Aplicar foco al editor y asegurar fondo claro
        const editorContent = document.getElementById('textEditorContent');
        if (editorContent) {
            // Asegurar fondo claro
            editorContent.style.backgroundColor = '#fff';
            editorContent.style.color = '#212529';

            setTimeout(() => {
                editorContent.focus();
            }, 50);
        }

        // Asegurarse de que los modales estén correctamente posicionados
        setTimeout(() => {
            // Mover los modales al body para evitar problemas con el z-index
            ['equationModal', 'tableModal', 'latexTemplatesModal'].forEach(id => {
                const modal = document.getElementById(id);
                if (modal) {
                    // Asegurarse de que el modal esté en el body
                    document.body.appendChild(modal);

                    // Aplicar z-index alto para asegurar que estén por encima de todo
                    modal.style.zIndex = '10000';
                }
            });

            // Asegurar que los eventos específicos sean reconectados
            reconnectColorPickerEvents();
            reconnectEquationEvents();
            reconnectLatexTemplatesEvents();

            // Renderizar ecuaciones si hay alguna
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }
        }, 100);
    }
}

// Función para reconectar eventos del selector de color
function reconnectColorPickerEvents() {
    const textColorBtn = document.getElementById('textColorBtn');
    const colorPickerDropdown = document.getElementById('colorPickerDropdown');

    if (textColorBtn && colorPickerDropdown) {
        // Eliminar eventos existentes mediante clonación
        const newTextColorBtn = textColorBtn.cloneNode(true);
        textColorBtn.parentNode.replaceChild(newTextColorBtn, textColorBtn);

        // Agregar nuevo evento de clic
        newTextColorBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Asegurar que el dropdown sea visible y esté encima de todo
            colorPickerDropdown.style.display = 'block';
            colorPickerDropdown.style.position = 'absolute';
            colorPickerDropdown.style.zIndex = '10001';
            colorPickerDropdown.style.top = `${newTextColorBtn.offsetTop + newTextColorBtn.offsetHeight}px`;
            colorPickerDropdown.style.left = `${newTextColorBtn.offsetLeft}px`;
            colorPickerDropdown.style.backgroundColor = '#fff';
            colorPickerDropdown.style.border = '1px solid #ced4da';
            colorPickerDropdown.style.borderRadius = '0.25rem';
            colorPickerDropdown.style.padding = '8px';
            colorPickerDropdown.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';

            colorPickerDropdown.classList.toggle('show');

            // Asegurar foco en el editor
            const editorContent = document.getElementById('textEditorContent');
            if (editorContent) {
                setTimeout(() => {
                    editorContent.focus();
                }, 50);
            }
        });

        // Eventos para los elementos de color
        colorPickerDropdown.querySelectorAll('.color-picker-item').forEach(item => {
            // Eliminar eventos existentes
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            // Agregar nuevo evento de clic
            newItem.addEventListener('click', () => {
                const color = newItem.dataset.color;
                const editorContent = document.getElementById('textEditorContent');

                if (editorContent) {
                    // Asegurar que el foco esté en el editor
                    editorContent.focus();

                    // Aplicar el color al texto seleccionado
                    document.execCommand('foreColor', false, color);

                    // Actualizar el contenido del textarea
                    if (window.currentTextEditor) {
                        window.currentTextEditor.syncContent();
                    }
                }

                // Ocultar el dropdown
                colorPickerDropdown.classList.remove('show');
                colorPickerDropdown.style.display = 'none';
            });
        });

        // Cerrar el selector de color al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (newTextColorBtn && colorPickerDropdown &&
                !newTextColorBtn.contains(e.target) &&
                !colorPickerDropdown.contains(e.target)) {
                colorPickerDropdown.classList.remove('show');
                colorPickerDropdown.style.display = 'none';
            }
        });
    }
}

// Función para reconectar eventos de ecuaciones
function reconnectEquationEvents() {
    const insertEquationBtn = document.getElementById('insertEquationBtn');
    const equationModal = document.getElementById('equationModal');

    if (insertEquationBtn && equationModal) {
        // Eliminar eventos existentes mediante clonación
        const newInsertEquationBtn = insertEquationBtn.cloneNode(true);
        insertEquationBtn.parentNode.replaceChild(newInsertEquationBtn, insertEquationBtn);

        // Agregar nuevo evento de clic
        newInsertEquationBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Asegurarse que el editor tenga el foco para la inserción posterior
            const editorContent = document.getElementById('textEditorContent');
            if (editorContent) {
                editorContent.focus();
            }

            // Mostrar el modal
            equationModal.style.display = 'block';

            // Limpiar y preparar el input y la vista previa
            const equationInput = document.getElementById('equationInput');
            const equationPreview = document.getElementById('equationPreview');

            if (equationInput) {
                equationInput.value = '';
                // Asegurar que el input sea usable
                equationInput.disabled = false;
                equationInput.style.backgroundColor = '#fff';
                equationInput.style.color = '#212529';

                // Dar foco al input
                setTimeout(() => {
                    equationInput.focus();
                }, 50);
            }

            if (equationPreview) {
                equationPreview.innerHTML = '<div class="text-center text-muted"><small>La vista previa aparecerá aquí</small></div>';
            }
        });

        // Eventos para cerrar el modal
        const closeEquationModal = document.getElementById('closeEquationModal');
        const cancelEquationBtn = document.getElementById('cancelEquationBtn');

        if (closeEquationModal) {
            closeEquationModal.addEventListener('click', () => {
                equationModal.style.display = 'none';
            });
        }

        if (cancelEquationBtn) {
            cancelEquationBtn.addEventListener('click', () => {
                equationModal.style.display = 'none';
            });
        }

        // Evento para la vista previa de la ecuación
        const equationInput = document.getElementById('equationInput');
        const equationPreview = document.getElementById('equationPreview');

        if (equationInput && equationPreview) {
            equationInput.addEventListener('input', () => {
                const latex = equationInput.value;
                if (latex.trim() === '') {
                    equationPreview.innerHTML = '<div class="text-center text-muted"><small>La vista previa aparecerá aquí</small></div>';
                } else {
                    equationPreview.innerHTML = `<span class="math-preview">$$${latex}$$</span>`;
                    // Renderizar la ecuación con MathJax si está disponible
                    if (typeof MathJax !== 'undefined') {
                        MathJax.typeset([equationPreview]);
                    }
                }
            });
        }

        // Evento para insertar la ecuación
        const insertEquationModalBtn = document.getElementById('insertEquationModalBtn');

        if (insertEquationModalBtn && equationInput) {
            insertEquationModalBtn.addEventListener('click', () => {
                const latex = equationInput.value;
                if (latex.trim() !== '') {
                    const editorContent = document.getElementById('textEditorContent');
                    if (editorContent && window.currentTextEditor) {
                        // Crear un span renderizable para la ecuación
                        const equationSpan = document.createElement('span');
                        equationSpan.className = 'math-equation';
                        equationSpan.setAttribute('data-latex', latex);

                        // Usar doble dólar para modo display
                        equationSpan.innerHTML = `$$${latex}$$`;

                        // Forzar el foco en el editor
                        editorContent.focus();

                        // Insertar la ecuación
                        window.currentTextEditor.insertNodeAtCursor(equationSpan);

                        // Agregar un espacio después de la ecuación para permitir seguir escribiendo
                        const spaceNode = document.createTextNode(' ');
                        editorContent.appendChild(spaceNode);

                        // Sincronizar el contenido
                        window.currentTextEditor.syncContent();

                        // Renderizar la ecuación con MathJax
                        if (typeof MathJax !== 'undefined') {
                            MathJax.typeset([equationSpan]);
                        }
                    }
                }
                equationModal.style.display = 'none';
            });
        }
    }
}

// Función para reconectar eventos de plantillas LaTeX
function reconnectLatexTemplatesEvents() {
    const latexTemplatesBtn = document.getElementById('latexTemplatesBtn');
    const latexTemplatesModal = document.getElementById('latexTemplatesModal');

    if (latexTemplatesBtn && latexTemplatesModal) {
        // Eliminar eventos existentes mediante clonación
        const newLatexTemplatesBtn = latexTemplatesBtn.cloneNode(true);
        latexTemplatesBtn.parentNode.replaceChild(newLatexTemplatesBtn, latexTemplatesBtn);

        // Agregar nuevo evento de clic
        newLatexTemplatesBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Asegurarse que el editor tenga el foco para la inserción posterior
            const editorContent = document.getElementById('textEditorContent');
            if (editorContent) {
                editorContent.focus();
            }

            // Mostrar el modal
            latexTemplatesModal.style.display = 'block';

            // Renderizar las ecuaciones con MathJax si está disponible
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }
        });

        // Eventos para cerrar el modal
        const closeLatexTemplatesModal = document.getElementById('closeLatexTemplatesModal');
        const cancelLatexTemplatesBtn = document.getElementById('cancelLatexTemplatesBtn');

        if (closeLatexTemplatesModal) {
            closeLatexTemplatesModal.addEventListener('click', () => {
                latexTemplatesModal.style.display = 'none';
            });
        }

        if (cancelLatexTemplatesBtn) {
            cancelLatexTemplatesBtn.addEventListener('click', () => {
                latexTemplatesModal.style.display = 'none';
            });
        }

        // Eventos para las pestañas
        const tabButtons = latexTemplatesModal.querySelectorAll('.latex-tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;

                // Quitar clase activa de todos los botones
                tabButtons.forEach(btn => btn.classList.remove('active'));
                // Agregar clase activa al botón clickeado
                button.classList.add('active');

                // Ocultar todos los tabs
                latexTemplatesModal.querySelectorAll('.latex-templates-tab').forEach(tabContent => {
                    tabContent.style.display = 'none';
                });

                // Mostrar el tab seleccionado
                const selectedTab = document.getElementById(`${tab}-tab`);
                if (selectedTab) {
                    selectedTab.style.display = 'block';
                }
            });
        });

        // Eventos para los elementos de plantilla
        latexTemplatesModal.querySelectorAll('.latex-template-item').forEach(item => {
            item.addEventListener('click', () => {
                const latex = item.dataset.latex;
                if (latex) {
                    const editorContent = document.getElementById('textEditorContent');
                    if (editorContent && window.currentTextEditor) {
                        // Crear un span renderizable para la ecuación
                        const equationSpan = document.createElement('span');
                        equationSpan.className = 'math-equation';
                        equationSpan.setAttribute('data-latex', latex);

                        // Usar doble dólar para modo display
                        equationSpan.innerHTML = `$$${latex}$$`;

                        // Forzar el foco en el editor
                        editorContent.focus();

                        // Insertar la ecuación
                        window.currentTextEditor.insertNodeAtCursor(equationSpan);

                        // Agregar un espacio después de la ecuación para permitir seguir escribiendo
                        const spaceNode = document.createTextNode(' ');
                        window.currentTextEditor.insertNodeAtCursor(spaceNode);

                        // Sincronizar el contenido
                        window.currentTextEditor.syncContent();

                        // Renderizar la ecuación con MathJax
                        if (typeof MathJax !== 'undefined') {
                            MathJax.typeset([equationSpan]);
                        }
                    }
                }
                latexTemplatesModal.style.display = 'none';
            });
        });
    }
}

// Asegurarnos de que el editor se inicialice correctamente
document.addEventListener('DOMContentLoaded', () => {
    // El editor se inicializará cuando se llame a la función initTextEditor
});

