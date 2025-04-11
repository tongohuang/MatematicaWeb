/**
 * Botón flotante para limpiar la caché
 *
 * Este script añade un botón flotante en la esquina inferior derecha
 * que permite a los usuarios limpiar la caché en cualquier momento.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Solo crear el botón si estamos en producción (Netlify) y en la página principal
    const isNetlify = window.location.hostname.includes('netlify.app');

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

    if (isNetlify && isMainPageOnly) {
        // Crear el botón flotante
        const floatingButton = document.createElement('button');
        floatingButton.id = 'floatingCacheButton';
        floatingButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        floatingButton.title = 'Actualizar';

        // Añadir estilos al botón
        floatingButton.style.position = 'fixed';
        floatingButton.style.bottom = '20px';
        floatingButton.style.right = '20px';
        floatingButton.style.width = '50px';
        floatingButton.style.height = '50px';
        floatingButton.style.borderRadius = '50%';
        floatingButton.style.backgroundColor = '#0d6efd';
        floatingButton.style.color = 'white';
        floatingButton.style.border = 'none';
        floatingButton.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        floatingButton.style.cursor = 'pointer';
        floatingButton.style.zIndex = '9999';
        floatingButton.style.fontSize = '20px';
        floatingButton.style.display = 'flex';
        floatingButton.style.alignItems = 'center';
        floatingButton.style.justifyContent = 'center';
        floatingButton.style.transition = 'all 0.3s ease';

        // Añadir efectos hover
        floatingButton.onmouseover = function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 15px rgba(0,0,0,0.3)';
        };

        floatingButton.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        };

        // Añadir evento de clic para actualizar
        floatingButton.onclick = function() {
            // Añadir animación de rotación
            this.style.animation = 'spin 1s linear';

            // Ejecutar la función de restablecer completamente
            if (window.CacheControl) {
                window.CacheControl.clearCache(true, true, true);
            } else {
                if (confirm('Para garantizar que veas la última versión del sitio, se realizará una actualización completa que recargará todos los datos.\n\n¿Deseas continuar?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload(true);
                }
            }

            // Eliminar animación después de completarse
            setTimeout(() => {
                this.style.animation = '';
            }, 1000);
        };

        // Añadir estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Añadir el botón al body
        document.body.appendChild(floatingButton);

        console.log('Botón flotante para limpiar caché añadido');
    }
});
