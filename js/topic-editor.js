/**
 * ¡IMPORTANTE! - ESTRUCTURA DE DATOS MATEMÁTICA WEB
 * -----------------------------------------------
 * - localStorage es la fuente principal para almacenamiento y recuperación de datos
 * - Los archivos JSON son solo para exportar datos al repositorio
 * - Cualquier modificación debe mantener esta estructura para garantizar la persistencia
 * - Ver docs/ESTRUCTURA_DE_DATOS.md para más información detallada
 */

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
    console.log('Cargando temas...');
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

    // CARGAR DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    let topics = [];
    try {
        console.log('Cargando temas directamente desde localStorage...');

        // 1. Obtener todos los temas de localStorage
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Temas encontrados en localStorage: ${allTopics.length}`);

        // 2. Filtrar los temas por curso
        topics = allTopics.filter(topic => topic.courseId == courseId);
        console.log(`Temas filtrados para el curso ${courseId}: ${topics.length}`);
    } catch (error) {
        console.error('Error al cargar temas desde localStorage:', error);
        // Intentar con DataManager como fallback
        if (typeof DataManager !== 'undefined') {
            console.log('Intentando cargar temas con DataManager...');
            topics = DataManager.getTopicsByCourse(courseId);
        }
    }

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
    console.log(`Editando tema con ID: ${topicId}`);

    // CARGAR DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    let topic = null;
    try {
        // 1. Obtener todos los temas de localStorage
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Temas encontrados en localStorage: ${allTopics.length}`);

        // 2. Buscar el tema por ID
        topic = allTopics.find(t => t.id == topicId);
        console.log('Tema encontrado:', topic);

        // 3. Si no se encuentra, intentar con DataManager como fallback
        if (!topic && typeof DataManager !== 'undefined') {
            console.log('Tema no encontrado en localStorage, intentando con DataManager...');
            topic = DataManager.getTopicById(topicId);
        }
    } catch (error) {
        console.error('Error al cargar tema desde localStorage:', error);
        // Intentar con DataManager como fallback
        if (typeof DataManager !== 'undefined') {
            topic = DataManager.getTopicById(topicId);
        }
    }

    if (!topic) {
        console.error(`No se encontró el tema con ID ${topicId}`);
        alert('Error: No se pudo encontrar el tema para editar.');
        return;
    }

    // Establecer los valores en el formulario
    document.getElementById('topicId').value = topic.id;
    document.getElementById('topicTitle').value = topic.title;
    document.getElementById('topicDescription').value = topic.description;
    document.getElementById('topicIcon').value = topic.icon || '';

    document.getElementById('topicModalLabel').textContent = 'Editar Tema';
    const topicModal = new bootstrap.Modal(document.getElementById('topicModal'));
    topicModal.show();
}

