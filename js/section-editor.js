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
    const sectionsContainer = document.getElementById('sectionsContainer');
    if (!sectionsContainer) return;
    
    // Limpiar el contenedor
    sectionsContainer.innerHTML = '';
    
    // Si no hay tema, mostrar mensaje
    if (!currentTopic) {
        sectionsContainer.innerHTML = '<div class="alert alert-info">No hay un tema seleccionado</div>';
        return;
    }
    
    // Si no hay secciones, mostrar mensaje
    if (!currentTopic.sections || currentTopic.sections.length === 0) {
        sectionsContainer.innerHTML = '<div class="alert alert-info">Este tema no tiene secciones</div>';
        return;
    }
    
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
    typeLabel.innerHTML = `
                    <span class="badge bg-light text-dark">
            <i class="${iconData.class} ${iconData.icon} me-1"></i> ${section.type}
                    </span>
    `;
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
            
            // Inicializar el editor matemático después de un pequeño retraso
            setTimeout(() => {
                try {
                    console.log("Inicializando editor matemático para nueva sección de texto");
                    if (typeof initNewMathEditor === 'function') {
                        const success = initNewMathEditor('textContent');
                        console.log(`Editor matemático inicializado con éxito: ${success}`);
                        
                        // Inicializar los botones de formato después de un breve retraso
                        setTimeout(() => {
                            if (typeof initFormatButtons === 'function') {
                                console.log("Inicializando botones de formato para nueva sección");
                                initFormatButtons();
                                
                                // Inicializar explícitamente los eventos de la paleta de colores
                                setTimeout(() => {
                                    console.log("Inicializando eventos de color para nueva sección");
                                    initColorPickerEvents();
                                    
                                    // Verificar si el botón de color es visible
                                    const colorBtn = document.getElementById('textColorBtn');
                                    if (colorBtn) {
                                        colorBtn.style.display = 'inline-flex';
                                        colorBtn.style.visibility = 'visible';
                                        colorBtn.style.opacity = '1';
                                    }
                                }, 500);
                            }
                        }, 300);
                    } else {
                        console.error("La función initNewMathEditor no está disponible");
                    }
                } catch (error) {
                    console.error("Error al inicializar el editor:", error);
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
            // Campo para subir imagen
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="imageUpload" class="form-label">Subir Imagen</label>
                    <input class="form-control" type="file" id="imageUpload" accept="image/*">
                </div>
            `;
            break;
            
        case 'pdf':
            // Campo para subir PDF
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="pdfUpload" class="form-label">Subir PDF</label>
                    <input class="form-control" type="file" id="pdfUpload" accept="application/pdf">
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
            // Opción para crear nueva actividad o seleccionar existente
            contentFields.innerHTML = `
                <div class="mb-3">
                    <label for="activityId" class="form-label">Seleccionar Actividad</label>
                    <input type="hidden" id="activityId">
                    <div class="d-grid gap-2">
                        <button type="button" class="btn btn-outline-primary" onclick="openActivitySelector()">
                            <i class="fas fa-list-ul"></i> Seleccionar Actividad Existente
                        </button>
                        <button type="button" class="btn btn-outline-success" onclick="createNewActivity()">
                            <i class="fas fa-plus"></i> Crear Nueva Actividad
                        </button>
                    </div>
                    <div id="activityInfo" class="mt-3 d-none alert alert-info">
                        <span id="activityInfoText"></span>
                    </div>
                </div>
            `;
            break;
            
        default:
            contentFields.innerHTML = '<p class="text-muted">Seleccione un tipo de contenido para ver las opciones.</p>';
    }
    
    console.log(`Campos configurados para tipo: ${contentType}`);
}

function createNewActivity() {
    // Registrar la acción en el log
    if (typeof Logger !== 'undefined') {
        Logger.info('Iniciando creación de actividad desde el editor de secciones');
    } else {
        console.log('Iniciando creación de actividad desde el editor de secciones');
    }

    // Abrir el creador de actividades en una nueva ventana
    window.open('activity-creator-simple.html', '_blank', 'width=1200,height=800');

    // Escuchar el mensaje de la ventana del creador de actividades
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'activity_created') {
            // Actualizar el campo de actividad con el nombre del archivo
            document.getElementById('activityId').value = event.data.filename;

            // Registrar la acción en el log
            if (typeof Logger !== 'undefined') {
                Logger.info('Actividad recibida en el editor de secciones', {
                    filename: event.data.filename,
                    title: event.data.title,
                    activityId: event.data.activityId
                });
            } else {
                console.log('Actividad recibida en el editor de secciones:', {
                    filename: event.data.filename,
                    title: event.data.title,
                    activityId: event.data.activityId
                });
            }

            // Mostrar la información de la actividad creada
            const activityInfo = document.getElementById('activityInfo');
            const activityInfoText = document.getElementById('activityInfoText');

            if (activityInfo && activityInfoText) {
                activityInfoText.textContent = `Actividad "${event.data.title}" creada correctamente.`;
                activityInfo.classList.remove('d-none');
            } else {
                // Fallback si no se encuentran los elementos
                alert(`Actividad "${event.data.title}" creada correctamente.`);
            }
        }
    });
}

function openActivitySelector() {
    // Esta función ya no se usa, pero la mantenemos por compatibilidad

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

    // Asegurarse de que sectionId sea numérico para comparaciones consistentes
    if (typeof sectionId === 'string' && !isNaN(sectionId)) {
        sectionId = parseInt(sectionId);
    }

    const section = currentTopic.sections.find(s => s.id == sectionId);
    if (!section) {
        console.error(`No se encontró la sección con ID ${sectionId}`);
        return;
    }

    console.log(`Editando sección: "${section.title}" (ID: ${section.id}, Tipo: ${section.type})`);

    // Limpiar cualquier instancia anterior del editor
    if (typeof window.cleanupMathEditor === 'function') {
        try {
            window.cleanupMathEditor();
            console.log("Editor matemático limpiado correctamente");
        } catch (error) {
            console.error("Error al limpiar editor existente:", error);
        }
    }

    // Eliminar elementos relacionados con el editor que pudieran haber quedado
    document.getElementById('colorPalette')?.remove();
    document.getElementById('mathSymbolsDropdown')?.remove();
    document.getElementById('equationModal')?.remove();
    document.getElementById('tableModal')?.remove();
    document.getElementById('latexTemplatesModal')?.remove();

    // Remover cualquier instancia previa del editor matemático
    const previousEditor = document.querySelector('.math-editor-container');
    if (previousEditor) {
        console.log("Removiendo editor matemático previo del DOM");
        previousEditor.remove();
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

                    // Inicializar el editor con varias verificaciones y un sistema de reintentos
                    let editorInitialized = false;
                    let attemptCount = 0;
                    const maxAttempts = 3;
                    
                    function attemptInitEditor() {
                        if (editorInitialized || attemptCount >= maxAttempts) return;
                        
                        attemptCount++;
                        console.log(`Intento ${attemptCount}/${maxAttempts} de inicializar el editor...`);
                        
                        try {
                            if (typeof initNewMathEditor === 'function') {
                                console.log("Usando el nuevo editor matemático...");
                                const success = initNewMathEditor('textContent');
                                
                                if (success) {
                                    editorInitialized = true;
                                    console.log("Editor inicializado correctamente");
                                    
                                    // Esperar a que se complete la inicialización antes de configurar botones
                                    setTimeout(() => {
                                        console.log("Verificando editor y configurando botones...");
                                        
                                        // Verificar que el editor esté en el DOM y sea editable
                                        const mathEditor = document.getElementById('mathEditorContent');
                                        if (mathEditor) {
                                            // Asegurar que sea editable
                                            mathEditor.contentEditable = 'true';
                                            
                                            // Ocultar el textarea original
                                            if (textContentElem) {
                                                textContentElem.style.display = 'none';
                                            }
                                            
                                            // Inicializar los botones de formato con un retraso adicional
                                            setTimeout(() => {
                                                if (typeof initFormatButtons === 'function') {
                                                    try {
                                                        console.log("Inicializando botones de formato explícitamente...");
                                                        initFormatButtons();
                                                        
                                                        // Inicializar eventos de color picker usando nuestra función auxiliar
                                                        setTimeout(() => {
                                                            console.log("Inicializando selector de color de manera directa");
                                                            createColorButton();
                                                            createColorPalette();
                                                            
                                                            // Añadir inicialización de eventos para la paleta de colores
                                                            initColorPickerEvents();
                                                            
                                                            // Verificar si el botón existe y tiene el evento
                                                            const colorBtn = document.getElementById('textColorBtn');
                                                            if (colorBtn) {
                                                                // Asegurarnos que el botón es visible
                                                                colorBtn.style.display = 'inline-flex';
                                                                colorBtn.style.visibility = 'visible';
                                                                colorBtn.style.opacity = '1';
                                                                
                                                                console.log("Botón de color verificado y visible");
                                                            }
                                                        }, 600);
                                                        
                                                        // Verificar que los botones respondan a eventos
                                                        console.log("Botones inicializados, ahora verificando funcionalidad...");
                                                        
                                                        // Enfocar el editor para permitir la edición
                                                        mathEditor.focus();
                                                    } catch (error) {
                                                        console.error("Error al inicializar botones de formato:", error);
                                                    }
                                                } else {
                                                    console.error("Función initFormatButtons no disponible");
                                                }
                                            }, 500);
                                        } else {
                                            console.error("Editor no encontrado después de inicialización");
                                            
                                            // Si no hay editor, mostrar el textarea
                                            if (textContentElem) {
                                                textContentElem.style.display = 'block';
                                            }
                                        }
                                    }, 300);
                                } else {
                                    console.error("Fallo al inicializar el editor en el intento " + attemptCount);
                                    
                                    // Reintentar después de un tiempo
                                    if (attemptCount < maxAttempts) {
                                        setTimeout(attemptInitEditor, 500);
                                    } else {
                                        // Si agotamos los intentos, mostrar el textarea
                                        console.error("Agotados los intentos de inicializar el editor");
                                        textContentElem.style.display = 'block';
                                    }
                                }
                            } else {
                                console.error("Función initNewMathEditor no disponible");
                                textContentElem.style.display = 'block';
                            }
                        } catch (error) {
                            console.error("Error durante la inicialización del editor:", error);
                            if (attemptCount < maxAttempts) {
                                setTimeout(attemptInitEditor, 500);
                            } else {
                                textContentElem.style.display = 'block';
                            }
                        }
                    }
                    
                    // Iniciar el proceso de inicialización
                    attemptInitEditor();
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
            // No podemos establecer el valor de un input file, solo mostrar el nombre
            break;
        case 'image':
            // No podemos establecer el valor de un input file, solo mostrar el nombre
            break;
        case 'activity':
            document.getElementById('activityId').value = section.content;

            // Mostrar la información de la actividad
            const activityInfo = document.getElementById('activityInfo');
            const activityInfoText = document.getElementById('activityInfoText');

            if (activityInfo && activityInfoText) {
                // Extraer el nombre de la actividad del contenido
                const activityPath = section.content;
                activityInfoText.textContent = `Actividad asignada: ${activityPath}`;
                activityInfo.classList.remove('d-none');
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
    
    // Buscar el índice de la sección
    const sectionIndex = currentTopic.sections.findIndex(section => section.id == sectionId);
    
    if (sectionIndex === -1) {
        console.error(`No se encontró la sección con ID ${sectionId}`);
        return;
    }
    
    // Eliminar la sección del array
    currentTopic.sections.splice(sectionIndex, 1);
    
    // Guardar los cambios
    DataManager.saveTopic(currentTopic);
    
    // Recargar la lista de secciones
    loadSections();
    
    console.log(`Sección eliminada correctamente`);
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
            previewContent = `
                <div class="section-preview-content">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Actividad con ID: ${section.content}
                    </div>
                    <div class="text-center">
                        <a href="activity-loader.html?id=${section.content}" class="btn btn-primary" target="_blank">
                            <i class="fas fa-external-link-alt me-2"></i>
                            Ver actividad
                        </a>
                    </div>
                </div>
            `;
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
            // Para texto, intentamos obtener el contenido del editor visualmente
            const mathEditorContent = document.getElementById('mathEditorContent');
            if (mathEditorContent) {
                console.log('Obteniendo contenido del editor visual');
                sectionData.content = mathEditorContent.innerHTML;
            } else {
                // Si no existe el editor visual, buscamos el textarea
                const textareaContent = document.getElementById('textContent');
                if (textareaContent) {
                    console.log('Obteniendo contenido del textarea');
                    sectionData.content = textareaContent.value;
                } else {
                    console.error("No se encontró el editor ni el textarea");
                    alert('Error: No se pudo obtener el contenido. Por favor intente nuevamente.');
                    return false;
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
        } else if (sectionData.type === 'activity') {
            // Para actividades, obtenemos el ID de la actividad
            const activityId = document.getElementById('activityId');
            if (activityId) {
                sectionData.content = activityId.value;
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
    
    // Guardar los cambios usando DataManager
    try {
        DataManager.saveTopic(currentTopic);
        console.log('Tema guardado correctamente');
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




