/**
 * Administrador de Actividades
 *
 * Este archivo contiene la lógica para gestionar las actividades almacenadas en localStorage.
 * Permite listar, filtrar, ver detalles y eliminar actividades.
 *
 * Índice de funciones:
 * 1. init() - Inicializa la página
 * 2. loadDirectActivitiesTable() - Carga todas las actividades desde localStorage
 * 3. findSectionsUsingActivity() - Encuentra secciones que usan una actividad
 * 4. showActivityDetails() - Muestra los detalles de una actividad
 * 5. getActivityTypeIcon() - Obtiene el icono para un tipo de actividad
 * 6. getActivityTypeLabel() - Obtiene la etiqueta para un tipo de actividad
 * 7. deleteSelectedActivities() - Elimina las actividades seleccionadas
 * 8. deleteActivity() - Elimina una actividad específica
 * 9. refreshActivitiesTable() - Actualiza la tabla de actividades
 * 10. updateStatistics() - Actualiza los contadores de actividades
 * 11. updateDataPersistence() - Actualiza el data persistence con las actividades en localStorage
 */

// Variables globales
let allActivities = [];
let filteredActivities = [];
let selectedActivities = new Set();

// La inicialización ahora se maneja en el archivo HTML
// document.addEventListener('DOMContentLoaded', init);

/**
 * Inicializa la página y configura los eventos
 */
function init() {
    console.log('Inicializando administrador de actividades...');

    // Verificar si el usuario está autenticado y es administrador
    if (typeof auth !== 'undefined' && !auth.isAdmin()) {
        window.location.href = '../login.html';
        return;
    }

    // Cargar actividades
    loadActivities();
    loadDirectActivitiesTable();

    // Configurar eventos para filtros
    document.getElementById('searchInput').addEventListener('input', filterActivities);
    document.getElementById('typeFilter').addEventListener('change', filterActivities);
    document.getElementById('statusFilter').addEventListener('change', filterActivities);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // Configurar eventos para selección y actualización
    document.getElementById('updateDataPersistenceBtn').addEventListener('click', updateDataPersistence);
    document.getElementById('toggleSilentModeBtn').addEventListener('click', toggleSilentMode);

    // Inicializar el estado del modo silencioso
    updateSilentModeStatus();
    document.getElementById('selectAllBtn').addEventListener('click', selectAllActivities);
    document.getElementById('deselectAllBtn').addEventListener('click', deselectAllActivities);
    document.getElementById('refreshTableBtn').addEventListener('click', refreshActivitiesTable);
    document.getElementById('selectAllCheckbox').addEventListener('change', toggleSelectAllTableRows);

    // Configurar evento para eliminar
    document.getElementById('deleteSelectedBtn').addEventListener('click', showDeleteConfirmation);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteSelectedActivities);
}

/**
 * Carga todas las actividades desde localStorage
 */
function loadActivities() {
    console.log('Cargando actividades desde localStorage...');
    allActivities = [];

    try {
        // Mostrar mensaje de carga
        document.getElementById('activitiesList').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando actividades...</p>
            </div>
        `;

        // Paso 1: Recopilar todas las actividades del localStorage
        const activityKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('activity_') && !key.startsWith('activity_registry')) {
                activityKeys.push(key);
            }
        }

        console.log(`Se encontraron ${activityKeys.length} claves de actividades en localStorage`);

        // Paso 2: Cargar los datos de las actividades
        for (const key of activityKeys) {
            try {
                const activityData = JSON.parse(localStorage.getItem(key));

                // Extraer el ID de la clave (activity_123456789 -> 123456789)
                const activityId = key.replace('activity_', '');

                // Añadir el ID si no está presente
                if (!activityData.id) {
                    activityData.id = activityId;
                }

                // Inicializar como no en uso (se actualizará después)
                activityData.inUse = false;

                // Añadir a la lista
                allActivities.push(activityData);
            } catch (parseError) {
                console.error(`Error al parsear actividad ${key}:`, parseError);
            }
        }

        // Paso 3: Ordenar por fecha de creación (más reciente primero)
        allActivities.sort((a, b) => {
            const idA = parseInt(a.id);
            const idB = parseInt(b.id);
            return idB - idA; // Orden descendente
        });

        console.log(`Se encontraron ${allActivities.length} actividades`);

        // Paso 4: Verificar qué actividades están en uso (de manera eficiente)
        console.log('Verificando qué actividades están en uso...');

        // 4.1: Obtener los cursos y temas activos
        const courses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
        const topics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');

        // 4.2: Crear un mapa de temas activos (que pertenecen a cursos activos)
        const activeTopicIds = new Set();
        courses.forEach(course => {
            if (course.topicIds && Array.isArray(course.topicIds)) {
                course.topicIds.forEach(topicId => activeTopicIds.add(String(topicId)));
            }
        });

        console.log(`Encontrados ${activeTopicIds.size} temas activos en los cursos`);

        // 4.3: Crear un mapa de actividades en uso
        const usedActivityIds = new Set();

        // Buscar en temas activos primero
        const activeTopics = topics.filter(topic => activeTopicIds.has(String(topic.id)));
        activeTopics.forEach(topic => {
            if (topic.sections) {
                topic.sections.forEach(section => {
                    if (section.type === 'activity') {
                        usedActivityIds.add(String(section.content));
                    }
                });
            }
        });

        // Como respaldo, verificar también en temas inactivos
        topics.forEach(topic => {
            if (!activeTopicIds.has(String(topic.id)) && topic.sections) {
                topic.sections.forEach(section => {
                    if (section.type === 'activity') {
                        usedActivityIds.add(String(section.content));
                    }
                });
            }
        });

        console.log(`Se encontraron ${usedActivityIds.size} actividades en uso`);

        // 4.4: Marcar las actividades que están en uso
        allActivities.forEach(activity => {
            activity.inUse = usedActivityIds.has(String(activity.id));
        });

        // Paso 5: Actualizar la lista filtrada
        filteredActivities = [...allActivities];

        // Paso 6: Mostrar actividades y actualizar estadísticas
        displayActivities();
        updateStatistics();

    } catch (error) {
        console.error('Error al cargar actividades:', error);
        document.getElementById('activitiesList').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Error al cargar actividades: ${error.message}
            </div>
        `;
    }
}

