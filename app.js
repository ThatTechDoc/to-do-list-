// API Configuration
const API_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:3GfcDNxW';

// State management
let todos = [];
let editingId = null;
let deletingId = null;

// DOM elements
const todoForm = document.getElementById('todoForm');
const todoList = document.getElementById('todoList');
const loading = document.getElementById('loading');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const confirmModal = document.getElementById('confirmModal');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
    checkTheme();
    checkOverdueTasks();
    setInterval(checkOverdueTasks, 60000); // Check every minute
});

// call it once after first load
document.addEventListener('DOMContentLoaded', async () => {
  await loadTodos(); 
  alertIfAlreadyOverdue(); 
  setupEventListeners();
  checkTheme();
  setInterval(checkOverdueTasks, 60000);
});

// Event listeners
function setupEventListeners() {
    todoForm.addEventListener('submit', handleCreateTodo);
    editForm.addEventListener('submit', handleUpdateTodo);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
    document.getElementById('cancelDelete').addEventListener('click', closeConfirmModal);
    searchInput.addEventListener('input', handleSearch);
    filterSelect.addEventListener('change', handleFilter);
    themeToggle.addEventListener('click', toggleTheme);
}

// API functions
async function fetchTodos() {
    try {
        const response = await fetch(`${API_BASE_URL}/todo`);
        if (!response.ok) throw new Error('Failed to fetch todos');
        return await response.json();
    } catch (error) {
        console.error('Error fetching todos:', error);
        showToast('Error loading tasks', 'error');
        return [];
    }
}

