// Sistema de registro para depuración
const Logger = {
    logs: [],
    
    // Niveles de log
    LEVELS: {
        DEBUG: 'DEBUG',
        INFO: 'INFO',
        WARNING: 'WARNING',
        ERROR: 'ERROR'
    },
    
    // Guardar un mensaje en el log
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };
        
        // Guardar en el array de logs
        this.logs.push(logEntry);
        
        // Guardar en localStorage
        this.saveLogs();
        
        // Mostrar en consola
        console.log(`[${timestamp}] [${level}] ${message}`, data || '');
        
        return logEntry;
    },
    
    // Métodos de conveniencia para cada nivel
    debug(message, data = null) {
        return this.log(this.LEVELS.DEBUG, message, data);
    },
    
    info(message, data = null) {
        return this.log(this.LEVELS.INFO, message, data);
    },
    
    warning(message, data = null) {
        return this.log(this.LEVELS.WARNING, message, data);
    },
    
    error(message, data = null) {
        return this.log(this.LEVELS.ERROR, message, data);
    },
    
    // Guardar logs en localStorage
    saveLogs() {
        localStorage.setItem('matematicaweb_logs', JSON.stringify(this.logs.slice(-100))); // Guardar solo los últimos 100 logs
    },
    
    // Cargar logs desde localStorage
    loadLogs() {
        const savedLogs = localStorage.getItem('matematicaweb_logs');
        if (savedLogs) {
            try {
                this.logs = JSON.parse(savedLogs);
            } catch (error) {
                console.error('Error al cargar logs:', error);
                this.logs = [];
            }
        }
    },
    
    // Limpiar logs
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('matematicaweb_logs');
    },
    
    // Mostrar logs en un elemento HTML
    displayLogs(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.innerHTML = this.logs.map(log => {
            const timestamp = new Date(log.timestamp).toLocaleTimeString();
            const levelClass = log.level.toLowerCase();
            
            return `
                <div class="log-entry log-${levelClass}">
                    <span class="log-timestamp">${timestamp}</span>
                    <span class="log-level">${log.level}</span>
                    <span class="log-message">${log.message}</span>
                    ${log.data ? `<pre class="log-data">${JSON.stringify(log.data, null, 2)}</pre>` : ''}
                </div>
            `;
        }).join('');
    }
};

// Cargar logs al inicializar
document.addEventListener('DOMContentLoaded', () => {
    Logger.loadLogs();
});
