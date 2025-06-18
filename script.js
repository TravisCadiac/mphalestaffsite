// Login Management
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const loginSection = document.getElementById('login-section');
const directorSection = document.getElementById('director-section');
const employeeSection = document.getElementById('employee-section');
const logoutBtn = document.getElementById('logout');
let loginAttempts = 0;
let isLoggedIn = false;
let userRole = null;

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;

    if (username === 'Director123') {
        userRole = 'director';
        isLoggedIn = true;
        loginSection.style.display = 'none';
        directorSection.style.display = 'block';
        employeeSection.style.display = 'none';
        logoutBtn.style.display = 'block';
        loginAttempts = 0;
        loginError.style.display = 'none';
        loginForm.reset();
        renderDirectorTasks();
    } else if (username === 'Mphale123' && loginAttempts < 2) {
        userRole = 'employee';
        isLoggedIn = true;
        loginSection.style.display = 'none';
        directorSection.style.display = 'none';
        employeeSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        loginAttempts = 0;
        loginError.style.display = 'none';
        loginForm.reset();
        renderEmployeeTasks();
    } else {
        loginAttempts++;
        if (loginAttempts >= 2 && username !== 'Director123') {
            loginError.textContent = 'Too many attempts. Please try again later.';
            loginError.style.display = 'block';
            loginForm.querySelector('button').disabled = true;
        } else {
            loginError.textContent = 'Invalid username.';
            loginError.style.display = 'block';
        }
    }
});

logoutBtn.addEventListener('click', () => {
    isLoggedIn = false;
    userRole = null;
    loginSection.style.display = 'block';
    directorSection.style.display = 'none';
    employeeSection.style.display = 'none';
    logoutBtn.style.display = 'none';
    loginForm.querySelector('button').disabled = false;
    loginError.style.display = 'none';
    loginAttempts = 0;
});

// Task Management
const taskForm = document.getElementById('task-form');
const directorTaskTable = document.getElementById('director-task-table').querySelector('tbody');
const employeeTaskTable = document.getElementById('employee-task-table').querySelector('tbody');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderDirectorTasks() {
    directorTaskTable.innerHTML = '';
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.project}</td>
            <td>${task.name}</td>
            <td>${task.assigned}</td>
            <td>${task.deadline}</td>
            <td>${task.pdf ? `<a href="${task.pdf}" download>Download</a>` : 'None'}</td>
            <td>${task.submission ? `<a href="${task.submission}" download>Download</a>` : 'None'}</td>
            <td>${task.comment || 'None'}</td>
            <td><button onclick="deleteTask(${index})">Delete</button></td>
        `;
        directorTaskTable.appendChild(row);
    });
}

function renderEmployeeTasks() {
    employeeTaskTable.innerHTML = '';
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.project}</td>
            <td>${task.name}</td>
            <td>${task.deadline}</td>
            <td>${task.pdf ? `<a href="${task.pdf}" download>Download</a>` : 'None'}</td>
            <td>
                <input type="file" id="submission-${index}" accept=".pdf">
                <input type="text" id="comment-${index}" placeholder="Comment (e.g., Done)">
                <button onclick="submitTask(${index})">Submit</button>
            </td>
        `;
        employeeTaskTable.appendChild(row);
    });
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pdfFile = document.getElementById('task-pdf').files[0];
    const reader = new FileReader();

    const saveTask = (pdfData) => {
        const task = {
            project: document.getElementById('task-project').value,
            name: document.getElementById('task-name').value,
            assigned: document.getElementById('task-assigned').value,
            deadline: document.getElementById('task-deadline').value,
            desc: document.getElementById('task-desc').value,
            pdf: pdfData || null,
            submission: null,
            comment: null
        };
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderDirectorTasks();
        taskForm.reset();
    };

    if (pdfFile) {
        reader.onload = () => saveTask(reader.result);
        reader.readAsDataURL(pdfFile);
    } else {
        saveTask(null);
    }
});

function submitTask(index) {
    const submissionFile = document.getElementById(`submission-${index}`).files[0];
    const comment = document.getElementById(`comment-${index}`).value;
    const reader = new FileReader();

    const saveSubmission = (submissionData) => {
        tasks[index].submission = submissionData || null;
        tasks[index].comment = comment || null;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderEmployeeTasks();
    };

    if (submissionFile) {
        reader.onload = () => saveSubmission(reader.result);
        reader.readAsDataURL(submissionFile);
    } else {
        saveSubmission(null);
    }
}

function deleteTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderDirectorTasks();
}

// Initialize based on login state
if (isLoggedIn) {
    if (userRole === 'director') {
        loginSection.style.display = 'none';
        directorSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        renderDirectorTasks();
    } else if (userRole === 'employee') {
        loginSection.style.display = 'none';
        employeeSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        renderEmployeeTasks();
    }
} else {
    loginSection.style.display = 'block';
    directorSection.style.display = 'none';
    employeeSection.style.display = 'none';
}