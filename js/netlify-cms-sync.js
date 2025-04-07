/**
 * Sistema de sincronización entre Netlify CMS y el sistema de persistencia local
 *
 * Este módulo se encarga de sincronizar los datos entre el sistema de archivos
 * (gestionado por Netlify CMS) y el sistema de persistencia local (localStorage).
 */

const NetlifyCMSSync = {
    /**
     * Inicializa el sistema de sincronización
     */
    async init() {
        console.log('Inicializando sistema de sincronización con Netlify CMS...');

        try {
            // Verificar si estamos en un entorno de producción (Netlify)
            const isProduction = window.location.hostname.includes('netlify.app') ||
                               window.location.hostname.includes('netlify.com');

            if (isProduction) {
                console.log('Entorno de producción detectado, cargando datos desde archivos JSON...');
                await this.loadDataFromFiles();
            }

            return true;
        } catch (error) {
            console.error('Error inicializando sistema de sincronización:', error);
            return false;
        }
    },

    /**
     * Carga los datos desde los archivos JSON generados por Netlify CMS
     */
    async loadDataFromFiles() {
        try {
            // 1. Cargar cursos
            const coursesData = await this.fetchJSONDirectory('/data/courses/');
            if (coursesData && coursesData.length > 0) {
                console.log(`Cargados ${coursesData.length} cursos desde archivos JSON`);
                coursesData.forEach(course => {
                    if (typeof DataPersistence !== 'undefined') {
                        DataPersistence.saveData('courses', course.id, course, false, true);
                    }
                });
            }

            // 2. Cargar temas
            const topicsData = await this.fetchJSONDirectory('/data/topics/');
            if (topicsData && topicsData.length > 0) {
                console.log(`Cargados ${topicsData.length} temas desde archivos JSON`);
                topicsData.forEach(topic => {
                    if (typeof DataPersistence !== 'undefined') {
                        DataPersistence.saveData('topics', topic.id, topic, false, true);
                    }
                });
            }

            // 3. Cargar configuración
            try {
                const settingsResponse = await fetch('/data/settings.json');
                if (settingsResponse.ok) {
                    const settings = await settingsResponse.json();
                    console.log('Configuración cargada desde archivo JSON');

                    // Guardar configuración en localStorage
                    Object.entries(settings).forEach(([key, value]) => {
                        localStorage.setItem(key, value);
                    });
                }
            } catch (error) {
                console.warn('No se pudo cargar la configuración:', error);
            }

            return true;
        } catch (error) {
            console.error('Error cargando datos desde archivos JSON:', error);
            return false;
        }
    },

    /**
     * Obtiene una lista de archivos JSON en un directorio
     * @param {string} directory - Ruta al directorio
     * @returns {Promise<Array>} - Array de objetos JSON
     */
    async fetchJSONDirectory(directory) {
        try {
            console.log(`Intentando cargar datos desde: ${directory}`);

            // Primero intentar cargar directamente el archivo JSON principal (prioridad)
            try {
                // Quitar la barra final si existe y agregar .json
                const mainJsonPath = `${directory.replace(/\/$/, '')}.json`;
                console.log(`Intentando cargar archivo principal: ${mainJsonPath}`);

                const response = await fetch(mainJsonPath);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Archivo JSON principal cargado correctamente: ${mainJsonPath}`);
                    return Array.isArray(data) ? data : [data];
                } else {
                    console.warn(`No se pudo cargar el archivo JSON principal (${response.status}): ${mainJsonPath}`);
                }
            } catch (error) {
                console.warn('Error al cargar el archivo JSON principal:', error);
            }

            // Si no se pudo cargar el archivo principal, intentar con index.json
            try {
                const indexPath = `${directory}index.json`;
                console.log(`Intentando cargar index.json: ${indexPath}`);

                const indexResponse = await fetch(indexPath);
                if (indexResponse.ok) {
                    const data = await indexResponse.json();
                    console.log(`index.json cargado correctamente: ${indexPath}`);
                    return Array.isArray(data) ? data : [data];
                } else {
                    console.warn(`No se pudo cargar index.json (${indexResponse.status}): ${indexPath}`);
                }
            } catch (error) {
                console.warn('Error al cargar index.json:', error);
            }

            console.warn(`No se pudieron cargar datos desde: ${directory}`);
            return [];
        } catch (error) {
            console.error('Error obteniendo archivos JSON:', error);
            return [];
        }
    },

    /**
     * Sincroniza los datos del sistema de persistencia local con Netlify CMS
     * Esta función no puede escribir archivos directamente, pero puede generar
     * archivos para descargar que luego se pueden subir manualmente al repositorio
     */
    syncToNetlifyCMS() {
        try {
            if (typeof DataPersistence === 'undefined') {
                alert('Sistema de persistencia no disponible');
                return false;
            }

            // 1. Obtener datos del sistema de persistencia
            const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
            if (!currentData.persistent) {
                alert('No hay datos para sincronizar');
                return false;
            }

            // 2. Generar archivos JSON para cada tipo de dato

            // Cursos
            const courses = Object.values(currentData.persistent.courses || {});
            if (courses.length > 0) {
                this.generateJSONFile(courses, 'courses.json', 'Cursos');
            }

            // Temas
            const topics = Object.values(currentData.persistent.topics || {});
            if (topics.length > 0) {
                this.generateJSONFile(topics, 'topics.json', 'Temas');
            }

            // Configuración
            const settings = {
                site_name: localStorage.getItem('site_name') || 'MatemáticaWeb',
                site_description: localStorage.getItem('site_description') || '',
                primary_color: localStorage.getItem('primary_color') || '#007bff',
                font_family: localStorage.getItem('font_family') || 'Arial, sans-serif',
                site_logo: localStorage.getItem('site_logo') || '',
                use_logo: localStorage.getItem('use_logo') === 'true'
            };
            this.generateJSONFile(settings, 'settings.json', 'Configuración');

            // Mostrar instrucciones claras al usuario
            alert(`Se han generado los siguientes archivos JSON para sincronizar con Netlify CMS:

1. settings.json - Configuración del sitio
2. courses.json - Cursos
3. topics.json - Temas

Para actualizar tu sitio en Netlify:

1. Coloca estos archivos en tu repositorio:
   - settings.json → en /data/settings.json
   - courses.json → en /data/courses.json
   - topics.json → en /data/topics.json

2. Haz commit y push de estos cambios.

3. Netlify desplegará automáticamente los cambios.

Nota: Si no ves alguno de estos archivos en tus descargas, revisa la carpeta de descargas de tu navegador.`);

            return true;
        } catch (error) {
            console.error('Error sincronizando con Netlify CMS:', error);
            alert('Error sincronizando con Netlify CMS. Consulte la consola para más detalles.');
            return false;
        }
    },

    /**
     * Genera un archivo JSON para descargar
     * @param {object|array} data - Datos a guardar en el JSON
     * @param {string} filename - Nombre del archivo
     * @param {string} description - Descripción para el alert
     */
    generateJSONFile(data, filename, description) {
        try {
            const jsonData = JSON.stringify(data, null, 2);

            // Crear un blob y descargar
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.setAttribute('data-download-type', 'netlify-cms-data');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`Archivo ${filename} generado para ${description}`);

            return true;
        } catch (error) {
            console.error(`Error generando archivo ${filename}:`, error);
            return false;
        }
    }
};

// Exportar el módulo
window.NetlifyCMSSync = NetlifyCMSSync;
