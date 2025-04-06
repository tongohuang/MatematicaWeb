/**
 * Selectores visuales para iconos y colores
 * Permite seleccionar iconos de Font Awesome y colores de una paleta predefinida
 */

// Categorías de iconos de Font Awesome
const iconCategories = [
    { name: 'Básicos', icons: ['fa-home', 'fa-user', 'fa-file', 'fa-folder', 'fa-book', 'fa-pencil', 'fa-pen', 'fa-edit', 'fa-trash', 'fa-cog', 'fa-gear', 'fa-wrench', 'fa-search', 'fa-bell', 'fa-calendar', 'fa-clock', 'fa-star', 'fa-heart', 'fa-envelope', 'fa-phone', 'fa-link', 'fa-image', 'fa-video', 'fa-music', 'fa-map', 'fa-flag'] },
    { name: 'Matemáticas', icons: ['fa-calculator', 'fa-square-root-alt', 'fa-infinity', 'fa-percentage', 'fa-divide', 'fa-minus', 'fa-plus', 'fa-equals', 'fa-not-equal', 'fa-greater-than', 'fa-less-than', 'fa-greater-than-equal', 'fa-less-than-equal', 'fa-subscript', 'fa-superscript', 'fa-pi', 'fa-function', 'fa-sigma', 'fa-integral', 'fa-square', 'fa-circle', 'fa-triangle'] },
    { name: 'Educación', icons: ['fa-graduation-cap', 'fa-book-open', 'fa-chalkboard', 'fa-chalkboard-teacher', 'fa-school', 'fa-university', 'fa-atom', 'fa-microscope', 'fa-flask', 'fa-dna', 'fa-brain', 'fa-laptop-code', 'fa-code', 'fa-globe', 'fa-language', 'fa-book-reader', 'fa-award', 'fa-certificate', 'fa-user-graduate'] },
    { name: 'Flechas', icons: ['fa-arrow-up', 'fa-arrow-down', 'fa-arrow-left', 'fa-arrow-right', 'fa-arrows-alt', 'fa-arrow-alt-circle-up', 'fa-arrow-alt-circle-down', 'fa-arrow-alt-circle-left', 'fa-arrow-alt-circle-right', 'fa-long-arrow-alt-up', 'fa-long-arrow-alt-down', 'fa-long-arrow-alt-left', 'fa-long-arrow-alt-right', 'fa-chevron-up', 'fa-chevron-down', 'fa-chevron-left', 'fa-chevron-right'] },
    { name: 'Formas', icons: ['fa-square', 'fa-circle', 'fa-triangle', 'fa-cube', 'fa-cubes', 'fa-shapes', 'fa-puzzle-piece', 'fa-gem', 'fa-heart', 'fa-star', 'fa-moon', 'fa-sun', 'fa-cloud', 'fa-snowflake', 'fa-bolt', 'fa-fire'] }
];

// Colores predefinidos
const predefinedColors = [
    // Colores primarios
    '#FF0000', '#00FF00', '#0000FF', 
    // Colores secundarios
    '#FFFF00', '#FF00FF', '#00FFFF', 
    // Tonos de gris
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    // Colores pastel
    '#FFB6C1', '#FFD700', '#98FB98', '#ADD8E6', '#DDA0DD', '#F0E68C',
    // Colores vibrantes
    '#FF4500', '#32CD32', '#1E90FF', '#FF1493', '#8A2BE2', '#00CED1',
    // Colores oscuros
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'
];

/**
 * Inicializa el selector de iconos
 * @param {string} inputId - ID del input de texto para el icono
 * @param {string} previewId - ID del elemento para la vista previa del icono (opcional)
 */
