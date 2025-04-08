/**
 * ¡IMPORTANTE! - ESTRUCTURA DE DATOS MATEMÁTICA WEB
 * -----------------------------------------------
 * - localStorage es la fuente principal para almacenamiento y recuperación de datos
 * - Los archivos JSON son solo para exportar datos al repositorio
 * - Cualquier modificación debe mantener esta estructura para garantizar la persistencia
 * - Ver docs/ESTRUCTURA_DE_DATOS.md para más información detallada
 */

// Variables globales
let currentCourseId = null;
let currentCourse = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si el usuario está autenticado y es administrador
    if (!auth.isAdmin()) {
        window.location.href = '../login.html';
        return;
    }

    // Inicializar sistema de persistencia antes de cargar los datos
    if (typeof initializeDataSystem === 'function') {
        console.log('Inicializando sistema de persistencia en course-editor.js...');
        await initializeDataSystem();
    }

    // Obtener el ID del curso de la URL (si existe)
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = parseInt(urlParams.get('id'));

    if (courseId) {
        // Cargar el curso existente
        loadCourse(courseId);
    } else {
        // Preparar para crear un nuevo curso
        setupNewCourse();
    }

    // Configurar eventos
    setupEventListeners();
});

function loadCourse(courseId) {
    console.log(`Cargando curso con ID: ${courseId}`);

    // CARGAR DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    try {
        // 1. Obtener todos los cursos de localStorage
        const allCourses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
        console.log(`Cursos encontrados en localStorage: ${allCourses.length}`);

        // 2. Buscar el curso por ID
        currentCourse = allCourses.find(c => c.id == courseId);
        console.log('Curso encontrado:', currentCourse);

        // 3. Si no se encuentra, intentar con DataManager como fallback
        if (!currentCourse && typeof DataManager !== 'undefined') {
            console.log('Curso no encontrado en localStorage, intentando con DataManager...');
            currentCourse = DataManager.getCourseById(courseId);
        }
    } catch (error) {
        console.error('Error al cargar curso desde localStorage:', error);
        // Intentar con DataManager como fallback
        if (typeof DataManager !== 'undefined') {
            currentCourse = DataManager.getCourseById(courseId);
        }
    }

    if (!currentCourse) {
        console.error(`No se encontró el curso con ID ${courseId}`);
        alert('Curso no encontrado');
        window.location.href = 'index.html';
        return;
    }

    currentCourseId = courseId;

    // Cargar la información del curso en el formulario
    document.getElementById('courseTitleInput').value = currentCourse.title;
    document.getElementById('courseDescriptionInput').value = currentCourse.description;
    document.getElementById('courseColorInput').value = currentCourse.color ? currentCourse.color.replace('#', '') : '';
    document.getElementById('courseIconInput').value = currentCourse.icon || '';

    // Actualizar el título
    document.getElementById('courseTitle').textContent = currentCourse.title;

    // Cargar la estructura del curso
    loadCourseStructure();

    // Cargar los temas
    loadTopics();

    // Actualizar la vista previa
    updatePreview();
}

function setupNewCourse() {
    // Preparar para crear un nuevo curso
    currentCourse = {
        id: null,
        title: 'Nuevo Curso',
        description: '',
        color: '#4CAF50',
        icon: 'fas fa-book'
    };

    // Actualizar el título
    document.getElementById('courseTitle').textContent = 'Nuevo Curso';

    // Mostrar mensaje en la estructura del curso
    document.getElementById('courseStructure').innerHTML = `
        <div class="text-center py-5 text-muted">
            <i class="fas fa-info-circle fa-3x mb-3"></i>
            <p>Guarde el curso para comenzar a agregar temas.</p>
        </div>
    `;

    // Mostrar mensaje en la lista de temas
    document.getElementById('topicsList').innerHTML = `
        <div class="text-center py-5 text-muted">
            <i class="fas fa-info-circle fa-3x mb-3"></i>
            <p>Guarde el curso para comenzar a agregar temas.</p>
        </div>
    `;

    // Actualizar la vista previa
    updatePreview();
}

