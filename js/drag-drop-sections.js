/**
 * Clase para implementar la funcionalidad de arrastrar y soltar para ordenar secciones
 * Permite reorganizar secciones y grupos de secciones mediante interfaz intuitiva
 */
class DragDropSections {
    /**
     * Constructor
     * @param {string} containerId - ID del contenedor que contendrá los elementos arrastrables
     * @param {Object} options - Opciones de configuración adicionales
     */
    constructor(containerId, options = {}) {
        // Almacenar opciones con valores predeterminados
        this.options = Object.assign({
            itemSelector: '.draggable-item',
            handleSelector: '.drag-handle',
            groupSelector: '.draggable-group',
            placeholderClass: 'drag-placeholder',
            dragClass: 'dragging',
            onOrderChange: null,
            onGroupChange: null,
            animation: true,
            animationDuration: 150,
            constrainToContainer: true // Nueva opción para restringir el movimiento al contenedor
        }, options);
        
        // Elementos DOM
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`No se encontró el contenedor con ID: ${containerId}`);
            return;
        }
        
        // Estado del arrastre
        this.draggedItem = null;
        this.draggedItemRect = null;
        this.placeholder = null;
        this.mouseOffset = { x: 0, y: 0 };
        this.lastY = 0;
        this.isDragging = false;
        this.originalPosition = null;
        this.originalOrder = [];
        this.containerRect = null; // Para almacenar las dimensiones del contenedor
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicializar la funcionalidad de arrastrar y soltar
     */
    init() {
        // Añadir manejadores de eventos
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Añadir handles de arrastre a los elementos
        this.addDragHandles();
        
        // Guardar el orden original
        this.saveOriginalOrder();
        
        // Prevenir comportamiento predeterminado de arrastre nativo
        this.container.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Crear overlay para bloquear interacciones durante el arrastre
        if (!document.querySelector('.drag-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'drag-overlay';
            document.body.appendChild(overlay);
        }
        
        // Crear zonas de scroll automático
        if (!document.querySelector('.drag-scroll-zone-top')) {
            const topScrollZone = document.createElement('div');
            topScrollZone.className = 'drag-scroll-zone drag-scroll-zone-top';
            document.body.appendChild(topScrollZone);
        }
        
        if (!document.querySelector('.drag-scroll-zone-bottom')) {
            const bottomScrollZone = document.createElement('div');
            bottomScrollZone.className = 'drag-scroll-zone drag-scroll-zone-bottom';
            document.body.appendChild(bottomScrollZone);
        }
    }
    
    /**
     * Añadir manejadores de arrastre a los elementos
     */
    addDragHandles() {
        const items = this.container.querySelectorAll(this.options.itemSelector);
        items.forEach(item => {
            // Comprobar si ya tiene un manejador
            let handle = item.querySelector(this.options.handleSelector);
            
            // Si no tiene un manejador, crear uno
            if (!handle) {
                handle = document.createElement('div');
                handle.className = 'drag-handle';
                handle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
                
                // Insertar antes del primer hijo
                if (item.firstChild) {
                    item.insertBefore(handle, item.firstChild);
                } else {
                    item.appendChild(handle);
                }
            }
            
            // Asegurarse de que el elemento sea posicionado relativamente para el posicionamiento absoluto del manejador
            if (getComputedStyle(item).position === 'static') {
                item.style.position = 'relative';
            }
        });
    }
    
    /**
     * Guardar el orden original de los elementos
     */
    saveOriginalOrder() {
        const items = this.container.querySelectorAll(this.options.itemSelector);
        this.originalOrder = Array.from(items).map(item => ({
            id: item.dataset.id,
            index: this.getItemIndex(item),
            groupId: item.dataset.groupId || null
        }));
    }
    
    /**
     * Manejador del evento mousedown
     * @param {MouseEvent} e - Evento de mousedown
     */
    handleMouseDown(e) {
        const handle = e.target.closest(this.options.handleSelector);
        if (!handle) return;
        
        // Evitar que se seleccione texto durante el arrastre
        e.preventDefault();
        
        // Encontrar el elemento arrastrable padre
        const item = handle.closest(this.options.itemSelector);
        if (!item) return;
        
        // Añadir clase al body para indicar que se está arrastrando
        document.body.classList.add('is-dragging');
        
        // Establecer estado de arrastre
        this.isDragging = true;
        this.draggedItem = item;
        
        // Guardar las dimensiones originales
        this.draggedItemRect = item.getBoundingClientRect();
        
        // Calcular el desplazamiento del ratón respecto a la esquina superior izquierda del elemento
        this.mouseOffset.x = e.clientX - this.draggedItemRect.left;
        this.mouseOffset.y = e.clientY - this.draggedItemRect.top;
        
        // Guardar la posición original para referencia
        this.originalPosition = {
            top: item.offsetTop,
            left: item.offsetLeft,
            parent: item.parentNode
        };
        
        // Guardar la posición Y actual para detectar la dirección de arrastre
        this.lastY = e.clientY;
        
        // Crear un placeholder para mantener el espacio
        this.placeholder = item.cloneNode(true);
        this.placeholder.classList.add(this.options.placeholderClass);
        this.placeholder.style.opacity = '0.3';
        this.placeholder.style.pointerEvents = 'none';
        
        // Reemplazar el elemento con el placeholder
        item.parentNode.insertBefore(this.placeholder, item);
        
        // Añadir clase de arrastre y ajustar estilo
        item.classList.add(this.options.dragClass);
        item.style.width = `${this.draggedItemRect.width}px`;
        item.style.height = `${this.draggedItemRect.height}px`;
        item.style.position = 'fixed'; // Usar posición fija en lugar de absoluta
        item.style.zIndex = '1050';   // z-index alto para estar por encima de todo
        item.style.pointerEvents = 'none';
        
        // Posicionar el elemento según la posición del ratón
        this.updateDraggedItemPosition(e);
        
        // Mover el elemento arrastrado al final del body para evitar problemas de z-index
        document.body.appendChild(item);
    }
    
    /**
     * Manejador del evento mousemove
     * @param {MouseEvent} e - Evento de mousemove
     */
    handleMouseMove(e) {
        if (!this.isDragging || !this.draggedItem) return;
        
        // Calcular la nueva posición
        const newLeft = e.clientX - this.mouseOffset.x;
        const newTop = e.clientY - this.mouseOffset.y;
        
        // Obtener las dimensiones del contenedor si no las tenemos
        if (!this.containerRect && this.options.constrainToContainer) {
            this.containerRect = this.container.getBoundingClientRect();
        }
        
        // Restringir el movimiento al contenedor si la opción está habilitada
        let finalLeft = newLeft;
        let finalTop = newTop;
        
        if (this.options.constrainToContainer && this.containerRect) {
            // Límites del contenedor
            const minLeft = this.containerRect.left;
            const maxLeft = this.containerRect.right - this.draggedItemRect.width;
            const minTop = this.containerRect.top;
            const maxTop = this.containerRect.bottom - this.draggedItemRect.height;
            
            // Aplicar restricciones
            finalLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
            finalTop = Math.max(minTop, Math.min(maxTop, newTop));
        }
        
        // Actualizar la posición con las restricciones aplicadas
        this.draggedItem.style.position = 'fixed';
        this.draggedItem.style.left = `${finalLeft}px`;
        this.draggedItem.style.top = `${finalTop}px`;
        this.draggedItem.style.width = `${this.draggedItemRect.width}px`;
        this.draggedItem.style.zIndex = '1000';
        
        // Manejar auto-scroll
        this.handleAutoScroll(e);
        
        // Determinar la posición del cursor en relación al contenedor
        const containerRect = this.container.getBoundingClientRect();
        const mouseY = e.clientY - containerRect.top + this.container.scrollTop;
        
        // Obtener todos los elementos arrastrables
        const items = Array.from(this.container.querySelectorAll(this.options.itemSelector))
            .filter(item => item !== this.draggedItem && !item.classList.contains(this.options.placeholderClass));
        
        // Detectar el elemento sobre el que estamos pasando
        let targetItem = null;
        let closestDistance = Infinity;
        
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemY = rect.top + rect.height / 2 - containerRect.top + this.container.scrollTop;
            const distance = Math.abs(mouseY - itemY);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                targetItem = item;
            }
        });
        
        // Si encontramos un elemento objetivo, mover el placeholder
        if (targetItem) {
            const targetRect = targetItem.getBoundingClientRect();
            const targetY = targetRect.top + targetRect.height / 2;
            
            // Determinar si el cursor está por encima o por debajo del centro del elemento objetivo
            const isBelow = e.clientY > targetY;
            
            // Mover el placeholder antes o después del elemento objetivo
            if (isBelow) {
                if (targetItem.nextSibling) {
                    this.container.insertBefore(this.placeholder, targetItem.nextSibling);
                } else {
                    this.container.appendChild(this.placeholder);
                }
            } else {
                this.container.insertBefore(this.placeholder, targetItem);
            }
        }
        
        // Actualizar la dirección de desplazamiento
        this.lastY = e.clientY;
    }
    
    /**
     * Manejar el auto-scroll durante el arrastre
     * @param {MouseEvent} e - Evento de mousemove
     */
    handleAutoScroll(e) {
        const windowHeight = window.innerHeight;
        const scrollThreshold = 80; // Distancia del borde en la que comenzará el scroll
        
        // Determinar velocidad de scroll basada en la distancia al borde
        let scrollSpeed = 0;
        
        // Scroll hacia abajo (cerca del borde inferior)
        if (e.clientY > windowHeight - scrollThreshold) {
            // Cuanto más cerca del borde, más rápido el scroll
            scrollSpeed = Math.min(20, (e.clientY - (windowHeight - scrollThreshold)) / 2);
            window.scrollBy(0, scrollSpeed);
        }
        // Scroll hacia arriba (cerca del borde superior)
        else if (e.clientY < scrollThreshold) {
            // Cuanto más cerca del borde, más rápido el scroll
            scrollSpeed = Math.min(20, (scrollThreshold - e.clientY) / 2);
            window.scrollBy(0, -scrollSpeed);
        }
    }
    
    /**
     * Manejador del evento mouseup
     * @param {MouseEvent} e - Evento de mouseup
     */
    handleMouseUp(e) {
        if (!this.isDragging || !this.draggedItem) return;
        
        // Quitar clase del body que indica arrastre
        document.body.classList.remove('is-dragging');
        
        // Asegurar que el elemento arrastrado está en el DOM correcto antes de reemplazar
        if (this.draggedItem.parentNode !== this.container && this.draggedItem.parentNode !== this.placeholder.parentNode) {
            document.body.removeChild(this.draggedItem);
        }
        
        // Asegurar que el placeholder está en el DOM
        if (!this.placeholder.parentNode) {
            console.error('El placeholder ya no está en el DOM');
            this.container.appendChild(this.draggedItem);
        } else {
            // Reemplazar el placeholder con el elemento original
            try {
                this.placeholder.parentNode.replaceChild(this.draggedItem, this.placeholder);
            } catch (error) {
                console.error('Error al reemplazar el placeholder:', error);
                // Intento de recuperación: añadir directamente al contenedor
                this.container.appendChild(this.draggedItem);
            }
        }
        
        // Restaurar estilos
        this.draggedItem.classList.remove(this.options.dragClass);
        this.draggedItem.style.position = '';
        this.draggedItem.style.top = '';
        this.draggedItem.style.left = '';
        this.draggedItem.style.width = '';
        this.draggedItem.style.height = '';
        this.draggedItem.style.zIndex = '';
        this.draggedItem.style.transform = '';
        this.draggedItem.style.pointerEvents = '';
        
        // Verificar si el orden ha cambiado
        if (this.hasOrderChanged()) {
            // Obtener el nuevo orden
            const newOrder = this.getNewOrder();
            
            // Actualizar el orden
            this.updateOrder(newOrder);
            
            // Llamar al callback si existe
            if (typeof this.options.onOrderChange === 'function') {
                this.options.onOrderChange(newOrder);
            }
        }
        
        // Limpiar referencias
        this.draggedItem = null;
        this.draggedItemRect = null;
        this.placeholder = null;
        this.isDragging = false;
        this.originalPosition = null;
        
        // Guardar el nuevo orden original
        this.saveOriginalOrder();
    }
    
    /**
     * Actualizar la posición del elemento arrastrado según la posición del ratón
     * @param {MouseEvent} e - Evento de ratón
     */
    updateDraggedItemPosition(e) {
        if (!this.draggedItem) return;
        
        // Calcular la nueva posición
        let left = e.clientX - this.mouseOffset.x;
        let top = e.clientY - this.mouseOffset.y;
        
        // Obtener dimensiones de la ventana y documento
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const documentWidth = document.documentElement.scrollWidth;
        
        // Obtener posición del contenedor
        const containerRect = this.container.getBoundingClientRect();
        
        // Obtener posición del footer si existe
        const footer = document.querySelector('footer') || document.getElementById('footer');
        const footerTop = footer ? footer.getBoundingClientRect().top : documentHeight;
        
        // Establecer límites
        const maxTop = Math.min(footerTop - this.draggedItemRect.height - 20, documentHeight - this.draggedItemRect.height - 20);
        const maxLeft = documentWidth - this.draggedItemRect.width - 20;
        const minTop = containerRect.top;
        const minLeft = containerRect.left;
        
        // Aplicar límites
        top = Math.max(minTop, Math.min(top, maxTop));
        left = Math.max(minLeft, Math.min(left, maxLeft));
        
        // Actualizar posición
        this.draggedItem.style.top = `${top}px`;
        this.draggedItem.style.left = `${left}px`;
    }
    
    /**
     * Verificar si el orden de los elementos ha cambiado
     * @return {boolean} - Indica si el orden ha cambiado
     */
    hasOrderChanged() {
        const currentOrder = this.getNewOrder();
        
        // Comparar con el orden original
        if (currentOrder.length !== this.originalOrder.length) return true;
        
        for (let i = 0; i < currentOrder.length; i++) {
            if (currentOrder[i].id !== this.originalOrder[i].id ||
                currentOrder[i].index !== this.originalOrder[i].index ||
                currentOrder[i].groupId !== this.originalOrder[i].groupId) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Obtener el nuevo orden de los elementos
     * @return {Array} - Array de objetos con id, índice y groupId de cada elemento
     */
    getNewOrder() {
        const items = this.container.querySelectorAll(this.options.itemSelector);
        
        return Array.from(items).map((item, index) => ({
            id: item.dataset.id,
            index: index + 1, // Índice 1-based para la interfaz
            groupId: item.dataset.groupId || null
        }));
    }
    
    /**
     * Actualizar el orden en la interfaz y opcionalmente en el backend
     */
    updateOrder(newOrder) {
        const items = this.container.querySelectorAll(this.options.itemSelector);
        
        // Actualizar el índice visual de cada elemento
        Array.from(items).forEach((item, index) => {
            const orderLabel = item.querySelector('.order-label');
            if (orderLabel) {
                orderLabel.textContent = index + 1;
            }
            
            // Almacenar el nuevo índice como data-attribute
            item.dataset.order = index + 1;
        });
        
        // Guardar el nuevo orden como el orden original
        this.saveOriginalOrder();
    }
    
    /**
     * Obtener el índice de un elemento
     * @param {HTMLElement} item - Elemento DOM para el que obtener el índice
     * @return {number} - Índice del elemento
     */
    getItemIndex(item) {
        if (item.dataset.order) {
            return parseInt(item.dataset.order, 10);
        }
        
        const items = Array.from(this.container.querySelectorAll(this.options.itemSelector));
        return items.indexOf(item) + 1; // Índice 1-based para la interfaz
    }
    
    /**
     * Actualizar los elementos arrastrables (después de añadir o eliminar elementos)
     */
    refresh() {
        // Actualizar manejadores de arrastre
        this.addDragHandles();
        
        // Guardar el nuevo orden original
        this.saveOriginalOrder();
    }
    
    /**
     * Destruir la instancia y limpiar los eventos
     */
    destroy() {
        // Eliminar manejadores de eventos
        this.container.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Eliminar manejadores de arrastre
        const handles = this.container.querySelectorAll(this.options.handleSelector);
        handles.forEach(handle => {
            handle.remove();
        });
        
        // Reiniciar estado
        this.isDragging = false;
        this.draggedItem = null;
        this.placeholder = null;
    }
}

// Exportar la clase para su uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DragDropSections;
} 