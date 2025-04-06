/**
 * Sidebar para drag and drop en el editor de secciones
 * Esta clase implementa un menú lateral para facilitar la reorganización de secciones
 */
class SectionSidebar {
    /**
     * Constructor
     * @param {Object} options - Opciones de configuración
     */
    constructor(options = {}) {
        this.options = Object.assign({
            containerId: 'section-editor-container',
            onSectionMove: null,
            onOrderChange: null
        }, options);
        
        this.sidebarElement = null;
        this.mainContainer = null;
        this.isOpen = false;
        
        this.init();
    }
    
    /**
     * Inicializar el sidebar
     */
    init() {
        console.log('Inicializando sidebar...');
        
        // Verificar si currentTopic está disponible
        if (!window.currentTopic) {
            console.error('ERROR: currentTopic no está disponible al inicializar el sidebar.');
            console.log('Intentando inicializar sidebar de nuevo en 1.5 segundos...');
            
            setTimeout(() => {
                this.init();
            }, 1500);
            return;
        }
        
        // Crear la estructura del sidebar
        this.createSidebarStructure();
        
        // Añadir estilos
        this.addStyles();
        
        // Cargar contenido
        this.loadContent();
        
        // Inicializar eventos de drag and drop
        this.initDragDrop();
        
        console.log('Sidebar inicializado correctamente');
    }
    
    /**
     * Crear la estructura del sidebar
     */
    createSidebarStructure() {
        // Obtener o crear el contenedor principal
        const container = document.getElementById(this.options.containerId);
        if (!container) {
            console.error(`No se encontró el contenedor con ID: ${this.options.containerId}`);
            return;
        }
        
        // Crear layout principal
        this.mainContainer = document.createElement('div');
        this.mainContainer.className = 'section-editor-layout';
        
        // Mover el contenido original a un contenedor principal
        const mainContent = document.createElement('div');
        mainContent.className = 'section-editor-main';
        
        // Mover todos los hijos originales al nuevo contenedor principal
        while (container.firstChild) {
            mainContent.appendChild(container.firstChild);
        }
        
        // Crear el sidebar
        this.sidebarElement = document.createElement('div');
        this.sidebarElement.id = 'sections-sidebar';
        this.sidebarElement.className = 'sections-sidebar card';
        
        // Añadir encabezado
        const header = document.createElement('div');
        header.className = 'card-header bg-primary text-white d-flex justify-content-between align-items-center';
        header.innerHTML = `
            <h5 class="mb-0">Organizar Secciones</h5>
            <button type="button" class="btn-close btn-close-white" aria-label="Cerrar" id="closeSidebar"></button>
        `;
        this.sidebarElement.appendChild(header);
        
        // Añadir contenido
        const content = document.createElement('div');
        content.className = 'card-body sidebar-content';
        content.innerHTML = `
            <div class="alert alert-info small">
                <p class="mb-1"><strong>Instrucciones:</strong></p>
                <ul class="mb-0 ps-3">
                    <li>Arrastra y suelta las secciones para reordenarlas</li>
                    <li>Puedes moverlas entre diferentes grupos</li>
                    <li>También puedes moverlas fuera de cualquier grupo</li>
                    <li>Arrastra un grupo completo desde la barra de título (=)</li>
                </ul>
            </div>
            <div id="sidebar-sections-list" class="sidebar-sections-list"></div>
        `;
        this.sidebarElement.appendChild(content);
        
        // Añadir al layout principal
        this.mainContainer.appendChild(mainContent);
        this.mainContainer.appendChild(this.sidebarElement);
        
        // Añadir el layout al contenedor original
        container.appendChild(this.mainContainer);
        
        // Añadir botón para mostrar el sidebar
        this.addToggleButton();
        
        // Eventos para cerrar el sidebar
        header.querySelector('#closeSidebar').addEventListener('click', () => this.close());
        
        console.log('Estructura del sidebar creada correctamente');
    }
    