/**
 * Muestra las actividades en la interfaz
 */
function displayActivities() {
    const activitiesList = document.getElementById('activitiesList');

    // Si no hay actividades, mostrar mensaje
    if (filteredActivities.length === 0) {
        activitiesList.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> No se encontraron actividades que coincidan con los filtros.
            </div>
        `;
        return;
    }

    // Generar HTML para cada actividad
    let html = '';

    filteredActivities.forEach(activity => {
        const isSelected = selectedActivities.has(activity.id);
        const typeIcon = getActivityTypeIcon(activity.type);
        const typeLabel = getActivityTypeLabel(activity.type);

        // No verificamos el uso aquí para evitar múltiples llamadas costosas
        // Usamos el estado que ya se calculó en loadActivities

        const statusBadge = activity.inUse
            ? '<span class="badge bg-success ms-2">En uso</span>'
            : '<span class="badge bg-secondary ms-2">Sin usar</span>';

        // Estilo de borde para la tarjeta
        const cardBorderStyle = activity.inUse
            ? 'border-left: 4px solid #198754;' // verde para actividades en uso
            : 'border-left: 4px solid #6c757d;'; // gris para actividades sin usar

        html += `
            <div class="list-group-item activity-card ${isSelected ? 'selected' : ''}" data-id="${activity.id}" style="${cardBorderStyle}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="form-check me-3">
                            <input class="form-check-input activity-checkbox" type="checkbox"
                                id="check_${activity.id}" ${isSelected ? 'checked' : ''}>
                            <label class="form-check-label" for="check_${activity.id}"></label>
                        </div>
                        <div>
                            <h5 class="mb-1">
                                ${activity.title || 'Sin título'}
                                ${statusBadge}
                            </h5>
                            <div class="small text-muted">
                                <span class="badge bg-light text-dark activity-type-badge">
                                    <i class="${typeIcon}"></i> ${typeLabel}
                                </span>
                                <span class="ms-2">ID: ${activity.id}</span>
                                <span class="ms-2">Creada: ${formatDate(activity.id)}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-info view-details-btn" data-id="${activity.id}">
                            <i class="fas fa-eye"></i> Ver detalles
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    activitiesList.innerHTML = html;

    // Añadir eventos a los elementos generados
    document.querySelectorAll('.activity-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const activityId = this.closest('.activity-card').dataset.id;
            toggleActivitySelection(activityId, this.checked);
        });
    });

    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Evitar que el clic en el checkbox o en el botón de detalles active esto
            if (e.target.closest('.form-check') || e.target.closest('.view-details-btn')) {
                return;
            }

            const activityId = this.dataset.id;
            const checkbox = this.querySelector('.activity-checkbox');
            checkbox.checked = !checkbox.checked;
            toggleActivitySelection(activityId, checkbox.checked);
        });
    });

    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const activityId = this.dataset.id;
            showActivityDetails(activityId);
        });
    });

    // Actualizar contador de seleccionados
    updateSelectedCount();
}

/**
 * Filtra las actividades según los criterios
 */
function filterActivities() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredActivities = allActivities.filter(activity => {
        // Filtrar por término de búsqueda
        const matchesSearch = !searchTerm ||
            (activity.title && activity.title.toLowerCase().includes(searchTerm)) ||
            (activity.description && activity.description.toLowerCase().includes(searchTerm)) ||
            activity.id.includes(searchTerm);

        // Filtrar por tipo
        const matchesType = !typeFilter || activity.type === typeFilter;

        // Filtrar por estado
        const matchesStatus = !statusFilter ||
            (statusFilter === 'used' && activity.inUse) ||
            (statusFilter === 'unused' && !activity.inUse);

        return matchesSearch && matchesType && matchesStatus;
    });

    // Actualizar la visualización
    displayActivities();
}

/**
 * Resetea todos los filtros
 */
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('statusFilter').value = '';

    filteredActivities = [...allActivities];
    displayActivities();
}

/**
 * Actualiza los contadores de actividades
 */
function updateStatistics() {
    document.getElementById('totalActivities').textContent = allActivities.length;

    const multipleChoiceCount = allActivities.filter(a => a.type === 'multiple-choice').length;
    const trueFalseCount = allActivities.filter(a => a.type === 'true-false').length;
    const shortAnswerCount = allActivities.filter(a => a.type === 'short-answer').length;

    document.getElementById('multipleChoiceCount').textContent = multipleChoiceCount;
    document.getElementById('trueFalseCount').textContent = trueFalseCount;
    document.getElementById('shortAnswerCount').textContent = shortAnswerCount;
}

/**
 * Selecciona o deselecciona una actividad
 */
function toggleActivitySelection(activityId, isSelected) {
    if (isSelected) {
        selectedActivities.add(activityId);
    } else {
        selectedActivities.delete(activityId);
    }

    // Actualizar la clase visual
    const card = document.querySelector(`.activity-card[data-id="${activityId}"]`);
    if (card) {
        if (isSelected) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }

    // Actualizar contador y estado del botón de eliminar
    updateSelectedCount();
}

/**
 * Actualiza el contador de actividades seleccionadas
 */
function updateSelectedCount() {
    // Contar actividades seleccionadas en la lista original
    const listCount = selectedActivities.size;

    // Contar actividades seleccionadas en la tabla
    const tableCheckboxes = document.querySelectorAll('.table-checkbox:checked');
    const tableCount = tableCheckboxes.length;

    // Actualizar contador total
    const totalCount = listCount + tableCount;
    document.getElementById('selectedCount').textContent = totalCount;

    // Habilitar/deshabilitar botón de eliminar
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    deleteBtn.disabled = totalCount === 0;
}

/**
 * Selecciona todas las actividades visibles
 */
function selectAllActivities() {
    filteredActivities.forEach(activity => {
        selectedActivities.add(activity.id);
    });

    // Actualizar checkboxes
    document.querySelectorAll('.activity-checkbox').forEach(checkbox => {
        checkbox.checked = true;
        const card = checkbox.closest('.activity-card');
        if (card) {
            card.classList.add('selected');
        }
    });

    updateSelectedCount();
}

/**
 * Deselecciona todas las actividades
 */
function deselectAllActivities() {
    selectedActivities.clear();

    // Actualizar checkboxes
    document.querySelectorAll('.activity-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.activity-card');
        if (card) {
            card.classList.remove('selected');
        }
    });

    updateSelectedCount();
}