function initIconSelector(inputId, previewId = null) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Crear el contenedor del selector
    const container = document.createElement('div');
    container.className = 'icon-selector-container';
    container.id = `${inputId}-container`;
    
    // Crear el botón para abrir el selector
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-secondary';
    button.innerHTML = '<i class="fas fa-icons"></i> Seleccionar Icono';
    button.id = `${inputId}-button`;
    
    // Crear el dropdown del selector
    const dropdown = document.createElement('div');
    dropdown.className = 'icon-selector-dropdown';
    dropdown.id = `${inputId}-dropdown`;
    
    // Crear el campo de búsqueda
    const searchContainer = document.createElement('div');
    searchContainer.className = 'icon-selector-search mb-2';
    searchContainer.innerHTML = `
        <input type="text" class="form-control" id="${inputId}-search" placeholder="Buscar icono...">
    `;
    
    // Crear las categorías
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'icon-selector-categories';
    
    iconCategories.forEach((category, index) => {
        const categoryButton = document.createElement('div');
        categoryButton.className = 'icon-selector-category';
        categoryButton.textContent = category.name;
        categoryButton.dataset.category = index;
        
        if (index === 0) {
            categoryButton.classList.add('active');
        }
        
        categoriesContainer.appendChild(categoryButton);
    });
    
    // Crear la cuadrícula de iconos
    const grid = document.createElement('div');
    grid.className = 'icon-selector-grid';
    grid.id = `${inputId}-grid`;
    
    // Agregar los elementos al dropdown
    dropdown.appendChild(searchContainer);
    dropdown.appendChild(categoriesContainer);
    dropdown.appendChild(grid);
    
    // Agregar el botón y el dropdown al contenedor
    container.appendChild(button);
    container.appendChild(dropdown);
    
    // Insertar el contenedor después del input
    input.parentNode.insertBefore(container, input.nextSibling);
    
    // Cargar los iconos de la primera categoría
    loadIcons(inputId, 0);
    
    // Configurar eventos
    setupIconSelectorEvents(inputId, previewId);
}

/**
 * Carga los iconos de una categoría en la cuadrícula
 * @param {string} inputId - ID del input de texto para el icono
 * @param {number} categoryIndex - Índice de la categoría a cargar
 */
function loadIcons(inputId, categoryIndex) {
    const grid = document.getElementById(`${inputId}-grid`);
    if (!grid) return;
    
    const category = iconCategories[categoryIndex];
    if (!category) return;
    
    grid.innerHTML = '';
    
    category.icons.forEach(icon => {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-selector-item';
        iconItem.dataset.icon = icon;
        iconItem.innerHTML = `<i class="fas ${icon}"></i>`;
        
        grid.appendChild(iconItem);
    });
}

/**
 * Configura los eventos del selector de iconos
 * @param {string} inputId - ID del input de texto para el icono
 * @param {string} previewId - ID del elemento para la vista previa del icono
 */
function setupIconSelectorEvents(inputId, previewId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(`${inputId}-button`);
    const dropdown = document.getElementById(`${inputId}-dropdown`);
    const grid = document.getElementById(`${inputId}-grid`);
    const search = document.getElementById(`${inputId}-search`);
    const categoriesContainer = dropdown.querySelector('.icon-selector-categories');
    
    // Evento para abrir/cerrar el dropdown
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Cerrar el dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== button) {
            dropdown.classList.remove('show');
        }
    });
    
    // Evento para seleccionar un icono
    grid.addEventListener('click', (e) => {
        const iconItem = e.target.closest('.icon-selector-item');
        if (iconItem) {
            const icon = iconItem.dataset.icon;
            input.value = `fas ${icon}`;
            dropdown.classList.remove('show');
            
            // Actualizar la vista previa si existe
            if (previewId) {
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.innerHTML = `<i class="fas ${icon}"></i>`;
                }
            }
        }
    });
    
    // Evento para cambiar de categoría
    categoriesContainer.addEventListener('click', (e) => {
        const categoryButton = e.target.closest('.icon-selector-category');
        if (categoryButton) {
            const categoryIndex = parseInt(categoryButton.dataset.category);
            
            // Actualizar la clase activa
            categoriesContainer.querySelectorAll('.icon-selector-category').forEach(btn => {
                btn.classList.remove('active');
            });
            categoryButton.classList.add('active');
            
            // Cargar los iconos de la categoría seleccionada
            loadIcons(inputId, categoryIndex);
        }
    });
    
    // Evento para buscar iconos
    search.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        
        if (searchText.trim() === '') {
            // Si el campo de búsqueda está vacío, mostrar la categoría activa
            const activeCategory = categoriesContainer.querySelector('.icon-selector-category.active');
            if (activeCategory) {
                const categoryIndex = parseInt(activeCategory.dataset.category);
                loadIcons(inputId, categoryIndex);
            }
            return;
        }
        
        // Buscar en todas las categorías
        const matchingIcons = [];
        iconCategories.forEach(category => {
            category.icons.forEach(icon => {
                if (icon.toLowerCase().includes(searchText)) {
                    matchingIcons.push(icon);
                }
            });
        });
        
        // Mostrar los resultados
        grid.innerHTML = '';
        
        if (matchingIcons.length === 0) {
            grid.innerHTML = '<div class="text-center p-3 text-muted">No se encontraron iconos</div>';
            return;
        }
        
        matchingIcons.forEach(icon => {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-selector-item';
            iconItem.dataset.icon = icon;
            iconItem.innerHTML = `<i class="fas ${icon}"></i>`;
            
            grid.appendChild(iconItem);
        });
    });
    
    // Actualizar la vista previa inicial si existe
    if (previewId && input.value) {
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = `<i class="${input.value}"></i>`;
        }
    }
}

