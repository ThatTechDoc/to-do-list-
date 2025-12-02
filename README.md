# To-Do List App – README
## How to Run the App
1. Clone or download the project folder
2. Open index.html in any modern browser (Chrome, Firefox, Edge, etc.)
3. No build step, no server required – the page connects directly to the online Xano back-end
### Technologies Used
**HTML5** – structure
**CSS3** – styling & light/dark theme
**Vanilla JavaScript (ES6)** – all logic, no frameworks
**Xano API** – cloud database & REST endpoints
**Browser LocalStorage** – remembers dark-mode preference
### Key Features Implemented
1. Full **CRUD** (Create, Read, Update, Delete) tasks via Xano REST API
2. **Required fields**: title, due date & time; optional description
3. **Live validation** – toasts for loading, saving, deleting, errors
4. **Completed tasks** – strikethrough + greyscale + opacity; toggle any time
5. **Overdue tasks** – automatic red left-border; filterable list
6. **Search bar** – instant filter by title or description
7. **Filter dropdown** – All / Pending / Completed / Overdue
8. **Sort by due date** – earliest first, automatically
9. **Due-date alerts**:
* Toast warning 5 minutes before a task is due (runs every minute)
*  Browser alert() popup if a task is already overdue when the page loads
10. **Dark-mode toggle** – persists across reloads
11. **Responsive layout** – works on phones, tablets, desktops
12. **No external frameworks** – 100 % vanilla code, beginner-friendly file structure
