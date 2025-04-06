/**
 * Navegación Jerárquica para WebMatematica
 * Permite mostrar la estructura completa de cursos, temas y secciones en un árbol de navegación.
 */

class HierarchicalNav {
    constructor(options = {}) {
        this.options = Object.assign({
            container: '#hierarchicalNav',
            currentCourseId: null,
            currentTopicId: null,
            currentSectionId: null,
            expandCurrent: true,
            showSections: true,
            onCourseClick: null,
            onTopicClick: null,
            onSectionClick: null,
            highlightCurrentItem: true,
            stickySidebar: true
        }, options);
        
        this.container = document.querySelector(this.options.container);
        if (!this.container) {
            console.error('Container element not found for HierarchicalNav');
            return;
        }
        
        this.courses = [];
        this.mobileVisible = false;
        
        this.init();
    }
    
    init() {
        // Cargar todos los cursos disponibles
        this.loadCourses();
        
        // Inicializar eventos para móviles
        this.initMobileEvents();
        
        // Aplicar estilos si el sidebar es sticky
        if (this.options.stickySidebar) {
            this.makeSidebarSticky();
        }
    }
    
    loadCourses() {
        // Obtener cursos desde DataManager
        if (typeof DataManager !== 'undefined') {
            this.courses = DataManager.getCourses();
            this.render();
        } else {
            console.error('DataManager not found. Cannot load courses for navigation.');
        }
    }
    
