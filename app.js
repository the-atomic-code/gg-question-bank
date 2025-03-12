// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const lessonListView = document.getElementById('lesson-list');
    const lessonDetailView = document.getElementById('lesson-detail');
    const lessonsTable = document.getElementById('lessons-table');
    const lessonsBody = document.getElementById('lessons-body');
    const backButton = document.getElementById('back-button');
    const lessonTitle = document.getElementById('lesson-title');
    const lessonId = document.getElementById('lesson-id');
    const lessonStandard = document.getElementById('lesson-standard');
    const lessonQuestionsCount = document.getElementById('lesson-questions-count');
    const prevQuestionBtn = document.getElementById('prev-question');
    const nextQuestionBtn = document.getElementById('next-question');
    const questionCounter = document.getElementById('question-counter');
    const questionContainer = document.getElementById('question-container');
    
    // Application state
    let lessons = [];
    let currentLesson = null;
    let currentQuestionIndex = 0;
    
    // Initialize the application
    init();
    
    function init() {
        loadLessons();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Back button event
        backButton.addEventListener('click', showLessonList);
        
        // Navigation buttons
        prevQuestionBtn.addEventListener('click', showPreviousQuestion);
        nextQuestionBtn.addEventListener('click', showNextQuestion);
    }
    
    // Load lessons from index.json
    async function loadLessons() {
        try {
            const response = await fetch('index.json');
            if (!response.ok) {
                throw new Error('Failed to load lessons index');
            }
            
            lessons = await response.json();
            renderLessonsList();
        } catch (error) {
            console.error('Error loading lessons:', error);
            document.querySelector('.loading').textContent = 'Error loading lessons. Please try again later.';
        }
    }
    
    // Render the lessons list table
    function renderLessonsList() {
        // Remove loading message
        document.querySelector('.loading').classList.add('hidden');
        
        // Clear any existing lessons
        lessonsBody.innerHTML = '';
        
        // Add each lesson to the table
        lessons.forEach(lesson => {
            const row = document.createElement('tr');
            row.dataset.lessonId = lesson.id;
            
            row.innerHTML = `
                <td>${lesson.id}</td>
                <td>${lesson.title}</td>
                <td>${lesson.standard}</td>
                <td>${lesson.n_recall}</td>
                <td>${lesson.n_application}</td>
                <td>${lesson.n_analysis}</td>
                <td>${lesson.n_total}</td>
            `;
            
            // Add click event to load lesson details
            row.addEventListener('click', () => loadLessonDetail(lesson.id));
            
            lessonsBody.appendChild(row);
        });
    }
    
    // Load lesson detail
    async function loadLessonDetail(lessonId) {
        try {
            // Show loading in question container
            questionContainer.innerHTML = '<div class="loading">Loading lesson...</div>';
            
            // Fetch the lesson JSON from the content folder
            const response = await fetch(`content/${lessonId}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load lesson: ${lessonId}`);
            }
            
            currentLesson = await response.json();
            currentQuestionIndex = 0;
            
            // Display the lesson details view
            showLessonDetail();
            
            // Display the first question
            displayQuestion();
        } catch (error) {
            console.error('Error loading lesson:', error);
            questionContainer.innerHTML = '<div class="loading">Error loading lesson. Please try again later.</div>';
        }
    }
    
    // Display current question
    function displayQuestion() {
        if (!currentLesson || !currentLesson.questions || currentLesson.questions.length === 0) {
            questionContainer.innerHTML = '<p>No questions available for this lesson.</p>';
            return;
        }
        
        const question = currentLesson.questions[currentQuestionIndex];
        
        // Update question counter
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${currentLesson.questions.length}`;
        
        // Enable/disable navigation buttons
        prevQuestionBtn.disabled = currentQuestionIndex === 0;
        nextQuestionBtn.disabled = currentQuestionIndex === currentLesson.questions.length - 1;
        
        // Create question HTML
        const questionHTML = createQuestionHTML(question);
        questionContainer.innerHTML = questionHTML;
    }
    
    // Create HTML for a question
    function createQuestionHTML(question) {
        const options = question.question.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D, etc.
            const isCorrect = option.isCorrect === 1;
            
            // Check if option has an image
            const optionImage = option.image ? 
                `<div class="option-image">
                    <img src="content/images/${option.image}" alt="Option ${letter} image">
                </div>` : '';
            
            return `
                <li class="option ${isCorrect ? 'correct' : ''}">
                    <strong>${letter}.</strong> ${option.text}
                    ${optionImage}
                    <div class="explanation">
                        <strong>Explanation:</strong> ${option.explanation}
                    </div>
                </li>
            `;
        }).join('');
        
        // Check if question has an image
        const questionImage = question.question.image ? 
            `<div class="question-image">
                <img src="content/images/${question.question.image}" alt="Question image">
            </div>` : '';
        
        return `
            <div class="question">
                <div class="cognitive-level">
                    Cognitive Level: ${question.cognitive_level}
                </div>
                <div class="blueprint">
                    <strong>Blueprint:</strong> ${question.blueprint}
                </div>
                <div class="question-text">${question.question.text}</div>
                ${questionImage}
                <ul class="options">
                    ${options}
                </ul>
                <div class="fun-fact">
                    <strong>Fun Fact:</strong> ${question.question.funFact || ''}
                </div>
            </div>
        `;
    }
    
    // Show the lesson list view
    function showLessonList() {
        lessonDetailView.classList.add('hidden');
        lessonListView.classList.remove('hidden');
    }
    
    // Show the lesson detail view
    function showLessonDetail() {
        lessonListView.classList.add('hidden');
        lessonDetailView.classList.remove('hidden');
        
        // Update lesson info
        lessonTitle.textContent = currentLesson.title;
        lessonId.textContent = currentLesson.id;
        lessonStandard.textContent = currentLesson.standard;
        lessonQuestionsCount.textContent = `${currentLesson.n_total} (Recall: ${currentLesson.n_recall}, Application: ${currentLesson.n_application}, Analysis: ${currentLesson.n_analysis})`;
    }
    
    // Show previous question
    function showPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    }
    
    // Show next question
    function showNextQuestion() {
        if (currentQuestionIndex < currentLesson.questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        }
    }
});
