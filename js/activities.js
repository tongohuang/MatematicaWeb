class ActivityManager {
    constructor() {
        this.activities = this.loadActivities();
    }

    loadActivities() {
        return JSON.parse(localStorage.getItem('activities')) || [];
    }

    saveActivities() {
        localStorage.setItem('activities', JSON.stringify(this.activities));
    }

    addActivity(activity) {
        this.activities.push({
            id: Date.now(),
            ...activity,
            createdAt: new Date().toISOString()
        });
        this.saveActivities();
    }

    getActivity(id) {
        return this.activities.find(act => act.id === id);
    }

    getAllActivities() {
        return this.activities;
    }

    updateActivity(id, updates) {
        this.activities = this.activities.map(act => 
            act.id === id ? {...act, ...updates} : act
        );
        this.saveActivities();
    }

    deleteActivity(id) {
        this.activities = this.activities.filter(act => act.id !== id);
        this.saveActivities();
    }
}

// Interfaz para gestionar actividades en el panel admin
class ActivityUI {
    constructor(activityManager) {
        this.manager = activityManager;
    }

    renderActivityList(containerId) {
        const container = document.getElementById(containerId);
        const activities = this.manager.getAllActivities();

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Archivo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activities.map(act => `
                            <tr>
                                <td>${act.name}</td>
                                <td>${act.description}</td>
                                <td>${act.filename}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" 
                                            onclick="previewActivity(${act.id})">
                                        Vista previa
                                    </button>
                                    <button class="btn btn-sm btn-danger" 
                                            onclick="deleteActivity(${act.id})">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    showActivitySelector(targetInput) {
        const activities = this.manager.getAllActivities();
        const modal = new bootstrap.Modal(document.getElementById('activitySelectorModal'));
        
        document.getElementById('activityList').innerHTML = activities.map(act => `
            <div class="activity-item" onclick="selectActivity('${act.id}', '${targetInput}')">
                <h5>${act.name}</h5>
                <p>${act.description}</p>
            </div>
        `).join('');

        modal.show();
    }
}