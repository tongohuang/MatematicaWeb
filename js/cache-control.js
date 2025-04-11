/**
 * Control de caché para MatemáticaWeb
 *
 * Este script se encarga de verificar si hay una nueva versión disponible
 * y forzar la recarga de la página si es necesario.
 */

const CacheControl = {
    // Versión actual en memoria
    currentVersion: null,

    // Tiempo de verificación en milisegundos (5 minutos)
    checkInterval: 5 * 60 * 1000,

    // Ruta al archivo de versión
    versionFile: '/data/version.json',

    /**
     * Inicializa el control de caché
     */
    init() {
        console.log('Inicializando control de caché...');

        // Verificar versión al cargar la página
        this.checkVersion();

        // Configurar verificación periódica
        setInterval(() => this.checkVersion(), this.checkInterval);
    },

    /**
     * Verifica si hay una nueva versión disponible
     */
    async checkVersion() {
        try {
            // Añadir timestamp para evitar caché
            const timestamp = Date.now();
            const url = `${this.versionFile}?t=${timestamp}`;

            // Opciones para evitar caché
            const fetchOptions = {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            };

            // Obtener versión del servidor
            const response = await fetch(url, fetchOptions);

            if (response.ok) {
                const versionData = await response.json();

                // Si es la primera verificación, guardar versión actual
                if (!this.currentVersion) {
                    this.currentVersion = versionData;
                    console.log('%c[Control de Caché] Versión cargada: ' + versionData.version, 'color: #4CAF50');
                    console.log('%c[Control de Caché] Fecha: ' + new Date(versionData.timestamp).toLocaleString(), 'color: #4CAF50');
                    return;
                }

                // Verificar si hay una nueva versión
                if (versionData.timestamp > this.currentVersion.timestamp) {
                    console.log('%c[Control de Caché] ¡NUEVA VERSIÓN DETECTADA!', 'color: #FF5722; font-weight: bold; font-size: 14px');
                    console.log('%c[Control de Caché] Versión anterior: ' + this.currentVersion.version + ' (' + new Date(this.currentVersion.timestamp).toLocaleString() + ')', 'color: #FF9800');
                    console.log('%c[Control de Caché] Nueva versión: ' + versionData.version + ' (' + new Date(versionData.timestamp).toLocaleString() + ')', 'color: #4CAF50');
                    console.log('%c[Control de Caché] Actualizando...', 'color: #2196F3');

                    // Limpiar caché de localStorage
                    this.clearLocalStorageCache();

                    // Forzar recarga de la página
                    this.forceReload();
                } else {
                    // Mensaje discreto para no llenar la consola
                    console.log('%c[Control de Caché] Versión actualizada', 'color: #4CAF50');
                }
            } else {
                console.warn('%c[Control de Caché] No se pudo verificar la versión: ' + response.status, 'color: #FFC107');
            }
        } catch (error) {
            console.error('%c[Control de Caché] Error verificando versión: ' + error.message, 'color: #F44336');
        }
    },

    /**
     * Limpia la caché de localStorage
     * @param {boolean} fullClean - Si es true, limpia también los datos de courseData
     */
    clearLocalStorageCache(fullClean = false) {
        // Limpiar solo las claves relacionadas con la caché
        const cacheKeys = [
            'jsonData_courseData',
            'jsonData_courses',
            'jsonData_topics',
            'jsonData_settings',
            'jsonData_activities',
            'lastGeneratedJSON',
            'lastJSONGenerationTime',
            'siteVersion',
            'netlify_cache_cleared'
        ];

        // Si es limpieza completa, añadir también courseData
        if (fullClean) {
            cacheKeys.push('courseData');
            // Limpiar también sessionStorage
            sessionStorage.clear();
            console.log('SessionStorage limpiado completamente');
        }

        cacheKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`Caché eliminada: ${key}`);
            }
        });

        // Limpiar también la caché del navegador si es posible
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                    console.log(`Caché del navegador eliminada: ${cacheName}`);
                });
            });
        }
    },

    /**
     * Fuerza la recarga de la página
     */
    forceReload() {
        console.log('%c[Control de Caché] Forzando recarga de la página para actualizar a la nueva versión...', 'color: #2196F3; font-weight: bold');

        // Mostrar mensaje al usuario
        if (document.body) {
            // Crear contenedor principal
            const reloadContainer = document.createElement('div');
            reloadContainer.style.position = 'fixed';
            reloadContainer.style.top = '0';
            reloadContainer.style.left = '0';
            reloadContainer.style.width = '100%';
            reloadContainer.style.height = '100%';
            reloadContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            reloadContainer.style.display = 'flex';
            reloadContainer.style.justifyContent = 'center';
            reloadContainer.style.alignItems = 'center';
            reloadContainer.style.zIndex = '9999';

            // Crear mensaje
            const reloadMessage = document.createElement('div');
            reloadMessage.style.backgroundColor = 'white';
            reloadMessage.style.borderRadius = '8px';
            reloadMessage.style.padding = '20px';
            reloadMessage.style.maxWidth = '400px';
            reloadMessage.style.textAlign = 'center';
            reloadMessage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

            // Icono
            const icon = document.createElement('div');
            icon.innerHTML = '<i class="fas fa-sync-alt" style="font-size: 48px; color: #4CAF50; animation: spin 2s linear infinite;"></i>';

            // Si no hay FontAwesome, usar un texto
            if (!document.querySelector('link[href*="font-awesome"]')) {
                icon.innerHTML = '↻'; // Símbolo de recarga
                icon.style.fontSize = '48px';
                icon.style.color = '#4CAF50';
                icon.style.animation = 'spin 2s linear infinite';
            }

            // Añadir animación
            const style = document.createElement('style');
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);

            // Título
            const title = document.createElement('h3');
            title.textContent = 'Nueva versión disponible';
            title.style.margin = '10px 0';
            title.style.color = '#333';

            // Mensaje
            const message = document.createElement('p');
            message.textContent = 'Se ha detectado una nueva versión del sitio. Actualizando automáticamente...';
            message.style.margin = '10px 0';
            message.style.color = '#666';

            // Añadir elementos al mensaje
            reloadMessage.appendChild(icon);
            reloadMessage.appendChild(title);
            reloadMessage.appendChild(message);

            // Añadir mensaje al contenedor
            reloadContainer.appendChild(reloadMessage);

            // Añadir contenedor al body
            document.body.appendChild(reloadContainer);
        }

        // Esperar un momento para que el usuario vea el mensaje
        setTimeout(() => {
            // Forzar recarga sin caché
            window.location.reload(true);
        }, 2000);
    },

    /**
     * Actualiza manualmente la versión (para administradores)
     */
    async updateVersion() {
        try {
            // Crear nueva versión
            const newVersion = {
                version: this.generateVersionString(),
                timestamp: Date.now()
            };

            // Guardar en localStorage para referencia
            localStorage.setItem('siteVersion', JSON.stringify(newVersion));

            console.log('Versión actualizada manualmente:', newVersion);
            return newVersion;
        } catch (error) {
            console.error('Error actualizando versión:', error);
            return null;
        }
    },

    /**
     * Genera un string de versión basado en la fecha actual
     */
    generateVersionString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');

        return `${year}.${month}.${day}-${hour}${minute}`;
    },

    /**
     * Limpia la caché y recarga la página (para usuarios)
     * @param {boolean} showSuccess - Si es true, muestra un mensaje de éxito antes de recargar
     * @param {boolean} fullClean - Si es true, realiza una limpieza completa incluyendo courseData
     */
    clearCache(showSuccess = false, fullClean = true) {
        console.log('%c[Control de Caché] Limpiando caché manualmente...', 'color: #2196F3; font-weight: bold');

        // Limpiar caché de localStorage
        this.clearLocalStorageCache(fullClean);

        // Resetear la preferencia de ocultar el banner
        localStorage.removeItem('hideCacheBanner');

        // Forzar carga desde el repositorio si DataPersistence está disponible
        if (typeof DataPersistence !== 'undefined') {
            console.log('Forzando carga de datos desde el repositorio...');

            // Intentar cargar datos desde el repositorio antes de recargar
            try {
                DataPersistence.init(true).then(() => {
                    console.log('Datos cargados correctamente desde el repositorio');

                    // Mostrar mensaje de éxito si se solicita
                    this._showSuccessAndReload(showSuccess);
                }).catch(error => {
                    console.error('Error cargando datos desde el repositorio:', error);
                    // Recargar de todos modos
                    this._showSuccessAndReload(showSuccess);
                });
            } catch (error) {
                console.error('Error iniciando carga de datos:', error);
                // Recargar de todos modos
                this._showSuccessAndReload(showSuccess);
            }
        } else {
            // Si DataPersistence no está disponible, simplemente recargar
            this._showSuccessAndReload(showSuccess);
        }
    },

    /**
     * Muestra un mensaje de éxito y recarga la página
     * @private
     * @param {boolean} showSuccess - Si es true, muestra un mensaje de éxito antes de recargar
     */
    _showSuccessAndReload(showSuccess) {
        if (showSuccess) {
            // Crear alerta de éxito
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed';
            successAlert.style.top = '20px';
            successAlert.style.left = '50%';
            successAlert.style.transform = 'translateX(-50%)';
            successAlert.style.zIndex = '9999';
            successAlert.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            successAlert.style.maxWidth = '500px';
            successAlert.style.width = '90%';

            successAlert.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <i class="fas fa-check-circle fa-lg"></i>
                    </div>
                    <div>
                        <strong>¡Caché limpiada correctamente!</strong>
                        <p class="mb-0">La página se recargará en unos segundos para mostrar la última versión.</p>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;

            // Añadir al body
            document.body.appendChild(successAlert);

            // Esperar un momento antes de recargar
            setTimeout(() => {
                window.location.reload(true);
            }, 2000);
        } else {
            // Recargar inmediatamente
            window.location.reload(true);
        }
    }
};

// Inicializar control de caché
document.addEventListener('DOMContentLoaded', () => {
    CacheControl.init();
});

// Exportar para uso global
window.CacheControl = CacheControl;