/**
 * Muestra el modal de confirmación para eliminar
 */
function showDeleteConfirmation() {
    const count = selectedActivities.size;
    if (count === 0) return;

    document.getElementById('deleteCount').textContent = count;

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();
}

/**
 * Elimina las actividades seleccionadas
 */
function deleteSelectedActivities() {
    // Obtener actividades seleccionadas de la lista original
    const activitiesToDelete = Array.from(selectedActivities);

    // Obtener actividades seleccionadas de la tabla
    const tableCheckboxes = document.querySelectorAll('.table-checkbox:checked');
    const tableKeysToDelete = Array.from(tableCheckboxes).map(checkbox => {
        return checkbox.closest('tr').dataset.key;
    });

    const totalToDelete = activitiesToDelete.length + tableKeysToDelete.length;

    if (totalToDelete === 0) {
        alert('No hay actividades seleccionadas para eliminar.');
        return;
    }

    // Actualizar el contador en el modal de confirmación
    document.getElementById('deleteCount').textContent = totalToDelete;

    let deletedCount = 0;
    let errorCount = 0;

    console.log(`Eliminando ${totalToDelete} actividades...`);

    // Eliminar actividades de la lista original
    activitiesToDelete.forEach(activityId => {
        try {
            // Eliminar la actividad de localStorage
            localStorage.removeItem(`activity_${activityId}`);

            // También eliminar datos relacionados si existen
            localStorage.removeItem(`activity_data_${activityId}`);

            deletedCount++;
        } catch (error) {
            console.error(`Error al eliminar actividad ${activityId}:`, error);
            errorCount++;
        }
    });

    // Eliminar actividades de la tabla
    tableKeysToDelete.forEach(key => {
        try {
            // Eliminar la actividad de localStorage
            localStorage.removeItem(key);

            // También eliminar datos relacionados si existen
            const activityId = key.replace('activity_', '');
            localStorage.removeItem(`activity_data_${activityId}`);

            deletedCount++;
        } catch (error) {
            console.error(`Error al eliminar actividad ${key}:`, error);
            errorCount++;
        }
    });

    // Cerrar el modal
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    deleteModal.hide();

    // Mostrar mensaje de resultado
    let alertClass = 'alert-success';
    let message = `Se eliminaron ${deletedCount} actividades correctamente.`;

    if (errorCount > 0) {
        alertClass = 'alert-warning';
        message += ` Hubo errores al eliminar ${errorCount} actividades.`;
    }

    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    document.querySelector('.container').insertAdjacentHTML('afterbegin', alertHtml);

    // Limpiar selección y recargar actividades
    selectedActivities.clear();
    document.querySelectorAll('.table-checkbox:checked').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('selectAllCheckbox').checked = false;

    // Recargar datos
    refreshActivitiesTable();
}

/**
 * Muestra los detalles de una actividad
 */
