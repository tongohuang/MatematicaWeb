/**
 * Editor de texto enriquecido con soporte matemático para WebMatematica
 * Utiliza MathQuill para edición de ecuaciones y tiene soporte para formateo de texto
 */

// Asegurarse de que las bibliotecas necesarias estén cargadas
document.addEventListener('DOMContentLoaded', function() {
  // Establecer un valor por defecto para window._mathEditorTargetId si no existe
  if (typeof window._mathEditorTargetId === 'undefined') {
    window._mathEditorTargetId = 'textContent'; // ID por defecto
    console.log("DOMContentLoaded: Estableciendo ID de textarea por defecto a 'textContent'");
  }

  // Asegurarse de que FontAwesome esté cargado
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);
  }

  // Cargar MathQuill y sus dependencias dinámicamente si no están ya cargadas
  loadDependencies().then(() => {
    console.log("Dependencias cargadas. Creando editor matemático...");
    createMathEditor(window._mathEditorTargetId);
  }).catch(error => {
    console.error("Error al cargar dependencias:", error);
    if (window._mathEditorTargetId) {
      initializeMathEditor(window._mathEditorTargetId);
    } else {
      console.log("MathQuill cargado, pero no hay targetId para inicializar MathEditor");
    }
  });
});

function loadDependencies() {
  return new Promise((resolve, reject) => {
    try {
      console.log("Iniciando carga de dependencias...");
      
      // Verificar si jQuery está disponible
      if (typeof jQuery === 'undefined') {
        console.log("jQuery no está disponible, cargándolo...");
        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqueryScript.onload = function() {
          console.log("jQuery cargado exitosamente");
          // Ahora cargar MathQuill
          loadMathQuillWithPromise().then(resolve).catch(reject);
        };
        jqueryScript.onerror = function() {
          console.error("Error al cargar jQuery");
          reject(new Error("Error al cargar jQuery"));
        };
        document.head.appendChild(jqueryScript);
      } else {
        console.log("jQuery ya está disponible");
        if (typeof MathQuill === 'undefined') {
          loadMathQuillWithPromise().then(resolve).catch(reject);
        } else {
          console.log("MathQuill ya está disponible");
          resolve(); // Todas las dependencias ya están cargadas
        }
      }
    } catch (error) {
      console.error("Error en loadDependencies:", error);
      reject(error);
    }
  });
}

function loadMathQuillWithPromise() {
  return new Promise((resolve, reject) => {
    console.log("Cargando MathQuill...");
    // Cargar MathQuill CSS
    const mathquillCSS = document.createElement('link');
    mathquillCSS.rel = 'stylesheet';
    mathquillCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.css';
    document.head.appendChild(mathquillCSS);
    
    // Cargar MathQuill JS
    const mathquillScript = document.createElement('script');
    mathquillScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js';
    mathquillScript.onload = function() {
      console.log("MathQuill cargado exitosamente");
      resolve();
    };
    mathquillScript.onerror = function() {
      console.error("Error al cargar MathQuill");
      reject(new Error("Error al cargar MathQuill"));
    };
    document.head.appendChild(mathquillScript);
  });
}

function initializeMathEditor(targetTextareaId) { // Acepta el ID del textarea
  // Inicializar cuando se añade una nueva sección de texto
  if (typeof MathQuill !== 'undefined') {
    window.MQ = MathQuill.getInterface(2);
    
    // Verificar si el contenedor del editor existe
    const textEditorContainer = document.getElementById('textEditorContainer');
    if (textEditorContainer && targetTextareaId) { // Verificar que tenemos el ID
      console.log(`Inicializando editor para textarea con ID: ${targetTextareaId}`);
      createMathEditor(targetTextareaId); // Pasar el ID a createMathEditor
    } else {
        if (!textEditorContainer) console.error("initializeMathEditor: Contenedor #textEditorContainer no encontrado.");
        if (!targetTextareaId) console.error("initializeMathEditor: No se proporcionó targetTextareaId.");
    }
  }
}

function createMathEditor(targetTextareaId) {
  // Verificar si targetTextareaId es undefined o vacío
  if (!targetTextareaId) {
    targetTextareaId = 'textContent'; // Valor por defecto
    console.log("createMathEditor: No se proporcionó ID de textarea, usando 'textContent' como valor por defecto");
  }
  
  console.log(`Creando editor matemático para textarea: ${targetTextareaId}`);
  
  // Verificar que el textarea exista antes de continuar
  let textareaElement = document.getElementById(targetTextareaId);
  
  // Si no existe el textarea, crear uno nuevo
  if (!textareaElement) {
    console.log(`Textarea con ID ${targetTextareaId} no encontrado. Creando uno nuevo...`);
    textareaElement = document.createElement('textarea');
    textareaElement.id = targetTextareaId;
    textareaElement.name = targetTextareaId;
    textareaElement.style.display = 'none';
    document.body.appendChild(textareaElement);
    console.log(`Textarea creado con ID: ${targetTextareaId}`);
  }
  
  // Guardar el contenido original del textarea para asegurarnos de no perderlo
  const originalContent = textareaElement.value || '';
  console.log(`Contenido original del textarea (longitud: ${originalContent.length}):`, 
              originalContent.length > 50 ? originalContent.substring(0, 50) + '...' : originalContent);
  
  // Crear el contenedor para el editor
  const editorContainer = document.createElement('div');
  editorContainer.className = 'math-editor-container';
  
  // Crear la barra de herramientas
  const toolbar = createToolbar();
  editorContainer.appendChild(toolbar);
  
  // Crear paleta de colores (oculta inicialmente)
  createColorPalette();
  
  // Crear dropdown de símbolos matemáticos (oculto inicialmente)
  createMathSymbolsDropdown();
  
  // Crear modales para ecuaciones y tablas
  createEquationModal();
  createTableModal();
  createLatexTemplatesModal();
  
  // Crear el área editable
  const editorContent = document.createElement('div');
  editorContent.id = 'mathEditorContent';
  editorContent.className = 'math-editor-content';
  editorContent.contentEditable = true;
  
  // IMPORTANTE: Guardamos el ID del textarea asociado en el dataset del editor
  editorContent.dataset.targetTextareaId = targetTextareaId;
  
  // Asegurarnos de que el contenido del texto esté limpio
  let cleanedContent = '';
  
  if (originalContent) {
    // Verificar si el contenido tiene formato HTML
    if (originalContent.includes('<') && originalContent.includes('>')) {
      try {
        // Crear un elemento temporal para procesar el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent;
        
        // Procesar elementos math-tex para asegurar que sean editables
        const mathElements = tempDiv.querySelectorAll('.math-tex');
        mathElements.forEach(element => {
          // Asegurar que el elemento es interactivo
          element.contentEditable = 'true';
          element.style.display = 'inline-block';
          element.style.cursor = 'text';
          element.style.userSelect = 'text';
          
          // Si hay anidamiento de .math-tex, corregirlo
          const nestedMathElements = element.querySelectorAll('.math-tex');
          if (nestedMathElements.length > 0) {
            // Conservar solo el contenido interno
            const latex = element.getAttribute('data-latex') || '';
            element.innerHTML = `\\(${latex}\\)`;
          }
        });
        
        cleanedContent = tempDiv.innerHTML;
      } catch (error) {
        console.error("Error al procesar el contenido HTML:", error);
        cleanedContent = originalContent; // Usar el contenido original en caso de error
      }
    } else {
      // Si no hay etiquetas HTML, usar el contenido original
      cleanedContent = originalContent;
    }
  }
  
  // Asegurarnos de transferir el contenido del textarea al editor
  if (cleanedContent && cleanedContent.trim() !== '') {
    console.log("Estableciendo contenido procesado en el editor");
    // Insertar el contenido directamente sin escapar HTML
    editorContent.innerHTML = cleanedContent;
  } else {
    console.log("El textarea está vacío, inicializando editor sin contenido");
    editorContent.innerHTML = '';
  }
  
  editorContainer.appendChild(editorContent);
  
  // Insertar el editor antes del textarea
  textareaElement.parentNode.insertBefore(editorContainer, textareaElement);
  textareaElement.style.display = 'none'; // Ocultar el textarea
  console.log("Editor insertado en el DOM antes del textarea");
  
  // Agregar estilos
  addDynamicStyles();
  
  // Agregar estilo para la toolbar
  applyToolbarStyle(toolbar);
  
  // Añadir función de limpieza al window para poder eliminar el editor si es necesario
  window.cleanupMathEditor = cleanupExistingEditor;
  
  // Inicializar los eventos del editor con un pequeño retraso
  setTimeout(() => {
    console.log("Inicializando eventos del editor...");
    initMathEditorEvents();
    
    // Renderizar ecuaciones existentes
    renderMathInEditor();
    
  }, 300);
  
  return editorContent;
}

