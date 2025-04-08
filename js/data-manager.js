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

            try {
                // Inicializar el sistema de persistencia
                await DataPersistence.init();

                // Migrar datos antiguos si existen
                this._migrateOldData();

                // Verificar que se hayan cargado los datos
                const courses = this.getCourses();
                const topics = this.getTopics();
                console.log(`DataManager inicializado con ${courses.length} cursos y ${topics.length} temas`);

                // Verificar si estamos en Netlify
                const isNetlify = window.location.hostname.includes('netlify.app') ||
                                 window.location.hostname.includes('netlify.com');

                if (isNetlify) {
                    console.log('Entorno Netlify detectado, verificando datos...');
                    if (courses.length === 0 || topics.length === 0) {
                        console.warn('No se encontraron datos en Netlify, intentando cargar desde JSON...');
                        // Forzar recarga desde JSON
                        await DataPersistence.init(true);
                    }
                }

                return;
            } catch (error) {
                console.error('Error al inicializar el sistema de persistencia:', error);
            }
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

        // Obtener datos actuales del nuevo sistema
        const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
        if (!currentData.persistent) currentData.persistent = { courses: {}, topics: {}, sections: {} };

        let migrated = false;
        let coursesCount = 0;
        let topicsCount = 0;
        let sectionsCount = 0;

        // Migrar cursos
        if (oldCoursesData) {
            try {
                const courses = JSON.parse(oldCoursesData);
                courses.forEach(course => {
                    // Verificar si el curso ya existe en el nuevo sistema
                    if (!currentData.persistent.courses[course.id]) {
                        console.log(`Migrando curso ${course.id}: ${course.title}`);
                        currentData.persistent.courses[course.id] = course;
                        coursesCount++;
                        migrated = true;
                    }
                });
                console.log(`Migrados ${coursesCount} cursos nuevos`);
            } catch (error) {
                console.error('Error migrando cursos:', error);
            }
        }

        // Migrar temas y sus secciones
        if (oldTopicsData) {
            try {
                const topics = JSON.parse(oldTopicsData);
                topics.forEach(topic => {
                    // Asegurarse de que el tema tenga una propiedad sections
                    if (!topic.sections) {
                        topic.sections = [];
                    }

                    // Verificar si el tema ya existe en el nuevo sistema
                    if (!currentData.persistent.topics[topic.id]) {
                        console.log(`Migrando tema ${topic.id}: ${topic.title}`);
                        currentData.persistent.topics[topic.id] = topic;
                        topicsCount++;
                        migrated = true;

                        // También guardar cada sección individualmente
                        if (topic.sections && topic.sections.length > 0) {
                            topic.sections.forEach(section => {
                                if (section.id && !currentData.persistent.sections[section.id]) {
                                    console.log(`Migrando sección ${section.id}: ${section.title}`);
                                    currentData.persistent.sections[section.id] = {
                                        ...section,
                                        topicId: topic.id
                                    };
                                    sectionsCount++;
                                }
                            });
                        }
                    }
                });
                console.log(`Migrados ${topicsCount} temas nuevos y ${sectionsCount} secciones nuevas`);
            } catch (error) {
                console.error('Error migrando temas:', error);
            }
        }

        // Guardar los cambios si se migró algo
        if (migrated) {
            localStorage.setItem('courseData', JSON.stringify(currentData));
            console.log('Migración completada y guardada en localStorage');
        } else {
            console.log('No se migraron datos nuevos');
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
        console.log(`DataManager: Eliminando curso con ID ${courseId}...`);

        // Asegurarse de que courseId sea numérico para comparaciones consistentes
        if (typeof courseId === 'string' && !isNaN(courseId)) {
            courseId = parseInt(courseId);
        }

        // Implementación simplificada que elimina directamente del localStorage
        try {
            // 1. Obtener los datos actuales
            const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
            if (!currentData.persistent) {
                currentData.persistent = { courses: {}, topics: {}, sections: {} };
            }

            // 2. Identificar temas y secciones asociados al curso
            const associatedTopicIds = [];
            const associatedSectionIds = [];

            // Buscar temas asociados
            if (currentData.persistent.topics) {
                Object.keys(currentData.persistent.topics).forEach(topicId => {
                    const topic = currentData.persistent.topics[topicId];
                    if (topic && topic.courseId === courseId) {
                        associatedTopicIds.push(topicId);

                        // Buscar secciones asociadas a este tema
                        if (topic.sections && Array.isArray(topic.sections)) {
                            topic.sections.forEach(section => {
                                if (section && section.id) {
                                    associatedSectionIds.push(section.id);
                                }
                            });
                        }
                    }
                });
            }

            console.log(`DataManager: Encontrados ${associatedTopicIds.length} temas y ${associatedSectionIds.length} secciones asociados al curso ${courseId}`);

            // 3. Eliminar secciones
            if (currentData.persistent.sections) {
                associatedSectionIds.forEach(sectionId => {
                    if (currentData.persistent.sections[sectionId]) {
                        delete currentData.persistent.sections[sectionId];
                        console.log(`DataManager: Sección ${sectionId} eliminada`);
                    }
                });
            }

            // 4. Eliminar temas
            associatedTopicIds.forEach(topicId => {
                if (currentData.persistent.topics[topicId]) {
                    delete currentData.persistent.topics[topicId];
                    console.log(`DataManager: Tema ${topicId} eliminado`);
                }
            });

            // 5. Eliminar curso
            let courseDeleted = false;
            if (currentData.persistent.courses && currentData.persistent.courses[courseId]) {
                delete currentData.persistent.courses[courseId];
                courseDeleted = true;
                console.log(`DataManager: Curso ${courseId} eliminado`);
            }

            // 6. Limpiar referencias en unsynced
            if (currentData.unsynced) {
                const newUnsynced = {};

                Object.keys(currentData.unsynced).forEach(key => {
                    if (!key.includes(`courses_${courseId}`) &&
                        !associatedTopicIds.some(topicId => key.includes(`topics_${topicId}`)) &&
                        !associatedSectionIds.some(sectionId => key.includes(`sections_${sectionId}`))) {
                        newUnsynced[key] = currentData.unsynced[key];
                    } else {
                        console.log(`DataManager: Eliminada referencia en unsynced: ${key}`);
                    }
                });

                currentData.unsynced = newUnsynced;
            }

            // 7. Guardar los cambios en localStorage
            localStorage.setItem('courseData', JSON.stringify(currentData));
            console.log('DataManager: Cambios guardados en localStorage');

            // 8. Eliminar también del sistema antiguo (para compatibilidad)
            try {
                const oldCourses = JSON.parse(localStorage.getItem(this.COURSES_KEY) || '[]');
                const newCourses = oldCourses.filter(course => course.id !== courseId);
                localStorage.setItem(this.COURSES_KEY, JSON.stringify(newCourses));

                const oldTopics = JSON.parse(localStorage.getItem(this.TOPICS_KEY) || '[]');
                const newTopics = oldTopics.filter(topic => topic.courseId !== courseId);
                localStorage.setItem(this.TOPICS_KEY, JSON.stringify(newTopics));

                console.log('DataManager: Curso eliminado también del sistema antiguo');
            } catch (oldSystemError) {
                console.warn('DataManager: Error al eliminar del sistema antiguo:', oldSystemError);
            }

            // 9. Sincronizar los cambios (sin descargar archivos)
            if (typeof DataPersistence !== 'undefined') {
                try {
                    DataPersistence.synchronizeData(true, false);
                    console.log('DataManager: Cambios sincronizados');
                } catch (syncError) {
                    console.warn('DataManager: Error al sincronizar cambios:', syncError);
                }
            }

            return courseDeleted;
        } catch (error) {
            console.error('DataManager: Error al eliminar curso:', error);
            return false;
        }
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
        console.log(`Buscando tema con ID: ${topicId}`);

        // Asegurarse de que topicId sea numérico para comparaciones consistentes
        if (typeof topicId === 'string' && !isNaN(topicId)) {
            topicId = parseInt(topicId);
            console.log(`ID convertido a número: ${topicId}`);
        }

        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            const topic = DataPersistence.getData('topics', topicId);
            if (topic) {
                console.log(`Tema encontrado en DataPersistence: ${topic.title}`);
                return topic;
            } else {
                console.log('Tema no encontrado en DataPersistence, buscando en array...');
            }
        }

        // Fallback al sistema antiguo o búsqueda adicional
        const topics = this.getTopics();
        const topic = topics.find(topic => topic.id === topicId || topic.id === parseInt(topicId));

        if (topic) {
            console.log(`Tema encontrado en array: ${topic.title}`);
        } else {
            console.warn(`No se encontró ningún tema con ID: ${topicId}`);
        }

        return topic;
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
        console.log(`DataManager: Eliminando tema con ID ${topicId}...`);

        // Asegurarse de que topicId sea numérico para comparaciones consistentes
        if (typeof topicId === 'string' && !isNaN(topicId)) {
            topicId = parseInt(topicId);
        }

        // Implementación simplificada que elimina directamente del localStorage
        try {
            // 1. Obtener los datos actuales
            const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
            if (!currentData.persistent) {
                currentData.persistent = { courses: {}, topics: {}, sections: {} };
            }

            // 2. Identificar secciones asociadas al tema
            const associatedSectionIds = [];

            // Buscar el tema y sus secciones
            let topicFound = false;
            if (currentData.persistent.topics && currentData.persistent.topics[topicId]) {
                topicFound = true;
                const topic = currentData.persistent.topics[topicId];

                // Buscar secciones asociadas
                if (topic.sections && Array.isArray(topic.sections)) {
                    topic.sections.forEach(section => {
                        if (section && section.id) {
                            associatedSectionIds.push(section.id);
                        }
                    });
                }
            }

            console.log(`DataManager: Encontradas ${associatedSectionIds.length} secciones asociadas al tema ${topicId}`);

            // 3. Eliminar secciones
            if (currentData.persistent.sections) {
                associatedSectionIds.forEach(sectionId => {
                    if (currentData.persistent.sections[sectionId]) {
                        delete currentData.persistent.sections[sectionId];
                        console.log(`DataManager: Sección ${sectionId} eliminada`);
                    }
                });
            }

            // 4. Eliminar tema
            if (topicFound && currentData.persistent.topics[topicId]) {
                delete currentData.persistent.topics[topicId];
                console.log(`DataManager: Tema ${topicId} eliminado`);
            }

            // 5. Limpiar referencias en unsynced
            if (currentData.unsynced) {
                const newUnsynced = {};

                Object.keys(currentData.unsynced).forEach(key => {
                    if (!key.includes(`topics_${topicId}`) &&
                        !associatedSectionIds.some(sectionId => key.includes(`sections_${sectionId}`))) {
                        newUnsynced[key] = currentData.unsynced[key];
                    } else {
                        console.log(`DataManager: Eliminada referencia en unsynced: ${key}`);
                    }
                });

                currentData.unsynced = newUnsynced;
            }

            // 6. Guardar los cambios en localStorage
            localStorage.setItem('courseData', JSON.stringify(currentData));
            console.log('DataManager: Cambios guardados en localStorage');

            // 7. Eliminar también del sistema antiguo (para compatibilidad)
            try {
                const oldTopics = JSON.parse(localStorage.getItem(this.TOPICS_KEY) || '[]');
                const newTopics = oldTopics.filter(topic => topic.id !== topicId);
                localStorage.setItem(this.TOPICS_KEY, JSON.stringify(newTopics));

                console.log('DataManager: Tema eliminado también del sistema antiguo');
            } catch (oldSystemError) {
                console.warn('DataManager: Error al eliminar del sistema antiguo:', oldSystemError);
            }

            // 8. Sincronizar los cambios (sin descargar archivos)
            if (typeof DataPersistence !== 'undefined') {
                try {
                    DataPersistence.synchronizeData(true, false);
                    console.log('DataManager: Cambios sincronizados');
                } catch (syncError) {
                    console.warn('DataManager: Error al sincronizar cambios:', syncError);
                }
            }

            return topicFound;
        } catch (error) {
            console.error('DataManager: Error al eliminar tema:', error);
            return false;
        }
    },

    // Obtener todas las secciones
    getAllSections() {
        // Extraer secciones de todos los temas
        const allSections = [];
        const topics = this.getTopics();

        console.log('Extrayendo secciones de', topics.length, 'temas');

        topics.forEach(topic => {
            if (topic.sections && Array.isArray(topic.sections) && topic.sections.length > 0) {
                console.log(`Tema ${topic.id} (${topic.title}) tiene ${topic.sections.length} secciones`);
                topic.sections.forEach(section => {
                    allSections.push({
                        ...section,
                        topicId: topic.id
                    });
                });
            } else {
                console.log(`Tema ${topic.id} (${topic.title}) no tiene secciones o tiene un formato incorrecto`);
                if (topic.sections) {
                    console.log('Tipo de sections:', typeof topic.sections, 'Es array:', Array.isArray(topic.sections));
                }
            }
        });

        console.log('Total de secciones encontradas:', allSections.length);
        return allSections;
    },

    // Obtener secciones por tema
    getSectionsByTopic(topicId) {
        const topic = this.getTopicById(topicId);
        if (!topic || !topic.sections) {
            return [];
        }
        return topic.sections;
    },

    // Obtener una sección por ID
    getSectionById(sectionId, topicId = null) {
        console.log(`Buscando sección con ID: ${sectionId}`);

        // Asegurarse de que sectionId sea numérico para comparaciones consistentes
        if (typeof sectionId === 'string' && !isNaN(sectionId)) {
            sectionId = parseInt(sectionId);
            console.log(`ID convertido a número: ${sectionId}`);
        }

        // Asegurarse de que topicId sea numérico para comparaciones consistentes
        if (topicId && typeof topicId === 'string' && !isNaN(topicId)) {
            topicId = parseInt(topicId);
            console.log(`Topic ID convertido a número: ${topicId}`);
        }

        // Usar el sistema de persistencia si está disponible
        if (typeof DataPersistence !== 'undefined') {
            const section = DataPersistence.getData('sections', sectionId);
            if (section) {
                console.log(`Sección encontrada en DataPersistence: ${section.title}`);
                // Si se proporciona un ID de tema, verificar que la sección pertenezca a ese tema
                if (topicId && section.topicId && section.topicId !== topicId) {
                    console.warn(`La sección ${sectionId} pertenece al tema ${section.topicId}, no al tema ${topicId}`);
                } else {
                    return section;
                }
            } else {
                console.log('Sección no encontrada en DataPersistence, buscando en temas...');
            }
        }

        // Si se proporciona un ID de tema, buscar solo en ese tema
        if (topicId) {
            const topic = this.getTopicById(topicId);
            if (topic && topic.sections && Array.isArray(topic.sections)) {
                console.log(`Buscando sección ${sectionId} en tema ${topicId} (${topic.title})`);
                console.log(`El tema tiene ${topic.sections.length} secciones`);

                // Imprimir todas las secciones para depuración
                topic.sections.forEach(s => {
                    console.log(`- Sección ID: ${s.id}, Título: ${s.title}`);
                });

                const section = topic.sections.find(s => {
                    const sectionIdNum = typeof s.id === 'string' ? parseInt(s.id) : s.id;
                    return sectionIdNum === sectionId;
                });

                if (section) {
                    console.log(`Sección encontrada en tema ${topicId}: ${section.title}`);
                    return section;
                }
            } else {
                console.warn(`Tema ${topicId} no encontrado o no tiene secciones`);
            }
        } else {
            // Buscar en todos los temas
            const topics = this.getTopics();
            console.log(`Buscando sección ${sectionId} en ${topics.length} temas`);

            for (const topic of topics) {
                if (topic.sections && Array.isArray(topic.sections)) {
                    const section = topic.sections.find(s => {
                        const sectionIdNum = typeof s.id === 'string' ? parseInt(s.id) : s.id;
                        return sectionIdNum === sectionId;
                    });

                    if (section) {
                        console.log(`Sección encontrada en tema ${topic.id}: ${section.title}`);
                        return section;
                    }
                }
            }
        }

        console.warn(`No se encontró ninguna sección con ID: ${sectionId}`);
        return null;
    },

    // Eliminar una sección
    deleteSection(sectionId, topicId) {
        console.log(`DataManager: Eliminando sección con ID ${sectionId} del tema ${topicId}...`);

        // Asegurarse de que los IDs sean numéricos para comparaciones consistentes
        if (typeof sectionId === 'string' && !isNaN(sectionId)) {
            sectionId = parseInt(sectionId);
        }
        if (typeof topicId === 'string' && !isNaN(topicId)) {
            topicId = parseInt(topicId);
        }

        // Implementación simplificada que elimina directamente del localStorage
        try {
            // 1. Obtener los datos actuales
            const currentData = JSON.parse(localStorage.getItem('courseData') || '{}');
            if (!currentData.persistent) {
                currentData.persistent = { courses: {}, topics: {}, sections: {} };
            }

            // 2. Verificar si la sección existe en el sistema de persistencia
            let sectionDeleted = false;
            if (currentData.persistent.sections && currentData.persistent.sections[sectionId]) {
                delete currentData.persistent.sections[sectionId];
                sectionDeleted = true;
                console.log(`DataManager: Sección ${sectionId} eliminada del sistema de persistencia`);
            }

            // 3. Eliminar la sección del tema
            let sectionRemovedFromTopic = false;
            if (topicId && currentData.persistent.topics && currentData.persistent.topics[topicId]) {
                const topic = currentData.persistent.topics[topicId];
                if (topic.sections && Array.isArray(topic.sections)) {
                    const originalLength = topic.sections.length;
                    topic.sections = topic.sections.filter(section => section.id != sectionId);

                    if (topic.sections.length < originalLength) {
                        sectionRemovedFromTopic = true;
                        console.log(`DataManager: Sección ${sectionId} eliminada del tema ${topicId}`);
                    }
                }
            } else {
                // Si no se proporciona topicId, buscar en todos los temas
                if (currentData.persistent.topics) {
                    Object.keys(currentData.persistent.topics).forEach(tid => {
                        const topic = currentData.persistent.topics[tid];
                        if (topic.sections && Array.isArray(topic.sections)) {
                            const originalLength = topic.sections.length;
                            topic.sections = topic.sections.filter(section => section.id != sectionId);

                            if (topic.sections.length < originalLength) {
                                sectionRemovedFromTopic = true;
                                console.log(`DataManager: Sección ${sectionId} eliminada del tema ${tid}`);
                            }
                        }
                    });
                }
            }

            // 4. Limpiar referencias en unsynced
            if (currentData.unsynced) {
                const newUnsynced = {};

                Object.keys(currentData.unsynced).forEach(key => {
                    if (!key.includes(`sections_${sectionId}`)) {
                        newUnsynced[key] = currentData.unsynced[key];
                    } else {
                        console.log(`DataManager: Eliminada referencia en unsynced: ${key}`);
                    }
                });

                currentData.unsynced = newUnsynced;
            }

            // 5. Guardar los cambios en localStorage
            localStorage.setItem('courseData', JSON.stringify(currentData));
            console.log('DataManager: Cambios guardados en localStorage');

            // 6. Sincronizar los cambios (sin descargar archivos)
            if (typeof DataPersistence !== 'undefined') {
                try {
                    DataPersistence.synchronizeData(true, false);
                    console.log('DataManager: Cambios sincronizados');
                } catch (syncError) {
                    console.warn('DataManager: Error al sincronizar cambios:', syncError);
                }
            }

            return sectionDeleted || sectionRemovedFromTopic;
        } catch (error) {
            console.error('DataManager: Error al eliminar sección:', error);
            return false;
        }
    },

    // Reiniciar todos los datos (volver a los datos de muestra)
    resetData() {
        if (confirm('¿Estás seguro de que deseas reiniciar todos los datos? Esta acción no se puede deshacer.')) {
            try {
                console.log('Reiniciando todos los datos...');

                // Crear copia de seguridad antes de reiniciar
                if (typeof DataPersistence !== 'undefined') {
                    DataPersistence.createDataBackup();
                    console.log('Copia de seguridad creada');
                }

                // Limpiar localStorage
                localStorage.removeItem('courseData');
                localStorage.removeItem(this.COURSES_KEY);
                localStorage.removeItem(this.TOPICS_KEY);
                console.log('Datos antiguos eliminados');

                // Inicializar estructura de datos
                const newData = {
                    persistent: {
                        courses: {},
                        topics: {},
                        sections: {}
                    },
                    unsynced: {}
                };

                // Agregar datos de muestra
                if (typeof SAMPLE_COURSES !== 'undefined' && Array.isArray(SAMPLE_COURSES)) {
                    SAMPLE_COURSES.forEach(course => {
                        newData.persistent.courses[course.id] = course;
                    });
                    console.log(`${SAMPLE_COURSES.length} cursos de muestra agregados`);
                }

                if (typeof SAMPLE_TOPICS !== 'undefined' && Array.isArray(SAMPLE_TOPICS)) {
                    SAMPLE_TOPICS.forEach(topic => {
                        newData.persistent.topics[topic.id] = topic;

                        // Guardar secciones individualmente
                        if (topic.sections && Array.isArray(topic.sections)) {
                            topic.sections.forEach(section => {
                                if (section.id) {
                                    newData.persistent.sections[section.id] = {
                                        ...section,
                                        topicId: topic.id
                                    };
                                }
                            });
                        }
                    });
                    console.log(`${SAMPLE_TOPICS.length} temas de muestra agregados`);
                }

                // Guardar en localStorage
                localStorage.setItem('courseData', JSON.stringify(newData));

                // Guardar también en el sistema antiguo para compatibilidad
                localStorage.setItem(this.COURSES_KEY, JSON.stringify(SAMPLE_COURSES || []));
                localStorage.setItem(this.TOPICS_KEY, JSON.stringify(SAMPLE_TOPICS || []));

                console.log('Datos reiniciados correctamente');
                alert('Datos reiniciados correctamente');

                // Recargar la página para aplicar los cambios
                window.location.reload();
                return true;
            } catch (error) {
                console.error('Error al reiniciar datos:', error);
                alert('Error al reiniciar datos: ' + error.message);
                return false;
            }
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
