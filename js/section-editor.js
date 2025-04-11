/**
 * ¡IMPORTANTE! - ESTRUCTURA DE DATOS MATEMÁTICA WEB
 * -----------------------------------------------
 * - localStorage es la fuente principal para almacenamiento y recuperación de datos
 * - Los archivos JSON son solo para exportar datos al repositorio
 * - Cualquier modificación debe mantener esta estructura para garantizar la persistencia
 * - Ver docs/ESTRUCTURA_DE_DATOS.md para más información detallada
 */

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

// Variable global para mantener la selección actual
let savedSelection = null;

// Función para verificar y recuperar datos perdidos
function checkAndRecoverData() {
    console.log('Verificando datos en localStorage...');

    try {
        // Verificar si hay datos en localStorage
        const topics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Encontrados ${topics.length} temas en localStorage`);

        // Verificar si hay actividades en localStorage
        let activityCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('activity_') || key.match(/^activity_data_/))) {
                activityCount++;
            }
        }
        console.log(`Encontradas ${activityCount} actividades en localStorage`);

        // Verificar si hay un registro de actividades
        try {
            const activityRegistry = JSON.parse(localStorage.getItem('activity_registry') || '[]');
            console.log(`Registro de actividades: ${activityRegistry.length} entradas`);
        } catch (error) {
            console.warn('Error al parsear el registro de actividades:', error);
        }
    } catch (error) {
        console.error('Error al verificar datos en localStorage:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar datos en localStorage
    checkAndRecoverData();

    // Verificar si el usuario está autenticado y es administrador
    if (!auth.isAdmin()) {
        window.location.href = '../login.html';
        return;
    }

    // Inicializar sistema de persistencia antes de cargar los datos
    if (typeof initializeDataSystem === 'function') {
        console.log('Inicializando sistema de persistencia en section-editor.js...');
        await initializeDataSystem();
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

    // Manejar el cierre del modal
    const sectionModal = document.getElementById('sectionModal');
    if (sectionModal) {
        sectionModal.addEventListener('hidden.bs.modal', function (e) {
            console.log("Modal cerrado: eliminando backdrop y restaurando interacción");

            // Eliminar explícitamente cualquier backdrop que pueda haber quedado
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
                console.log("Backdrop eliminado manualmente");
            }

            // Eliminar cualquier clase añadida al body que pueda estar bloqueando
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });

        // Añadir manejador específico para el botón X (close)
        const closeButton = sectionModal.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                console.log("Botón X (close) clickeado");

                try {
                    // Cerrar el modal usando la API de Bootstrap
                    const modalInstance = bootstrap.Modal.getInstance(sectionModal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                } catch (error) {
                    console.error("Error al cerrar modal con botón X:", error);

                    // Plan B: forzar el cierre manualmente
                    sectionModal.classList.remove('show');
                    document.body.classList.remove('modal-open');
                    document.querySelector('.modal-backdrop')?.remove();
                }
            });
        }
    }

    // Añadir evento al botón de Nueva Sección para asegurar limpieza completa del modal
    const newSectionBtn = document.querySelector('button[data-bs-target="#sectionModal"]');
    if (newSectionBtn) {
        console.log("Configurando eventos para el botón de Nueva Sección");

        // Eliminar cualquier evento anterior para evitar duplicados
        newSectionBtn.removeEventListener('click', handleNewSectionClick);

        // Añadir manejador para limpiar completamente el modal antes de mostrarlo
        newSectionBtn.addEventListener('click', handleNewSectionClick);
    }

    // Añadir evento al selector de tipo de sección para mostrar los campos correspondientes
    const sectionTypeSelect = document.getElementById('sectionType');
    if (sectionTypeSelect) {
        sectionTypeSelect.addEventListener('change', function() {
            console.log(`Tipo de sección cambiado a: ${this.value}`);
            showContentFields();
        });
    }
});

function loadTopicInfo() {
    console.log('Cargando información del tema desde localStorage...');

    // CARGAR DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    try {
        // 1. Obtener todos los temas de localStorage
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Temas encontrados en localStorage: ${allTopics.length}`);

        // 2. Buscar el tema actual por ID
        currentTopic = allTopics.find(topic => topic.id == currentTopicId);

        // 3. Si no se encuentra, intentar con DataManager como fallback
        if (!currentTopic && typeof DataManager !== 'undefined') {
            console.log('Tema no encontrado en localStorage, intentando con DataManager...');
            currentTopic = DataManager.getTopicById(currentTopicId);
        }
    } catch (error) {
        console.error('Error al cargar tema desde localStorage:', error);
    }

    if (!currentTopic) {
        // Si no se encuentra el tema, mostrar un mensaje de error
        document.getElementById('topicTitle').textContent = 'Tema no encontrado';
        document.getElementById('topicDescription').textContent = 'El tema solicitado no existe.';
        console.error(`No se pudo encontrar el tema con ID ${currentTopicId} en ninguna fuente`);
        return;
    }

    // Verificar que el tema tenga un array de secciones
    if (!currentTopic.sections) {
        console.warn('El tema no tiene un array de secciones, inicializando uno vacío');
        currentTopic.sections = [];
    }

    // Mostrar la información del tema
    document.getElementById('topicTitle').textContent = currentTopic.title;
    document.getElementById('topicDescription').textContent = currentTopic.description;
}

