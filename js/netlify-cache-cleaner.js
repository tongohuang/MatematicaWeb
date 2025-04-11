/**
 * Utilidad para gestionar el caché en entornos Netlify
 *
 * Este script proporciona dos funcionalidades:
 * 1. Limpieza automática del caché para usuarios normales
 * 2. Botón manual de limpieza para administradores
 */

// Función para verificar si el usuario es administrador
function isAdmin() {
    // Verificar si estamos en el panel de administración o si hay una sesión de administrador
    return window.location.pathname.includes('/admin/') ||
           (typeof auth !== 'undefined' && auth.isAdmin && auth.isAdmin()) ||
           localStorage.getItem('admin_session') === 'true';
}

// Función para limpiar caché en Netlify (versión para administradores)
async function clearNetlifyCacheAdmin() {
    const isNetlify = window.location.hostname.includes('netlify.app');

    if (isNetlify) {
        console.log('Limpiando caché en Netlify (modo administrador)...');

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

// Función para limpiar caché automáticamente (versión para usuarios normales)
async function autoCleanNetlifyCache() {
    const isNetlify = window.location.hostname.includes('netlify.app');

    if (isNetlify && !isAdmin()) {
        console.log('Limpiando caché automáticamente en Netlify...');

        // Verificar si ya se limpió el caché en esta sesión
        // Usamos un timestamp para controlar la frecuencia de limpieza
        // (máximo una vez cada 30 minutos)
        const lastCacheClear = sessionStorage.getItem('netlify_cache_cleared');
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);

        if (lastCacheClear && parseInt(lastCacheClear) > thirtyMinutesAgo) {
            console.log('El caché ya fue limpiado recientemente:', new Date(parseInt(lastCacheClear)));
            return;
        }

        // Forzar recarga de archivos JSON sin mostrar indicadores visuales
        const files = [
            '/data/courses.json',
            '/data/topics.json',
            '/data/settings.json',
            '/data/activities.json',
            '/data/courseData.json'
        ];

        try {
            // Forzar recarga de cada archivo silenciosamente
            for (const file of files) {
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

            // Forzar la carga desde el repositorio sin limpiar localStorage
            if (typeof DataPersistence !== 'undefined') {
                console.log('Forzando carga de datos desde el repositorio...');
                await DataPersistence.init(true);

                // Registrar que se limpió el caché en esta sesión
                sessionStorage.setItem('netlify_cache_cleared', Date.now().toString());

                // No recargamos la página para no interrumpir la experiencia del usuario
                console.log('Caché limpiado automáticamente');
            }
        } catch (error) {
            console.error('Error al limpiar caché automáticamente:', error);
        }
    }
}

// Inicializar sistema de caché en entorno Netlify
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.hostname.includes('netlify.app')) {
        // Verificar si estamos en la página de inicio principal (solo raíz o /index.html)
        // Usamos una lógica más estricta para evitar que aparezca en otras páginas
        const path = window.location.pathname;
        const isHomePage = path === '/' ||
                          path === '/index.html' ||
                          path === 'index.html';

        // Verificar explícitamente que NO estamos en ninguna subpágina
        const isSubpage = path.includes('/courses/') ||
                         path.includes('/sections/') ||
                         path.includes('/admin/') ||
                         path.includes('/activities/') ||
                         path.includes('/topics/');

        // Solo mostrar en la página principal y no en subpáginas
        const isMainPageOnly = isHomePage && !isSubpage;

        // Para usuarios normales: limpieza automática (solo en página principal para no molestar)
        if (!isAdmin()) {
            if (isMainPageOnly) {
                // Ejecutar limpieza automática solo en la página principal
                await autoCleanNetlifyCache();
            } else {
                console.log('No estamos en la página principal, omitiendo limpieza automática de caché');
            }
        }
        // Para administradores: botón manual (solo en página principal)
        else if (isMainPageOnly) {
            // Crear botón flotante solo en la página principal
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
            cleanButton.onclick = clearNetlifyCacheAdmin;

            // Agregar efecto hover
            cleanButton.onmouseover = function() {
                this.style.backgroundColor = '#0069d9';
            };
            cleanButton.onmouseout = function() {
                this.style.backgroundColor = '#007bff';
            };

            // Agregar al DOM
            document.body.appendChild(cleanButton);

            console.log('Botón de limpieza de caché agregado para administradores en entorno Netlify');
        }
    }
});
