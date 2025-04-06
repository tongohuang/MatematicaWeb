/**
 * Editor de Ecuaciones Matemáticas para WebMatematica
 * Este editor proporciona una interfaz visual para crear y editar ecuaciones matemáticas
 * sin necesidad de conocer la sintaxis LaTeX.
 */

class EquationEditor {
    constructor(options = {}) {
        this.options = Object.assign({
            container: null,
            initialLatex: '',
            mathJaxOutput: true,
            outputContainer: null,
            toolbarItems: [
                'basic', 'greek', 'operators', 'relations', 'advanced', 'templates'
            ],
            onChange: null,
            darkMode: false,
            autoRender: true
        }, options);
        
        this.container = typeof this.options.container === 'string' ? 
            document.querySelector(this.options.container) : this.options.container;
            
        if (!this.container) {
            console.error('Contenedor no encontrado para EquationEditor');
            return;
        }
        
        this.outputContainer = typeof this.options.outputContainer === 'string' ? 
            document.querySelector(this.options.outputContainer) : this.options.outputContainer;
            
        this.mathField = null;
        this.currentLatex = this.options.initialLatex || '';
        this.lastFocusedElement = null;
        
        // Definir plantillas comunes de LaTeX
        this.templates = [
            { name: 'Fracción', latex: '\\frac{a}{b}', icon: '<span>$\\frac{a}{b}$</span>' },
            { name: 'Raíz cuadrada', latex: '\\sqrt{x}', icon: '<span>$\\sqrt{x}$</span>' },
            { name: 'Raíz n-ésima', latex: '\\sqrt[n]{x}', icon: '<span>$\\sqrt[n]{x}$</span>' },
            { name: 'Potencia', latex: 'x^{n}', icon: '<span>$x^{n}$</span>' },
            { name: 'Subíndice', latex: 'x_{i}', icon: '<span>$x_{i}$</span>' },
            { name: 'Integral', latex: '\\int_{a}^{b} f(x) dx', icon: '<span>$\\int_{a}^{b}$</span>' },
            { name: 'Suma', latex: '\\sum_{i=1}^{n} x_i', icon: '<span>$\\sum_{i}^{n}$</span>' },
            { name: 'Producto', latex: '\\prod_{i=1}^{n} x_i', icon: '<span>$\\prod_{i}^{n}$</span>' },
            { name: 'Límite', latex: '\\lim_{x \\to a} f(x)', icon: '<span>$\\lim_{x \\to a}$</span>' },
            { name: 'Matriz 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', icon: '<span>$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$</span>' },
            { name: 'Sistema de ecuaciones', latex: '\\begin{cases} a + b = c \\\\ d + e = f \\end{cases}', icon: '<span>$\\begin{cases} a \\\\ b \\end{cases}$</span>' },
            { name: 'Derivada', latex: '\\frac{d}{dx}f(x)', icon: '<span>$\\frac{d}{dx}$</span>' },
            { name: 'Parcial', latex: '\\frac{\\partial f}{\\partial x}', icon: '<span>$\\frac{\\partial f}{\\partial x}$</span>' }
        ];
        
        this.init();
    }
    
    init() {
        // Cargar MathJax si no está disponible
        this.loadMathJax();
        
        // Cargar MathQuill si no está disponible
        this.loadMathQuill();
        
        // Renderizar el editor
        this.render();
        
        // Aplicar tema oscuro si está habilitado
        if (this.options.darkMode) {
            this.applyDarkMode();
        }
    }
    
    loadMathJax() {
        // Si MathJax no está cargado, cargar el CDN
        if (typeof MathJax === 'undefined') {
            console.info('Cargando MathJax desde CDN...');
            
            // Configuración para MathJax v3
            window.MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    processEscapes: true,
                    processEnvironments: true
                },
                options: {
                    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                    processHtmlClass: 'tex2jax_process'
                }
            };
            