function loadSections() {
    console.log('Cargando secciones del tema...');
    const sectionsContainer = document.getElementById('sectionsContainer');
    if (!sectionsContainer) return;

    // Limpiar el contenedor
    sectionsContainer.innerHTML = '';

    // Si no hay tema, mostrar mensaje
    if (!currentTopic) {
        sectionsContainer.innerHTML = '<div class="alert alert-info">No hay un tema seleccionado</div>';
        return;
    }

    // VERIFICAR Y CARGAR DESDE LOCALSTORAGE SI ES NECESARIO
    try {
        // Verificar si el tema tiene secciones
        if (!currentTopic.sections || !Array.isArray(currentTopic.sections)) {
            console.warn('El tema no tiene un array de secciones válido, intentando recargar desde localStorage...');

            // Intentar recargar el tema desde localStorage
            const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
            const freshTopic = allTopics.find(t => t.id == currentTopic.id);

            if (freshTopic && freshTopic.sections && Array.isArray(freshTopic.sections)) {
                console.log(`Tema recargado desde localStorage con ${freshTopic.sections.length} secciones`);
                currentTopic.sections = freshTopic.sections;
            } else {
                console.warn('No se pudo recargar el tema desde localStorage, inicializando array vacío');
                currentTopic.sections = [];
            }
        }
    } catch (error) {
        console.error('Error al verificar/recargar secciones:', error);
        currentTopic.sections = [];
    }

    // Si no hay secciones, mostrar mensaje
    if (!currentTopic.sections || currentTopic.sections.length === 0) {
        sectionsContainer.innerHTML = '<div class="alert alert-info">Este tema no tiene secciones</div>';
        console.log('El tema no tiene secciones');
        return;
    }

    console.log(`Cargando ${currentTopic.sections.length} secciones del tema...`);

    // Crear una estructura ordenada de elementos (secciones y grupos)
    const allSectionsWithOrder = [];
    const groupMap = {};

    // Primero, recopilar todas las secciones no agrupadas
    currentTopic.sections.forEach(section => {
        if (!section.groupId) {
            allSectionsWithOrder.push({
                type: 'section',
                data: section,
                order: section.order || 0
            });
        }
    });

    // Luego, recopilar y organizar todos los grupos
    currentTopic.sections.forEach(section => {
        if (section.groupId) {
            if (!groupMap[section.groupId]) {
                groupMap[section.groupId] = {
                    id: section.groupId,
                    name: section.groupName || 'Grupo sin nombre',
                    sections: [],
                    order: section.order || 0
                };
            } else if ((section.order || 0) < groupMap[section.groupId].order) {
                // Actualizar el orden del grupo si encontramos una sección con orden menor
                groupMap[section.groupId].order = section.order || 0;
            }

            // Agregar la sección al grupo
            groupMap[section.groupId].sections.push(section);
        }
    });

    // Ordenar las secciones dentro de cada grupo
    Object.values(groupMap).forEach(group => {
        group.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // Agregar los grupos a la lista de elementos
    Object.values(groupMap).forEach(group => {
        allSectionsWithOrder.push({
            type: 'group',
            data: group,
            order: group.order
        });
    });

    // Ordenar todos los elementos por su orden
    allSectionsWithOrder.sort((a, b) => a.order - b.order);

    // Mostrar las secciones y grupos en el orden correcto
    allSectionsWithOrder.forEach((item, index) => {
        if (item.type === 'section') {
            // Agregar sección individual
            const sectionElement = createSectionElement(
                item.data,
                index,
                index === 0,
                index === allSectionsWithOrder.length - 1
            );
            sectionsContainer.appendChild(sectionElement);
        } else if (item.type === 'group') {
            // Agregar grupo con sus secciones
            const groupElement = document.createElement('div');
            groupElement.className = 'section-group mb-4';
            groupElement.dataset.groupId = item.data.id;

            // Encabezado del grupo
            const groupHeader = document.createElement('div');
            groupHeader.className = 'group-header d-flex justify-content-between align-items-center p-2 mb-2 bg-light border';

            // Icono y nombre del grupo
            const groupTitle = document.createElement('h4');
            groupTitle.className = 'mb-0 d-flex align-items-center';
            groupTitle.innerHTML = `<i class="fas fa-folder me-2"></i> Grupo: ${item.data.name}`;

            // Controles del grupo
            const groupControls = document.createElement('div');
            groupControls.className = 'group-controls';

            // Botón para editar nombre
            const editNameButton = document.createElement('button');
            editNameButton.className = 'btn btn-sm btn-outline-primary me-1 edit-group-name';
            editNameButton.title = 'Editar nombre';
            editNameButton.innerHTML = '<i class="fas fa-edit"></i> Editar Nombre';
            editNameButton.dataset.groupId = item.data.id;
            groupControls.appendChild(editNameButton);

            // Botón para desagrupar
            const ungroupButton = document.createElement('button');
            ungroupButton.className = 'btn btn-sm btn-outline-danger ungroup-sections';
            ungroupButton.title = 'Desagrupar secciones';
            ungroupButton.innerHTML = '<i class="fas fa-object-ungroup"></i> Desagrupar';
            ungroupButton.dataset.groupId = item.data.id;
            groupControls.appendChild(ungroupButton);

            // Botón para añadir secciones al grupo (nuevo)
            const addToGroupButton = document.createElement('button');
            addToGroupButton.className = 'btn btn-sm btn-outline-success add-to-group me-1';
            addToGroupButton.title = 'Añadir secciones al grupo';
            addToGroupButton.innerHTML = '<i class="fas fa-plus-circle"></i> Añadir sección';
            addToGroupButton.dataset.groupId = item.data.id;
            groupControls.appendChild(addToGroupButton);

            // Determinar si es el primer o último elemento en la lista completa
            const isFirstGroup = index === 0;
            const isLastGroup = index === allSectionsWithOrder.length - 1;

            // Crear botones de navegación para el grupo
            const moveUpButton = document.createElement('button');
            moveUpButton.className = 'btn btn-sm btn-outline-primary me-1 move-group-up';
            moveUpButton.title = 'Mover grupo hacia arriba';
            moveUpButton.innerHTML = '<i class="fas fa-arrow-up"></i> Mover grupo arriba';
            moveUpButton.dataset.groupId = item.data.id;

            moveUpButton.addEventListener('click', function() {
                moveGroupInOrder(item.data.id, 'up');
            });

            const moveDownButton = document.createElement('button');
            moveDownButton.className = 'btn btn-sm btn-outline-primary me-1 move-group-down';
            moveDownButton.title = 'Mover grupo hacia abajo';
            moveDownButton.innerHTML = '<i class="fas fa-arrow-down"></i> Mover grupo abajo';
            moveDownButton.dataset.groupId = item.data.id;

            moveDownButton.addEventListener('click', function() {
                moveGroupInOrder(item.data.id, 'down');
            });

            // Solo añadimos los botones si corresponde según la posición
            if (!isFirstGroup) {
                groupControls.appendChild(moveUpButton);
            }

            if (!isLastGroup) {
                groupControls.appendChild(moveDownButton);
            }

            // Ensamblar el encabezado
            groupHeader.appendChild(groupTitle);
            groupHeader.appendChild(groupControls);
            groupElement.appendChild(groupHeader);

            // Contenedor para las secciones del grupo
            const groupSectionsContainer = document.createElement('div');
            groupSectionsContainer.className = 'group-sections ps-4';

            // Agregar cada sección del grupo
            item.data.sections.forEach((section, sectionIndex) => {
                const isFirstInGroup = sectionIndex === 0;
                const isLastInGroup = sectionIndex === item.data.sections.length - 1;

                const sectionElement = createSectionElement(
                    section,
                    sectionIndex,
                    isFirstInGroup,
                    isLastInGroup,
                    true // Indicar que está en un grupo
                );

                groupSectionsContainer.appendChild(sectionElement);
            });

            // Ensamblar el grupo
            groupElement.appendChild(groupSectionsContainer);
            sectionsContainer.appendChild(groupElement);
        }
    });

    // Inicializar eventos
    initSectionEvents();

    console.log('Secciones cargadas exitosamente');
}

function createSectionElement(section, index, isFirst, isLast, isInGroup = false) {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'section-item card mb-3';
    sectionElement.dataset.sectionId = section.id;

    // Si la sección está en un grupo, agregar el atributo data-group-id
    if (section.groupId) {
        sectionElement.dataset.groupId = section.groupId;
    }

    // Obtener el ícono adecuado para el tipo de sección
    const iconData = getSectionIcon(section.type);

    // Crear el contenedor principal del contenido de la sección
    const contentContainer = document.createElement('div');
    contentContainer.className = 'card-body d-flex align-items-center';

    // Agregar el ícono de arrastre (handle)
    const handleDiv = document.createElement('div');
    handleDiv.className = 'section-handle me-2';
    handleDiv.style.cursor = 'grab';
    handleDiv.innerHTML = '<i class="fas fa-grip-vertical"></i>';
    contentContainer.appendChild(handleDiv);

    // Agregar el ícono del tipo de sección
    const typeIconDiv = document.createElement('div');
    typeIconDiv.className = 'section-type-icon me-3';
    typeIconDiv.innerHTML = `<i class="${iconData.class} ${iconData.icon} fa-2x" style="color: ${iconData.color};"></i>`;
    contentContainer.appendChild(typeIconDiv);

    // Agregar la información de la sección
    const infoDiv = document.createElement('div');
    infoDiv.className = 'section-info flex-grow-1';

    const title = document.createElement('h5');
    title.className = 'm-0';
    title.textContent = section.title;
    infoDiv.appendChild(title);

    const typeLabel = document.createElement('div');
    typeLabel.className = 'small text-muted';

    // Crear el HTML base para la etiqueta de tipo
    let typeLabelHTML = `
        <span class="badge bg-light text-dark">
            <i class="${iconData.class} ${iconData.icon} me-1"></i> ${section.type}
        </span>
    `;

    // Si es una actividad, mostrar también el ID
    if (section.type === 'activity' && section.content) {
        typeLabelHTML += `
            <span class="ms-2">
                <i class="fas fa-link me-1"></i> ID: <code>${section.content}</code>
            </span>
        `;
    }

    typeLabel.innerHTML = typeLabelHTML;
    infoDiv.appendChild(typeLabel);

    contentContainer.appendChild(infoDiv);

    // Crear botones de acción
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'section-actions';

    // Botón editar
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-sm btn-outline-primary edit-section me-1';
    editButton.title = 'Editar sección';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    actionsContainer.appendChild(editButton);

    // Botón previsualizar
    const previewButton = document.createElement('button');
    previewButton.className = 'btn btn-sm btn-outline-info preview-section me-1';
    previewButton.title = 'Vista previa';
    previewButton.innerHTML = '<i class="fas fa-eye"></i>';
    actionsContainer.appendChild(previewButton);

    // Botones de navegación para mover la sección
    // Los botones se agregan siempre y se controlarán en updateNavigationButtons

    // Botón mover hacia arriba
    const moveUpButton = document.createElement('button');
    moveUpButton.className = 'btn btn-sm btn-outline-secondary move-up-section me-1';
    moveUpButton.title = 'Mover arriba';
    moveUpButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    if (!isFirst) {
        actionsContainer.appendChild(moveUpButton);
    }

    // Botón mover hacia abajo
    const moveDownButton = document.createElement('button');
    moveDownButton.className = 'btn btn-sm btn-outline-secondary move-down-section me-1';
    moveDownButton.title = 'Mover abajo';
    moveDownButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    if (!isLast) {
        actionsContainer.appendChild(moveDownButton);
    }

    // Botón agrupar sección (solo si no está en un grupo)
    if (!isInGroup && !section.groupId) {
        const groupButton = document.createElement('button');
        groupButton.className = 'btn btn-sm btn-outline-success group-section me-1';
        groupButton.title = 'Agrupar sección';
        groupButton.innerHTML = '<i class="fas fa-layer-group"></i>';
        actionsContainer.appendChild(groupButton);
    }

    // Botón eliminar sección
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-sm btn-outline-danger delete-section';
    deleteButton.title = 'Eliminar sección';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    actionsContainer.appendChild(deleteButton);

    contentContainer.appendChild(actionsContainer);
    sectionElement.appendChild(contentContainer);

    // Agregar información adicional para tipos específicos
    if (section.type === 'activity') {
        const activityInfo = document.createElement('div');
        activityInfo.className = 'mt-2 p-2 bg-light rounded';
        activityInfo.innerHTML = `
                <div class="d-flex align-items-center">
                <i class="fas fa-link me-2" style="color: ${iconData.color};"></i>
                    <div class="small">ID: ${section.content}</div>
                </div>
        `;
        sectionElement.appendChild(activityInfo);
    } else if (section.type === 'youtube') {
        const youtubeInfo = document.createElement('div');
        youtubeInfo.className = 'mt-2 p-2 bg-light rounded';
        youtubeInfo.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fab fa-youtube me-2" style="color: #ff0000;"></i>
                    <div class="small">Video ID: ${section.content}</div>
                </div>
    `;
        sectionElement.appendChild(youtubeInfo);
    }

    return sectionElement;
}

function initSectionEvents() {
    // Eventos para editar secciones
    document.querySelectorAll('.edit-section').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.closest('.section-item').dataset.sectionId;
            editSection(sectionId);
        });
    });

    // Eventos para eliminar secciones
    document.querySelectorAll('.delete-section').forEach(button => {
        button.addEventListener('click', function() {
            const sectionItem = this.closest('.section-item');
            const sectionId = sectionItem.dataset.sectionId;
            const sectionTitle = sectionItem.querySelector('h5').textContent;

            if (confirm(`¿Está seguro de que desea eliminar la sección "${sectionTitle}"?`)) {
                deleteSection(sectionId);
            }
        });
    });

    // Eventos para previsualizar secciones
    document.querySelectorAll('.preview-section').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.closest('.section-item').dataset.sectionId;
            previewSection(sectionId);
        });
    });

    // Eventos para mover secciones hacia abajo
    document.querySelectorAll('.move-down-section').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Botón mover-abajo clickeado');
            // Obtener el elemento padre más cercano con la clase section-item
            const sectionItem = this.closest('.section-item');
            if (!sectionItem) {
                console.error('No se encontró el elemento padre section-item');
                return;
            }
            const sectionId = sectionItem.dataset.sectionId;
            console.log(`Moviendo sección ID: ${sectionId} hacia abajo`);
            moveSection(sectionId, 'down');
        });
    });

    // Eventos para mover secciones hacia arriba
    document.querySelectorAll('.move-up-section').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Botón mover-arriba clickeado');
            // Obtener el elemento padre más cercano con la clase section-item
            const sectionItem = this.closest('.section-item');
            if (!sectionItem) {
                console.error('No se encontró el elemento padre section-item');
                return;
            }
            const sectionId = sectionItem.dataset.sectionId;
            console.log(`Moviendo sección ID: ${sectionId} hacia arriba`);
            moveSection(sectionId, 'up');
        });
    });

    // Eventos para editar nombres de grupos
    document.querySelectorAll('.edit-group-name').forEach(button => {
        button.addEventListener('click', function() {
            const groupId = this.dataset.groupId;
            editGroupName(groupId);
        });
    });

    // Eventos para desagrupar secciones
    document.querySelectorAll('.ungroup-sections').forEach(button => {
        button.addEventListener('click', function() {
            const groupId = this.dataset.groupId;
            ungroupSections(groupId);
        });
    });

    // Eventos para agrupar secciones
    document.querySelectorAll('.group-section').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.closest('.section-item').dataset.sectionId;
            showSectionSelectionModal(sectionId);
        });
    });

    // Eventos para mover grupos hacia arriba
    document.querySelectorAll('.move-group-up').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Botón mover-grupo-arriba clickeado');
            const groupId = this.dataset.groupId;
            console.log(`Moviendo grupo ID: ${groupId} hacia arriba`);
            moveGroupInOrder(groupId, 'up');
        });
    });

    // Eventos para mover grupos hacia abajo
    document.querySelectorAll('.move-group-down').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Botón mover-grupo-abajo clickeado');
            const groupId = this.dataset.groupId;
            console.log(`Moviendo grupo ID: ${groupId} hacia abajo`);
            moveGroupInOrder(groupId, 'down');
        });
    });

    // Eventos para añadir secciones a un grupo
    document.querySelectorAll('.add-to-group').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Botón añadir-a-grupo clickeado');
            const groupId = this.dataset.groupId;
            console.log(`Abriendo modal para añadir secciones al grupo ID: ${groupId}`);
            showAddToGroupModal(groupId);
        });
    });
}

function getSectionIcon(type) {
    switch (type) {
        case 'text':
            return {
                class: 'fas',
                icon: 'fa-align-left',
                color: '#0d6efd'
            };
        case 'youtube':
            return {
                class: 'fab',
                icon: 'fa-youtube',
                color: '#ff0000'
            };
        case 'geogebra':
            return {
                class: 'fas',
                icon: 'fa-calculator',
                color: '#9c27b0'
            };
        case 'image':
            return {
                class: 'fas',
                icon: 'fa-image',
                color: '#20c997'
            };
        case 'pdf':
            return {
                class: 'fas',
                icon: 'fa-file-pdf',
                color: '#dc3545'
            };
        case 'html':
            return {
                class: 'fab',
                icon: 'fa-html5',
                color: '#e34c26'
            };
        case 'activity':
            return {
                class: 'fas',
                icon: 'fa-tasks',
                color: '#fd7e14'
            };
        default:
            return {
                class: 'fas',
                icon: 'fa-file',
                color: '#6c757d'
            };
    }
}

function showContentFields() {
    console.log("Mostrando campos para el tipo seleccionado");
    const contentType = document.getElementById('sectionType').value;
    const contentFields = document.getElementById('contentFields');

    // Limpiar el contenido anterior
    contentFields.innerHTML = '';

    // Verificar que esté disponible el DataManager
    if (typeof DataManager === 'undefined') {
        console.error("DataManager no está disponible. Asegúrese de cargar los archivos necesarios.");
        return;
    }

    // Crear los campos según el tipo
    switch (contentType) {
        case 'text':
            // Campo para texto con editor
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="textContent" class="form-label">Contenido de Texto</label>
                    <textarea class="form-control" id="textContent" rows="10"></textarea>
                </div>
            `;

            // Inicializar el editor de texto limpio después de un pequeño retraso
            setTimeout(() => {
                try {
                    console.log("Inicializando editor de texto limpio para nueva sección de texto");
                    if (typeof initCleanTextEditor === 'function') {
                        const success = initCleanTextEditor('textContent');
                        console.log(`Editor de texto limpio inicializado con éxito: ${success}`);
                    } else {
                        console.error("Función initCleanTextEditor no disponible");
                        // Mostrar el textarea como fallback
                        const textareaContent = document.getElementById('textContent');
                        if (textareaContent) {
                            textareaContent.style.display = 'block';
                        }
                    }
                } catch (error) {
                    console.error("Error al inicializar el editor de texto limpio:", error);
                    // Mostrar el textarea como fallback
                    const textareaContent = document.getElementById('textContent');
                    if (textareaContent) {
                        textareaContent.style.display = 'block';
                    }
                }
            }, 200);
            break;

        case 'youtube':
            // Campo para ID de YouTube
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="youtubeId" class="form-label">ID del Video de YouTube</label>
                    <input type="text" class="form-control" id="youtubeId" placeholder="Ej: dQw4w9WgXcQ">
                    <div class="form-text">Código que aparece en la URL después de v=</div>
                </div>
            `;
            break;

        case 'geogebra':
            // Campo para ID de GeoGebra
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="geogebraId" class="form-label">ID del Applet de GeoGebra</label>
                    <input type="text" class="form-control" id="geogebraId" placeholder="Ej: abc123xyz">
                    <div class="form-text">Código que aparece en la URL de GeoGebra</div>
                </div>
            `;
            break;

        case 'image':
            // Campo para el nombre del archivo de imagen
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="imageFilename" class="form-label">Nombre del Archivo de Imagen</label>
                    <input type="text" class="form-control" id="imageFilename" placeholder="Ej: mi-imagen.jpg">
                    <div class="form-text">Nombre del archivo de imagen ubicado en /activities/images/</div>
                </div>
            `;
            break;

        case 'pdf':
            // Campo para el nombre del archivo PDF
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="pdfFilename" class="form-label">Nombre del Archivo PDF</label>
                    <input type="text" class="form-control" id="pdfFilename" placeholder="Ej: mi-documento.pdf">
                    <div class="form-text">Nombre del archivo PDF ubicado en /activities/pdf/</div>
                </div>
            `;
            break;

        case 'html':
            // Campo para el nombre del archivo HTML
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="htmlFilename" class="form-label">Nombre del Archivo HTML</label>
                    <input type="text" class="form-control" id="htmlFilename" placeholder="Ej: mi-archivo.html">
                    <div class="form-text">Nombre del archivo HTML que desea incluir</div>
                </div>
            `;
            break;

        case 'activity':
            // Opciones para crear diferentes tipos de actividades interactivas
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="activityType" class="form-label">Tipo de Actividad</label>
                    <select class="form-select" id="activityType" onchange="showActivityOptions()">
                        <option value="" selected disabled>Seleccionar tipo de actividad</option>
                        <option value="multiple-choice">Opción Múltiple</option>
                        <option value="true-false">Verdadero o Falso</option>
                        <option value="short-answer">Respuesta Corta</option>
                    </select>
                </div>

                <div id="activityOptions" class="d-none">
                    <div class="mb-3">
                        <label for="activityTitle" class="form-label">Título de la Actividad</label>
                        <input type="text" class="form-control" id="activityTitle" placeholder="Ingrese el título de la actividad">
                    </div>

                    <div id="questionsContainer">
                        <!-- Aquí se agregarán las preguntas dinámicamente -->
                    </div>

                    <div class="mb-3 mt-3">
                        <button type="button" class="btn btn-outline-primary" onclick="addQuestion()">
                            <i class="fas fa-plus"></i> Agregar Pregunta
                        </button>
                    </div>

                    <div id="activityPreview" class="mt-4 d-none">
                        <h5>Vista Previa</h5>
                        <div class="border p-3 rounded bg-light">
                            <div id="previewContent"></div>
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <button type="button" class="btn btn-primary w-100" onclick="createNewActivity()">
                        <i class="fas fa-plus"></i> Crear y Seleccionar Actividad
                    </button>
                </div>
                <div class="mb-3 alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Primero cree una actividad con el botón de arriba, luego seleccionela y finalmente guarde la sección.
                </div>

                <div id="activityInfo" class="mt-3 d-none alert alert-info">
                    <span id="activityInfoText"></span>
                    <div class="mt-2 d-flex align-items-center">
                        <div class="me-3">
                            <strong>ID:</strong> <code id="activityIdDisplay"></code>
                        </div>
                        <button type="button" id="viewActivityBtn" class="btn btn-sm btn-primary d-none">
                            <i class="fas fa-eye"></i> Ver/Editar Actividad
                        </button>
                    </div>
                </div>
                <input type="hidden" id="activityId">
            `;
            break;

        default:
            contentFields.innerHTML = '<p class="text-muted">Seleccione un tipo de contenido para ver las opciones.</p>';
    }

    console.log(`Campos configurados para tipo: ${contentType}`);
}

// Variable global para el listener de mensajes
let activityMessageListener = null;

function createNewActivity() {
    // Registrar la acción en el log
    console.log('Iniciando creación de actividad desde el editor de secciones');

    // Eliminar cualquier listener anterior para evitar duplicados
    if (activityMessageListener) {
        console.log('Eliminando listener de mensajes anterior');
        window.removeEventListener('message', activityMessageListener);
        activityMessageListener = null;
    }

    // Crear un nuevo listener para recibir el mensaje de la actividad creada
    activityMessageListener = function(event) {
        // Verificar que el mensaje es del tipo esperado
        if (event.data && event.data.type === 'activity_created') {
            console.log('Mensaje de actividad creada recibido:', event.data);

            // Guardar el ID de la actividad directamente, sin formato de URL
            const activityId = event.data.activityId;
            console.log(`ID de actividad recibido: ${activityId}`);

            // Actualizar el campo de actividad con el ID directo
            document.getElementById('activityId').value = activityId;

            // Actualizar también el elemento de visualización del ID
            const activityIdDisplay = document.getElementById('activityIdDisplay');
            if (activityIdDisplay) {
                activityIdDisplay.textContent = activityId;
            }

            // Mostrar la información de la actividad creada
            const activityInfo = document.getElementById('activityInfo');
            const activityInfoText = document.getElementById('activityInfoText');
            const viewActivityBtn = document.getElementById('viewActivityBtn');

            if (activityInfo && activityInfoText) {
                activityInfoText.textContent = `Actividad "${event.data.title}" seleccionada correctamente.`;
                activityInfo.classList.remove('d-none');

                // Mostrar el botón para ver/editar la actividad
                if (viewActivityBtn) {
                    viewActivityBtn.classList.remove('d-none');
                    viewActivityBtn.onclick = function() {
                        window.open(`../admin/activity-loader.html?id=${activityId}`, '_blank');
                    };
                }
            } else {
                // Fallback si no se encuentran los elementos
                alert(`Actividad "${event.data.title}" seleccionada correctamente.`);
            }

            // Eliminar el listener después de procesar el mensaje para evitar duplicados
            window.removeEventListener('message', activityMessageListener);
            activityMessageListener = null;
        }
    };

    // Registrar el listener
    window.addEventListener('message', activityMessageListener);

    // Abrir la página de creación de actividades
    const activityCreatorUrl = 'activity-creator-simple.html';
    window.open(activityCreatorUrl, '_blank', 'width=1200,height=800');
}

function openActivitySelector() {
    // Esta función ya no se usa
    alert('Esta funcionalidad no está disponible. Por favor, cree una nueva actividad.');
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
    console.log(`Editando sección con ID: ${sectionId}`);

    // CARGAR DIRECTAMENTE DESDE LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    try {
        // 1. Obtener todos los temas de localStorage
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Temas encontrados en localStorage: ${allTopics.length}`);

        // 2. Buscar el tema actual por ID
        const freshTopic = allTopics.find(topic => topic.id == currentTopicId);

        // 3. Actualizar el tema actual si se encontró
        if (freshTopic) {
            console.log(`Tema encontrado en localStorage con ${freshTopic.sections ? freshTopic.sections.length : 0} secciones`);
            currentTopic = freshTopic;
        }
    } catch (error) {
        console.error('Error al cargar tema desde localStorage:', error);
    }

    if (!currentTopic || !currentTopic.sections) {
        console.error('No hay un tema o secciones cargadas');
        alert('Error: No se pudo editar la sección porque no hay un tema cargado.');
        return;
    }

    // Asegurarse de que sectionId sea consistente para comparaciones
    sectionId = String(sectionId);

    const section = currentTopic.sections.find(s => String(s.id) == sectionId);
    if (!section) {
        console.error(`No se encontró la sección con ID ${sectionId}`);
        alert('Error: No se pudo encontrar la sección para editar.');
        return;
    }

    console.log(`Sección encontrada:`, section);

    console.log(`Editando sección: "${section.title}" (ID: ${section.id}, Tipo: ${section.type})`);

    // Limpiar cualquier editor previo
    if (typeof window.cleanupEditor === 'function') {
        try {
            window.cleanupEditor();
            console.log("Editor de texto limpio limpiado correctamente");
        } catch (error) {
            console.error("Error al limpiar editor de texto limpio:", error);
        }
    }

    // Limpiar cualquier editor matemático previo (compatibilidad)
    if (typeof window.cleanupMathEditor === 'function') {
        try {
            window.cleanupMathEditor();
            console.log("Editor matemático antiguo limpiado correctamente");
        } catch (error) {
            console.error("Error al limpiar editor matemático antiguo:", error);
        }
    }

    // Eliminar elementos relacionados con el editor que pudieran haber quedado
    document.getElementById('colorPalette')?.remove();

    // Remover cualquier instancia previa del editor
    const previousCleanEditor = document.querySelector('.clean-text-editor-container');
    if (previousCleanEditor) {
        console.log("Removiendo editor de texto limpio previo del DOM");
        previousCleanEditor.remove();
    }

    // Remover cualquier instancia previa del editor matemático (compatibilidad)
    const previousMathEditor = document.querySelector('.math-editor-container');
    if (previousMathEditor) {
        console.log("Removiendo editor matemático previo del DOM");
        previousMathEditor.remove();
    }

    // Establecer los valores en el formulario
    document.getElementById('sectionId').value = section.id;
    document.getElementById('sectionTitle').value = section.title;
    document.getElementById('sectionType').value = section.type;

    // Mostrar los campos específicos según el tipo
    showContentFields();

    // Establecer el valor del contenido según el tipo
    switch (section.type) {
        case 'text':
            // Esperar a que el textarea se haya creado completamente
            setTimeout(() => {
                const textContentElem = document.getElementById('textContent');
                if (textContentElem) {
                    console.log(`Configurando contenido inicial en textarea (longitud: ${section.content ? section.content.length : 0})...`);

                    // Verificar y limpiar el contenido si es necesario
                    let contentToLoad = '';
                    if (section.content && section.content.trim() !== '') {
                        // Crear un contenedor temporal para validar y limpiar HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = section.content;

                        // Verificar si hay elementos math-tex y asegurar que sean editables
                        const mathElements = tempDiv.querySelectorAll('.math-tex');
                        if (mathElements.length > 0) {
                            console.log(`Procesando ${mathElements.length} elementos matemáticos`);
                            mathElements.forEach(element => {
                                // Asegurar que los elementos math-tex sean editables y tengan estilos correctos
                                element.contentEditable = 'true';
                                element.style.display = 'inline-block';
                                element.style.cursor = 'text';
                                element.style.userSelect = 'text';

                                // Corregir elementos anidados si los hay
                                const nestedMathElements = element.querySelectorAll('.math-tex');
                                if (nestedMathElements.length > 0) {
                                    const latex = element.getAttribute('data-latex') || '';
                                    element.innerHTML = `\\(${latex}\\)`;
                                }
                            });
                        }

                        contentToLoad = tempDiv.innerHTML;
                    }

                    // Establecer el contenido en el textarea
                    textContentElem.value = contentToLoad;

                    // Hacer visible el textarea mientras se carga el editor
                    textContentElem.style.display = 'block';

                    // Establecer el ID del textarea como objetivo global para el editor
                    window._mathEditorTargetId = 'textContent';

                    // Inicializar el editor de texto limpio directamente
                    try {
                        console.log("Inicializando editor de texto limpio...");

                        // Verificar que la función esté disponible
                        if (typeof initCleanTextEditor === 'function') {
                            const success = initCleanTextEditor('textContent');

                            if (success) {
                                console.log("Editor de texto limpio inicializado correctamente");

                                // Ocultar el textarea original
                                if (textContentElem) {
                                    textContentElem.style.display = 'none';
                                }
                            } else {
                                console.error("Fallo al inicializar el editor de texto limpio");
                                // Mostrar el textarea como fallback
                                if (textContentElem) {
                                    textContentElem.style.display = 'block';
                                }
                            }
                        } else {
                            console.error("Función initCleanTextEditor no disponible");
                            // Mostrar el textarea como fallback
                            if (textContentElem) {
                                textContentElem.style.display = 'block';
                            }
                        }
                    } catch (error) {
                        console.error("Error al inicializar el editor de texto limpio:", error);
                        // Mostrar el textarea como fallback
                        if (textContentElem) {
                            textContentElem.style.display = 'block';
                        }
                    }
                } else {
                    console.error("No se encontró el textarea #textContent después de showContentFields()");
                }
            }, 300);
            break;
        case 'youtube':
            document.getElementById('youtubeId').value = section.content;
            break;
        case 'geogebra':
            document.getElementById('geogebraId').value = section.content;
            break;
        case 'html':
            document.getElementById('htmlFilename').value = section.content;
            break;
        case 'pdf':
            document.getElementById('pdfFilename').value = section.content;
            break;
        case 'image':
            document.getElementById('imageFilename').value = section.content;
            break;
        case 'activity':
            document.getElementById('activityId').value = section.content;

            // Mostrar la información de la actividad
            const activityInfo = document.getElementById('activityInfo');
            const activityInfoText = document.getElementById('activityInfoText');
            const activityIdDisplay = document.getElementById('activityIdDisplay');
            const viewActivityBtn = document.getElementById('viewActivityBtn');

            if (activityInfo && activityInfoText) {
                // Extraer el nombre de la actividad del contenido
                const activityId = section.content;
                activityInfoText.textContent = `Actividad asignada correctamente`;
                activityInfo.classList.remove('d-none');

                // Mostrar el ID de la actividad
                if (activityIdDisplay && activityId) {
                    activityIdDisplay.textContent = activityId;
                }

                // Mostrar el botón para ver/editar la actividad
                if (viewActivityBtn && activityId) {
                    viewActivityBtn.classList.remove('d-none');
                    viewActivityBtn.onclick = function() {
                        window.open(`../admin/activity-loader.html?id=${activityId}`, '_blank');
                    };
                }
            }
            break;
    }

    // Cambiar el título del modal
    document.getElementById('sectionModalLabel').textContent = 'Editar Sección';

    // Mostrar el modal
    const sectionModal = new bootstrap.Modal(document.getElementById('sectionModal'));
    sectionModal.show();
}

function deleteSection(sectionId) {
    console.log(`Eliminando sección con ID: ${sectionId}`);

    if (!currentTopic || !currentTopic.sections) {
        console.error("No hay tema o secciones cargadas");
        return;
    }

    // Usar la nueva función de DataManager para eliminar la sección directamente del localStorage
    const success = DataManager.deleteSection(sectionId, currentTopic.id);

    if (success) {
        console.log(`Sección ${sectionId} eliminada correctamente`);

        // Actualizar el objeto currentTopic para reflejar los cambios
        currentTopic = DataManager.getTopicById(currentTopic.id);

        // Recargar la lista de secciones
        loadSections();
    } else {
        console.error(`Error al eliminar la sección ${sectionId}`);
        alert('Error al eliminar la sección. Por favor, inténtelo de nuevo.');
    }
}

function previewSection(sectionId) {
    console.log(`Previsualizando sección con ID: ${sectionId}`);


    if (!currentTopic || !currentTopic.sections) {
        console.error("No hay tema o secciones cargadas");
        return;
    }

    // Buscar la sección
    const section = currentTopic.sections.find(section => section.id == sectionId);

    if (!section) {
        console.error(`No se encontró la sección con ID ${sectionId}`);
        return;
    }

    console.log(`Previsualizando sección: "${section.title}" (Tipo: ${section.type}, Contenido: ${section.content})`);

    // Si es una actividad, verificar si existe en localStorage
    if (section.type === 'activity') {
        // Listar todas las claves de actividades en localStorage para depuración
        console.log('Claves de actividades en localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('activity')) {
                console.log(`- ${key}`);
            }
        }
    }

    // Modal para previsualizar la sección
    let previewContent = '';

    // Generar el contenido según el tipo de sección
    switch (section.type) {
        case 'text':
            previewContent = `
                <div class="section-preview-content">
                    ${section.content}
                </div>
            `;
            break;
        case 'activity':
            // Cargar la actividad desde localStorage
            try {
                // Intentar cargar la actividad con varias claves posibles
                const cleanActivityId = section.content.replace('activity_', '');
                const activityKey1 = `activity_${cleanActivityId}`;
                const activityKey2 = section.content; // Usar el ID tal como está
                const activityKey3 = `activity_data_${cleanActivityId}`;

                console.log(`Buscando actividad con claves: ${activityKey1}, ${activityKey2}, ${activityKey3}`);

                // Intentar obtener la actividad con todas las claves posibles
                let activityData = null;
                let activityStr = localStorage.getItem(activityKey1) || localStorage.getItem(activityKey2) || localStorage.getItem(activityKey3);

                try {
                    if (activityStr) {
                        activityData = JSON.parse(activityStr);
                        console.log(`Actividad encontrada: ${activityData.title || 'Sin título'}`);
                    } else {
                        console.error(`No se encontró la actividad con ninguna de las claves`);
                        // Buscar en todas las claves de localStorage que empiecen con 'activity_'
                        console.log('Buscando actividades en localStorage...');
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key && key.startsWith('activity_')) {
                                try {
                                    const data = JSON.parse(localStorage.getItem(key));
                                    if (data && data.id === section.content) {
                                        console.log(`Actividad encontrada con clave alternativa: ${key}`);
                                        activityData = data;
                                        activityStr = localStorage.getItem(key);
                                        break;
                                    }
                                } catch (e) {
                                    // Ignorar errores de parseo
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Error al parsear actividad:`, e);
                }
                if (activityData) {
                    // Crear una vista previa de la actividad
                    let questionsPreview = '';
                    if (activityData.questions && activityData.questions.length > 0) {
                        questionsPreview = '<div class="mt-3"><h6>Preguntas:</h6>';

                        // Determinar el tipo de actividad
                        const activityType = activityData.type || 'multiple-choice';

                        activityData.questions.forEach((question, index) => {
                            questionsPreview += `<div class="card mb-3 question-card">
                                <div class="card-body">
                                    <p class="fw-bold">${index + 1}. ${question.text || 'Sin texto'}</p>`;

                            // Mostrar opciones según el tipo de pregunta (como lo vería el usuario)
                            switch (activityType) {
                                case 'multiple-choice':
                                    if (question.options && question.options.length > 0) {
                                        questionsPreview += '<div class="options-list">';
                                        question.options.forEach((option, optIndex) => {
                                            questionsPreview += `
                                                <div class="form-check">
                                                    <input class="form-check-input" type="radio" name="question_${index}" id="option_${index}_${optIndex}">
                                                    <label class="form-check-label" for="option_${index}_${optIndex}">
                                                        ${option}
                                                    </label>
                                                </div>`;
                                        });
                                        questionsPreview += '</div>';
                                    } else {
                                        questionsPreview += '<p class="text-muted">No hay opciones definidas</p>';
                                    }
                                    break;

                                case 'true-false':
                                    questionsPreview += `
                                        <div class="options-list">
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="question_${index}" id="option_${index}_true">
                                                <label class="form-check-label" for="option_${index}_true">
                                                    Verdadero
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="question_${index}" id="option_${index}_false">
                                                <label class="form-check-label" for="option_${index}_false">
                                                    Falso
                                                </label>
                                            </div>
                                        </div>`;
                                    break;

                                case 'short-answer':
                                    questionsPreview += `
                                        <div class="form-group">
                                            <input type="text" class="form-control" placeholder="Tu respuesta">
                                        </div>`;
                                    break;

                                default:
                                    questionsPreview += `<p class="text-muted">Tipo de pregunta no soportado: ${activityType}</p>`;
                            }

                            questionsPreview += '</div></div>';
                        });

                        questionsPreview += '</div>';
                    }

                    // Añadir estilos personalizados para la previsualización
                    const customStyles = `
                        <style>
                            .activity-preview {
                                max-width: 100%;
                                margin: 0 auto;
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                border-radius: 5px;
                                overflow: hidden;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            }
                            .activity-header {
                                background-color: #0d6efd;
                                color: white;
                                padding: 15px 20px;
                                margin-bottom: 0;
                                font-size: 1.5rem;
                            }
                            .activity-content {
                                background-color: #ffffff;
                                padding: 20px;
                            }
                            .activity-description {
                                margin-bottom: 20px;
                                font-style: italic;
                                color: #6c757d;
                            }
                            .question-card {
                                border: 1px solid #e9ecef;
                                border-radius: 5px;
                                margin-bottom: 20px;
                                box-shadow: none;
                                background-color: #f8f9fa;
                            }
                            .question-card .card-body {
                                padding: 20px;
                            }
                            .options-list {
                                margin-top: 10px;
                            }
                            .form-check {
                                margin-bottom: 10px;
                                padding-left: 30px;
                            }
                            .form-check-input {
                                margin-top: 0.25rem;
                            }
                            .form-control {
                                padding: 10px 15px;
                                border: 1px solid #ced4da;
                                border-radius: 4px;
                                width: 100%;
                                margin-top: 5px;
                            }
                            .form-control::placeholder {
                                color: #adb5bd;
                            }
                            .activity-footer {
                                margin-top: 10px;
                                text-align: center;
                                border-top: 1px solid #e9ecef;
                                padding-top: 15px;
                            }
                        </style>
                    `;

                    previewContent = `
                        <div class="section-preview-content">
                            ${customStyles}
                            <div class="activity-preview">
                                <h3 class="activity-header">${activityData.title || 'Actividad sin título'}</h3>
                                <div class="activity-content">
                                    <p class="activity-description">${activityData.description || 'Sin descripción'}</p>
                                    ${questionsPreview}
                                    <div class="d-grid gap-2 col-md-6 mx-auto mt-4 mb-3">
                                        <button type="button" class="btn btn-success btn-lg" onclick="showPreviewSubmitMessage()">
                                            <i class="fas fa-paper-plane me-2"></i> Enviar respuestas
                                        </button>
                                    </div>
                                    <script>
                                        function showPreviewSubmitMessage() {
                                            alert('Esta es solo una vista previa. En la actividad real, este botón enviaría las respuestas para su evaluación.');
                                        }
                                    </script>
                                    <div class="activity-footer">
                                        <a href="../admin/activity-loader.html?id=${section.content}" class="btn btn-outline-primary" target="_blank">
                                            <i class="fas fa-external-link-alt me-2"></i>
                                            Ver actividad completa
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    previewContent = `
                        <div class="section-preview-content">
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                No se encontró la actividad con ID: ${section.content}
                            </div>
                            <div class="text-center">
                                <a href="../admin/activity-loader.html?id=${section.content}" class="btn btn-primary" target="_blank">
                                    <i class="fas fa-external-link-alt me-2"></i>
                                    Intentar cargar actividad
                                </a>
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error al cargar la actividad para previsualización:', error);
                previewContent = `
                    <div class="section-preview-content">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            Error al cargar la actividad: ${error.message}
                        </div>
                        <div class="text-center">
                            <a href="../admin/activity-loader.html?id=${section.content}" class="btn btn-primary" target="_blank">
                                <i class="fas fa-external-link-alt me-2"></i>
                                Ver actividad
                            </a>
                        </div>
                    </div>
                `;
            }
            break;
        case 'youtube':
            previewContent = `
                <div class="section-preview-content">
                    <div class="ratio ratio-16x9">
                        <iframe src="https://www.youtube.com/embed/${section.content}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            `;
            break;
        case 'image':
            previewContent = `
                <div class="section-preview-content">
                    <div class="image-container text-center">
                        <img src="../activities/images/${section.content}" alt="${section.title}" style="max-width: 100%; max-height: 500px;">
                    </div>
                </div>
            `;
            break;
        case 'pdf':
            previewContent = `
                <div class="section-preview-content">
                    <div class="pdf-container text-center">
                        <a href="../activities/pdf/${section.content}" target="_blank" download class="btn btn-primary">
                            <i class="fas fa-file-pdf me-2"></i> Descargar PDF
                        </a>
                    </div>
                </div>
            `;
            break;
        default:
            previewContent = `
                <div class="section-preview-content">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        La previsualización no está disponible para este tipo de contenido.
                    </div>
                </div>
            `;
    }

    // Crear y mostrar el modal de previsualización
    const previewModalId = 'sectionPreviewModal';
    let previewModal = document.getElementById(previewModalId);

    // Eliminar el modal existente si hay uno
    if (previewModal) {
        previewModal.remove();
    }

    // Crear el nuevo modal
    previewModal = document.createElement('div');
    previewModal.className = 'modal fade';
    previewModal.id = previewModalId;
    previewModal.tabIndex = '-1';
    previewModal.setAttribute('aria-labelledby', 'sectionPreviewModalLabel');
    previewModal.setAttribute('aria-hidden', 'true');

    previewModal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="sectionPreviewModalLabel">Vista previa: ${section.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    ${previewContent}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;

    // Añadir el modal al documento
    document.body.appendChild(previewModal);

    // Mostrar el modal
    const modal = new bootstrap.Modal(previewModal);
    modal.show();

    console.log(`Previsualización de sección mostrada`);
}

