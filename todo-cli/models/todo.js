// models/todo.js
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Todo extends Model {
        static async overdue() {
            return await Todo.findAll({
                where: {
                    dueDate: { [Op.lt]: new Date() },
                },
                order: [['dueDate', 'ASC']],
            });
        }

        static async dueToday() {
            const today = new Date();
            return await Todo.findAll({
                where: {
                    dueDate: today.toISOString().split('T')[0], // Comparing only the date part
                },
                order: [['dueDate', 'ASC']],
            });
        }

        static async dueLater() {
            return await Todo.findAll({
                where: {
                    dueDate: { [Op.gt]: new Date() },
                },
                order: [['dueDate', 'ASC']],
            });
        }

        static async markAsComplete(id) {
            const todo = await Todo.findByPk(id);
            if (todo) {
                todo.completed = true;
                await todo.save();
            }
        }

        displayableString() {
            const checkbox = this.completed ? '[x]' : '[ ]';
            const dueDateStr = this.dueDate === new Date().toISOString().split('T')[0] ? '' : this.dueDate;
            return `${this.id}. ${checkbox} ${this.title} ${dueDateStr}`.trim();
        }

        static async showList() {
            console.log("My Todo-list\n");

            console.log("Overdue");
            const overdueTodos = await this.overdue();
            overdueTodos.forEach(todo => console.log(todo.displayableString()));
            console.log("\n");

            console.log("Due Today");
            const dueTodayTodos = await this.dueToday();
            dueTodayTodos.forEach(todo => console.log(todo.displayableString()));
            console.log("\n");

            console.log("Due Later");
            const dueLaterTodos = await this.dueLater();
            dueLaterTodos.forEach(todo => console.log(todo.displayableString()));
        }
    }

    Todo.init({
        title: DataTypes.STRING,
        dueDate: DataTypes.DATEONLY,
        completed: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Todo',
    });

    return Todo;
};
