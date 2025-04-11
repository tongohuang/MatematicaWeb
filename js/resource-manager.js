/**
 * Administrador de Recursos
 *
 * Este archivo contiene la lógica para gestionar los recursos (HTML, PDF, imágenes)
 * utilizados en las secciones del sitio.
 *
 * Índice de funciones:
 * 1. initResourceManager - Inicializa el administrador de recursos
 * 2. loadResources - Carga la lista de recursos desde las carpetas
 * 3. displayResources - Muestra los recursos en la interfaz
 * 4. filterResources - Filtra los recursos según los criterios seleccionados
 * 5. checkResourceUsage - Verifica si un recurso está siendo utilizado
 * 6. previewResource - Muestra una vista previa del recurso
 * 7. deleteResource - Elimina un recurso
 * 8. exportResourceList - Exporta la lista de recursos
 * 9. getResourceTypeIcon - Obtiene el icono correspondiente al tipo de recurso
 * 10. getResourcesInUse - Obtiene la lista de recursos en uso
 * 11. updateResourceStats - Actualiza las estadísticas de recursos
 */

// Variables globales
let allResources = [];
let resourcesInUse = [];

// Objeto global para acceder a las funciones desde otros scripts
window.ResourceManager = {
    /**
     * Obtiene la lista de recursos de un tipo específico
     * @param {string} type - Tipo de recurso (html, pdf, image)
     * @returns {Promise<Array>} - Promesa que se resuelve con la lista de nombres de recursos
     */
    getResourceList: async function(type) {
        console.log(`ResourceManager.getResourceList(${type}) llamado`);
        return await getResourcesByType(type);
    }
};

/**
 * Inicializa el administrador de recursos
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando administrador de recursos...');

    // Verificar si estamos en la página de administración de recursos
    const isResourceManagerPage = window.location.pathname.includes('resource-manager.html');

    if (isResourceManagerPage) {
        console.log('Estamos en la página de administración de recursos');

        // Cargar recursos
        loadResources();

        // Configurar eventos de filtrado
        const resourceTypeElement = document.getElementById('resourceType');
        const searchResourceElement = document.getElementById('searchResource');
        const showUsedElement = document.getElementById('showUsed');
        const showUnusedElement = document.getElementById('showUnused');

        if (resourceTypeElement) resourceTypeElement.addEventListener('change', filterResources);
        if (searchResourceElement) searchResourceElement.addEventListener('input', filterResources);
        if (showUsedElement) showUsedElement.addEventListener('change', filterResources);
        if (showUnusedElement) showUnusedElement.addEventListener('change', filterResources);

        // Configurar evento de actualización
        const refreshResourceListElement = document.getElementById('refreshResourceList');
        if (refreshResourceListElement) refreshResourceListElement.addEventListener('click', loadResources);

        // Configurar evento de exportación
        const exportResourceListElement = document.getElementById('exportResourceList');
        if (exportResourceListElement) exportResourceListElement.addEventListener('click', exportResourceList);

        // Configurar evento de actualización de índices
        const updateResourceIndexesElement = document.getElementById('updateResourceIndexes');
        if (updateResourceIndexesElement) {
            updateResourceIndexesElement.addEventListener('click', function() {
                updateResourceIndexes().then(() => {
                    // Recargar recursos después de actualizar los índices
                    loadResources();
                });
            });
        }
    } else {
        console.log('No estamos en la página de administración de recursos, omitiendo inicialización');
    }
});

/**
 * Carga la lista de recursos desde las carpetas
 */