function getMathToolbarHTML() {
  return `
    <!-- Text Formatting -->
    <div class="math-editor-toolbar-group">
      <button type="button" class="math-editor-btn" data-command="bold" title="Negrita"><i class="fa-solid fa-bold"></i></button>
      <button type="button" class="math-editor-btn" data-command="italic" title="Cursiva"><i class="fa-solid fa-italic"></i></button>
      <button type="button" class="math-editor-btn" data-command="underline" title="Subrayado"><i class="fa-solid fa-underline"></i></button>
      <button type="button" class="math-editor-btn" id="textColorBtn" title="Color de texto"><i class="fa-solid fa-palette"></i></button>
    </div>

    <!-- Lists -->
    <div class="math-editor-toolbar-group">
      <button type="button" class="math-editor-btn" data-command="insertUnorderedList" title="Lista con viñetas"><i class="fa-solid fa-list-ul"></i></button>
      <button type="button" class="math-editor-btn" data-command="insertOrderedList" title="Lista numerada"><i class="fa-solid fa-list-ol"></i></button>
    </div>

    <!-- Alignment -->
    <div class="math-editor-toolbar-group">
      <button type="button" class="math-editor-btn" data-command="justifyLeft" title="Alinear a la izquierda"><i class="fa-solid fa-align-left"></i></button>
      <button type="button" class="math-editor-btn" data-command="justifyCenter" title="Centrar"><i class="fa-solid fa-align-center"></i></button>
      <button type="button" class="math-editor-btn" data-command="justifyRight" title="Alinear a la derecha"><i class="fa-solid fa-align-right"></i></button>
    </div>

    <!-- Math & Objects -->
    <div class="math-editor-toolbar-group">
       <button type="button" class="math-editor-btn" id="mathSymbolsBtn" title="Insertar símbolos matemáticos"><i class="fa-solid fa-calculator"></i></button>
       <button type="button" class="math-editor-btn" id="insertEquationBtn" title="Insertar ecuación (LaTeX)"><i class="fa-solid fa-square-root-variable"></i></button>
       <button type="button" class="math-editor-btn" id="insertFractionBtn" title="Expresiones predeterminadas"><i class="fa-solid fa-superscript"></i></button>
       <button type="button" class="math-editor-btn" id="insertTableBtn" title="Insertar tabla"><i class="fa-solid fa-table"></i></button>
    </div>
  `;
}

function createColorPalette() {
  console.log("Creando paleta de colores mejorada...");
  
  // Remover paleta existente si hay
  const existingPalette = document.getElementById('colorPalette');
  if (existingPalette) {
    console.log("Removiendo paleta existente");
    existingPalette.remove();
  }
  
  // Crear la paleta de colores
  const colorPalette = document.createElement('div');
  colorPalette.id = 'colorPalette';
  colorPalette.className = 'color-palette';
  
  // Colores organizados en una matriz más clara
  const colors = [
    // Fila 1: Grises y negros
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', 
    // Fila 2: Blancos y grises claros
    '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    // Fila 3: Colores primarios y secundarios brillantes
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00',
    // Fila 4: Colores primarios y secundarios 
    '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    // Fila 5: Pasteles
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3',
    // Fila 6: Pasteles adicionales
    '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'
  ];
  
  // Añadir título a la paleta
  const paletteTitle = document.createElement('div');
  paletteTitle.textContent = 'Seleccionar color';
  paletteTitle.style.fontSize = '14px';
  paletteTitle.style.fontWeight = 'bold';
  paletteTitle.style.marginBottom = '8px';
  paletteTitle.style.textAlign = 'center';
  paletteTitle.style.color = '#333';
  paletteTitle.style.borderBottom = '1px solid #eee';
  paletteTitle.style.paddingBottom = '5px';
  
  colorPalette.appendChild(paletteTitle);
  
  // Generar grid de colores
  const colorGrid = document.createElement('div');
  colorGrid.className = 'color-grid';
  
  colors.forEach(color => {
    const colorOption = document.createElement('div');
    colorOption.className = 'color-option';
    colorOption.dataset.color = color;
    colorOption.style.backgroundColor = color;
    
    // Borde para colores claros para mejor visibilidad
    if (color.toLowerCase() === '#ffffff' || 
        color.toLowerCase() === '#f3f3f3' || 
        color.toLowerCase() === '#efefef') {
      colorOption.style.border = '1px solid #ccc';
    }
    
    // Agregar tooltip con el código de color para mejor usabilidad
    colorOption.title = color;
    
    colorGrid.appendChild(colorOption);
  });
  
  colorPalette.appendChild(colorGrid);
  
  // Agregar una sección para color personalizado si se quiere implementar en el futuro
  const customColorSection = document.createElement('div');
  customColorSection.style.marginTop = '8px';
  customColorSection.style.paddingTop = '8px';
  customColorSection.style.borderTop = '1px solid #eee';
  customColorSection.style.fontSize = '12px';
  customColorSection.style.color = '#666';
  customColorSection.style.textAlign = 'center';
  customColorSection.textContent = 'Haga clic para aplicar color';
  
  colorPalette.appendChild(customColorSection);
  
  // Asegurar que se añade al final del body para que esté encima de todo
  document.body.appendChild(colorPalette);
  
  console.log("Paleta de colores mejorada creada");
  return colorPalette;
}

function createMathSymbolsDropdown() {
  // Verificar si ya existe
  if (document.getElementById('mathSymbolsDropdown')) {
    return;
  }

  // Crear el dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'mathSymbolsDropdown';
  dropdown.className = 'math-dropdown';
  document.body.appendChild(dropdown);

  // Crear las pestañas
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'math-dropdown-tabs';
  dropdown.appendChild(tabsContainer);

  // Definir pestañas (eliminando "expresiones")
  const tabs = [
    { id: 'basic', text: 'Símbolos' },
    { id: 'greek', text: 'Griego' },
    { id: 'operators', text: 'Operadores' }
  ];

  // Crear botones de pestaña
  tabs.forEach((tab, index) => {
    const tabButton = document.createElement('button');
    tabButton.className = `math-dropdown-tab ${index === 0 ? 'active' : ''}`;
    tabButton.dataset.tab = tab.id;
    tabButton.textContent = tab.text;
    tabsContainer.appendChild(tabButton);

    // Crear el contenido de la pestaña
    const tabContent = document.createElement('div');
    tabContent.className = `math-content-tab ${index === 0 ? 'active' : ''}`;
    tabContent.id = `${tab.id}-tab`;
    dropdown.appendChild(tabContent);

    // Crear la cuadrícula para los símbolos
    const symbolsGrid = document.createElement('div');
    symbolsGrid.className = 'math-symbols-grid';
    tabContent.appendChild(symbolsGrid);

    // Llenar con símbolos según la pestaña
    switch (tab.id) {
      case 'basic':
        addSymbolsToGrid(symbolsGrid, [
          { text: '+', latex: '+' },
          { text: '-', latex: '-' },
          { text: '×', latex: '\\times' },
          { text: '÷', latex: '\\div' },
          { text: '=', latex: '=' },
          { text: '≠', latex: '\\neq' },
          { text: '<', latex: '<' },
          { text: '>', latex: '>' },
          { text: '≤', latex: '\\leq' },
          { text: '≥', latex: '\\geq' },
          { text: '±', latex: '\\pm' },
          { text: '∞', latex: '\\infty' },
          { text: '≈', latex: '\\approx' },
          { text: '∝', latex: '\\propto' },
          { text: '∑', latex: '\\sum' },
          { text: '∏', latex: '\\prod' },
          { text: '∫', latex: '\\int' },
          { text: '∂', latex: '\\partial' },
          { text: '√', latex: '\\sqrt{}' },
          { text: '∛', latex: '\\sqrt[3]{}' }
        ]);
        break;
      case 'greek':
        addSymbolsToGrid(symbolsGrid, [
          { text: 'α', latex: '\\alpha' },
          { text: 'β', latex: '\\beta' },
          { text: 'γ', latex: '\\gamma' },
          { text: 'Γ', latex: '\\Gamma' },
          { text: 'δ', latex: '\\delta' },
          { text: 'Δ', latex: '\\Delta' },
          { text: 'ε', latex: '\\epsilon' },
          { text: 'ζ', latex: '\\zeta' },
          { text: 'η', latex: '\\eta' },
          { text: 'θ', latex: '\\theta' },
          { text: 'Θ', latex: '\\Theta' },
          { text: 'λ', latex: '\\lambda' },
          { text: 'Λ', latex: '\\Lambda' },
          { text: 'μ', latex: '\\mu' },
          { text: 'π', latex: '\\pi' },
          { text: 'Π', latex: '\\Pi' },
          { text: 'σ', latex: '\\sigma' },
          { text: 'Σ', latex: '\\Sigma' },
          { text: 'τ', latex: '\\tau' },
          { text: 'φ', latex: '\\phi' },
          { text: 'Φ', latex: '\\Phi' },
          { text: 'ω', latex: '\\omega' },
          { text: 'Ω', latex: '\\Omega' }
        ]);
        break;
      case 'operators':
        addSymbolsToGrid(symbolsGrid, [
          { text: '∈', latex: '\\in' },
          { text: '∉', latex: '\\notin' },
          { text: '⊂', latex: '\\subset' },
          { text: '⊃', latex: '\\supset' },
          { text: '∪', latex: '\\cup' },
          { text: '∩', latex: '\\cap' },
          { text: '∅', latex: '\\emptyset' },
          { text: '∀', latex: '\\forall' },
          { text: '∃', latex: '\\exists' },
          { text: '∄', latex: '\\nexists' },
          { text: '¬', latex: '\\neg' },
          { text: '∧', latex: '\\wedge' },
          { text: '∨', latex: '\\vee' },
          { text: '⟹', latex: '\\Rightarrow' },
          { text: '⟸', latex: '\\Leftarrow' },
          { text: '⟺', latex: '\\Leftrightarrow' },
          { text: '→', latex: '\\rightarrow' },
          { text: '←', latex: '\\leftarrow' },
          { text: '↔', latex: '\\leftrightarrow' }
        ]);
        break;
    }
  });

  console.log("Dropdown de símbolos matemáticos creado");

  // Función para añadir símbolos a la cuadrícula
  function addSymbolsToGrid(grid, symbols) {
    symbols.forEach(symbol => {
      const symbolElement = document.createElement('div');
      symbolElement.className = 'math-symbol';
      symbolElement.textContent = symbol.text;
      symbolElement.dataset.latex = symbol.latex;
      symbolElement.title = symbol.latex;
      grid.appendChild(symbolElement);

      // Evento para insertar el símbolo
      symbolElement.addEventListener('click', () => {
        insertMathLatex(symbol.latex);
        document.getElementById('mathSymbolsDropdown').classList.remove('show');
      });
    });
  }
}

