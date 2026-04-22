const API_BASE = "http://localhost:3000/api";

async function registerUser(name, email, password) {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur inscription");
  return data;
}

async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur connexion");

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

async function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const response = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) return null;
  return await response.json();
}

async function getTasks() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur chargement tâches");
  return data;
}

async function addTaskToApi(taskData) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur ajout tâche");
  return data;
}

async function deleteTaskById(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Erreur suppression");
  return data;
}

const authSection = document.getElementById('authSection');
const todoSection = document.getElementById('todoSection');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const priorityInput = document.getElementById('priorityInput');
const dateInput = document.getElementById('dateInput');
const taskList = document.getElementById('taskList');
const userInfo = document.getElementById('userInfo');
const authMessage = document.getElementById('authMessage');

let tasks = [];
let currentFilter = 'all';

initApp();

async function initApp() {
  const user = await getUser();
  if (user) {
    showTodoSection(user);
    loadTasks();
  } else {
    showAuthSection();
  }
}

function showAuthSection() {
  authSection.classList.remove('d-none');
  todoSection.classList.add('d-none');
}

function showTodoSection(user) {
  authSection.classList.add('d-none');
  todoSection.classList.remove('d-none');
  userInfo.textContent = `Bonjour ${user.name}`;
}

async function loadTasks() {
  try {
    tasks = await getTasks();
    renderTasks();
  } catch (error) {
    console.error('Erreur tâches:', error);
  }
}

function renderTasks() {
  taskList.innerHTML = '';
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.done;
    if (currentFilter === 'done') return task.done;
    return true;
  });

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <div class="task-text ${task.done ? 'text-decoration-line-through text-muted' : ''}">${task.text}</div>
        <small class="text-muted">${task.date || 'Sans date'}</small>
      </div>
      <div>
        <span class="badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning text-dark' : 'secondary'}">${task.priority}</span>
        <button class="btn btn-sm btn-success ms-2" onclick="toggleTask('${task.id}')">✓</button>
        <button class="btn btn-sm btn-danger ms-1" onclick="deleteTask('${task.id}')">×</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Événements
registerBtn.addEventListener('click', async () => {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    await registerUser(name, email, password);
    showAlert('Inscription réussie ! Connectez-vous.', 'success');
  } catch (error) {
    showAlert(error.message, 'danger');
  }
});

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const data = await loginUser(email, password);
    showTodoSection(data.user);
    loadTasks();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
});

logoutBtn.addEventListener('click', logout);

addBtn.addEventListener('click', async () => {
  const taskData = {
    text: taskInput.value,
    priority: priorityInput.value,
    date: dateInput.value || ''
  };

  try {
    await addTask(taskData);
    taskInput.value = '';
    dateInput.value = '';
    loadTasks();
  } catch (error) {
    console.error('Erreur ajout:', error);
  }
});

function showAlert(message, type) {
  authMessage.className = `alert alert-${type}`;
  authMessage.textContent = message;
  authMessage.classList.remove('d-none');
  setTimeout(() => authMessage.classList.add('d-none'), 3000);
}

// Fonctions tâches
async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    // Ici tu peux appeler PUT /api/tasks/:id si besoin
    await loadTasks(); // Recharge la liste
  }
}

async function deleteTask(id) {
  try {
    await deleteTask(id);
    loadTasks();
  } catch (error) {
    console.error('Erreur suppression:', error);
  }
}