function loadResources() {
    console.log('Cargando recursos...');

    // Verificar si estamos en la página de administración de recursos
    const resourceListElement = document.getElementById('resourceList');
    if (!resourceListElement) {
        console.log('No se encontró el elemento resourceList, omitiendo carga de recursos');
        return;
    }

    // Mostrar indicador de carga
    resourceListElement.innerHTML = `
        <div class="text-center py-5 col-12">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando recursos...</p>
        </div>
    `;

    // Definir los tipos de recursos permitidos
    const allowedResourceTypes = ['html', 'pdf', 'image'];

    // Obtener recursos de cada tipo usando Promise.all
    Promise.all(
        // Mapear cada tipo a una promesa que obtiene los recursos
        allowedResourceTypes.map(type => getResourcesFromFolder(type))
    )
    .then(([htmlResources, pdfResources, imageResources]) => {
        console.log('Recursos obtenidos:', {
            html: htmlResources.length,
            pdf: pdfResources.length,
            image: imageResources.length
        });

        // Combinar todos los recursos
        allResources = [...htmlResources, ...pdfResources, ...imageResources];

        // Obtener recursos en uso
        resourcesInUse = getResourcesInUse();

        // Marcar recursos en uso
        allResources.forEach(resource => {
            resource.inUse = resourcesInUse.some(r =>
                r.type === resource.type && r.name === resource.name
            );
        });

        // Mostrar recursos
        displayResources(allResources);

        // Actualizar estadísticas
        updateResourceStats(allResources);

        console.log('Recursos cargados:', allResources);
    })
    .catch(error => {
        console.error('Error al cargar recursos:', error);

        // Mostrar mensaje de error
        document.getElementById('resourceList').innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <p>Error al cargar los recursos. Por favor, intente nuevamente.</p>
                <button id="retryLoadResources" class="btn btn-primary mt-3">
                    <i class="fas fa-sync-alt me-2"></i> Reintentar
                </button>
            </div>
        `;

        // Añadir evento para reintentar
        document.getElementById('retryLoadResources').addEventListener('click', loadResources);
    });
}

/**
 * Obtiene los recursos de una carpeta específica
 * @param {string} type - Tipo de recurso (html, pdf, image)
 * @returns {Array} - Lista de recursos
 */
function getResourcesFromFolder(type) {
    console.log(`Obteniendo recursos de tipo: ${type}`);

    // Validar que el tipo sea uno de los permitidos
    if (!['html', 'pdf', 'image'].includes(type)) {
        console.error(`Tipo de recurso no válido: ${type}`);
        return Promise.resolve([]);
    }

    // Determinar la ruta del archivo de índice según el tipo
    // Usar rutas absolutas para evitar confusiones
    let indexPath;
    let folderPath;

    // Rutas específicas para las carpetas de activities
    if (type === 'html') {
        indexPath = '../activities/html/index.json';
        folderPath = '../activities/html/';
    } else if (type === 'pdf') {
        indexPath = '../activities/pdf/index.json';
        folderPath = '../activities/pdf/';
    } else if (type === 'image') {
        indexPath = '../activities/images/index.json';
        folderPath = '../activities/images/';
    }

    // Array para almacenar los recursos
    let resources = [];

    // Intentar cargar el archivo de índice
    try {
        // Usar fetch para cargar el archivo de índice
        return fetch(indexPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo de índice: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Índice cargado para ${type}:`, data);

                // Verificar si el archivo tiene la estructura esperada
                if (!data.files || !Array.isArray(data.files)) {
                    console.error(`Estructura de índice inválida para ${type}`);
                    return [];
                }

                // Convertir los datos del índice en objetos de recursos
                resources = data.files
                    // Filtrar para asegurarnos de que solo se incluyan archivos válidos
                    .filter(file => {
                        // Verificar que el archivo tenga un nombre válido
                        if (!file.name || typeof file.name !== 'string') {
                            console.warn(`Archivo sin nombre válido en ${folderPath}`);
                            return false;
                        }

                        // Verificar extensiones según el tipo
                        if (type === 'html' && !file.name.toLowerCase().endsWith('.html')) {
                            console.warn(`Archivo no HTML en carpeta HTML: ${file.name}`);
                            return false;
                        } else if (type === 'pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                            console.warn(`Archivo no PDF en carpeta PDF: ${file.name}`);
                            return false;
                        } else if (type === 'image' && ![
                            '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'
                        ].some(ext => file.name.toLowerCase().endsWith(ext))) {
                            console.warn(`Archivo no imagen en carpeta de imágenes: ${file.name}`);
                            return false;
                        }

                        return true;
                    })
                    // Mapear a objetos de recursos
                    .map(file => {
                        // Formatear el tamaño
                        const sizeInKB = Math.round(file.size / 1024);
                        const formattedSize = `${sizeInKB} KB`;

                        // Formatear la fecha
                        const lastModified = new Date(file.lastModified).toISOString().split('T')[0];

                        return {
                            name: file.name,
                            type: type,
                            path: `${folderPath}${file.name}`,
                            size: formattedSize,
                            lastModified: lastModified,
                            // Añadir la carpeta específica para facilitar la identificación
                            folder: folderPath.replace('../', '')
                        };
                    });

                console.log(`Se encontraron ${resources.length} recursos de tipo ${type}`);
                return resources;
            })
            .catch(error => {
                console.error(`Error al procesar el índice para ${type}:`, error);

                // Si hay un error, intentar obtener los recursos desde DataManager como respaldo
                console.log(`Intentando obtener recursos desde DataManager para ${type}...`);
                const resourceNames = DataManager.getResourcesByType(type);

                // Crear objetos de recursos con información simulada
                resources = resourceNames
                    // Filtrar para asegurarnos de que solo se incluyan archivos válidos
                    .filter(name => {
                        // Verificar que el nombre sea válido
                        if (!name || typeof name !== 'string') {
                            return false;
                        }

                        // Verificar extensiones según el tipo
                        if (type === 'html' && !name.toLowerCase().endsWith('.html')) {
                            return false;
                        } else if (type === 'pdf' && !name.toLowerCase().endsWith('.pdf')) {
                            return false;
                        } else if (type === 'image' && ![
                            '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'
                        ].some(ext => name.toLowerCase().endsWith(ext))) {
                            return false;
                        }

                        return true;
                    })
                    // Mapear a objetos de recursos
                    .map(name => {
                        // Simular tamaño y fecha de modificación
                        const size = Math.floor(Math.random() * 300) + 10 + ' KB';
                        const lastModified = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0];

                        return {
                            name,
                            type,
                            path: `${folderPath}${name}`,
                            size,
                            lastModified,
                            // Añadir la carpeta específica para facilitar la identificación
                            folder: folderPath.replace('../', '')
                        };
                    });

                console.log(`Se obtuvieron ${resources.length} recursos desde DataManager para ${type}`);
                return resources;
            });
    } catch (error) {
        console.error(`Error al cargar el índice para ${type}:`, error);

        // Si hay un error, intentar obtener los recursos desde DataManager como respaldo
        console.log(`Intentando obtener recursos desde DataManager para ${type}...`);
        const resourceNames = DataManager.getResourcesByType(type);

        // Crear objetos de recursos con información simulada
        resources = resourceNames
            // Filtrar para asegurarnos de que solo se incluyan archivos válidos
            .filter(name => {
                // Verificar que el nombre sea válido
                if (!name || typeof name !== 'string') {
                    return false;
                }

                // Verificar extensiones según el tipo
                if (type === 'html' && !name.toLowerCase().endsWith('.html')) {
                    return false;
                } else if (type === 'pdf' && !name.toLowerCase().endsWith('.pdf')) {
                    return false;
                } else if (type === 'image' && ![
                    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'
                ].some(ext => name.toLowerCase().endsWith(ext))) {
                    return false;
                }

                return true;
            })
            // Mapear a objetos de recursos
            .map(name => {
                // Simular tamaño y fecha de modificación
                const size = Math.floor(Math.random() * 300) + 10 + ' KB';
                const lastModified = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0];

                return {
                    name,
                    type,
                    path: `${folderPath}${name}`,
                    size,
                    lastModified,
                    // Añadir la carpeta específica para facilitar la identificación
                    folder: folderPath.replace('../', '')
                };
            });

        console.log(`Se obtuvieron ${resources.length} recursos desde DataManager para ${type}`);
        return Promise.resolve(resources);
    }
}