// Función para mover un grupo completo en el orden general
function moveGroupInOrder(groupId, direction) {
    console.log(`Moviendo grupo ${groupId} en dirección ${direction}`);

    if (!currentTopic || !currentTopic.sections) {
        console.error('No hay tema o secciones cargadas');
        return;
    }

    // Crear una estructura de elementos ordenados (secciones sueltas y grupos)
    const allSectionsWithOrder = [];
    const groupMap = {};

    // Recopilar grupos y sus secciones
    currentTopic.sections.forEach(section => {
        if (section.groupId) {
            if (!groupMap[section.groupId]) {
                groupMap[section.groupId] = {
                    id: section.groupId,
                    name: section.groupName || 'Grupo sin nombre',
                    sections: [],
                    order: section.order
                };
            } else {
                groupMap[section.groupId].order = Math.min(groupMap[section.groupId].order, section.order);
            }
            groupMap[section.groupId].sections.push(section);
        } else {
            // Secciones sueltas
            allSectionsWithOrder.push({
                type: 'section',
                data: section,
                order: section.order || 0
            });
        }
    });

    // Agregar grupos a la lista ordenada
    Object.values(groupMap).forEach(group => {
        group.sections.sort((a, b) => a.order - b.order);
        allSectionsWithOrder.push({
            type: 'group',
            data: group,
            order: group.order || 0
        });
    });

    // Ordenar todo por su orden
    allSectionsWithOrder.sort((a, b) => a.order - b.order);

    // Encontrar el grupo que queremos mover
    const currentGroupIndex = allSectionsWithOrder.findIndex(
        item => item.type === 'group' && item.data.id === groupId
    );

    if (currentGroupIndex === -1) {
        console.error(`No se encontró el grupo con ID ${groupId}`);
        return;
    }

    // Determinar el nuevo índice
    let targetIndex;
    if (direction === 'up') {
        if (currentGroupIndex === 0) {
            console.log('El grupo ya está en la primera posición');
            return;
        }
        targetIndex = currentGroupIndex - 1;
    } else if (direction === 'down') {
        if (currentGroupIndex === allSectionsWithOrder.length - 1) {
            console.log('El grupo ya está en la última posición');
            return;
        }
        targetIndex = currentGroupIndex + 1;
    } else {
        console.error(`Dirección desconocida: ${direction}`);
        return;
    }

    // Obtener el elemento objetivo (puede ser un grupo o una sección suelta)
    const currentItem = allSectionsWithOrder[currentGroupIndex];
    const targetItem = allSectionsWithOrder[targetIndex];

    console.log(`Intercambiando: ${currentItem.type} (${currentItem.data.name || currentItem.data.title}) con ${targetItem.type} (${targetItem.data.name || targetItem.data.title})`);

    // En lugar de calcular un nuevo orden arbitrario, intercambiamos los órdenes directamente
    // Esta es la corrección principal para evitar "saltos" de más de una posición
    const tempOrder = targetItem.order;

    // Actualizar el orden de todas las secciones del grupo
    const groupSections = currentTopic.sections.filter(section => section.groupId === groupId);
    groupSections.forEach(section => {
        section.order = tempOrder;
    });

    // También actualizamos el orden del elemento objetivo
    // Si es un grupo, actualizamos todas sus secciones
    if (targetItem.type === 'group') {
        const targetGroupSections = currentTopic.sections.filter(
            section => section.groupId === targetItem.data.id
        );
        targetGroupSections.forEach(section => {
            section.order = currentItem.order;
        });
    } else if (targetItem.type === 'section') {
        // Si es una sección, actualizamos solo esa
        targetItem.data.order = currentItem.order;
    }

    // Guardar los cambios
    DataManager.saveTopic(currentTopic);

    // Para mayor consistencia, siempre recargamos la página completa
    // Esto evita problemas visuales y asegura que todos los botones se actualicen correctamente
    loadSections();

    console.log(`Grupo movido correctamente`);
}