function initMathEditorEvents() {
  console.log("Inicializando eventos del editor matemático...");
  
  const editorContent = document.getElementById('mathEditorContent');
  if (!editorContent) {
    console.error("ERROR: No se encontró el editor de contenido");
    return;
  }
  
  // Asegurarnos que el editor sea editable
  editorContent.contentEditable = 'true';
  
  // Inicializar eventos para todos los botones de formato
  const formatButtons = document.querySelectorAll('.math-editor-btn[data-command]');
  formatButtons.forEach(button => {
    // Eliminamos y volvemos a añadir el evento para evitar duplicados
    button.removeEventListener('click', handleFormatButtonClick);
    button.addEventListener('click', handleFormatButtonClick);
  });
  
  // Función para manejar clics en botones de formato
  function handleFormatButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const command = this.dataset.command;
    if (!command) return;
    
    console.log(`Aplicando comando de formato: ${command}`);
    
    // Enfocar el editor antes de aplicar el comando
    editorContent.focus();
    
    // Aplicar el comando
    try {
      document.execCommand(command, false, null);
      console.log(`Comando ${command} aplicado correctamente`);
      
      // Actualizar el estado de los botones
      updateButtonStates();
      
      // Sincronizar con el textarea
      syncContentWithTextarea();
    } catch (error) {
      console.error(`Error al aplicar el comando ${command}:`, error);
    }
  }
  
  // Sincronizar contenido con el textarea asociado
  function syncContentWithTextarea() {
    const targetTextareaId = editorContent.dataset.targetTextareaId;
    if (targetTextareaId) {
      const textareaElement = document.getElementById(targetTextareaId);
      if (textareaElement) {
        textareaElement.value = editorContent.innerHTML;
      }
    }
  }
  
  // Verificar que el botón de color de texto exista
  const textColorBtn = document.getElementById('textColorBtn');
  if (textColorBtn) {
    console.log("Botón de color detectado, inicializando selector de color");
  } else {
    console.error("ADVERTENCIA: Botón de color de texto no encontrado en el DOM");
  }
  
  // Inicializar eventos de funcionalidades avanzadas con retrasos para evitar conflictos
  setTimeout(() => {
    try {
      // Inicializar eventos de símbolos matemáticos
      initMathSymbolsEvents();
      console.log("✓ Eventos de símbolos matemáticos inicializados");
    } catch (error) {
      console.error("Error al inicializar eventos de símbolos matemáticos:", error);
    }
  }, 100);
  
  setTimeout(() => {
    try {
      // Inicializar eventos para ecuaciones
      initEquationEvents();
      console.log("✓ Eventos de ecuaciones inicializados");
    } catch (error) {
      console.error("Error al inicializar eventos de ecuaciones:", error);
    }
  }, 200);
  
  setTimeout(() => {
    try {
      // Inicializar eventos para tablas
      initTableEvents();
      console.log("✓ Eventos de tablas inicializados");
    } catch (error) {
      console.error("Error al inicializar eventos de tablas:", error);
    }
  }, 300);
  
  setTimeout(() => {
    try {
      // Crear la paleta de colores si no existe
      if (!document.getElementById('colorPalette')) {
        console.log("Creando paleta de colores antes de inicializar eventos");
        createColorPalette();
      }
      
      // Inicializar eventos de la paleta de colores
      initColorPickerEvents();
      console.log("✓ Eventos del selector de color inicializados");
    } catch (error) {
      console.error("Error al inicializar eventos del selector de color:", error);
    }
  }, 400);
  
  // Eventos para actualizar el estado de los botones cuando cambia la selección
  editorContent.addEventListener('mouseup', updateButtonStates);
  editorContent.addEventListener('keyup', function(e) {
    // Actualizar solo en teclas relevantes para navegación y formato
    const relevantKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'Backspace', 'Delete'];
    if (relevantKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      updateButtonStates();
    }
  });
  
  // Sincronizar con el textarea cuando se modifica el contenido
  editorContent.addEventListener('input', syncContentWithTextarea);
  
  console.log("Eventos del editor inicializados correctamente");
  
  // Llamar a updateButtonStates una vez al inicio para configurar el estado inicial
  updateButtonStates();
}

function updateButtonStates() {
  const editorContent = document.getElementById('mathEditorContent');
  if (!editorContent) return;
  
  try {
    // Verificar el estado actual de varios comandos
    const isBold = document.queryCommandState('bold');
    const isItalic = document.queryCommandState('italic');
    const isUnderline = document.queryCommandState('underline');
    const isOrderedList = document.queryCommandState('insertOrderedList');
    const isUnorderedList = document.queryCommandState('insertUnorderedList');
    const isJustifyLeft = document.queryCommandState('justifyLeft');
    const isJustifyCenter = document.queryCommandState('justifyCenter');
    const isJustifyRight = document.queryCommandState('justifyRight');
    
    // Actualizar clases active para cada botón de formato
    toggleButtonActive('bold', isBold);
    toggleButtonActive('italic', isItalic);
    toggleButtonActive('underline', isUnderline);
    toggleButtonActive('insertOrderedList', isOrderedList);
    toggleButtonActive('insertUnorderedList', isUnorderedList);
    toggleButtonActive('justifyLeft', isJustifyLeft);
    toggleButtonActive('justifyCenter', isJustifyCenter);
    toggleButtonActive('justifyRight', isJustifyRight);
    
    // Función auxiliar para actualizar la clase active de un botón
    function toggleButtonActive(command, isActive) {
      const button = document.querySelector(`.math-editor-btn[data-command="${command}"]`);
      if (button) {
        if (isActive) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      }
    }
  } catch (error) {
    console.error("Error al actualizar estados de botones:", error);
  }
}

// Función para renderizar expresiones matemáticas en el editor
function renderMathInEditor() {
  const editorContent = document.getElementById('mathEditorContent');
  if (!editorContent) {
    console.error("No se encontró el editor de contenido para renderizar ecuaciones");
    return;
  }
  
  console.log("Renderizando ecuaciones en el editor...");
  
  try {
    // Procesar elementos math-tex para asegurar correcta visualización
    const mathElements = editorContent.querySelectorAll('.math-tex');
    console.log(`Encontrados ${mathElements.length} elementos math-tex para renderizar`);
    
    mathElements.forEach((element, index) => {
      // Verificar que el elemento tenga el atributo data-latex
      const latex = element.getAttribute('data-latex');
      if (!latex) {
        // Intentar extraer LaTeX de su contenido interior
        const innerMatch = element.innerHTML.match(/\\\((.*?)\\\)/);
        if (innerMatch && innerMatch[1]) {
          element.setAttribute('data-latex', innerMatch[1]);
          console.log(`Atributo data-latex extraído del contenido para elemento ${index}`);
        }
      }
      
      // Asegurar que el elemento es interactivo y bien formateado
      element.contentEditable = 'true';
      element.style.display = 'inline-block';
      element.style.cursor = 'text';
      element.style.userSelect = 'text';
      
      // Comprobar si tiene estructura anidada incorrecta
      const nestedMathElements = element.querySelectorAll('.math-tex');
      if (nestedMathElements.length > 0) {
        // Obtener el LaTeX y reconstruir el elemento con estructura correcta
        const latex = element.getAttribute('data-latex') || '';
        element.innerHTML = `\\(${latex}\\)`;
        console.log(`Corregida estructura anidada en elemento ${index}`);
      }
    });
    
    // Renderizar con MathJax si está disponible
    if (typeof MathJax !== 'undefined') {
      // Esperar un momento para asegurar que el DOM esté estable
      setTimeout(() => {
        try {
          if (MathJax.typeset) {
            MathJax.typeset([editorContent]);
            console.log("Ecuaciones renderizadas con MathJax.typeset");
          } else if (MathJax.Hub && MathJax.Hub.Queue) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, editorContent]);
            console.log("Ecuaciones renderizadas con MathJax.Hub.Queue");
          } else if (MathJax.typesetPromise) {
            MathJax.typesetPromise([editorContent]).then(() => {
              console.log("Ecuaciones renderizadas con MathJax.typesetPromise");
            }).catch(err => {
              console.error("Error en MathJax.typesetPromise:", err);
            });
          }
        } catch (error) {
          console.error("Error al renderizar con MathJax:", error);
        }
      }, 100);
    } else {
      console.warn("MathJax no está disponible para renderizar ecuaciones");
    }
  } catch (error) {
    console.error("Error al renderizar ecuaciones:", error);
  }
}

// Limpia cualquier instancia anterior del editor
function cleanupExistingEditor() {
  console.log('Limpiando instancias anteriores del editor...');
  
  // Quitar elementos existentes del editor
  const existingEditor = document.getElementById('mathEditorContent');
  if (existingEditor) {
    const container = existingEditor.closest('.math-editor-container');
    if (container) {
      console.log('Eliminando contenedor del editor existente');
      container.remove();
    } else {
      existingEditor.remove();
    }
  }
  
  // Quitar otros elementos relacionados
  document.getElementById('colorPalette')?.remove();
  document.getElementById('mathSymbolsDropdown')?.remove();
  document.getElementById('equationModal')?.remove();
  document.getElementById('tableModal')?.remove();
  document.getElementById('latexTemplatesModal')?.remove();
  
  console.log('Limpieza completada');
}

