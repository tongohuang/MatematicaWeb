// Gestor de datos para almacenamiento permanente
const DataManager = {
    // Claves para localStorage
    COURSES_KEY: 'matematicaweb_courses',
    TOPICS_KEY: 'matematicaweb_topics',

    // Inicializar datos
    init() {
        console.log('Inicializando DataManager...');
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

    // Obtener cursos
    getCourses() {
        const coursesData = localStorage.getItem(this.COURSES_KEY);
        return coursesData ? JSON.parse(coursesData) : [];
    },

    // Guardar cursos
    saveCourses(courses) {
        localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
    },

    // Obtener un curso por ID
    getCourseById(courseId) {
        const courses = this.getCourses();
        return courses.find(course => course.id === courseId);
    },

    // Guardar un curso (crear o actualizar)
    saveCourse(course) {
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
        const topicsData = localStorage.getItem(this.TOPICS_KEY);
        return topicsData ? JSON.parse(topicsData) : [];
    },

    // Guardar temas
    saveTopics(topics) {
        localStorage.setItem(this.TOPICS_KEY, JSON.stringify(topics));
    },

    // Obtener temas por curso
    getTopicsByCourse(courseId) {
        const topics = this.getTopics();
        return topics.filter(topic => topic.courseId === courseId);
    },

    // Obtener un tema por ID
    getTopicById(topicId) {
        const topics = this.getTopics();
        return topics.find(topic => topic.id === topicId);
    },

    // Guardar un tema (crear o actualizar)
    saveTopic(topic) {
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
        const topics = this.getTopics();
        const newTopics = topics.filter(topic => topic.id !== topicId);
        this.saveTopics(newTopics);
    },

    // Reiniciar todos los datos (volver a los datos de muestra)
    resetData() {
        if (confirm('¿Estás seguro de que deseas reiniciar todos los datos? Esta acción no se puede deshacer.')) {
            this.saveCourses(SAMPLE_COURSES);
            this.saveTopics(SAMPLE_TOPICS);
            alert('Datos reiniciados correctamente');
            return true;
        }
        return false;
    }
};

// Inicializar datos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    DataManager.init();
});