// Modificar moveSection para permitir mover secciones fuera de su contexto
function moveSection(sectionId, direction) {
    console.log(`Moviendo sección ${sectionId} en dirección ${direction}`);

    // Verificar que hay un tema actual y secciones cargadas
    if (!currentTopic || !currentTopic.sections) {
        console.error('No hay un tema o secciones cargadas');
        return;
    }

    // Convertir sectionId a string para comparaciones consistentes
    sectionId = String(sectionId);

    // Encontrar la sección actual por su ID
    const currentSection = currentTopic.sections.find(section => String(section.id) === sectionId);
    if (!currentSection) {
        console.error(`No se encontró la sección con ID ${sectionId}`);
        alert('Error: No se pudo encontrar la sección');
        return;
    }

    console.log('Sección actual:', currentSection);

    // Si la sección está en un grupo, movemos dentro del grupo
    if (currentSection.groupId) {
        moveWithinGroup(currentSection, direction);
    } else {
        // Si la sección no está en un grupo, verificamos si debe moverse fuera de su contexto
        moveUnGroupedSection(currentSection, direction);
    }
}

// Función para mover una sección dentro de su grupo
function moveWithinGroup(currentSection, direction) {
    console.log(`Moviendo sección ${currentSection.id} en dirección ${direction} dentro del grupo ${currentSection.groupId}`);

    // Obtener todas las secciones del mismo grupo
    const sectionsInGroup = currentTopic.sections.filter(section =>
        section.groupId === currentSection.groupId
    );

    // Ordenar las secciones por su orden
    sectionsInGroup.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Encontrar el índice actual
    const currentIndex = sectionsInGroup.findIndex(section => String(section.id) === String(currentSection.id));

    if (currentIndex === -1) {
        console.error('No se pudo encontrar la sección en el grupo');
        return;
    }

    // Determinar el nuevo índice
    let newIndex;
    if (direction === 'up') {
        if (currentIndex === 0) {
            console.log('Ya está en la primera posición del grupo');
            return;
        }
        newIndex = currentIndex - 1;
    } else if (direction === 'down') {
        if (currentIndex === sectionsInGroup.length - 1) {
            console.log('Ya está en la última posición del grupo');
            return;
        }
        newIndex = currentIndex + 1;
    } else {
        console.error(`Dirección desconocida: ${direction}`);
        return;
    }

    // Obtener la sección objetivo
    const targetSection = sectionsInGroup[newIndex];

    console.log(`Intercambiando con sección ${targetSection.id} (${targetSection.title || ''})`);

    // Intercambiar órdenes
    const tempOrder = currentSection.order;
    currentSection.order = targetSection.order;
    targetSection.order = tempOrder;

    // Usar la función específica para reordenar dentro del grupo
    reorderSectionsInGroup(currentSection.groupId);

    // Guardar cambios
    DataManager.saveTopic(currentTopic);


    // Para mayor consistencia, siempre recargamos la visualización completa
    // en lugar de solo actualizar el DOM directamente
    loadSections();

    console.log("Sección movida dentro del grupo exitosamente");
}

// Función para mover una sección no agrupada, considerando grupos
function moveUnGroupedSection(currentSection, direction) {
    // Crear estructura ordenada de elementos (secciones y grupos)
    const allSectionsWithOrder = [];
    const groupMap = {};

    // Recopilar grupos y secciones sueltas
    currentTopic.sections.forEach(section => {
        if (section.groupId) {
            if (!groupMap[section.groupId]) {
                groupMap[section.groupId] = {
                    id: section.groupId,
                    name: section.groupName || 'Grupo sin nombre',
                    sections: [],
                    order: section.order
                };
            } else {
                groupMap[section.groupId].order = Math.min(groupMap[section.groupId].order, section.order);
            }
            groupMap[section.groupId].sections.push(section);
        } else {
            allSectionsWithOrder.push({
                type: 'section',
                data: section,
                order: section.order || 0
            });
        }
    });

    // Agregar grupos a la lista
    Object.values(groupMap).forEach(group => {
        group.sections.sort((a, b) => a.order - b.order);
        allSectionsWithOrder.push({
            type: 'group',
            data: group,
            order: group.order || 0
        });
    });

    // Ordenar todo
    allSectionsWithOrder.sort((a, b) => a.order - b.order);

    // Encontrar la sección actual
    const currentIndex = allSectionsWithOrder.findIndex(
        item => item.type === 'section' && String(item.data.id) === String(currentSection.id)
    );

    if (currentIndex === -1) {
        console.error('No se pudo encontrar la sección en el orden general');
        return;
    }

    // Determinar nuevo índice
    let targetIndex;
    if (direction === 'up') {
        if (currentIndex === 0) {
            console.log('Ya está en la primera posición');
            return;
        }
        targetIndex = currentIndex - 1;
    } else if (direction === 'down') {
        if (currentIndex === allSectionsWithOrder.length - 1) {
            console.log('Ya está en la última posición');
            return;
        }
        targetIndex = currentIndex + 1;
    } else {
        console.error(`Dirección desconocida: ${direction}`);
        return;
    }

    // Obtener elemento objetivo
    const currentItem = allSectionsWithOrder[currentIndex];
    const targetItem = allSectionsWithOrder[targetIndex];

    console.log(`Intercambiando: ${currentItem.type} (${currentItem.data.title || ''}) con ${targetItem.type} (${targetItem.data.name || targetItem.data.title || ''})`);

    // Si el objetivo es un grupo, ajustamos el orden de la sección actual para colocarla antes o después del grupo
    if (targetItem.type === 'group') {
        // Actualizar el orden de la sección actual
        if (direction === 'up') {
            // Mover justo antes del grupo (usar exactamente el mismo orden - 0.5)
            // Esto asegura que quede antes sin saltar ninguna posición
            currentSection.order = targetItem.order - 0.5;
        } else {
            // Para mover después del grupo, necesitamos encontrar la sección que sigue al grupo
            // y colocarnos justo antes de ella
            const groupIndex = allSectionsWithOrder.findIndex(item =>
                item.type === 'group' && item.data.id === targetItem.data.id
            );

            if (groupIndex < allSectionsWithOrder.length - 1) {
                // Hay un elemento después del grupo
                const afterGroupItem = allSectionsWithOrder[groupIndex + 1];
                // Nos colocamos justo antes del siguiente elemento
                currentSection.order = afterGroupItem.order - 0.5;
            } else {
                // El grupo es el último elemento, nos colocamos después
                currentSection.order = targetItem.order + 10;
            }
        }
    } else if (targetItem.type === 'section') {
        // Para intercambiar posiciones con otra sección, usamos sus órdenes exactos
        const tempOrder = currentSection.order;
        currentSection.order = targetItem.data.order;
        targetItem.data.order = tempOrder;
    }

    // Después de un intercambio, reordenamos todos los valores para mantener consistencia
    reorderAllSections();

    // Guardar cambios
    DataManager.saveTopic(currentTopic);

    // Recargar para reflejar cambios
    loadSections();

    console.log("Sección movida correctamente");
}

// Función auxiliar para mover elementos en el DOM
function moveElementsInDOM(currentSection, targetSection, isInGroup) {
    // Obtener elementos DOM
    const currentElement = document.querySelector(`.section-item[data-section-id="${currentSection.id}"]`);
    const targetElement = document.querySelector(`.section-item[data-section-id="${targetSection.id}"]`);

    if (!currentElement || !targetElement) {
        console.warn("No se pudieron encontrar los elementos en el DOM");
        return false;
    }

    // Determinar dirección basada en orden de elementos
    const direction = targetSection.order < currentSection.order ? 'up' : 'down';

    if (isInGroup) {
        // Mover dentro del grupo
        const groupContainer = currentElement.closest('.section-group');

        if (direction === 'up') {
            groupContainer.insertBefore(currentElement, targetElement);
        } else {
            if (targetElement.nextSibling) {
                groupContainer.insertBefore(currentElement, targetElement.nextSibling);
            } else {
                groupContainer.appendChild(currentElement);
            }
        }

        // Actualizar clases visuales
        updateFirstLastClasses(groupContainer, ".section-item");
    } else {
        // Mover fuera del grupo
        const sectionsContainer = document.getElementById('sectionsContainer');

        if (direction === 'up') {
            sectionsContainer.insertBefore(currentElement, targetElement);
        } else {
            if (targetElement.nextSibling) {
                sectionsContainer.insertBefore(currentElement, targetElement.nextSibling);
            } else {
                sectionsContainer.appendChild(currentElement);
            }
        }

        // Actualizar clases visuales
        updateNonGroupedFirstLastClasses();
    }

    // Actualizar botones de navegación
    updateNavigationButtons(currentElement, isInGroup);
    updateNavigationButtons(targetElement, isInGroup);

    return true;
}

// Función para reordenar todas las secciones y evitar conflictos de orden
function reorderAllSections() {
    console.log("Reordenando todos los elementos para mantener consistencia");

    // Crear una estructura ordenada de elementos (secciones y grupos)
    const allItems = [];
    const groupMap = {};

    // Primero, recopilar todas las secciones no agrupadas
    currentTopic.sections.forEach(section => {
        if (!section.groupId) {
            allItems.push({
                type: 'section',
                data: section,
                order: section.order || 0
            });
        }
    });

    // Luego, recopilar todos los grupos
    currentTopic.sections.forEach(section => {
        if (section.groupId) {
            if (!groupMap[section.groupId]) {
                // Calculamos el orden del grupo basado en la sección con menor orden
                groupMap[section.groupId] = {
                    id: section.groupId,
                    name: section.groupName || 'Grupo sin nombre',
                    sections: [],
                    order: section.order || 0
                };
            } else if ((section.order || 0) < groupMap[section.groupId].order) {
                // Si encontramos una sección con orden menor, actualizamos el orden del grupo
                groupMap[section.groupId].order = section.order || 0;
            }

            // Agregamos la sección al grupo
            groupMap[section.groupId].sections.push(section);
        }
    });

    // Agregar los grupos a la lista de elementos
    Object.values(groupMap).forEach(group => {
        allItems.push({
            type: 'group',
            data: group,
            order: group.order
        });
    });

    // Ordenar todos los elementos por su orden actual
    allItems.sort((a, b) => a.order - b.order);

    // Asignar nuevos valores de orden secuenciales con espacios fijos entre elementos
    // Esto garantiza que no haya conflictos y que todo esté espaciado uniformemente
    const spacing = 100; // Espacio entre elementos para permitir inserciones futuras
    let orderCounter = spacing;

    // Primero asignar órdenes a los elementos principales (secciones sueltas y grupos)
    allItems.forEach(item => {
        if (item.type === 'section') {
            // Sección no agrupada
            item.data.order = orderCounter;
        } else if (item.type === 'group') {
            // Grupo - asignar el mismo orden a todas las secciones del grupo
            item.data.sections.forEach(section => {
                section.order = orderCounter;
            });
        }
        orderCounter += spacing;
    });

    // Ahora, ordenar las secciones dentro de cada grupo
    Object.values(groupMap).forEach(group => {
        // Ordenar las secciones del grupo por su orden actual
        group.sections.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Reajustar el orden de las secciones dentro del grupo
        // Todas las secciones del grupo tendrán el mismo orden base,
        // más una parte decimal para ordenarlas entre sí
        const baseOrder = group.sections[0].order;
        const inGroupSpacing = 0.1; // Espacio dentro del grupo

        group.sections.forEach((section, index) => {
            section.order = baseOrder + (index * inGroupSpacing);
        });
    });

    console.log("Reordenamiento completado");
}

