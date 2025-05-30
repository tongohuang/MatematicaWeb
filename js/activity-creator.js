// Variables globales
let currentActivity = {
    id: null,
    title: '',
    description: '',
    type: '',
    questions: [],
    settings: {
        timeLimit: 0,
        passingScore: 60,
        maxAttempts: 3,
        showFeedback: true,
        randomizeQuestions: false
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', '../components/header.html');
    loadComponent('footer', '../components/footer.html');
    
    // Verificar si el usuario está autenticado y es administrador
    if (!auth.isAdmin()) {
        window.location.href = '../login.html';
        return;
    }
    
    // Configurar eventos
    setupEventListeners();
    
    // Actualizar la vista previa
    updatePreview();
});

function setupEventListeners() {
    // Eventos para actualizar la vista previa en tiempo real
    document.getElementById('activityTitle').addEventListener('input', updatePreview);
    document.getElementById('activityDescription').addEventListener('input', updatePreview);
    
    // Evento para agregar una pregunta
    document.getElementById('addQuestionBtn').addEventListener('click', openQuestionModal);
    
    // Evento para guardar una pregunta
    document.getElementById('saveQuestionBtn').addEventListener('click', saveQuestion);
    
    // Evento para guardar la actividad
    document.getElementById('saveActivityBtn').addEventListener('click', saveActivity);
    
    // Evento para mostrar la vista previa
    document.getElementById('previewActivityBtn').addEventListener('click', showFullPreview);
    
    // Evento para cambiar el tipo de actividad
    document.getElementById('activityType').addEventListener('change', function() {
        // Limpiar la lista de preguntas si se cambia el tipo
        if (currentActivity.questions.length > 0 && currentActivity.type !== this.value) {
            if (confirm('Cambiar el tipo de actividad eliminará todas las preguntas existentes. ¿Desea continuar?')) {
                currentActivity.questions = [];
                updateQuestionsList();
            } else {
                this.value = currentActivity.type;
            }
        }
        
        currentActivity.type = this.value;
    });
}

function openQuestionModal() {
    // Verificar si se ha seleccionado un tipo de actividad
    const activityType = document.getElementById('activityType').value;
    if (!activityType) {
        alert('Por favor, seleccione un tipo de actividad antes de agregar preguntas.');
        // Cambiar a la pestaña de información
        document.getElementById('infoTab').click();
        return;
    }
    
    // Limpiar el formulario
    document.getElementById('questionForm').reset();
    document.getElementById('questionId').value = '';
    
    // Cargar los campos específicos según el tipo de actividad
    loadQuestionFields(activityType);
    
    // Cambiar el título del modal
    document.getElementById('questionModalLabel').textContent = 'Agregar Pregunta';
    
    // Mostrar el modal
    const questionModal = new bootstrap.Modal(document.getElementById('questionModal'));
    questionModal.show();
}

function loadQuestionFields(activityType) {
    const questionFields = document.getElementById('questionFields');
    
    switch (activityType) {
        case 'multiple-choice':
            questionFields.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Opciones</label>
                    <div id="optionsContainer" class="options-editor">
                        <div class="option-editor-item">
                            <div class="option-editor-marker">A</div>
                            <div class="option-editor-input">
                                <input type="text" class="form-control" name="option[]" placeholder="Opción A" required>
                            </div>
                            <div class="option-editor-correct">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="correctOption" value="0" required>
                                    <label class="form-check-label">Correcta</label>
                                </div>
                            </div>
                        </div>
                        <div class="option-editor-item">
                            <div class="option-editor-marker">B</div>
                            <div class="option-editor-input">
                                <input type="text" class="form-control" name="option[]" placeholder="Opción B" required>
                            </div>
                            <div class="option-editor-correct">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="correctOption" value="1">
                                    <label class="form-check-label">Correcta</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary add-option-btn" onclick="addOption()">
                        <i class="fas fa-plus"></i> Agregar Opción
                    </button>
                </div>
            `;
            break;
            
        case 'true-false':
            questionFields.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Respuesta Correcta</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="correctAnswer" id="answerTrue" value="true" required>
                        <label class="form-check-label" for="answerTrue">Verdadero</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="correctAnswer" id="answerFalse" value="false" required>
                        <label class="form-check-label" for="answerFalse">Falso</label>
                    </div>
                </div>
            `;
            break;
            
        case 'short-answer':
            questionFields.innerHTML = `
                <div class="mb-3">
                    <label for="correctAnswer" class="form-label">Respuesta Correcta</label>
                    <input type="text" class="form-control" id="correctAnswer" required>
                    <div class="form-text">Puede haber múltiples respuestas correctas. Sepárelas con punto y coma (;).</div>
                </div>
            `;
            break;
            
        default:
            questionFields.innerHTML = '<p class="text-muted">Seleccione un tipo de actividad válido.</p>';
    }
}

