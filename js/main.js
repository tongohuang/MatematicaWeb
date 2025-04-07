// Los datos de muestra ahora se cargan desde sample-data.js

// Inicializar sistema de persistencia
async function initializeDataSystem() {
    // Verificar si el sistema de persistencia está disponible
    if (typeof DataPersistence !== 'undefined') {
        console.log('Inicializando sistema de persistencia...');

        // Determinar si estamos en producción (Netlify)
        const isProduction = window.location.hostname.includes('netlify.app');

        if (isProduction) {
            console.log('Entorno de producción detectado, forzando carga desde el repositorio...');
            // En producción, forzar la carga desde el repositorio
            await DataPersistence.init(true);
        } else {
            // En desarrollo, comportamiento normal
            await DataPersistence.init();
        }
    }
}

// Cargar cursos destacados
function loadFeaturedCourses() {
    try {
        const coursesContainer = document.getElementById('featuredCourses');
        if (!coursesContainer) return;

        // Obtener los cursos usando DataManager si está disponible, o usar los datos de muestra
        const courses = (typeof DataManager !== 'undefined') ? DataManager.getCourses() : SAMPLE_COURSES;

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
                    <p>${course.description}</p>
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