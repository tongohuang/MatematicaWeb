let currentActivity = null;
let currentQuestionIndex = 0;
let userAnswers = [];

function initializeActivity(config) {
    currentActivity = config;
    document.getElementById('activityTitle').textContent = config.title;
    document.getElementById('totalQuestions').textContent = config.questions.length;
    loadQuestion(0);
}

function loadQuestion(index) {
    const question = currentActivity.questions[index];
    document.getElementById('currentQuestion').textContent = index + 1;
    
    const container = document.getElementById('questionContainer');
    
    switch(question.type) {
        case 'multiple-choice':
            container.innerHTML = `
                <div class="question-text">${question.question}</div>
                <div class="options-container">
                    ${question.options.map((option, i) => `
                        <div class="option">
                            <input type="radio" name="answer" value="${i}" id="option${i}">
                            <label for="option${i}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'text-input':
            container.innerHTML = `
                <div class="question-text">${question.question}</div>
                <input type="text" class="form-control" id="textAnswer">
            `;
            break;
    }
}

function checkAnswer() {
    const question = currentActivity.questions[currentQuestionIndex];
    let userAnswer;
    
    switch(question.type) {
        case 'multiple-choice':
            const selected = document.querySelector('input[name="answer"]:checked');
            if (!selected) {
                alert('Por favor selecciona una respuesta');
                return;
            }
            userAnswer = parseInt(selected.value);
            break;
            
        case 'text-input':
            userAnswer = document.getElementById('textAnswer').value.trim();
            if (!userAnswer) {
                alert('Por favor ingresa una respuesta');
                return;
            }
            break;
    }
    
    const isCorrect = userAnswer === question.correctAnswer;
    userAnswers[currentQuestionIndex] = {
        question: currentQuestionIndex,
        userAnswer,
        isCorrect
    };
    
    showFeedback(isCorrect);
}

function showFeedback(isCorrect) {
    const container = document.getElementById('questionContainer');
    container.innerHTML += `
        <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect ? '¡Correcto!' : 'Incorrecto. Intenta de nuevo.'}
        </div>
    `;
    
    document.querySelector('.activity-controls button:first-child').style.display = 'none';
    document.querySelector('.activity-controls button:last-child').style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentActivity.questions.length) {
        loadQuestion(currentQuestionIndex);
        document.querySelector('.activity-controls button:first-child').style.display = 'block';
        document.querySelector('.activity-controls button:last-child').style.display = 'none';
    } else {
        finishActivity();
    }
}

function finishActivity() {
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const total = currentActivity.questions.length;
    const score = (correctAnswers / total) * 100;
    
    document.getElementById('questionContainer').innerHTML = `
        <div class="activity-summary">
            <h3>Actividad Completada</h3>
            <p>Puntuación: ${score}%</p>
            <p>Respuestas correctas: ${correctAnswers} de ${total}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Intentar de nuevo</button>
        </div>
    `;
    
    // Enviar resultados al servidor
    saveActivityResults({
        activityId: currentActivity.id,
        score,
        answers: userAnswers
    });
}

async function saveActivityResults(results) {
    try {
        const response = await fetch('/api/activities/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(results)
        });
        
        if (!response.ok) {
            throw new Error('Error al guardar resultados');
        }
    } catch (error) {
        console.error('Error guardando resultados:', error);
    }
}