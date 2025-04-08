// Script para cargar contenido HTML y actividades sin usar iframes

function loadHTMLContent(url, containerId, fallbackUrl) {
    console.log('Cargando contenido HTML desde:', url);
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('Contenedor no encontrado:', containerId);
        return;
    }
    
    // Mostrar indicador de carga
    container.innerHTML = `
        <div class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando contenido...</p>
        </div>
    `;
    
    // Función para cargar el contenido
    function fetchContent(contentUrl) {
        fetch(contentUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Respuesta no válida: ' + response.status);
                }
                return response.text();
            })
            .then(html => {
                // Crear un contenedor para el contenido
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'html-content-wrapper';
                contentWrapper.innerHTML = html;
                
                // Limpiar el contenedor y agregar el contenido
                container.innerHTML = '';
                container.appendChild(contentWrapper);
                
                console.log('Contenido HTML cargado correctamente desde:', contentUrl);
                
                // Ejecutar scripts si hay alguno
                const scripts = contentWrapper.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript);
                });
            })
            .catch(error => {
                console.error('Error al cargar el contenido:', error);
                
                if (contentUrl !== fallbackUrl && fallbackUrl) {
                    console.warn('Intentando cargar contenido de fallback:', fallbackUrl);
                    fetchContent(fallbackUrl);
                } else {
                    // Mostrar mensaje de error
                    container.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Error:</strong> No se pudo cargar el contenido.
                            <p class="mt-2">Detalles: ${error.message}</p>
                        </div>
                    `;
                }
            });
    }
    
    // Iniciar la carga
    fetchContent(url);
}

// Función para verificar si un archivo existe
function checkFileExists(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        };
        xhr.onerror = function() {
            reject(new Error('Error al verificar archivo: ' + xhr.statusText));
        };
        xhr.send();
    });
}
