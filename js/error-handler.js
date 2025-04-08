// Script para manejar errores de carga en Netlify

// Detectar si estamos en Netlify
const isNetlifyEnvironment = window.location.hostname.includes('netlify.app') ||
                           window.location.hostname.includes('netlify.com');

console.log('Entorno Netlify detectado:', isNetlifyEnvironment);

// Función para manejar errores de recursos
function handleResourceError(event) {
    console.error('Error al cargar recurso:', event.target.src || event.target.href);

    // Si es un script de polyfill.io, reemplazarlo con la versión local
    if (event.target.src && event.target.src.includes('polyfill.io')) {
        console.log('Reemplazando polyfill.io con versión local');
        const newScript = document.createElement('script');
        newScript.src = '../js/polyfill.min.js';
        document.body.appendChild(newScript);
    }

    // Si es una actividad en Netlify, mostrar la versión estática
    if (isNetlifyEnvironment && event.target.src && event.target.src.includes('activity-loader.html')) {
        console.log('Error al cargar actividad, mostrando versión estática');

        // Buscar contenedores de actividad
        const activityContainers = document.querySelectorAll('[id^="activity-container"]');
        activityContainers.forEach(container => {
            // Cargar la versión estática
            fetch('../activities/templates/activity-static.html')
                .then(response => response.text())
                .then(html => {
                    container.innerHTML = html;
                })
                .catch(error => {
                    console.error('Error al cargar versión estática:', error);
                });
        });
    }
}

// Capturar errores de carga de recursos
window.addEventListener('error', function(event) {
    if (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK') {
        handleResourceError(event);
        // Evitar que el error se propague
        event.preventDefault();
        event.stopPropagation();
    }
}, true);

// Función para reemplazar scripts de polyfill.io con la versión local
function replacePolyfillScripts() {
    const scripts = document.querySelectorAll('script[src*="polyfill.io"]');
    scripts.forEach(function(script, index) {
        console.log(`Reemplazando script de polyfill.io #${index}`);
        const newScript = document.createElement('script');
        newScript.src = '../js/polyfill.min.js';
        script.parentNode.replaceChild(newScript, script);
    });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Reemplazar scripts de polyfill.io
    replacePolyfillScripts();

    // Verificar si hay iframes y agregar manejo de errores
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(iframe) {
        iframe.onerror = function() {
            console.error('Error al cargar iframe:', iframe.src);
        };
    });
});
