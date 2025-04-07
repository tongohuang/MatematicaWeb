// Los datos de muestra ahora se cargan desde sample-data.js

document.addEventListener('DOMContentLoaded', async () => {
    loadComponent('header', '../components/header.html');
    loadComponent('footer', '../components/footer.html');

    // Verificar si el usuario está autenticado y es administrador
    if (!auth.isAdmin()) {
        window.location.href = '../login.html';
        return;
    }

    // Inicializar sistema de persistencia antes de cargar los datos
    if (typeof initializeDataSystem === 'function') {
        console.log('Inicializando sistema de persistencia en topic-editor.js...');
        await initializeDataSystem();
    }

    // Cargar cursos en el selector
    loadCourses();

    // Verificar si hay un curso seleccionado en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    if (courseId) {
        document.getElementById('courseSelector').value = courseId;
        loadTopics();
    }
});

function loadCourses() {
    console.log('Cargando cursos...');
    const courseSelector = document.getElementById('courseSelector');
    if (!courseSelector) {
        console.error('No se encontró el selector de cursos');
        return;
    }

    courseSelector.innerHTML = '<option value="">Seleccione un curso...</option>';

    // Usar DataManager para obtener los cursos
    const courses = DataManager.getCourses();
    console.log('Cursos obtenidos:', courses);

    if (courses.length === 0) {
        console.warn('No hay cursos disponibles');
        courseSelector.innerHTML += '<option value="" disabled>No hay cursos disponibles</option>';
        return;
    }

    courses.forEach(course => {
        console.log('Agregando curso:', course.title);
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.title;
        courseSelector.appendChild(option);
    });
}

function loadTopics() {
    const courseId = parseInt(document.getElementById('courseSelector').value);
    const topicsList = document.getElementById('topicsList');

    if (!courseId) {
        topicsList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-book fa-3x mb-3"></i>
                <p>Seleccione un curso para ver sus temas</p>
            </div>
        `;
        return;
    }

    // Usar DataManager para obtener los temas del curso
    const topics = DataManager.getTopicsByCourse(courseId);

    if (topics.length === 0) {
        topicsList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-info-circle fa-3x mb-3"></i>
                <p>Este curso no tiene temas. ¡Crea el primero!</p>
            </div>
        `;
        return;
    }

    topicsList.innerHTML = topics.map(topic => `
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
                    <span><i class="fas fa-puzzle-piece"></i> ${topic.sections ? topic.sections.length : 0} secciones</span>
                </div>
                <div class="topic-actions">
                    <button class="btn btn-sm btn-primary" onclick="editTopic(${topic.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-info" onclick="manageSections(${topic.id})">
                        <i class="fas fa-list"></i> Secciones
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTopic(${topic.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function editTopic(topicId) {
    // Usar DataManager para obtener el tema
    const topic = DataManager.getTopicById(topicId);
    if (!topic) return;

    document.getElementById('topicId').value = topic.id;
    document.getElementById('topicTitle').value = topic.title;
    document.getElementById('topicDescription').value = topic.description;
    document.getElementById('topicIcon').value = topic.icon || '';

    document.getElementById('topicModalLabel').textContent = 'Editar Tema';
    const topicModal = new bootstrap.Modal(document.getElementById('topicModal'));
    topicModal.show();
}

function saveTopic() {
    const topicId = document.getElementById('topicId').value;
    const courseId = parseInt(document.getElementById('courseSelector').value);
    const title = document.getElementById('topicTitle').value;
    const description = document.getElementById('topicDescription').value;
    const icon = document.getElementById('topicIcon').value;

    if (!title || !description) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    if (!courseId) {
        alert('Por favor selecciona un curso');
        return;
    }

    let topic;

    if (topicId) {
        // Editar tema existente
        topic = DataManager.getTopicById(parseInt(topicId));
        if (topic) {
            topic.title = title;
            topic.description = description;
            topic.icon = icon || 'fas fa-book';
        }
    } else {
        // Crear nuevo tema
        const topics = DataManager.getTopics();
        const newId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 101;

        topic = {
            id: newId,
            courseId: courseId,
            title: title,
            description: description,
            icon: icon || 'fas fa-book',
            sections: []
        };
    }

    // Guardar el tema usando DataManager
    DataManager.saveTopic(topic);

    // Cerrar el modal
    const topicModal = bootstrap.Modal.getInstance(document.getElementById('topicModal'));
    topicModal.hide();

    // Limpiar el formulario
    document.getElementById('topicForm').reset();
    document.getElementById('topicId').value = '';

    // Recargar la lista de temas
    loadTopics();

    // Mostrar mensaje de éxito
    alert('Tema guardado correctamente');
}

function deleteTopic(topicId) {
    if (confirm('¿Estás seguro de que deseas eliminar este tema?')) {
        // Eliminar el tema usando DataManager
        DataManager.deleteTopic(topicId);

        // Recargar la lista de temas
        loadTopics();

        // Mostrar mensaje de éxito
        alert('Tema eliminado correctamente');
    }
}

function manageSections(topicId) {
    // Redirigir a la página de gestión de secciones
    window.location.href = `section-editor.html?topicId=${topicId}`;
}
