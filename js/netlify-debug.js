// Script para depurar problemas en Netlify

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en Netlify
    const isNetlify = window.location.hostname.includes('netlify.app') || 
                     window.location.hostname.includes('netlify.com');
    
    if (isNetlify) {
        console.log('=== DEPURACIÓN DE NETLIFY ===');
        console.log('URL actual:', window.location.href);
        console.log('Hostname:', window.location.hostname);
        console.log('Origen:', window.location.origin);
        console.log('Pathname:', window.location.pathname);
        
        // Verificar si los archivos de ejemplo existen
        const htmlPath = window.location.origin + '/activities/html/ejemplo-simple.html';
        const activityPath = window.location.origin + '/activities/templates/ejemplo-simple.html';
        
        console.log('Verificando archivo HTML de ejemplo:', htmlPath);
        checkFileExists(htmlPath, 'HTML de ejemplo');
        
        console.log('Verificando archivo de actividad de ejemplo:', activityPath);
        checkFileExists(activityPath, 'Actividad de ejemplo');
    }
});

function checkFileExists(url, description) {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                console.log(`Verificación de ${description} completada con estado:`, xhr.status);
                if (xhr.status === 200) {
                    console.log(`✅ ${description} existe en la URL:`, url);
                } else {
                    console.error(`❌ ${description} NO existe en la URL:`, url);
                }
            }
        };
        xhr.onerror = function() {
            console.error(`❌ Error al verificar ${description}:`, xhr.statusText);
        };
        xhr.send();
    } catch (error) {
        console.error(`❌ Error al verificar ${description}:`, error);
    }
}
