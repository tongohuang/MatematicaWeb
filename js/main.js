// Los datos de muestra ahora se cargan desde sample-data.js

// Inicializar sistema de persistencia
async function initializeDataSystem() {
    // Verificar si el sistema de persistencia está disponible
    if (typeof DataPersistence !== 'undefined') {
        console.log('Inicializando sistema de persistencia...');
        console.log('URL actual:', window.location.href);
        console.log('Hostname:', window.location.hostname);
        console.log('Pathname:', window.location.pathname);

        // Determinar si estamos en producción (Netlify)
        const isProduction = window.location.hostname.includes('netlify.app') ||
                           window.location.hostname.includes('netlify.com');

        console.log('Entorno de producción (Netlify):', isProduction ? 'Sí' : 'No');

        // Inicializar sistema de sincronización con Netlify CMS si está disponible
        if (typeof NetlifyCMSSync !== 'undefined') {
            console.log('Inicializando sincronización con Netlify CMS...');
            await NetlifyCMSSync.init();
        }

        if (isProduction) {
            console.log('Entorno de producción detectado, forzando carga desde el repositorio...');
            // En producción, forzar la carga desde el repositorio
            try {
                await DataPersistence.init(true);
                console.log('Datos cargados correctamente desde el repositorio');
            } catch (error) {
                console.error('Error al cargar datos desde el repositorio:', error);
            }
        } else {
            // En desarrollo, usar exclusivamente localStorage
            console.log('Entorno de desarrollo detectado, usando exclusivamente localStorage...');
            try {
                await DataPersistence.init(false);
                console.log('Datos inicializados correctamente desde localStorage');
            } catch (error) {
                console.error('Error al inicializar datos:', error);
            }
        }

        // Verificar que se hayan cargado los datos correctamente
        if (typeof DataManager !== 'undefined') {
            const courses = DataManager.getCourses();
            const topics = DataManager.getTopics();
            console.log(`Datos cargados: ${courses.length} cursos, ${topics.length} temas`);

            // Verificar si hay datos en el sistema antiguo
            try {
                const oldCourses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
                const oldTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
                console.log(`Datos en sistema antiguo: ${oldCourses.length} cursos, ${oldTopics.length} temas`);
            } catch (error) {
                console.warn('Error al verificar datos del sistema antiguo:', error);
            }
        }
    } else {
        console.warn('Sistema de persistencia no disponible');
    }
}

// Cargar cursos destacados
function loadFeaturedCourses() {
    try {
        const coursesContainer = document.getElementById('featuredCourses');
        if (!coursesContainer) return;

        // Obtener los cursos usando DataManager si está disponible, o usar los datos de muestra
        let courses = (typeof DataManager !== 'undefined') ? DataManager.getCourses() : SAMPLE_COURSES;

        // Asegurarse de que todos los cursos tengan un campo 'order'
        courses.forEach((course, index) => {
            if (!course.hasOwnProperty('order') || course.order === undefined || course.order === null) {
                course.order = index + 1;
            }
        });

        // Ordenar cursos por el campo 'order'
        courses.sort((a, b) => a.order - b.order);

        if (courses.length === 0) {
            coursesContainer.innerHTML = '<p class="text-center">No hay cursos disponibles</p>';
            return;
        }

        coursesContainer.innerHTML = courses.map(course => {
            // Determinar si usar imagen o icono con color de fondo
            const hasImage = course.image && course.image.trim() !== '';

            // Obtener los temas del curso si DataManager está disponible
            let topicsCount = 0;
            let sectionsCount = 0;

            if (typeof DataManager !== 'undefined') {
                const topics = DataManager.getTopicsByCourse(course.id);
                topicsCount = topics.length;

                // Contar todas las secciones en todos los temas
                topics.forEach(topic => {
                    if (topic.sections) {
                        sectionsCount += topic.sections.length;
                    }
                });
            } else {
                // Usar los datos de muestra
                topicsCount = 0; // No hay temas en los datos de muestra
                sectionsCount = course.sections ? course.sections.length : 0;
            }

            return `
            <div class="course-card">
                <div class="course-header" style="background-color: ${course.color || '#6c757d'}">
                    ${hasImage ?
                        `<img src="${course.image}" alt="${course.title}" class="course-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                        ''
                    }
                    <div class="course-icon" ${hasImage ? 'style="display: none;"' : ''}>
                        <i class="${course.icon || 'fas fa-book'}"></i>
                    </div>
                </div>
                <div class="course-content">
                    <h3>${course.title}</h3>
                    <div class="description-container">
                        <p class="course-description">${course.description}</p>
                        <div class="course-description-tooltip">
                            <p>${course.description}</p>
                        </div>
                    </div>
                    <div class="course-stats">
                        <span><i class="fas fa-book"></i> ${topicsCount} temas</span>
                        <span><i class="fas fa-puzzle-piece"></i> ${sectionsCount} secciones</span>
                    </div>
                    <a href="courses/view.html?id=${course.id}" class="btn btn-primary mt-2">Ver curso</a>
                </div>
            </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar los cursos:', error);
        if (document.getElementById('featuredCourses')) {
            document.getElementById('featuredCourses').innerHTML = '<p class="text-center">Error al cargar los cursos</p>';
        }
    }
}

// Inicialización de elementos de la interfaz
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar tooltips de Bootstrap si están disponibles
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
});