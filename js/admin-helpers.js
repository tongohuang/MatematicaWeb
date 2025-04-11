/**
 * Funciones auxiliares para el panel de administración
 *
 * Este script proporciona funciones de ayuda para el panel de administración,
 * incluyendo verificaciones de disponibilidad de componentes críticos.
 */

const AdminHelpers = {
    /**
     * Verifica si un componente está disponible
     * @param {string} componentName - Nombre del componente a verificar
     * @returns {boolean} - true si el componente está disponible, false en caso contrario
     */
    isComponentAvailable(componentName) {
        return typeof window[componentName] !== 'undefined';
    },

    /**
     * Espera a que un componente esté disponible
     * @param {string} componentName - Nombre del componente a esperar
     * @param {number} timeout - Tiempo máximo de espera en milisegundos
     * @returns {Promise<boolean>} - Promise que se resuelve a true si el componente está disponible, false si se agota el tiempo
     */
    async waitForComponent(componentName, timeout = 5000) {
        console.log(`Esperando a que ${componentName} esté disponible...`);

        // Si el componente ya está disponible, resolver inmediatamente
        if (this.isComponentAvailable(componentName)) {
            console.log(`${componentName} ya está disponible`);
            return true;
        }

        // Esperar a que el componente esté disponible
        return new Promise((resolve) => {
            const startTime = Date.now();

            // Función para verificar la disponibilidad del componente
            const checkAvailability = () => {
                // Verificar si el componente está disponible
                if (this.isComponentAvailable(componentName)) {
                    console.log(`${componentName} está disponible ahora`);
                    resolve(true);
                    return;
                }

                // Verificar si se ha agotado el tiempo
                if (Date.now() - startTime > timeout) {
                    console.error(`Tiempo de espera agotado para ${componentName}`);
                    resolve(false);
                    return;
                }

                // Seguir esperando
                setTimeout(checkAvailability, 100);
            };

            // Iniciar la verificación
            checkAvailability();
        });
    },

    /**
     * Ejecuta una función solo si un componente está disponible
     * @param {string} componentName - Nombre del componente requerido
     * @param {Function} fn - Función a ejecutar
     * @param {number} timeout - Tiempo máximo de espera en milisegundos
     * @returns {Promise<any>} - Promise que se resuelve al resultado de la función o se rechaza si el componente no está disponible
     */
    async executeWithComponent(componentName, fn, timeout = 5000) {
        // Esperar a que el componente esté disponible
        const isAvailable = await this.waitForComponent(componentName, timeout);

        if (!isAvailable) {
            throw new Error(`El componente ${componentName} no está disponible`);
        }

        // Ejecutar la función
        return fn();
    },

    /**
     * Actualiza los archivos JSON desde localStorage
     * @returns {Promise<boolean>} - Promise que se resuelve a true si la actualización fue exitosa, false en caso contrario
     */
    async updateJsonFromLocalStorage() {
        console.log('Actualizando archivos JSON desde localStorage...');

        try {
            // Ejecutar la actualización solo si DataPersistence está disponible
            return await this.executeWithComponent('DataPersistence', () => {
                // 1. Obtener todos los datos de localStorage
                const courses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
                const topics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');

                // 2. Convertir arrays a objetos indexados por ID para el formato que espera DataPersistence
                const coursesObj = {};
                const topicsObj = {};
                const activitiesObj = {};

                // Procesar cursos
                courses.forEach(course => {
                    coursesObj[course.id] = course;
                });

                // Procesar temas
                topics.forEach(topic => {
                    topicsObj[topic.id] = topic;
                });

                // Procesar actividades desde el registro
                try {
                    const activityRegistry = JSON.parse(localStorage.getItem('activity_registry') || '[]');
                    activityRegistry.forEach(activityInfo => {
                        const activityData = JSON.parse(localStorage.getItem(`activity_data_${activityInfo.id}`) || 'null');
                        if (activityData) {
                            activitiesObj[activityInfo.id] = activityData;
                        }
                    });
                } catch (error) {
                    console.warn('Error al procesar actividades:', error);
                }

                // 3. Crear el objeto de datos completo
                const data = {
                    courses: coursesObj,
                    topics: topicsObj,
                    activities: activitiesObj
                };

                // 4. Generar los archivos JSON (sin descargarlos)
                const success = DataPersistence.generateRepoJSON(data, false, false);

                if (success) {
                    alert('Los archivos JSON se han actualizado correctamente desde localStorage. Ahora puede descargarlos con el botón "Descargar JSON".');
                    return true;
                } else {
                    alert('Hubo un problema al actualizar los archivos JSON. Por favor, revise la consola para más detalles.');
                    return false;
                }
            });
        } catch (error) {
            console.error('Error al actualizar archivos JSON:', error);
            alert('Error al actualizar los archivos JSON: ' + error.message);
            return false;
        }
    },

    /**
     * Descarga los archivos JSON previamente generados
     * @returns {Promise<boolean>} - Promise que se resuelve a true si la descarga fue exitosa, false en caso contrario
     */
    async downloadJsonFiles() {
        console.log('Descargando archivos JSON...');

        try {
            // Ejecutar la descarga solo si DataPersistence está disponible
            return await this.executeWithComponent('DataPersistence', () => {
                // Verificar si los archivos JSON están actualizados
                const lastJSONGenerationTime = localStorage.getItem('lastJSONGenerationTime');
                if (!lastJSONGenerationTime) {
                    // Si no hay archivos JSON generados, actualizarlos primero
                    if (confirm('Los archivos JSON no están actualizados. ¿Desea actualizarlos primero?')) {
                        this.updateJsonFromLocalStorage();
                        return false;
                    } else {
                        return false;
                    }
                }

                // Obtener los datos JSON de localStorage
                const combinedJsonData = localStorage.getItem('jsonData_courseData');
                const coursesJsonData = localStorage.getItem('jsonData_courses');
                const topicsJsonData = localStorage.getItem('jsonData_topics');
                const settingsJsonData = localStorage.getItem('jsonData_settings');
                const activitiesJsonData = localStorage.getItem('jsonData_activities');

                // Descargar los archivos
                if (combinedJsonData) DataPersistence.downloadJsonFile(combinedJsonData, 'courseData.json', 'repository-data');
                if (coursesJsonData) DataPersistence.downloadJsonFile(coursesJsonData, 'courses.json', 'courses-data');
                if (topicsJsonData) DataPersistence.downloadJsonFile(topicsJsonData, 'topics.json', 'topics-data');
                if (settingsJsonData) DataPersistence.downloadJsonFile(settingsJsonData, 'settings.json', 'settings-data');
                if (activitiesJsonData) DataPersistence.downloadJsonFile(activitiesJsonData, 'activities.json', 'activities-data');

                // Generar también un nuevo archivo version.json
                if (window.CacheControl) {
                    const newVersion = window.CacheControl.updateVersion();
                    const versionJsonData = JSON.stringify(newVersion, null, 2);
                    DataPersistence.downloadJsonFile(versionJsonData, 'version.json', 'version-data');
                }

                alert('Se han descargado los archivos JSON. Por favor, guárdelos en las carpetas correspondientes del proyecto:\n\n- courseData.json en /data/\n- courses.json en /data/\n- topics.json en /data/\n- settings.json en /data/\n- activities.json en /data/\n- version.json en /data/ (IMPORTANTE para forzar actualización de caché)\n\nY haga commit de los cambios.');
                return true;
            });
        } catch (error) {
            console.error('Error al descargar archivos JSON:', error);
            alert('Error al descargar los archivos JSON: ' + error.message);
            return false;
        }
    },

    /**
     * Fuerza la carga de datos desde los archivos JSON del repositorio
     * @returns {Promise<boolean>} - Promise que se resuelve a true si la carga fue exitosa, false en caso contrario
     */
    async forceRepoDataLoad() {
        if (confirm('¿Está seguro de que desea cargar los datos desde los archivos JSON del repositorio? Esto sobrescribirá los datos actuales en localStorage.')) {
            try {
                // Ejecutar la carga solo si DataPersistence está disponible
                return await this.executeWithComponent('DataPersistence', () => {
                    return DataPersistence.init(true);
                });
            } catch (error) {
                console.error('Error al cargar datos desde el repositorio:', error);
                alert('Error al cargar datos desde el repositorio: ' + error.message);
                return false;
            }
        }
        return false;
    },

    /**
     * Actualiza la versión del sitio
     * @returns {Promise<boolean>} - Promise que se resuelve a true si la actualización fue exitosa, false en caso contrario
     */
    async updateSiteVersion() {
        if (confirm('¿Está seguro de que desea generar un nuevo archivo version.json? Cuando suba este archivo al repositorio, todos los usuarios serán forzados a recargar la página para ver los cambios más recientes.')) {
            try {
                // Verificar que CacheControl esté disponible
                if (!this.isComponentAvailable('CacheControl')) {
                    alert('El control de caché no está disponible. Por favor, recargue la página e intente nuevamente.');
                    return false;
                }

                // Ejecutar la actualización solo si DataPersistence está disponible
                return await this.executeWithComponent('DataPersistence', () => {
                    const newVersion = window.CacheControl.updateVersion();

                    // Crear archivo version.json
                    const versionJsonData = JSON.stringify(newVersion, null, 2);
                    DataPersistence.downloadJsonFile(versionJsonData, 'version.json', 'version-data');

                    alert('Archivo version.json generado correctamente. IMPORTANTE:\n\n1. Suba este archivo a la carpeta /data/ del repositorio\n2. Haga commit y push de los cambios\n3. Espere a que Netlify despliegue la nueva versión\n\nUna vez desplegado, todos los usuarios verán automáticamente los cambios más recientes.');
                    return true;
                });
            } catch (error) {
                console.error('Error al generar version.json:', error);
                alert('Error al generar version.json: ' + error.message);
                return false;
            }
        }
        return false;
    }
};

// Exportar el módulo
window.AdminHelpers = AdminHelpers;
