'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    // Add a new task
    static async addTask(params) {
      return await Todo.create(params);
    }

    // Show the todo list with grouping: Overdue, Due Today, and Due Later
    static async showList() {
      console.log("My Todo-list\n");

      // Show overdue items
      console.log("Overdue");
      const overdueItems = await Todo.overdue();
      overdueItems.forEach(item => console.log(item.displayableString()));
      console.log("\n");

      // Show today's items
      console.log("Due Today");
      const todayItems = await Todo.dueToday();
      todayItems.forEach(item => console.log(item.displayableString()));
      console.log("\n");

      // Show due later items
      console.log("Due Later");
      const laterItems = await Todo.dueLater();
      laterItems.forEach(item => console.log(item.displayableString()));
    }

    // Return tasks that are overdue
    static async overdue() {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
      return await Todo.findAll({
        where: {
          dueDate: {
            [sequelize.Op.lt]: today,
          },
        },
        order: [['dueDate', 'ASC']],
      });
    }

    // Return tasks due today
    static async dueToday() {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
      return await Todo.findAll({
        where: {
          dueDate: today,
        },
        order: [['dueDate', 'ASC']],
      });
    }

    // Return tasks that are due later
    static async dueLater() {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
      return await Todo.findAll({
        where: {
          dueDate: {
            [sequelize.Op.gt]: today,
          },
        },
        order: [['dueDate', 'ASC']],
      });
    }

    // Mark a task as complete
    static async markAsComplete(id) {
      const todo = await Todo.findByPk(id);
      if (todo) {
        todo.completed = true;
        await todo.save();
      }
    }

    // Format task display based on completion status and due date
    displayableString() {
      const checkbox = this.completed ? "[x]" : "[ ]";
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

      // If due today, omit the date
      if (this.dueDate === today) {
        return `${this.id}. ${checkbox} ${this.title}`;
      }

      // Otherwise, include the due date
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }

  // Define the Todo model
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
