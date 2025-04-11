/**
 * Utilidad para limpiar el caché en entornos Netlify
 * 
 * Este script agrega un botón flotante en entornos Netlify para:
 * 1. Forzar la recarga de archivos JSON sin caché
 * 2. Limpiar localStorage si es necesario
 * 3. Recargar la página con los datos actualizados
 */

// Función para limpiar caché en Netlify
async function clearNetlifyCache() {
    const isNetlify = window.location.hostname.includes('netlify.app');
    
    if (isNetlify) {
        console.log('Limpiando caché en Netlify...');
        
        // Forzar recarga de archivos JSON
        const files = [
            '/data/courses.json',
            '/data/topics.json',
            '/data/settings.json',
            '/data/activities.json',
            '/data/courseData.json'
        ];

        try {
            // Mostrar indicador de carga
            const loadingIndicator = document.createElement('div');
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.background = 'rgba(0,0,0,0.7)';
            loadingIndicator.style.color = 'white';
            loadingIndicator.style.padding = '20px';
            loadingIndicator.style.borderRadius = '10px';
            loadingIndicator.style.zIndex = '10000';
            loadingIndicator.innerHTML = '<p>Limpiando caché...</p>';
            document.body.appendChild(loadingIndicator);
            
            // Forzar recarga de cada archivo
            for (const file of files) {
                loadingIndicator.innerHTML = `<p>Recargando ${file}...</p>`;
                const response = await fetch(file, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                
                if (!response.ok) {
                    console.warn(`No se pudo cargar ${file}`);
                } else {
                    console.log(`${file} recargado correctamente`);
                }
            }
            
            // Preguntar si se debe limpiar localStorage
            document.body.removeChild(loadingIndicator);
            if (confirm('¿Desea limpiar los datos locales almacenados? Esto eliminará todos los datos guardados en el navegador.')) {
                localStorage.clear();
                console.log('localStorage limpiado');
                
                // Recargar la página para aplicar los cambios
                alert('Caché limpiado. La página se recargará para aplicar los cambios.');
                window.location.reload(true);
            } else {
                // Forzar la carga desde el repositorio sin limpiar localStorage
                if (typeof DataPersistence !== 'undefined') {
                    alert('Forzando carga de datos desde el repositorio...');
                    await DataPersistence.init(true);
                    window.location.reload(true);
                } else {
                    alert('Caché limpiado. La página se recargará para aplicar los cambios.');
                    window.location.reload(true);
                }
            }
        } catch (error) {
            console.error('Error al limpiar caché:', error);
            alert('Error al limpiar caché: ' + error.message);
        }
    }
}

// Agregar botón de limpieza en entorno Netlify
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hostname.includes('netlify.app')) {
        // Crear botón flotante
        const cleanButton = document.createElement('button');
        cleanButton.textContent = 'Limpiar Caché';
        cleanButton.style.position = 'fixed';
        cleanButton.style.bottom = '20px';
        cleanButton.style.right = '20px';
        cleanButton.style.zIndex = '9999';
        cleanButton.style.padding = '10px 15px';
        cleanButton.style.backgroundColor = '#007bff';
        cleanButton.style.color = 'white';
        cleanButton.style.border = 'none';
        cleanButton.style.borderRadius = '5px';
        cleanButton.style.cursor = 'pointer';
        cleanButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        cleanButton.onclick = clearNetlifyCache;
        
        // Agregar efecto hover
        cleanButton.onmouseover = function() {
            this.style.backgroundColor = '#0069d9';
        };
        cleanButton.onmouseout = function() {
            this.style.backgroundColor = '#007bff';
        };
        
        // Agregar al DOM
        document.body.appendChild(cleanButton);
        
        console.log('Botón de limpieza de caché agregado para entorno Netlify');
    }
});