// Función auxiliar para actualizar las clases first/last dentro de un contenedor
function updateFirstLastClasses(container, itemSelector) {
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (!items.length) return;

    // Eliminar todas las clases first/last
    items.forEach(item => {
        item.classList.remove('is-first', 'is-last');
    });

    // Añadir las clases a los elementos actuales
    if (items.length > 0) {
        items[0].classList.add('is-first');
        items[items.length - 1].classList.add('is-last');
    }
}

// Función para actualizar las clases first/last en secciones no agrupadas
function updateNonGroupedFirstLastClasses() {
    // Obtener todas las secciones no agrupadas
    const nonGroupedSections = document.querySelectorAll('.section-item:not([data-group-id])');

    // Eliminar todas las clases first/last
    nonGroupedSections.forEach(section => {
        section.classList.remove('is-first', 'is-last');
    });

    // Añadir clases a los elementos actuales
    if (nonGroupedSections.length > 0) {
        nonGroupedSections[0].classList.add('is-first');
        nonGroupedSections[nonGroupedSections.length - 1].classList.add('is-last');
    }
}

// Función para actualizar los botones de navegación de un elemento
function updateNavigationButtons(element, isInGroup) {
    if (!element) return;

    // Eliminar los botones de navegación existentes
    const oldUpButton = element.querySelector('.move-up-section');
    const oldDownButton = element.querySelector('.move-down-section');

    if (oldUpButton) oldUpButton.remove();
    if (oldDownButton) oldDownButton.remove();

    // Encontrar todos los elementos desplazables (secciones y grupos)
    const allMovableElements = Array.from(document.querySelectorAll('.section-item, .section-group'));

    // Encontrar el índice del elemento actual
    const elementIndex = allMovableElements.indexOf(element);
    if (elementIndex === -1) {
        console.error('No se pudo encontrar el elemento en el DOM');
        return;
    }

    // Determinar si es primera o última sección según su contexto
    let canMoveUp = false;
    let canMoveDown = false;

    if (isInGroup) {
        // Si está en un grupo, comprobar dentro del grupo
        const groupContainer = element.closest('.section-group');
        const groupSections = Array.from(groupContainer.querySelectorAll('.section-item'));

        // Puede moverse hacia arriba si no es la primera sección del grupo
        canMoveUp = groupSections.indexOf(element) > 0;

        // Puede moverse hacia abajo si no es la última sección del grupo
        canMoveDown = groupSections.indexOf(element) < groupSections.length - 1;
    } else {
        // Si no está en un grupo, verificar en el contexto general

        // Puede moverse hacia arriba si no es el primer elemento movible
        canMoveUp = elementIndex > 0;

        // Puede moverse hacia abajo si no es el último elemento movible
        canMoveDown = elementIndex < allMovableElements.length - 1;

        // Si el elemento anterior es un grupo, permitimos moverse hacia arriba
        // Esta es la corrección principal: eliminamos la condición restrictiva

        // Si el elemento siguiente es un grupo o una sección dentro de un grupo, sí permitimos mover hacia abajo
        if (canMoveDown) {
            const nextElement = allMovableElements[elementIndex + 1];
            // Si no es un grupo o una sección suelta, verificamos condiciones adicionales
            if (nextElement.classList.contains('section-item')) {
                // Solo permitimos mover hacia abajo si la siguiente sección no está en un grupo
                canMoveDown = !nextElement.hasAttribute('data-group-id');
            }
        }
    }

    // Actualizar las clases visuales del elemento
    element.classList.toggle('is-first', !canMoveUp);
    element.classList.toggle('is-last', !canMoveDown);

    // Obtener el contenedor de acciones donde insertar los botones
    const actionsContainer = element.querySelector('.section-actions');
    if (!actionsContainer) return;

    // Crear y añadir los botones según corresponda
    if (canMoveUp) {
        const moveUpButton = document.createElement('button');
        moveUpButton.className = 'btn btn-sm btn-outline-secondary move-up-section me-1';
        moveUpButton.title = 'Mover arriba';
        moveUpButton.innerHTML = '<i class="fas fa-arrow-up"></i>';

        // Insertar el botón en la posición correcta (después del botón de vista previa)
        const previewButton = actionsContainer.querySelector('.preview-section');
        if (previewButton) {
            previewButton.after(moveUpButton);
        } else {
            actionsContainer.appendChild(moveUpButton);
        }

        // Añadir el evento de click
        moveUpButton.addEventListener('click', function() {
            console.log('Botón mover-arriba clickeado');
            const sectionId = element.dataset.sectionId;
            console.log(`Moviendo sección ID: ${sectionId} hacia arriba`);
            moveSection(sectionId, 'up');
        });
    }

    if (canMoveDown) {
        const moveDownButton = document.createElement('button');
        moveDownButton.className = 'btn btn-sm btn-outline-secondary move-down-section me-1';
        moveDownButton.title = 'Mover abajo';
        moveDownButton.innerHTML = '<i class="fas fa-arrow-down"></i>';

        // Insertar el botón en la posición correcta (después del botón de subir o vista previa)
        const moveUpButton = actionsContainer.querySelector('.move-up-section');
        if (moveUpButton) {
            moveUpButton.after(moveDownButton);
        } else {
            const previewButton = actionsContainer.querySelector('.preview-section');
            if (previewButton) {
                previewButton.after(moveDownButton);
            } else {
                actionsContainer.appendChild(moveDownButton);
            }
        }

        // Añadir el evento de click
        moveDownButton.addEventListener('click', function() {
            console.log('Botón mover-abajo clickeado');
            const sectionId = element.dataset.sectionId;
            console.log(`Moviendo sección ID: ${sectionId} hacia abajo`);
            moveSection(sectionId, 'down');
        });
    }
}

// Función para restaurar la selección guardada
function restoreSelection() {
    if (savedSelection) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedSelection);
        console.log("Selección restaurada");
    } else {
        console.log("No hay selección para restaurar");
    }
}

// Función para verificar si hay texto seleccionado
function hasTextSelection() {
    try {
        const selection = window.getSelection();
        if (!selection) return false;

        // Verificar si hay algo seleccionado
        return selection.toString().length > 0;
    } catch (error) {
        console.error("Error al verificar selección de texto:", error);
        return false;
    }
}

// Función para mostrar un mensaje de ayuda en la paleta
function showPaletteMessage(message) {
    const palette = document.getElementById('colorPalette');
    if (!palette) return;

    // Eliminar mensaje anterior si existe
    const existingMsg = palette.querySelector('.color-picker-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = 'color-picker-message';
    messageDiv.style.padding = '5px';
    messageDiv.style.margin = '5px 0';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.backgroundColor = '#f8f9fa';
    messageDiv.style.color = '#333';
    messageDiv.style.fontSize = '12px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.width = '100%';
    messageDiv.innerHTML = message;

    // Insertar al principio de la paleta
    if (palette.firstChild) {
        palette.insertBefore(messageDiv, palette.firstChild);
    } else {
        palette.appendChild(messageDiv);
    }
}

function handleNewSectionClick(e) {
    console.log('Botón de Nueva Sección clickeado');

    // Limpiar los campos del formulario
    document.getElementById('sectionId').value = '';
    document.getElementById('sectionTitle').value = '';
    document.getElementById('sectionType').value = '';

    // Cambiar el título del modal
    document.getElementById('sectionModalLabel').textContent = 'Nueva Sección';

    // Limpiar campos de contenido
    document.getElementById('contentFields').innerHTML = '';
}

function editGroupName(groupId) {
    console.log(`Editando nombre del grupo ${groupId}`);

    // Buscar todas las secciones de este grupo
    const groupSections = currentTopic.sections.filter(section => section.groupId === groupId);

    if (groupSections.length === 0) {
        console.error(`No se encontraron secciones para el grupo ${groupId}`);
        return;
    }

    // Obtener el nombre actual del grupo
    const currentName = groupSections[0].groupName || '';

    // Pedir el nuevo nombre
    const newName = prompt('Ingrese el nuevo nombre para el grupo:', currentName);

    // Si se cancela el prompt o no se ingresa un nombre, no hacer nada
    if (newName === null) {
        return;
    }

    // Actualizar el nombre en todas las secciones del grupo
    groupSections.forEach(section => {
        section.groupName = newName.trim();
    });

    // Guardar los cambios
    DataManager.saveTopic(currentTopic);

    // Actualizar visualmente el nombre del grupo en el DOM
    const groupHeader = document.querySelector(`.section-group[data-group-id="${groupId}"] .section-group-header h5`);
    if (groupHeader) {
        groupHeader.textContent = `Grupo: ${newName.trim()}`;
        console.log("Nombre del grupo actualizado en el DOM");
    } else {
        // Si no se puede actualizar visualmente, recargar la lista completa
    loadSections();
    }

    console.log(`Nombre del grupo actualizado a: ${newName}`);
}

// Función para eliminar una sección
function deleteSection(sectionId) {
    console.log(`Eliminando sección con ID: ${sectionId}`);

    // Verificar que hay un tema actual y secciones cargadas
    if (!currentTopic || !currentTopic.sections) {
        console.error('No hay un tema o secciones cargadas');
        alert('Error: No se pudo eliminar la sección porque no hay un tema cargado.');
        return;
    }

    // Convertir sectionId a string para comparaciones consistentes
    sectionId = String(sectionId);

    // Encontrar el índice de la sección a eliminar
    const sectionIndex = currentTopic.sections.findIndex(section => String(section.id) === sectionId);

    if (sectionIndex === -1) {
        console.error(`No se encontró la sección con ID ${sectionId}`);
        alert('Error: No se pudo encontrar la sección para eliminar.');
        return;
    }

    // Obtener la sección para registro
    const sectionToDelete = currentTopic.sections[sectionIndex];
    console.log('Sección a eliminar:', sectionToDelete);

    // Eliminar la sección del array
    currentTopic.sections.splice(sectionIndex, 1);
    console.log(`Sección eliminada del array. Quedan ${currentTopic.sections.length} secciones`);

    // GUARDAR DIRECTAMENTE EN LOCALSTORAGE
    try {
        console.log('Guardando cambios en localStorage después de eliminar sección...');

        // 1. Obtener todos los temas actuales
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');

        // 2. Encontrar y actualizar el tema actual
        const topicIndex = allTopics.findIndex(t => t.id == currentTopic.id);

        if (topicIndex !== -1) {
            // Actualizar tema existente
            allTopics[topicIndex] = currentTopic;
            console.log(`Tema actualizado en índice ${topicIndex}`);
        } else {
            console.error('No se encontró el tema en localStorage');
        }

        // 3. Guardar todos los temas de vuelta en localStorage
        localStorage.setItem('matematicaweb_topics', JSON.stringify(allTopics));
        console.log('Cambios guardados en localStorage');

        // 4. Verificar que se haya guardado correctamente
        const savedTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        const savedTopic = savedTopics.find(t => t.id == currentTopic.id);

        if (savedTopic) {
            console.log(`Verificación: Tema encontrado en localStorage con ${savedTopic.sections ? savedTopic.sections.length : 0} secciones`);
        } else {
            console.error('Verificación fallida: No se encontró el tema en localStorage después de guardar');
        }

        // 5. Actualizar también en DataManager si está disponible (para compatibilidad)
        if (typeof DataManager !== 'undefined') {
            try {
                DataManager.saveTopic(currentTopic);
                console.log('Cambios guardados también en DataManager');
            } catch (dmError) {
                console.warn('Error al guardar en DataManager:', dmError);
            }
        }
    } catch (error) {
        console.error('Error al guardar cambios en localStorage:', error);
        alert('Error al guardar los cambios. La sección se eliminó pero no se pudieron guardar los cambios.');
    }

    // Recargar las secciones para mostrar los cambios
    loadSections();

    console.log('Sección eliminada correctamente');
}

function ungroupSections(groupId) {
    console.log(`Desagrupando secciones del grupo ${groupId}`);

    if (!confirm('¿Está seguro de que desea desagrupar estas secciones?')) {
        return;
    }

    // Buscar todas las secciones de este grupo
    const groupSections = currentTopic.sections.filter(section => section.groupId === groupId);

    if (groupSections.length === 0) {
        console.error(`No se encontraron secciones para el grupo ${groupId}`);
        return;
    }

    // Eliminar el grupo de todas las secciones
    groupSections.forEach(section => {
        delete section.groupId;
        delete section.groupName;
    });

    // Guardar los cambios
    DataManager.saveTopic(currentTopic);

    // Esta operación es más compleja para actualizar en el DOM directamente,
    // así que recargamos la lista completa
    loadSections();

    console.log(`Secciones desagrupadas correctamente`);
}

// Función para mostrar el modal de selección de secciones a agrupar
function showSectionSelectionModal(sectionId) {
    console.log(`Mostrando modal para agrupar la sección ${sectionId}`);

    // Obtener la sección actual
    const currentSection = currentTopic.sections.find(section => section.id == sectionId);
    if (!currentSection) {
        console.error(`No se encontró la sección ${sectionId}`);
        return;
    }

    // Obtener el contenedor de la lista de secciones
    const otherSectionsList = document.getElementById('otherSectionsList');
    otherSectionsList.innerHTML = '';

    // Filtrar las secciones que no son la sección actual y no están ya en un grupo
    const availableSections = currentTopic.sections.filter(section =>
        section.id != sectionId &&
        !section.groupId &&
        (currentSection.groupId ? section.groupId !== currentSection.groupId : true)
    );

    if (availableSections.length === 0) {
        otherSectionsList.innerHTML = `
            <div class="alert alert-info">
                No hay otras secciones disponibles para agrupar. Todas las secciones ya están agrupadas o solo existe esta sección.
            </div>
        `;
    } else {
        // Crear elementos para cada sección disponible
        availableSections.forEach(section => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'section-selection-item p-2 border rounded mb-2';
            sectionElement.dataset.sectionId = section.id;

            const iconData = getSectionIcon(section.type);

            sectionElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="section-type-icon me-2">
                        <i class="${iconData.class} ${iconData.icon}" style="color: ${iconData.color};"></i>
                    </div>
                    <div class="section-info flex-grow-1">
                        <h6 class="m-0">${section.title}</h6>
                        <div class="small text-muted">
                            <span class="badge bg-light text-dark">
                                <i class="${iconData.class} ${iconData.icon} me-1"></i> ${section.type}
                            </span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary select-section" data-section-id="${section.id}">
                        Seleccionar
                    </button>
                </div>
            `;

            otherSectionsList.appendChild(sectionElement);
        });

        // Añadir eventos a los botones de selección
        document.querySelectorAll('#otherSectionsList .select-section').forEach(button => {
            button.addEventListener('click', function() {
                const selectedSectionId = this.dataset.sectionId;
                prepareGrouping(sectionId, selectedSectionId);
            });
        });
    }

    // Mostrar el modal
    const sectionSelectionModal = new bootstrap.Modal(document.getElementById('sectionSelectionModal'));
    sectionSelectionModal.show();
}

// Función para preparar el agrupamiento y mostrar el modal para nombrar al grupo
function prepareGrouping(sectionId1, sectionId2) {
    console.log(`Preparando agrupación de secciones ${sectionId1} y ${sectionId2}`);

    // Cerrar el modal de selección
    const sectionSelectionModal = bootstrap.Modal.getInstance(document.getElementById('sectionSelectionModal'));
    sectionSelectionModal.hide();

    // Generar un ID único para el grupo
    const groupId = 'group_' + Date.now();

    // Guardar los IDs de las secciones y el ID del grupo en los campos ocultos
    document.getElementById('groupSectionIds').value = JSON.stringify([sectionId1, sectionId2]);
    document.getElementById('groupId').value = groupId;

    // Limpiar el campo de nombre de grupo
    document.getElementById('groupName').value = '';

    // Mostrar el modal para nombrar al grupo
    const groupNameModal = new bootstrap.Modal(document.getElementById('groupNameModal'));
    groupNameModal.show();
}

// Función para guardar el grupo después de asignarle un nombre
function saveGroup() {
    console.log('Guardando grupo de secciones');

    // Obtener los IDs de las secciones a agrupar y el ID del grupo
    const sectionIds = JSON.parse(document.getElementById('groupSectionIds').value);
    const groupId = document.getElementById('groupId').value;
    const groupName = document.getElementById('groupName').value.trim();

    if (!groupName) {
        alert('Por favor, ingrese un nombre para el grupo.');
        return;
    }

    // Verificar que las secciones existan
    const sectionsToGroup = currentTopic.sections.filter(section => sectionIds.includes(section.id.toString()));
    if (sectionsToGroup.length !== sectionIds.length) {
        console.error('No se encontraron todas las secciones para agrupar');
        alert('Ha ocurrido un error al agrupar las secciones. Por favor, inténtelo de nuevo.');
        return;
    }

    // Asignar el grupo a las secciones
    sectionsToGroup.forEach(section => {
        section.groupId = groupId;
        section.groupName = groupName;
    });

    // Guardar los cambios
    DataManager.saveTopic(currentTopic);

    // Cerrar el modal
    const groupNameModal = bootstrap.Modal.getInstance(document.getElementById('groupNameModal'));
    groupNameModal.hide();

    // Esta operación es compleja para manipular el DOM directamente,
    // así que recargamos toda la lista
    loadSections();

    console.log(`Grupo ${groupName} creado correctamente con ${sectionsToGroup.length} secciones`);
}

// Función de limpieza de emergencia accesible desde consola
window.emergencyCleanupModal = function() {
    console.log("Ejecutando limpieza de emergencia del modal...");

    // Obtener todas las instancias de modales
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal.removeAttribute('role');
    });

    // Eliminar todos los backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // Restaurar el body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    console.log("Limpieza de emergencia completada. La página debería estar desbloqueada.");
    return "Limpieza completada";
};

// Crear atajos de teclado para limpieza de emergencia
document.addEventListener('keydown', function(event) {
    // Atajo: Ctrl+Alt+X para limpieza de emergencia
    if (event.ctrlKey && event.altKey && event.key === 'x') {
        window.emergencyCleanupModal();
    }
});

// Función específica para reordenar secciones dentro de un grupo
function reorderSectionsInGroup(groupId) {
    console.log(`Reordenando secciones dentro del grupo ${groupId}`);

    if (!currentTopic || !currentTopic.sections) {
        console.error('No hay tema o secciones cargadas');
        return;
    }

    // Obtener todas las secciones del grupo
    const sectionsInGroup = currentTopic.sections.filter(section =>
        section.groupId === groupId
    );

    if (sectionsInGroup.length === 0) {
        console.warn(`No hay secciones en el grupo ${groupId}`);
        return;
    }

    // Ordenar las secciones por su orden actual
    sectionsInGroup.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Establecer un orden base para todas las secciones del grupo
    // Usamos el valor entero del orden actual de la primera sección
    const baseOrder = Math.floor(sectionsInGroup[0].order);

    // Asignar nuevos valores con incrementos de 0.1
    sectionsInGroup.forEach((section, index) => {
        const newOrder = baseOrder + (index * 0.1);
        section.order = newOrder;
        console.log(`Sección ${section.id} (${section.title || ''}) reordenada a ${newOrder}`);
    });

    console.log(`Reordenamiento del grupo ${groupId} completado`);
    return true;
}

// Función para mostrar el modal de selección de secciones para añadir a un grupo existente
function showAddToGroupModal(groupId) {
    console.log(`Mostrando modal para añadir secciones al grupo ${groupId}`);

    // Verificar que el grupo existe
    const groupSections = currentTopic.sections.filter(section => section.groupId === groupId);
    if (groupSections.length === 0) {
        console.error(`No se encontró el grupo ${groupId}`);
        alert("Error: No se encontró el grupo especificado.");
        return;
    }

    // Obtener el nombre del grupo
    const groupName = groupSections[0].groupName || 'Grupo sin nombre';

    // Obtener el contenedor de la lista de secciones
    const otherSectionsList = document.getElementById('otherSectionsList');
    otherSectionsList.innerHTML = '';

    // Actualizar el título del modal
    document.getElementById('sectionSelectionModalLabel').textContent = `Añadir secciones al grupo: ${groupName}`;

    // Filtrar las secciones que no están en ningún grupo
    const availableSections = currentTopic.sections.filter(section => !section.groupId);

    if (availableSections.length === 0) {
        otherSectionsList.innerHTML = `
            <div class="alert alert-info">
                No hay secciones disponibles para añadir al grupo. Todas las secciones ya están agrupadas.
            </div>
        `;
    } else {
        // Crear elementos para cada sección disponible
        availableSections.forEach(section => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'section-selection-item p-2 border rounded mb-2';
            sectionElement.dataset.sectionId = section.id;

            const iconData = getSectionIcon(section.type);

            sectionElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="section-type-icon me-2">
                        <i class="${iconData.class} ${iconData.icon}" style="color: ${iconData.color};"></i>
                    </div>
                    <div class="section-info flex-grow-1">
                        <h6 class="m-0">${section.title}</h6>
                        <div class="small text-muted">
                            <span class="badge bg-light text-dark">
                                <i class="${iconData.class} ${iconData.icon} me-1"></i> ${section.type}
                            </span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary add-to-group" data-section-id="${section.id}">
                        Añadir
                    </button>
                </div>
            `;

            otherSectionsList.appendChild(sectionElement);
        });

        // Añadir eventos a los botones de añadir
        document.querySelectorAll('#otherSectionsList .add-to-group').forEach(button => {
            button.addEventListener('click', function() {
                const selectedSectionId = this.dataset.sectionId;
                addSectionToGroup(selectedSectionId, groupId, groupName);
            });
        });
    }

    // Mostrar el modal
    const sectionSelectionModal = new bootstrap.Modal(document.getElementById('sectionSelectionModal'));
    sectionSelectionModal.show();
}

