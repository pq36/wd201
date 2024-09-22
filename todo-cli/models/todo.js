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

    // Returns tasks that are overdue (dueDate < today), including completed ones
    static async overdue() {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      return await Todo.findAll({
        where: {
          dueDate: {
            [sequelize.Op.lt]: today
          }
        },
        order: [['dueDate', 'ASC']]
      });
    }

    // Returns tasks that are due today, including completed ones
    static async dueToday() {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      return await Todo.findAll({
        where: {
          dueDate: today
        },
        order: [['dueDate', 'ASC']]
      });
    }

    // Returns tasks that are due later (dueDate > today), including completed ones
    static async dueLater() {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      return await Todo.findAll({
        where: {
          dueDate: {
            [sequelize.Op.gt]: today
          }
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
      const checkbox = this.completed ? "[x]" : "[ ]";
      const today = new Date().toISOString().slice(0, 10);

      // For todos due today, no need to show the date
      if (this.dueDate === today) {
        return `${this.id}. ${checkbox} ${this.title}`;
      }

      // For todos due on other dates, show the date
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