/**
 * Obtiene la lista de recursos en uso
 * @returns {Array} - Lista de recursos en uso
 */
function getResourcesInUse() {
    // Obtener los recursos en uso desde DataManager
    return DataManager.getUsedResources();
}

/**
 * Muestra los recursos en la interfaz
 * @param {Array} resources - Lista de recursos a mostrar
 */
function displayResources(resources) {
    const resourceList = document.getElementById('resourceList');

    // Verificar si el elemento existe
    if (!resourceList) {
        console.log('No se encontró el elemento resourceList, omitiendo visualización de recursos');
        return;
    }

    if (resources.length === 0) {
        resourceList.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p>No se encontraron recursos que coincidan con los filtros.</p>
            </div>
        `;
        return;
    }

    let html = '';

    resources.forEach(resource => {
        const icon = getResourceTypeIcon(resource.type);
        const usageClass = resource.inUse ? 'border-success' : '';
        const usageBadge = resource.inUse ?
            '<span class="badge bg-success">En uso</span>' :
            '<span class="badge bg-secondary">Sin usar</span>';

        html += `
            <div class="col-md-4 col-sm-6 resource-card" data-resource-type="${resource.type}" data-resource-name="${resource.name}" data-resource-folder="${resource.folder || ''}">
                <div class="card ${usageClass}">
                    <div class="card-body">
                        <div class="resource-preview">
                            ${icon}
                        </div>
                        <h5 class="resource-name mt-2" title="${resource.name}">${resource.name}</h5>
                        <div class="resource-details">
                            <div class="small text-muted">${resource.folder || ''}</div>
                            <div>${resource.size} | ${resource.lastModified}</div>
                            <div class="mt-1">${usageBadge}</div>
                        </div>
                        <div class="resource-actions">
                            <button class="btn btn-sm btn-outline-primary preview-resource" data-resource-path="${resource.path}" data-resource-type="${resource.type}" data-resource-name="${resource.name}">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-resource" data-resource-path="${resource.path}" data-resource-type="${resource.type}" data-resource-name="${resource.name}" data-resource-in-use="${resource.inUse}">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    resourceList.innerHTML = html;

    // Configurar eventos para los botones de vista previa
    document.querySelectorAll('.preview-resource').forEach(button => {
        button.addEventListener('click', function() {
            const path = this.getAttribute('data-resource-path');
            const type = this.getAttribute('data-resource-type');
            const name = this.getAttribute('data-resource-name');
            previewResource(path, type, name);
        });
    });

    // Configurar eventos para los botones de eliminación
    document.querySelectorAll('.delete-resource').forEach(button => {
        button.addEventListener('click', function() {
            const path = this.getAttribute('data-resource-path');
            const type = this.getAttribute('data-resource-type');
            const name = this.getAttribute('data-resource-name');
            const inUse = this.getAttribute('data-resource-in-use') === 'true';
            showDeleteConfirmation(path, type, name, inUse);
        });
    });
}

/**
 * Filtra los recursos según los criterios seleccionados
 */
function filterResources() {
    // Verificar si los elementos existen
    const resourceTypeElement = document.getElementById('resourceType');
    const searchResourceElement = document.getElementById('searchResource');
    const showUsedElement = document.getElementById('showUsed');
    const showUnusedElement = document.getElementById('showUnused');

    if (!resourceTypeElement || !searchResourceElement || !showUsedElement || !showUnusedElement) {
        console.log('No se encontraron los elementos de filtrado, omitiendo filtrado de recursos');
        return;
    }

    const typeFilter = resourceTypeElement.value;
    const searchFilter = searchResourceElement.value.toLowerCase();
    const showUsed = showUsedElement.checked;
    const showUnused = showUnusedElement.checked;

    // Definir los tipos de recursos permitidos
    const allowedResourceTypes = ['html', 'pdf', 'image'];

    // Definir las carpetas permitidas
    const allowedFolders = {
        'html': 'activities/html/',
        'pdf': 'activities/pdf/',
        'image': 'activities/images/'
    };

    let filteredResources = allResources.filter(resource => {
        // Verificar que el tipo de recurso sea uno de los permitidos
        if (!allowedResourceTypes.includes(resource.type)) {
            return false;
        }

        // Verificar que el recurso pertenezca a una de las carpetas permitidas
        const expectedFolder = allowedFolders[resource.type];
        if (!resource.folder || resource.folder !== expectedFolder) {
            return false;
        }

        // Filtrar por tipo
        if (typeFilter !== 'all' && resource.type !== typeFilter) {
            return false;
        }

        // Filtrar por búsqueda
        if (searchFilter && !resource.name.toLowerCase().includes(searchFilter)) {
            return false;
        }

        // Filtrar por estado de uso
        if (resource.inUse && !showUsed) {
            return false;
        }

        if (!resource.inUse && !showUnused) {
            return false;
        }

        return true;
    });

    // Mostrar recursos filtrados
    displayResources(filteredResources);

    // Actualizar estadísticas
    updateResourceStats(filteredResources, true);
}

/**
 * Muestra una vista previa del recurso
 * @param {string} path - Ruta del recurso
 * @param {string} type - Tipo de recurso
 * @param {string} name - Nombre del recurso
 */
function previewResource(path, type, name) {
    const modalElement = document.getElementById('resourcePreviewModal');
    const modalTitleElement = document.getElementById('resourcePreviewModalLabel');
    const modalContentElement = document.getElementById('resourcePreviewContent');
    const downloadLinkElement = document.getElementById('resourceDownloadLink');

    // Verificar si los elementos existen
    if (!modalElement || !modalTitleElement || !modalContentElement || !downloadLinkElement) {
        console.log('No se encontraron los elementos necesarios para la vista previa, omitiendo vista previa');
        return;
    }

    const modal = new bootstrap.Modal(modalElement);
    const modalTitle = modalTitleElement;
    const modalContent = modalContentElement;
    const downloadLink = downloadLinkElement;

    // Determinar la carpeta según el tipo
    let folderPath = '';
    if (type === 'html') {
        folderPath = 'activities/html/';
    } else if (type === 'pdf') {
        folderPath = 'activities/pdf/';
    } else if (type === 'image') {
        folderPath = 'activities/images/';
    }

    modalTitle.textContent = `Vista previa: ${folderPath}${name}`;
    downloadLink.href = path;
    downloadLink.download = name;

    // Limpiar contenido anterior
    modalContent.innerHTML = '';

    // Mostrar vista previa según el tipo de recurso
    if (type === 'image') {
        modalContent.innerHTML = `
            <div class="text-center">
                <img src="${path}" alt="${name}" class="img-fluid">
            </div>
        `;
    } else if (type === 'pdf') {
        modalContent.innerHTML = `
            <div class="ratio ratio-16x9">
                <iframe src="${path}" title="${name}" allowfullscreen></iframe>
            </div>
        `;
    } else if (type === 'html') {
        modalContent.innerHTML = `
            <div class="ratio ratio-16x9">
                <iframe src="${path}" title="${name}" allowfullscreen></iframe>
            </div>
        `;
    }

    // Mostrar modal
    modal.show();
}

/**
 * Muestra el modal de confirmación para eliminar un recurso
 * @param {string} path - Ruta del recurso
 * @param {string} type - Tipo de recurso
 * @param {string} name - Nombre del recurso
 * @param {boolean} inUse - Indica si el recurso está en uso
 */
function showDeleteConfirmation(path, type, name, inUse) {
    const modalElement = document.getElementById('deleteResourceModal');
    const modalTitleElement = document.getElementById('deleteResourceModalLabel');
    const warningElement = document.getElementById('resourceUsageWarning');
    const confirmButtonElement = document.getElementById('confirmDeleteResource');

    // Verificar si los elementos existen
    if (!modalElement || !modalTitleElement || !warningElement || !confirmButtonElement) {
        console.log('No se encontraron los elementos necesarios para la confirmación de eliminación, omitiendo confirmación');
        return;
    }

    const modal = new bootstrap.Modal(modalElement);
    const modalTitle = modalTitleElement;
    const confirmButton = confirmButtonElement;

    modalTitle.textContent = `Eliminar: ${name}`;

    // Mostrar advertencia si el recurso está en uso
    if (inUse) {
        warningElement.classList.remove('d-none');
    } else {
        warningElement.classList.add('d-none');
    }

    // Configurar evento para el botón de confirmación
    confirmButton.onclick = function() {
        deleteResource(path, type, name);
        modal.hide();
    };

    // Mostrar modal
    modal.show();
}

/**
 * Elimina un recurso
 * @param {string} path - Ruta del recurso
 * @param {string} type - Tipo de recurso
 * @param {string} name - Nombre del recurso
 */
function deleteResource(path, type, name) {
    console.log(`Eliminando recurso: ${name} (${type})`);

    // En una implementación real, esto se haría mediante una API que elimine el archivo del servidor
    // Para esta simulación, simplemente eliminamos el recurso de la lista

    // Eliminar de la lista de recursos
    allResources = allResources.filter(resource =>
        !(resource.type === type && resource.name === name)
    );

    // Actualizar la vista
    filterResources();

    // Mostrar notificación
    alert(`Recurso ${name} eliminado correctamente.`);
}

/**
 * Exporta la lista de recursos
 */
function exportResourceList() {
    console.log('Exportando lista de recursos...');

    // Verificar si hay recursos para exportar
    if (!allResources || allResources.length === 0) {
        console.log('No hay recursos para exportar');
        alert('No hay recursos para exportar');
        return;
    }

    // Crear objeto para exportar
    const exportData = {
        resources: allResources,
        resourcesInUse: resourcesInUse || [],
        exportDate: new Date().toISOString()
    };

    // Convertir a JSON
    const jsonData = JSON.stringify(exportData, null, 2);

    // Crear blob y enlace de descarga
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Crear enlace de descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = `recursos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    // Liberar URL
    URL.revokeObjectURL(url);
}

/**
 * Obtiene el icono correspondiente al tipo de recurso
 * @param {string} type - Tipo de recurso
 * @returns {string} - HTML del icono
 */
function getResourceTypeIcon(type) {
    if (type === 'html') {
        return '<i class="fas fa-code fa-3x"></i>';
    } else if (type === 'pdf') {
        return '<i class="fas fa-file-pdf fa-3x"></i>';
    } else if (type === 'image') {
        return '<i class="fas fa-image fa-3x"></i>';
    }
    return '<i class="fas fa-file fa-3x"></i>';
}

/**
 * Actualiza las estadísticas de recursos
 * @param {Array} resources - Lista de recursos
 * @param {boolean} filtered - Indica si los recursos están filtrados
 */
function updateResourceStats(resources, filtered = false) {
    const statsElement = document.getElementById('resourceStats');

    // Verificar si el elemento existe
    if (!statsElement) {
        console.log('No se encontró el elemento resourceStats, omitiendo actualización de estadísticas');
        return;
    }

    // Contar recursos por tipo
    const htmlCount = resources.filter(r => r.type === 'html').length;
    const pdfCount = resources.filter(r => r.type === 'pdf').length;
    const imageCount = resources.filter(r => r.type === 'image').length;

    // Contar recursos en uso
    const usedCount = resources.filter(r => r.inUse).length;
    const unusedCount = resources.length - usedCount;

    // Crear mensaje de estadísticas
    let statsMessage = '';

    if (filtered) {
        statsMessage = `Mostrando ${resources.length} recursos filtrados: `;
    } else {
        statsMessage = `Total de recursos: ${resources.length} `;
    }

    statsMessage += `(HTML: ${htmlCount}, PDF: ${pdfCount}, Imágenes: ${imageCount}) | `;
    statsMessage += `En uso: ${usedCount}, Sin usar: ${unusedCount}`;

    // Actualizar elemento de estadísticas
    statsElement.textContent = statsMessage;
}

/**
 * Actualiza los archivos de índice con los recursos actuales
 * @returns {Promise} - Promesa que se resuelve cuando se han actualizado todos los archivos
 */
function updateResourceIndexes() {
    console.log('Actualizando archivos de índice...');

    // En un entorno real, esto se haría mediante una API que actualice los archivos en el servidor
    // Para esta simulación, simplemente mostraremos un mensaje de éxito

    // Mostrar mensaje de actualización
    const statsElement = document.getElementById('resourceStats');

    // Verificar si el elemento existe
    if (!statsElement) {
        console.log('No se encontró el elemento resourceStats, omitiendo actualización de índices');
        return Promise.resolve();
    }

    const originalText = statsElement.textContent;
    statsElement.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span class="visually-hidden">Actualizando...</span>
            </div>
            <span>Actualizando archivos de índice...</span>
        </div>
    `;

    // Simular actualización
    return new Promise((resolve) => {
        setTimeout(() => {
            // Actualizar la fecha de última actualización
            const now = new Date().toISOString();

            // Mostrar mensaje de éxito
            statsElement.innerHTML = `
                <div class="alert alert-success mb-0">
                    <i class="fas fa-check-circle me-2"></i>
                    Archivos de índice actualizados correctamente. Última actualización: ${now.split('T')[0]} ${now.split('T')[1].substring(0, 8)}
                </div>
            `;

            // Restaurar el texto original después de unos segundos
            setTimeout(() => {
                statsElement.textContent = originalText;
            }, 5000);

            resolve();
        }, 2000);
    });
}

/**
 * Obtiene la lista de recursos para un tipo específico
 * Función para ser utilizada desde otros archivos
 * @param {string} type - Tipo de recurso (html, pdf, image)
 * @returns {Promise<Array>} - Promesa que resuelve a una lista de nombres de recursos
 */
async function getResourceList(type) {
    // Definir las carpetas permitidas
    const allowedFolders = {
        'html': 'activities/html/',
        'pdf': 'activities/pdf/',
        'image': 'activities/images/'
    };

    // Verificar que el tipo sea válido
    if (!['html', 'pdf', 'image'].includes(type)) {
        console.error(`Tipo de recurso no válido: ${type}`);
        return [];
    }

    // Obtener la carpeta esperada para este tipo
    const expectedFolder = allowedFolders[type];

    // Si allResources está vacío o no contiene recursos del tipo solicitado,
    // cargar directamente desde el archivo JSON
    if (!allResources || allResources.length === 0 || !allResources.some(r => r.type === type)) {
        console.log(`No hay recursos cargados en memoria. Cargando directamente desde el archivo JSON para tipo: ${type}`);

        try {
            // Cargar recursos directamente desde el archivo JSON
            const resources = await getResourcesFromFolder(type);

            // Devolver solo los nombres
            return resources.map(r => r.name);
        } catch (error) {
            console.error(`Error al cargar recursos de tipo ${type} desde el archivo JSON:`, error);
            return [];
        }
    }

    // Si ya hay recursos cargados en memoria, filtrarlos por tipo y carpeta
    const resources = allResources.filter(r => {
        const isCorrectType = r.type === type;
        const isCorrectFolder = r.folder === expectedFolder;

        if (!isCorrectType) {
            console.debug(`Recurso ${r.name} descartado: tipo incorrecto (${r.type} != ${type})`);
        } else if (!isCorrectFolder) {
            console.debug(`Recurso ${r.name} descartado: carpeta incorrecta (${r.folder || 'undefined'} != ${expectedFolder})`);
        }

        return isCorrectType && isCorrectFolder;
    });

    console.log(`Obteniendo recursos de tipo ${type} en carpeta ${expectedFolder}: ${resources.length} encontrados`);

    // Mostrar los recursos encontrados
    if (resources.length > 0) {
        console.log('Recursos encontrados:', resources.map(r => r.name).join(', '));
    } else {
        console.warn(`No se encontraron recursos de tipo ${type} en la carpeta ${expectedFolder}`);
    }

    // Devolver solo los nombres
    return resources.map(r => r.name);
}

// Exponer funciones globalmente
window.ResourceManager = {
    getResourceList: getResourceList,
    updateResourceIndexes: updateResourceIndexes,
    // Función para cargar recursos directamente desde los archivos JSON
    loadResourcesFromJSON: async function(type) {
        return await getResourcesFromFolder(type);
    }
};