function addOption() {
    const optionsContainer = document.getElementById('optionsContainer');
    const optionCount = optionsContainer.children.length;
    
    if (optionCount >= 6) {
        alert('No se pueden agregar más de 6 opciones.');
        return;
    }
    
    const optionLetter = String.fromCharCode(65 + optionCount); // A, B, C, ...
    
    const optionItem = document.createElement('div');
    optionItem.className = 'option-editor-item';
    optionItem.innerHTML = `
        <div class="option-editor-marker">${optionLetter}</div>
        <div class="option-editor-input">
            <input type="text" class="form-control" name="option[]" placeholder="Opción ${optionLetter}" required>
        </div>
        <div class="option-editor-correct">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="correctOption" value="${optionCount}">
                <label class="form-check-label">Correcta</label>
            </div>
        </div>
        <div class="option-editor-actions">
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeOption(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    optionsContainer.appendChild(optionItem);
}

function removeOption(button) {
    const optionItem = button.closest('.option-editor-item');
    const optionsContainer = document.getElementById('optionsContainer');
    
    optionsContainer.removeChild(optionItem);
    
    // Actualizar las letras y valores de las opciones
    const options = optionsContainer.children;
    for (let i = 0; i < options.length; i++) {
        const optionLetter = String.fromCharCode(65 + i); // A, B, C, ...
        options[i].querySelector('.option-editor-marker').textContent = optionLetter;
        options[i].querySelector('input[name="option[]"]').placeholder = `Opción ${optionLetter}`;
        options[i].querySelector('input[name="correctOption"]').value = i;
    }
}

function saveQuestion() {
    // Obtener los valores del formulario
    const questionText = document.getElementById('questionText').value;
    const questionId = document.getElementById('questionId').value;
    const activityType = document.getElementById('activityType').value;
    
    if (!questionText) {
        alert('Por favor, ingrese el texto de la pregunta.');
        return;
    }
    
    let questionData = {
        id: questionId ? parseInt(questionId) : Date.now(), // Usar timestamp como ID temporal
        text: questionText,
        type: activityType
    };
    
    // Obtener los datos específicos según el tipo de actividad
    switch (activityType) {
        case 'multiple-choice':
            const options = Array.from(document.getElementsByName('option[]')).map(input => input.value);
            const correctOption = document.querySelector('input[name="correctOption"]:checked');
            
            if (!options.every(option => option.trim() !== '')) {
                alert('Por favor, complete todas las opciones.');
                return;
            }
            
            if (!correctOption) {
                alert('Por favor, seleccione la opción correcta.');
                return;
            }
            
            questionData.options = options;
            questionData.correctOption = parseInt(correctOption.value);
            break;
            
        case 'true-false':
            const correctAnswer = document.querySelector('input[name="correctAnswer"]:checked');
            
            if (!correctAnswer) {
                alert('Por favor, seleccione la respuesta correcta.');
                return;
            }
            
            questionData.correctAnswer = correctAnswer.value === 'true';
            break;
            
        case 'short-answer':
            const answer = document.getElementById('correctAnswer').value;
            
            if (!answer) {
                alert('Por favor, ingrese la respuesta correcta.');
                return;
            }
            
            questionData.correctAnswers = answer.split(';').map(a => a.trim());
            break;
    }
    
    // Guardar la pregunta
    if (questionId) {
        // Editar pregunta existente
        const index = currentActivity.questions.findIndex(q => q.id === parseInt(questionId));
        if (index !== -1) {
            currentActivity.questions[index] = questionData;
        }
    } else {
        // Agregar nueva pregunta
        currentActivity.questions.push(questionData);
    }
    
    // Cerrar el modal
    const questionModal = bootstrap.Modal.getInstance(document.getElementById('questionModal'));
    questionModal.hide();
    
    // Actualizar la lista de preguntas
    updateQuestionsList();
    
    // Actualizar la vista previa
    updatePreview();
}

function updateQuestionsList() {
    const questionsList = document.getElementById('questionsList');
    
    if (currentActivity.questions.length === 0) {
        questionsList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-question-circle fa-3x mb-3"></i>
                <p>No hay preguntas. Haz clic en "Agregar Pregunta" para comenzar.</p>
            </div>
        `;
        return;
    }
    
    questionsList.innerHTML = currentActivity.questions.map((question, index) => {
        let questionContent = '';
        
        switch (question.type) {
            case 'multiple-choice':
                questionContent = `
                    <div class="options-list">
                        ${question.options.map((option, i) => `
                            <div class="option-item ${i === question.correctOption ? 'correct' : ''}">
                                <div class="option-marker">${String.fromCharCode(65 + i)}</div>
                                <div class="option-text">${option}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'true-false':
                questionContent = `
                    <div class="true-false-options">
                        <div class="true-false-option true-option ${question.correctAnswer ? 'selected' : ''}">
                            Verdadero
                        </div>
                        <div class="true-false-option false-option ${!question.correctAnswer ? 'selected' : ''}">
                            Falso
                        </div>
                    </div>
                `;
                break;
                
            case 'short-answer':
                questionContent = `
                    <div class="short-answer">
                        Respuestas aceptadas: ${question.correctAnswers.join(', ')}
                    </div>
                `;
                break;
        }
        
        return `
            <div class="question-item">
                <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div class="question-title">${question.text}</div>
                    <div class="question-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="editQuestion(${question.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteQuestion(${question.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="question-content">
                    ${questionContent}
                </div>
            </div>
        `;
    }).join('');
}

