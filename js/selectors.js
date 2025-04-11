/**
 * Selectores visuales para iconos y colores
 * Permite seleccionar iconos de Font Awesome y colores de una paleta predefinida
 */

// Categorías de iconos de Font Awesome
const iconCategories = [
    { name: 'Básicos', icons: ['fa-home', 'fa-user', 'fa-users', 'fa-file', 'fa-folder', 'fa-book', 'fa-pencil', 'fa-pen', 'fa-edit', 'fa-trash', 'fa-cog', 'fa-gear', 'fa-wrench', 'fa-search', 'fa-bell', 'fa-calendar', 'fa-clock', 'fa-star', 'fa-heart', 'fa-envelope', 'fa-phone', 'fa-link', 'fa-image', 'fa-video', 'fa-music', 'fa-map', 'fa-flag', 'fa-check', 'fa-times', 'fa-info', 'fa-question', 'fa-exclamation', 'fa-comment', 'fa-comments', 'fa-paper-plane', 'fa-save', 'fa-download', 'fa-upload', 'fa-print', 'fa-eye', 'fa-eye-slash'] },

    { name: 'Matemáticas', icons: ['fa-calculator', 'fa-square-root-alt', 'fa-infinity', 'fa-percentage', 'fa-divide', 'fa-minus', 'fa-plus', 'fa-equals', 'fa-not-equal', 'fa-greater-than', 'fa-less-than', 'fa-greater-than-equal', 'fa-less-than-equal', 'fa-subscript', 'fa-superscript', 'fa-pi', 'fa-function', 'fa-sigma', 'fa-integral', 'fa-square', 'fa-circle', 'fa-triangle', 'fa-ruler', 'fa-ruler-combined', 'fa-ruler-horizontal', 'fa-ruler-vertical', 'fa-compass', 'fa-drafting-compass', 'fa-chart-line', 'fa-chart-bar', 'fa-chart-pie', 'fa-chart-area', 'fa-sort-numeric-down', 'fa-sort-numeric-up', 'fa-dice', 'fa-dice-one', 'fa-dice-two', 'fa-dice-three', 'fa-dice-four', 'fa-dice-five', 'fa-dice-six'] },

    { name: 'Educación', icons: ['fa-graduation-cap', 'fa-book-open', 'fa-chalkboard', 'fa-chalkboard-teacher', 'fa-school', 'fa-university', 'fa-atom', 'fa-microscope', 'fa-flask', 'fa-dna', 'fa-brain', 'fa-laptop-code', 'fa-code', 'fa-globe', 'fa-language', 'fa-book-reader', 'fa-award', 'fa-certificate', 'fa-user-graduate', 'fa-apple-alt', 'fa-pen-alt', 'fa-pen-fancy', 'fa-pen-nib', 'fa-pencil-alt', 'fa-pencil-ruler', 'fa-marker', 'fa-highlighter', 'fa-backspace', 'fa-eraser', 'fa-clipboard', 'fa-clipboard-check', 'fa-clipboard-list', 'fa-paste', 'fa-spell-check', 'fa-glasses', 'fa-landmark', 'fa-scroll', 'fa-feather', 'fa-feather-alt', 'fa-lightbulb'] },

    { name: 'Ciencias', icons: ['fa-atom', 'fa-microscope', 'fa-flask', 'fa-flask-vial', 'fa-vial', 'fa-dna', 'fa-bacteria', 'fa-virus', 'fa-magnet', 'fa-satellite', 'fa-satellite-dish', 'fa-meteor', 'fa-rocket', 'fa-user-astronaut', 'fa-globe', 'fa-globe-americas', 'fa-globe-asia', 'fa-globe-europe', 'fa-globe-africa', 'fa-mountain', 'fa-temperature-high', 'fa-temperature-low', 'fa-cloud', 'fa-cloud-rain', 'fa-cloud-showers-heavy', 'fa-cloud-sun', 'fa-cloud-sun-rain', 'fa-sun', 'fa-moon', 'fa-rainbow', 'fa-snowflake', 'fa-bolt', 'fa-wind', 'fa-tornado', 'fa-fire', 'fa-fire-alt'] },

    { name: 'Flechas', icons: ['fa-arrow-up', 'fa-arrow-down', 'fa-arrow-left', 'fa-arrow-right', 'fa-arrows-alt', 'fa-arrow-alt-circle-up', 'fa-arrow-alt-circle-down', 'fa-arrow-alt-circle-left', 'fa-arrow-alt-circle-right', 'fa-long-arrow-alt-up', 'fa-long-arrow-alt-down', 'fa-long-arrow-alt-left', 'fa-long-arrow-alt-right', 'fa-chevron-up', 'fa-chevron-down', 'fa-chevron-left', 'fa-chevron-right', 'fa-chevron-circle-up', 'fa-chevron-circle-down', 'fa-chevron-circle-left', 'fa-chevron-circle-right', 'fa-angle-up', 'fa-angle-down', 'fa-angle-left', 'fa-angle-right', 'fa-angle-double-up', 'fa-angle-double-down', 'fa-angle-double-left', 'fa-angle-double-right', 'fa-caret-up', 'fa-caret-down', 'fa-caret-left', 'fa-caret-right', 'fa-arrows-alt-h', 'fa-arrows-alt-v', 'fa-exchange-alt', 'fa-redo', 'fa-undo', 'fa-reply', 'fa-share', 'fa-external-link-alt', 'fa-expand', 'fa-compress', 'fa-random', 'fa-retweet', 'fa-sync', 'fa-sync-alt'] },

    { name: 'Formas', icons: ['fa-square', 'fa-circle', 'fa-triangle', 'fa-cube', 'fa-cubes', 'fa-shapes', 'fa-puzzle-piece', 'fa-gem', 'fa-heart', 'fa-star', 'fa-moon', 'fa-sun', 'fa-cloud', 'fa-snowflake', 'fa-bolt', 'fa-fire', 'fa-bookmark', 'fa-certificate', 'fa-shield-alt', 'fa-crown', 'fa-trophy', 'fa-award', 'fa-medal', 'fa-ribbon', 'fa-tag', 'fa-tags', 'fa-ticket-alt', 'fa-thumbtack', 'fa-thumbs-up', 'fa-thumbs-down', 'fa-hand-point-up', 'fa-hand-point-down', 'fa-hand-point-left', 'fa-hand-point-right', 'fa-hand-peace', 'fa-hand-rock', 'fa-hand-paper', 'fa-hand-scissors', 'fa-hand-lizard', 'fa-hand-spock'] },

    { name: 'Tecnología', icons: ['fa-laptop', 'fa-desktop', 'fa-mobile', 'fa-mobile-alt', 'fa-tablet', 'fa-tablet-alt', 'fa-tv', 'fa-keyboard', 'fa-mouse', 'fa-headphones', 'fa-microphone', 'fa-camera', 'fa-video', 'fa-film', 'fa-gamepad', 'fa-server', 'fa-database', 'fa-hdd', 'fa-sd-card', 'fa-memory', 'fa-microchip', 'fa-sim-card', 'fa-usb', 'fa-ethernet', 'fa-wifi', 'fa-broadcast-tower', 'fa-satellite-dish', 'fa-router', 'fa-battery-full', 'fa-battery-three-quarters', 'fa-battery-half', 'fa-battery-quarter', 'fa-battery-empty', 'fa-power-off', 'fa-plug', 'fa-solar-panel', 'fa-lightbulb', 'fa-print', 'fa-fax', 'fa-phone', 'fa-phone-alt', 'fa-phone-slash', 'fa-tty', 'fa-walkie-talkie'] }
];

