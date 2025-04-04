// Variables globales
let currentCourseId = null;
let currentCourse = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario está autenticado y es administrador
    if (!auth.isAdmin()) {
        window.location.href = '../login.html';
        return;
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
    // Obtener el curso usando DataManager
    currentCourse = DataManager.getCourseById(courseId);

    if (!currentCourse) {
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
        const courses = DataManager.getCourses();
        currentCourse.id = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    }

    // Guardar el curso usando DataManager
    DataManager.saveCourse(currentCourse);

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
    const courseStructure = document.getElementById('courseStructure');

    // Obtener los temas del curso
    const topics = DataManager.getTopicsByCourse(currentCourseId);

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
    const topicsList = document.getElementById('topicsList');

    // Obtener los temas del curso
    const topics = DataManager.getTopicsByCourse(currentCourseId);

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
