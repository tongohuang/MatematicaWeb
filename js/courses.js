class CourseSection {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.title = data.title || '';
        this.content = data.content || [];
    }

    addContent(type, value) {
        this.content.push({ type, value });
    }

    removeContent(index) {
        this.content.splice(index, 1);
    }

    render() {
        return `
            <div class="section-content" data-section-id="${this.id}">
                <h3>${this.title}</h3>
                ${this.content.map((item, index) => {
                    switch(item.type) {
                        case 'text':
                            return `<div class="content-text">${item.value}</div>`;
                        case 'youtube':
                            return `
                                <div class="youtube-container">
                                    <iframe src="https://www.youtube.com/embed/${item.value}" 
                                            frameborder="0" allowfullscreen></iframe>
                                </div>`;
                        case 'geogebra':
                            return `
                                <div class="geogebra-container">
                                    <iframe src="https://www.geogebra.org/material/iframe/id/${item.value}" 
                                            frameborder="0"></iframe>
                                </div>`;
                        case 'activity':
                            return `
                                <div class="activity-container">
                                    <iframe src="../activities/templates/${item.value}" 
                                            frameborder="0"></iframe>
                                </div>`;
                        default:
                            return '';
                    }
                }).join('')}
            </div>
        `;
    }
}

// Agregar método para insertar actividad
function insertActivity(sectionId) {
    activityUI.showActivitySelector((activityId) => {
        const activity = activityManager.getActivity(activityId);
        if (activity) {
            const section = getCurrentSection(sectionId);
            section.addContent('activity', activity.filename);
            updateCourseContent();
        }
    });
}

/* Estilos para actividades */
.activity-container {
    width: 100%;
    min-height: 400px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    margin: 20px 0;
}

.activity-container iframe {
    width: 100%;
    height: 100%;
    border: none;
}

/* Selector de actividades */
.activity-item {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.activity-item:hover {
    background-color: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Mejoras visuales generales */
.card {
    border: none;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.btn {
    border-radius: 5px;
    padding: 8px 16px;
    font-weight: 500;
}

.section-content {
    background: white;
    border: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Animaciones */
.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
