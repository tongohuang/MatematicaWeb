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
     */
    clearLocalStorageCache() {
        // Limpiar solo las claves relacionadas con la caché
        const cacheKeys = [
            'jsonData_courseData',
            'jsonData_courses',
            'jsonData_topics',
            'jsonData_settings',
            'jsonData_activities',
            'lastGeneratedJSON',
            'lastJSONGenerationTime'
        ];

        cacheKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`Caché eliminada: ${key}`);
            }
        });
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
    }
};

// Inicializar control de caché
document.addEventListener('DOMContentLoaded', () => {
    CacheControl.init();
});

// Exportar para uso global
window.CacheControl = CacheControl;