function setupEventListeners() {
    // Evento para guardar el curso
    const courseForm = document.getElementById('courseForm');
    if (courseForm) {
        console.log('Configurando evento submit para el formulario de curso');
        courseForm.addEventListener('submit', saveCourse);
    } else {
        console.error('No se encontró el formulario de curso');
    }

    // Eventos para actualizar la vista previa en tiempo real
    document.getElementById('courseTitleInput')?.addEventListener('input', updatePreview);
    document.getElementById('courseDescriptionInput')?.addEventListener('input', updatePreview);
    document.getElementById('courseColorInput')?.addEventListener('input', updatePreview);
    document.getElementById('courseIconInput')?.addEventListener('input', updatePreview);
    document.getElementById('courseImageInput')?.addEventListener('change', handleImageUpload);

    // Evento para agregar un tema
    document.getElementById('addTopicBtn').addEventListener('click', () => {
        if (!currentCourseId) {
            alert('Guarde el curso primero para poder agregar temas.');
            return;
        }

        window.location.href = `topic-editor.html?courseId=${currentCourseId}`;
    });
}

function saveCourse(event) {
    event.preventDefault();
    console.log('Guardando curso...');

    // Obtener los valores del formulario
    const title = document.getElementById('courseTitleInput').value;
    const description = document.getElementById('courseDescriptionInput').value;
    const color = document.getElementById('courseColorInput').value ? `#${document.getElementById('courseColorInput').value}` : '#4CAF50';
    const icon = document.getElementById('courseIconInput').value || 'fas fa-book';

    if (!title || !description) {
        alert('Por favor complete todos los campos requeridos.');
        return;
    }

    // Actualizar el objeto del curso
    currentCourse.title = title;
    currentCourse.description = description;
    currentCourse.color = color;
    currentCourse.icon = icon;

    // Si es un nuevo curso, generar un ID
    if (!currentCourse.id) {
        // OBTENER DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
        let courses = [];
        try {
            // 1. Obtener todos los cursos de localStorage
            courses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
            console.log(`Cursos existentes en localStorage: ${courses.length}`);
        } catch (error) {
            console.error('Error al cargar cursos desde localStorage:', error);
            // Intentar con DataManager como fallback
            if (typeof DataManager !== 'undefined') {
                courses = DataManager.getCourses();
            }
        }

        // Generar un nuevo ID
        currentCourse.id = courses.length > 0 ? Math.max(...courses.map(c => parseInt(c.id) || 0)) + 1 : 1;
        console.log(`Nuevo ID generado: ${currentCourse.id}`);
    }

    // GUARDAR DIRECTAMENTE EN LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    try {
        console.log('Guardando curso directamente en localStorage...');

        // 1. Obtener todos los cursos actuales
        const allCourses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
        console.log(`Cursos existentes en localStorage: ${allCourses.length}`);

        // 2. Encontrar y actualizar el curso actual
        const courseIndex = allCourses.findIndex(c => c.id == currentCourse.id);

        if (courseIndex !== -1) {
            // Actualizar curso existente
            allCourses[courseIndex] = currentCourse;
            console.log(`Curso actualizado en índice ${courseIndex}`);
        } else {
            // Agregar nuevo curso
            allCourses.push(currentCourse);
            console.log('Nuevo curso agregado a la lista');
        }

        // 3. Guardar todos los cursos de vuelta en localStorage
        localStorage.setItem('matematicaweb_courses', JSON.stringify(allCourses));
        console.log('Cursos guardados en localStorage');

        // 4. Verificar que se haya guardado correctamente
        const savedCourses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
        const savedCourse = savedCourses.find(c => c.id == currentCourse.id);

        if (savedCourse) {
            console.log(`Verificación: Curso encontrado en localStorage`);
        } else {
            console.error('Verificación fallida: No se encontró el curso en localStorage después de guardar');
        }

        // 5. Guardar también en DataManager si está disponible (para compatibilidad)
        if (typeof DataManager !== 'undefined') {
            try {
                DataManager.saveCourse(currentCourse);
                console.log('Curso guardado también en DataManager');
            } catch (dmError) {
                console.warn('Error al guardar en DataManager:', dmError);
            }
        }
    } catch (error) {
        console.error('Error al guardar curso en localStorage:', error);
        alert('Error al guardar los cambios. Por favor, intente nuevamente.');
        return;
    }

    // Actualizar la URL si es un nuevo curso
    if (!currentCourseId) {
        window.history.replaceState(null, '', `?id=${currentCourse.id}`);
        currentCourseId = currentCourse.id;
    }

    // Actualizar la interfaz
    document.getElementById('courseTitle').textContent = currentCourse.title;

    // Mostrar mensaje de éxito
    alert('Curso guardado correctamente.');

    // Recargar la estructura del curso
    loadCourseStructure();
}