// Colores predefinidos
const predefinedColors = [
    // Rojos
    '#FF0000', '#FF5252', '#FF1744', '#D50000', '#C62828', '#B71C1C', '#E57373', '#EF9A9A', '#FFCDD2', '#8B0000',
    // Naranjas
    '#FF9800', '#FFA726', '#FF9100', '#FF6D00', '#EF6C00', '#E65100', '#FFB74D', '#FFCC80', '#FFE0B2', '#FF4500',
    // Amarillos
    '#FFEB3B', '#FFEE58', '#FFEA00', '#FFD600', '#FBC02D', '#F9A825', '#FFF176', '#FFF59D', '#FFF9C4', '#FFD700',
    // Verdes
    '#4CAF50', '#66BB6A', '#69F0AE', '#00E676', '#43A047', '#2E7D32', '#81C784', '#A5D6A7', '#C8E6C9', '#008000',
    // Azules
    '#2196F3', '#42A5F5', '#40C4FF', '#00B0FF', '#1976D2', '#0D47A1', '#64B5F6', '#90CAF9', '#BBDEFB', '#0000FF',
    // Morados
    '#9C27B0', '#AB47BC', '#EA80FC', '#E040FB', '#8E24AA', '#6A1B9A', '#BA68C8', '#CE93D8', '#E1BEE7', '#800080',
    // Rosas
    '#E91E63', '#EC407A', '#FF80AB', '#FF4081', '#D81B60', '#AD1457', '#F06292', '#F48FB1', '#F8BBD0', '#FF1493',
    // Marrones
    '#795548', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9', '#6D4C41', '#5D4037', '#4E342E', '#3E2723',
    // Grises
    '#9E9E9E', '#BDBDBD', '#E0E0E0', '#EEEEEE', '#F5F5F5', '#FAFAFA', '#757575', '#616161', '#424242', '#212121',
    // Azules grisáceos
    '#607D8B', '#78909C', '#90A4AE', '#B0BEC5', '#CFD8DC', '#ECEFF1', '#546E7A', '#455A64', '#37474F', '#263238',
    // Tonos de gris
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'
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

        // Ajustar posición del dropdown según el espacio disponible
        adjustDropdownPosition(dropdown, button);
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

        // Ajustar posición del dropdown según el espacio disponible
        adjustDropdownPosition(dropdown, button);
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

/**
 * Ajusta la posición del dropdown según el espacio disponible en la ventana
 * @param {HTMLElement} dropdown - El elemento dropdown a ajustar
 * @param {HTMLElement} button - El botón que activa el dropdown
 */
function adjustDropdownPosition(dropdown, button) {
    if (!dropdown || !button) return;

    // Obtener dimensiones y posiciones
    const dropdownRect = dropdown.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // Calcular el espacio disponible a la derecha
    const rightSpace = windowWidth - buttonRect.right;

    // Si no hay suficiente espacio a la derecha, ajustar la posición
    if (rightSpace < dropdownRect.width) {
        // Calcular cuánto espacio hay a la izquierda
        const leftSpace = buttonRect.left;

        if (leftSpace > dropdownRect.width) {
            // Si hay más espacio a la izquierda, mostrar hacia la izquierda
            dropdown.style.right = 'auto';
            dropdown.style.left = '0';
        } else {
            // Si no hay suficiente espacio ni a la izquierda ni a la derecha,
            // centrar el dropdown lo mejor posible
            const offset = Math.min(dropdownRect.width - rightSpace, leftSpace);
            dropdown.style.right = `${offset}px`;
        }
    } else {
        // Si hay suficiente espacio a la derecha, mantener la posición predeterminada
        dropdown.style.right = '0';
        dropdown.style.left = 'auto';
    }
}