function showActivityDetails(activityId) {
    const activity = allActivities.find(a => a.id === activityId);
    if (!activity) return;

    const detailsContent = document.getElementById('activityDetailsContent');
    const typeLabel = getActivityTypeLabel(activity.type);
    const statusBadge = activity.inUse
        ? '<span class="badge bg-success">En uso</span>'
        : '<span class="badge bg-secondary">Sin usar</span>';

    let questionsHtml = '';
    if (activity.questions && activity.questions.length > 0) {
        questionsHtml = '<div class="mt-4"><h6>Preguntas:</h6><ol>';
        activity.questions.forEach(question => {
            questionsHtml += `<li>${question.text || 'Sin texto'}</li>`;
        });
        questionsHtml += '</ol></div>';
    }

    // Buscar secciones que usan esta actividad
    const usedInSections = findSectionsUsingActivity(activityId);

    // Actualizar el estado de uso basado en los resultados de la búsqueda
    activity.inUse = usedInSections.length > 0;

    // Actualizar la insignia de estado
    let detailsStatusBadge = activity.inUse
        ? '<span class="badge bg-success">En uso</span>'
        : '<span class="badge bg-secondary">Sin usar</span>';

    let usageHtml = '';
    if (usedInSections.length > 0) {
        // Separar secciones activas e inactivas
        const activeSections = usedInSections.filter(s => s.isActive);
        const inactiveSections = usedInSections.filter(s => !s.isActive);

        usageHtml = '<div class="mt-4"><h6>Utilizada en:</h6>';

        // Mostrar secciones activas
        if (activeSections.length > 0) {
            usageHtml += '<div class="alert alert-success p-2 mb-3"><strong>Secciones activas:</strong><ul class="mb-0">';
            activeSections.forEach(section => {
                // Preparar la información de cursos relacionados
                let courseInfo = '';
                if (section.relatedCourses && section.relatedCourses.length > 0) {
                    if (section.relatedCourses.length === 1) {
                        courseInfo = `Curso: <strong>${section.relatedCourses[0].title}</strong>`;
                    } else {
                        courseInfo = `Cursos: <strong>${section.relatedCourses.map(c => c.title).join('</strong>, <strong>')}</strong>`;
                    }
                } else {
                    courseInfo = `Curso: ${section.courseName || 'No asignado'}`;
                }

                usageHtml += `
                    <li>
                        <div><strong>${section.title}</strong></div>
                        <div class="text-muted small">
                            <i class="fas fa-book me-1"></i> Tema: <strong>${section.topicTitle || 'Desconocido'}</strong><br>
                            <i class="fas fa-graduation-cap me-1"></i> ${courseInfo}
                        </div>
                    </li>
                `;
            });
            usageHtml += '</ul></div>';
        }

        // Mostrar secciones inactivas
        if (inactiveSections.length > 0) {
            usageHtml += '<div class="alert alert-secondary p-2"><strong>Secciones inactivas:</strong><ul class="mb-0">';
            inactiveSections.forEach(section => {
                // Preparar la información de cursos relacionados
                let courseInfo = '';
                if (section.relatedCourses && section.relatedCourses.length > 0) {
                    if (section.relatedCourses.length === 1) {
                        courseInfo = `Curso: <strong>${section.relatedCourses[0].title}</strong>`;
                    } else {
                        courseInfo = `Cursos: <strong>${section.relatedCourses.map(c => c.title).join('</strong>, <strong>')}</strong>`;
                    }
                } else {
                    courseInfo = `Curso: ${section.courseName || 'No asignado'}`;
                }

                usageHtml += `
                    <li>
                        <div><strong>${section.title}</strong></div>
                        <div class="text-muted small">
                            <i class="fas fa-book me-1"></i> Tema: <strong>${section.topicTitle || 'Desconocido'}</strong><br>
                            <i class="fas fa-graduation-cap me-1"></i> ${courseInfo}
                        </div>
                    </li>
                `;
            });
            usageHtml += '</ul></div>';
        }

        usageHtml += '</div>';
    } else {
        usageHtml = '<div class="mt-4 alert alert-info">Esta actividad no está siendo utilizada en ninguna sección.</div>';
    }

    detailsContent.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${activity.title || 'Sin título'}</h5>
                ${detailsStatusBadge}
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <p><strong>ID:</strong> ${activity.id}</p>
                        <p><strong>Tipo:</strong> ${typeLabel}</p>
                        <p><strong>Creada:</strong> ${formatDate(activity.id)}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Descripción:</strong> ${activity.description || 'Sin descripción'}</p>
                    </div>
                </div>

                ${questionsHtml}
                ${usageHtml}

                <div class="mt-4">
                    <h6>Datos JSON:</h6>
                    <pre class="bg-light p-3 rounded" style="max-height: 200px; overflow: auto;">${JSON.stringify(activity, null, 2)}</pre>
                </div>
            </div>
        </div>
    `;

    // Mostrar el modal
    const detailsModal = new bootstrap.Modal(document.getElementById('activityDetailsModal'));
    detailsModal.show();
}

/**
 * Verifica si una actividad está en uso en alguna sección
 */
function isActivityInUse(activityId) {
    try {
        // Convertir activityId a string para comparaciones consistentes
        const activityIdStr = String(activityId);
        console.log(`Verificando si la actividad ${activityIdStr} está en uso...`);

        // Obtener los cursos activos del sitio
        const courses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
        const topics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');

        // Crear un mapa de temas activos (que pertenecen a cursos activos)
        const activeTopicIds = new Set();
        courses.forEach(course => {
            if (course.topicIds && Array.isArray(course.topicIds)) {
                course.topicIds.forEach(topicId => activeTopicIds.add(String(topicId)));
            }
        });

        console.log(`Encontrados ${activeTopicIds.size} temas activos en los cursos`);

        // Filtrar solo los temas activos
        const activeTopics = topics.filter(topic => activeTopicIds.has(String(topic.id)));
        console.log(`Analizando ${activeTopics.length} temas activos`);

        // Buscar en todas las secciones de los temas activos
        for (const topic of activeTopics) {
            if (topic.sections) {
                for (const section of topic.sections) {
                    // Verificar si la sección es de tipo actividad
                    if (section.type === 'activity') {
                        // Convertir el contenido a string para comparación consistente
                        const sectionContent = String(section.content);

                        // Normalizar IDs para comparación (con y sin prefijo 'activity_')
                        const normalizedSectionContent = sectionContent.replace('activity_', '');
                        const normalizedActivityId = activityIdStr.replace('activity_', '');

                        // Comparar con el ID de la actividad (considerando diferentes formatos)
                        if (sectionContent === activityIdStr ||
                            normalizedSectionContent === normalizedActivityId ||
                            sectionContent === `activity_${normalizedActivityId}` ||
                            `activity_${normalizedSectionContent}` === activityIdStr) {
                            console.log(`Actividad ${activityIdStr} encontrada en uso en sección "${section.title}" (ID: ${section.id}) del tema "${topic.title}"`);
                            return true;
                        }
                    }
                }
            }
        }

        // Como respaldo, verificar en todos los temas (incluso los no activos)
        for (const topic of topics) {
            if (!activeTopicIds.has(String(topic.id)) && topic.sections) {
                for (const section of topic.sections) {
                    if (section.type === 'activity') {
                        // Convertir el contenido a string para comparación consistente
                        const sectionContent = String(section.content);

                        // Normalizar IDs para comparación (con y sin prefijo 'activity_')
                        const normalizedSectionContent = sectionContent.replace('activity_', '');
                        const normalizedActivityId = activityIdStr.replace('activity_', '');

                        // Comparar con el ID de la actividad (considerando diferentes formatos)
                        if (sectionContent === activityIdStr ||
                            normalizedSectionContent === normalizedActivityId ||
                            sectionContent === `activity_${normalizedActivityId}` ||
                            `activity_${normalizedSectionContent}` === activityIdStr) {
                            console.log(`Actividad ${activityIdStr} encontrada en tema inactivo "${topic.title}"`);
                            return true;
                        }
                    }
                }
            }
        }

        console.log(`Actividad ${activityIdStr} no está en uso en ningún curso activo`);
        return false;
    } catch (error) {
        console.error('Error al verificar uso de actividad:', error);
        return false;
    }
}

/**
 * Encuentra las secciones que usan una actividad
 * @param {string|number} activityId - ID de la actividad a buscar
 * @returns {Array} - Lista de secciones que usan la actividad con información detallada
 */
function findSectionsUsingActivity(activityId) {
    const sectionsUsingActivity = [];

    try {
        // Convertir activityId a string para comparaciones consistentes
        const activityIdStr = String(activityId);
        console.log(`Buscando secciones que usan la actividad ${activityIdStr}...`);

        // Obtener los cursos activos del sitio
        const courses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
        const topics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');

        // Crear un mapa de temas activos (que pertenecen a cursos activos)
        const activeTopicIds = new Set();
        const courseMap = {};
        const topicMap = {};

        // Crear un mapa de temas por curso para facilitar la búsqueda
        const topicsByCourse = {};

        // Primero, crear mapas para búsqueda rápida
        courses.forEach(course => {
            // Guardar referencia al curso para uso posterior
            courseMap[course.id] = course;
            topicsByCourse[course.id] = [];

            if (course.topicIds && Array.isArray(course.topicIds)) {
                course.topicIds.forEach(topicId => {
                    activeTopicIds.add(String(topicId));
                    topicsByCourse[course.id].push(String(topicId));
                });
            }
        });

        // Crear mapa de temas
        topics.forEach(topic => {
            topicMap[topic.id] = topic;
        });

        console.log(`Encontrados ${activeTopicIds.size} temas activos en los cursos`);

        // Buscar en todas las secciones de todos los temas
        for (const topic of topics) {
            if (topic.sections) {
                for (const section of topic.sections) {
                    if (section.type === 'activity') {
                        // Convertir el contenido a string para comparación consistente
                        const sectionContent = String(section.content);

                        if (sectionContent === activityIdStr) {
                            // Determinar si el tema está activo
                            const isActive = activeTopicIds.has(String(topic.id));

                            // Encontrar a qué curso(s) pertenece este tema
                            const relatedCourses = [];

                            for (const courseId in topicsByCourse) {
                                if (topicsByCourse[courseId].includes(String(topic.id))) {
                                    const course = courseMap[courseId];
                                    if (course) {
                                        relatedCourses.push({
                                            id: courseId,
                                            title: course.title || `Curso ID: ${courseId}`
                                        });
                                    }
                                }
                            }

                            // Nombre del curso principal (para compatibilidad)
                            let courseName = 'No asignado a ningún curso';
                            if (relatedCourses.length > 0) {
                                courseName = relatedCourses[0].title;
                            }

                            console.log(`Encontrada sección "${section.title}" (ID: ${section.id}) en tema "${topic.title}" - ${isActive ? 'Activo' : 'Inactivo'}`);
                            if (relatedCourses.length > 0) {
                                console.log(`  Cursos relacionados: ${relatedCourses.map(c => c.title).join(', ')}`);
                            }

                            sectionsUsingActivity.push({
                                id: section.id,
                                title: section.title || 'Sin título',
                                topicId: topic.id,
                                topicTitle: topic.title || 'Tema sin título',
                                isActive: isActive,
                                courseName: courseName,
                                relatedCourses: relatedCourses
                            });
                        }
                    }
                }
            }
        }

        // Verificar también en el registro de actividades
        try {
            const activityRegistry = JSON.parse(localStorage.getItem('activity_registry') || '[]');
            const registryEntry = activityRegistry.find(entry => String(entry.id) === activityIdStr);

            if (registryEntry && registryEntry.usedInSections && registryEntry.usedInSections.length > 0) {
                console.log(`Encontradas ${registryEntry.usedInSections.length} secciones en el registro de actividades`);

                // Añadir secciones del registro que no estén ya en la lista
                registryEntry.usedInSections.forEach(regSection => {
                    // Verificar si ya existe en la lista
                    const exists = sectionsUsingActivity.some(s => s.id === regSection.id);
                    if (!exists) {
                        sectionsUsingActivity.push({
                            id: regSection.id,
                            title: regSection.title || 'Sin título',
                            topicId: regSection.topicId || 'Desconocido',
                            topicTitle: regSection.topicTitle || 'Tema desconocido'
                        });
                    }
                });
            }
        } catch (regError) {
            console.warn('Error al verificar en el registro de actividades:', regError);
        }

        console.log(`Se encontraron ${sectionsUsingActivity.length} secciones usando la actividad ${activityIdStr}`);
    } catch (error) {
        console.error('Error al buscar secciones que usan la actividad:', error);
    }

    return sectionsUsingActivity;
}

/**
 * Obtiene el icono para un tipo de actividad
 */
function getActivityTypeIcon(type) {
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

/**
 * Obtiene la etiqueta para un tipo de actividad
 */
function getActivityTypeLabel(type) {
    switch (type) {
        case 'multiple-choice':
            return 'Opción múltiple';
        case 'true-false':
            return 'Verdadero/Falso';
        case 'short-answer':
            return 'Respuesta corta';
        default:
            return 'Desconocido';
    }
}

/**
 * Carga la tabla directa de actividades desde localStorage
 */
function loadDirectActivitiesTable() {
    console.log('Cargando tabla directa de actividades desde localStorage...');
    const tableBody = document.getElementById('activitiesTableBody');

    // Mostrar mensaje de carga
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando actividades...</p>
            </td>
        </tr>
    `;

    // Recopilar todas las claves de actividades del localStorage
    const activityKeys = [];
    try {
        console.log('Buscando claves de actividades en localStorage...');
        console.log('Total de elementos en localStorage:', localStorage.length);

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('activity_') && !key.startsWith('activity_registry')) {
                console.log('Encontrada clave de actividad:', key);
                activityKeys.push(key);
            }
        }

        // Verificar si hay actividades perdidas
        if (typeof DataPersistence !== 'undefined' && typeof DataPersistence.recoverLostActivities === 'function') {
            console.log('Intentando recuperar actividades perdidas...');
            const recoveredActivities = DataPersistence.recoverLostActivities();
            if (recoveredActivities && recoveredActivities.length > 0) {
                console.log(`Se recuperaron ${recoveredActivities.length} actividades perdidas`);
                // Actualizar la lista de claves
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('activity_') && !key.startsWith('activity_registry') && !activityKeys.includes(key)) {
                        activityKeys.push(key);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error al buscar actividades en localStorage:', error);
    }

    console.log(`Se encontraron ${activityKeys.length} claves de actividades en localStorage`);

    if (activityKeys.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="alert alert-info mb-0">
                        <i class="fas fa-info-circle me-2"></i> No se encontraron actividades en localStorage.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar las claves por fecha (más reciente primero)
    activityKeys.sort((a, b) => {
        const idA = parseInt(a.replace('activity_', ''));
        const idB = parseInt(b.replace('activity_', ''));
        return idB - idA; // Orden descendente
    });

    // Obtener los cursos y temas activos para verificar uso
    const courses = JSON.parse(localStorage.getItem('matematicaweb_courses') || '[]');
    const topics = JSON.parse(localStorage.getItem('matematicaweb_topics') || '[]');

    // Crear un mapa de temas activos (que pertenecen a cursos activos)
    const activeTopicIds = new Set();
    courses.forEach(course => {
        if (course.topicIds && Array.isArray(course.topicIds)) {
            course.topicIds.forEach(topicId => activeTopicIds.add(String(topicId)));
        }
    });

    // Crear un mapa de actividades en uso con información de ubicación
    const usedActivityIds = new Set();
    const activityUsageInfo = {}; // Almacenará información sobre dónde se usa cada actividad

    // Crear un mapa de temas por curso para facilitar la búsqueda
    const topicsByCourse = {};
    courses.forEach(course => {
        if (course.topicIds && Array.isArray(course.topicIds)) {
            course.topicIds.forEach(topicId => {
                if (!topicsByCourse[topicId]) {
                    topicsByCourse[topicId] = [];
                }
                topicsByCourse[topicId].push({
                    id: course.id,
                    title: course.title || `Curso ID: ${course.id}`
                });
            });
        }
    });

    // Buscar en temas activos primero
    console.log('Temas activos IDs:', Array.from(activeTopicIds));
    const activeTopics = topics.filter(topic => activeTopicIds.has(String(topic.id)));
    console.log(`Encontrados ${activeTopics.length} temas activos de ${topics.length} temas totales`);

    activeTopics.forEach(topic => {
        if (topic.sections) {
            console.log(`Procesando tema activo: ${topic.title || 'Sin título'} (ID: ${topic.id}) con ${topic.sections.length} secciones`);
            topic.sections.forEach(section => {
                if (section.type === 'activity') {
                    const activityId = String(section.content);
                    const normalizedActivityId = activityId.replace('activity_', '');

                    console.log(`Encontrada actividad en uso: ${activityId} en sección ${section.title || 'Sin título'}`);

                    // Agregar todas las posibles formas del ID
                    usedActivityIds.add(activityId);
                    usedActivityIds.add(normalizedActivityId);
                    usedActivityIds.add(`activity_${normalizedActivityId}`);

                    // Guardar información sobre dónde se usa esta actividad
                    // Guardar la información con todas las posibles formas del ID
                    if (!activityUsageInfo[activityId]) {
                        activityUsageInfo[activityId] = [];
                    }

                    // También guardar la información con el ID normalizado
                    if (!activityUsageInfo[normalizedActivityId]) {
                        activityUsageInfo[normalizedActivityId] = activityUsageInfo[activityId];
                    }

                    // Y con el prefijo activity_
                    const prefixedId = `activity_${normalizedActivityId}`;
                    if (!activityUsageInfo[prefixedId]) {
                        activityUsageInfo[prefixedId] = activityUsageInfo[activityId];
                    }

                    // Encontrar cursos relacionados con este tema
                    const relatedCourses = topicsByCourse[topic.id] || [];

                    activityUsageInfo[activityId].push({
                        sectionId: section.id,
                        sectionTitle: section.title || 'Sin título',
                        topicId: topic.id,
                        topicTitle: topic.title || 'Tema sin título',
                        isActive: true,
                        relatedCourses: relatedCourses
                    });
                }
            });
        }
    });

    // Como respaldo, verificar también en temas inactivos
    topics.forEach(topic => {
        if (!activeTopicIds.has(String(topic.id)) && topic.sections) {
            console.log(`Procesando tema inactivo: ${topic.title || 'Sin título'} (ID: ${topic.id}) con ${topic.sections.length} secciones`);
            topic.sections.forEach(section => {
                if (section.type === 'activity') {
                    const activityId = String(section.content);
                    const normalizedActivityId = activityId.replace('activity_', '');

                    console.log(`Encontrada actividad en tema inactivo: ${activityId} en sección ${section.title || 'Sin título'}`);

                    // Agregar todas las posibles formas del ID
                    usedActivityIds.add(activityId);
                    usedActivityIds.add(normalizedActivityId);
                    usedActivityIds.add(`activity_${normalizedActivityId}`);

                    // Guardar información sobre dónde se usa esta actividad
                    // Guardar la información con todas las posibles formas del ID
                    if (!activityUsageInfo[activityId]) {
                        activityUsageInfo[activityId] = [];
                    }

                    // También guardar la información con el ID normalizado
                    if (!activityUsageInfo[normalizedActivityId]) {
                        activityUsageInfo[normalizedActivityId] = activityUsageInfo[activityId];
                    }

                    // Y con el prefijo activity_
                    const prefixedId = `activity_${normalizedActivityId}`;
                    if (!activityUsageInfo[prefixedId]) {
                        activityUsageInfo[prefixedId] = activityUsageInfo[activityId];
                    }

                    // Encontrar cursos relacionados con este tema (probablemente ninguno si es inactivo)
                    const relatedCourses = topicsByCourse[topic.id] || [];

                    activityUsageInfo[activityId].push({
                        sectionId: section.id,
                        sectionTitle: section.title || 'Sin título',
                        topicId: topic.id,
                        topicTitle: topic.title || 'Tema sin título',
                        isActive: false,
                        relatedCourses: relatedCourses
                    });
                }
            });
        }
    });

    console.log(`Se encontraron ${usedActivityIds.size} actividades en uso`);
    console.log('IDs de actividades en uso:', Array.from(usedActivityIds));

    // Generar filas de la tabla
    let tableRows = '';

    // Procesar las actividades
    const activities = [];
    const processedInUseIds = new Set(); // Para evitar duplicados de actividades en uso

    // Procesar todas las actividades
    for (const key of activityKeys) {
        try {
            const activityData = localStorage.getItem(key);
            if (activityData) {
                try {
                    const activity = JSON.parse(activityData);
                    if (activity && activity.id) {
                        // Convertir ID a string para comparación consistente
                        const activityIdStr = String(activity.id);

                        // Verificar si la actividad está en uso
                        const isInUse = usedActivityIds.has(activityIdStr);

                        // Si está en uso y ya procesamos una con este ID, omitirla
                        if (isInUse && processedInUseIds.has(activityIdStr)) {
                            console.log(`Omitiendo actividad duplicada EN USO con ID ${activityIdStr} (clave: ${key})`);
                            continue;
                        }

                        // Agregar la clave de localStorage como propiedad para mostrarla
                        activity.storageKey = key;
                        console.log(`Procesando actividad ${activity.id}: ${activity.title || 'Sin título'} (clave: ${key})`);
                        activities.push(activity);

                        // Si está en uso, marcarla como procesada para evitar duplicados
                        if (isInUse) {
                            processedInUseIds.add(activityIdStr);
                        }
                    } else {
                        console.warn(`Actividad inválida en ${key}:`, activity);
                        // Agregar incluso actividades inválidas para que puedan ser eliminadas
                        activities.push({
                            id: key.replace('activity_', ''),
                            title: 'Actividad inválida',
                            type: 'unknown',
                            storageKey: key,
                            isInvalid: true
                        });
                    }
                } catch (parseError) {
                    console.error(`Error al parsear JSON de actividad ${key}:`, parseError);
                    // Agregar actividades con errores para que puedan ser eliminadas
                    activities.push({
                        id: key.replace('activity_', ''),
                        title: 'Error: ' + parseError.message,
                        type: 'unknown',
                        storageKey: key,
                        isInvalid: true
                    });
                }
            } else {
                console.warn(`Clave de actividad ${key} existe pero no tiene datos`);
                // Agregar actividades sin datos para que puedan ser eliminadas
                activities.push({
                    id: key.replace('activity_', ''),
                    title: 'Sin datos',
                    type: 'unknown',
                    storageKey: key,
                    isInvalid: true
                });
            }
        } catch (error) {
            console.error(`Error al procesar actividad ${key}:`, error);
        }
    }

    console.log(`Se procesaron ${activities.length} actividades de ${activityKeys.length} claves`);

    // Generar filas de la tabla
    activities.forEach(activityData => {
        try {
            const activityId = activityData.id;
            // Convertir a string para comparación consistente
            const activityIdStr = String(activityId);
            const normalizedActivityId = activityIdStr.replace('activity_', '');

            console.log(`Verificando si actividad ${activityIdStr} está en uso...`);

            // Verificar todas las posibles formas del ID
            const isInUse = usedActivityIds.has(activityIdStr) ||
                           usedActivityIds.has(normalizedActivityId) ||
                           usedActivityIds.has(`activity_${normalizedActivityId}`);

            console.log(`Actividad ${activityIdStr}: ${isInUse ? 'EN USO' : 'Sin usar'}`);

            // Verificar si hay información de uso para esta actividad
            if (isInUse) {
                console.log(`Información de uso para ${activityIdStr}:`, activityUsageInfo[activityIdStr]);
            }

            // Determinar el tipo de actividad
            let typeLabel = 'Desconocido';
            let typeIcon = 'fas fa-question-circle';

            if (activityData.type) {
                switch (activityData.type) {
                    case 'multiple-choice':
                        typeLabel = 'Opción múltiple';
                        typeIcon = 'fas fa-list-ol';
                        break;
                    case 'true-false':
                        typeLabel = 'Verdadero/Falso';
                        typeIcon = 'fas fa-check-circle';
                        break;
                    case 'short-answer':
                        typeLabel = 'Respuesta corta';
                        typeIcon = 'fas fa-pencil-alt';
                        break;
                }
            }

            // Determinar el estado y obtener información de uso
            let usageInfo = '';
            let statusBadge = '<span class="badge bg-secondary">Sin usar</span>';

            console.log(`Determinando estado para actividad ${activityIdStr}: isInUse=${isInUse}, tiene info=${Boolean(activityUsageInfo[activityIdStr])}`);

            // Simplificar la condición: si está en uso, mostrar como "En uso"
            if (isInUse) {
                // Establecer el estado como "En uso" inmediatamente
                statusBadge = `<span class="badge bg-success">En uso</span>`;

                // Si además tenemos información detallada, mostrarla
                if (activityUsageInfo[activityIdStr]) {
                    const usageData = activityUsageInfo[activityIdStr];
                    const activeUsages = usageData.filter(u => u.isActive);
                    console.log(`Actividad ${activityIdStr}: ${usageData.length} usos totales, ${activeUsages.length} usos activos`);

                    if (activeUsages.length > 0) {
                        // Recopilar información de cursos y temas
                        const uniqueTopics = new Set();
                        const uniqueCourses = new Set();

                        activeUsages.forEach(usage => {
                            uniqueTopics.add(usage.topicTitle);
                            usage.relatedCourses.forEach(course => {
                                uniqueCourses.add(course.title);
                            });
                        });

                        // Crear insignia con información
                        const topicsCount = uniqueTopics.size;
                        const coursesCount = uniqueCourses.size;

                        // El statusBadge ya se estableció arriba

                        if (coursesCount > 0 && topicsCount > 0) {
                            usageInfo = `
                                <div class="small mt-1">
                                    <span class="badge bg-info text-dark" title="${Array.from(uniqueCourses).join(', ')}">
                                        <i class="fas fa-graduation-cap me-1"></i> ${coursesCount} curso${coursesCount !== 1 ? 's' : ''}
                                    </span>
                                    <span class="badge bg-info text-dark ms-1" title="${Array.from(uniqueTopics).join(', ')}">
                                        <i class="fas fa-book me-1"></i> ${topicsCount} tema${topicsCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            `;
                        }
                    }
                }
            }

            // Registrar el estado final
            console.log(`Estado final de actividad ${activityIdStr}: ${isInUse ? 'EN USO' : 'Sin usar'}, Badge: ${statusBadge}`);

            // Generar fila
            // Usar la clave de almacenamiento real si está disponible, o generarla si no
            const storageKey = activityData.storageKey || `activity_${activityId}`;

            // Determinar si es una posible duplicación (mismo ID pero diferente clave)
            const isDuplicate = storageKey !== `activity_${activityId}` && !storageKey.includes(`activity_data_`);

            // Determinar la clase CSS para la fila
            let rowClass = '';
            if (isInUse) {
                rowClass = 'table-success'; // Verde para actividades en uso
            } else if (isDuplicate) {
                rowClass = 'table-warning'; // Amarillo para posibles duplicados
            } else if (activityData.isInvalid) {
                rowClass = 'table-danger'; // Rojo para actividades inválidas
            }

            tableRows += `
                <tr data-key="${storageKey}" data-id="${activityId}" class="${rowClass}">
                    <td>
                        <input type="checkbox" class="form-check-input table-checkbox"
                               ${isInUse ? 'disabled title="No se puede eliminar una actividad en uso"' : ''}>
                    </td>
                    <td><code>${storageKey}</code></td>
                    <td>${activityId}</td>
                    <td>${activityData.title ? activityData.title : '<em>Sin título</em>'}</td>
                    <td><i class="${typeIcon} me-1"></i> ${typeLabel}</td>
                    <td>
                        ${statusBadge}
                        ${usageInfo}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info view-details-btn" data-id="${activityId}">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!isInUse ? `
                            <button class="btn btn-sm btn-danger delete-activity-btn" data-key="${storageKey}">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        } catch (error) {
            console.error(`Error al procesar actividad ${activityData.id}:`, error);
            const errorKey = `activity_${activityData.id}`;
            tableRows += `
                <tr data-key="${errorKey}" class="table-danger">
                    <td><input type="checkbox" class="form-check-input table-checkbox"></td>
                    <td><code>${errorKey}</code></td>
                    <td colspan="4"><em class="text-danger">Error al cargar datos: ${error.message}</em></td>
                    <td>
                        <button class="btn btn-sm btn-danger delete-activity-btn" data-key="${errorKey}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }
    });

    tableBody.innerHTML = tableRows;

    // Añadir eventos a los botones
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const activityId = this.dataset.id;
            showActivityDetails(activityId);
        });
    });

    document.querySelectorAll('.delete-activity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const key = this.dataset.key;
            deleteActivityDirectly(key);
        });
    });

    document.querySelectorAll('.table-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedCount();
        });
    });
}

/**
 * Actualiza la tabla de actividades
 */
function refreshActivitiesTable() {
    console.log('Actualizando tabla de actividades...');

    // Limpiar selecciones actuales
    selectedActivities.clear();
    updateSelectedCount();

    // Mostrar mensaje de carga
    const tableBody = document.getElementById('activitiesTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Actualizando...</span>
                </div>
                <p class="mt-2">Actualizando actividades...</p>
            </td>
        </tr>
    `;

    // Recargar las actividades
    setTimeout(() => {
        loadDirectActivitiesTable();

        // Mostrar mensaje de éxito
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Tabla de actividades actualizada correctamente.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        document.querySelector('.container').insertAdjacentHTML('afterbegin', alertHtml);
    }, 500);
}

/**
 * Selecciona o deselecciona todas las filas de la tabla
 */
function toggleSelectAllTableRows() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const isChecked = selectAllCheckbox.checked;

    document.querySelectorAll('.table-checkbox:not([disabled])').forEach(checkbox => {
        checkbox.checked = isChecked;
    });

    updateSelectedCount();
}

/**
 * Elimina una actividad directamente por su clave
 */
function deleteActivityDirectly(key) {
    if (!confirm(`¿Está seguro de que desea eliminar la actividad ${key}?`)) {
        return;
    }

    try {
        // Eliminar la actividad de localStorage
        localStorage.removeItem(key);

        // También eliminar datos relacionados si existen
        const activityId = key.replace('activity_', '');
        localStorage.removeItem(`activity_data_${activityId}`);

        // Mostrar mensaje de éxito
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Se eliminó correctamente la actividad ${key}.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        document.querySelector('.container').insertAdjacentHTML('afterbegin', alertHtml);

        // Recargar la tabla
        refreshActivitiesTable(); // Usar la nueva función para actualizar la tabla
    } catch (error) {
        console.error(`Error al eliminar actividad ${key}:`, error);

        // Mostrar mensaje de error
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                Error al eliminar la actividad ${key}: ${error.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        document.querySelector('.container').insertAdjacentHTML('afterbegin', alertHtml);
    }
}

/**
 * Formatea una fecha a partir de un timestamp
 */
function formatDate(timestamp) {
    try {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Fecha desconocida';
    }
}

/**
 * Actualiza el data persistence con las actividades en localStorage
 */
function updateDataPersistence() {
    console.log('Actualizando data persistence con actividades en localStorage...');

    // Mostrar un indicador de carga
    const btn = document.getElementById('updateDataPersistenceBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
    btn.disabled = true;

    // Verificar si DataPersistence está disponible
    if (typeof DataPersistence === 'undefined') {
        console.error('Error: DataPersistence no está disponible');
        alert('Error: DataPersistence no está disponible. Asegúrese de que data-persistence.js está cargado.');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }

    // Llamar a la función de actualización
    try {
        const result = DataPersistence.updateActivitiesData();

        // Mostrar resultados
        console.log('Resultado de la actualización:', result);

        // Mostrar un mensaje al usuario
        const message = `
            <strong>Actualización completada:</strong><br>
            - Total de actividades: ${result.totalActivities}<br>
            - Secciones de tipo actividad: ${result.totalSections}<br>
            - Actividades encontradas: ${result.activitiesFound}<br>
            - Secciones actualizadas: ${result.sectionsUpdated}
        `;

        // Mostrar un toast o alerta
        showToast('Actualización completada', message, 'success');

        // Actualizar la tabla
        refreshActivitiesTable();
    } catch (error) {
        console.error('Error al actualizar data persistence:', error);
        alert('Error al actualizar data persistence: ' + error.message);
    } finally {
        // Restaurar el botón
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

/**
 * Muestra un toast (notificación)
 * @param {string} title - Título del toast
 * @param {string} message - Mensaje del toast
 * @param {string} type - Tipo de toast (success, error, warning, info)
 */
function showToast(title, message, type = 'info') {
    // Crear el toast
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    // Verificar si existe el contenedor de toasts
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Agregar el toast al contenedor
    toastContainer.innerHTML += toastHtml;

    // Inicializar y mostrar el toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Eliminar el toast cuando se oculte
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

/**
 * Activa o desactiva el modo silencioso
 */
function toggleSilentMode() {
    // Obtener el estado actual
    const currentState = localStorage.getItem('silent_mode') === 'true';

    // Cambiar al estado opuesto
    const newState = !currentState;
    localStorage.setItem('silent_mode', newState);

    // Actualizar la interfaz
    updateSilentModeStatus();

    // Mostrar mensaje
    const message = newState ?
        'Modo silencioso activado. Se reducirán los mensajes en la consola.' :
        'Modo silencioso desactivado. Se mostrarán todos los mensajes en la consola.';

    showToast('Modo Silencioso', message, newState ? 'success' : 'info');
}

/**
 * Actualiza el estado visual del botón de modo silencioso
 */
function updateSilentModeStatus() {
    const isSilent = localStorage.getItem('silent_mode') === 'true';
    const statusElement = document.getElementById('silentModeStatus');
    const button = document.getElementById('toggleSilentModeBtn');

    if (statusElement) {
        statusElement.textContent = isSilent ? 'On' : 'Off';
    }

    if (button) {
        if (isSilent) {
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-secondary');
        } else {
            button.classList.remove('btn-secondary');
            button.classList.add('btn-outline-secondary');
        }
    }
}
