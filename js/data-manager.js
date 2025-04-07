// Gestor de datos para almacenamiento permanente
const DataManager = {
    // Claves para localStorage (compatibilidad con versión anterior)
    COURSES_KEY: 'matematicaweb_courses',
    TOPICS_KEY: 'matematicaweb_topics',

    // Inicializar datos
    async init() {
        console.log('Inicializando DataManager...');

        // Verificar si el sistema de persistencia está disponible
        if (typeof DataPersistence !== 'undefined') {
            console.log('Usando sistema de persistencia avanzado...');

            // Inicializar el sistema de persistencia
            await DataPersistence.init();

            // Migrar datos antiguos si existen
            this._migrateOldData();

            // Verificar que se hayan cargado los datos
            const courses = this.getCourses();
            const topics = this.getTopics();
            console.log(`DataManager inicializado con ${courses.length} cursos y ${topics.length} temas`);

            return;
        }

        // Fallback al sistema antiguo
        console.warn('Sistema de persistencia no disponible, usando almacenamiento local básico');

        // Verificar si ya existen datos guardados
        if (!localStorage.getItem(this.COURSES_KEY)) {
            // Si no existen, guardar los datos de muestra
            if (typeof SAMPLE_COURSES !== 'undefined') {
                console.log('Guardando cursos de muestra...');
                this.saveCourses(SAMPLE_COURSES);
            } else {
                console.log('No se encontraron cursos de muestra, inicializando vacío');
                this.saveCourses([]);
            }
        }

        if (!localStorage.getItem(this.TOPICS_KEY)) {
            // Si no existen, guardar los datos de muestra
            if (typeof SAMPLE_TOPICS !== 'undefined') {
                console.log('Guardando temas de muestra...');
                this.saveTopics(SAMPLE_TOPICS);
            } else {
                console.log('No se encontraron temas de muestra, inicializando vacío');
                this.saveTopics([]);
            }
        }

        // Verificar que se hayan cargado los datos
        const courses = this.getCourses();
        const topics = this.getTopics();
        console.log(`DataManager inicializado con ${courses.length} cursos y ${topics.length} temas`);
    },

    // Migrar datos del formato antiguo al nuevo
    _migrateOldData() {
        // Verificar si hay datos en el formato antiguo
        const oldCoursesData = localStorage.getItem(this.COURSES_KEY);
        const oldTopicsData = localStorage.getItem(this.TOPICS_KEY);

        if (!oldCoursesData && !oldTopicsData) {
            console.log('No hay datos antiguos para migrar');
            return;
        }

        console.log('Migrando datos del formato antiguo al nuevo...');

        // Migrar cursos
        if (oldCoursesData) {
            try {
                const courses = JSON.parse(oldCoursesData);
                courses.forEach(course => {
                    DataPersistence.saveData('courses', course.id, course);
                });
                console.log(`Migrados ${courses.length} cursos`);
            } catch (error) {
                console.error('Error migrando cursos:', error);
            }
        }

        // Migrar temas
        if (oldTopicsData) {
            try {
                const topics = JSON.parse(oldTopicsData);
                topics.forEach(topic => {
                    DataPersistence.saveData('topics', topic.id, topic);
                });
                console.log(`Migrados ${topics.length} temas`);
            } catch (error) {
                console.error('Error migrando temas:', error);
            }
        }
    },

    // Obtener cursos
    getCourses() {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.getAllDataAsArray('courses');
        }

        // Fallback al sistema antiguo
        const coursesData = localStorage.getItem(this.COURSES_KEY);
        return coursesData ? JSON.parse(coursesData) : [];
    },

    // Guardar cursos
    saveCourses(courses) {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            // Convertir array a objeto indexado por ID
            const coursesObj = {};
            courses.forEach(course => {
                coursesObj[course.id] = course;
            });

            // Guardar cada curso en el sistema de persistencia
            Object.entries(coursesObj).forEach(([id, course]) => {
                DataPersistence.saveData('courses', id, course);
            });

            return;
        }

        // Fallback al sistema antiguo
        localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
    },

    // Obtener un curso por ID
    getCourseById(courseId) {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.getData('courses', courseId);
        }

        // Fallback al sistema antiguo
        const courses = this.getCourses();
        return courses.find(course => course.id === courseId);
    },

    // Guardar un curso (crear o actualizar)
    saveCourse(course) {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.saveData('courses', course.id, course);
        }

        // Fallback al sistema antiguo
        const courses = this.getCourses();
        const index = courses.findIndex(c => c.id === course.id);

        if (index !== -1) {
            // Actualizar curso existente
            courses[index] = course;
        } else {
            // Crear nuevo curso
            courses.push(course);
        }

        this.saveCourses(courses);
        return course;
    },

    // Eliminar un curso
    deleteCourse(courseId) {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            // Eliminar el curso
            DataPersistence.deleteData('courses', courseId);

            // Obtener temas asociados a este curso
            const topics = this.getTopicsByCourse(courseId);

            // Eliminar cada tema asociado
            topics.forEach(topic => {
                DataPersistence.deleteData('topics', topic.id);
            });

            return;
        }

        // Fallback al sistema antiguo
        const courses = this.getCourses();
        const newCourses = courses.filter(course => course.id !== courseId);
        this.saveCourses(newCourses);

        // También eliminar los temas asociados a este curso
        const topics = this.getTopics();
        const newTopics = topics.filter(topic => topic.courseId !== courseId);
        this.saveTopics(newTopics);
    },

    // Obtener temas
    getTopics() {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.getAllDataAsArray('topics');
        }

        // Fallback al sistema antiguo
        const topicsData = localStorage.getItem(this.TOPICS_KEY);
        return topicsData ? JSON.parse(topicsData) : [];
    },

    // Guardar temas
    saveTopics(topics) {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            // Convertir array a objeto indexado por ID
            const topicsObj = {};
            topics.forEach(topic => {
                topicsObj[topic.id] = topic;
            });

            // Guardar cada tema en el sistema de persistencia
            Object.entries(topicsObj).forEach(([id, topic]) => {
                DataPersistence.saveData('topics', id, topic);
            });

            return;
        }

        // Fallback al sistema antiguo
        localStorage.setItem(this.TOPICS_KEY, JSON.stringify(topics));
    },

    // Obtener temas por curso
    getTopicsByCourse(courseId) {
        const topics = this.getTopics();
        return topics.filter(topic => topic.courseId === courseId);
    },

    // Obtener un tema por ID
    getTopicById(topicId) {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.getData('topics', topicId);
        }

        // Fallback al sistema antiguo
        const topics = this.getTopics();
        return topics.find(topic => topic.id === topicId);
    },

    // Guardar un tema (crear o actualizar)
    saveTopic(topic) {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.saveData('topics', topic.id, topic);
        }

        // Fallback al sistema antiguo
        const topics = this.getTopics();
        const index = topics.findIndex(t => t.id === topic.id);

        if (index !== -1) {
            // Actualizar tema existente
            topics[index] = topic;
        } else {
            // Crear nuevo tema
            topics.push(topic);
        }

        this.saveTopics(topics);
        return topic;
    },

    // Eliminar un tema
    deleteTopic(topicId) {
        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.deleteData('topics', topicId);
        }

        // Fallback al sistema antiguo
        const topics = this.getTopics();
        const newTopics = topics.filter(topic => topic.id !== topicId);
        this.saveTopics(newTopics);
    },

    // Reiniciar todos los datos (volver a los datos de muestra)
    resetData() {
        if (confirm('¿Estás seguro de que deseas reiniciar todos los datos? Esta acción no se puede deshacer.')) {
            // Crear copia de seguridad antes de reiniciar
            if (typeof DataPersistence !== 'undefined') {
                DataPersistence.createDataBackup();
            }

            this.saveCourses(SAMPLE_COURSES);
            this.saveTopics(SAMPLE_TOPICS);
            alert('Datos reiniciados correctamente');
            return true;
        }
        return false;
    },

    // Sincronizar datos con el repositorio
    synchronizeData() {
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.synchronizeData();
        } else {
            alert('Sistema de persistencia no disponible');
            return false;
        }
    },

    // Obtener estado de sincronización
    getSyncStatus() {
        if (typeof DataPersistence !== 'undefined') {
            return DataPersistence.getSyncStatus();
        } else {
            return { synced: true, pendingChanges: 0, lastChange: null };
        }
    }
};

// Inicializar datos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await DataManager.init();
});

// Exportar el módulo
window.DataManager = DataManager;