async function createTodo(todo) {
    try {
        const response = await fetch(`${API_BASE_URL}/todo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todo)
        });
        if (!response.ok) throw new Error('Failed to create todo');
        return await response.json();
    } catch (error) {
        console.error('Error creating todo:', error);
        throw error;
    }
}

async function updateTodo(id, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/todo/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update todo');
        return await response.json();
    } catch (error) {
        console.error('Error updating todo:', error);
        throw error;
    }
}

async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/todo/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete todo');
        return true;
    } catch (error) {
        console.error('Error deleting todo:', error);
        throw error;
    }
}

//.checked

// CRUD operations
async function loadTodos() {
    loading.style.display = 'block';
    todoList.style.display = 'none';
    
    todos = await fetchTodos();
    renderTodos();
    
    loading.style.display = 'none';
    todoList.style.display = 'grid';
}

async function handleCreateTodo(e) {
    e.preventDefault();
    
    const todo = {
        title: document.getElementById('titleInput').value,
        description: document.getElementById('descriptionInput').value,
        due_date: document.getElementById('dateInput').value,
        due_time: document.getElementById('timeInput').value,
        completed: false
    }; console.log (todo.due_date, todo.due)
    
    try {
        showToast('Creating task...', 'loading');
        await createTodo(todo);
        showToast('Task created successfully!', 'success');
        todoForm.reset();
        loadTodos();
    } catch (error) {
        showToast('Error creating task', 'error');
    }
}

function openEditModal(todo) {
    editingId = todo.id;
    document.getElementById('editTitle').value = todo.title;
    document.getElementById('editDescription').value = todo.description || '';
    document.getElementById('editDate').value = new Date(todo.due_date);
    document.getElementById('editTime').value = todo.due_time;
    editModal.style.display = 'block';
}

function closeEditModal() {
    editModal.style.display = 'none';
    editingId = null;
}

async function handleUpdateTodo(e) {
    e.preventDefault();
    
    const updates = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        due_date: document.getElementById('editDate').value,
        due_time: document.getElementById('editTime').value
    };
    
    try {
        showToast('Updating task...', 'loading');
        await updateTodo(editingId, updates);
        showToast('Task updated successfully!', 'success');
        closeEditModal();
        loadTodos();
    } catch (error) {
        showToast('Error updating task', 'error');
    }
}

function openConfirmModal(id) {
    deletingId = id;
    confirmModal.style.display = 'block';
}

function closeConfirmModal() {
    confirmModal.style.display = 'none';
    deletingId = null;
}

async function confirmDelete() {
    try {
        showToast('Deleting task...', 'loading');
        await deleteTodo(deletingId);
        showToast('Task deleted successfully!', 'success');
        closeConfirmModal();
        loadTodos();
    } catch (error) {
        showToast('Error deleting task', 'error');
    }
}

async function toggleComplete(id) {
  const task = todos.find(t => t.id === id);
  if (!task) return;

  const updates = {
    title: task.title,
    description: task.description || '',
    due_date: task.due_date,
    due_time: task.due_time,
    is_completed: !task.completed 
  };

  try {
    showToast('Updating task...', 'loading');
    await updateTodo(id, updates);
    showToast('Task updated!', 'success');
    loadTodos();
  } catch (err) {
    showToast('Error updating task', 'error');
  }
}

// Rendering
function renderTodos() {
    const searchTerm = searchInput.value.toLowerCase();
    const filter = filterSelect.value;
    
    let filteredTodos = todos.filter(todo => {
        const matchesSearch = todo.title.toLowerCase().includes(searchTerm) || (todo.description && todo.description.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
        
        switch (filter) {
            case 'completed':
                return todo.is_completed;
            case 'pending':
                return !todo.is_completed;
            case 'overdue':
                return isOverdue(todo) && !todo.is_completed;
            default:
                return true;
        }
    });
    
    // Sort by due date
    filteredTodos.sort((a, b) => {
        const dateA = new Date(`${a.due_date} ${a.due_time}`);
        const dateB = new Date(`${b.due_date} ${b.due_time}`);
        return dateA - dateB;
    });
    
    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="loading">No tasks found</div>';
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = 'todo-item';
    
    if (todo.is_completed) div.classList.add('completed');
    if (isOverdue(todo) && !todo.is_completed) div.classList.add('overdue');

    console.log('Task:', todo.title, 'completed=', todo.is_completed, 'classes=', div.className);
    
    const dueDateTime = new Date(todo.due_date);
    const dateStr = isNaN(dueDateTime) ? 'No due date' : dueDateTime.toLocaleDateString('en-GB');
    const timeStr = todo.due_time || '';

    //const dueDateTime = new Date(todo.due_date).toLocaleDateString("en-GB");
    const time = todo.due_time
    
    div.innerHTML = `
        <div class="todo-content">
            <div class="todo-title">${escapeHtml(todo.title)}</div>
            ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
            <div class="todo-due">Due: ${dateStr} ${timeStr}</div>
        </div>
        <div class="todo-actions">
            <button class="btn btn-small ${todo.is_completed ? 'btn-secondary' : 'btn-primary'}" 
                    onclick="toggleComplete(${todo.id})">
                ${todo.is_completed ? '✓' : '○'}
            </button>
            <button class="btn btn-small btn-secondary" onclick="openEditModal(${JSON.stringify(todo).replace(/"/g, '&quot;')})">
                Edit
            </button>
            <button class="btn btn-small btn-danger" onclick="openConfirmModal(${todo.id})">
                Delete
            </button>
        </div>
    `;
    
    return div;
}

// Utility functions
function isOverdue(todo) {
    if (todo.is_completed) return false;
    const now = new Date();
    const due = new Date(todo.due_date);
    return !isNaN(due) && now > due;
}

function formatDateTime(date, time) {
    const dateObj = new Date(`${date} ${time}`);
    const options = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return dateObj.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleSearch() {
    renderTodos();
}

function handleFilter() {
    renderTodos();
}

// Theme management
function checkTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('themeIcon');
     icon.src = savedTheme === 'dark' ? 'assets/theme-light-dark.svg' : 'assets/theme-dark.svg';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
     const icon = document.getElementById('themeIcon');
    icon.src = newTheme === 'dark' ? 'assets/theme-light-dark.svg' : 'assets/theme-dark.svg';
}

// Notifications
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.style.backgroundColor = type === 'error' ? 'var(--danger-color)' : type === 'loading' ? 'var(--warning-color)' : 'var(--primary-color)';
    toast.style.display = 'block';
    
    if (type !== 'loading') {
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

function checkOverdueTasks() {
  todos.forEach(todo => {
    if (todo.is_completed) return; 

    const due = new Date(todo.due_date); // timestamp → Date object
    const minsLeft = (due - Date.now()) / 1000 / 60; // minutes until due

    if (minsLeft > 0 && minsLeft <= 5 * 60 * 1000) {
      showToast(`Task "${todo.title}" is due in ${Math.round(minsLeft)} minutes!`, 'warning');
    }
  });
}

//  ON-LOAD: alert if ALREADY overdue
function alertIfAlreadyOverdue() {
  todos.forEach(todo => {
    if (todo.is_completed) return;               

    const due = new Date(todo.due_date);
    if (isNaN(due)) return;  

    const minsLate = (Date.now() - due) / 1000 / 60;

    if (minsLate > 0) {
      alert(`Task "${todo.title}" is already ${Math.round(minsLate)} minutes overdue!`);
    }
  });
}
