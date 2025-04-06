/**
 * Editor Loader - Sistema optimizado de carga lazy para el editor matemático
 * v1.0.1 - Actualizado para usar CDNs
 */

// Configuración global para reducir logs en producción
(function() {
    // Solo ejecutar en producción, en desarrollo mantener todos los logs
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    
    if (!isDevelopment) {
        // Almacenar las funciones originales de console
        const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
        };
        
        // Sobrescribir funciones para filtrar logs menos importantes
        console.log = function(...args) {
            // En producción, solo registrar mensajes críticos o errores
            if (args[0] && typeof args[0] === 'string' && 
                (args[0].includes('ERROR') || args[0].includes('CRITICAL'))) {
                originalConsole.log.apply(console, args);
            }
        };
        
        console.info = function(...args) {
            // Permitir solo mensajes informativos importantes
            if (args[0] && typeof args[0] === 'string' && args[0].includes('IMPORTANTE')) {
                originalConsole.info.apply(console, args);
            }
        };
        
        // Mantener warnings y errores siempre visibles
        // pero podríamos filtrarlos si fuera necesario
    }
})();

// Sistema de gestión de recursos
window.ResourceManager = {
    loadedScripts: {},
    loadedStyles: {},
    
    // Cargar un script de forma asíncrona
    loadScript: function(url, options = {}) {
        if (this.loadedScripts[url]) {
            return this.loadedScripts[url]; // Devolver promesa existente
        }
        
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = options.async !== false;
            
            script.onload = () => {
                console.log(`Script cargado: ${url}`);
                resolve(script);
            };
            
            script.onerror = (error) => {
                console.error(`Error al cargar script: ${url}`, error);
                reject(new Error(`Error al cargar script: ${url}`));
            };
            
            document.head.appendChild(script);
        });
        
        this.loadedScripts[url] = promise;
        return promise;
    },
    
    // Cargar una hoja de estilos
    loadStyle: function(url) {
        if (this.loadedStyles[url]) {
            return this.loadedStyles[url];
        }
        
        const promise = new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            
            link.onload = () => {
                console.log(`Estilo cargado: ${url}`);
                resolve(link);
            };
            
            link.onerror = (error) => {
                console.error(`Error al cargar estilo: ${url}`, error);
                reject(new Error(`Error al cargar estilo: ${url}`));
            };
            
            document.head.appendChild(link);
        });
        
        this.loadedStyles[url] = promise;
        return promise;
    },
    
    // Cargar múltiples recursos en paralelo
    loadResources: function(resources) {
        const promises = [];
        
        resources.forEach(resource => {
            if (resource.type === 'script') {
                promises.push(this.loadScript(resource.url, resource.options));
            } else if (resource.type === 'style') {
                promises.push(this.loadStyle(resource.url));
            }
        });
        
        return Promise.all(promises);
    }
};

// Sistema centralizado de limpieza
window.runCleanup = function() {
    console.log("Ejecutando limpieza centralizada...");
    
    // Limpiar editor matemático si existe
    if (typeof window.cleanupMathEditor === 'function') {
        try {
            window.cleanupMathEditor();
            console.log("Editor matemático limpiado correctamente");
        } catch (error) {
            console.error("Error al limpiar editor existente:", error);
        }
    }
    
    // Remover elementos relacionados con el editor
    ['colorPalette', 'mathSymbolsDropdown', 'equationModal', 
     'tableModal', 'latexTemplatesModal'].forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.remove();
            console.log(`Elemento #${elementId} removido`);
        }
    });
    
    // Remover cualquier instancia previa del editor matemático
    const previousEditor = document.querySelector('.math-editor-container');
    if (previousEditor) {
        console.log("Removiendo editor matemático previo del DOM");
        previousEditor.remove();
    }
    
    // Remover eventos que puedan haber quedado registrados
    const formatButtons = document.querySelectorAll('.format-button');
    if (formatButtons.length > 0) {
        formatButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
        console.log(`${formatButtons.length} botones de formato reiniciados`);
    }
    
    // Eliminar cualquier listener de eventos global
    if (window._editorEventListeners) {
        window._editorEventListeners.forEach(listener => {
            if (listener.element && listener.type && listener.callback) {
                listener.element.removeEventListener(listener.type, listener.callback);
            }
        });
        window._editorEventListeners = [];
        console.log("Listeners de eventos globales eliminados");
    }
};

