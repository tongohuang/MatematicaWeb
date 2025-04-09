// Script para cargar contenido HTML y actividades sin usar iframes

function loadHTMLContent(url, containerId, fallbackUrl, isActivity = false) {
    console.log(`Cargando contenido ${isActivity ? 'de actividad' : 'HTML'} desde:`, url);
    const container = document.getElementById(containerId);

    if (!container) {
        console.error('Contenedor no encontrado:', containerId);
        return;
    }

    // Detectar si estamos en Netlify
    const isNetlify = window.location.hostname.includes('netlify.app') ||
                     window.location.hostname.includes('netlify.com');

    // Si es una actividad, verificar si es un ID o una URL
    if (isActivity) {
        // Verificar si la URL es un ID de actividad (activity_TIMESTAMP)
        if (url.includes('activity_')) {
            // Extraer el ID de la actividad
            const activityId = url.split('/').pop();
            console.log('ID de actividad detectado:', activityId);

            // Intentar cargar la actividad desde localStorage con diferentes claves
            let activityData = null;

            // 1. Intentar con la clave principal
            activityData = localStorage.getItem(`activity_data_${activityId}`);

            // 2. Si no se encuentra, intentar con la clave alternativa
            if (!activityData) {
                activityData = localStorage.getItem(activityId);
                if (activityData) {
                    console.log('Actividad encontrada en localStorage con clave alternativa');
                }
            } else {
                console.log('Actividad encontrada en localStorage con clave principal');
            }

            // 3. Si no se encuentra, buscar en el registro de actividades
            if (!activityData) {
                try {
                    const activityRegistry = JSON.parse(localStorage.getItem('activity_registry') || '[]');
                    const registryEntry = activityRegistry.find(a => a.id === activityId);
                    if (registryEntry) {
                        console.log('Actividad encontrada en el registro, creando datos básicos');
                        // Crear datos básicos para la actividad
                        const basicData = {
                            id: activityId,
                            title: registryEntry.title || 'Actividad',
                            type: registryEntry.type || 'generic',
                            questions: []
                        };
                        activityData = JSON.stringify(basicData);

                        // Guardar para futuras referencias
                        localStorage.setItem(`activity_data_${activityId}`, activityData);
                    }
                } catch (e) {
                    console.warn('Error al buscar en el registro de actividades:', e);
                }
            }

            // 4. Si se encontró la actividad, cargar la vista de actividad
            if (activityData) {
                console.log('Actividad encontrada, cargando vista de actividad');
                url = '../activities/view.html?id=' + activityId;
            } else if (isNetlify) {
                // Si estamos en Netlify y no encontramos la actividad, usar la versión estática
                console.log('Entorno Netlify detectado, usando versión estática para actividad');
                url = '../activities/templates/activity-static.html';
            } else {
                // Si no encontramos la actividad y no estamos en Netlify, usar el fallback
                console.log('Actividad no encontrada en ninguna fuente, usando fallback');
                if (fallbackUrl) {
                    url = fallbackUrl;
                } else {
                    url = '../activities/templates/activity-static.html';
                }
            }
        } else if (isNetlify) {
            // Si es una URL y estamos en Netlify, usar la versión estática
            console.log('Entorno Netlify detectado, usando versión estática para actividad');
            url = '../activities/templates/activity-static.html';
        }
    }

    // Mostrar indicador de carga
    container.innerHTML = `
        <div class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando contenido...</p>
        </div>
    `;

    // Función para cargar el contenido
    function fetchContent(contentUrl) {
        console.log(`Iniciando fetch para ${isActivity ? 'actividad' : 'HTML'}:`, contentUrl);

        fetch(contentUrl)
            .then(response => {
                console.log(`Respuesta recibida para ${contentUrl}:`, response.status);
                if (!response.ok) {
                    throw new Error('Respuesta no válida: ' + response.status);
                }
                return response.text();
            })
            .then(html => {
                console.log(`Contenido recibido para ${contentUrl}, longitud:`, html.length);

                // Crear un contenedor para el contenido
                const contentWrapper = document.createElement('div');
                contentWrapper.className = isActivity ? 'activity-content-wrapper' : 'html-content-wrapper';

                // Si es una actividad, podemos necesitar procesar el contenido de manera especial
                if (isActivity) {
                    // Intentar extraer solo el cuerpo del HTML para actividades
                    try {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;

                        // Buscar el contenido principal de la actividad
                        const activityContent = tempDiv.querySelector('.activity-content') ||
                                               tempDiv.querySelector('#activity-content') ||
                                               tempDiv.querySelector('main') ||
                                               tempDiv.querySelector('body') ||
                                               tempDiv;

                        contentWrapper.innerHTML = activityContent.innerHTML || html;
                        console.log('Contenido de actividad procesado correctamente');
                    } catch (e) {
                        console.warn('Error al procesar contenido de actividad, usando HTML completo:', e);
                        contentWrapper.innerHTML = html;
                    }
                } else {
                    // Para HTML normal
                    contentWrapper.innerHTML = html;
                }

                // Limpiar el contenedor y agregar el contenido
                container.innerHTML = '';
                container.appendChild(contentWrapper);

                console.log(`Contenido ${isActivity ? 'de actividad' : 'HTML'} cargado correctamente desde:`, contentUrl);

                // Ejecutar scripts si hay alguno
                const scripts = contentWrapper.querySelectorAll('script');
                console.log(`Encontrados ${scripts.length} scripts para ejecutar`);

                scripts.forEach((script, index) => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        // Verificar si es polyfill.io y usar la versión local
                        if (script.src.includes('polyfill.io')) {
                            console.log(`Reemplazando polyfill.io con versión local para script #${index}`);
                            newScript.src = '../js/polyfill.min.js';
                        } else {
                            newScript.src = script.src;
                            console.log(`Cargando script externo #${index}:`, script.src);
                        }
                    } else {
                        newScript.textContent = script.textContent;
                        console.log(`Ejecutando script inline #${index}`);
                    }
                    document.body.appendChild(newScript);
                });

                // Cargar estilos si hay alguno
                const styles = contentWrapper.querySelectorAll('style, link[rel="stylesheet"]');
                console.log(`Encontrados ${styles.length} estilos para cargar`);

                styles.forEach((style, index) => {
                    if (style.tagName.toLowerCase() === 'link') {
                        const newLink = document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.href = style.href;
                        console.log(`Cargando hoja de estilos externa #${index}:`, style.href);
                        document.head.appendChild(newLink);
                    } else {
                        const newStyle = document.createElement('style');
                        newStyle.textContent = style.textContent;
                        console.log(`Aplicando estilo inline #${index}`);
                        document.head.appendChild(newStyle);
                    }
                });
            })
            .catch(error => {
                console.error(`Error al cargar el contenido ${isActivity ? 'de actividad' : 'HTML'}:`, error);

                if (contentUrl !== fallbackUrl && fallbackUrl) {
                    console.warn('Intentando cargar contenido de fallback:', fallbackUrl);
                    fetchContent(fallbackUrl);
                } else {
                    // Mostrar mensaje de error
                    container.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Error:</strong> No se pudo cargar el contenido.
                            <p class="mt-2">Detalles: ${error.message}</p>
                            <p>URL: ${contentUrl}</p>
                        </div>
                    `;
                }
            });
    }

    // Iniciar la carga
    fetchContent(url);
}

// Función para verificar si un archivo existe
function checkFileExists(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        };
        xhr.onerror = function() {
            reject(new Error('Error al verificar archivo: ' + xhr.statusText));
        };
        xhr.send();
    });
}
