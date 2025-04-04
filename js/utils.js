// Cargar componentes HTML
async function loadComponent(elementId, path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error cargando componente ${path}:`, error);
    }
}

// Función para manejar errores
function handleError(error, message = 'Ha ocurrido un error') {
    console.error(error);
    // Aquí puedes implementar tu lógica de mostrar errores al usuario
}

// Función para validar formularios
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
        if (input.required && !input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Función para navegar entre páginas con rutas relativas
function navigateTo(path) {
    // Determinar la ruta base actual
    let basePath = '';
    const currentPath = window.location.pathname;

    // Contar cuántos niveles de profundidad estamos
    const pathParts = currentPath.split('/');
    const depth = pathParts.filter(part => part.length > 0).length - 1; // -1 porque no contamos el nombre del archivo

    // Construir la ruta base
    for (let i = 0; i < depth; i++) {
        basePath += '../';
    }

    // Navegar a la ruta completa
    window.location.href = basePath + path;
}