function editQuestion(questionId) {
    const question = currentActivity.questions.find(q => q.id === questionId);
    if (!question) return;
    
    // Establecer los valores en el formulario
    document.getElementById('questionId').value = question.id;
    document.getElementById('questionText').value = question.text;
    
    // Cargar los campos específicos según el tipo de actividad
    loadQuestionFields(question.type);
    
    // Establecer los valores específicos según el tipo de actividad
    switch (question.type) {
        case 'multiple-choice':
            // Eliminar las opciones existentes
            const optionsContainer = document.getElementById('optionsContainer');
            optionsContainer.innerHTML = '';
            
            // Agregar las opciones de la pregunta
            question.options.forEach((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, ...
                
                const optionItem = document.createElement('div');
                optionItem.className = 'option-editor-item';
                optionItem.innerHTML = `
                    <div class="option-editor-marker">${optionLetter}</div>
                    <div class="option-editor-input">
                        <input type="text" class="form-control" name="option[]" placeholder="Opción ${optionLetter}" value="${option}" required>
                    </div>
                    <div class="option-editor-correct">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="correctOption" value="${index}" ${index === question.correctOption ? 'checked' : ''}>
                            <label class="form-check-label">Correcta</label>
                        </div>
                    </div>
                    ${index > 1 ? `
                    <div class="option-editor-actions">
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeOption(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    ` : ''}
                `;
                
                optionsContainer.appendChild(optionItem);
            });
            break;
            
        case 'true-false':
            document.querySelector(`input[name="correctAnswer"][value="${question.correctAnswer}"]`).checked = true;
            break;
            
        case 'short-answer':
            document.getElementById('correctAnswer').value = question.correctAnswers.join(';');
            break;
    }
    
    // Cambiar el título del modal
    document.getElementById('questionModalLabel').textContent = 'Editar Pregunta';
    
    // Mostrar el modal
    const questionModal = new bootstrap.Modal(document.getElementById('questionModal'));
    questionModal.show();
}

function deleteQuestion(questionId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
        // Eliminar la pregunta
        currentActivity.questions = currentActivity.questions.filter(q => q.id !== questionId);
        
        // Actualizar la lista de preguntas
        updateQuestionsList();
        
        // Actualizar la vista previa
        updatePreview();
    }
}