// Función para añadir una sección a un grupo existente
function addSectionToGroup(sectionId, groupId, groupName) {
    console.log(`Añadiendo sección ${sectionId} al grupo ${groupId}`);

    // Obtener la sección a añadir
    const section = currentTopic.sections.find(s => String(s.id) === String(sectionId));
    if (!section) {
        console.error(`No se encontró la sección ${sectionId}`);
        alert("Error: No se encontró la sección seleccionada.");
        return;
    }

    // Cerrar el modal
    const sectionSelectionModal = bootstrap.Modal.getInstance(document.getElementById('sectionSelectionModal'));
    sectionSelectionModal.hide();

    // Añadir la sección al grupo
    section.groupId = groupId;
    section.groupName = groupName;

    // Actualizar el orden para mantener consistencia
    reorderSectionsInGroup(groupId);

    // Guardar los cambios
    DataManager.saveTopic(currentTopic);

    // Recargar las secciones
    loadSections();

    console.log(`Sección ${sectionId} añadida al grupo ${groupId} correctamente`);
}

// Función para crear el botón de color en la barra de herramientas
function createColorButton() {
    console.log("Creando botón de color si no existe");

    // Verificar si el botón ya existe
    let colorBtn = document.getElementById('textColorBtn');
    if (colorBtn) {
        console.log("El botón de color ya existe");
        return colorBtn;
    }

    // Buscar la barra de herramientas
    const toolbar = document.querySelector('.math-editor-toolbar');
    if (!toolbar) {
        console.error("No se encontró la barra de herramientas para agregar el botón de color");
        return null;
    }

    // Encontrar el grupo de formato
    let formatGroup = toolbar.querySelector('.math-editor-toolbar-group');
    if (!formatGroup) {
        console.log("Creando grupo de formato en la barra de herramientas");
        formatGroup = document.createElement('div');
        formatGroup.className = 'math-editor-toolbar-group';
        toolbar.appendChild(formatGroup);
    }

    // Crear el botón de color
    colorBtn = document.createElement('button');
    colorBtn.type = 'button';
    colorBtn.id = 'textColorBtn';
    colorBtn.className = 'math-editor-btn';
    colorBtn.setAttribute('data-command', 'foreColor');
    colorBtn.title = 'Color de texto';
    colorBtn.innerHTML = '<i class="fa-solid fa-palette"></i>';
    colorBtn.style.display = 'inline-flex';
    colorBtn.style.alignItems = 'center';
    colorBtn.style.justifyContent = 'center';
    colorBtn.style.padding = '0.25rem';
    colorBtn.style.margin = '0 2px';
    colorBtn.style.border = '1px solid #ccc';
    colorBtn.style.borderRadius = '3px';
    colorBtn.style.background = '#fff';
    colorBtn.style.cursor = 'pointer';
    colorBtn.style.opacity = '1';
    colorBtn.style.visibility = 'visible';

    // Agregar el botón al grupo de formato
    formatGroup.appendChild(colorBtn);

    console.log("Botón de color creado y agregado a la barra de herramientas");

    return colorBtn;
}

function positionColorPalette(buttonElement) {
    console.log("Posicionando paleta de colores");

    const colorPalette = document.getElementById('colorPalette');
    if (!colorPalette || !buttonElement) {
        console.error("No se puede posicionar la paleta: falta la paleta o el botón de referencia");
        return;
    }

    try {
        // Obtener posición del botón
        const buttonRect = buttonElement.getBoundingClientRect();

        // Calcular posición para la paleta
        const top = buttonRect.bottom + window.scrollY + 5;
        const left = buttonRect.left + window.scrollX;

        // Aplicar posición
        colorPalette.style.position = 'absolute';
        colorPalette.style.top = `${top}px`;
        colorPalette.style.left = `${left}px`;
        colorPalette.style.zIndex = '9999';

        console.log(`Paleta posicionada en top: ${top}px, left: ${left}px`);
    } catch (error) {
        console.error("Error al posicionar la paleta de colores:", error);
    }
}

function createColorPalette() {
    console.log("Creando paleta de colores");

    // Remover paleta existente si hay una
    const existingPalette = document.getElementById('colorPalette');
    if (existingPalette) {
        console.log("Removiendo paleta existente");
        existingPalette.remove();
    }

    // Crear nuevo elemento para la paleta
    const palette = document.createElement('div');
    palette.id = 'colorPalette';
    palette.style.display = 'none';
    palette.style.position = 'absolute';
    palette.style.width = '280px';
    palette.style.padding = '10px';
    palette.style.backgroundColor = '#fff';
    palette.style.border = '1px solid #ccc';
    palette.style.borderRadius = '4px';
    palette.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    palette.style.zIndex = '9999';

    // Definir los colores organizados en filas
    const colors = [
        // Fila 1: Tonos de rojo
        ['#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC', '#FFE6E6'],
        // Fila 2: Tonos de naranja y amarillo
        ['#FF6600', '#FF9933', '#FFCC00', '#FFFF00', '#FFFF33', '#FFFF66'],
        // Fila 3: Tonos de verde
        ['#33CC33', '#66CC66', '#99CC99', '#CCFFCC', '#00FF00', '#00CC00'],
        // Fila 4: Tonos de azul
        ['#0000FF', '#3333FF', '#6666FF', '#9999FF', '#000099', '#3399FF'],
        // Fila 5: Tonos de violeta y magenta
        ['#9900CC', '#CC33CC', '#CC66CC', '#CC99CC', '#FFCCFF', '#FF00FF'],
        // Fila 6: Escala de grises
        ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF']
    ];

    // Agregar título a la paleta
    const title = document.createElement('div');
    title.textContent = 'Selecciona un color:';
    title.style.marginBottom = '8px';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '14px';
    palette.appendChild(title);

    // Crear contenedor para colores en grid
    const colorGrid = document.createElement('div');
    colorGrid.style.display = 'grid';
    colorGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
    colorGrid.style.gap = '5px';

    // Agregar cada color al grid
    colors.forEach(row => {
        row.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.dataset.color = color;
            colorOption.style.width = '100%';
            colorOption.style.height = '20px';
            colorOption.style.backgroundColor = color;
            colorOption.style.cursor = 'pointer';
            colorOption.style.border = '1px solid #ccc';
            colorOption.style.borderRadius = '2px';

            // Agregar tooltip con código de color
            colorOption.title = color;

            colorGrid.appendChild(colorOption);
        });
    });

    palette.appendChild(colorGrid);

    // Agregar sección para instrucciones
    const instructions = document.createElement('div');
    instructions.className = 'color-picker-message';
    instructions.style.marginTop = '10px';
    instructions.style.fontSize = '12px';
    instructions.style.color = '#666';
    instructions.innerHTML = '<b>Tip:</b> Selecciona texto y luego haz clic en un color para aplicarlo';
    palette.appendChild(instructions);

    // Agregar la paleta al documento
    document.body.appendChild(palette);

    console.log("Paleta de colores creada correctamente");

    return palette;
}

function initColorPickerEvents() {
    console.log("Inicializando eventos para la paleta de colores");

    // Limpiar eventos previos removiendo cualquier paleta anterior
    const existingPalette = document.getElementById('colorPalette');
    if (existingPalette) {
        existingPalette.remove();
        console.log("Paleta de colores previa eliminada");
    }

    // Variables para guardar la selección
    window.savedSelection = null;
    window.savedRange = null;

    // Función para guardar la selección actual
    const saveCurrentSelection = () => {
        try {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                window.savedRange = selection.getRangeAt(0).cloneRange();
                window.savedSelection = selection;
                console.log("Selección guardada correctamente");
                return true;
            }
        } catch (e) {
            console.error("Error al guardar selección:", e);
        }
        return false;
    };

    // Función para restaurar la selección previamente guardada
    const restoreSelection = () => {
        try {
            if (window.savedRange) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(window.savedRange);
                console.log("Selección restaurada correctamente");
                return true;
            }
        } catch (e) {
            console.error("Error al restaurar selección:", e);
        }
        return false;
    };

    // Crear la paleta de colores
    const colorPalette = createColorPalette();

    // Buscar el botón de color o crearlo si no existe
    let textColorBtn = document.getElementById('textColorBtn');
    if (!textColorBtn) {
        console.log("Botón de color no encontrado, creándolo");
        textColorBtn = createColorButton();
        if (!textColorBtn) {
            console.error("No se pudo crear el botón de color");
            return;
        }
    }

    console.log("Configurando evento para el botón de color");

    // Clonar el botón para eliminar eventos anteriores
    const newColorBtn = textColorBtn.cloneNode(true);
    if (textColorBtn.parentNode) {
        textColorBtn.parentNode.replaceChild(newColorBtn, textColorBtn);
        textColorBtn = newColorBtn;
    }

    // Establecer el estilo del botón para asegurar que sea visible
    textColorBtn.style.display = 'inline-flex';
    textColorBtn.style.visibility = 'visible';
    textColorBtn.style.opacity = '1';

    // Agregar evento al botón de color
    textColorBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log("Clic en botón de color detectado");

        // Guardar la selección actual
        saveCurrentSelection();

        // Buscar el editor y ponerle foco
        const editor = document.getElementById('mathEditorContent');
        if (editor) {
            editor.focus();
        }

        // Asegurarse de que la paleta existe
        let palette = document.getElementById('colorPalette');
        if (!palette) {
            palette = createColorPalette();
            console.log("Paleta creada porque no existía");
        }

        // Mostrar/ocultar la paleta
        if (palette.style.display === 'none' || !palette.style.display) {
            console.log("Mostrando paleta de colores");
            palette.style.display = 'block';

            // Posicionar la paleta
            const buttonRect = textColorBtn.getBoundingClientRect();
            palette.style.position = 'absolute';
            palette.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
            palette.style.left = `${buttonRect.left + window.scrollX}px`;
            palette.style.zIndex = '9999';
        } else {
            console.log("Ocultando paleta de colores");
            palette.style.display = 'none';
        }
    });

    // Configurar eventos para las opciones de color
    const colorOptions = colorPalette.querySelectorAll('.color-option');
    console.log(`Configurando ${colorOptions.length} opciones de color`);

    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.dataset.color;
            console.log(`Color seleccionado: ${color}`);

            // Restaurar la selección
            if (restoreSelection()) {
                document.execCommand('foreColor', false, color);
                console.log("Color aplicado al texto seleccionado");

                // Actualizar textarea
                const editor = document.getElementById('mathEditorContent');
                const textareaContent = document.getElementById('textContent');
                if (editor && textareaContent) {
                    textareaContent.value = editor.innerHTML;
                }
            } else {
                console.log("No se pudo restaurar la selección, aplicando color al cursor");
                const editor = document.getElementById('mathEditorContent');
                if (editor) {
                    editor.focus();
                    document.execCommand('foreColor', false, color);

                    // Actualizar textarea
                    const textareaContent = document.getElementById('textContent');
                    if (textareaContent) {
                        textareaContent.value = editor.innerHTML;
                    }
                }
            }

            // Ocultar la paleta
            colorPalette.style.display = 'none';
        });
    });

    // Cerrar la paleta al hacer clic fuera
    document.addEventListener('click', function(e) {
        const palette = document.getElementById('colorPalette');
        if (palette &&
            palette.style.display === 'block' &&
            e.target !== textColorBtn &&
            !palette.contains(e.target)) {
            console.log("Cerrando paleta por clic fuera");
            palette.style.display = 'none';
        }
    });

    console.log("Eventos de la paleta de colores inicializados correctamente");
}

