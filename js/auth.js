class AuthService {
    constructor() {
        this.user = null;
        // Credenciales de administrador
        this.adminCredentials = {
            email: 'admin@matematicaweb.com',
            password: 'Asdqwe123' // Contraseña actualizada
        };

        // Protección contra ataques de fuerza bruta
        this.loginAttempts = 0;
        this.lockoutUntil = 0;

        this.checkAuthStatus();
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
                this.updateUI();
            } catch (error) {
                console.error('Error al recuperar usuario:', error);
                this.logout();
            }
        }
    }

    async login(email, password) {
        // Verificar si la cuenta está bloqueada temporalmente
        const now = Date.now();
        if (now < this.lockoutUntil) {
            const waitSeconds = Math.ceil((this.lockoutUntil - now) / 1000);
            throw new Error(`Demasiados intentos fallidos. Intenta nuevamente en ${waitSeconds} segundos.`);
        }

        // Simular un pequeño retraso para dificultar ataques de fuerza bruta
        // El retraso aumenta con cada intento fallido
        const delayMs = Math.min(500 + (this.loginAttempts * 100), 3000);
        await new Promise(resolve => setTimeout(resolve, delayMs));

        // Verificar las credenciales directamente
        if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
            // Reiniciar contador de intentos fallidos
            this.loginAttempts = 0;
            this.lockoutUntil = 0;

            this.user = {
                id: 1,
                name: 'Administrador',
                email: email,
                role: 'admin'
            };

            // Guardar en localStorage (en producción usaríamos JWT o cookies seguras)
            localStorage.setItem('user', JSON.stringify(this.user));
            this.updateUI();
            return true;
        }

        // Incrementar contador de intentos fallidos
        this.loginAttempts++;

        // Bloquear temporalmente después de varios intentos fallidos
        if (this.loginAttempts >= 5) {
            // Bloquear por un tiempo que aumenta con cada intento adicional
            const lockoutSeconds = Math.min(30 * (this.loginAttempts - 4), 300); // Máximo 5 minutos
            this.lockoutUntil = now + (lockoutSeconds * 1000);
            throw new Error(`Demasiados intentos fallidos. Cuenta bloqueada por ${lockoutSeconds} segundos.`);
        }

        return false;
    }

    logout() {
        localStorage.removeItem('user');
        this.user = null;
        this.updateUI();

        // Reiniciar intentos de login al cerrar sesión
        this.resetLoginAttempts();

        // Determinar la ruta correcta para redirigir
        let redirectPath = 'index.html';
        if (window.location.pathname.includes('/admin/')) {
            redirectPath = '../index.html';
        } else if (window.location.pathname.includes('/courses/') ||
                   window.location.pathname.includes('/activities/') ||
                   window.location.pathname.includes('/sections/')) {
            redirectPath = '../index.html';
        }

        window.location.href = redirectPath;
    }

    /**
     * Reinicia el contador de intentos de login y el bloqueo
     */
    resetLoginAttempts() {
        this.loginAttempts = 0;
        this.lockoutUntil = 0;
        console.log('Intentos de login reiniciados');
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    updateUI() {
        const userSection = document.getElementById('userSection');
        if (!userSection) return;

        // Determinar la ruta base para los enlaces
        let basePath = '';
        // Si estamos en una subcarpeta (como /admin/ o /courses/), ajustar la ruta base
        if (window.location.pathname.includes('/admin/')) {
            basePath = '../';
        } else if (window.location.pathname.includes('/courses/') ||
                   window.location.pathname.includes('/activities/') ||
                   window.location.pathname.includes('/sections/')) {
            basePath = '../';
        }

        if (this.user) {
            userSection.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        ${this.user.name}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="${basePath}admin/index.html">Panel Administrador</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="auth.logout()">Cerrar Sesión</a></li>
                    </ul>
                </div>
            `;
        } else {
            userSection.innerHTML = `
                <a href="${basePath}login.html" class="btn btn-outline-primary">Iniciar Sesión</a>
            `;
        }
    }
}

const auth = new AuthService();