// Nueva función addDynamicStyles que faltaba
function addDynamicStyles() {
  const styleId = 'math-editor-dynamic-styles';
  // Remover estilos existentes para evitar duplicados
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .math-editor-btn.active {
      background-color: #e2e6ea;
      border-color: #dae0e5;
    }
    .math-editor-btn i.fa-solid { /* Ensure icons have consistent size */
      font-size: 1em;
      width: 1.2em;
      text-align: center;
      vertical-align: middle; /* Align icons better */
    }
    
    /* Style for dropdowns */
    .color-palette, .math-dropdown {
      position: fixed; /* Cambiado de absolute a fixed para asegurar que esté sobre modales */
      z-index: 9999; /* Valor muy alto para estar por encima de modales/dialogs */
      background-color: #fff;
      border: 1px solid #ced4da;
      border-radius: 4px;
      padding: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      display: none; /* Hidden by default */
    }
    .color-palette.show, .math-dropdown.show {
      display: block !important; /* Shown by JS with !important to override */
    }
    
    /* Specific styles for color palette */
    .color-palette { 
      width: 160px; 
      padding: 10px;
      transition: opacity 0.2s ease; /* Añadido transición para suavizar aparición */
    }
    .color-grid { 
      display: grid; 
      grid-template-columns: repeat(5, 1fr); 
      gap: 5px; 
    }
    .color-option { 
      width: 22px; 
      height: 22px; 
      border-radius: 3px; 
      cursor: pointer; 
      border: 1px solid #dee2e6;
      transition: transform 0.1s ease;
    }
    .color-option:hover {
      transform: scale(1.1);
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
    }
    
    /* Specific styles for math dropdown */
    .math-dropdown { width: 280px; } /* Adjusted width */
    .math-dropdown-tabs { display: flex; border-bottom: 1px solid #dee2e6; margin-bottom: 8px; }
    .math-dropdown-tab { background: none; border: none; padding: 6px 12px; cursor: pointer; border-bottom: 3px solid transparent; color: #495057; font-size: 14px; }
    .math-dropdown-tab.active { border-bottom-color: #007bff; font-weight: 600; color: #0056b3; }
    .math-dropdown-tab:hover { background-color: #f8f9fa; }
    .math-content-tab { display: none; }
    .math-content-tab.active { display: block; }
    .math-symbols-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(35px, 1fr)); gap: 5px; } /* Responsive grid */
    .math-symbol { padding: 6px; text-align: center; cursor: pointer; border: 1px solid #eee; border-radius: 3px; font-size: 16px; background-color: #fff; }
    .math-symbol:hover { background-color: #f0f0f0; border-color: #ddd; }
    
    /* Estilos para las ecuaciones integradas en el texto */
    .math-tex {
      font-family: inherit;
      line-height: inherit;
      display: inline;
      vertical-align: baseline;
    }
    
    /* Estilos para MathJax para que se integre mejor con el texto */
    .MathJax {
      display: inline !important;
      line-height: inherit !important;
      vertical-align: baseline !important;
      font-size: inherit !important;
    }
    
    /* Asegurar que el cursor se pueda posicionar después de una ecuación */
    #mathEditorContent {
      min-height: 200px;
    }
    
    /* Estilos para mejorar la visibilidad de la ecuación cuando se pasa el cursor sobre ella */
    .math-tex:hover {
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);
  console.log("Estilos dinámicos añadidos o actualizados.");
}

// También necesitamos añadir la función applyToolbarStyles
function applyToolbarStyle(toolbar) {
  if (!toolbar) {
    console.error("No se puede aplicar estilos a la barra de herramientas: toolbar es null");
    return;
  }
  
  toolbar.querySelectorAll('.math-editor-toolbar-group').forEach(group => {
    group.style.display = 'flex';
    group.style.alignItems = 'center';
    group.style.borderRight = '1px solid #dee2e6';
    group.style.paddingRight = '5px';
    group.style.marginRight = '5px';
  });
  
  const groups = toolbar.querySelectorAll('.math-editor-toolbar-group');
  if (groups.length > 0) {
    groups[groups.length - 1].style.borderRight = 'none';
    groups[groups.length - 1].style.paddingRight = '0';
    groups[groups.length - 1].style.marginRight = '0';
  }
  
  toolbar.querySelectorAll('.math-editor-btn').forEach(btn => {
    btn.style.backgroundColor = '#fff';
    btn.style.border = '1px solid #dee2e6';
    btn.style.borderRadius = '0.25rem';
    btn.style.padding = '5px 8px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '14px';
    btn.style.color = '#495057';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.minWidth = '32px';
    btn.style.minHeight = '32px';
    btn.style.margin = '0 2px';
    
    // Añadir efectos hover
    btn.addEventListener('mouseover', () => {
      btn.style.backgroundColor = '#f8f9fa';
    });
    
    btn.addEventListener('mouseout', () => {
      if (!btn.classList.contains('active')) {
        btn.style.backgroundColor = '#fff';
      }
    });
  });
  
  console.log("Estilos aplicados a la barra de herramientas.");
}

// Exponer la función initNewMathEditor para que pueda ser llamada desde otros scripts
window.initNewMathEditor = initNewMathEditor;

// Añadir la función createToolbar antes de initNewMathEditor
function createToolbar() {
  console.log("Creando barra de herramientas...");
  const toolbar = document.createElement('div');
  toolbar.className = 'math-editor-toolbar';
  toolbar.style.backgroundColor = '#f8f9fa';
  toolbar.style.borderBottom = '1px solid #ced4da';
  toolbar.style.padding = '8px';
  toolbar.style.display = 'flex';
  toolbar.style.flexWrap = 'wrap';
  toolbar.style.gap = '5px';
  
  // Verificar si estamos en una sección de tipo texto
  const sectionType = document.getElementById('sectionType')?.value || '';
  
  if (sectionType === 'text') {
    // Para secciones de tipo texto, usar una versión modificada sin herramientas matemáticas
    toolbar.innerHTML = getTextSectionToolbarHTML();
    console.log("Barra de herramientas para sección de texto creada (sin herramientas matemáticas)");
  } else {
    // Para otros tipos de sección, usar la barra completa
    toolbar.innerHTML = getMathToolbarHTML();
    console.log("Barra de herramientas completa creada");
  }
  
  // Verificar que el botón de color exista en la barra
  setTimeout(() => {
    const textColorBtn = toolbar.querySelector('#textColorBtn');
    if (textColorBtn) {
      console.log("✅ Botón de color encontrado en la barra de herramientas");
      
      // Asegurar que el botón tenga los eventos necesarios
      textColorBtn.addEventListener('click', (e) => {
        console.log("Clic directo en el botón de color");
        // No añadir funcionalidad aquí para evitar duplicados
        // La funcionalidad real se agregará en initColorPickerEvents
      });
    } else {
      console.error("❌ ERROR: Botón de color NO encontrado en la barra de herramientas");
    }
  }, 10);
  
  return toolbar;
}

// Nueva función para generar la barra de herramientas para secciones de tipo texto (sin herramientas matemáticas)
function getTextSectionToolbarHTML() {
  return `
    <!-- Text Formatting -->
    <div class="math-editor-toolbar-group">
      <button type="button" class="math-editor-btn" data-command="bold" title="Negrita"><i class="fa-solid fa-bold"></i></button>
      <button type="button" class="math-editor-btn" data-command="italic" title="Cursiva"><i class="fa-solid fa-italic"></i></button>
      <button type="button" class="math-editor-btn" data-command="underline" title="Subrayado"><i class="fa-solid fa-underline"></i></button>
      <button type="button" class="math-editor-btn" id="textColorBtn" title="Color de texto"><i class="fa-solid fa-palette"></i></button>
    </div>

    <!-- Lists -->
    <div class="math-editor-toolbar-group">
      <button type="button" class="math-editor-btn" data-command="insertUnorderedList" title="Lista con viñetas"><i class="fa-solid fa-list-ul"></i></button>
      <button type="button" class="math-editor-btn" data-command="insertOrderedList" title="Lista numerada"><i class="fa-solid fa-list-ol"></i></button>
    </div>

    <!-- Alignment -->
    <div class="math-editor-toolbar-group">
      <button type="button" class="math-editor-btn" data-command="justifyLeft" title="Alinear a la izquierda"><i class="fa-solid fa-align-left"></i></button>
      <button type="button" class="math-editor-btn" data-command="justifyCenter" title="Centrar"><i class="fa-solid fa-align-center"></i></button>
      <button type="button" class="math-editor-btn" data-command="justifyRight" title="Alinear a la derecha"><i class="fa-solid fa-align-right"></i></button>
    </div>

    <!-- Tabla únicamente -->
    <div class="math-editor-toolbar-group">
      <button type="button" class="math-editor-btn" id="insertTableBtn" title="Insertar tabla"><i class="fa-solid fa-table"></i></button>
    </div>
  `;
}

// Función principal para inicializar el nuevo editor matemático
function initNewMathEditor(targetTextareaId) {
    console.log(`Inicializando nuevo editor matemático para: ${targetTextareaId}`);

    // Verificar que tenemos un ID de textarea válido
    if (!targetTextareaId) {
        console.error("Error: No se proporcionó ID de textarea para el editor matemático");
        return false;
    }

    // Verificar que existe el textarea
    const textarea = document.getElementById(targetTextareaId);
    if (!textarea) {
        console.error(`Error: No se encontró el textarea con ID: ${targetTextareaId}`);
        return false;
    }

    // Verificar si estamos en una sección de tipo texto
    const sectionType = document.getElementById('sectionType')?.value || '';
    const isTextSection = sectionType === 'text';
    if (isTextSection) {
        console.log("Inicializando editor para sección tipo texto (sin herramientas matemáticas)");
    }

    try {
        // Guardar el ID global para otras funciones
        window._mathEditorTargetId = targetTextareaId;
        
        // Limpiar instancias previas si existen
        cleanupMathEditor();
        
        // Obtener el contenedor padre del textarea o crear uno si no existe
        let textEditorContainer = textarea.parentNode;
        if (!textEditorContainer || !textEditorContainer.id || textEditorContainer.id !== 'textEditorContainer') {
            console.log("Creando un nuevo contenedor para el editor");
            textEditorContainer = document.createElement('div');
            textEditorContainer.id = 'textEditorContainer';
            textEditorContainer.className = 'mb-3';
            textEditorContainer.style.border = '1px solid #ced4da';
            textEditorContainer.style.borderRadius = '0.25rem';
            textEditorContainer.style.position = 'relative';
            
            // Insertar el contenedor antes del textarea y mover el textarea dentro
            textarea.parentNode.insertBefore(textEditorContainer, textarea);
            textEditorContainer.appendChild(textarea);
        }
        
        // Crear el editor usando la función principal
        const editor = createMathEditor(targetTextareaId);
        
        if (!editor) {
            console.error("Fallo al crear el editor matemático");
            return false;
        }
        
        // Verificar que se creó correctamente el editor
        const mathEditor = document.getElementById('mathEditorContent');
        if (!mathEditor) {
            console.error("El elemento del editor no se creó correctamente");
            return false;
        }
        
        // Asegurar que el editor es editable
        mathEditor.contentEditable = 'true';
        
        // Inicializar eventos de los botones de formato
        setTimeout(() => {
            try {
                // Inicializar eventos del editor
                initMathEditorEvents();
                
                // Botones de formato de texto
                if (typeof initFormatButtons === 'function') {
                    initFormatButtons();
                    console.log("Eventos de botones de formato inicializados");
                }
                
                // Inicializar eventos para símbolos matemáticos solo si no es sección texto
                if (!isTextSection && typeof initMathSymbolsEvents === 'function') {
                    initMathSymbolsEvents();
                    console.log("Eventos de símbolos matemáticos inicializados");
                }
                
                // Actualizar textarea cuando cambie el contenido del editor
                mathEditor.addEventListener('input', function() {
                    textarea.value = mathEditor.innerHTML;
                });
                
                // Sincronizar contenido al cargar
                textarea.value = mathEditor.innerHTML;
                
                console.log("Editor matemático inicializado completamente");
                
                // Establecer estilos para barra de herramientas y contenedor
                const toolbar = document.querySelector('.math-editor-toolbar');
                if (toolbar) {
                    toolbar.style.display = 'flex';
                    toolbar.style.flexWrap = 'wrap';
                    toolbar.style.gap = '5px';
                    toolbar.style.padding = '8px';
                    toolbar.style.backgroundColor = '#f8f9fa';
                    toolbar.style.borderBottom = '1px solid #ced4da';
                }
                
                const editorContainer = document.querySelector('.math-editor-container');
                if (editorContainer) {
                    editorContainer.style.display = 'block';
                    editorContainer.style.width = '100%';
                    editorContainer.style.border = '1px solid #ced4da';
                    editorContainer.style.borderRadius = '0.25rem';
                    editorContainer.style.marginBottom = '1rem';
                }
                
                // Ocultar el textarea
                textarea.style.display = 'none';
                
                // Enfocar el editor
                mathEditor.focus();
            } catch (error) {
                console.error("Error al finalizar inicialización:", error);
            }
        }, 200);
        
        return true;
    } catch (error) {
        console.error("Error al inicializar el editor matemático:", error);
        return false;
    }
}

// Función para limpiar el editor matemático y liberar recursos
window.cleanupMathEditor = function() {
    console.log("Limpiando recursos del editor matemático...");
    
    try {
        // Proteger cada operación en su propio bloque try-catch
        try {
            // Detectar si hay una selección activa y limpiarla
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                selection.removeAllRanges();
                console.log("Selección de texto limpiada");
            }
        } catch (error) {
            console.warn("Error al limpiar selección:", error);
        }
        
        try {
            // Eliminar eventos antes de remover el elemento
            const editorContent = document.getElementById('mathEditorContent');
            if (editorContent) {
                // Remover los eventos más importantes que pueden causar problemas
                editorContent.removeEventListener('input', null);
                editorContent.removeEventListener('keyup', null);
                editorContent.removeEventListener('mouseup', null);
                console.log("Eventos del editor removidos");
            }
        } catch (error) {
            console.warn("Error al limpiar eventos del editor:", error);
        }
        
        try {
            // Eliminar el contenedor del editor si existe
            const editorContainer = document.querySelector('.math-editor-container');
            if (editorContainer) {
                editorContainer.remove();
                console.log("Contenedor del editor eliminado");
            }
        } catch (error) {
            console.warn("Error al eliminar contenedor del editor:", error);
        }
        
        // Eliminar otros elementos asociados, cada uno en su propio try-catch
        try {
            const colorPalette = document.getElementById('colorPalette');
            if (colorPalette) colorPalette.remove();
        } catch (e) { console.warn("Error al eliminar paleta de colores:", e); }
        
        try {
            const mathSymbolsDropdown = document.getElementById('mathSymbolsDropdown');
            if (mathSymbolsDropdown) mathSymbolsDropdown.remove();
        } catch (e) { console.warn("Error al eliminar dropdown de símbolos:", e); }
        
        try {
            const equationModal = document.getElementById('equationModal');
            if (equationModal) equationModal.remove();
        } catch (e) { console.warn("Error al eliminar modal de ecuaciones:", e); }
        
        try {
            const tableModal = document.getElementById('tableModal');
            if (tableModal) tableModal.remove();
        } catch (e) { console.warn("Error al eliminar modal de tablas:", e); }
        
        try {
            const latexTemplatesModal = document.getElementById('latexTemplatesModal');
            if (latexTemplatesModal) latexTemplatesModal.remove();
        } catch (e) { console.warn("Error al eliminar modal de plantillas:", e); }
        
        try {
            // Eliminar eventos globales si existen
            if (window._mathEditorDocumentClickHandler) {
                document.removeEventListener('click', window._mathEditorDocumentClickHandler);
                window._mathEditorDocumentClickHandler = null;
            }
        } catch (error) {
            console.warn("Error al eliminar eventos globales:", error);
        }
        
        // Restablecer variables globales
        window._mathEditorInitialized = false;
        
        console.log("Limpieza de editor completada exitosamente");
        return true;
    } catch (error) {
        console.error("Error general al limpiar el editor:", error);
        return false;
    }
};

// Crear un modal para ecuaciones 
function createEquationModal() {
  // Verificar si ya existe el modal
  if (document.getElementById('equationModal')) {
    return;
  }
  
  console.log("Creando modal para ecuaciones...");
  // Implementación básica del modal para ecuaciones
  const modal = document.createElement('div');
  modal.id = 'equationModal';
  modal.className = 'math-editor-modal';
  modal.style.display = 'none';
  document.body.appendChild(modal);
  console.log("Modal para ecuaciones creado");
}

// Crear un modal para tablas
function createTableModal() {
  // Verificar si ya existe el modal
  if (document.getElementById('tableModal')) {
    return;
  }
  
  console.log("Creando modal para tablas...");
  // Implementación básica del modal para tablas
  const modal = document.createElement('div');
  modal.id = 'tableModal';
  modal.className = 'math-editor-modal';
  modal.style.display = 'none';
  document.body.appendChild(modal);
  console.log("Modal para tablas creado");
}

// Crear un modal para plantillas LaTeX
function createLatexTemplatesModal() {
  // Verificar si ya existe el modal
  if (document.getElementById('latexTemplatesModal')) {
    return;
  }
  
  console.log("Creando modal para plantillas LaTeX...");
  // Implementación básica del modal para plantillas LaTeX
  const modal = document.createElement('div');
  modal.id = 'latexTemplatesModal';
  modal.className = 'math-editor-modal';
  modal.style.display = 'none';
  document.body.appendChild(modal);
  console.log("Modal para plantillas LaTeX creado");
}

// Corregir la función resetFormatting para manejar correctamente la selección
function resetFormatting() {
  const editorContent = document.getElementById('mathEditorContent');
  if (!editorContent) return;
  
  try {
    // Guardar la selección actual de forma segura
    let savedSelection = null;
    const selection = window.getSelection();
    
    if (selection && typeof selection.getRangeCount === 'function' && selection.getRangeCount() > 0) {
      savedSelection = selection.getRangeAt(0).cloneRange();
    }
    
    // Enfocar el editor para asegurarnos de que podemos ejecutar comandos
    editorContent.focus();
    
    // Seleccionar todo el texto
    document.execCommand('selectAll', false, null);
    
    // Remover todos los formatos
    document.execCommand('removeFormat', false, null);
    
    // Restaurar la selección original si existía
    if (savedSelection) {
      selection.removeAllRanges();
      selection.addRange(savedSelection);
    }
    
    // Actualizar el estado de los botones
    updateButtonStates();
    
    // Sincronizar con el textarea
    const targetTextareaId = editorContent.dataset.targetTextareaId;
    if (targetTextareaId) {
      const textareaElement = document.getElementById(targetTextareaId);
      if (textareaElement) {
        textareaElement.value = editorContent.innerHTML;
        console.log(`Contenido sincronizado con textarea #${targetTextareaId} después de resetear formato`);
      }
    }
  } catch (error) {
    console.error("Error al resetear formato:", error);
    
    // Plan B - Método alternativo si falla el anterior
    try {
      // Simplemente aplicar estilo por defecto al contenido
      editorContent.style.fontWeight = 'normal';
      editorContent.style.fontStyle = 'normal';
      editorContent.style.textDecoration = 'none';
      editorContent.style.color = 'inherit';
      
      // Recorrer elementos hijos y resetear estilos
      Array.from(editorContent.children).forEach(child => {
        child.style.fontWeight = 'normal';
        child.style.fontStyle = 'normal';
        child.style.textDecoration = 'none';
        child.style.color = 'inherit';
      });
      
      console.log("Formato reseteado usando método alternativo");
    } catch (e) {
      console.error("También falló el método alternativo de reseteo:", e);
    }
  }
}

// 1. Primero, añadir la función updateExpressionPreview que falta
function updateExpressionPreview(input, preview) {
  // Si no se proporcionan parámetros, buscar los elementos
  if (!input) input = document.getElementById('expressionInput');
  if (!preview) preview = document.getElementById('expressionPreview');
  
  if (!input || !preview) {
    console.error("No se encontraron los elementos para la vista previa");
    return;
  }
  
  const latex = input.value.trim();
  if (latex) {
    preview.innerHTML = `\\(${latex}\\)`;
    
    // Renderizar con MathJax con manejo de diferentes versiones
    if (typeof MathJax !== 'undefined') {
      try {
        if (MathJax.typeset) {
          MathJax.typeset([preview]);
        } else if (MathJax.Hub && MathJax.Hub.Queue) {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, preview]);
        } else if (MathJax.typesetPromise) {
          MathJax.typesetPromise([preview]).catch(err => {
            console.error("Error en MathJax.typesetPromise:", err);
          });
        }
      } catch (error) {
        console.error("Error al renderizar expresión con MathJax:", error);
      }
    }
  } else {
    preview.innerHTML = '<span style="color: #999;">Vista previa</span>';
  }
}