function hasTextSelection() {
    const selection = window.getSelection();
    return selection && selection.toString().length > 0;
}

function showPaletteMessage(message) {
    console.log(`Mostrando mensaje en paleta: ${message}`);

    const colorPalette = document.getElementById('colorPalette');
    if (!colorPalette) return;

    // Buscar o crear contenedor para mensajes
    let messageContainer = colorPalette.querySelector('.color-picker-message');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'color-picker-message';
        messageContainer.style.marginTop = '10px';
        messageContainer.style.fontSize = '12px';
        messageContainer.style.color = '#666';
        colorPalette.appendChild(messageContainer);
    }

    // Establecer el mensaje
    messageContainer.innerHTML = message;
}

function initFormatButtons() {
    console.log("Inicializando botones de formato");

    try {
        // Verificar que el editor existe
        const editor = document.getElementById('mathEditorContent');
        if (!editor) {
            console.error("No se pudo encontrar el editor matemático");
            return;
        }

        // Asegurar que el editor es editable
        editor.contentEditable = 'true';

        // Crear botón de color y la paleta si no existen
        createColorButton();
        createColorPalette();

        // Inicializar los eventos del selector de color
        initColorPickerEvents();

        // Buscar todos los botones de formato
        const formatButtons = document.querySelectorAll('.math-editor-btn[data-command]');
        console.log(`Se encontraron ${formatButtons.length} botones de formato`);

        // Remover eventos previos clonando los botones
        formatButtons.forEach(button => {
            const command = button.getAttribute('data-command');
            if (!command) return;

            // Clonar y reemplazar para eliminar eventos previos (excepto el botón de color)
            if (command !== 'foreColor') {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                // Agregar nuevo evento
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();

                    // Enfocar el editor
                    editor.focus();

                    // Ejecutar el comando
                    try {
                        document.execCommand(command, false, null);
                        console.log(`Comando ejecutado: ${command}`);

                        // Actualizar el textarea
                        const textareaId = editor.getAttribute('data-target-textarea-id') || 'textContent';
                        const textarea = document.getElementById(textareaId);
                        if (textarea) {
                            textarea.value = editor.innerHTML;
                        }
                    } catch (error) {
                        console.error(`Error al ejecutar comando ${command}:`, error);
                    }
                });

                console.log(`Botón ${command} inicializado`);
            }
        });

        // Enfocar el editor
        editor.focus();

        console.log("Botones de formato inicializados correctamente");
    } catch (error) {
        console.error("Error al inicializar botones de formato:", error);
    }
}

// Función para guardar sección
function saveSection() {
    console.log("Iniciando guardado de sección");

    // Recoger datos del formulario
    const sectionData = {
        id: document.getElementById('sectionId')?.value || '',
        title: document.getElementById('sectionTitle')?.value || '',
        content: '',
        topicId: document.getElementById('topicSelect')?.value || currentTopicId,
        order: document.getElementById('orderInput')?.value || '0',
        type: document.getElementById('sectionType')?.value || 'text'
    };

    // Validación básica
    if (!sectionData.title) {
        alert('El título de la sección es obligatorio.');
        return false;
    }

    // Captura del contenido según el tipo de sección
    try {
        if (sectionData.type === 'text') {
            // Primero intentamos obtener el contenido del editor de texto limpio
            const cleanTextEditor = document.getElementById('cleanTextEditorContent');
            if (cleanTextEditor) {
                console.log('Obteniendo contenido del editor de texto limpio');
                sectionData.content = cleanTextEditor.innerHTML;
            } else {
                // Si no existe el editor limpio, intentamos con el editor visual antiguo
                const mathEditorContent = document.getElementById('mathEditorContent');
                if (mathEditorContent) {
                    console.log('Obteniendo contenido del editor visual antiguo');
                    sectionData.content = mathEditorContent.innerHTML;
                } else {
                    // Si no existe ningún editor visual, buscamos el textarea
                    const textareaContent = document.getElementById('textContent');
                    if (textareaContent) {
                        console.log('Obteniendo contenido del textarea');
                        sectionData.content = textareaContent.value;
                    } else {
                        console.error("No se encontró ningún editor ni el textarea");
                        alert('Error: No se pudo obtener el contenido. Por favor intente nuevamente.');
                        return false;
                    }
                }
            }
        } else if (sectionData.type === 'youtube') {
            const youtubeId = document.getElementById('youtubeId');
            if (youtubeId) {
                sectionData.content = youtubeId.value;
            }
        } else if (sectionData.type === 'geogebra') {
            const geogebraId = document.getElementById('geogebraId');
            if (geogebraId) {
                sectionData.content = geogebraId.value;
            }
        } else if (sectionData.type === 'html') {
            const htmlFilename = document.getElementById('htmlFilename');
            if (htmlFilename) {
                sectionData.content = htmlFilename.value;
            }
        } else if (sectionData.type === 'image') {
            const imageFilename = document.getElementById('imageFilename');
            if (imageFilename) {
                sectionData.content = imageFilename.value;
            }
        } else if (sectionData.type === 'pdf') {
            const pdfFilename = document.getElementById('pdfFilename');
            if (pdfFilename) {
                sectionData.content = pdfFilename.value;
            }
        } else if (sectionData.type === 'activity') {
            // Para actividades, obtenemos el ID de la actividad
            const activityId = document.getElementById('activityId');
            if (activityId && activityId.value) {
                console.log(`Procesando ID de actividad: ${activityId.value}`);

                // Extraer el ID de la actividad si viene en formato URL
                let extractedId = '';
                if (activityId.value.includes('?id=')) {
                    const urlParams = new URLSearchParams(activityId.value.split('?')[1]);
                    extractedId = urlParams.get('id');
                    console.log(`ID extraído de URL: ${extractedId}`);
                } else {
                    extractedId = activityId.value;
                    console.log(`ID tomado directamente: ${extractedId}`);
                }

                // Limpiar el ID (eliminar prefijos si existen)
                if (extractedId.startsWith('activity-loader.html?id=')) {
                    extractedId = extractedId.replace('activity-loader.html?id=', '');
                    console.log(`ID limpiado de prefijo loader: ${extractedId}`);
                }

                // Asegurar que tenga el prefijo 'activity_' para consistencia
                if (!extractedId.startsWith('activity_')) {
                    extractedId = `activity_${extractedId.replace('activity_', '')}`;
                    console.log(`ID con prefijo añadido: ${extractedId}`);
                }

                sectionData.content = extractedId;
                console.log(`ID de actividad normalizado final: ${sectionData.content}`);

                // Verificar que la actividad existe en localStorage
                const activityExists = localStorage.getItem(sectionData.content) ||
                                      localStorage.getItem(`activity_data_${sectionData.content.replace('activity_', '')}`);

                if (!activityExists) {
                    console.warn(`Advertencia: La actividad ${sectionData.content} no se encuentra en localStorage`);

                    // Intentar buscar la actividad con otras variantes del ID
                    const idWithoutPrefix = sectionData.content.replace('activity_', '');
                    const alternativeKeys = [
                        `activity_${idWithoutPrefix}`,
                        idWithoutPrefix,
                        `activity_data_${idWithoutPrefix}`
                    ];

                    console.log(`Intentando buscar actividad con IDs alternativos: ${alternativeKeys.join(', ')}`);

                    for (const key of alternativeKeys) {
                        const altData = localStorage.getItem(key);
                        if (altData) {
                            console.log(`Actividad encontrada con clave alternativa: ${key}`);
                            // Usar esta clave en su lugar
                            sectionData.content = key;
                            console.log(`Se usará la clave alternativa: ${key}`);
                            break;
                        }
                    }

                    // Verificar nuevamente si se encontró la actividad
                    const finalCheck = localStorage.getItem(sectionData.content) ||
                                      localStorage.getItem(`activity_data_${sectionData.content.replace('activity_', '')}`);

                    if (!finalCheck) {
                        // Advertir al usuario que la actividad no se encuentra
                        const confirmContinue = confirm(`ADVERTENCIA: No se pudo encontrar la actividad con ID: ${sectionData.content}\n\nSi continúa, la sección se creará pero la actividad no se mostrará correctamente.\n\n¿Desea continuar de todos modos?`);

                        if (!confirmContinue) {
                            console.log('Usuario canceló la creación de la sección debido a actividad no encontrada');
                            return false;
                        }
                    }
                }
            } else {
                console.warn('No se encontró un ID de actividad válido');
                alert('Debe crear y seleccionar una actividad antes de guardar la sección.');
                return false;
            }
        } else {
            // Para otros tipos, buscamos un campo con el nombre del tipo
            const contentField = document.getElementById(`${sectionData.type}Content`);
            if (contentField) {
                sectionData.content = contentField.value;
            }
        }
    } catch (error) {
        console.error("Error al obtener contenido:", error);
        alert('Hubo un problema al procesar el contenido. Por favor intente nuevamente.');
        return false;
    }

    console.log('Contenido recopilado para guardar:', {
        id: sectionData.id,
        title: sectionData.title,
        type: sectionData.type,
        contentLength: sectionData.content ? sectionData.content.length : 0
    });

    // Verificar que tengamos el tema actual cargado
    if (!currentTopic) {
        console.error('Error: No hay un tema cargado para guardar la sección.');
        alert('Error al guardar la sección: no se encontró el tema.');
        return false;
    }

    // Inicializar el array de secciones si no existe
    if (!currentTopic.sections) {
        currentTopic.sections = [];
    }

    // Determinar si es una nueva sección o una edición
    const isNewSection = !sectionData.id || sectionData.id === '';
    console.log(`¿Es una nueva sección? ${isNewSection}`);

    if (isNewSection) {
        // Generar un ID único para la nueva sección
        sectionData.id = Date.now().toString();
        console.log(`ID generado para nueva sección: ${sectionData.id}`);

        // Añadir la nueva sección al tema
        currentTopic.sections.push(sectionData);
        console.log(`Nueva sección añadida. Total de secciones: ${currentTopic.sections.length}`);
    } else {
        // Encontrar y actualizar la sección existente
        const sectionIndex = currentTopic.sections.findIndex(s => s.id == sectionData.id);
        if (sectionIndex !== -1) {
            // Actualizar la sección existente manteniendo otros datos
            const existingSection = currentTopic.sections[sectionIndex];
            Object.assign(existingSection, sectionData);
            console.log(`Sección existente actualizada en índice ${sectionIndex}`);
        } else {
            console.error('No se encontró la sección a editar');
            alert('Error: No se encontró la sección para actualizar.');
            return false;
        }
    }

    // GUARDAR DIRECTAMENTE EN LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    try {
        console.log('Guardando tema directamente en localStorage...');

        // 1. Obtener todos los temas actuales
        const allTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        console.log(`Temas existentes en localStorage: ${allTopics.length}`);

        // 2. Encontrar y actualizar el tema actual
        const topicIndex = allTopics.findIndex(t => t.id == currentTopic.id);

        if (topicIndex !== -1) {
            // Actualizar tema existente
            allTopics[topicIndex] = currentTopic;
            console.log(`Tema actualizado en índice ${topicIndex}`);
        } else {
            // Agregar nuevo tema
            allTopics.push(currentTopic);
            console.log('Nuevo tema agregado a la lista');
        }

        // 3. Guardar todos los temas de vuelta en localStorage
        localStorage.setItem('matematicaweb_topics', JSON.stringify(allTopics));
        console.log('Temas guardados en localStorage');

        // 4. Verificar que se haya guardado correctamente
        const savedTopics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');
        const savedTopic = savedTopics.find(t => t.id == currentTopic.id);

        if (savedTopic) {
            console.log(`Verificación: Tema encontrado en localStorage con ${savedTopic.sections ? savedTopic.sections.length : 0} secciones`);
        } else {
            console.error('Verificación fallida: No se encontró el tema en localStorage después de guardar');
        }

        // 5. Actualizar también en DataManager y DataPersistence si están disponibles (para compatibilidad)
        if (typeof DataManager !== 'undefined') {
            DataManager.saveTopic(currentTopic);
        }

        if (typeof DataPersistence !== 'undefined') {
            DataPersistence.saveData('topics', currentTopic.id, currentTopic, true);
        }

        console.log('Tema guardado correctamente en todos los sistemas');
    } catch (error) {
        console.error('Error al guardar el tema:', error);
        alert('Error al guardar los cambios. Por favor, intente nuevamente.');
        return false;
    }

    // Cerrar el modal de manera segura
    try {
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('sectionModal'));
        if (modalInstance) {
            console.log("Cerrando modal tras guardado exitoso");
            modalInstance.hide();
        }
    } catch (error) {
        console.error("Error al cerrar el modal:", error);
    }

    // Recargar las secciones para mostrar los cambios
    loadSections();

    // Notificación de éxito
    alert(isNewSection ? 'Sección creada correctamente.' : 'Sección actualizada correctamente.');

    return true;
}

// Variables globales para actividades
let currentActivityType = '';
let questions = [];
let questionCounter = 0;

// Función para mostrar las opciones de actividad según el tipo seleccionado
function showActivityOptions() {
    const activityType = document.getElementById('activityType').value;
    const activityOptions = document.getElementById('activityOptions');
    const questionsContainer = document.getElementById('questionsContainer');

    if (!activityType || !activityOptions || !questionsContainer) return;

    // Guardar el tipo de actividad actual
    currentActivityType = activityType;

    // Mostrar las opciones
    activityOptions.classList.remove('d-none');

    // Limpiar las preguntas existentes
    questionsContainer.innerHTML = '';
    questions = [];
    questionCounter = 0;

    // Agregar la primera pregunta
    addQuestion();
}

