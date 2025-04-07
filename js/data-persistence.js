/**
 * Sistema de Persistencia de Datos sin Pérdidas
 * 
 * Este módulo implementa un sistema que mantiene permanentemente los datos
 * tanto en localStorage como en el JSON del repositorio, sin reiniciar ninguno
 * de los dos, con un mecanismo de sincronización manual controlada.
 */

const DataPersistence = {
    // Estructura de datos
    dataStructure: {
        // Datos persistentes (nunca se borran)
        persistent: {
            courses: {},
            topics: {},
            sections: {}
        },
        // Cambios locales no sincronizados
        unsynced: {}
    },

    // Ruta al archivo JSON en el repositorio
    JSON_FILE_PATH: '/data/courseData.json',

    /**
     * Inicializa el sistema de persistencia
     */
    async init() {
        console.log('Inicializando sistema de persistencia de datos...');
        
        try {
            // Cargar datos desde localStorage y repositorio
            const data = await this.loadApplicationData();
            
            // Verificar si hay datos en localStorage
            if (!data || !data.persistent) {
                console.log('No se encontraron datos persistentes, inicializando estructura vacía');
                localStorage.setItem('courseData', JSON.stringify(this.dataStructure));
            }
            
            return data;
        } catch (error) {
            console.error('Error inicializando sistema de persistencia:', error);
            return this.dataStructure;
        }
    },

    /**
     * Carga los datos de la aplicación combinando localStorage y repositorio
     */
    async loadApplicationData() {
        try {
            // 1. Cargar datos del repositorio (producción)
            let repoData = {};
            try {
                const repoResponse = await fetch(this.JSON_FILE_PATH);
                if (repoResponse.ok) {
                    repoData = await repoResponse.json();
                } else {
                    console.warn('No se pudo cargar el archivo JSON del repositorio');
                }
            } catch (error) {
                console.warn('Error cargando datos del repositorio:', error);
            }
            
            // 2. Cargar datos locales
            const localData = JSON.parse(localStorage.getItem('courseData') || '{}');
            
            // 3. Combinación inteligente (nunca sobrescribir persistentes)
            const merged = {
                persistent: { 
                    courses: { ...(repoData.courses || {}), ...(localData.persistent?.courses || {}) },
                    topics: { ...(repoData.topics || {}), ...(localData.persistent?.topics || {}) },
                    sections: { ...(repoData.sections || {}), ...(localData.persistent?.sections || {}) }
                },
                unsynced: localData.unsynced || {}
            };
            
            return merged;
        } catch (error) {
            console.warn('Error cargando datos:', error);
            return JSON.parse(localStorage.getItem('courseData')) || this.dataStructure;
        }
    },

    /**
     * Guarda datos en el sistema de persistencia
     * @param {string} type - Tipo de dato (courses, topics, sections)
     * @param {string|number} id - Identificador único del elemento
     * @param {object} content - Contenido a guardar
     * @param {boolean} syncImmediately - Si es true, sincroniza inmediatamente con el JSON
     */
    saveData(type, id, content, syncImmediately = false) {
        // 1. Guardar en persistente
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
        
        if (!currentData.persistent) {
            currentData.persistent = this.dataStructure.persistent;
        }
        
        if (!currentData.persistent[type]) {
            currentData.persistent[type] = {};
        }
        
        currentData.persistent[type][id] = content;
        
        // 2. Marcar como no sincronizado si es necesario
        if (!syncImmediately) {
            if (!currentData.unsynced) currentData.unsynced = {};
            currentData.unsynced[`${type}_${id}`] = Date.now();
        }
        
        // 3. Guardar en localStorage
        localStorage.setItem('courseData', JSON.stringify(currentData));
        
        // 4. Si es sincronización inmediata, generar JSON
        if (syncImmediately) {
            this.generateRepoJSON(currentData.persistent);
        }
        
        return content;
    },

    /**
     * Obtiene datos del sistema de persistencia
     * @param {string} type - Tipo de dato (courses, topics, sections)
     * @param {string|number} id - Identificador único del elemento (opcional)
     */
    getData(type, id = null) {
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
        
        if (!currentData.persistent || !currentData.persistent[type]) {
            return id ? null : {};
        }
        
        if (id !== null) {
            return currentData.persistent[type][id] || null;
        }
        
        return currentData.persistent[type] || {};
    },

    /**
     * Obtiene todos los datos de un tipo como array
     * @param {string} type - Tipo de dato (courses, topics, sections)
     */
    getAllDataAsArray(type) {
        const data = this.getData(type);
        return Object.values(data);
    },

    /**
     * Elimina datos del sistema de persistencia
     * @param {string} type - Tipo de dato (courses, topics, sections)
     * @param {string|number} id - Identificador único del elemento
     * @param {boolean} syncImmediately - Si es true, sincroniza inmediatamente con el JSON
     */
    deleteData(type, id, syncImmediately = false) {
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
        
        if (!currentData.persistent || !currentData.persistent[type]) {
            return false;
        }
        
        // Eliminar el dato
        if (currentData.persistent[type][id]) {
            delete currentData.persistent[type][id];
            
            // Marcar como no sincronizado
            if (!syncImmediately) {
                if (!currentData.unsynced) currentData.unsynced = {};
                currentData.unsynced[`${type}_${id}_deleted`] = Date.now();
            }
            
            // Guardar en localStorage
            localStorage.setItem('courseData', JSON.stringify(currentData));
            
            // Si es sincronización inmediata, generar JSON
            if (syncImmediately) {
                this.generateRepoJSON(currentData.persistent);
            }
            
            return true;
        }
        
        return false;
    },

    /**
     * Sincroniza los datos con el repositorio
     */
    synchronizeData() {
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
        
        // 1. Generar JSON solo con datos persistentes
        this.generateRepoJSON(currentData.persistent);
        
        // 2. Limpiar solo el registro de no sincronizados
        currentData.unsynced = {};
        localStorage.setItem('courseData', JSON.stringify(currentData));
        
        // Registrar en el log
        if (typeof Logger !== 'undefined') {
            Logger.info('Datos sincronizados con el repositorio');
        } else {
            console.log('Datos sincronizados con el repositorio');
        }
        
        return true;
    },

    /**
     * Genera el archivo JSON para el repositorio
     * @param {object} data - Datos a guardar en el JSON
     */
    generateRepoJSON(data) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            
            // Crear un blob y descargar
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'courseData.json';
            a.setAttribute('data-download-type', 'repository-data');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Se ha generado el archivo JSON para el repositorio. Por favor, guárdelo en la carpeta "data" del proyecto.');
            
            return true;
        } catch (error) {
            console.error('Error generando JSON:', error);
            alert('Error generando el archivo JSON. Consulte la consola para más detalles.');
            return false;
        }
    },

    /**
     * Valida la integridad de los datos
     * @param {object} data - Datos a validar
     */
    validateDataIntegrity(data) {
        // Implementar reglas de validación específicas
        if (!data || typeof data !== 'object') {
            return this.dataStructure;
        }
        
        if (!data.persistent || typeof data.persistent !== 'object') {
            data.persistent = this.dataStructure.persistent;
        }
        
        if (!data.unsynced || typeof data.unsynced !== 'object') {
            data.unsynced = {};
        }
        
        // Asegurar que existan todas las categorías necesarias
        ['courses', 'topics', 'sections'].forEach(category => {
            if (!data.persistent[category] || typeof data.persistent[category] !== 'object') {
                data.persistent[category] = {};
            }
        });
        
        return data;
    },

    /**
     * Crea una copia de seguridad de los datos
     */
    createDataBackup() {
        const data = localStorage.getItem('courseData');
        if (data) {
            localStorage.setItem('courseData_backup_' + Date.now(), data);
            
            // Registrar en el log
            if (typeof Logger !== 'undefined') {
                Logger.info('Copia de seguridad creada');
            } else {
                console.log('Copia de seguridad creada');
            }
            
            return true;
        }
        return false;
    },

    /**
     * Restaura una copia de seguridad
     * @param {string} backupKey - Clave de la copia de seguridad en localStorage
     */
    restoreBackup(backupKey) {
        const backupData = localStorage.getItem(backupKey);
        
        if (backupData) {
            // Crear una copia de seguridad del estado actual antes de restaurar
            this.createDataBackup();
            
            // Restaurar la copia de seguridad
            localStorage.setItem('courseData', backupData);
            
            // Registrar en el log
            if (typeof Logger !== 'undefined') {
                Logger.info('Copia de seguridad restaurada', { backupKey });
            } else {
                console.log('Copia de seguridad restaurada:', { backupKey });
            }
            
            return true;
        }
        
        return false;
    },

    /**
     * Obtiene la lista de copias de seguridad disponibles
     */
    getBackupsList() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key && key.startsWith('courseData_backup_')) {
                const timestamp = key.replace('courseData_backup_', '');
                const date = new Date(parseInt(timestamp));
                
                backups.push({
                    key,
                    date: date.toLocaleString(),
                    timestamp: parseInt(timestamp)
                });
            }
        }
        
        // Ordenar por fecha (más reciente primero)
        return backups.sort((a, b) => b.timestamp - a.timestamp);
    },

    /**
     * Obtiene el estado de sincronización
     */
    getSyncStatus() {
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
        
        if (!currentData.unsynced) {
            return {
                synced: true,
                pendingChanges: 0,
                lastChange: null
            };
        }
        
        const pendingChanges = Object.keys(currentData.unsynced).length;
        
        if (pendingChanges === 0) {
            return {
                synced: true,
                pendingChanges: 0,
                lastChange: null
            };
        }
        
        // Encontrar el cambio más reciente
        const timestamps = Object.values(currentData.unsynced);
        const lastChange = new Date(Math.max(...timestamps));
        
        return {
            synced: false,
            pendingChanges,
            lastChange
        };
    }
};

// Exportar el módulo
window.DataPersistence = DataPersistence;
