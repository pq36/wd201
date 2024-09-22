const db = require("./models/index");

const listTodo = async () => {
    try {
        // Fetch all todos from the database
        const todos = await db.Todo.findAll({ order: [["dueDate", "ASC"]] });

        const overdue = [];
        const dueToday = [];
        const dueLater = [];

        const today = new Date().toISOString().slice(0, 10); // Current date in YYYY-MM-DD format

        // Group todos by overdue, due today, and due later
        todos.forEach(todo => {
            const dueDate = todo.dueDate;
            if (dueDate < today) {
                overdue.push(todo);
            } else if (dueDate === today) {
                dueToday.push(todo);
            } else {
                dueLater.push(todo);
            }
        });

        // Print the formatted todo list
        console.log("My Todo-list\n");

        // Overdue todos
        console.log("Overdue");
        overdue.forEach(todo => {
            console.log(formatTodoItem(todo));
        });

        // Due Today todos
        console.log("\nDue Today");
        dueToday.forEach(todo => {
            console.log(formatTodoItem(todo));
        });

        // Due Later todos
        console.log("\nDue Later");
        dueLater.forEach(todo => {
            console.log(formatTodoItem(todo));
        });
    } catch (error) {
        console.error(error);
    }
};

// Helper function to format a todo item
function formatTodoItem(todo) {
    const checkbox = todo.completed ? "[x]" : "[ ]";
    return `${todo.id}. ${checkbox} ${todo.title} ${todo.dueDate}`;
}

// Execute the function to list todos
(async () => {
    await listTodo();
})();
