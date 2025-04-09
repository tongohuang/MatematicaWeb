// Script para renderizar actividades interactivas
// Este archivo contiene funciones para renderizar actividades y sus preguntas

/**
 * Renderiza una actividad directamente en el contenedor especificado
 * @param {Object} activityData - Datos de la actividad
 * @param {HTMLElement} container - Contenedor donde se mostrará la actividad
 */
function renderActivity(activityData, container) {
    console.log('Renderizando actividad:', activityData.id);

    // Verificar que tengamos datos válidos
    if (!activityData || !container) {
        console.error('Datos de actividad o contenedor no válidos');
        return;
    }

    // Crear el contenedor para la actividad
    container.innerHTML = `
        <div class="activity-content p-4">
            <h3 class="mb-3">${activityData.title || 'Actividad'}</h3>
            <div id="activity-questions-${activityData.id}" class="mb-4"></div>
            <div id="activity-feedback-${activityData.id}" class="alert d-none mb-3"></div>
            <div class="d-flex justify-content-between">
                <button id="activity-check-${activityData.id}" class="btn btn-primary">
                    <i class="fas fa-check-circle me-2"></i> Verificar respuestas
                </button>
                <button id="activity-reset-${activityData.id}" class="btn btn-outline-secondary">
                    <i class="fas fa-redo me-2"></i> Reiniciar
                </button>
            </div>
        </div>
    `;

    // Renderizar las preguntas de la actividad
    const questionsContainer = document.getElementById(`activity-questions-${activityData.id}`);
    if (questionsContainer) {
        // Si no hay preguntas, mostrar un mensaje
        if (!activityData.questions || activityData.questions.length === 0) {
            questionsContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Esta actividad aún no tiene preguntas configuradas.
                </div>
            `;
        } else {
            // Renderizar cada pregunta
            activityData.questions.forEach((question, index) => {
                const questionHtml = renderQuestion(question, index, activityData.id);
                questionsContainer.innerHTML += questionHtml;
            });
        }
    }

    // Configurar eventos para los botones
    setTimeout(() => {
        const checkButton = document.getElementById(`activity-check-${activityData.id}`);
        const resetButton = document.getElementById(`activity-reset-${activityData.id}`);

        if (checkButton) {
            checkButton.addEventListener('click', () => checkActivityAnswers(activityData));
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => resetActivity(activityData, container));
        }
    }, 100);
}

/**
 * Renderiza una pregunta de la actividad
 * @param {Object} question - Datos de la pregunta
 * @param {number} index - Índice de la pregunta
 * @param {string} activityId - ID de la actividad
 * @returns {string} HTML de la pregunta
 */
function renderQuestion(question, index, activityId) {
    const questionNumber = index + 1;
    const questionId = `question-${activityId}-${index}`;

    let questionHtml = `
        <div class="card mb-3 question-card" data-question-index="${index}">
            <div class="card-header bg-light">
                <strong>Pregunta ${questionNumber}</strong>
            </div>
            <div class="card-body">
                <p class="card-text">${question.text || 'Sin texto'}</p>
    `;

    // Renderizar diferentes tipos de preguntas
    const questionType = question.type || 'multiple_choice'; // Usar multiple_choice como tipo por defecto

    switch (questionType) {
        case 'multiple_choice':
            questionHtml += renderMultipleChoiceQuestion(question, questionId);
            break;

        case 'true_false':
            questionHtml += renderTrueFalseQuestion(question, questionId);
            break;

        case 'short_answer':
            questionHtml += renderShortAnswerQuestion(question, questionId);
            break;

        default:
            // Si el tipo no es reconocido, usar multiple_choice como fallback
            console.warn(`Tipo de pregunta no reconocido: ${questionType}. Usando multiple_choice como fallback.`);
            questionHtml += renderMultipleChoiceQuestion(question, questionId);
    }

    questionHtml += `
            </div>
        </div>
    `;

    return questionHtml;
}

/**
 * Renderiza una pregunta de opción múltiple
 * @param {Object} question - Datos de la pregunta
 * @param {string} questionId - ID de la pregunta
 * @returns {string} HTML de la pregunta
 */
function renderMultipleChoiceQuestion(question, questionId) {
    let optionsHtml = '<div class="mt-3">';

    // Asegurarse de que question.options sea un array
    if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        // Crear opciones por defecto si no existen
        question.options = [
            { text: 'Opción 1', value: 0 },
            { text: 'Opción 2', value: 1 },
            { text: 'Opción 3', value: 2 }
        ];
        // Establecer una opción correcta por defecto
        if (question.correctOption === undefined) {
            question.correctOption = 0;
        }
        console.warn('Creando opciones por defecto para la pregunta:', question.text);
    }

    // Renderizar las opciones
    question.options.forEach((option, optionIndex) => {
        const optionId = `${questionId}-option-${optionIndex}`;
        const optionText = option.text || `Opción ${optionIndex + 1}`;
        optionsHtml += `
            <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="${questionId}" id="${optionId}" value="${optionIndex}">
                <label class="form-check-label" for="${optionId}">
                    ${optionText}
                </label>
            </div>
        `;
    });

    optionsHtml += '</div>';
    return optionsHtml;
}

/**
 * Renderiza una pregunta de verdadero/falso
 * @param {Object} question - Datos de la pregunta
 * @param {string} questionId - ID de la pregunta
 * @returns {string} HTML de la pregunta
 */
function renderTrueFalseQuestion(question, questionId) {
    return `
        <div class="mt-3">
            <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="${questionId}" id="${questionId}-true" value="true">
                <label class="form-check-label" for="${questionId}-true">
                    Verdadero
                </label>
            </div>
            <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="${questionId}" id="${questionId}-false" value="false">
                <label class="form-check-label" for="${questionId}-false">
                    Falso
                </label>
            </div>
        </div>
    `;
}

/**
 * Renderiza una pregunta de respuesta corta
 * @param {Object} question - Datos de la pregunta
 * @param {string} questionId - ID de la pregunta
 * @returns {string} HTML de la pregunta
 */
function renderShortAnswerQuestion(question, questionId) {
    return `
        <div class="mt-3">
            <div class="form-group">
                <input type="text" class="form-control" id="${questionId}-input" placeholder="Escribe tu respuesta aquí...">
            </div>
        </div>
    `;
}

/**
 * Verifica las respuestas de la actividad
 * @param {Object} activityData - Datos de la actividad
 */
function checkActivityAnswers(activityData) {
    console.log('Verificando respuestas para actividad:', activityData.id);

    // Verificar que tengamos preguntas
    if (!activityData.questions || activityData.questions.length === 0) {
        showActivityFeedback(activityData.id, 'warning', 'Esta actividad no tiene preguntas configuradas.');
        return;
    }

    let correctAnswers = 0;
    let totalQuestions = activityData.questions.length;

    // Verificar cada pregunta
    activityData.questions.forEach((question, index) => {
        const questionId = `question-${activityData.id}-${index}`;
        let userAnswer = null;
        let isCorrect = false;

        // Obtener la respuesta del usuario según el tipo de pregunta
        switch (question.type) {
            case 'multiple_choice':
                const selectedOption = document.querySelector(`input[name="${questionId}"]:checked`);
                if (selectedOption) {
                    userAnswer = parseInt(selectedOption.value);
                    isCorrect = userAnswer === question.correctOption;
                }
                break;

            case 'true_false':
                const selectedValue = document.querySelector(`input[name="${questionId}"]:checked`);
                if (selectedValue) {
                    userAnswer = selectedValue.value === 'true';
                    isCorrect = userAnswer === question.correctAnswer;
                }
                break;

            case 'short_answer':
                const inputElement = document.getElementById(`${questionId}-input`);
                if (inputElement) {
                    userAnswer = inputElement.value.trim().toLowerCase();
                    // Para respuestas cortas, verificar si la respuesta está en la lista de respuestas correctas
                    if (question.correctAnswers && Array.isArray(question.correctAnswers)) {
                        isCorrect = question.correctAnswers.some(answer =>
                            userAnswer === answer.trim().toLowerCase());
                    }
                }
                break;
        }

        // Marcar la pregunta como correcta o incorrecta
        const questionCard = document.querySelector(`.question-card[data-question-index="${index}"]`);
        if (questionCard) {
            if (userAnswer !== null) {
                if (isCorrect) {
                    questionCard.classList.add('border-success');
                    questionCard.classList.remove('border-danger');
                    correctAnswers++;
                } else {
                    questionCard.classList.add('border-danger');
                    questionCard.classList.remove('border-success');
                }
            } else {
                questionCard.classList.add('border-warning');
                questionCard.classList.remove('border-success', 'border-danger');
            }
        }
    });

    // Mostrar retroalimentación general
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    let feedbackType = 'info';
    let feedbackMessage = '';

    if (correctAnswers === totalQuestions) {
        feedbackType = 'success';
        feedbackMessage = '¡Excelente! Todas las respuestas son correctas.';
    } else if (percentage >= 70) {
        feedbackType = 'success';
        feedbackMessage = `Buen trabajo. Has respondido correctamente ${correctAnswers} de ${totalQuestions} preguntas (${percentage}%).`;
    } else if (percentage >= 40) {
        feedbackType = 'warning';
        feedbackMessage = `Has respondido correctamente ${correctAnswers} de ${totalQuestions} preguntas (${percentage}%). Puedes mejorar.`;
    } else {
        feedbackType = 'danger';
        feedbackMessage = `Has respondido correctamente ${correctAnswers} de ${totalQuestions} preguntas (${percentage}%). Revisa el material nuevamente.`;
    }

    showActivityFeedback(activityData.id, feedbackType, feedbackMessage);
}

/**
 * Muestra retroalimentación para la actividad
 * @param {string} activityId - ID de la actividad
 * @param {string} type - Tipo de retroalimentación (success, warning, danger, info)
 * @param {string} message - Mensaje de retroalimentación
 */
function showActivityFeedback(activityId, type, message) {
    const feedbackElement = document.getElementById(`activity-feedback-${activityId}`);
    if (feedbackElement) {
        feedbackElement.className = `alert alert-${type} mb-3`;
        feedbackElement.innerHTML = message;
        feedbackElement.classList.remove('d-none');
    }
}

/**
 * Reinicia la actividad
 * @param {Object} activityData - Datos de la actividad
 * @param {HTMLElement} container - Contenedor de la actividad
 */
function resetActivity(activityData, container) {
    console.log('Reiniciando actividad:', activityData.id);
    renderActivity(activityData, container);
}