function saveTopic() {
    console.log('Guardando tema...');

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
        console.log(`Editando tema existente con ID: ${topicId}`);

        // CARGAR DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
        try {
            // 1. Obtener todos los temas de localStorage
            const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
            console.log(`Temas encontrados en localStorage: ${allTopics.length}`);

            // 2. Buscar el tema por ID
            topic = allTopics.find(t => t.id == topicId);

            // 3. Si no se encuentra, intentar con DataManager como fallback
            if (!topic && typeof DataManager !== 'undefined') {
                console.log('Tema no encontrado en localStorage, intentando con DataManager...');
                topic = DataManager.getTopicById(parseInt(topicId));
            }
        } catch (error) {
            console.error('Error al cargar tema desde localStorage:', error);
            // Intentar con DataManager como fallback
            if (typeof DataManager !== 'undefined') {
                topic = DataManager.getTopicById(parseInt(topicId));
            }
        }

        if (topic) {
            console.log('Tema encontrado, actualizando propiedades...');
            topic.title = title;
            topic.description = description;
            topic.icon = icon || 'fas fa-book';
        } else {
            console.error(`No se encontró el tema con ID ${topicId}`);
            alert('Error: No se pudo encontrar el tema para editar.');
            return;
        }
    } else {
        // Crear nuevo tema
        console.log('Creando nuevo tema...');

        // Obtener todos los temas para generar un nuevo ID
        let topics = [];
        try {
            // 1. Obtener todos los temas de localStorage
            topics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        } catch (error) {
            console.error('Error al cargar temas desde localStorage:', error);
            // Intentar con DataManager como fallback
            if (typeof DataManager !== 'undefined') {
                topics = DataManager.getTopics();
            }
        }

        const newId = topics.length > 0 ? Math.max(...topics.map(t => parseInt(t.id) || 0)) + 1 : 101;
        console.log(`Nuevo ID generado: ${newId}`);

        topic = {
            id: newId,
            courseId: courseId,
            title: title,
            description: description,
            icon: icon || 'fas fa-book',
            sections: []
        };
    }

    // GUARDAR DIRECTAMENTE EN LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    try {
        console.log('Guardando tema directamente en localStorage...');

        // 1. Obtener todos los temas actuales
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Temas existentes en localStorage: ${allTopics.length}`);

        // 2. Encontrar y actualizar el tema actual
        const topicIndex = allTopics.findIndex(t => t.id == topic.id);

        if (topicIndex !== -1) {
            // Actualizar tema existente
            allTopics[topicIndex] = topic;
            console.log(`Tema actualizado en índice ${topicIndex}`);
        } else {
            // Agregar nuevo tema
            allTopics.push(topic);
            console.log('Nuevo tema agregado a la lista');
        }

        // 3. Guardar todos los temas de vuelta en localStorage
        localStorage.setItem('matematicaweb_topics', JSON.stringify(allTopics));
        console.log('Temas guardados en localStorage');

        // 4. Verificar que se haya guardado correctamente
        const savedTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        const savedTopic = savedTopics.find(t => t.id == topic.id);

        if (savedTopic) {
            console.log(`Verificación: Tema encontrado en localStorage`);
        } else {
            console.error('Verificación fallida: No se encontró el tema en localStorage después de guardar');
        }

        // 5. Guardar también en DataManager si está disponible (para compatibilidad)
        if (typeof DataManager !== 'undefined') {
            try {
                DataManager.saveTopic(topic);
                console.log('Tema guardado también en DataManager');
            } catch (dmError) {
                console.warn('Error al guardar en DataManager:', dmError);
            }
        }
    } catch (error) {
        console.error('Error al guardar tema en localStorage:', error);
        alert('Error al guardar los cambios. Por favor, intente nuevamente.');
        return;
    }

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
    console.log(`Eliminando tema con ID: ${topicId}`);

    if (confirm('¿Estás seguro de que deseas eliminar este tema?')) {
        // ELIMINAR DIRECTAMENTE DE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
        try {
            console.log('Eliminando tema directamente de localStorage...');

            // 1. Obtener todos los temas actuales
            const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
            console.log(`Temas existentes en localStorage: ${allTopics.length}`);

            // 2. Encontrar el índice del tema a eliminar
            const topicIndex = allTopics.findIndex(t => t.id == topicId);

            if (topicIndex !== -1) {
                // Guardar una referencia al tema que se va a eliminar (para registro)
                const topicToDelete = allTopics[topicIndex];
                console.log('Tema a eliminar:', topicToDelete);

                // Eliminar el tema del array
                allTopics.splice(topicIndex, 1);
                console.log(`Tema eliminado del array. Quedan ${allTopics.length} temas`);

                // 3. Guardar todos los temas de vuelta en localStorage
                localStorage.setItem('matematicaweb_topics', JSON.stringify(allTopics));
                console.log('Temas guardados en localStorage después de eliminar');

                // 4. Verificar que se haya eliminado correctamente
                const savedTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
                const stillExists = savedTopics.some(t => t.id == topicId);

                if (!stillExists) {
                    console.log(`Verificación: Tema eliminado correctamente de localStorage`);
                } else {
                    console.error('Verificación fallida: El tema sigue existiendo en localStorage después de eliminar');
                }
            } else {
                console.error(`No se encontró el tema con ID ${topicId} en localStorage`);
            }

            // 5. Eliminar también en DataManager si está disponible (para compatibilidad)
            if (typeof DataManager !== 'undefined') {
                try {
                    DataManager.deleteTopic(topicId);
                    console.log('Tema eliminado también en DataManager');
                } catch (dmError) {
                    console.warn('Error al eliminar en DataManager:', dmError);
                }
            }

            // Recargar la lista de temas
            loadTopics();

            // Mostrar mensaje de éxito
            alert('Tema eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar tema de localStorage:', error);
            alert('Error al eliminar el tema. Por favor, intente nuevamente.');
        }
    }
}

function manageSections(topicId) {
    // Redirigir a la página de gestión de secciones
    window.location.href = `section-editor.html?topicId=${topicId}`;
}