    /**
     * Cargar contenido del sidebar
     */
    loadContent() {
        console.log('Cargando contenido del sidebar...');
        
        const sectionsList = document.getElementById('sidebar-sections-list');
        if (!sectionsList) {
            console.error('No se encontró el elemento sidebar-sections-list');
            return;
        }
        
        // Limpiar contenido existente
        sectionsList.innerHTML = '';
        
        // Verificar si existe currentTopic y tiene secciones
        if (!window.currentTopic) {
            console.error('No se encontró el objeto currentTopic en window');
            sectionsList.innerHTML = '<div class="alert alert-warning">No se pudo cargar la información del tema.</div>';
            return;
        }
        
        if (!window.currentTopic.sections || window.currentTopic.sections.length === 0) {
            console.log('El tema no tiene secciones');
            sectionsList.innerHTML = '<div class="alert alert-info">Este tema no tiene secciones todavía.</div>';
            return;
        }
        
        console.log(`Tema encontrado: ${window.currentTopic.title}, con ${window.currentTopic.sections.length} secciones`);
        
        // Verificar integridad de grupos - eliminar secciones con grupos inexistentes
        this.verifyGroupIntegrity();
        
        // Agrupar secciones por grupos pero mantener el orden original
        const groups = {};
        const allSectionsByOrder = [];
        
        // Ordenar secciones por orden o ID
        const sortedSections = [...window.currentTopic.sections].sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : a.id;
            const orderB = b.order !== undefined ? b.order : b.id;
            return orderA - orderB;
        });
        
        // Primer paso: identificar todos los grupos y sus secciones
        sortedSections.forEach(section => {
            if (section.groupId) {
                if (!groups[section.groupId]) {
                    groups[section.groupId] = {
                        id: section.groupId,
                        name: section.groupName || 'Grupo sin nombre',
                        sections: [],
                        order: section.order // Usar el orden de la primera sección del grupo
                    };
                }
                groups[section.groupId].sections.push(section);
                
                // Actualizar el orden del grupo al mínimo entre todas sus secciones
                const sectionOrder = section.order !== undefined ? section.order : section.id;
                if (groups[section.groupId].order > sectionOrder || groups[section.groupId].order === undefined) {
                    groups[section.groupId].order = sectionOrder;
                }
            } else {
                // Las secciones no agrupadas se tratan como elementos individuales
                allSectionsByOrder.push({
                    type: 'section',
                    data: section,
                    order: section.order !== undefined ? section.order : section.id
                });
            }
        });
        
        // Convertir grupos a elementos ordenados
        Object.values(groups).forEach(group => {
            allSectionsByOrder.push({
                type: 'group',
                data: group,
                order: group.order
            });
        });
        
        // Ordenar todos los elementos (grupos y secciones) por su orden
        allSectionsByOrder.sort((a, b) => a.order - b.order);
        
        console.log(`Elementos ordenados: ${allSectionsByOrder.length} (${Object.keys(groups).length} grupos y ${allSectionsByOrder.length - Object.keys(groups).length} secciones independientes)`);
        
        // Renderizar todos los elementos en el orden correcto
        allSectionsByOrder.forEach(item => {
            if (item.type === 'group') {
                const group = item.data;
                console.log(`Renderizando grupo: ${group.name} con ${group.sections.length} secciones`);
                
                const groupElement = document.createElement('div');
                groupElement.className = 'sidebar-group mb-3';
                groupElement.dataset.id = group.id;
                
                // Cabecera del grupo con ícono de agarre para arrastrar
                groupElement.innerHTML = `
                    <div class="sidebar-group-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <span class="sidebar-group-handle me-2">
                                    <i class="fas fa-grip-lines"></i>
                                </span>
                                <span class="sidebar-group-title">${group.name}</span>
                            </div>
                            <span class="badge bg-secondary">${group.sections.length}</span>
                        </div>
                    </div>
                    <div class="sidebar-group-content" data-group-id="${group.id}">
                        <!-- Las secciones del grupo se renderizarán aquí -->
                    </div>
                `;
                
                sectionsList.appendChild(groupElement);
                
                // Configurar el drag & drop para el grupo
                const header = groupElement.querySelector('.sidebar-group-header');
                if (header) {
                    header.setAttribute('draggable', 'true');
                    
                    // Inicio del arrastre del grupo
                    header.addEventListener('dragstart', (e) => {
                        e.stopPropagation();
                        console.log('Dragstart en grupo:', group.id);
                        e.dataTransfer.setData('text/plain', group.id);
                        e.dataTransfer.setData('elementType', 'group');
                        groupElement.classList.add('dragging');
                        this._draggedElement = groupElement;
                        
                        // Ocultar ligeramente el grupo
                        setTimeout(() => {
                            groupElement.style.opacity = '0.4';
                        }, 0);
                    });
                    
                    // Fin del arrastre del grupo
                    header.addEventListener('dragend', (e) => {
                        e.stopPropagation();
                        console.log('Dragend en grupo:', group.id);
                        groupElement.classList.remove('dragging');
                        groupElement.style.opacity = '';
                        this._draggedElement = null;
                        
                        // Guardar el nuevo orden
                        this.saveNewOrder();
                    });
                }
                
                // Renderizar secciones del grupo
                const groupContent = groupElement.querySelector('.sidebar-group-content');
                group.sections.forEach(section => {
                    this.renderSectionItem(section, groupContent);
                });
                
                // Configurar el contenedor del grupo como zona de drop
                const groupContainer = groupElement.querySelector('.sidebar-group-content');
                if (groupContainer) {
                    this._setupDropZone(groupContainer);
                }
            } else if (item.type === 'section') {
                // Renderizar sección individual directamente en el contenedor principal
                const section = item.data;
                console.log(`Renderizando sección independiente: ${section.title}`);
                
                // Crear un contenedor para la sección suelta que simule ser un mini-grupo
                const sectionContainer = document.createElement('div');
                sectionContainer.className = 'sidebar-ungrouped-section mb-2';
                sectionContainer.dataset.sectionId = section.id;
                
                // Añadir al contenedor principal
                sectionsList.appendChild(sectionContainer);
                
                // Renderizar la sección dentro de su contenedor
                this.renderSectionItem(section, sectionContainer);
                
                // Hacer que el contenedor también sea arrastrable
                sectionContainer.setAttribute('draggable', 'true');
                
                // Eventos de drag para el contenedor
                sectionContainer.addEventListener('dragstart', (e) => {
                    if (e.target !== sectionContainer) return; // Solo si se arrastra el contenedor, no su contenido
                    
                    console.log('Dragstart en contenedor de sección independiente:', section.id);
                    e.dataTransfer.setData('text/plain', section.id);
                    e.dataTransfer.setData('elementType', 'section-container');
                    sectionContainer.classList.add('dragging');
                    this._draggedElement = sectionContainer;
                    
                    // Ocultar ligeramente el contenedor durante el arrastre
                    setTimeout(() => {
                        sectionContainer.style.opacity = '0.4';
                    }, 0);
                });
                
                sectionContainer.addEventListener('dragend', (e) => {
                    if (e.target !== sectionContainer) return;
                    
                    console.log('Dragend en contenedor de sección independiente:', section.id);
                    sectionContainer.classList.remove('dragging');
                    sectionContainer.style.opacity = '';
                    this._draggedElement = null;
                    
                    // Guardar el nuevo orden
                    this.saveNewOrder();
                });
            }
        });
        
        // Configurar el contenedor principal para permitir arrastrar y soltar entre grupos y secciones
        sectionsList.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            const draggable = this._draggedElement;
            if (!draggable) return;
            
            const afterElement = this._getDragAfterElementInMain(sectionsList, e.clientY);
            
            if (afterElement) {
                sectionsList.insertBefore(draggable, afterElement);
            } else {
                sectionsList.appendChild(draggable);
            }
        });
        
        sectionsList.addEventListener('drop', (e) => {
            e.preventDefault();
            console.log('Drop en el contenedor principal');
            
            // Si estamos arrastrando una sección dentro del grupo, actualizar su grupo
            const elementType = e.dataTransfer.getData('elementType');
            const id = e.dataTransfer.getData('text/plain');
            
            if (elementType === 'section' || elementType === 'section-container') {
                // Si es una sección o contenedor de sección, cambiar su grupo
                const groupId = container.dataset.groupId || '';
                this.moveSectionToGroup(id, groupId);
                
                // Si es un contenedor de sección, necesitamos asegurarnos que la sección
                // está ahora en este grupo y no en su contenedor original
                if (elementType === 'section-container') {
                    const sectionElement = document.querySelector(`.sidebar-item[data-id="${id}"]`);
                    if (sectionElement) {
                        container.appendChild(sectionElement);
                    }
                    
                    // Eliminar el contenedor vacío original
                    const oldContainer = document.querySelector(`.sidebar-ungrouped-section[data-section-id="${id}"]`);
                    if (oldContainer && oldContainer.parentNode) {
                        oldContainer.parentNode.removeChild(oldContainer);
                    }
                }
            } else if (elementType === 'group') {
                // Si es un grupo, solo se permite en el contenedor principal (ya manejado en loadContent)
                if (container.classList.contains('sidebar-group-content')) {
                    console.log('No se permite soltar grupos dentro de grupos');
                    return;
                }
            }
            
            // Guardar el nuevo orden
            this.saveNewOrder();
        });
        
        console.log('Contenido del sidebar cargado correctamente');
    }
    
    /**
     * Verificar integridad de grupos y eliminar asociaciones a grupos inexistentes
     */
    verifyGroupIntegrity() {
        if (!window.currentTopic || !window.currentTopic.sections) {
            return;
        }
        
        console.log('Verificando integridad de grupos en secciones...');
        
        // Identificar grupos existentes y contar el número de secciones en cada grupo
        const groupCounts = {};
        
        // Paso 1: Contar cuántas secciones hay en cada grupo
        window.currentTopic.sections.forEach(section => {
            if (section.groupId) {
                if (!groupCounts[section.groupId]) {
                    groupCounts[section.groupId] = 0;
                }
                groupCounts[section.groupId]++;
            }
        });
        
        console.log('Conteo de secciones por grupo:', groupCounts);
        
        // Paso 2: Verificar cada sección y remover asociaciones inválidas
        let changes = false;
        window.currentTopic.sections.forEach(section => {
            // Si la sección tiene un groupId pero no existe ese grupo o está vacío, eliminar la asociación
            if (section.groupId && (!groupCounts[section.groupId] || groupCounts[section.groupId] === 0)) {
                console.log(`Eliminando asociación de sección ${section.id} a grupo inexistente o vacío ${section.groupId}`);
                delete section.groupId;
                delete section.groupName;
                changes = true;
            }
        });
        
        // Si hubo cambios, guardar las actualizaciones
        if (changes) {
            console.log('Se encontraron y corrigieron asociaciones a grupos inexistentes o vacíos');
            this.saveChanges();
            
            // Verificar integridad de grupos (grupos con una sola sección)
            if (typeof window.checkGroupIntegrity === 'function') {
                window.checkGroupIntegrity();
            }
        } else {
            console.log('No se encontraron problemas de integridad en los grupos');
        }
    }
    
    /**
     * Guardar cambios en el tema actual
     */
    saveChanges() {
        try {
            // Intentar acceder a DataManager de varias maneras
            const dataManager = window.DataManager || DataManager || window['DataManager'];
            
            if (dataManager && typeof dataManager.saveTopic === 'function') {
                dataManager.saveTopic(window.currentTopic);
                console.log('Cambios guardados correctamente');
            } else {
                console.error('DataManager no está disponible para guardar cambios. Intentando guardar directo en localStorage...');
                
                // Intentar guardar usando localStorage directamente
                try {
                    localStorage.setItem('matematicaweb_topics', JSON.stringify(this.getTopicsWithUpdatedTopic(window.currentTopic)));
                    console.log('Guardado de emergencia en localStorage completado');
                } catch (e) {
                    console.error('Error al intentar guardar directamente en localStorage:', e);
                }
            }
        } catch (error) {
            console.error('Error al guardar cambios:', error);
        }
    }
    
    /**
     * Renderizar un elemento de sección en el sidebar
     * @param {Object} section - Datos de la sección
     * @param {HTMLElement} container - Contenedor donde renderizar
     */
    renderSectionItem(section, container) {
        const sectionItem = document.createElement('div');
        sectionItem.className = 'sidebar-item sidebar-section-item';
        sectionItem.dataset.id = section.id;
        sectionItem.setAttribute('draggable', 'true');
        
        // Si pertenece a un grupo, agregar el atributo de grupo
        if (section.groupId) {
            sectionItem.dataset.groupId = section.groupId;
        }
        
        // Crear el contenido del elemento
        sectionItem.innerHTML = `
            <div class="sidebar-item-inner">
                <span class="sidebar-item-handle">
                    <i class="fas fa-grip-lines"></i>
                </span>
                <span class="sidebar-item-title">${section.title}</span>
                <span class="sidebar-item-type">
                    <span class="badge bg-light text-dark">${this.getSectionTypeName(section.type)}</span>
                </span>
            </div>
        `;
        
        // Agregar al contenedor
        container.appendChild(sectionItem);
        
        // Agregar eventos de arrastre
        // Agregar directamente los eventos de arrastre
        sectionItem.addEventListener('dragstart', (e) => {
            console.log('Dragstart en sección:', section.id);
            e.dataTransfer.setData('text/plain', section.id);
            e.dataTransfer.setData('elementType', 'section');
            sectionItem.classList.add('dragging');
            this._draggedElement = sectionItem;
            
            // Ocultar ligeramente el elemento
            setTimeout(() => {
                sectionItem.style.opacity = '0.4';
            }, 0);
        });
        
        sectionItem.addEventListener('dragend', (e) => {
            console.log('Dragend en sección:', section.id);
            sectionItem.classList.remove('dragging');
            sectionItem.style.opacity = '';
            this._draggedElement = null;
            
            // Guardar el nuevo orden
            this.saveNewOrder();
        });
    }
    
    /**
     * Obtener el nombre del tipo de sección
     * @param {string} type - Tipo de sección
     * @return {string} Nombre para mostrar
     */
    getSectionTypeName(type) {
        const typeNames = {
            'text': 'Texto',
            'youtube': 'YouTube',
            'geogebra': 'GeoGebra',
            'image': 'Imagen',
            'pdf': 'PDF',
            'html': 'HTML',
            'activity': 'Actividad'
        };
        
        return typeNames[type] || type;
    }
    
    /**
     * Inicializar eventos de drag and drop
     */
    initDragDrop() {
        console.log('Inicializando eventos de drag and drop en el sidebar...');
        
        // Los eventos ya se inicializan durante la carga de contenido,
        // esta función permanece para compatibilidad
        
        // Verificar y eliminar grupos vacíos
        this.checkEmptyGroups();
        
        console.log('Eventos de drag and drop inicializados correctamente');
    }
    
    /**
     * Configurar una zona de drop
     * @param {HTMLElement} container - Contenedor que será zona de drop
     */
    _setupDropZone(container) {
        // Dragover
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            // No permitir soltar grupos en contenedores de grupos
            const isGroupContent = container.classList.contains('sidebar-group-content');
            const draggedIsGroup = this._draggedElement?.classList.contains('sidebar-group');
            
            if (isGroupContent && draggedIsGroup) {
                console.log('No se permite arrastrar grupos dentro de grupos');
                return;
            }
            
            container.classList.add('drag-target');
            
            const afterElement = this._getDragAfterElement(container, e.clientY);
            const draggable = this._draggedElement;
            
            if (!draggable) return;
            
            // Permitir reordenar secciones dentro de grupos o en el área no agrupada
            if (draggable.classList.contains('sidebar-item')) {
                if (afterElement) {
                    container.insertBefore(draggable, afterElement);
                } else {
                    container.appendChild(draggable);
                }
            }
        });
        
        // Dragleave
        container.addEventListener('dragleave', (e) => {
            container.classList.remove('drag-target');
        });
        
        // Drop
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-target');
            
            const elementType = e.dataTransfer.getData('elementType');
            const id = e.dataTransfer.getData('text/plain');
            
            console.log(`Drop en contenedor: elementType=${elementType}, id=${id}`);
            
            if (elementType === 'section' || elementType === 'section-container') {
                // Si es una sección o contenedor de sección, cambiar su grupo
                const groupId = container.dataset.groupId || '';
                this.moveSectionToGroup(id, groupId);
                
                // Si es un contenedor de sección, necesitamos asegurarnos que la sección
                // está ahora en este grupo y no en su contenedor original
                if (elementType === 'section-container') {
                    const sectionElement = document.querySelector(`.sidebar-item[data-id="${id}"]`);
                    if (sectionElement) {
                        container.appendChild(sectionElement);
                    }
                    
                    // Eliminar el contenedor vacío original
                    const oldContainer = document.querySelector(`.sidebar-ungrouped-section[data-section-id="${id}"]`);
                    if (oldContainer && oldContainer.parentNode) {
                        oldContainer.parentNode.removeChild(oldContainer);
                    }
                }
            } else if (elementType === 'group') {
                // Si es un grupo, solo se permite en el contenedor principal (ya manejado en loadContent)
                if (container.classList.contains('sidebar-group-content')) {
                    console.log('No se permite soltar grupos dentro de grupos');
                    return;
                }
            }
            
            // Guardar el nuevo orden
            this.saveNewOrder();
        });
    }
    
    /**
     * Obtener el elemento después del cual insertar un elemento arrastrado
     * dentro de un contenedor específico (grupo o área sin agrupar)
     */
    _getDragAfterElement(container, y) {
        // Obtener todos los elementos arrastrables en el contenedor que no están siendo arrastrados
        const draggableElements = [...container.querySelectorAll('.sidebar-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    /**
     * Obtener el elemento después del cual insertar un grupo arrastrado
     * en el contenedor principal
     */
    _getDragAfterElementInMain(container, y) {
        // Obtener todos los elementos de primer nivel (grupos y secciones no agrupadas)
        const draggableElements = [
            ...container.querySelectorAll('.sidebar-group:not(.dragging)'),
            ...container.querySelectorAll('.sidebar-ungrouped-section:not(.dragging)')
        ];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    /**
     * Guardar el nuevo orden de todos los elementos (grupos y secciones)
     */
    saveNewOrder() {
        console.log('Guardando nuevo orden de elementos...');
        
        // Obtener el tema actual (con fallback a window.currentTopic)
        let topic = null;
        
        if (this._dataProvider && typeof this._dataProvider.getTopic === 'function') {
            topic = this._dataProvider.getTopic();
        } else {
            topic = window.currentTopic;
        }
        
        if (!topic) {
            console.error('No se encontró el tema actual');
            return;
        }
        
        // Obtener el contenedor principal
        const sidebarList = document.getElementById('sidebar-sections-list');
        if (!sidebarList) {
            console.error('No se encontró el contenedor sidebar-sections-list');
            return;
        }
        
        // Crear una copia de las secciones originales para buscar información
        const originalSections = [...topic.sections];
        
        // Lista para almacenar las secciones en el nuevo orden
        const newSections = [];
        let orderIndex = 0;
        
        // Recorrer todos los elementos del sidebar en su orden actual
        const items = sidebarList.children;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Verificar si es un grupo
            if (item.classList.contains('sidebar-group')) {
                const groupId = item.dataset.id;
                if (!groupId) continue;
                
                // Procesar secciones dentro del grupo
                const sectionElements = item.querySelectorAll('.sidebar-item');
                console.log(`Grupo ${groupId} tiene ${sectionElements.length} secciones`);
                
                sectionElements.forEach(sectionEl => {
                    const sectionId = parseInt(sectionEl.dataset.id);
                    const originalSection = originalSections.find(s => s.id === sectionId);
                    
                    if (originalSection) {
                        // Clonar la sección para no modificar la original
                        const updatedSection = {...originalSection};
                        // Actualizar grupo y orden
                        updatedSection.groupId = groupId;
                        // Obtener el nombre del grupo
                        const groupElement = document.querySelector(`.sidebar-group[data-id="${groupId}"]`);
                        if (groupElement) {
                            const groupTitle = groupElement.querySelector('.sidebar-group-title');
                            if (groupTitle) {
                                updatedSection.groupName = groupTitle.textContent;
                            }
                        }
                        updatedSection.order = orderIndex++;
                        // Agregar a la nueva lista
                        newSections.push(updatedSection);
                    }
                });
            }
            // Verificar si es una sección no agrupada
            else if (item.classList.contains('sidebar-ungrouped-section')) {
                const sectionItem = item.querySelector('.sidebar-item');
                if (!sectionItem) continue;
                
                const sectionId = parseInt(sectionItem.dataset.id);
                if (!sectionId) continue;
                
                const originalSection = originalSections.find(s => s.id === sectionId);
                if (originalSection) {
                    // Clonar la sección para no modificar la original
                    const updatedSection = {...originalSection};
                    // Quitar grupo y actualizar orden
                    delete updatedSection.groupId;
                    delete updatedSection.groupName;
                    updatedSection.order = orderIndex++;
                    // Agregar a la nueva lista
                    newSections.push(updatedSection);
                }
            }
        }
        
        // Asegurarse de que todas las secciones estén incluidas
        originalSections.forEach(section => {
            const isIncluded = newSections.some(s => s.id === section.id);
            if (!isIncluded) {
                console.log(`Sección no encontrada en el DOM, manteniéndola: ${section.id}`);
                // Clonar la sección y darle el último orden
                const updatedSection = {...section};
                updatedSection.order = orderIndex++;
                newSections.push(updatedSection);
            }
        });
        
        if (newSections.length !== originalSections.length) {
            console.warn(`Advertencia: Diferente número de secciones. Original: ${originalSections.length}, Nuevo: ${newSections.length}`);
        }
        
        // Reemplazar las secciones en el tema
        topic.sections = newSections;
        
        // Guardar el tema actualizado - primero intento con métodos tradicionales
        let saveSuccess = false;
        
        if (this._dataProvider && typeof this._dataProvider.saveTopic === 'function') {
            console.log('Guardando con _dataProvider.saveTopic');
            this._dataProvider.saveTopic(topic);
            saveSuccess = true;
        } else if (typeof DataManager !== 'undefined' && DataManager.saveTopic) {
            console.log('Guardando con DataManager.saveTopic');
            DataManager.saveTopic(topic);
            saveSuccess = true;
        } else if (window.DataManager && typeof window.DataManager.saveTopic === 'function') {
            console.log('Guardando con window.DataManager.saveTopic');
            window.DataManager.saveTopic(topic);
            saveSuccess = true;
        } else {
            console.warn('No se encontró DataManager. Intentando métodos alternativos de guardado...');
        }
        
        // Si los métodos tradicionales fallan, usar nuestro método directo
        if (!saveSuccess) {
            this._saveToLocalStorage();
        }
        
        // Actualizar el panel central
        if (typeof window.loadSections === 'function') {
            window.loadSections();
            console.log('Panel central actualizado con el nuevo orden');
        }
        
        console.log('Nuevo orden guardado exitosamente');
        return true;
    }
    
    /**
     * Mover una sección a un grupo
     * @param {string} sectionId - ID de la sección a mover
     * @param {string|null} groupId - ID del grupo destino (null o vacío para no agrupar)
     */
    moveSectionToGroup(sectionId, groupId) {
        // Si no hay datos de tema, salir
        if (!window.currentTopic || !window.currentTopic.sections) {
            console.error('No hay datos de tema disponibles');
            return;
        }
        
        console.log(`Moviendo sección ${sectionId} al ${groupId ? 'grupo ' + groupId : 'área sin grupo'}`);
        
        // Encontrar la sección - asegurar que sea string para la comparación
        const sectionIdStr = String(sectionId);
        let section = window.currentTopic.sections.find(s => String(s.id) === sectionIdStr);
        
        if (!section) {
            console.error('No se encontró la sección con ID:', sectionId);
            return;
        }
        
        // Convertir groupId a una cadena vacía si es null o undefined para la comparación
        const targetGroupId = groupId || '';
        
        // Si está en el mismo grupo, no hacer nada - asegurar que ambos son strings para comparación
        const currentGroupId = section.groupId ? String(section.groupId) : '';
        
        console.log(`Comparando grupo actual "${currentGroupId}" (${typeof currentGroupId}) con destino "${targetGroupId}" (${typeof targetGroupId})`);
        
        if (currentGroupId === targetGroupId) {
            console.log('La sección ya está en el grupo destino, no se realiza cambio');
            return;
        }
        
        console.log(`Moviendo sección de grupo "${currentGroupId}" a "${targetGroupId}"`);
        
        // Crear una copia para no modificar directamente el objeto referenciado
        section = {...section};
        
        // Actualizar el grupo de la sección
        if (targetGroupId && targetGroupId !== "") {
            // Obtener el nombre del grupo
            const groupElement = document.querySelector(`.sidebar-group[data-id="${targetGroupId}"]`);
            const groupName = groupElement ? 
                groupElement.querySelector('.sidebar-group-title').textContent : 'Grupo';
            
            section.groupId = targetGroupId;
            section.groupName = groupName;
            console.log(`Sección asignada al grupo: ${groupName} (${targetGroupId})`);
        } else {
            // Eliminar las propiedades de grupo
            delete section.groupId;
            delete section.groupName;
            console.log('Sección removida de grupo, ahora es independiente');
        }
        
        // Actualizar la sección en el array original
        const index = window.currentTopic.sections.findIndex(s => String(s.id) === sectionIdStr);
        if (index !== -1) {
            window.currentTopic.sections[index] = section;
        }
        
        // Guardar cambios inmediatamente
        this._saveChangesImmediately();
        
        // Callback si está definido
        if (typeof this.options.onSectionMove === 'function') {
            this.options.onSectionMove(section, targetGroupId);
        }
        
        // Verificar la integridad de los grupos
        if (typeof window.checkGroupIntegrity === 'function') {
            window.checkGroupIntegrity();
        }
        
        // Forzar una recarga completa de las secciones en el panel central
        if (typeof window.loadSections === 'function') {
            window.loadSections();
            console.log('Panel central actualizado correctamente');
        } else {
            console.error('No se pudo actualizar el panel central: loadSections no está disponible');
        }
        
        // Aplicar actualizaciones inmediatas al panel central si está disponible
        const sectionsContainer = document.getElementById('sectionsContainer');
        if (sectionsContainer) {
            // Actualizar clases de secciones en el DOM para reflejar cambios inmediatamente
            document.querySelectorAll(`#sectionsContainer .section-item[data-id="${sectionIdStr}"]`).forEach(el => {
                if (targetGroupId && targetGroupId !== "") {
                    el.setAttribute('data-group-id', targetGroupId);
                } else {
                    el.removeAttribute('data-group-id');
                }
            });
            
            console.log('Aplicados cambios visuales inmediatos al panel central');
        }
    }
    
    /**
     * Guardar cambios en el tema actual de forma inmediata
     */
    _saveChangesImmediately() {
        try {
            // Primero intentar con DataManager global
            if (typeof DataManager !== 'undefined' && typeof DataManager.saveTopic === 'function') {
                console.log('Guardando con DataManager global...');
                DataManager.saveTopic(window.currentTopic);
                return true;
            }
            
            // Luego intentar con window.DataManager
            if (window.DataManager && typeof window.DataManager.saveTopic === 'function') {
                console.log('Guardando con window.DataManager...');
                window.DataManager.saveTopic(window.currentTopic);
                return true;
            }
            
            // Si no, intentar guardar directo en localStorage
            console.warn('DataManager no disponible, guardando directamente en localStorage...');
            this._saveToLocalStorage();
            return true;
        } catch (error) {
            console.error('Error al guardar cambios inmediatamente:', error);
            
            // Intento final: localStorage
            try {
                this._saveToLocalStorage();
                return true;
            } catch (e) {
                console.error('Error fatal al guardar:', e);
                return false;
            }
        }
    }
    
    /**
     * Guardar directamente en localStorage como último recurso
     */
    _saveToLocalStorage() {
        // Obtener todos los temas del localStorage
        const storageKey = 'matematicaweb_topics';
        let allTopics = [];
        
        try {
            const storedTopics = localStorage.getItem(storageKey);
            if (storedTopics) {
                allTopics = JSON.parse(storedTopics);
            }
        } catch (e) {
            console.error('Error al leer topics de localStorage:', e);
            allTopics = [];
        }
        
        if (!Array.isArray(allTopics)) {
            console.warn('matematicaweb_topics no es un array, reiniciando...');
            allTopics = [];
        }
        
        // Encontrar y actualizar el tema actual
        const topicIndex = allTopics.findIndex(t => t.id === window.currentTopic.id);
        
        if (topicIndex !== -1) {
            // Actualizar tema existente
            allTopics[topicIndex] = {...window.currentTopic};
        } else {
            // Agregar nuevo tema
            allTopics.push({...window.currentTopic});
        }
        
        // Guardar de vuelta en localStorage
        localStorage.setItem(storageKey, JSON.stringify(allTopics));
        console.log('Cambios guardados directamente en localStorage con éxito');
    }
    
    /**
     * Verificar y eliminar grupos vacíos o con una sola sección
     */
    checkEmptyGroups() {
        console.log('Verificando grupos vacíos...');
        
        // Verificar que _dataProvider esté disponible (fallback a window)
        const topic = this._dataProvider ? this._dataProvider.getTopic() : window.currentTopic;
        
        if (!topic || !topic.sections) {
            console.error('No hay datos de tema disponibles');
            return;
        }
        
        // Obtener todos los grupos
        const allGroups = {};
        topic.sections.forEach(section => {
            if (section.groupId) {
                if (!allGroups[section.groupId]) {
                    allGroups[section.groupId] = [];
                }
                allGroups[section.groupId].push(section.id);
            }
        });
        
        // Contar grupos vacíos
        let emptyGroups = 0;
        let singleSectionGroups = 0;
        let groupsRemoved = false;
        
        // Verificar grupos vacíos o con una sola sección
        Object.keys(allGroups).forEach(groupId => {
            const sections = allGroups[groupId];
            
            if (sections.length === 0) {
                // Grupo vacío, eliminarlo
                emptyGroups++;
                console.log(`Eliminando grupo vacío: ${groupId}`);
                
                // Eliminar el grupo del DOM
                const groupElement = document.querySelector(`.sidebar-group[data-id="${groupId}"]`);
                if (groupElement) {
                    groupElement.remove();
                }
                
                groupsRemoved = true;
            } 
            else if (sections.length === 1) {
                // Grupo con una sola sección, desintegrarlo automáticamente
                singleSectionGroups++;
                console.log(`Desintegrando grupo con una sola sección: ${groupId}, sección: ${sections[0]}`);
                
                // Actualizar la sección para quitarle el grupo
                const section = topic.sections.find(s => s.id === parseInt(sections[0]));
                if (section) {
                    section.groupId = null;
                    console.log(`Sección ${section.id} desvinculada del grupo ${groupId}`);
                }
                
                // Eliminar el grupo del DOM
                const groupElement = document.querySelector(`.sidebar-group[data-id="${groupId}"]`);
                if (groupElement) {
                    // Obtener referencia al elemento de la sección (usando sidebar-item)
                    const sectionElement = groupElement.querySelector(`.sidebar-item[data-id="${sections[0]}"]`);
                    
                    // Mover la sección al contenedor de no agrupadas
                    const ungroupedContainer = document.querySelector('.sidebar-ungrouped-content');
                    if (sectionElement && ungroupedContainer) {
                        ungroupedContainer.appendChild(sectionElement);
                    }
                    
                    // Eliminar el grupo vacío
                    groupElement.remove();
                }
                
                groupsRemoved = true;
            }
        });
        
        console.log(`Se encontraron ${emptyGroups} grupos vacíos y ${singleSectionGroups} grupos con una sola sección`);
        
        // Si se eliminaron grupos, guardar los cambios
        if (groupsRemoved) {
            // Usar DataManager o saveChanges según esté disponible
            if (this._dataProvider && typeof this._dataProvider.saveTopic === 'function') {
                this._dataProvider.saveTopic(topic);
            } else {
                this.saveChanges();
            }
            console.log('Cambios guardados después de eliminar grupos');
        }
        
        return groupsRemoved;
    }
    
    /**
     * Abrir el sidebar
     */
    open() {
        this.mainContainer.classList.add('sidebar-open');
        this.isOpen = true;
    }
    
    /**
     * Cerrar el sidebar
     */
    close() {
        this.mainContainer.classList.remove('sidebar-open');
        this.isOpen = false;
    }
    
    /**
     * Alternar estado del sidebar (abrir/cerrar)
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Añadir estilos CSS para el sidebar
     */
    addStyles() {
        // Verificar si ya existe el estilo
        if (document.getElementById('section-sidebar-styles')) return;
        
        // Crear elemento de estilo
        const style = document.createElement('style');
        style.id = 'section-sidebar-styles';
        style.textContent = `
            .section-editor-layout {
                display: grid;
                grid-template-columns: 1fr 0fr;
                grid-gap: 20px;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .section-editor-layout.sidebar-open {
                grid-template-columns: 1fr 350px;
            }
            
            .sections-sidebar {
                height: calc(100vh - 100px);
                position: sticky;
                top: 70px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                width: 0;
                opacity: 0;
                transition: width 0.3s ease, opacity 0.3s ease;
                box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                border: none;
            }
            
            .section-editor-layout.sidebar-open .sections-sidebar {
                width: 350px;
                opacity: 1;
            }
            
            .sidebar-content {
                flex-grow: 1;
                overflow-y: auto;
                padding: 15px;
            }
            
            .sidebar-group {
                background-color: #f8f9fa;
                border-radius: 6px;
                margin-bottom: 15px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .sidebar-group.dragging {
                opacity: 0.6;
                transform: scale(1.05);
                z-index: 1100;
                box-shadow: 0 8px 15px rgba(0,0,0,0.2);
            }
            
            .sidebar-group-header {
                padding: 10px 15px;
                background-color: #e9ecef;
                font-weight: bold;
                border-bottom: 1px solid #dee2e6;
                cursor: grab;
            }
            
            .sidebar-group-header:hover {
                background-color: #dde2e6;
            }
            
            .sidebar-group-header:active {
                cursor: grabbing;
            }
            
            .sidebar-group-handle {
                cursor: grab;
                color: #6c757d;
            }
            
            .sidebar-group-handle:active {
                cursor: grabbing;
            }
            
            .sidebar-group-content {
                padding: 10px;
                min-height: 50px;
                background-color: #fff;
            }
            
            .sidebar-ungrouped-section {
                padding: 2px;
                position: relative;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                border-radius: 4px;
            }
            
            .sidebar-ungrouped-section:hover {
                background-color: rgba(0, 123, 255, 0.05);
            }
            
            .sidebar-ungrouped-section.dragging {
                opacity: 0.6;
                transform: scale(1.05);
                z-index: 1100;
                box-shadow: 0 8px 15px rgba(0,0,0,0.2);
            }
            
            .sidebar-ungrouped-section .sidebar-item {
                margin-bottom: 0;
            }
            
            .sidebar-ungrouped-header {
                padding: 8px 0;
                font-weight: bold;
                border-bottom: 1px solid #dee2e6;
                margin-top: 20px;
            }
            
            .sidebar-ungrouped-content {
                padding: 10px 0;
                min-height: 50px;
            }
            
            .sidebar-item {
                padding: 8px 10px;
                background-color: white;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                margin-bottom: 8px;
                cursor: grab;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .sidebar-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px rgba(0,0,0,0.15);
            }
            
            .sidebar-item:active {
                cursor: grabbing;
            }
            
            .sidebar-item.dragging {
                opacity: 0.6;
                transform: scale(1.05);
                z-index: 1100;
                box-shadow: 0 8px 15px rgba(0,0,0,0.2);
            }
            
            .sidebar-item-inner {
                display: flex;
                align-items: center;
            }
            
            .sidebar-item-handle {
                margin-right: 10px;
                color: #6c757d;
                cursor: grab;
            }
            
            .sidebar-item-handle:active {
                cursor: grabbing;
            }
            
            .sidebar-item-title {
                flex-grow: 1;
                font-size: 0.95rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .sidebar-item-type {
                margin-left: 10px;
                font-size: 0.75rem;
            }
            
            .drag-target {
                background-color: rgba(0, 123, 255, 0.1);
                border: 2px dashed #007bff;
                border-radius: 4px;
            }
            
            #toggleSidebar {
                transition: transform 0.3s ease;
            }
            
            #toggleSidebar:hover {
                transform: scale(1.1);
            }
            
            @media (max-width: 768px) {
                .section-editor-layout.sidebar-open {
                    grid-template-columns: 0fr 1fr;
                }
                
                .section-editor-layout.sidebar-open .section-editor-main {
                    display: none;
                }
                
                .sections-sidebar {
                    width: 100%;
                }
            }
        `;
        
        // Añadir al head
        document.head.appendChild(style);
        
        console.log('Estilos del sidebar añadidos');
    }
    
    // Función para añadir el botón para mostrar el sidebar
    addToggleButton() {
        // Eliminar botón existente si hay alguno
        const existingButton = document.getElementById('toggleSidebar');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Crear el botón
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggleSidebar';
        toggleButton.className = 'btn btn-primary position-fixed';
        toggleButton.setAttribute('title', 'Reorganizar secciones');
        toggleButton.style.cssText = `
            bottom: 20px; 
            right: 20px; 
            z-index: 1050; 
            border-radius: 50%; 
            width: 60px; 
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        `;
        toggleButton.innerHTML = '<i class="fas fa-th-list fa-lg"></i>';
        
        // Agregar al documento
        document.body.appendChild(toggleButton);
        
        // Agregar evento
        toggleButton.addEventListener('click', () => this.toggle());
        
        console.log('Botón de toggle del sidebar añadido');
    }
}

// Exportar la clase para su uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionSidebar;
} 