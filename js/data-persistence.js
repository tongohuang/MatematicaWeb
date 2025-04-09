/**
 * Sistema de Persistencia de Datos sin Pérdidas
 *
 * Este módulo implementa un sistema que mantiene permanentemente los datos
 * tanto en localStorage como en el JSON del repositorio, sin reiniciar ninguno
 * de los dos, con un mecanismo de sincronización manual controlada.
 *
 * ¡IMPORTANTE! - ESTRUCTURA DE DATOS MATEMÁTICA WEB
 * -----------------------------------------------
 * - localStorage es la fuente principal para almacenamiento y recuperación de datos
 * - Los archivos JSON son solo para exportar datos al repositorio
 * - Cualquier modificación debe mantener esta estructura para garantizar la persistencia
 * - Ver docs/ESTRUCTURA_DE_DATOS.md para más información detallada
 */

const DataPersistence = {
    // Estructura de datos
    dataStructure: {
        // Datos persistentes (nunca se borran)
        persistent: {
            courses: {},
            topics: {},
            sections: {},
            activities: {} // Agregado para almacenar actividades
        },
        // Cambios locales no sincronizados
        unsynced: {}
    },

    // Rutas a los archivos JSON en el repositorio
    JSON_FILES: {
        courses: '/data/courses.json',
        topics: '/data/topics.json',
        settings: '/data/settings.json',
        activities: '/data/activities.json'
    },

    // Ruta al archivo JSON combinado (para compatibilidad)
    JSON_FILE_PATH: '/data/courseData.json',

    /**
     * Inicializa el sistema de persistencia
     * @param {boolean} forceRepoData - Si es true, fuerza la carga desde el repositorio
     */
    async init(forceRepoData = false) {
        // Verificar y recuperar actividades perdidas
        this._recoverLostActivities();

        console.log('Inicializando sistema de persistencia de datos...');

        try {
            // Determinar si estamos en producción (Netlify)
            const isProduction = window.location.hostname.includes('netlify.app') ||
                               window.location.hostname.includes('netlify.com') ||
                               window.location.hostname !== 'localhost';

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

            console.log('Entorno de producción (Netlify):', isProduction ? 'Sí' : 'No');

            // Variables para almacenar datos del repositorio
            let repoData = {};
            let repoDataLoaded = false;

            // NUEVA ESTRUCTURA: En producción, cargar datos desde el repositorio
            // En desarrollo, usar exclusivamente localStorage
            if (isProduction || forceRepoData) {
                try {
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
                    if (!repoDataLoaded) {
                        console.log('Intentando cargar datos desde archivo combinado:', this.JSON_FILE_PATH);
                        const repoResponse = await fetch(this.JSON_FILE_PATH, fetchOptions);

                        if (repoResponse.ok) {
                            repoData = await repoResponse.json();
                            repoDataLoaded = true;
                            console.log('Datos del repositorio cargados desde archivo combinado');
                            console.log('Cursos en repositorio:', Object.keys(repoData.courses || {}).length);
                            console.log('Temas en repositorio:', Object.keys(repoData.topics || {}).length);
                        } else {
                            console.warn('No se pudo cargar el archivo JSON del repositorio, status:', repoResponse.status);
                        }
                    }
                } catch (error) {
                    console.warn('Error cargando datos del repositorio:', error);
                }
            } else {
                console.log('Modo desarrollo: Usando exclusivamente datos del localStorage');
            }

            // 2. Cargar datos locales
            const localData = JSON.parse(localStorage.getItem('courseData') || '{}');
            console.log('Datos locales cargados');
            console.log('Cursos en localStorage:', Object.keys(localData.persistent?.courses || {}).length);
            console.log('Temas en localStorage:', Object.keys(localData.persistent?.topics || {}).length);

            // 3. Combinación inteligente
            let merged;

            // En producción o si se fuerza, priorizar datos del repositorio
            const shouldUseRepoData = (isProduction || forceRepoData) && repoDataLoaded;

            if (shouldUseRepoData) {
                merged = {
                    persistent: repoData,
                    unsynced: localData.unsynced || {}
                };
                console.log('Usando datos del repositorio como fuente principal');

                // Actualizar localStorage con los datos del repositorio
                localStorage.setItem('courseData', JSON.stringify(merged));
                console.log('localStorage actualizado con datos del repositorio');

                // Verificar si hay secciones de tipo HTML o Activity y registrarlas
                this._checkSpecialSectionTypes(repoData);
            } else {
                // En desarrollo, usar EXCLUSIVAMENTE datos locales
                merged = localData;
                if (!merged.persistent) {
                    merged.persistent = { courses: {}, topics: {}, sections: {} };
                }
                console.log('Usando EXCLUSIVAMENTE datos locales como fuente principal');

                // Verificar si hay secciones de tipo HTML o Activity y registrarlas
                this._checkSpecialSectionTypes(merged.persistent);
            }

            // Registrar el resultado final
            console.log('Datos finales combinados:');
            console.log('Cursos:', Object.keys(merged.persistent.courses || {}).length);
            console.log('Temas:', Object.keys(merged.persistent.topics || {}).length);
            console.log('Cambios no sincronizados:', Object.keys(merged.unsynced || {}).length);

            // Devolver los datos combinados
            return merged;
        } catch (error) {
            console.warn('Error cargando datos:', error);
            return JSON.parse(localStorage.getItem('courseData')) || this.dataStructure;
        }
    },

    /**
     * Guarda datos en el sistema de persistencia
     * @param {string} type - Tipo de dato (courses, topics, sections, activities)
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
            console.log(`Datos marcados como no sincronizados: ${type}_${id}`);
        }

        // 3. Guardar en localStorage
        localStorage.setItem('courseData', JSON.stringify(currentData));
        console.log(`Datos guardados en localStorage correctamente`);

        // 4. Si es sincronización inmediata, generar JSON
        if (syncImmediately) {
            console.log('Sincronización inmediata solicitada, generando JSON...');
            this.synchronizeData(silent);
        }

        // 5. Guardar también en el sistema antiguo para compatibilidad
        try {
            this._saveToOldSystem(type, id, content);

            // Si es una actividad, guardarla también en el registro de actividades
            if (type === 'activities') {
                this._updateActivityRegistry(id, content);
            }
        } catch (error) {
            console.warn('Error al guardar en el sistema antiguo:', error);
        }

        return content;
    },

    /**
     * Guarda datos en el sistema antiguo para compatibilidad
     * @private
     * @param {string} type - Tipo de dato (courses, topics, sections)
     * @param {string|number} id - Identificador único del elemento
     * @param {object} content - Contenido a guardar
     */
    _saveToOldSystem(type, id, content) {
        // Solo manejar courses y topics en el sistema antiguo
        if (type !== 'courses' && type !== 'topics') return;

        const key = type === 'courses' ? 'matematicaweb_courses' : 'matematicaweb_topics';
        const oldData = JSON.parse(localStorage.getItem(key) || '[]');

        // Buscar si ya existe el elemento
        const index = oldData.findIndex(item => item.id == id);

        if (index !== -1) {
            // Actualizar
            oldData[index] = content;
        } else {
            // Agregar
            oldData.push(content);
        }

        // Guardar
        localStorage.setItem(key, JSON.stringify(oldData));
        console.log(`Datos guardados también en el sistema antiguo (${key})`);
    },

    /**
     * Actualiza el registro de actividades
     * @private
     * @param {string} id - ID de la actividad
     * @param {object} content - Contenido de la actividad
     */
    _updateActivityRegistry(id, content) {
        try {
            // Obtener el registro actual
            let registry = JSON.parse(localStorage.getItem('activity_registry') || '[]');

            // Verificar si la actividad ya está en el registro
            const index = registry.findIndex(entry => entry.id === id);

            // Crear entrada para el registro
            const registryEntry = {
                id: id,
                title: content.title || 'Actividad sin título',
                type: content.type || 'unknown',
                updated: Date.now()
            };

            if (index !== -1) {
                // Actualizar entrada existente
                registry[index] = {
                    ...registry[index],
                    ...registryEntry
                };
            } else {
                // Agregar nueva entrada
                registryEntry.created = Date.now();
                registry.push(registryEntry);
            }

            // Guardar el registro actualizado
            localStorage.setItem('activity_registry', JSON.stringify(registry));
            console.log(`Registro de actividades actualizado para ${id}`);
        } catch (error) {
            console.warn('Error al actualizar el registro de actividades:', error);
        }
    },

    /**
     * Recupera actividades perdidas de localStorage
     * @private
     */
    _recoverLostActivities() {
        try {
            console.log('Verificando actividades perdidas...');

            // Obtener datos actuales
            const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
            if (!currentData.persistent) {
                currentData.persistent = this.dataStructure.persistent;
            }
            if (!currentData.persistent.activities) {
                currentData.persistent.activities = {};
            }

            // Buscar claves de actividades en localStorage
            const activityKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('activity_') || key.match(/^\d+$/))) {
                    activityKeys.push(key);
                }
            }

            console.log(`Encontradas ${activityKeys.length} posibles claves de actividades`);

            // Procesar cada clave
            let recoveredCount = 0;
            activityKeys.forEach(key => {
                try {
                    const data = localStorage.getItem(key);
                    if (!data) return;

                    const activity = JSON.parse(data);
                    if (!activity || typeof activity !== 'object') return;

                    // Verificar si parece una actividad válida
                    if (activity.title && (activity.questions || activity.type)) {
                        // Extraer ID de la clave
                        const activityId = key.replace('activity_data_', '');

                        // Verificar si ya existe en el sistema de persistencia
                        if (!currentData.persistent.activities[activityId]) {
                            console.log(`Recuperando actividad perdida: ${activityId}`);
                            currentData.persistent.activities[activityId] = activity;
                            recoveredCount++;
                        }
                    }
                } catch (parseError) {
                    console.warn(`Error al procesar clave ${key}:`, parseError);
                }
            });

            if (recoveredCount > 0) {
                console.log(`Recuperadas ${recoveredCount} actividades perdidas`);
                localStorage.setItem('courseData', JSON.stringify(currentData));
            } else {
                console.log('No se encontraron actividades perdidas para recuperar');
            }
        } catch (error) {
            console.warn('Error al recuperar actividades perdidas:', error);
        }
    },

    /**
     * Verifica si hay secciones de tipo HTML o Activity y registra información sobre ellas
     * @private
     * @param {Object} data - Datos a verificar
     */
    _checkSpecialSectionTypes(data) {
        // Ejecutar en un setTimeout para no bloquear la carga principal
        setTimeout(() => {
            try {
                this._checkSpecialSectionTypesAsync(data);
            } catch (error) {
                console.error('Error al verificar secciones especiales:', error);
            }
        }, 500);
    },

    /**
     * Implementación asíncrona de la verificación de secciones especiales
     * @private
     * @param {Object} data - Datos a verificar
     */
    async _checkSpecialSectionTypesAsync(data) {
        if (!data || !data.topics) return;

        console.log('Verificando secciones especiales (HTML y Activity)...');

        // Verificar si existe la estructura para actividades
        if (!data.persistent) {
            data.persistent = this.dataStructure.persistent;
        }

        if (!data.persistent.activities) {
            data.persistent.activities = {};
        }

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
            // Usar Promise.all para verificar todos los archivos en paralelo
            await Promise.all(htmlSections.map(async (section) => {
                console.log(`- ${section.title} (ID: ${section.id}, Archivo: ${section.content})`);
                // Verificar si el archivo existe
                await this._checkFileExists(`activities/html/${section.content}`, 'HTML', section.id, section.title);
            }));
        } else {
            console.log('No se encontraron secciones de tipo HTML');
        }

        if (activitySections.length > 0) {
            console.log(`Encontradas ${activitySections.length} secciones de tipo Activity:`);
            // Usar Promise.all para verificar todos los archivos en paralelo
            await Promise.all(activitySections.map(async (section) => {
                console.log(`- ${section.title} (ID: ${section.id}, Archivo: ${section.content})`);
                // Verificar si el archivo existe
                await this._checkFileExists(`activities/templates/${section.content}`, 'Activity', section.id, section.title);
            }));
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
            // Corregir la ruta según la ubicación actual
            let correctedPath = path;
            const currentPath = window.location.pathname;

            // Determinar cuántos niveles necesitamos subir
            let levelsUp = 0;

            if (currentPath.includes('/admin/')) {
                levelsUp = 1; // admin está un nivel por debajo de la raíz
            } else if (currentPath.includes('/topics/')) {
                levelsUp = 1; // topics está un nivel por debajo de la raíz
            } else if (currentPath.includes('/sections/')) {
                levelsUp = 1; // sections está un nivel por debajo de la raíz
            } else if (currentPath.includes('/courses/')) {
                levelsUp = 1; // courses está un nivel por debajo de la raíz
            } else if (currentPath.includes('/activities/')) {
                levelsUp = 1; // activities está un nivel por debajo de la raíz
            }

            // Aplicar la corrección si es necesario
            if (levelsUp > 0) {
                // Añadir '../' por cada nivel que necesitamos subir
                correctedPath = '../'.repeat(levelsUp) + path;
                console.log(`Corrigiendo ruta para ${currentPath}: ${path} -> ${correctedPath}`);
            }

            // Intentar verificar si el archivo existe
            try {
                const response = await fetch(correctedPath, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`✅ Archivo ${correctedPath} encontrado para la sección ${type} "${title}" (ID: ${id})`);
                    return true;
                } else {
                    console.warn(`⚠️ Archivo ${correctedPath} NO ENCONTRADO para la sección ${type} "${title}" (ID: ${id})`);
                }
            } catch (fetchError) {
                console.warn(`Error al verificar archivo ${correctedPath}:`, fetchError);
            }

            // Si llegamos aquí, el archivo no existe o hubo un error
            // Usar archivo de ejemplo como fallback
            if (type === 'HTML') {
                console.log(`   Usando ejemplo-simple.html como fallback para la sección HTML "${title}"`);
            } else if (type === 'Activity') {
                console.log(`   Usando ejemplo-simple.html como fallback para la sección Activity "${title}"`);
            }
            return false;
        } catch (error) {
            console.error(`Error general verificando archivo ${path}:`, error);
            return false;
        }
    },

    /**
     * Descarga un archivo JSON
     * @param {string} jsonData - Datos JSON a descargar
     * @param {string} filename - Nombre del archivo
     * @param {string} dataType - Tipo de datos para el atributo data-download-type
     */
    downloadJsonFile(jsonData, filename, dataType) {
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
     * @param {boolean} silent - Si es true, no muestra alertas durante la sincronización
     */
    deleteData(type, id, syncImmediately = false, silent = false) {
        console.log(`Eliminando ${type} con ID ${id}...`);
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');

        if (!currentData.persistent || !currentData.persistent[type]) {
            console.warn(`No hay datos de tipo ${type} para eliminar`);
            return false;
        }

        // Eliminar el dato
        if (currentData.persistent[type][id]) {
            delete currentData.persistent[type][id];
            console.log(`Dato eliminado del sistema de persistencia: ${type} con ID ${id}`);

            // Marcar como no sincronizado
            if (!syncImmediately) {
                if (!currentData.unsynced) currentData.unsynced = {};
                currentData.unsynced[`${type}_${id}_deleted`] = Date.now();
                console.log(`Eliminación marcada como no sincronizada: ${type}_${id}_deleted`);
            }

            // Guardar en localStorage
            localStorage.setItem('courseData', JSON.stringify(currentData));
            console.log(`Cambios guardados en localStorage`);

            // Si es sincronización inmediata, generar JSON
            if (syncImmediately) {
                console.log('Sincronización inmediata solicitada, generando JSON...');
                this.synchronizeData(silent);
            }

            // Eliminar también del sistema antiguo para compatibilidad
            try {
                this._deleteFromOldSystem(type, id);
            } catch (error) {
                console.warn('Error al eliminar del sistema antiguo:', error);
            }

            return true;
        }

        console.warn(`No se encontró el dato ${type} con ID ${id} para eliminar`);
        return false;
    },

    /**
     * Elimina datos del sistema antiguo para compatibilidad
     * @private
     * @param {string} type - Tipo de dato (courses, topics, sections)
     * @param {string|number} id - Identificador único del elemento
     */
    _deleteFromOldSystem(type, id) {
        // Solo manejar courses y topics en el sistema antiguo
        if (type !== 'courses' && type !== 'topics') return;

        const key = type === 'courses' ? 'matematicaweb_courses' : 'matematicaweb_topics';
        const oldData = JSON.parse(localStorage.getItem(key) || '[]');

        // Filtrar para eliminar el elemento
        const newData = oldData.filter(item => item.id != id);

        if (newData.length < oldData.length) {
            // Guardar
            localStorage.setItem(key, JSON.stringify(newData));
            console.log(`Dato eliminado también del sistema antiguo (${key})`);
        } else {
            console.warn(`No se encontró el dato con ID ${id} en el sistema antiguo (${key})`);
        }
    },

    /**
     * Sincroniza los datos con el repositorio
     * @param {boolean} silent - Si es true, no muestra alertas
     * @param {boolean} download - Si es true, descarga los archivos JSON
     */
    synchronizeData(silent = false, download = false) {
        console.log(`Sincronizando datos con el repositorio (silent: ${silent}, download: ${download})...`);
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');

        if (!currentData.persistent) {
            console.error('No hay datos persistentes para sincronizar');
            // Solo mostramos alertas en el panel de administración
            if (!silent && window.location.pathname.includes('/admin/')) {
                alert('No hay datos para sincronizar con el repositorio.');
            }
            return false;
        }

        // Obtener la configuración del sitio desde localStorage
        const settings = {
            site_name: localStorage.getItem('site_name') || 'MatemáticaWeb',
            site_description: localStorage.getItem('site_description') || 'Plataforma educativa para el aprendizaje de matemáticas',
            primary_color: localStorage.getItem('primary_color') || '#0d6efd',
            font_family: localStorage.getItem('font_family') || "'Roboto', sans-serif",
            site_logo: localStorage.getItem('site_logo') || '',
            use_logo: localStorage.getItem('use_logo') === 'true'
        };

        // Añadir la configuración a los datos persistentes
        const dataToSync = { ...currentData.persistent, settings };

        // Contar elementos para el log
        const coursesCount = Object.keys(dataToSync.courses || {}).length;
        const topicsCount = Object.keys(dataToSync.topics || {}).length;
        const sectionsCount = Object.keys(dataToSync.sections || {}).length;
        console.log(`Sincronizando ${coursesCount} cursos, ${topicsCount} temas y ${sectionsCount} secciones...`);

        // 1. Generar JSON con datos persistentes y configuración
        const result = this.generateRepoJSON(dataToSync, silent, download);

        if (result) {
            // 2. Limpiar solo el registro de no sincronizados
            currentData.unsynced = {};
            localStorage.setItem('courseData', JSON.stringify(currentData));
            console.log('Registro de cambios no sincronizados limpiado');

            // Registrar en el log
            if (typeof Logger !== 'undefined') {
                Logger.info('Datos sincronizados con el repositorio');
            } else {
                console.log('Datos sincronizados con el repositorio');
            }

            // Mostrar mensaje de éxito
            if (!silent && !download && window.location.pathname.includes('/admin/')) {
                alert('Los datos se han sincronizado correctamente y están listos para ser exportados a JSON cuando lo necesites.');
            }

            return true;
        }

        console.error('Error al generar JSON para el repositorio');
        return false;
    },

    /**
     * Genera los archivos JSON para el repositorio
     * @param {object} data - Datos a guardar en los JSON
     * @param {boolean} silent - Si es true, no muestra alertas
     * @param {boolean} download - Si es true, descarga los archivos JSON
     */
    generateRepoJSON(data, silent = false, download = false) {
        try {
            // Validar que los datos no estén vacíos
            if (!data || Object.keys(data).length === 0) {
                console.error('No hay datos para generar los JSON');
                if (!silent) {
                    alert('No hay datos para generar los archivos JSON.');
                }
                return false;
            }

            console.log('Generando archivos JSON para el repositorio...');

            // 1. Generar archivo combinado (para compatibilidad)
            const combinedJsonData = JSON.stringify(data, null, 2);
            console.log('Archivo combinado generado correctamente');

            // 2. Preparar archivos separados
            let coursesJsonData = null;
            let topicsJsonData = null;
            let settingsJsonData = null;
            let activitiesJsonData = null;

            // Cursos
            if (data.courses && Object.keys(data.courses).length > 0) {
                // Convertir objeto a array
                const coursesArray = Object.values(data.courses);
                coursesJsonData = JSON.stringify(coursesArray, null, 2);
                console.log(`Archivo de cursos generado con ${coursesArray.length} cursos`);
            } else {
                console.warn('No hay cursos para generar JSON');
            }

            // Temas
            if (data.topics && Object.keys(data.topics).length > 0) {
                // Convertir objeto a array
                const topicsArray = Object.values(data.topics);
                topicsJsonData = JSON.stringify(topicsArray, null, 2);
                console.log(`Archivo de temas generado con ${topicsArray.length} temas`);
            } else {
                console.warn('No hay temas para generar JSON');
            }

            // Configuración (si existe)
            if (data.settings) {
                settingsJsonData = JSON.stringify(data.settings, null, 2);
                console.log('Archivo de configuración generado correctamente');
            } else {
                console.warn('No hay configuración para generar JSON');
            }

            // Actividades (si existen)
            if (data.activities && Object.keys(data.activities).length > 0) {
                // Convertir objeto a array
                const activitiesArray = Object.values(data.activities);
                activitiesJsonData = JSON.stringify(activitiesArray, null, 2);
                console.log(`Archivo de actividades generado con ${activitiesArray.length} actividades`);
            } else {
                // Intentar recuperar actividades desde localStorage
                try {
                    const activityRegistry = JSON.parse(localStorage.getItem('activity_registry') || '[]');
                    if (activityRegistry.length > 0) {
                        const activities = [];
                        activityRegistry.forEach(activityInfo => {
                            const activityData = JSON.parse(localStorage.getItem(`activity_data_${activityInfo.id}`) || 'null');
                            if (activityData) {
                                activities.push(activityData);
                            }
                        });

                        if (activities.length > 0) {
                            activitiesJsonData = JSON.stringify(activities, null, 2);
                            console.log(`Archivo de actividades generado con ${activities.length} actividades recuperadas`);
                        } else {
                            console.warn('No se encontraron actividades para generar JSON');
                        }
                    } else {
                        console.warn('No hay registro de actividades para generar JSON');
                    }
                } catch (error) {
                    console.warn('Error al recuperar actividades:', error);
                }
            }

            // Guardar los datos JSON en localStorage para su posterior sincronización
            localStorage.setItem('jsonData_courseData', combinedJsonData);
            if (coursesJsonData) localStorage.setItem('jsonData_courses', coursesJsonData);
            if (topicsJsonData) localStorage.setItem('jsonData_topics', topicsJsonData);
            if (settingsJsonData) localStorage.setItem('jsonData_settings', settingsJsonData);
            if (activitiesJsonData) localStorage.setItem('jsonData_activities', activitiesJsonData);
            console.log('Datos JSON guardados en localStorage para su posterior sincronización');

            // Si se solicita la descarga, descargar los archivos
            if (download) {
                console.log('Descargando archivos JSON...');
                if (combinedJsonData) this.downloadJsonFile(combinedJsonData, 'courseData.json', 'repository-data');
                if (coursesJsonData) this.downloadJsonFile(coursesJsonData, 'courses.json', 'courses-data');
                if (topicsJsonData) this.downloadJsonFile(topicsJsonData, 'topics.json', 'topics-data');
                if (settingsJsonData) this.downloadJsonFile(settingsJsonData, 'settings.json', 'settings-data');
                if (activitiesJsonData) this.downloadJsonFile(activitiesJsonData, 'activities.json', 'activities-data');

                // Solo mostramos la alerta si se solicita explícitamente y no estamos en modo silencioso
                if (!silent && window.location.pathname.includes('/admin/')) {
                    alert('Se han generado los archivos JSON para el repositorio. Por favor, guárdelos en las carpetas correspondientes del proyecto:\n\n- courseData.json en /data/\n- courses.json en /data/\n- topics.json en /data/\n- settings.json en /data/\n\nY haga commit de los cambios.');
                }
            } else {
                console.log('Archivos JSON generados pero no descargados (download=false)');
            }

            // Guardar una copia en localStorage para referencia
            localStorage.setItem('lastGeneratedJSON', combinedJsonData);
            localStorage.setItem('lastJSONGenerationTime', new Date().toISOString());
            console.log('Generación de JSON completada correctamente');

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