function loadCourseStructure() {
    console.log('Cargando estructura del curso...');
    const courseStructure = document.getElementById('courseStructure');

    // CARGAR DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    let topics = [];
    try {
        console.log('Cargando temas directamente desde localStorage...');

        // 1. Obtener todos los temas de localStorage
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Temas encontrados en localStorage: ${allTopics.length}`);

        // 2. Filtrar los temas por curso
        topics = allTopics.filter(topic => topic.courseId == currentCourseId);
        console.log(`Temas filtrados para el curso ${currentCourseId}: ${topics.length}`);
    } catch (error) {
        console.error('Error al cargar temas desde localStorage:', error);
        // Intentar con DataManager como fallback
        if (typeof DataManager !== 'undefined') {
            console.log('Intentando cargar temas con DataManager...');
            topics = DataManager.getTopicsByCourse(currentCourseId);
        }
    }

    if (topics.length === 0) {
        courseStructure.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-info-circle fa-3x mb-3"></i>
                <p>Este curso no tiene temas. ¡Agrega el primero!</p>
            </div>
        `;
        return;
    }

    // Construir el árbol de estructura
    let html = '';

    topics.forEach(topic => {
        const sectionCount = topic.sections ? topic.sections.length : 0;

        html += `
            <div class="tree-item">
                <div class="tree-item-header">
                    <div class="tree-item-icon">
                        <i class="${topic.icon || 'fas fa-book'}"></i>
                    </div>
                    <div class="tree-item-title">${topic.title}</div>
                    <div class="tree-item-actions">
                        <a href="topic-editor.html?courseId=${currentCourseId}" class="tree-item-action">
                            <i class="fas fa-edit"></i>
                        </a>
                    </div>
                </div>
                ${sectionCount > 0 ? `
                <div class="tree-children">
                    ${topic.sections.map(section => `
                        <div class="tree-item">
                            <div class="tree-item-header">
                                <div class="tree-item-icon">
                                    <i class="${getSectionIcon(section.type)}"></i>
                                </div>
                                <div class="tree-item-title">${section.title}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    });

    courseStructure.innerHTML = html;
}

function loadTopics() {
    console.log('Cargando temas del curso...');
    const topicsList = document.getElementById('topicsList');

    // CARGAR DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    let topics = [];
    try {
        console.log('Cargando temas directamente desde localStorage...');

        // 1. Obtener todos los temas de localStorage
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Temas encontrados en localStorage: ${allTopics.length}`);

        // 2. Filtrar los temas por curso
        topics = allTopics.filter(topic => topic.courseId == currentCourseId);
        console.log(`Temas filtrados para el curso ${currentCourseId}: ${topics.length}`);
    } catch (error) {
        console.error('Error al cargar temas desde localStorage:', error);
        // Intentar con DataManager como fallback
        if (typeof DataManager !== 'undefined') {
            console.log('Intentando cargar temas con DataManager...');
            topics = DataManager.getTopicsByCourse(currentCourseId);
        }
    }

    if (topics.length === 0) {
        topicsList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-info-circle fa-3x mb-3"></i>
                <p>Este curso no tiene temas. ¡Agrega el primero!</p>
            </div>
        `;
        return;
    }

    // Mostrar los temas
    topicsList.innerHTML = topics.map(topic => {
        const sectionCount = topic.sections ? topic.sections.length : 0;

        return `
            <div class="topic-card">
                <div class="topic-header">
                    <div class="topic-icon">
                        <i class="${topic.icon || 'fas fa-book'}"></i>
                    </div>
                    <h4 class="topic-title">${topic.title}</h4>
                </div>
                <div class="topic-content">
                    <p class="topic-description">${topic.description}</p>
                    <div class="topic-stats">
                        <span><i class="fas fa-puzzle-piece"></i> ${sectionCount} secciones</span>
                    </div>
                    <div class="topic-actions">
                        <a href="topic-editor.html?courseId=${currentCourseId}" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Editar
                        </a>
                        <a href="section-editor.html?topicId=${topic.id}" class="btn btn-sm btn-info">
                            <i class="fas fa-list"></i> Secciones
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updatePreview() {
    // Obtener los valores actuales
    const title = document.getElementById('courseTitleInput').value || 'Título del Curso';
    const description = document.getElementById('courseDescriptionInput').value || 'Descripción del curso';
    const color = document.getElementById('courseColorInput').value ? `#${document.getElementById('courseColorInput').value}` : '#4CAF50';
    const icon = document.getElementById('courseIconInput').value || 'fas fa-book';

    // Actualizar la vista previa
    document.getElementById('previewCourseTitle').textContent = title;
    document.getElementById('previewCourseDescription').textContent = description;

    // Obtener los temas del curso
    let topicsHtml = '';

    if (currentCourseId) {
        const topics = DataManager.getTopicsByCourse(currentCourseId);

        if (topics.length > 0) {
            topicsHtml = topics.map(topic => {
                const sectionCount = topic.sections ? topic.sections.length : 0;

                return `
                    <div class="topic-preview">
                        <div class="topic-preview-header">
                            <div class="topic-preview-icon">
                                <i class="${topic.icon || 'fas fa-book'}"></i>
                            </div>
                            <h3 class="topic-preview-title">${topic.title}</h3>
                        </div>
                        <p>${topic.description}</p>
                        <div class="sections-preview">
                            ${sectionCount > 0 ? topic.sections.map(section => `
                                <div class="section-preview">
                                    <div class="section-preview-header">
                                        <div class="section-preview-icon">
                                            <i class="${getSectionIcon(section.type)}"></i>
                                        </div>
                                        <h4 class="section-preview-title">${section.title}</h4>
                                    </div>
                                </div>
                            `).join('') : '<p class="text-muted">Este tema no tiene secciones.</p>'}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            topicsHtml = '<p class="text-center text-muted">Este curso no tiene temas.</p>';
        }
    } else {
        topicsHtml = '<p class="text-center text-muted">Guarde el curso para ver los temas.</p>';
    }

    document.getElementById('previewTopics').innerHTML = topicsHtml;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // En una aplicación real, aquí se subiría la imagen al servidor
            // Para esta demo, simplemente mostramos la vista previa
            alert('En una aplicación real, la imagen se subiría al servidor.');
        };
        reader.readAsDataURL(file);
    }
}

function getSectionIcon(type) {
    switch (type) {
        case 'text':
            return 'fas fa-align-left';
        case 'youtube':
            return 'fab fa-youtube';
        case 'geogebra':
            return 'fas fa-calculator';
        case 'image':
            return 'fas fa-image';
        case 'pdf':
            return 'fas fa-file-pdf';
        case 'activity':
            return 'fas fa-tasks';
        default:
            return 'fas fa-file';
    }
}
