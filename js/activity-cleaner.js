/**
 * Herramienta para limpiar actividades huérfanas
 * 
 * Este script proporciona funciones para:
 * 1. Identificar actividades huérfanas (que no están asociadas a ninguna sección)
 * 2. Eliminar actividades huérfanas
 * 3. Limpiar el registro de actividades
 */

class ActivityCleaner {
    /**
     * Inicializa el limpiador de actividades
     */
    constructor() {
        this.activityRegistry = [];
        this.activeActivities = [];
        this.orphanActivities = [];
        this.loadData();
    }

    /**
     * Carga los datos necesarios para la limpieza
     */
    loadData() {
        try {
            // Cargar el registro de actividades
            this.activityRegistry = JSON.parse(localStorage.getItem('activity_registry') || '[]');
            console.log(`Registro de actividades cargado: ${this.activityRegistry.length} actividades`);

            // Cargar datos de cursos, temas y secciones
            const courseData = JSON.parse(localStorage.getItem('courseData') || '{}');
            
            // Identificar actividades activas
            this.activeActivities = [];
            
            // Buscar en todas las secciones
            if (courseData.persistent && courseData.persistent.sections) {
                Object.values(courseData.persistent.sections).forEach(section => {
                    if (section.type === 'activity' && section.content) {
                        this.activeActivities.push(section.content);
                    }
                });
            }
            
            // Buscar también en la estructura de temas (por si hay secciones que no están en persistent.sections)
            if (courseData.persistent && courseData.persistent.topics) {
                Object.values(courseData.persistent.topics).forEach(topic => {
                    if (topic.sections && Array.isArray(topic.sections)) {
                        topic.sections.forEach(section => {
                            if (section.type === 'activity' && section.content) {
                                if (!this.activeActivities.includes(section.content)) {
                                    this.activeActivities.push(section.content);
                                }
                            }
                        });
                    }
                });
            }
            
            console.log(`Actividades activas encontradas: ${this.activeActivities.length}`);
            
            // Identificar actividades huérfanas
            this.orphanActivities = this.activityRegistry
                .filter(activity => !this.activeActivities.includes(activity.id))
                .map(activity => activity.id);
                
            console.log(`Actividades huérfanas encontradas: ${this.orphanActivities.length}`);
        } catch (error) {
            console.error('Error al cargar datos para limpieza:', error);
        }
    }

    /**
     * Elimina las actividades huérfanas
     * @returns {number} Número de actividades eliminadas
     */
    cleanOrphanActivities() {
        let deletedCount = 0;
        
        try {
            // Eliminar cada actividad huérfana
            this.orphanActivities.forEach(activityId => {
                // Eliminar datos principales
                localStorage.removeItem(`activity_data_${activityId}`);
                localStorage.removeItem(activityId);
                deletedCount++;
            });
            
            // Actualizar el registro de actividades
            const updatedRegistry = this.activityRegistry.filter(
                activity => !this.orphanActivities.includes(activity.id)
            );
            
            localStorage.setItem('activity_registry', JSON.stringify(updatedRegistry));
            console.log(`Registro de actividades actualizado: ${updatedRegistry.length} actividades`);
            
            // Actualizar también en el sistema de persistencia si existe
            const courseData = JSON.parse(localStorage.getItem('courseData') || '{}');
            if (courseData.persistent && courseData.persistent.activities) {
                this.orphanActivities.forEach(activityId => {
                    if (courseData.persistent.activities[activityId]) {
                        delete courseData.persistent.activities[activityId];
                    }
                });
                
                localStorage.setItem('courseData', JSON.stringify(courseData));
                console.log('Sistema de persistencia actualizado');
            }
            
            return deletedCount;
        } catch (error) {
            console.error('Error al limpiar actividades huérfanas:', error);
            return deletedCount;
        }
    }

    /**
     * Obtiene información sobre las actividades huérfanas
     * @returns {Array} Lista de actividades huérfanas con detalles
     */
    getOrphanActivitiesInfo() {
        const orphanInfo = [];
        
        this.orphanActivities.forEach(activityId => {
            const registryEntry = this.activityRegistry.find(a => a.id === activityId);
            let activityData = null;
            
            try {
                const dataStr = localStorage.getItem(`activity_data_${activityId}`);
                if (dataStr) {
                    activityData = JSON.parse(dataStr);
                } else {
                    const altDataStr = localStorage.getItem(activityId);
                    if (altDataStr) {
                        activityData = JSON.parse(altDataStr);
                    }
                }
            } catch (e) {
                console.warn(`Error al parsear datos de actividad ${activityId}:`, e);
            }
            
            orphanInfo.push({
                id: activityId,
                title: registryEntry ? registryEntry.title : 'Desconocido',
                type: registryEntry ? registryEntry.type : 'unknown',
                updated: registryEntry ? registryEntry.updated : null,
                hasData: !!activityData,
                questionCount: activityData && activityData.questions ? activityData.questions.length : 0
            });
        });
        
        return orphanInfo;
    }

    /**
     * Elimina una actividad específica
     * @param {string} activityId - ID de la actividad a eliminar
     * @returns {boolean} True si se eliminó correctamente
     */
    deleteActivity(activityId) {
        try {
            // Eliminar datos de la actividad
            localStorage.removeItem(`activity_data_${activityId}`);
            localStorage.removeItem(activityId);
            
            // Actualizar el registro de actividades
            const updatedRegistry = this.activityRegistry.filter(a => a.id !== activityId);
            localStorage.setItem('activity_registry', JSON.stringify(updatedRegistry));
            
            // Actualizar también en el sistema de persistencia si existe
            const courseData = JSON.parse(localStorage.getItem('courseData') || '{}');
            if (courseData.persistent && courseData.persistent.activities && courseData.persistent.activities[activityId]) {
                delete courseData.persistent.activities[activityId];
                localStorage.setItem('courseData', JSON.stringify(courseData));
            }
            
            // Actualizar las listas internas
            this.activityRegistry = updatedRegistry;
            this.orphanActivities = this.orphanActivities.filter(id => id !== activityId);
            
            return true;
        } catch (error) {
            console.error(`Error al eliminar actividad ${activityId}:`, error);
            return false;
        }
    }

    /**
     * Actualiza el registro de actividades para que coincida con las actividades activas
     * @returns {boolean} True si se actualizó correctamente
     */
    updateActivityRegistry() {
        try {
            // Crear un nuevo registro que solo incluya actividades activas
            const newRegistry = this.activityRegistry.filter(activity => 
                this.activeActivities.includes(activity.id)
            );
            
            // Guardar el nuevo registro
            localStorage.setItem('activity_registry', JSON.stringify(newRegistry));
            console.log(`Registro de actividades actualizado: ${newRegistry.length} actividades`);
            
            return true;
        } catch (error) {
            console.error('Error al actualizar registro de actividades:', error);
            return false;
        }
    }
}

// Función para limpiar actividades huérfanas automáticamente
function cleanOrphanActivities() {
    const cleaner = new ActivityCleaner();
    const deletedCount = cleaner.cleanOrphanActivities();
    return deletedCount;
}

// Función para obtener información sobre actividades huérfanas
function getOrphanActivitiesInfo() {
    const cleaner = new ActivityCleaner();
    return cleaner.getOrphanActivitiesInfo();
}
