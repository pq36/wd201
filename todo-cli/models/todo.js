'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Todo extends Model {
        // Adds a new task
        static async addTask(params) {
            return await Todo.create(params);
        }

        // Shows the full todo list grouped by Overdue, Due Today, and Due Later
        static async showList() {
            console.log("My Todo-list\n");

            // Overdue items
            console.log("Overdue");
            const overdueItems = await Todo.overdue();
            overdueItems.forEach(item => console.log(item.displayableString()));
            console.log("\n");

            // Due today items
            console.log("Due Today");
            const todayItems = await Todo.dueToday();
            todayItems.forEach(item => console.log(item.displayableString()));
            console.log("\n");

            // Due later items
            console.log("Due Later");
            const laterItems = await Todo.dueLater();
            laterItems.forEach(item => console.log(item.displayableString()));
        }

        // Returns tasks that are overdue (dueDate < today)
        static async overdue() {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            return await Todo.findAll({
                where: {
                    dueDate: {
                        [sequelize.Op.lt]: today
                    },
                    completed: false // Optionally, show only incomplete items
                },
                order: [['dueDate', 'ASC']]
            });
        }

        // Returns tasks that are due today (dueDate == today)
        static async dueToday() {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            return await Todo.findAll({
                where: {
                    dueDate: today,
                    completed: false
                },
                order: [['dueDate', 'ASC']]
            });
        }

        // Returns tasks that are due later (dueDate > today)
        static async dueLater() {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            return await Todo.findAll({
                where: {
                    dueDate: {
                        [sequelize.Op.gt]: today
                    },
                    completed: false
                },
                order: [['dueDate', 'ASC']]
            });
        }

        // Marks a task as complete by ID
        static async markAsComplete(id) {
            const todo = await Todo.findByPk(id);
            if (todo) {
                todo.completed = true;
                await todo.save();
            }
        }

        // Formats the todo item as a string for display
        displayableString() {
            let checkbox = this.completed ? "[x]" : "[ ]";
            return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
        }
    }

    // Model initialization
    Todo.init({
        title: DataTypes.STRING,
        dueDate: DataTypes.DATEONLY,
        completed: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Todo',
    });

    return Todo;
};
