/**
 * Exportador de JSON para MatemáticaWeb
 *
 * Este script proporciona funciones para exportar datos de localStorage a archivos JSON.
 * No depende de otros módulos y funciona de forma independiente.
 */

const JsonExporter = {
    /**
     * Descarga un archivo JSON
     * @param {string} jsonData - Datos JSON a descargar
     * @param {string} filename - Nombre del archivo
     */
    downloadJsonFile(jsonData, filename) {
        try {
            // Crear un blob y descargar
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
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
     * Actualiza los archivos JSON desde localStorage
     */
    updateJsonFromLocalStorage() {
        console.log('Actualizando archivos JSON desde localStorage...');

        try {
            // 1. Obtener todos los datos de localStorage
            const courses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
            const topics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');

            // 2. Convertir arrays a objetos indexados por ID
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

            // 4. Generar los archivos JSON
            const coursesJsonData = JSON.stringify(Object.values(coursesObj), null, 2);
            const topicsJsonData = JSON.stringify(Object.values(topicsObj), null, 2);
            const activitiesJsonData = JSON.stringify(Object.values(activitiesObj), null, 2);
            const combinedJsonData = JSON.stringify(data, null, 2);

            // Generar settings.json (configuración del sitio)
            const settingsData = localStorage.getItem('matematicaweb_settings') || '{}';
            const settingsJsonData = settingsData;

            // 5. Guardar en localStorage para su posterior descarga
            localStorage.setItem('jsonData_courseData', combinedJsonData);
            localStorage.setItem('jsonData_courses', coursesJsonData);
            localStorage.setItem('jsonData_topics', topicsJsonData);
            localStorage.setItem('jsonData_activities', activitiesJsonData);
            localStorage.setItem('jsonData_settings', settingsJsonData);
            localStorage.setItem('lastJSONGenerationTime', new Date().toISOString());

            alert('Los archivos JSON se han actualizado correctamente desde localStorage. Ahora puede descargarlos con el botón "Descargar JSON".');
            return true;
        } catch (error) {
            console.error('Error al actualizar archivos JSON:', error);
            alert('Error al actualizar los archivos JSON: ' + error.message);
            return false;
        }
    },

    /**
     * Descarga los archivos JSON previamente generados
     */
    downloadJsonFiles() {
        console.log('Descargando archivos JSON...');

        try {
            // Verificar si los archivos JSON están actualizados
            const lastJSONGenerationTime = localStorage.getItem('lastJSONGenerationTime');
            if (!lastJSONGenerationTime) {
                // Si no hay archivos JSON generados, actualizarlos primero
                if (confirm('Los archivos JSON no están actualizados. ¿Desea actualizarlos primero?')) {
                    this.updateJsonFromLocalStorage();
                    return;
                } else {
                    return;
                }
            }

            // Obtener los datos JSON de localStorage
            const combinedJsonData = localStorage.getItem('jsonData_courseData');
            const coursesJsonData = localStorage.getItem('jsonData_courses');
            const topicsJsonData = localStorage.getItem('jsonData_topics');
            const activitiesJsonData = localStorage.getItem('jsonData_activities');
            const settingsJsonData = localStorage.getItem('jsonData_settings');

            // Descargar los archivos
            if (combinedJsonData) this.downloadJsonFile(combinedJsonData, 'courseData.json');
            if (coursesJsonData) this.downloadJsonFile(coursesJsonData, 'courses.json');
            if (topicsJsonData) this.downloadJsonFile(topicsJsonData, 'topics.json');
            if (activitiesJsonData) this.downloadJsonFile(activitiesJsonData, 'activities.json');
            if (settingsJsonData) this.downloadJsonFile(settingsJsonData, 'settings.json');

            // Generar también un nuevo archivo version.json
            const newVersion = {
                version: this.generateVersionString(),
                timestamp: Date.now()
            };
            const versionJsonData = JSON.stringify(newVersion, null, 2);
            this.downloadJsonFile(versionJsonData, 'version.json');

            alert('Se han descargado los archivos JSON. Por favor, guárdelos en las carpetas correspondientes del proyecto:\n\n- courseData.json en /data/\n- courses.json en /data/\n- topics.json en /data/\n- activities.json en /data/\n- settings.json en /data/\n- version.json en /data/ (IMPORTANTE para forzar actualización de caché)\n\nY haga commit de los cambios.');
        } catch (error) {
            console.error('Error al descargar archivos JSON:', error);
            alert('Error al descargar los archivos JSON: ' + error.message);
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
     * Actualiza la versión del sitio
     */
    updateSiteVersion() {
        if (confirm('¿Está seguro de que desea generar un nuevo archivo version.json? Cuando suba este archivo al repositorio, todos los usuarios serán forzados a recargar la página para ver los cambios más recientes.')) {
            try {
                // Crear nueva versión
                const newVersion = {
                    version: this.generateVersionString(),
                    timestamp: Date.now()
                };

                // Guardar en localStorage para referencia
                localStorage.setItem('siteVersion', JSON.stringify(newVersion));

                // Crear archivo version.json
                const versionJsonData = JSON.stringify(newVersion, null, 2);
                this.downloadJsonFile(versionJsonData, 'version.json');

                alert('Archivo version.json generado correctamente. IMPORTANTE:\n\n1. Suba este archivo a la carpeta /data/ del repositorio\n2. Haga commit y push de los cambios\n3. Espere a que Netlify despliegue la nueva versión\n\nUna vez desplegado, todos los usuarios verán automáticamente los cambios más recientes.');
            } catch (error) {
                console.error('Error al generar version.json:', error);
                alert('Error al generar version.json: ' + error.message);
            }
        }
    }
};

// Exportar el módulo
window.JsonExporter = JsonExporter;