/**
 * Inicializa el selector de colores
 * @param {string} inputId - ID del input de texto para el color
 * @param {string} previewId - ID del elemento para la vista previa del color (opcional)
 */
function initColorSelector(inputId, previewId = null) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Crear el contenedor del selector
    const container = document.createElement('div');
    container.className = 'color-selector-container';
    container.id = `${inputId}-container`;
    
    // Crear el botón para abrir el selector
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-secondary';
    button.innerHTML = '<i class="fas fa-palette"></i> Seleccionar Color';
    button.id = `${inputId}-button`;
    
    // Crear el dropdown del selector
    const dropdown = document.createElement('div');
    dropdown.className = 'color-selector-dropdown';
    dropdown.id = `${inputId}-dropdown`;
    
    // Crear la cuadrícula de colores
    const grid = document.createElement('div');
    grid.className = 'color-selector-grid';
    
    predefinedColors.forEach(color => {
        const colorItem = document.createElement('div');
        colorItem.className = 'color-selector-item';
        colorItem.style.backgroundColor = color;
        colorItem.dataset.color = color;
        
        grid.appendChild(colorItem);
    });
    
    // Crear el selector de color personalizado
    const customColorContainer = document.createElement('div');
    customColorContainer.className = 'color-selector-custom';
    customColorContainer.innerHTML = `
        <div class="mb-2">Color personalizado:</div>
        <div class="color-selector-custom-input">
            <input type="color" class="form-control form-control-color" id="${inputId}-custom">
            <button type="button" class="btn btn-sm btn-primary" id="${inputId}-apply">Aplicar</button>
        </div>
    `;
    
    // Agregar los elementos al dropdown
    dropdown.appendChild(grid);
    dropdown.appendChild(customColorContainer);
    
    // Agregar el botón y el dropdown al contenedor
    container.appendChild(button);
    container.appendChild(dropdown);
    
    // Insertar el contenedor después del input
    input.parentNode.insertBefore(container, input.nextSibling);
    
    // Configurar eventos
    setupColorSelectorEvents(inputId, previewId);
}

/**
 * Configura los eventos del selector de colores
 * @param {string} inputId - ID del input de texto para el color
 * @param {string} previewId - ID del elemento para la vista previa del color
 */
function setupColorSelectorEvents(inputId, previewId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(`${inputId}-button`);
    const dropdown = document.getElementById(`${inputId}-dropdown`);
    const customColorInput = document.getElementById(`${inputId}-custom`);
    const applyButton = document.getElementById(`${inputId}-apply`);
    
    // Evento para abrir/cerrar el dropdown
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Cerrar el dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== button) {
            dropdown.classList.remove('show');
        }
    });
    
    // Evento para seleccionar un color predefinido
    dropdown.querySelectorAll('.color-selector-item').forEach(item => {
        item.addEventListener('click', () => {
            const color = item.dataset.color;
            input.value = color.replace('#', '');
            dropdown.classList.remove('show');
            
            // Actualizar la vista previa si existe
            if (previewId) {
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.style.backgroundColor = color;
                }
            }
        });
    });
    
    // Evento para aplicar un color personalizado
    applyButton.addEventListener('click', () => {
        const color = customColorInput.value;
        input.value = color.replace('#', '');
        dropdown.classList.remove('show');
        
        // Actualizar la vista previa si existe
        if (previewId) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.style.backgroundColor = color;
            }
        }
    });
    
    // Actualizar la vista previa inicial si existe
    if (previewId && input.value) {
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.style.backgroundColor = `#${input.value}`;
        }
    }
}

// Inicializar los selectores cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Buscar todos los inputs que necesitan selectores
    const iconInputs = document.querySelectorAll('[data-selector="icon"]');
    const colorInputs = document.querySelectorAll('[data-selector="color"]');
    
    // Inicializar los selectores de iconos
    iconInputs.forEach(input => {
        const previewId = input.dataset.preview;
        initIconSelector(input.id, previewId);
    });
    
    // Inicializar los selectores de colores
    colorInputs.forEach(input => {
        const previewId = input.dataset.preview;
        initColorSelector(input.id, previewId);
    });
});
