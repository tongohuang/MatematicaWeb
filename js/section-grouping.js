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
            
            // Asegurar que usamos la función getSectionIcon que está definida en section-editor.js
            // Si no es accesible, usar una versión simplificada
            let typeIcon;
            if (typeof getSectionIcon === 'function') {
                typeIcon = getSectionIcon(section.type);
                // Compatibilidad con las propiedades del objeto retornado
                typeIcon.iconClass = typeIcon.class || typeIcon.iconClass || 'fas';
                typeIcon.label = typeIcon.label || section.type;
            } else {
                // Función simplificada para obtener ícono
                typeIcon = {
                    icon: 'fa-file',
                    label: section.type,
                    color: '#6c757d',
                    iconClass: 'fas'
                };
                console.warn('getSectionIcon no está disponible, usando ícono predeterminado');
            }
            
            sectionElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="section-type-icon me-2">
                        <i class="${typeIcon.iconClass} ${typeIcon.icon}" style="color: ${typeIcon.color};"></i>
                    </div>
                    <div class="section-info flex-grow-1">
                        <h6 class="m-0">${section.title}</h6>
                        <div class="small text-muted">
                            <span class="badge bg-light text-dark">
                                <i class="${typeIcon.iconClass} ${typeIcon.icon} me-1"></i> ${typeIcon.label}
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
    
    // Recargar la lista de secciones
    loadSections();
    
    console.log(`Grupo ${groupName} creado correctamente con ${sectionsToGroup.length} secciones`);
}
