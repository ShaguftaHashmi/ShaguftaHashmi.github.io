let portalData = null;
let userScores = {}; // Tracks scores for topics

// DOM Elements
const sidebarMenu = document.getElementById('topicMenu');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Fetch JSON Data
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        portalData = data;
        renderSidebar(portalData.topics);
        if (portalData.topics.length > 0) loadTopic(portalData.topics[0].id);
    })
    .catch(error => console.error("Error loading JSON:", error));

// 1. Render Sidebar Topics
function renderSidebar(topics) {
    sidebarMenu.innerHTML = '';
    topics.forEach(topic => {
        const li = document.createElement('li');
        li.textContent = topic.title;
        li.onclick = () => loadTopic(topic.id);
        li.id = `nav-${topic.id}`;
        sidebarMenu.appendChild(li);
    });
}

// 2. Load Topic Content
function loadTopic(topicId) {
    // Highlight active menu item
    document.querySelectorAll('#topicMenu li').forEach(li => li.classList.remove('active'));
    document.getElementById(`nav-${topicId}`).classList.add('active');

    const topic = portalData.topics.find(t => t.id === topicId);
    if (!topic) return;

    // Populate Notes
    document.getElementById('topicTitle').innerText = topic.title;
    document.getElementById('topicNotes').innerHTML = topic.content;

    // Populate Code & Output
    if (topic.code) {
        document.getElementById('codeSection').style.display = 'block';
        document.getElementById('topicCode').innerText = topic.code;
        document.getElementById('topicOutput').innerText = topic.output || "No output";
    } else {
        document.getElementById('codeSection').style.display = 'none';
    }

    // Populate Quiz
    if (topic.quiz && topic.quiz.length > 0) {
        document.getElementById('quizSection').style.display = 'block';
        renderQuiz(topic.quiz, topicId);
    } else {
        document.getElementById('quizSection').style.display = 'none';
    }

    // Mobile sidebar close
    document.getElementById('sidebar').classList.remove('open');
}

// 3. Render Quiz & Instant Feedback
function renderQuiz(quizArray, topicId) {
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    let score = 0;

    quizArray.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';
        qDiv.innerHTML = `<p><strong>Q${index + 1}:</strong> ${q.question}</p>`;

        q.options.forEach((opt, optIndex) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.innerText = opt;
            btn.onclick = () => {
                // Disable all buttons in this question after answering
                Array.from(qDiv.children).forEach(child => child.disabled = true);
                
                if (optIndex === q.answer) {
                    btn.classList.add('correct');
                    score++;
                } else {
                    btn.classList.add('incorrect');
                    // Highlight correct answer
                    qDiv.children[q.answer + 1].classList.add('correct');
                }
                updateScore(topicId, score, quizArray.length);
            };
            qDiv.appendChild(btn);
        });
        container.appendChild(qDiv);
    });
    document.getElementById('topicScore').innerText = '';
}

// 4. Update Score & Overall Progress
function updateScore(topicId, score, total) {
    userScores[topicId] = true; // Mark topic quiz as attempted
    document.getElementById('topicScore').innerText = `Topic Score: ${score}/${total}`;
    
    // Calculate Overall Progress
    const totalTopics = portalData.topics.filter(t => t.quiz).length;
    const completedTopics = Object.keys(userScores).length;
    const percentage = Math.round((completedTopics / totalTopics) * 100);
    
    document.getElementById('overallProgress').style.width = percentage + '%';
    document.getElementById('progressText').innerText = `${percentage}% Completed`;
}

// 5. Search Across Topics
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredTopics = portalData.topics.filter(t => 
        t.title.toLowerCase().includes(term) || 
        t.content.toLowerCase().includes(term)
    );
    renderSidebar(filteredTopics);
});

// 6. Copy Code Button
document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('topicCode').innerText;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copyCodeBtn');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy', 2000);
    });
});

// 7. Dark/Light Mode
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

// 8. Mobile Menu Toggle
document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// 9. Final Assessment
document.getElementById('finalAssessmentBtn').addEventListener('click', () => {
    document.getElementById('topicTitle').innerText = "Final Python Assessment";
    document.getElementById('topicNotes').innerHTML = "<p>Test everything you have learned!</p>";
    document.getElementById('codeSection').style.display = 'none';
    
    document.querySelectorAll('#topicMenu li').forEach(li => li.classList.remove('active'));
    
    document.getElementById('quizSection').style.display = 'block';
    renderQuiz(portalData.assessment, 'final');
});