function updatePreview() {
    // Actualizar la información básica
    document.getElementById('previewTitle').textContent = document.getElementById('activityTitle').value || 'Título de la Actividad';
    document.getElementById('previewDescription').textContent = document.getElementById('activityDescription').value || 'Descripción de la actividad';
    
    // Actualizar el contenido de la vista previa
    const previewContent = document.getElementById('previewContent');
    
    if (currentActivity.questions.length === 0) {
        previewContent.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-eye fa-3x mb-3"></i>
                <p>Completa la información de la actividad para ver la vista previa</p>
            </div>
        `;
        return;
    }
    
    // Mostrar la primera pregunta como vista previa
    const question = currentActivity.questions[0];
    
    let questionContent = '';
    
    switch (question.type) {
        case 'multiple-choice':
            questionContent = `
                <div class="preview-options">
                    ${question.options.map((option, i) => `
                        <div class="preview-option">
                            <div class="preview-option-marker">${String.fromCharCode(65 + i)}</div>
                            <div class="preview-option-text">${option}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'true-false':
            questionContent = `
                <div class="preview-options">
                    <div class="preview-option">
                        <div class="preview-option-marker">V</div>
                        <div class="preview-option-text">Verdadero</div>
                    </div>
                    <div class="preview-option">
                        <div class="preview-option-marker">F</div>
                        <div class="preview-option-text">Falso</div>
                    </div>
                </div>
            `;
            break;
            
        case 'short-answer':
            questionContent = `
                <div class="preview-short-answer">
                    <input type="text" class="form-control" placeholder="Escribe tu respuesta aquí">
                </div>
            `;
            break;
    }
    
    previewContent.innerHTML = `
        <div class="preview-question">
            <div class="preview-question-header">
                <div class="preview-question-number">1</div>
                <div class="preview-question-text">${question.text}</div>
            </div>
            ${questionContent}
        </div>
        <div class="text-center text-muted">
            <p><small>Vista previa de la primera pregunta (${currentActivity.questions.length} en total)</small></p>
        </div>
    `;
}

function showFullPreview() {
    // Actualizar la información de la actividad
    currentActivity.title = document.getElementById('activityTitle').value;
    currentActivity.description = document.getElementById('activityDescription').value;
    currentActivity.type = document.getElementById('activityType').value;
    
    // Actualizar la configuración
    currentActivity.settings.timeLimit = parseInt(document.getElementById('timeLimit').value) || 0;
    currentActivity.settings.passingScore = parseInt(document.getElementById('passingScore').value) || 60;
    currentActivity.settings.maxAttempts = parseInt(document.getElementById('maxAttempts').value) || 3;
    currentActivity.settings.showFeedback = document.getElementById('showFeedback').checked;
    currentActivity.settings.randomizeQuestions = document.getElementById('randomizeQuestions').checked;
    
    // Verificar si hay preguntas
    if (currentActivity.questions.length === 0) {
        alert('No hay preguntas para mostrar en la vista previa.');
        return;
    }
    
    // En una aplicación real, aquí se abriría una nueva ventana con la vista previa completa
    alert('En una aplicación real, aquí se mostraría una vista previa completa de la actividad con todas las preguntas.');
}

function saveActivity() {
    // Validar la información básica
    const title = document.getElementById('activityTitle').value;
    const description = document.getElementById('activityDescription').value;
    const type = document.getElementById('activityType').value;
    
    if (!title || !description || !type) {
        alert('Por favor, complete todos los campos requeridos en la pestaña de información.');
        document.getElementById('infoTab').click();
        return;
    }
    
    // Validar que haya preguntas
    if (currentActivity.questions.length === 0) {
        alert('Por favor, agregue al menos una pregunta.');
        document.getElementById('questionsTab').click();
        return;
    }
    
    // Actualizar la información de la actividad
    currentActivity.title = title;
    currentActivity.description = description;
    currentActivity.type = type;
    
    // Actualizar la configuración
    currentActivity.settings.timeLimit = parseInt(document.getElementById('timeLimit').value) || 0;
    currentActivity.settings.passingScore = parseInt(document.getElementById('passingScore').value) || 60;
    currentActivity.settings.maxAttempts = parseInt(document.getElementById('maxAttempts').value) || 3;
    currentActivity.settings.showFeedback = document.getElementById('showFeedback').checked;
    currentActivity.settings.randomizeQuestions = document.getElementById('randomizeQuestions').checked;
    
    // En una aplicación real, aquí se enviarían los datos al servidor
    console.log('Actividad guardada:', currentActivity);
    alert('Actividad guardada correctamente (simulación).');
    
    // Redireccionar a la lista de actividades
    // window.location.href = 'activities.html';
}
