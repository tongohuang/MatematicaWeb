// Datos de ejemplo para actividades
const SAMPLE_ACTIVITIES = [
    {
        id: 1,
        title: "Suma Básica",
        type: "multiple-choice",
        description: "Practica operaciones de suma con números del 1 al 10",
        filename: "suma_basica.html"
    },
    {
        id: 2,
        title: "Resta Básica",
        type: "multiple-choice",
        description: "Practica operaciones de resta con números del 1 al 10",
        filename: "resta_basica.html"
    },
    {
        id: 3,
        title: "Multiplicación",
        type: "multiple-choice",
        description: "Practica las tablas de multiplicar",
        filename: "multiplicacion.html"
    },
    {
        id: 4,
        title: "Verdadero o Falso: Geometría",
        type: "true-false",
        description: "Evalúa tus conocimientos sobre figuras geométricas",
        filename: "verdadero_falso_geometria.html"
    },
    {
        id: 5,
        title: "Respuesta Corta: Álgebra",
        type: "short-answer",
        description: "Resuelve ecuaciones algebraicas simples",
        filename: "respuesta_corta_algebra.html"
    }
];

// Variables globales
let currentTopicId = null;
let currentTopic = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario está autenticado y es administrador
    if (!auth.isAdmin()) {
        window.location.href = '../login.html';
        return;
    }

    // Obtener el ID del tema de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = parseInt(urlParams.get('topicId'));

    if (!topicId) {
        // Si no hay ID de tema, redirigir a la página de temas
        window.location.href = 'topic-editor.html';
        return;
    }

    // Guardar el ID del tema actual
    currentTopicId = topicId;

    // Cargar la información del tema
    loadTopicInfo();

    // Cargar las secciones del tema
    loadSections();
});

function loadTopicInfo() {
    // Buscar el tema usando DataManager
    currentTopic = DataManager.getTopicById(currentTopicId);

    if (!currentTopic) {
        // Si no se encuentra el tema, mostrar un mensaje de error
        document.getElementById('topicTitle').textContent = 'Tema no encontrado';
        document.getElementById('topicDescription').textContent = 'El tema solicitado no existe.';
        return;
    }

    // Mostrar la información del tema
    document.getElementById('topicTitle').textContent = currentTopic.title;
    document.getElementById('topicDescription').textContent = currentTopic.description;
}