            // Cargar MathJax v3
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }
    
    loadMathQuill() {
        // Si MathQuill no está cargado, cargar el CDN
        if (typeof MathQuill === 'undefined') {
            console.info('Cargando MathQuill desde CDN...');
            
            // jQuery es necesario para MathQuill
            if (typeof jQuery === 'undefined') {
                const jqueryScript = document.createElement('script');
                jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
                document.head.appendChild(jqueryScript);
                
                // Esperar a que jQuery se cargue y luego cargar MathQuill
                jqueryScript.onload = () => {
                    this.loadMathQuillScript();
                };
            } else {
                this.loadMathQuillScript();
            }
        }
    }
    
    loadMathQuillScript() {
        // Cargar los estilos de MathQuill
        const mqStyles = document.createElement('link');
        mqStyles.rel = 'stylesheet';
        mqStyles.href = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.css';
        document.head.appendChild(mqStyles);
        
        // Cargar el script de MathQuill
        const mqScript = document.createElement('script');
        mqScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js';
        document.head.appendChild(mqScript);
        
        // Reintentar la inicialización cuando MathQuill se haya cargado
        mqScript.onload = () => {
            this.render();
            this.initMathField();
        };
    }
    
    render() {
        // Crear la estructura del editor
        this.container.innerHTML = `
            <div class="equation-editor ${this.options.darkMode ? 'dark-mode' : ''}">
                <div class="equation-editor-toolbar">
                    ${this.renderToolbar()}
                </div>
                <div class="equation-editor-content">
                    <div class="equation-editor-input" id="${this.getInputId()}"></div>
                    ${this.options.mathJaxOutput && this.outputContainer ? '' : `
                    <div class="equation-editor-output">
                        <div class="equation-editor-preview">
                            <div class="equation-preview-title">Vista previa:</div>
                            <div class="equation-preview-content" id="${this.getPreviewId()}"></div>
                        </div>
                        <div class="equation-editor-latex">
                            <div class="equation-latex-title">LaTeX:</div>
                            <div class="equation-latex-content">
                                <code id="${this.getLatexId()}"></code>
                                <button class="btn-copy-latex" title="Copiar código LaTeX">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    `}
                </div>
            </div>
        `;
        
        this.initMathField();
        this.initToolbarEvents();
        
        // Si tenemos un contenedor de salida externo, configurarlo
        if (this.options.mathJaxOutput && this.outputContainer) {
            this.outputContainer.innerHTML = `
                <div class="equation-preview-content" id="${this.getPreviewId()}"></div>
                <input type="hidden" id="${this.getLatexId()}" value="${this.currentLatex}">
            `;
        }
        
        // Actualizar la vista previa con el LaTeX inicial
        this.updatePreview();
        
        // Eventos para copiar LaTeX
        const copyButton = this.container.querySelector('.btn-copy-latex');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const latexCode = this.currentLatex;
                navigator.clipboard.writeText(latexCode).then(() => {
                    // Mostrar feedback
                    const originalTitle = copyButton.getAttribute('title');
                    copyButton.setAttribute('title', '¡Copiado!');
                    setTimeout(() => {
                        copyButton.setAttribute('title', originalTitle);
                    }, 2000);
                });
            });
        }
    }
    
    renderToolbar() {
        let toolbar = '';
        
        // Si hay toolbarItems, solo incluir los que están en la lista
        const items = this.options.toolbarItems;
        
        if (items.includes('basic')) {
            toolbar += `
                <div class="equation-editor-toolbar-group">
                    <button type="button" class="equation-editor-btn" data-latex="+" title="Suma">+</button>
                    <button type="button" class="equation-editor-btn" data-latex="-" title="Resta">−</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\cdot" title="Multiplicación">×</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\div" title="División">÷</button>
                    <button type="button" class="equation-editor-btn" data-latex="=" title="Igual">=</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\neq" title="Distinto">≠</button>
                </div>
            `;
        }
        
        if (items.includes('greek')) {
            toolbar += `
                <div class="equation-editor-toolbar-group">
                    <button type="button" class="equation-editor-btn" data-latex="\\alpha" title="Alpha">α</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\beta" title="Beta">β</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\gamma" title="Gamma">γ</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\delta" title="Delta">δ</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\theta" title="Theta">θ</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\pi" title="Pi">π</button>
                </div>
            `;
        }
        
        if (items.includes('operators')) {
            toolbar += `
                <div class="equation-editor-toolbar-group">
                    <button type="button" class="equation-editor-btn" data-latex="\\frac{}{}" title="Fracción">$\\frac{a}{b}$</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\sqrt{}" title="Raíz cuadrada">$\\sqrt{x}$</button>
                    <button type="button" class="equation-editor-btn" data-latex="^{}" title="Superíndice">$x^n$</button>
                    <button type="button" class="equation-editor-btn" data-latex="_{}" title="Subíndice">$x_i$</button>
                </div>
            `;
        }
        
        if (items.includes('relations')) {
            toolbar += `
                <div class="equation-editor-toolbar-group">
                    <button type="button" class="equation-editor-btn" data-latex="\\lt" title="Menor que">$<$</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\gt" title="Mayor que">$>$</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\leq" title="Menor o igual que">$\\leq$</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\geq" title="Mayor o igual que">$\\geq$</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\approx" title="Aproximadamente igual">$\\approx$</button>
                </div>
            `;
        }
        
        if (items.includes('advanced')) {
            toolbar += `
                <div class="equation-editor-toolbar-group">
                    <button type="button" class="equation-editor-btn" data-latex="\\int_{a}^{b}" title="Integral">$\\int$</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\sum_{i=1}^{n}" title="Sumatoria">$\\sum$</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\prod_{i=1}^{n}" title="Productoria">$\\prod$</button>
                    <button type="button" class="equation-editor-btn" data-latex="\\lim_{x \\to a}" title="Límite">$\\lim$</button>
                </div>
            `;
        }
        
        if (items.includes('templates')) {
            toolbar += `
                <div class="equation-editor-toolbar-group">
                    <div class="equation-editor-dropdown">
                        <button type="button" class="equation-editor-btn" id="templatesDropdownBtn">
                            <i class="fas fa-th-large"></i> Plantillas
                        </button>
                        <div class="equation-editor-dropdown-content" id="templatesDropdown">
                            ${this.renderTemplates()}
                        </div>
                    </div>
                </div>
            `;
        }
        
        return toolbar;
    }
    
    renderTemplates() {
        return this.templates.map(template => `
            <div class="equation-template" data-latex="${template.latex}" title="${template.name}">
                ${template.icon}
            </div>
        `).join('');
    }
    
    initToolbarEvents() {
        // Botones de LaTeX
        this.container.querySelectorAll('.equation-editor-btn[data-latex]').forEach(button => {
            button.addEventListener('click', () => {
                const latex = button.getAttribute('data-latex');
                if (this.mathField) {
                    // Restaurar el enfoque si se perdió
                    this.mathField.focus();
                    // Escribir la expresión LaTeX
                    this.mathField.write(latex);
                    // Actualizar la vista previa
                    this.updatePreview();
                }
            });
        });
        
        // Dropdown de plantillas
        const templatesBtn = this.container.querySelector('#templatesDropdownBtn');
        const templatesDropdown = this.container.querySelector('#templatesDropdown');
        
        if (templatesBtn && templatesDropdown) {
            templatesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                templatesDropdown.classList.toggle('show');
            });
            
            // Cerrar al hacer clic fuera
            document.addEventListener('click', () => {
                templatesDropdown.classList.remove('show');
            });
            
            // Prevenir cierre al hacer clic dentro del dropdown
            templatesDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Eventos para las plantillas
            this.container.querySelectorAll('.equation-template').forEach(template => {
                template.addEventListener('click', () => {
                    const latex = template.getAttribute('data-latex');
                    if (this.mathField) {
                        // Restaurar el enfoque
                        this.mathField.focus();
                        // Escribir la plantilla
                        this.mathField.write(latex);
                        // Cerrar el dropdown
                        templatesDropdown.classList.remove('show');
                        // Actualizar la vista previa
                        this.updatePreview();
                    }
                });
            });
        }
    }
    
    initMathField() {
        // Asegurarse de que MathQuill esté disponible
        if (typeof MathQuill === 'undefined') {
            console.error('MathQuill no está disponible');
            return;
        }
        
        // Inicializar el campo matemático
        const MQ = MathQuill.getInterface(2);
        const mathFieldElement = document.getElementById(this.getInputId());
        
        this.mathField = MQ.MathField(mathFieldElement, {
            spaceBehavesLikeTab: true,
            handlers: {
                edit: () => {
                    this.currentLatex = this.mathField.latex();
                    this.updatePreview();
                    
                    if (typeof this.options.onChange === 'function') {
                        this.options.onChange(this.currentLatex);
                    }
                },
                enter: () => {
                    // Opcionalmente manejar el evento Enter
                    return false;
                }
            }
        });
        
        // Establecer el LaTeX inicial
        if (this.options.initialLatex) {
            this.mathField.latex(this.options.initialLatex);
        }
        
        // Dar foco al campo
        setTimeout(() => {
            this.mathField.focus();
        }, 100);
    }
    
    updatePreview() {
        const latexElement = document.getElementById(this.getLatexId());
        const previewElement = document.getElementById(this.getPreviewId());
        
        if (latexElement) {
            if (latexElement.tagName.toLowerCase() === 'input') {
                latexElement.value = this.currentLatex;
            } else {
                latexElement.textContent = this.currentLatex;
            }
        }
        
        if (previewElement) {
            // Actualizar la vista previa con MathJax
            previewElement.innerHTML = '\\(' + this.currentLatex + '\\)';
            
            // Renderizar con MathJax si está disponible
            if (typeof MathJax !== 'undefined') {
                if (typeof MathJax.typesetPromise === 'function') {
                    // MathJax v3
                    MathJax.typesetPromise([previewElement]).catch(err => {
                        console.error('Error al renderizar ecuación:', err);
                    });
                } else if (typeof MathJax.Hub !== 'undefined') {
                    // MathJax v2
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, previewElement]);
                }
            }
        }
    }
    
    getLatex() {
        return this.currentLatex;
    }
    
    setLatex(latex) {
        this.currentLatex = latex;
        if (this.mathField) {
            this.mathField.latex(latex);
        }
        this.updatePreview();
    }
    
    applyDarkMode() {
        this.container.querySelector('.equation-editor').classList.add('dark-mode');
        
        // Aplicar estilos adicionales para modo oscuro
        const style = document.createElement('style');
        style.textContent = `
            .equation-editor.dark-mode {
                background-color: #2d2d2d;
                color: #e0e0e0;
            }
            .equation-editor.dark-mode .equation-editor-toolbar {
                background-color: #1e1e1e;
                border-color: #444;
            }
            .equation-editor.dark-mode .equation-editor-btn {
                color: #e0e0e0;
                background-color: #3a3a3a;
                border-color: #555;
            }
            .equation-editor.dark-mode .equation-editor-btn:hover {
                background-color: #4a4a4a;
            }
            .equation-editor.dark-mode .equation-editor-input {
                background-color: #2d2d2d;
                color: #e0e0e0;
                border-color: #444;
            }
            .equation-editor.dark-mode .equation-editor-output {
                background-color: #2d2d2d;
                border-color: #444;
            }
            .equation-editor.dark-mode .equation-preview-content {
                color: #e0e0e0;
            }
            .equation-editor.dark-mode .equation-editor-dropdown-content {
                background-color: #2d2d2d;
                border-color: #444;
            }
            .equation-editor.dark-mode .equation-template {
                background-color: #3a3a3a;
                border-color: #555;
                color: #e0e0e0;
            }
            .equation-editor.dark-mode .equation-template:hover {
                background-color: #4a4a4a;
            }
        `;
        document.head.appendChild(style);
    }
    
    getInputId() {
        return 'equation-input-' + this.getUniqueId();
    }
    
    getPreviewId() {
        return 'equation-preview-' + this.getUniqueId();
    }
    
    getLatexId() {
        return 'equation-latex-' + this.getUniqueId();
    }
    
    getUniqueId() {
        if (!this._uniqueId) {
            this._uniqueId = 'eq_' + Math.random().toString(36).substr(2, 9);
        }
        return this._uniqueId;
    }
}

// Exportar la clase para su uso
window.EquationEditor = EquationEditor; 