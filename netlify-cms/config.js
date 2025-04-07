// Configuración personalizada para Netlify CMS
window.CMS_MANUAL_INIT = true;

// Inicializar CMS con configuración personalizada
window.addEventListener('load', function() {
  // Cargar configuración desde config.yml
  fetch('config.yml')
    .then(response => response.text())
    .then(yaml => {
      // Inicializar CMS con la configuración cargada
      const config = window.netlifyIdentity ? {
        backend: {
          name: 'git-gateway'
        }
      } : {
        backend: {
          name: 'test-repo' // Modo de prueba local
        }
      };
      
      // Inicializar CMS
      window.CMS.init({ config });
      
      // Personalizar la interfaz de usuario
      customizeCMS();
    });
});

// Función para personalizar la interfaz de usuario del CMS
function customizeCMS() {
  // Personalizar estilos
  const style = document.createElement('style');
  style.textContent = `
    /* Ocultar elementos no deseados */
    .nc-githubAuthenticationPage-logo {
      display: none !important;
    }
    
    /* Personalizar colores */
    .nc-appHeader-container {
      background-color: #f8f9fa !important;
    }
    
    /* Personalizar botones */
    .nc-button-primary {
      background-color: #007bff !important;
    }
    
    /* Personalizar formularios */
    .nc-entryEditor-container {
      padding: 20px !important;
    }
  `;
  document.head.appendChild(style);
  
  // Observar cambios en el DOM para aplicar personalizaciones adicionales
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // Personalizar elementos recién añadidos
        customizeNewElements();
      }
    });
  });
  
  // Iniciar observación
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Ocultar loader cuando el CMS esté listo
  setTimeout(function() {
    const loader = document.getElementById('customLoader');
    if (loader) {
      loader.classList.remove('show');
    }
  }, 2000);
}

// Función para personalizar elementos recién añadidos
function customizeNewElements() {
  // Personalizar encabezados
  const headers = document.querySelectorAll('.nc-appHeader-content');
  headers.forEach(header => {
    if (!header.dataset.customized) {
      header.dataset.customized = 'true';
      
      // Añadir botón de volver al panel personalizado
      const backButton = document.createElement('button');
      backButton.className = 'nc-button nc-button-secondary';
      backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Panel';
      backButton.style.marginRight = '10px';
      backButton.addEventListener('click', function() {
        window.location.hash = '';
      });
      
      // Insertar al principio del encabezado
      if (header.firstChild) {
        header.insertBefore(backButton, header.firstChild);
      } else {
        header.appendChild(backButton);
      }
    }
  });
}
