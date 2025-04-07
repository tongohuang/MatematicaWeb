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

    // Rutas a los archivos JSON en el repositorio
    JSON_FILES: {
        courses: '/data/courses.json',
        topics: '/data/topics.json',
        settings: '/data/settings.json'
    },

    // Ruta al archivo JSON combinado (para compatibilidad)
    JSON_FILE_PATH: '/data/courseData.json',

    /**
     * Inicializa el sistema de persistencia
     * @param {boolean} forceRepoData - Si es true, fuerza la carga desde el repositorio
     */
    async init(forceRepoData = false) {
        console.log('Inicializando sistema de persistencia de datos...');

        try {
            // Determinar si estamos en producción (Netlify)
            const isProduction = window.location.hostname.includes('netlify.app');

            // En producción, siempre forzar la carga desde el repositorio
            const shouldForceRepoData = isProduction || forceRepoData;

            if (shouldForceRepoData) {
                console.log('Forzando carga de datos desde el repositorio...');
            }

            // Cargar datos desde localStorage y repositorio
            const data = await this.loadApplicationData(shouldForceRepoData);

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
     * @param {boolean} forceRepoData - Si es true, prioriza los datos del repositorio sobre los locales
     */
    async loadApplicationData(forceRepoData = false) {
        try {
            // Determinar si estamos en producción (Netlify)
            const isProduction = window.location.hostname.includes('netlify.app') ||
                               window.location.hostname.includes('netlify.com');

            // En producción o si se fuerza, siempre intentar cargar desde el repositorio primero
            const shouldPrioritizeRepo = isProduction || forceRepoData;

            // 1. Cargar datos del repositorio (producción)
            let repoData = {};
            let repoDataLoaded = false;
            try {
                console.log('Priorizar repositorio:', shouldPrioritizeRepo ? 'Sí' : 'No');

                // Usar cache: 'no-store' para evitar problemas de caché en producción
                const fetchOptions = { cache: 'no-store' };

                // Intentar cargar desde archivos separados primero
                console.log('Intentando cargar datos desde archivos separados...');
                try {
                    const coursesPromise = fetch(this.JSON_FILES.courses, fetchOptions);
                    const topicsPromise = fetch(this.JSON_FILES.topics, fetchOptions);

                    const [coursesResponse, topicsResponse] = await Promise.all([coursesPromise, topicsPromise]);

                    if (coursesResponse.ok && topicsResponse.ok) {
                        // Si ambos archivos existen, cargar desde ellos
                        const coursesData = await coursesResponse.json();
                        const topicsData = await topicsResponse.json();

                        repoData = {
                            courses: {},
                            topics: {},
                            sections: {}
                        };

                        // Convertir arrays a objetos indexados por ID
                        if (Array.isArray(coursesData)) {
                            coursesData.forEach(course => {
                                repoData.courses[course.id] = course;
                            });
                        } else {
                            repoData.courses = coursesData;
                        }

                        if (Array.isArray(topicsData)) {
                            topicsData.forEach(topic => {
                                repoData.topics[topic.id] = topic;
                            });
                        } else {
                            repoData.topics = topicsData;
                        }

                        repoDataLoaded = true;
                        console.log('Datos del repositorio cargados desde archivos separados');
                        console.log('Cursos en repositorio:', Object.keys(repoData.courses || {}).length);
                        console.log('Temas en repositorio:', Object.keys(repoData.topics || {}).length);
                    }
                } catch (error) {
                    console.warn('Error cargando datos desde archivos separados:', error);
                }

                // Si no se pudieron cargar los archivos separados, intentar con el archivo combinado
                console.log('Intentando cargar datos desde archivo combinado:', this.JSON_FILE_PATH);
                const repoResponse = await fetch(this.JSON_FILE_PATH, fetchOptions);

                if (repoResponse.ok) {
                    repoData = await repoResponse.json();
                    repoDataLoaded = true;
                    console.log('Datos del repositorio cargados desde archivo combinado');
                    console.log('Cursos en repositorio:', Object.keys(repoData.courses || {}).length);
                    console.log('Temas en repositorio:', Object.keys(repoData.topics || {}).length);

                    // Si estamos en producción (Netlify) o se fuerza la carga desde el repositorio,
                    // actualizar el localStorage con estos datos
                    if (shouldPrioritizeRepo) {
                        console.log('Actualizando localStorage con datos del repositorio');
                        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
                        const updatedData = {
                            persistent: repoData,
                            unsynced: currentData.unsynced || {}
                        };
                        localStorage.setItem('courseData', JSON.stringify(updatedData));
                    }
                } else {
                    console.warn('No se pudo cargar el archivo JSON del repositorio, status:', repoResponse.status);
                }
            } catch (error) {
                console.warn('Error cargando datos del repositorio:', error);
            }

            // 2. Cargar datos locales
            const localData = JSON.parse(localStorage.getItem('courseData') || '{}');
            console.log('Datos locales cargados');
            console.log('Cursos en localStorage:', Object.keys(localData.persistent?.courses || {}).length);
            console.log('Temas en localStorage:', Object.keys(localData.persistent?.topics || {}).length);

            // 3. Combinación inteligente
            let merged;

            // En producción o si se fuerza, priorizar datos del repositorio
            const shouldUseRepoData = shouldPrioritizeRepo && repoDataLoaded;

            if (shouldUseRepoData) {
                merged = {
                    persistent: repoData,
                    unsynced: localData.unsynced || {}
                };
                console.log('Usando datos del repositorio como fuente principal');

                // Verificar si hay secciones de tipo HTML o Activity y registrarlas
                this._checkSpecialSectionTypes(repoData);
            } else {
                // En desarrollo, combinar dando prioridad a los datos locales
                merged = {
                    persistent: {
                        courses: { ...(repoData.courses || {}), ...(localData.persistent?.courses || {}) },
                        topics: { ...(repoData.topics || {}), ...(localData.persistent?.topics || {}) },
                        sections: { ...(repoData.sections || {}), ...(localData.persistent?.sections || {}) }
                    },
                    unsynced: localData.unsynced || {}
                };
                console.log('Combinando datos locales y del repositorio');

                // Verificar si hay secciones de tipo HTML o Activity y registrarlas
                this._checkSpecialSectionTypes(merged.persistent);
            }

            // Guardar la combinación en localStorage para uso futuro
            localStorage.setItem('courseData', JSON.stringify(merged));

            // Registrar el resultado final
            console.log('Datos finales combinados:');
            console.log('Cursos:', Object.keys(merged.persistent.courses || {}).length);
            console.log('Temas:', Object.keys(merged.persistent.topics || {}).length);
            console.log('Cambios no sincronizados:', Object.keys(merged.unsynced || {}).length);

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
     * @param {boolean} silent - Si es true, no muestra alertas durante la sincronización
     */
    saveData(type, id, content, syncImmediately = false, silent = false) {
        console.log(`Guardando ${type} con ID ${id}`, content);

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
            this.synchronizeData(silent);
        }

        // Ya no mostramos sugerencias automáticas de sincronización
        // Solo se sincronizará cuando el usuario lo solicite explícitamente
        // a través del panel de administración

        return content;
    },

    /**
     * Verifica si hay secciones de tipo HTML o Activity y registra información sobre ellas
     * @private
     * @param {Object} data - Datos a verificar
     */
    _checkSpecialSectionTypes(data) {
        if (!data || !data.topics) return;

        console.log('Verificando secciones especiales (HTML y Activity)...');

        // Recopilar todas las secciones de tipo HTML y Activity
        const htmlSections = [];
        const activitySections = [];

        // Recorrer todos los temas
        Object.values(data.topics).forEach(topic => {
            if (!topic.sections || !Array.isArray(topic.sections)) return;

            // Buscar secciones de tipo HTML y Activity
            topic.sections.forEach(section => {
                if (section.type === 'html') {
                    htmlSections.push({
                        id: section.id,
                        title: section.title,
                        content: section.content,
                        topicId: topic.id,
                        topicTitle: topic.title
                    });
                } else if (section.type === 'activity') {
                    activitySections.push({
                        id: section.id,
                        title: section.title,
                        content: section.content,
                        topicId: topic.id,
                        topicTitle: topic.title
                    });
                }
            });
        });

        // Registrar información sobre las secciones especiales
        if (htmlSections.length > 0) {
            console.log(`Encontradas ${htmlSections.length} secciones de tipo HTML:`);
            htmlSections.forEach(section => {
                console.log(`- ${section.title} (ID: ${section.id}, Archivo: ${section.content})`);
                // Verificar si el archivo existe
                this._checkFileExists(`activities/html/${section.content}`, 'HTML', section.id, section.title);
            });
        } else {
            console.log('No se encontraron secciones de tipo HTML');
        }

        if (activitySections.length > 0) {
            console.log(`Encontradas ${activitySections.length} secciones de tipo Activity:`);
            activitySections.forEach(section => {
                console.log(`- ${section.title} (ID: ${section.id}, Archivo: ${section.content})`);
                // Verificar si el archivo existe
                this._checkFileExists(`activities/templates/${section.content}`, 'Activity', section.id, section.title);
            });
        } else {
            console.log('No se encontraron secciones de tipo Activity');
        }
    },

    /**
     * Verifica si un archivo existe
     * @private
     * @param {string} path - Ruta del archivo
     * @param {string} type - Tipo de sección
     * @param {number} id - ID de la sección
     * @param {string} title - Título de la sección
     */
    async _checkFileExists(path, type, id, title) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            if (response.ok) {
                console.log(`✅ Archivo ${path} encontrado para la sección ${type} "${title}" (ID: ${id})`);
            } else {
                console.warn(`⚠️ Archivo ${path} NO ENCONTRADO para la sección ${type} "${title}" (ID: ${id})`);
                // Usar archivo de ejemplo como fallback
                if (type === 'HTML') {
                    console.log(`   Usando ejemplo-simple.html como fallback para la sección HTML "${title}"`);
                } else if (type === 'Activity') {
                    console.log(`   Usando ejemplo-simple.html como fallback para la sección Activity "${title}"`);
                }
            }
        } catch (error) {
            console.error(`Error verificando archivo ${path}:`, error);
        }
    },

    /**
     * Descarga un archivo JSON
     * @private
     * @param {string} jsonData - Datos JSON a descargar
     * @param {string} filename - Nombre del archivo
     * @param {string} dataType - Tipo de datos para el atributo data-download-type
     */
    _downloadJsonFile(jsonData, filename, dataType) {
        try {
            // Crear un blob y descargar
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.setAttribute('data-download-type', dataType);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`Archivo ${filename} generado correctamente`);
            return true;
        } catch (error) {
            console.error(`Error generando archivo ${filename}:`, error);
            return false;
        }
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
     * @param {boolean} silent - Si es true, no muestra alertas
     */
    synchronizeData(silent = false) {
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');

        if (!currentData.persistent) {
            console.error('No hay datos persistentes para sincronizar');
            // Solo mostramos alertas en el panel de administración
            if (!silent && window.location.pathname.includes('/admin/')) {
                alert('No hay datos para sincronizar con el repositorio.');
            }
            return false;
        }

        // 1. Generar JSON solo con datos persistentes
        const result = this.generateRepoJSON(currentData.persistent, silent);

        if (result) {
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
        }

        return false;
    },

    /**
     * Genera los archivos JSON para el repositorio
     * @param {object} data - Datos a guardar en los JSON
     * @param {boolean} silent - Si es true, no muestra alertas
     */
    generateRepoJSON(data, silent = false) {
        try {
            // Validar que los datos no estén vacíos
            if (!data || Object.keys(data).length === 0) {
                console.error('No hay datos para generar los JSON');
                if (!silent) {
                    alert('No hay datos para generar los archivos JSON.');
                }
                return false;
            }

            // 1. Generar archivo combinado (para compatibilidad)
            const combinedJsonData = JSON.stringify(data, null, 2);
            this._downloadJsonFile(combinedJsonData, 'courseData.json', 'repository-data');

            // 2. Generar archivos separados

            // Cursos
            if (data.courses && Object.keys(data.courses).length > 0) {
                // Convertir objeto a array
                const coursesArray = Object.values(data.courses);
                const coursesJsonData = JSON.stringify(coursesArray, null, 2);
                this._downloadJsonFile(coursesJsonData, 'courses.json', 'courses-data');
            }

            // Temas
            if (data.topics && Object.keys(data.topics).length > 0) {
                // Convertir objeto a array
                const topicsArray = Object.values(data.topics);
                const topicsJsonData = JSON.stringify(topicsArray, null, 2);
                this._downloadJsonFile(topicsJsonData, 'topics.json', 'topics-data');
            }

            // Configuración (si existe)
            if (data.settings) {
                const settingsJsonData = JSON.stringify(data.settings, null, 2);
                this._downloadJsonFile(settingsJsonData, 'settings.json', 'settings-data');
            }

            // Solo mostramos la alerta si se solicita explícitamente y no estamos en modo silencioso
            if (!silent && window.location.pathname.includes('/admin/')) {
                alert('Se han generado los archivos JSON para el repositorio. Por favor, guárdelos en las carpetas correspondientes del proyecto:\n\n- courseData.json en /data/\n- courses.json en /data/\n- topics.json en /data/\n\nY haga commit de los cambios.');
            }

            // Guardar una copia en localStorage para referencia
            localStorage.setItem('lastGeneratedJSON', combinedJsonData);
            localStorage.setItem('lastJSONGenerationTime', new Date().toISOString());

            return true;
        } catch (error) {
            console.error('Error generando JSON:', error);
            // Solo mostramos alertas en el panel de administración
            if (!silent && window.location.pathname.includes('/admin/')) {
                alert('Error generando el archivo JSON. Consulte la consola para más detalles.');
            }
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
    },

    /**
     * Fuerza la carga de datos desde el repositorio
     * @returns {Promise<boolean>} - True si se cargaron los datos correctamente
     */
    async forceLoadFromRepository() {
        try {
            console.log('Forzando carga de datos desde el repositorio...');

            // Crear copia de seguridad antes de sobreescribir
            this.createDataBackup();

            // Cargar datos desde el repositorio con prioridad
            const data = await this.loadApplicationData(true);

            if (!data || !data.persistent) {
                console.error('No se pudieron cargar datos desde el repositorio');
                return false;
            }

            console.log('Datos cargados correctamente desde el repositorio');
            return true;
        } catch (error) {
            console.error('Error forzando carga desde repositorio:', error);
            return false;
        }
    }
};

// Exportar el módulo
window.DataPersistence = DataPersistence;