// Función para agregar una nueva pregunta
function addQuestion() {
    const questionsContainer = document.getElementById('questionsContainer');
    if (!questionsContainer) return;

    // Incrementar el contador de preguntas
    questionCounter++;

    // Crear un nuevo ID único para la pregunta
    const questionId = Date.now() + '_' + questionCounter;

    // Crear el elemento de la pregunta según el tipo de actividad
    const questionElement = document.createElement('div');
    questionElement.className = 'card mb-3';
    questionElement.id = `question-card-${questionId}`;

    let questionHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Pregunta ${questionCounter}</h5>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeQuestion('${questionId}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label for="question-text-${questionId}" class="form-label">Texto de la Pregunta</label>
                <textarea class="form-control" id="question-text-${questionId}" rows="2" placeholder="Escriba la pregunta aquí"></textarea>
            </div>
    `;

    // Agregar campos específicos según el tipo de actividad
    if (currentActivityType === 'multiple-choice') {
        questionHTML += `
            <div class="mb-3">
                <label class="form-label">Opciones</label>
                <div id="options-container-${questionId}">
                    <div class="input-group mb-2">
                        <div class="input-group-text">
                            <input class="form-check-input" type="radio" name="correct-option-${questionId}" value="1" checked>
                        </div>
                        <input type="text" class="form-control" placeholder="Opción 1" id="option-1-${questionId}">
                    </div>
                    <div class="input-group mb-2">
                        <div class="input-group-text">
                            <input class="form-check-input" type="radio" name="correct-option-${questionId}" value="2">
                        </div>
                        <input type="text" class="form-control" placeholder="Opción 2" id="option-2-${questionId}">
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary mt-2" onclick="addOption('${questionId}')">
                    <i class="fas fa-plus"></i> Agregar Opción
                </button>
            </div>
        `;
    } else if (currentActivityType === 'true-false') {
        questionHTML += `
            <div class="mb-3">
                <label class="form-label">Respuesta Correcta</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="correct-answer-${questionId}" id="true-${questionId}" value="true" checked>
                    <label class="form-check-label" for="true-${questionId}">
                        Verdadero
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="correct-answer-${questionId}" id="false-${questionId}" value="false">
                    <label class="form-check-label" for="false-${questionId}">
                        Falso
                    </label>
                </div>
            </div>
        `;
    } else if (currentActivityType === 'short-answer') {
        questionHTML += `
            <div class="mb-3">
                <label for="correct-answers-${questionId}" class="form-label">Respuestas Correctas</label>
                <input type="text" class="form-control" id="correct-answers-${questionId}" placeholder="Ingrese respuestas separadas por comas">
                <div class="form-text">Ingrese todas las posibles respuestas correctas separadas por comas.</div>
            </div>
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="case-sensitive-${questionId}">
                <label class="form-check-label" for="case-sensitive-${questionId}">
                    Distinguir mayúsculas y minúsculas
                </label>
            </div>
        `;
    }

    // Agregar campos de retroalimentación
    questionHTML += `
            <div class="mb-3">
                <label for="feedback-correct-${questionId}" class="form-label">Retroalimentación para Respuesta Correcta</label>
                <textarea class="form-control" id="feedback-correct-${questionId}" rows="2" placeholder="Mensaje cuando la respuesta es correcta"></textarea>
            </div>
            <div class="mb-3">
                <label for="feedback-incorrect-${questionId}" class="form-label">Retroalimentación para Respuesta Incorrecta</label>
                <textarea class="form-control" id="feedback-incorrect-${questionId}" rows="2" placeholder="Mensaje cuando la respuesta es incorrecta"></textarea>
            </div>
        </div>
    `;

    questionElement.innerHTML = questionHTML;
    questionsContainer.appendChild(questionElement);

    // Agregar la pregunta al array de preguntas
    questions.push({
        id: questionId,
        type: currentActivityType
    });
}

// Función para agregar una opción a una pregunta de opción múltiple
function addOption(questionId) {
    const optionsContainer = document.getElementById(`options-container-${questionId}`);
    if (!optionsContainer) return;

    // Contar cuántas opciones hay actualmente
    const optionCount = optionsContainer.querySelectorAll('.input-group').length + 1;

    // Crear una nueva opción
    const optionElement = document.createElement('div');
    optionElement.className = 'input-group mb-2';
    optionElement.innerHTML = `
        <div class="input-group-text">
            <input class="form-check-input" type="radio" name="correct-option-${questionId}" value="${optionCount}">
        </div>
        <input type="text" class="form-control" placeholder="Opción ${optionCount}" id="option-${optionCount}-${questionId}">
        <button class="btn btn-outline-danger" type="button" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    optionsContainer.appendChild(optionElement);
}

// Función para eliminar una pregunta
function removeQuestion(questionId) {
    const questionCard = document.getElementById(`question-card-${questionId}`);
    if (!questionCard) return;

    // Eliminar la pregunta del DOM
    questionCard.remove();

    // Eliminar la pregunta del array
    questions = questions.filter(q => q.id !== questionId);

    // Actualizar los números de las preguntas
    const questionCards = document.querySelectorAll('[id^="question-card-"]');
    questionCards.forEach((card, index) => {
        const headerElement = card.querySelector('.card-header h5');
        if (headerElement) {
            headerElement.textContent = `Pregunta ${index + 1}`;
        }
    });

    // Actualizar el contador
    questionCounter = questionCards.length;
}

// Función para generar el contenido de la actividad
function generateActivityContent() {
    const activityTitle = document.getElementById('activityTitle').value;
    if (!activityTitle) {
        alert('Por favor, ingrese un título para la actividad');
        return null;
    }

    // Verificar que haya al menos una pregunta
    if (questions.length === 0) {
        alert('Por favor, agregue al menos una pregunta');
        return null;
    }

    // Crear el objeto de datos de la actividad
    const activityData = {
        title: activityTitle,
        type: currentActivityType,
        questions: []
    };

    // Recopilar los datos de cada pregunta
    for (const question of questions) {
        const questionText = document.getElementById(`question-text-${question.id}`).value;
        if (!questionText) {
            alert('Por favor, complete el texto de todas las preguntas');
            return null;
        }

        const feedbackCorrect = document.getElementById(`feedback-correct-${question.id}`).value;
        const feedbackIncorrect = document.getElementById(`feedback-incorrect-${question.id}`).value;

        const questionData = {
            id: question.id,
            text: questionText,
            feedback: {
                correct: feedbackCorrect || '¡Correcto!',
                incorrect: feedbackIncorrect || 'Incorrecto. Intenta de nuevo.'
            }
        };

        // Agregar datos específicos según el tipo de pregunta
        if (currentActivityType === 'multiple-choice') {
            const optionsContainer = document.getElementById(`options-container-${question.id}`);
            const optionInputs = optionsContainer.querySelectorAll('input[type="text"]');
            const options = [];

            optionInputs.forEach((input, index) => {
                if (input.value) {
                    options.push({
                        id: index + 1,
                        text: input.value
                    });
                }
            });

            if (options.length < 2) {
                alert('Cada pregunta de opción múltiple debe tener al menos 2 opciones');
                return null;
            }

            const correctOptionRadio = document.querySelector(`input[name="correct-option-${question.id}"]:checked`);
            if (!correctOptionRadio) {
                alert('Por favor, seleccione una opción correcta para cada pregunta');
                return null;
            }

            questionData.options = options;
            questionData.correctOption = parseInt(correctOptionRadio.value);
        } else if (currentActivityType === 'true-false') {
            const correctAnswerRadio = document.querySelector(`input[name="correct-answer-${question.id}"]:checked`);
            if (!correctAnswerRadio) {
                alert('Por favor, seleccione una respuesta correcta para cada pregunta');
                return null;
            }

            questionData.correctAnswer = correctAnswerRadio.value === 'true';
        } else if (currentActivityType === 'short-answer') {
            const correctAnswersInput = document.getElementById(`correct-answers-${question.id}`);
            if (!correctAnswersInput || !correctAnswersInput.value) {
                alert('Por favor, ingrese al menos una respuesta correcta para cada pregunta');
                return null;
            }

            const correctAnswers = correctAnswersInput.value.split(',').map(answer => answer.trim()).filter(answer => answer);
            if (correctAnswers.length === 0) {
                alert('Por favor, ingrese al menos una respuesta correcta para cada pregunta');
                return null;
            }

            const caseSensitiveCheckbox = document.getElementById(`case-sensitive-${question.id}`);

            questionData.correctAnswers = correctAnswers;
            questionData.caseSensitive = caseSensitiveCheckbox.checked;
        }

        activityData.questions.push(questionData);
    }

    return activityData;
}

// Función para guardar la actividad
function saveActivity() {
    const activityData = generateActivityContent();
    if (!activityData) return null;

    // Generar un ID único para la actividad
    const activityId = 'activity_' + Date.now();

    // Determinar qué plantilla usar según el tipo de actividad
    let templateFile = '';
    switch (currentActivityType) {
        case 'multiple-choice':
            templateFile = 'multiple-choice-template.html';
            break;
        case 'true-false':
            templateFile = 'true-false-template.html';
            break;
        case 'short-answer':
            templateFile = 'short-answer-template.html';
            break;
        default:
            alert('Tipo de actividad no válido');
            return null;
    }

    // Crear una copia del archivo de plantilla en activities/templates
    try {
        // En un entorno real, aquí se copiaría la plantilla
        // y se personalizaría con los datos de la actividad
        console.log(`Creando archivo de actividad basado en ${templateFile}`);
    } catch (error) {
        console.error('Error al crear archivo de actividad:', error);
    }

    // Crear el nombre del archivo de la actividad
    const activityFilename = `activity-${activityId}.html`;

    // GUARDAR DIRECTAMENTE EN LOCALSTORAGE - ENFOQUE SIMPLIFICADO
    try {
        console.log('Guardando actividad directamente en localStorage...');

        // 1. Guardar con múltiples claves para mayor seguridad
        localStorage.setItem(`activity_data_${activityId}`, JSON.stringify(activityData));
        localStorage.setItem(activityId, JSON.stringify(activityData));

        // 2. Verificar que se haya guardado correctamente
        const savedData1 = localStorage.getItem(`activity_data_${activityId}`);
        const savedData2 = localStorage.getItem(activityId);

        if (savedData1 && savedData2) {
            console.log(`Verificación: Actividad guardada correctamente con ambas claves`);
        } else {
            console.error('Verificación fallida: No se guardó correctamente la actividad');
            if (!savedData1) console.error(`Falta clave activity_data_${activityId}`);
            if (!savedData2) console.error(`Falta clave ${activityId}`);
        }

        // 3. Actualizar el registro de actividades
        let activityRegistry = [];
        try {
            activityRegistry = JSON.parse(localStorage.getItem('activity_registry') || '[]');
        } catch (parseError) {
            console.warn('Error al parsear el registro de actividades, creando uno nuevo:', parseError);
        }

        // Agregar la nueva actividad al registro
        activityRegistry.push({
            id: activityId,
            title: activityData.title,
            type: activityData.type,
            created: Date.now()
        });

        // Guardar el registro actualizado
        localStorage.setItem('activity_registry', JSON.stringify(activityRegistry));
        console.log(`Actividad registrada en el registro de actividades (total: ${activityRegistry.length})`);

        // 4. Guardar también en el sistema de persistencia si está disponible (para compatibilidad)
        if (typeof DataPersistence !== 'undefined') {
            try {
                DataPersistence.saveData('activities', activityId, activityData, true);
                console.log('Actividad guardada también en el sistema de persistencia');
            } catch (persistenceError) {
                console.warn('Error al guardar en el sistema de persistencia:', persistenceError);
            }
        }

        console.log('Actividad guardada correctamente en todos los sistemas');
    } catch (error) {
        console.error('Error al guardar la actividad:', error);
        alert('Error al guardar la actividad. Por favor, intente nuevamente.');
        return null;
    }

    // Mostrar información
    const activityInfo = document.getElementById('activityInfo');
    const activityInfoText = document.getElementById('activityInfoText');
    const activityIdInput = document.getElementById('activityId');
    const activityIdDisplay = document.getElementById('activityIdDisplay');

    if (activityInfo && activityInfoText && activityIdInput) {
        activityInfo.classList.remove('d-none');
        activityInfoText.textContent = `Actividad creada con éxito: ${activityData.title}`;

        // Guardar el ID sin formato de URL para evitar problemas
        activityIdInput.value = activityId;
        console.log(`ID de actividad guardado en el campo: ${activityId}`);

        // Mostrar el ID en el elemento de visualización
        if (activityIdDisplay) {
            activityIdDisplay.textContent = activityId;
        }

        // Agregar botón para ver/editar la actividad
        const viewActivityBtn = document.getElementById('viewActivityBtn');
        if (viewActivityBtn) {
            viewActivityBtn.classList.remove('d-none');
            viewActivityBtn.onclick = function() {
                window.open(`../admin/activity-loader.html?id=${activityId}`, '_blank');
            };
        }
    }

    return activityId;
}

// Función para crear una nueva actividad
function createNewActivity() {
    console.log('Creando nueva actividad...');

    // Verificar si estamos en el nuevo flujo de creación de actividades
    if (currentActivityType) {
        console.log('Usando nuevo flujo de creación de actividades con tipo:', currentActivityType);
        const activityId = saveActivity();

        // Verificar que se haya guardado correctamente
        if (activityId) {
            console.log(`Actividad creada con ID: ${activityId}`);

            // Verificar que esté en localStorage
            const savedData = localStorage.getItem(`activity_data_${activityId}`);
            if (savedData) {
                console.log('Verificación: Actividad encontrada en localStorage');
            } else {
                console.error('Verificación fallida: No se encontró la actividad en localStorage');
            }
        }

        return activityId;
    }

    // Código anterior para compatibilidad
    console.log('Usando flujo antiguo de creación de actividades');
    const activityId = 'activity_' + Date.now();

    // Guardar en múltiples ubicaciones para mayor seguridad
    localStorage.setItem('currentActivityId', activityId);

    // Abrir el editor de actividades
    window.open('../activities/editor.html', '_blank');

    // Mostrar información
    const activityInfo = document.getElementById('activityInfo');
    const activityInfoText = document.getElementById('activityInfoText');
    const activityIdInput = document.getElementById('activityId');

    if (activityInfo && activityInfoText && activityIdInput) {
        activityInfo.classList.remove('d-none');
        activityInfoText.textContent = `Se ha creado una nueva actividad con ID: ${activityId}. Por favor, complete la actividad en la ventana abierta.`;
        activityIdInput.value = activityId;

        // Agregar botón para ver/editar la actividad
        const viewActivityBtn = document.getElementById('viewActivityBtn');
        if (viewActivityBtn) {
            viewActivityBtn.classList.remove('d-none');
            viewActivityBtn.onclick = function() {
                window.open(`../admin/activity-loader.html?id=${activityId}`, '_blank');
            };
        }
    }

    return activityId;
}

// Función para abrir el selector de actividades existentes
function openActivitySelector() {
    alert('Esta funcionalidad está en desarrollo. Por favor, cree una nueva actividad.');
}

// Función para verificar el estado de las actividades en localStorage
function debugActivities() {
    console.log('=== DEPURACIÓN DE ACTIVIDADES ===');

    // Recopilar todas las claves de actividades
    const activityKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('activity_') && !key.startsWith('activity_registry')) {
            activityKeys.push(key);
        }
    }

    console.log(`Se encontraron ${activityKeys.length} claves de actividades en localStorage:`);
    activityKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            console.log(`- ${key}: ${data ? (data.title || 'Sin título') : 'Sin datos'} (ID: ${data ? data.id : 'N/A'})`);
        } catch (e) {
            console.log(`- ${key}: Error al parsear datos`);
        }
    });

    // Verificar el registro de actividades
    try {
        const registry = JSON.parse(localStorage.getItem('activity_registry') || '[]');
        console.log(`Registro de actividades: ${registry.length} entradas`);
        registry.forEach(entry => {
            console.log(`- Registro: ${entry.id} - ${entry.title || 'Sin título'}`);
        });
    } catch (e) {
        console.log('Error al parsear el registro de actividades:', e);
    }

    console.log('=== FIN DE DEPURACIÓN ===');
}