function loadSections() {
    const sectionsList = document.getElementById('sectionsList');

    if (!currentTopic || !currentTopic.sections || currentTopic.sections.length === 0) {
        // Si no hay secciones, mostrar un mensaje
        sectionsList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-info-circle fa-3x mb-3"></i>
                <p>Este tema no tiene secciones. ¡Crea la primera!</p>
            </div>
        `;
        return;
    }

    // Mostrar las secciones
    sectionsList.innerHTML = currentTopic.sections.map((section, index) => {
        // Determinar si es la primera o última sección para los botones de mover
        const isFirst = index === 0;
        const isLast = index === currentTopic.sections.length - 1;

        // Obtener una vista previa del contenido según el tipo
        let contentPreview = '';
        switch (section.type) {
            case 'text':
                // Mostrar solo los primeros 50 caracteres del texto
                contentPreview = `<div class="section-content-preview text-muted">${section.content.substring(0, 50)}${section.content.length > 50 ? '...' : ''}</div>`;
                break;
            case 'youtube':
                contentPreview = `<div class="section-content-preview"><i class="fab fa-youtube text-danger"></i> Video ID: ${section.content}</div>`;
                break;
            case 'geogebra':
                contentPreview = `<div class="section-content-preview"><i class="fas fa-calculator text-primary"></i> Applet ID: ${section.content}</div>`;
                break;
            case 'image':
                contentPreview = `<div class="section-content-preview"><i class="fas fa-image text-success"></i> Imagen</div>`;
                break;
            case 'pdf':
                contentPreview = `<div class="section-content-preview"><i class="fas fa-file-pdf text-danger"></i> Archivo PDF</div>`;
                break;
            case 'activity':
                contentPreview = `<div class="section-content-preview"><i class="fas fa-tasks text-warning"></i> Actividad ID: ${section.content}</div>`;
                break;
        }

        return `
        <div class="section-item section-type-${section.type}">
            <div class="section-header">
                <div class="section-type-icon">
                    <i class="${getSectionIcon(section.type)}"></i>
                </div>
                <div class="section-title">${section.title}</div>
                <div class="section-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="editSection(${section.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${!isFirst ? `
                    <button class="btn btn-sm btn-outline-secondary" onclick="moveSection(${section.id}, 'up')">
                        <i class="fas fa-arrow-up"></i>
                    </button>` : ''}
                    ${!isLast ? `
                    <button class="btn btn-sm btn-outline-secondary" onclick="moveSection(${section.id}, 'down')">
                        <i class="fas fa-arrow-down"></i>
                    </button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSection(${section.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${contentPreview}
        </div>
        `;
    }).join('');
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
        case 'html':
            return 'fab fa-html5';
        case 'activity':
            return 'fas fa-tasks';
        default:
            return 'fas fa-file';
    }
}

function showContentFields() {
    const sectionType = document.getElementById('sectionType').value;
    const contentFields = document.getElementById('contentFields');

    if (!sectionType) {
        contentFields.innerHTML = '';
        return;
    }

    // Mostrar campos específicos según el tipo de sección
    switch (sectionType) {
        case 'text':
            contentFields.innerHTML = `
                <label for="textContent" class="form-label">Contenido de Texto</label>
                <textarea class="form-control" id="textContent" rows="6" required></textarea>
            `;
            break;
        case 'youtube':
            contentFields.innerHTML = `
                <label for="youtubeId" class="form-label">ID del Video de YouTube</label>
                <div class="input-group">
                    <span class="input-group-text">youtube.com/watch?v=</span>
                    <input type="text" class="form-control" id="youtubeId" placeholder="dQw4w9WgXcQ" required>
                </div>
                <div class="form-text">Ingresa solo el ID del video, no la URL completa.</div>
            `;
            break;
        case 'geogebra':
            contentFields.innerHTML = `
                <label for="geogebraId" class="form-label">ID del Applet de GeoGebra</label>
                <input type="text" class="form-control" id="geogebraId" placeholder="abcdef123456" required>
                <div class="form-text">Ingresa el ID del material de GeoGebra.</div>
            `;
            break;
        case 'image':
            contentFields.innerHTML = `
                <label for="imageFile" class="form-label">Imagen</label>
                <input type="file" class="form-control" id="imageFile" accept="image/*" required>
                <div class="form-text">Formatos soportados: JPG, PNG, GIF.</div>
            `;
            break;
        case 'pdf':
            contentFields.innerHTML = `
                <label for="pdfFile" class="form-label">Archivo PDF</label>
                <input type="file" class="form-control" id="pdfFile" accept="application/pdf" required>
                <div class="form-text">Sube un archivo PDF para que los estudiantes puedan descargarlo.</div>
            `;
            break;
        case 'html':
            contentFields.innerHTML = `
                <label for="htmlFilename" class="form-label">Nombre del Archivo HTML</label>
                <div class="input-group">
                    <span class="input-group-text">activities/html/</span>
                    <input type="text" class="form-control" id="htmlFilename" placeholder="actividad.html" required>
                </div>
                <div class="form-text">Ingresa el nombre del archivo HTML ubicado en la carpeta activities/html/</div>
            `;
            break;
        case 'activity':
            contentFields.innerHTML = `
                <label for="activityId" class="form-label">Actividad</label>
                <div class="input-group">
                    <input type="text" class="form-control" id="activityId" placeholder="Selecciona una actividad" readonly required>
                    <button class="btn btn-outline-secondary" type="button" onclick="openActivitySelector()">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
                <div class="form-text">Selecciona una actividad existente o crea una nueva.</div>
            `;
            break;
    }
}

function openActivitySelector() {
    // Cargar la lista de actividades
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = SAMPLE_ACTIVITIES.map(activity => `
        <div class="activity-card" onclick="selectActivity(${activity.id})">
            <div class="activity-card-header">
                <div class="activity-card-icon">
                    <i class="${getActivityIcon(activity.type)}"></i>
                </div>
                <h5 class="activity-card-title">${activity.title}</h5>
            </div>
            <div class="activity-card-type">${getActivityTypeName(activity.type)}</div>
            <div class="activity-card-description">${activity.description}</div>
        </div>
    `).join('');

    // Mostrar el modal
    const activitySelectorModal = new bootstrap.Modal(document.getElementById('activitySelectorModal'));
    activitySelectorModal.show();
}

function getActivityIcon(type) {
    switch (type) {
        case 'multiple-choice':
            return 'fas fa-list-ol';
        case 'true-false':
            return 'fas fa-check-circle';
        case 'short-answer':
            return 'fas fa-pencil-alt';
        default:
            return 'fas fa-tasks';
    }
}

function getActivityTypeName(type) {
    switch (type) {
        case 'multiple-choice':
            return 'Opción Múltiple';
        case 'true-false':
            return 'Verdadero o Falso';
        case 'short-answer':
            return 'Respuesta Corta';
        default:
            return 'Actividad';
    }
}

function selectActivity(activityId) {
    const activity = SAMPLE_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    // Establecer el ID de la actividad en el campo oculto
    document.getElementById('activityId').value = activity.id;

    // Cerrar el modal
    const activitySelectorModal = bootstrap.Modal.getInstance(document.getElementById('activitySelectorModal'));
    activitySelectorModal.hide();
}

function editSection(sectionId) {
    if (!currentTopic || !currentTopic.sections) return;

    const section = currentTopic.sections.find(s => s.id === sectionId);
    if (!section) return;

    // Establecer los valores en el formulario
    document.getElementById('sectionId').value = section.id;
    document.getElementById('sectionTitle').value = section.title;
    document.getElementById('sectionType').value = section.type;

    // Mostrar los campos específicos según el tipo
    showContentFields();

    // Establecer el valor del contenido según el tipo
    switch (section.type) {
        case 'text':
            document.getElementById('textContent').value = section.content;
            break;
        case 'youtube':
            document.getElementById('youtubeId').value = section.content;
            break;
        case 'geogebra':
            document.getElementById('geogebraId').value = section.content;
            break;
        case 'activity':
            document.getElementById('activityId').value = section.content;
            break;
    }

    // Cambiar el título del modal
    document.getElementById('sectionModalLabel').textContent = 'Editar Sección';

    // Mostrar el modal
    const sectionModal = new bootstrap.Modal(document.getElementById('sectionModal'));
    sectionModal.show();
}

function saveSection() {
    const sectionId = document.getElementById('sectionId').value;
    const title = document.getElementById('sectionTitle').value;
    const type = document.getElementById('sectionType').value;

    if (!title || !type) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    // Obtener el contenido según el tipo de sección
    let content = '';
    switch (type) {
        case 'text':
            content = document.getElementById('textContent').value;
            break;
        case 'youtube':
            content = document.getElementById('youtubeId').value;
            break;
        case 'geogebra':
            content = document.getElementById('geogebraId').value;
            break;
        case 'html':
            content = document.getElementById('htmlFilename').value;
            break;
        case 'activity':
            content = document.getElementById('activityId').value;
            break;
    }

    if (!content) {
        alert('Por favor completa el contenido de la sección');
        return;
    }

    if (sectionId) {
        // Editar sección existente
        if (!currentTopic || !currentTopic.sections) return;

        const index = currentTopic.sections.findIndex(s => s.id === parseInt(sectionId));
        if (index !== -1) {
            currentTopic.sections[index].title = title;
            currentTopic.sections[index].type = type;
            currentTopic.sections[index].content = content;
        }
    } else {
        // Crear nueva sección
        if (!currentTopic) return;

        if (!currentTopic.sections) {
            currentTopic.sections = [];
        }

        const newId = currentTopic.sections.length > 0 ?
            Math.max(...currentTopic.sections.map(s => s.id)) + 1 : 1001;

        currentTopic.sections.push({
            id: newId,
            title: title,
            type: type,
            content: content
        });
    }

    // Guardar el tema actualizado usando DataManager
    DataManager.saveTopic(currentTopic);

    // Cerrar el modal
    const sectionModal = bootstrap.Modal.getInstance(document.getElementById('sectionModal'));
    sectionModal.hide();

    // Limpiar el formulario
    document.getElementById('sectionForm').reset();
    document.getElementById('sectionId').value = '';
    document.getElementById('contentFields').innerHTML = '';

    // Recargar las secciones
    loadSections();

    // Mostrar mensaje de éxito
    alert('Sección guardada correctamente');
}

function deleteSection(sectionId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta sección?')) {
        if (!currentTopic || !currentTopic.sections) return;

        // Buscar el índice de la sección en el array
        const index = currentTopic.sections.findIndex(s => s.id === sectionId);

        if (index !== -1) {
            // Eliminar la sección del array
            currentTopic.sections.splice(index, 1);

            // Guardar el tema actualizado usando DataManager
            DataManager.saveTopic(currentTopic);

            // Recargar las secciones
            loadSections();

            // Mostrar mensaje de éxito
            alert('Sección eliminada correctamente');
        } else {
            alert('No se encontró la sección');
        }
    }
}

function moveSection(sectionId, direction) {
    if (!currentTopic || !currentTopic.sections) return;

    // Buscar el índice de la sección en el array
    const index = currentTopic.sections.findIndex(s => s.id === sectionId);

    if (index === -1) {
        alert('No se encontró la sección');
        return;
    }

    // Determinar el nuevo índice
    let newIndex;
    if (direction === 'up') {
        if (index === 0) {
            // Ya está en la primera posición
            return;
        }
        newIndex = index - 1;
    } else { // down
        if (index === currentTopic.sections.length - 1) {
            // Ya está en la última posición
            return;
        }
        newIndex = index + 1;
    }

    // Intercambiar las secciones
    const temp = currentTopic.sections[index];
    currentTopic.sections[index] = currentTopic.sections[newIndex];
    currentTopic.sections[newIndex] = temp;

    // Guardar el tema actualizado usando DataManager
    DataManager.saveTopic(currentTopic);

    // Recargar las secciones
    loadSections();
}