// 2. Mejorar la función insertMathLatex para asegurar que inserta en la posición correcta del cursor
function insertMathLatex(latex) {
  console.log(`Insertando fórmula LaTeX: ${latex}`);
  
  // Obtener el editor de contenido
  const editorContent = document.getElementById('mathEditorContent');
  if (!editorContent) {
    console.error("No se encontró el editor de contenido para insertar la fórmula");
    return;
  }
  
  // Guardar el foco en el editor
  editorContent.focus();
  
  // Obtener la selección y rango actuales
  let selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    console.log("No hay selección activa, creando un nuevo rango al final del editor");
    selection = window.getSelection();
    const newRange = document.createRange();
    newRange.setStart(editorContent, editorContent.childNodes.length);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
  
  // Verificar que la selección está dentro del editor
  let isRangeInEditor = false;
  let range = selection.getRangeAt(0);
  let node = range.startContainer;
  
  while (node) {
    if (node === editorContent) {
      isRangeInEditor = true;
      break;
    }
    node = node.parentNode;
  }
  
  if (!isRangeInEditor) {
    console.log("La selección está fuera del editor, moviendo al final del editor");
    const newRange = document.createRange();
    newRange.setStart(editorContent, editorContent.childNodes.length);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    range = selection.getRangeAt(0);
  }
  
  // Eliminar cualquier contenido seleccionado
  range.deleteContents();
  
  // Crear un span para la expresión matemática
  const mathSpan = document.createElement('span');
  mathSpan.className = 'math-tex';
  mathSpan.dataset.latex = latex;
  mathSpan.textContent = latex; // Texto plano como respaldo
  
  // ID único para referenciar este elemento
  const uniqueId = `math-eq-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  mathSpan.id = uniqueId;
  
  // Hacer el span seleccionable
  mathSpan.contentEditable = 'true';
  mathSpan.style.display = 'inline-block';
  mathSpan.style.cursor = 'text';
  mathSpan.style.userSelect = 'text';
  
  // Insertar el span en la posición del cursor
  range.insertNode(mathSpan);
  
  // Añadir el contenido LaTeX dentro del span
  mathSpan.innerHTML = `\\(${latex}\\)`;
  
  // Colocar el cursor después del span insertado
  const newRange = document.createRange();
  newRange.setStartAfter(mathSpan);
  newRange.collapse(true);
  
  // Agregar un espacio después para separar el contenido
  const spaceNode = document.createTextNode(' ');
  newRange.insertNode(spaceNode);
  
  // Mover el cursor después del espacio
  selection.removeAllRanges();
  newRange.setStartAfter(spaceNode);
  newRange.collapse(true);
  selection.addRange(newRange);
  
  // Renderizar la fórmula matemática
  if (typeof MathJax !== 'undefined') {
    try {
      if (MathJax.typeset) {
        MathJax.typeset([mathSpan]);
      } else if (MathJax.Hub && MathJax.Hub.Queue) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, mathSpan]);
      } else if (MathJax.typesetPromise) {
        MathJax.typesetPromise([mathSpan]).catch(err => {
          console.error("Error en MathJax.typesetPromise:", err);
        });
      }
    } catch (error) {
      console.error("Error al renderizar con MathJax:", error);
    }
  }
  
  // Sincronizar con el textarea asociado
  const targetTextareaId = editorContent.dataset.targetTextareaId;
  if (targetTextareaId) {
    const textareaElement = document.getElementById(targetTextareaId);
    if (textareaElement) {
      textareaElement.value = editorContent.innerHTML;
    }
  }
  
  console.log(`Fórmula LaTeX insertada con ID: ${uniqueId}`);
}

// 3. Mejorar la función initColorPickerEvents para el selector de color
function initColorPickerEvents() {
  console.log("Inicializando eventos del selector de color - versión mejorada");
  
  // Obtener elementos necesarios o crearlos si no existen
  let colorPalette = document.getElementById('colorPalette');
  if (!colorPalette) {
    console.log("Paleta de colores no encontrada, creándola...");
    colorPalette = createColorPalette();
  }
  
  const textColorBtn = document.getElementById('textColorBtn');
  if (!textColorBtn) {
    console.error("ERROR: Botón de color de texto no encontrado");
    return;
  } else {
    console.log("Botón de color de texto encontrado correctamente");
  }
  
  // Variable para guardar la selección cuando se abre el selector de color
  let savedSelection = null;
  let savedRange = null;
  
  // 1. Función mejorada para guardar la selección actual
  const saveSelection = () => {
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
        console.log("Selección guardada correctamente");
        
        // Verificar que la selección está dentro del editor
        let isInEditor = false;
        const editorContent = document.getElementById('mathEditorContent');
        if (editorContent) {
          let node = selection.anchorNode;
          while (node) {
            if (node === editorContent) {
              isInEditor = true;
              break;
            }
            node = node.parentNode;
          }
        }
        
        savedSelection = {
          range: savedRange,
          isValid: isInEditor
        };
        
        return isInEditor;
      } else {
        console.log("No hay selección para guardar");
        savedSelection = null;
        savedRange = null;
        return false;
      }
    } catch (e) {
      console.error("Error al guardar la selección:", e);
      savedSelection = null;
      savedRange = null;
      return false;
    }
  };
  
  // 2. Función mejorada para restaurar la selección guardada
  const restoreSelection = () => {
    if (savedSelection && savedSelection.range) {
      try {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedSelection.range);
        console.log("Selección restaurada correctamente");
        return true;
      } catch (e) {
        console.error("Error al restaurar la selección:", e);
        return false;
      }
    }
    console.log("No hay selección válida para restaurar");
    
    // Si no hay selección válida, poner foco en el editor
    const editorContent = document.getElementById('mathEditorContent');
    if (editorContent) {
      editorContent.focus();
    }
    
    return false;
  };
  
  // 3. Función mejorada para mostrar/ocultar la paleta de colores
  const toggleColorPalette = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Mostrando paleta de colores");
    
    // Cerrar otros dropdowns que puedan estar abiertos
    const mathSymbolsDropdown = document.getElementById('mathSymbolsDropdown');
    if (mathSymbolsDropdown) mathSymbolsDropdown.classList.remove('show');
    
    const expressionsDropdown = document.getElementById('expressionsDropdown');
    if (expressionsDropdown) expressionsDropdown.classList.remove('show');
    
    // Verificar si la paleta existe, si no, crearla de nuevo
    if (!colorPalette) {
      console.log("¡Paleta de colores no encontrada! Creándola nuevamente...");
      colorPalette = createColorPalette();
    }
    
    // Guardar la selección actual antes de mostrar la paleta
    saveSelection();
    
    // Cambiar estilo del botón para indicar que está activo
    newTextColorBtn.style.backgroundColor = '#e2e6ea';
    
    // Mostrar la paleta de colores (siempre mostrar, no alternar)
    colorPalette.classList.add('show');
    
    // Hacer visible la paleta de colores
    colorPalette.style.display = 'block';
    colorPalette.style.opacity = '1';
    
    // Posicionar la paleta de colores de manera más precisa
    const rect = newTextColorBtn.getBoundingClientRect();
    
    // Usar coordenadas absolutas para mayor precisión
    colorPalette.style.position = 'fixed';
    colorPalette.style.top = `${rect.bottom + 5}px`;
    colorPalette.style.left = `${rect.left}px`;
    colorPalette.style.zIndex = '9999';
    
    console.log(`Paleta de colores mostrada en posición: top=${colorPalette.style.top}, left=${colorPalette.style.left}`);
    
    // Debug: Mostrar el tamaño y posición de la paleta
    console.log(`Dimensiones del botón: ancho=${rect.width}px, alto=${rect.height}px`);
    console.log(`Estado de la paleta: visible=${colorPalette.style.display}, clase show=${colorPalette.classList.contains('show')}`);
  };
  
  // 4. Remover eventos anteriores para evitar duplicación
  textColorBtn.removeEventListener('click', toggleColorPalette);
  // Usar clonación para asegurar que no queden eventos duplicados
  const newTextColorBtn = textColorBtn.cloneNode(true);
  textColorBtn.parentNode.replaceChild(newTextColorBtn, textColorBtn);
  
  // 5. Añadir evento para mostrar la paleta
  newTextColorBtn.addEventListener('click', toggleColorPalette);
  console.log("Evento click añadido al botón de color");
  
  // 6. Configurar eventos para los colores
  const setupColorOptionEvents = () => {
    const colorOptions = colorPalette.querySelectorAll('.color-option');
    console.log(`Configurando eventos para ${colorOptions.length} opciones de color`);
    
    colorOptions.forEach(option => {
      // Remover eventos anteriores a través de clonación
      const newOption = option.cloneNode(true);
      option.parentNode.replaceChild(newOption, option);
      
      // Añadir el nuevo evento
      newOption.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Obtener el color seleccionado
        const color = this.dataset.color;
        console.log(`Aplicando color: ${color}`);
        
        // Ocultar la paleta de colores
        colorPalette.classList.remove('show');
        colorPalette.style.display = 'none';
        
        // Restaurar el estilo original del botón
        newTextColorBtn.style.backgroundColor = '';
        
        // Obtener el editor
        const editorContent = document.getElementById('mathEditorContent');
        if (!editorContent) {
          console.error("No se encontró el editor para aplicar el color");
          return;
        }
        
        // Enfocar el editor para aplicar el color
        editorContent.focus();
        
        // Restaurar la selección guardada
        const restored = restoreSelection();
        
        // Aplicar el color
        document.execCommand('foreColor', false, color);
        console.log(`Color ${color} aplicado ${restored ? 'a la selección' : 'al cursor'}`);
        
        // Sincronizar con el textarea asociado
        const targetTextareaId = editorContent.dataset.targetTextareaId || 'textContent';
        const textareaElement = document.getElementById(targetTextareaId);
        if (textareaElement) {
          textareaElement.value = editorContent.innerHTML;
          console.log("Contenido del editor sincronizado con el textarea");
        }
        
        // Actualizar el estado de los botones
        if (typeof updateButtonStates === 'function') {
          updateButtonStates();
        }
      });
    });
  };
  
  // Configurar eventos para las opciones de color
  setupColorOptionEvents();
  
  // 7. Función para cerrar la paleta al hacer clic fuera
  const handleOutsideClick = (e) => {
    if (colorPalette && colorPalette.classList.contains('show') && 
        newTextColorBtn && !newTextColorBtn.contains(e.target) && 
        !colorPalette.contains(e.target)) {
      console.log("Clic fuera de la paleta de colores, ocultando");
      colorPalette.classList.remove('show');
      colorPalette.style.display = 'none';
      // Restaurar el estilo original del botón
      newTextColorBtn.style.backgroundColor = '';
    }
  };
  
  // Remover handler anterior si existe
  document.removeEventListener('click', handleOutsideClick);
  // Añadir nuevo handler para detectar clics fuera
  document.addEventListener('click', handleOutsideClick);
  
  // 8. Mantener el foco en el editor cuando se cierra la paleta
  if (colorPalette) {
    colorPalette.addEventListener('mouseleave', () => {
      // No hacemos nada para permitir selección de color
    });
  }
  
  console.log("Eventos del selector de color inicializados correctamente");
}

// 4. Mejorar expresiones predeterminadas para que no dé error
function showExpressionEditor(expression) {
  console.log("Mostrando editor de expresiones:", expression);
  
  // Ocultar dropdown de expresiones
  const dropdown = document.getElementById('expressionsDropdown');
  if (dropdown) {
    dropdown.classList.remove('show');
    dropdown.style.display = 'none';
  }
  
  const modal = document.getElementById('expressionEditorModal');
  const input = document.getElementById('expressionInput');
  const preview = document.getElementById('expressionPreview');
  
  if (!modal || !input || !preview) {
    console.error("Elementos del editor de expresiones no encontrados");
    return;
  }
  
  // Establecer la expresión en el input
  input.value = expression.latex || '';
  
  // Mostrar vista previa
  updateExpressionPreview(input, preview);
  
  // Mostrar el modal
  modal.classList.add('show');
  modal.style.display = 'flex';
  
  // Enfocar el input
  input.focus();
  input.select();
  
  // Inicializar eventos si no están ya inicializados
  initExpressionEditorEvents(modal, input, preview);
}

// 5. Añadir la función para inicializar eventos del editor de expresiones
function initExpressionEditorEvents(modal, input, preview) {
  if (!modal) modal = document.getElementById('expressionEditorModal');
  if (!input) input = document.getElementById('expressionInput');
  if (!preview) preview = document.getElementById('expressionPreview');
  
  if (!modal || !input || !preview) {
    console.error("No se encontraron elementos para inicializar eventos del editor de expresiones");
    return;
  }
  
  // Verificar si ya se inicializaron los eventos
  if (modal.hasAttribute('data-events-initialized')) {
    return;
  }
  
  console.log("Inicializando eventos del editor de expresiones");
  
  const closeBtn = modal.querySelector('.expression-editor-close');
  const cancelBtn = document.getElementById('expressionCancelBtn');
  const insertBtn = document.getElementById('expressionInsertBtn');
  
  // Función para cerrar el modal
  const closeModal = () => {
    modal.classList.remove('show');
    modal.style.display = 'none';
    
    // Enfocar el editor principal
    const editorContent = document.getElementById('mathEditorContent');
    if (editorContent) {
      editorContent.focus();
    }
  };
  
  // Cerrar el modal con el botón de cierre
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
  }
  
  // Cerrar con el botón Cancelar
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
  }
  
  // Actualizar vista previa al escribir
  input.addEventListener('input', () => {
    updateExpressionPreview(input, preview);
  });
  
  // Insertar la expresión
  if (insertBtn) {
    insertBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const latex = input.value.trim();
      if (latex) {
        // Cerrar el modal primero
        closeModal();
        
        // Enfocar el editor y luego insertar
        setTimeout(() => {
          const editorContent = document.getElementById('mathEditorContent');
          if (editorContent) {
            editorContent.focus();
            insertMathLatex(latex);
          }
        }, 100);
      }
    });
  }
  
  // También permitir insertar al presionar Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      insertBtn?.click();
    }
  });
  
  // Cerrar también al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Marcar como inicializado
  modal.setAttribute('data-events-initialized', 'true');
  
  console.log("Eventos del editor de expresiones inicializados correctamente");
}

// Añadir función para inicializar eventos de los símbolos matemáticos
function initMathSymbolsEvents() {
  console.log("Inicializando eventos para símbolos matemáticos...");

  // Verificar si estamos en una sección de tipo texto
  const sectionType = document.getElementById('sectionType')?.value || '';
  if (sectionType === 'text') {
    console.log("Sección tipo texto: No se inicializan eventos de símbolos matemáticos");
    return; // No inicializar los eventos de símbolos matemáticos para secciones de tipo texto
  }
  
  // Obtener los elementos
  const mathSymbolsBtn = document.getElementById('mathSymbolsBtn');
  if (!mathSymbolsBtn) {
    console.error("No se encontró el botón de símbolos matemáticos");
    return;
  }
  
  const mathSymbolsDropdown = document.getElementById('mathSymbolsDropdown');
  if (!mathSymbolsDropdown) {
    console.error("No se encontró el dropdown de símbolos matemáticos");
    return;
  }
  
  // Función para mostrar/ocultar el dropdown
  const toggleMathSymbols = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Botón de símbolos matemáticos clickeado");
    
    // Cerrar otros dropdowns
    document.querySelectorAll('.math-dropdown').forEach(d => {
      if (d.id !== 'mathSymbolsDropdown' && d.classList.contains('show')) {
        d.classList.remove('show');
        d.style.display = 'none';
      }
    });
    
    // Mostrar u ocultar el dropdown
    if (mathSymbolsDropdown.classList.contains('show')) {
      mathSymbolsDropdown.classList.remove('show');
      mathSymbolsDropdown.style.display = 'none';
    } else {
      // Crear el dropdown si no existe
      if (!document.getElementById('mathSymbolsDropdown')) {
        createMathSymbolsDropdown();
      }
      
      // Posicionar el dropdown bajo el botón
      const rect = mathSymbolsBtn.getBoundingClientRect();
      mathSymbolsDropdown.style.left = `${rect.left}px`;
      mathSymbolsDropdown.style.top = `${rect.bottom + window.scrollY}px`;
      
      // Mostrar el dropdown
      mathSymbolsDropdown.classList.add('show');
      mathSymbolsDropdown.style.display = 'block';
    }
  };
  
  // Remover eventos previos y añadir nuevos
  mathSymbolsBtn.removeEventListener('click', toggleMathSymbols);
  mathSymbolsBtn.addEventListener('click', toggleMathSymbols);
  
  // Inicializar eventos para las pestañas
  const tabs = mathSymbolsDropdown.querySelectorAll('.math-dropdown-tab');
  tabs.forEach(tab => {
    tab.removeEventListener('click', switchTab);
    tab.addEventListener('click', switchTab);
  });
  
  // Función para cambiar de pestaña
  function switchTab(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Obtener el ID de la pestaña
    const tabId = this.dataset.tab;
    if (!tabId) return;
    
    console.log(`Cambiando a pestaña: ${tabId}`);
    
    // Desactivar todas las pestañas y contenidos
    tabs.forEach(t => t.classList.remove('active'));
    mathSymbolsDropdown.querySelectorAll('.math-content-tab').forEach(c => c.classList.remove('active'));
    
    // Activar la pestaña y contenido seleccionados
    this.classList.add('active');
    const tabContent = document.getElementById(`${tabId}-tab`);
    if (tabContent) {
      tabContent.classList.add('active');
    }
  }
  
  // Añadir eventos a los símbolos matemáticos
  const mathSymbols = mathSymbolsDropdown.querySelectorAll('.math-symbol');
  mathSymbols.forEach(symbol => {
    symbol.removeEventListener('click', insertSymbol);
    symbol.addEventListener('click', insertSymbol);
  });
  
  // Función para insertar el símbolo seleccionado
  function insertSymbol(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Obtener el LaTeX del símbolo
    const latex = this.dataset.latex;
    if (!latex) return;
    
    console.log(`Insertando símbolo: ${latex}`);
    
    // Ocultar el dropdown
    mathSymbolsDropdown.classList.remove('show');
    mathSymbolsDropdown.style.display = 'none';
    
    // Insertar el símbolo en el editor
    insertMathLatex(latex);
  }
  
  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (mathSymbolsDropdown.classList.contains('show') && 
        !mathSymbolsBtn.contains(e.target) && 
        !mathSymbolsDropdown.contains(e.target)) {
      mathSymbolsDropdown.classList.remove('show');
      mathSymbolsDropdown.style.display = 'none';
    }
  });
  
  // Inicializar eventos para el botón de ecuaciones (LaTeX)
  const insertEquationBtn = document.getElementById('insertEquationBtn');
  if (insertEquationBtn) {
    insertEquationBtn.removeEventListener('click', showEquationEditor);
    insertEquationBtn.addEventListener('click', showEquationEditor);
  }
  
  // Inicializar eventos para el botón de insertar tabla
  const insertTableBtn = document.getElementById('insertTableBtn');
  if (insertTableBtn) {
    insertTableBtn.removeEventListener('click', showTableEditor);
    insertTableBtn.addEventListener('click', showTableEditor);
  }
  
  // Inicializar eventos para el botón de fracciones
  const insertFractionBtn = document.getElementById('insertFractionBtn');
  if (insertFractionBtn) {
    insertFractionBtn.removeEventListener('click', showFractionDropdown);
    insertFractionBtn.addEventListener('click', showFractionDropdown);
  }
  
  console.log("Eventos para símbolos matemáticos inicializados correctamente");
}

// Función para mostrar el dropdown de expresiones matemáticas predeterminadas
function showExpressionsDropdown(button) {
  // Si ya existe, eliminarlo primero
  let expressionsDropdown = document.getElementById('expressionsDropdown');
  if (expressionsDropdown) {
    expressionsDropdown.remove();
  }
  
  // Crear el dropdown
  expressionsDropdown = document.createElement('div');
  expressionsDropdown.id = 'expressionsDropdown';
  expressionsDropdown.className = 'math-dropdown';
  expressionsDropdown.style.width = '200px';
  document.body.appendChild(expressionsDropdown);
  
  // Añadir lista de expresiones comunes
  const expressions = [
    { name: 'Fracción', latex: '\\frac{a}{b}' },
    { name: 'Fracción grande', latex: '\\dfrac{a}{b}' },
    { name: 'Superíndice', latex: 'a^{b}' },
    { name: 'Subíndice', latex: 'a_{b}' },
    { name: 'Límite', latex: '\\lim_{x \\to a}' },
    { name: 'Integral', latex: '\\int_{a}^{b}' },
    { name: 'Derivada', latex: '\\frac{d}{dx}' },
    { name: 'Raíz cuadrada', latex: '\\sqrt{x}' },
    { name: 'Raíz cúbica', latex: '\\sqrt[3]{x}' }
  ];
  
  // Crear elementos del dropdown
  expressions.forEach(expr => {
    const item = document.createElement('div');
    item.className = 'math-symbol';
    item.style.textAlign = 'left';
    item.style.padding = '8px';
    item.style.width = '100%';
    item.textContent = expr.name;
    item.dataset.latex = expr.latex;
    expressionsDropdown.appendChild(item);
    
    // Evento al hacer clic
    item.addEventListener('click', () => {
      insertMathLatex(expr.latex);
      expressionsDropdown.classList.remove('show');
      expressionsDropdown.style.display = 'none';
    });
  });
  
  // Mostrar el dropdown
  expressionsDropdown.classList.add('show');
  
  // Posicionar el dropdown
  const rect = button.getBoundingClientRect();
  expressionsDropdown.style.display = 'block';
  expressionsDropdown.style.top = `${rect.bottom + window.scrollY}px`;
  expressionsDropdown.style.left = `${rect.left + window.scrollX}px`;
  
  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (expressionsDropdown.classList.contains('show') && 
        !button.contains(e.target) && 
        !expressionsDropdown.contains(e.target)) {
      expressionsDropdown.classList.remove('show');
      expressionsDropdown.style.display = 'none';
    }
  }, { once: true });
}

// Función para insertar una tabla
function insertTable(rows, cols) {
  if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
    console.error('Dimensiones de tabla inválidas');
    return;
  }
  
  const editorContent = document.getElementById('mathEditorContent');
  if (!editorContent) {
    console.error('No se encontró el editor de contenido');
    return;
  }
  
  // Crear la tabla
  const table = document.createElement('table');
  table.className = 'math-editor-table';
  table.setAttribute('border', '1');
  table.setAttribute('cellpadding', '5');
  table.setAttribute('cellspacing', '0');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';
  table.style.marginBottom = '10px';
  
  // Crear filas y celdas
  for (let i = 0; i < rows; i++) {
    const row = document.createElement('tr');
    
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement('td');
      cell.setAttribute('contenteditable', 'true');
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minWidth = '30px';
      cell.style.minHeight = '20px';
      cell.innerHTML = '&nbsp;'; // Espacios para que la celda tenga altura
      row.appendChild(cell);
    }
    
    table.appendChild(row);
  }
  
  // Insertar en el editor
  editorContent.focus();
  
  // Obtener la selección actual
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(table);
    
    // Mover el cursor después de la tabla
    const newRange = document.createRange();
    newRange.setStartAfter(table);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } else {
    editorContent.appendChild(table);
  }
  
  // Sincronizar con el textarea
  const targetTextareaId = editorContent.dataset.targetTextareaId;
  if (targetTextareaId) {
    const textarea = document.getElementById(targetTextareaId);
    if (textarea) {
      textarea.value = editorContent.innerHTML;
    }
  }
}

// Función para mostrar el editor de ecuaciones
function showEquationEditor(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Mostrar modal o prompt para ingresar LaTeX
  const latex = prompt('Ingrese la expresión LaTeX:', '');
  if (latex !== null && latex.trim() !== '') {
    insertMathLatex(latex.trim());
  }
}

// Función para mostrar el editor de tablas
function showTableEditor(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Mostrar selector de filas y columnas
  const rows = prompt('Número de filas:', '3');
  if (rows === null) return;
  
  const cols = prompt('Número de columnas:', '3');
  if (cols === null) return;
  
  // Crear la tabla e insertarla
  insertTable(parseInt(rows), parseInt(cols));
}

// Función para mostrar el dropdown de fracciones
function showFractionDropdown(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Usar el mismo botón que se clickeó
  const button = e.currentTarget || document.getElementById('insertFractionBtn');
  if (button) {
    showExpressionsDropdown(button);
  }
}

// Función para inicializar eventos relacionados con ecuaciones
function initEquationEvents() {
  console.log("Inicializando eventos para ecuaciones...");
  
  // Podemos reutilizar la funcionalidad de ecuaciones ya implementada
  // para mantener la coherencia y simplificar el código
  try {
    // Asegurarse de que el modal esté creado
    if (!document.getElementById('equationModal')) {
      createEquationModal();
    }
    
    // No necesitamos más inicialización ya que showEquationEditor maneja 
    // todo lo relacionado con ecuaciones
    console.log("Eventos para ecuaciones inicializados correctamente");
  } catch (error) {
    console.error("Error al inicializar eventos de ecuaciones:", error);
  }
}

// Función para inicializar eventos relacionados con tablas
function initTableEvents() {
  console.log("Inicializando eventos para tablas...");
  
  try {
    // Asegurarse de que el modal esté creado
    if (!document.getElementById('tableModal')) {
      createTableModal();
    }
    
    // No necesitamos más inicialización ya que showTableEditor maneja
    // todo lo relacionado con tablas
    console.log("Eventos para tablas inicializados correctamente");
  } catch (error) {
    console.error("Error al inicializar eventos de tablas:", error);
  }
}