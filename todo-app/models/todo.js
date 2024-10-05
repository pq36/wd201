'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    // Fetch all todos
    static getTodos() {
      return this.findAll();
    }

    // Add a new todo
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    // Set completion status (true for complete, false for incomplete)
    async setCompletionStatus(isCompleted) {
      this.completed = isCompleted;
      await this.save(); // Save the updated todo to the database
      return this;
    }

    // Legacy mark as completed (optional, could be replaced by setCompletionStatus)
    markAsCompleted() {
      return this.setCompletionStatus(true); // Simply use the new method
    }
  }

  // Initialize the Todo model
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
