class AuthService {
    constructor() {
        this.user = null;
        this.adminCredentials = {
            email: 'admin@matematicaweb.com',
            password: 'admin123'
        };
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
        // Autenticación local para demo
        if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
            this.user = {
                id: 1,
                name: 'Administrador',
                email: email,
                role: 'admin'
            };
            localStorage.setItem('user', JSON.stringify(this.user));
            this.updateUI();
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('user');
        this.user = null;
        this.updateUI();

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