    makeSidebarSticky() {
        // Aplicar estilos CSS para hacer que el sidebar sea sticky
        if (this.container) {
            this.container.style.position = 'sticky';
            this.container.style.top = '20px'; // Ajustar según sea necesario
            this.container.style.maxHeight = 'calc(100vh - 40px)';
            this.container.style.overflowY = 'auto';
            
            // Añadir scrollbar personalizado
            const style = document.createElement('style');
            style.textContent = `
                ${this.options.container} {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.2) transparent;
                }
                ${this.options.container}::-webkit-scrollbar {
                    width: 6px;
                }
                ${this.options.container}::-webkit-scrollbar-track {
                    background: transparent;
                }
                ${this.options.container}::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.2);
                    border-radius: 3px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    render() {
        if (!this.container || !this.courses) return;
        
        this.container.innerHTML = `
            <nav class="nav-tree" aria-label="Navegación jerárquica">
                <div class="nav-tree-mobile-toggle" id="navTreeMobileToggle">
                    <i class="fas fa-bars"></i> Navegación
                </div>
                <div class="nav-tree-content" id="navTreeContent">
                    <ul class="nav-tree-items nav-tree-level-1">
                        ${this.renderCourses()}
                    </ul>
                </div>
            </nav>
        `;
        
        // Inicializar eventos para los toggles
        this.initToggleEvents();
        
        // Expandir los elementos actuales
        if (this.options.expandCurrent) {
            this.expandCurrentItems();
        }
    }
    
    renderCourses() {
        return this.courses.map(course => {
            const isCurrent = course.id === this.options.currentCourseId;
            const topics = this.getTopicsForCourse(course.id);
            const hasChildren = topics.length > 0;
            
            return `
                <li class="nav-tree-item ${isCurrent ? 'expanded' : ''}">
                    <a href="${this.getCourseUrl(course)}" class="nav-tree-item-content ${isCurrent ? 'active nav-tree-current' : ''}" data-id="${course.id}" data-type="course">
                        <span class="nav-tree-icon"><i class="${course.icon || 'fas fa-book'}"></i></span>
                        <span>${course.title}</span>
                        ${hasChildren ? `
                        <button class="nav-tree-toggle" data-action="toggle">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        ` : ''}
                    </a>
                    ${hasChildren ? `
                    <ul class="nav-tree-children nav-tree-level-2">
                        ${this.renderTopics(topics)}
                    </ul>
                    ` : ''}
                </li>
            `;
        }).join('');
    }
    
    renderTopics(topics) {
        return topics.map(topic => {
            const isCurrent = topic.id === this.options.currentTopicId;
            const sections = this.options.showSections ? this.getSectionsForTopic(topic) : [];
            const hasChildren = sections.length > 0;
            
            return `
                <li class="nav-tree-item ${isCurrent ? 'expanded' : ''}">
                    <a href="${this.getTopicUrl(topic)}" class="nav-tree-item-content ${isCurrent ? 'active nav-tree-current' : ''}" data-id="${topic.id}" data-type="topic" data-course-id="${topic.courseId}">
                        <span class="nav-tree-icon"><i class="${topic.icon || 'fas fa-file-alt'}"></i></span>
                        <span>${topic.title}</span>
                        ${hasChildren ? `
                        <button class="nav-tree-toggle" data-action="toggle">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        ` : ''}
                    </a>
                    ${hasChildren ? `
                    <ul class="nav-tree-children nav-tree-level-3">
                        ${this.renderSections(sections)}
                    </ul>
                    ` : ''}
                </li>
            `;
        }).join('');
    }
    
    renderSections(sections) {
        return sections.map(section => {
            const isCurrent = !section.isGroup && section.id === this.options.currentSectionId;
            const isCurrentGroup = section.isGroup && this.options.currentSectionId && 
                this.options.currentSectionId.toString().includes(section.groupId);
            
            // Para los grupos
            if (section.isGroup) {
                return `
                    <li class="nav-tree-item">
                        <a href="#section-group-${section.groupId}" class="nav-tree-item-content ${isCurrentGroup ? 'active' : ''}" data-id="${section.id}" data-type="section-group">
                            <span class="nav-tree-icon"><i class="fas fa-layer-group"></i></span>
                            <span>${section.title}</span>
                        </a>
                    </li>
                `;
            }
            
            // Para las secciones normales
            return `
                <li class="nav-tree-item">
                    <a href="#${this.getSectionAnchor(section)}" class="nav-tree-item-content ${isCurrent ? 'active' : ''}" data-id="${section.id}" data-type="section">
                        <span class="nav-tree-icon"><i class="${this.getSectionIcon(section)}"></i></span>
                        <span>${section.title}</span>
                    </a>
                </li>
            `;
        }).join('');
    }
    
    getTopicsForCourse(courseId) {
        if (typeof DataManager !== 'undefined') {
            return DataManager.getTopicsByCourse(courseId) || [];
        }
        return [];
    }
    
    getSectionsForTopic(topic) {
        if (!topic.sections) return [];
        
        // Si hay grupos, necesitamos manejarlos especialmente
        let processedSections = [];
        const groupedSections = {};
        
        topic.sections.forEach(section => {
            // Marcar la sección para evitar procesarla dos veces
            if (section._processed) return;
            
            if (section.groupId) {
                // Si la sección pertenece a un grupo
                if (!groupedSections[section.groupId]) {
                    // Si es el primer elemento del grupo, crear una "sección virtual" para el grupo
                    groupedSections[section.groupId] = {
                        id: `group-${section.groupId}`,
                        title: section.groupName || 'Grupo sin nombre',
                        type: 'group',
                        isGroup: true,
                        groupId: section.groupId
                    };
                    processedSections.push(groupedSections[section.groupId]);
                }
                
                // Marcar esta sección como procesada
                section._processed = true;
            } else {
                // Sección normal
                processedSections.push(section);
            }
        });
        
        // Limpiar las marcas temporales
        topic.sections.forEach(section => {
            delete section._processed;
        });
        
        return processedSections;
    }
    
    getSectionIcon(section) {
        // Determinar el icono según el tipo de sección
        const iconMap = {
            'text': 'fas fa-align-left',
            'youtube': 'fab fa-youtube',
            'geogebra': 'fas fa-calculator',
            'image': 'fas fa-image',
            'pdf': 'fas fa-file-pdf',
            'activity': 'fas fa-tasks',
            'group': 'fas fa-layer-group',
            'default': 'fas fa-file-alt'
        };
        
        return iconMap[section.type] || iconMap.default;
    }
    
    getSectionAnchor(section) {
        return `section-${section.id}`;
    }
    
    getCourseUrl(course) {
        return `../courses/view.html?id=${course.id}`;
    }
    
    getTopicUrl(topic) {
        return `../topics/view.html?id=${topic.id}&courseId=${topic.courseId}`;
    }
    
    initEvents() {
        // Delegación de eventos para los toggles de expansión
        this.container.addEventListener('click', (e) => {
            // Manejo de botones de expansión/colapso
            if (e.target.closest('[data-action="toggle"]')) {
                e.preventDefault();
                const toggleBtn = e.target.closest('[data-action="toggle"]');
                const navItem = toggleBtn.closest('.nav-tree-item');
                this.toggleItem(navItem);
                return;
            }
            
            // Manejo de clic en elementos
            const itemContent = e.target.closest('.nav-tree-item-content');
            if (itemContent) {
                const type = itemContent.dataset.type;
                const id = parseInt(itemContent.dataset.id);
                
                // Si es un enlace a una sección, prevenir la navegación y hacer scroll
                if (type === 'section') {
                    e.preventDefault();
                    if (typeof this.options.onSectionClick === 'function') {
                        this.options.onSectionClick(id);
                    } else {
                        this.scrollToSection(id);
                    }
                } else if (type === 'topic' && typeof this.options.onTopicClick === 'function') {
                    const courseId = parseInt(itemContent.dataset.courseId);
                    this.options.onTopicClick(id, courseId);
                } else if (type === 'course' && typeof this.options.onCourseClick === 'function') {
                    this.options.onCourseClick(id);
                }
            }
        });
        
        // Botón de colapsar todo
        const collapseAllBtn = document.getElementById('navCollapseAllBtn');
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                this.collapseAll();
            });
        }
    }
    
    initMobileEvents() {
        // Crear elementos para móviles
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'nav-tree-mobile-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.setAttribute('aria-label', 'Mostrar navegación');
        
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        
        document.body.appendChild(mobileToggle);
        document.body.appendChild(overlay);
        
        // Eventos para mostrar/ocultar en móviles
        mobileToggle.addEventListener('click', () => {
            this.toggleMobileNav();
        });
        
        overlay.addEventListener('click', () => {
            this.hideMobileNav();
        });
    }
    
    toggleMobileNav() {
        this.mobileVisible = !this.mobileVisible;
        
        if (this.mobileVisible) {
            this.container.classList.add('mobile-visible');
            document.querySelector('.nav-overlay').classList.add('visible');
        } else {
            this.container.classList.remove('mobile-visible');
            document.querySelector('.nav-overlay').classList.remove('visible');
        }
    }
    
    hideMobileNav() {
        this.mobileVisible = false;
        this.container.classList.remove('mobile-visible');
        document.querySelector('.nav-overlay').classList.remove('visible');
    }
    
    toggleItem(navItem) {
        navItem.classList.toggle('expanded');
    }
    
    expandCurrentItems() {
        // Expandir el curso actual
        if (this.options.currentCourseId) {
            const courseItem = this.container.querySelector(`.nav-tree-item-content[data-type="course"][data-id="${this.options.currentCourseId}"]`);
            if (courseItem) {
                const navItem = courseItem.closest('.nav-tree-item');
                navItem.classList.add('expanded');
                
                // Asegurar que el elemento es visible haciendo scroll si es necesario
                if (this.options.highlightCurrentItem) {
                    setTimeout(() => {
                        courseItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 300);
                }
            }
        }
        
        // Expandir el tema actual
        if (this.options.currentTopicId) {
            const topicItem = this.container.querySelector(`.nav-tree-item-content[data-type="topic"][data-id="${this.options.currentTopicId}"]`);
            if (topicItem) {
                const navItem = topicItem.closest('.nav-tree-item');
                navItem.classList.add('expanded');
                
                // Asegurar que el elemento es visible haciendo scroll si es necesario
                if (this.options.highlightCurrentItem) {
                    setTimeout(() => {
                        topicItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 300);
                }
            }
        }
        
        // Resaltar la sección actual
        if (this.options.currentSectionId) {
            const sectionItem = this.container.querySelector(`.nav-tree-item-content[data-type="section"][data-id="${this.options.currentSectionId}"]`);
            if (sectionItem && this.options.highlightCurrentItem) {
                setTimeout(() => {
                    sectionItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        }
    }
    
    collapseAll() {
        const expandedItems = this.container.querySelectorAll('.nav-tree-item.expanded');
        expandedItems.forEach(item => {
            item.classList.remove('expanded');
        });
        
        // Mantener expandidos los elementos actuales si es necesario
        if (this.options.expandCurrent) {
            this.expandCurrentItems();
        }
    }
    
    scrollToSection(sectionId) {
        // Sección normal o grupo
        let sectionElement;
        
        if (String(sectionId).startsWith('group-')) {
            const groupId = sectionId.replace('group-', '');
            sectionElement = document.getElementById(`section-group-${groupId}`);
        } else {
            sectionElement = document.getElementById(`section-${sectionId}`);
        }
        
        if (sectionElement) {
            // Hacer scroll a la sección
            sectionElement.scrollIntoView({ behavior: 'smooth' });
            
            // Expandir la sección si está colapsada
            const contentElement = sectionElement.querySelector('.section-content');
            const iconElement = sectionElement.querySelector('.section-toggle i');
            
            if (contentElement && contentElement.style.display === 'none') {
                contentElement.style.display = 'block';
                if (iconElement) {
                    iconElement.classList.remove('fa-chevron-down');
                    iconElement.classList.add('fa-chevron-up');
                }
            }
            
            // Cerrar la navegación en móviles
            this.hideMobileNav();
        }
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // La inicialización se hará en cada página que necesite la navegación
}); 