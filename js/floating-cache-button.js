/**
 * Botón flotante para limpiar la caché
 *
 * Este script añade un botón flotante en la esquina inferior derecha
 * que permite a los usuarios limpiar la caché en cualquier momento.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Solo crear el botón si estamos en producción (Netlify)
    const isNetlify = window.location.hostname.includes('netlify.app');

    if (isNetlify) {
        // Crear el botón flotante
        const floatingButton = document.createElement('button');
        floatingButton.id = 'floatingCacheButton';
        floatingButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        floatingButton.title = 'Actualizar sitio (limpiar caché)';

        // Añadir estilos al botón
        floatingButton.style.position = 'fixed';
        floatingButton.style.bottom = '20px';
        floatingButton.style.right = '20px';
        floatingButton.style.width = '50px';
        floatingButton.style.height = '50px';
        floatingButton.style.borderRadius = '50%';
        floatingButton.style.backgroundColor = '#dc3545';
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

        // Crear menú flotante para opciones adicionales
        const floatingMenu = document.createElement('div');
        floatingMenu.id = 'floatingCacheMenu';
        floatingMenu.style.position = 'fixed';
        floatingMenu.style.bottom = '80px';
        floatingMenu.style.right = '20px';
        floatingMenu.style.backgroundColor = 'white';
        floatingMenu.style.borderRadius = '8px';
        floatingMenu.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        floatingMenu.style.padding = '10px';
        floatingMenu.style.display = 'none';
        floatingMenu.style.zIndex = '9998';
        floatingMenu.style.transition = 'all 0.3s ease';
        floatingMenu.style.transform = 'translateY(10px)';
        floatingMenu.style.opacity = '0';

        // Añadir opciones al menú
        floatingMenu.innerHTML = `
            <div class="p-2">
                <button id="normalCleanBtn" class="btn btn-sm btn-danger w-100 mb-2">
                    <i class="fas fa-sync-alt me-2"></i> Actualizar sitio
                </button>
                <button id="hardResetBtn" class="btn btn-sm btn-outline-danger w-100">
                    <i class="fas fa-trash-alt me-2"></i> Restablecer completamente
                </button>
                <div class="mt-2 small text-muted">
                    <i class="fas fa-info-circle me-1"></i> El restablecimiento completo borra todos los datos locales
                </div>
            </div>
        `;

        // Añadir el menú al body
        document.body.appendChild(floatingMenu);

        // Configurar eventos para los botones del menú
        document.getElementById('normalCleanBtn').addEventListener('click', function() {
            hideMenu();
            if (window.CacheControl) {
                floatingButton.style.animation = 'spin 1s linear';
                window.CacheControl.clearCache(true, true);
                setTimeout(() => { floatingButton.style.animation = ''; }, 1000);
            } else {
                alert('No se pudo limpiar la caché. Por favor, recarga la página manualmente.');
                window.location.reload(true);
            }
        });

        document.getElementById('hardResetBtn').addEventListener('click', function() {
            hideMenu();
            if (window.CacheControl) {
                floatingButton.style.animation = 'spin 1s linear';
                window.CacheControl.clearCache(true, true, true);
                setTimeout(() => { floatingButton.style.animation = ''; }, 1000);
            } else {
                if (confirm('ATENCIÓN: Estás a punto de realizar un restablecimiento completo que borrará TODOS los datos almacenados localmente. Esta acción no se puede deshacer.\n\n¿Deseas continuar?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload(true);
                }
            }
        });

        // Función para mostrar el menú
        function showMenu() {
            floatingMenu.style.display = 'block';
            // Pequeño retraso para permitir que la transición funcione
            setTimeout(() => {
                floatingMenu.style.transform = 'translateY(0)';
                floatingMenu.style.opacity = '1';
            }, 10);
        }

        // Función para ocultar el menú
        function hideMenu() {
            floatingMenu.style.transform = 'translateY(10px)';
            floatingMenu.style.opacity = '0';
            setTimeout(() => {
                floatingMenu.style.display = 'none';
            }, 300);
        }

        // Variable para controlar si el menú está visible
        let menuVisible = false;

        // Añadir efectos hover
        floatingButton.onmouseover = function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 15px rgba(0,0,0,0.3)';
        };

        floatingButton.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        };

        // Añadir evento de clic para mostrar/ocultar el menú
        floatingButton.onclick = function() {
            // Alternar visibilidad del menú
            if (menuVisible) {
                hideMenu();
                menuVisible = false;
            } else {
                showMenu();
                menuVisible = true;
            }

            // Añadir animación de rotación
            this.style.animation = 'spin 1s linear';

            // Eliminar animación después de completarse
            setTimeout(() => {
                this.style.animation = '';
            }, 1000);
        };

        // Cerrar el menú al hacer clic fuera de él
        document.addEventListener('click', function(event) {
            if (menuVisible && event.target !== floatingButton && !floatingMenu.contains(event.target)) {
                hideMenu();
                menuVisible = false;
            }
        });

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
