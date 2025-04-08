// Script específico para manejar actividades en Netlify

document.addEventListener('DOMContentLoaded', function() {
    // Detectar si estamos en Netlify
    const isNetlify = window.location.hostname.includes('netlify.app') || 
                     window.location.hostname.includes('netlify.com');
    
    if (isNetlify) {
        console.log('Entorno Netlify detectado, configurando manejador de actividades');
        
        // Función para cargar la versión estática de la actividad
        function loadStaticActivity() {
            // Buscar contenedores de actividad
            const activityContainers = document.querySelectorAll('[id^="activity-container"]');
            
            if (activityContainers.length > 0) {
                console.log(`Encontrados ${activityContainers.length} contenedores de actividad`);
                
                activityContainers.forEach((container, index) => {
                    console.log(`Cargando versión estática para contenedor #${index}: ${container.id}`);
                    
                    // Mostrar indicador de carga
                    container.innerHTML = `
                        <div class="text-center p-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p class="mt-2">Cargando actividad estática...</p>
                        </div>
                    `;
                    
                    // Cargar la versión estática
                    fetch('../activities/templates/activity-static.html')
                        .then(response => {
                            console.log(`Respuesta recibida para actividad estática: ${response.status}`);
                            if (!response.ok) {
                                throw new Error(`Error al cargar actividad estática: ${response.status}`);
                            }
                            return response.text();
                        })
                        .then(html => {
                            console.log('Contenido de actividad estática recibido, longitud:', html.length);
                            
                            // Extraer solo el contenido de la actividad
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;
                            
                            const activityContent = tempDiv.querySelector('.activity-content');
                            if (activityContent) {
                                container.innerHTML = activityContent.innerHTML;
                                console.log('Actividad estática cargada correctamente');
                            } else {
                                container.innerHTML = html;
                                console.log('No se encontró .activity-content, usando HTML completo');
                            }
                        })
                        .catch(error => {
                            console.error('Error al cargar actividad estática:', error);
                            container.innerHTML = `
                                <div class="alert alert-danger">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Error:</strong> No se pudo cargar la actividad.
                                    <p class="mt-2">Detalles: ${error.message}</p>
                                </div>
                            `;
                        });
                });
            }
        }
        
        // Ejecutar después de un breve retraso para asegurar que la página esté completamente cargada
        setTimeout(loadStaticActivity, 500);
        
        // También ejecutar cuando se detecte un cambio en la URL (navegación SPA)
        window.addEventListener('hashchange', loadStaticActivity);
    }
});