// Recursos necesarios para el editor (usando CDNs)
const editorDependencies = [
    // jQuery (necesario para algunas funcionalidades del editor)
    { type: 'script', url: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js' },
    
    // Estilos del editor matemático
    { type: 'style', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' },
    
    // El script math-editor.js (usando el JS local si existe, o un placeholder)
    { type: 'script', url: '../js/math-editor.js', options: { async: true, onerror: function() {
        console.warn("No se pudo cargar el script local math-editor.js, usando fallback");
        window.initNewMathEditor = function(targetId) {
            console.log("Inicializando editor básico (fallback) para", targetId);
            const textarea = document.getElementById(targetId);
            if (!textarea) return false;
            
            // Crear un editor básico
            const editorContainer = document.createElement('div');
            editorContainer.className = 'math-editor-container';
            editorContainer.style.border = '1px solid #ced4da';
            editorContainer.style.borderRadius = '0.25rem';
            
            // Crear toolbar básica
            const toolbar = document.createElement('div');
            toolbar.className = 'math-editor-toolbar';
            toolbar.style.padding = '5px';
            toolbar.style.borderBottom = '1px solid #ced4da';
            toolbar.style.backgroundColor = '#f8f9fa';
            
            // Crear área editable
            const editor = document.createElement('div');
            editor.id = 'mathEditorContent';
            editor.contentEditable = 'true';
            editor.style.padding = '10px';
            editor.style.minHeight = '200px';
            editor.dataset.targetTextareaId = targetId;
            
            // Mostrar el contenido inicial del textarea
            editor.innerHTML = textarea.value || '';
            
            // Añadir elementos al contenedor
            editorContainer.appendChild(toolbar);
            editorContainer.appendChild(editor);
            
            // Reemplazar el textarea por el editor
            textarea.parentNode.insertBefore(editorContainer, textarea);
            textarea.style.display = 'none';
            
            // Evento para sincronizar con el textarea
            editor.addEventListener('input', function() {
                textarea.value = editor.innerHTML;
            });
            
            return true;
        };
        
        window.cleanupMathEditor = function() {
            console.log("Ejecutando limpieza básica del editor (fallback)");
            const editorContainer = document.querySelector('.math-editor-container');
            if (editorContainer) {
                editorContainer.remove();
            }
        };
    }}}
];

// Función para cargar dependencias del editor
window.loadEditorDependencies = function() {
    console.log("Iniciando carga de dependencias del editor...");
    return window.ResourceManager.loadResources(editorDependencies);
};

// Verificar MathJax y configurarlo si es necesario
window.configureMathJax = function() {
    return new Promise((resolve, reject) => {
        if (window.MathJax) {
            console.log("MathJax ya está cargado, configurando...");
            
            // Configurar MathJax
            window.MathJax.Hub.Config({
                tex2jax: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    processEscapes: true
                },
                messageStyle: "none",
                showProcessingMessages: false,
                "fast-preview": { disabled: true },
                "CommonHTML": { linebreaks: { automatic: true } }
            });
            
            // Reiniciar MathJax
            if (typeof window.MathJax.Hub.Queue === 'function') {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }
            
            resolve(window.MathJax);
        } else {
            console.log("MathJax no está cargado, cargándolo...");
            window.ResourceManager.loadScript('https://cdn.jsdelivr.net/npm/mathjax@3.2.0/es5/tex-mml-chtml.js')
                .then(() => {
                    window.configureMathJax();
                    resolve(window.MathJax);
                })
                .catch(error => {
                    console.error("Error al cargar MathJax:", error);
                    reject(error);
                });
        }
    });
};

// Función para crear un editor básico si todo lo demás falla
window.createBasicEditor = function(targetId) {
    console.log("Creando un editor básico para", targetId);
    const textarea = document.getElementById(targetId);
    if (!textarea) return false;
    
    // Crear un contenedor para el editor
    const container = document.createElement('div');
    container.className = 'basic-editor-container';
    container.style.border = '1px solid #ced4da';
    container.style.borderRadius = '4px';
    container.style.marginBottom = '1rem';
    
    // Crear barra de herramientas simple
    const toolbar = document.createElement('div');
    toolbar.className = 'basic-editor-toolbar';
    toolbar.style.padding = '8px';
    toolbar.style.backgroundColor = '#f8f9fa';
    toolbar.style.borderBottom = '1px solid #ced4da';
    
    // Botones de formato básicos
    const buttons = [
        { command: 'bold', icon: 'fas fa-bold', title: 'Negrita' },
        { command: 'italic', icon: 'fas fa-italic', title: 'Cursiva' },
        { command: 'underline', icon: 'fas fa-underline', title: 'Subrayado' },
        { command: 'strikethrough', icon: 'fas fa-strikethrough', title: 'Tachado' },
        { command: 'justifyLeft', icon: 'fas fa-align-left', title: 'Alinear a la izquierda' },
        { command: 'justifyCenter', icon: 'fas fa-align-center', title: 'Centrar' },
        { command: 'justifyRight', icon: 'fas fa-align-right', title: 'Alinear a la derecha' }
    ];
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'basic-editor-btn';
        button.style.border = 'none';
        button.style.background = 'none';
        button.style.padding = '4px 8px';
        button.style.cursor = 'pointer';
        button.style.margin = '0 2px';
        button.title = btn.title;
        button.innerHTML = `<i class="${btn.icon}"></i>`;
        
        button.addEventListener('click', function() {
            document.execCommand(btn.command);
            editor.focus();
        });
        
        toolbar.appendChild(button);
    });
    
    // Crear área editable
    const editor = document.createElement('div');
    editor.contentEditable = 'true';
    editor.style.padding = '10px';
    editor.style.minHeight = '200px';
    editor.style.outline = 'none';
    editor.innerHTML = textarea.value;
    
    // Vincular eventos para sincronizar con el textarea
    editor.addEventListener('input', function() {
        textarea.value = this.innerHTML;
    });
    
    // Ensamblar el editor
    container.appendChild(toolbar);
    container.appendChild(editor);
    
    // Reemplazar el textarea con el editor
    textarea.parentNode.insertBefore(container, textarea);
    textarea.style.display = 'none';
    
    console.log("Editor básico creado con éxito");
    return true;
};

// Mensaje de inicio
console.log("Sistema de carga lazy para editor inicializado correctamente"); 