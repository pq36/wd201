'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Todo extends Model {
        static async addTask(params) {
            return await Todo.create(params);
        }

        static async showList() {
            console.log("My Todo list \n");

            console.log("Overdue");
            const overdueTodos = await Todo.overdue();
            overdueTodos.forEach(todo => {
                console.log(todo.displayableString());
            });
            console.log("\n");

            console.log("Due Today");
            const todayTodos = await Todo.dueToday();
            todayTodos.forEach(todo => {
                console.log(todo.displayableString());
            });
            console.log("\n");

            console.log("Due Later");
            const laterTodos = await Todo.dueLater();
            laterTodos.forEach(todo => {
                console.log(todo.displayableString());
            });
        }

        static async overdue() {
            return await Todo.findAll({
                where: {
                    dueDate: { [Op.lt]: new Date() } // Due date is before today
                },
                order: [['dueDate', 'ASC']],
            });
        }

        static async dueToday() {
            const today = new Date().toISOString().split('T')[0]; // Get today's date
            return await Todo.findAll({
                where: {
                    dueDate: today, // Tasks due today
                },
                order: [['dueDate', 'ASC']],
            });
        }

        static async dueLater() {
            return await Todo.findAll({
                where: {
                    dueDate: { [Op.gt]: new Date() } // Due date is after today
                },
                order: [['dueDate', 'ASC']],
            });
        }

        static async markAsComplete(id) {
            const todo = await Todo.findByPk(id); // Find task by primary key (id)
            if (todo) {
                todo.completed = true;  // Mark the task as complete
                await todo.save();      // Save the updated task
            }
        }

        displayableString() {
            const checkbox = this.completed ? "[x]" : "[ ]";
            const today = new Date().toISOString().split('T')[0]; // Get today's date

            // If due today, don't show the due date
            if (this.dueDate === today) {
                return `${this.id}. ${checkbox} ${this.title}`;
            }

            // Otherwise, show the due date
            return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
        }
    }

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
