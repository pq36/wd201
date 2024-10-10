'use strict';
const { Model, DataTypes } = require('sequelize'); // Corrected to use DataTypes

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: 'userId'
      });
    }

    // Fetch all todos for a specific user
    static getTodos(userId) {
      return this.findAll({
        where: {
          userId: userId // Specify the condition for userId
        }
      });
    }

    // Add a new todo
    static addTodo({ title, dueDate, userId }) {
      return this.create({ title: title, dueDate: dueDate, completed: false, userId });
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
    title: {
      type: DataTypes.STRING, // Use DataTypes instead of Sequelize
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title cannot be empty"
        }
      }
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Due date cannot be empty"
        },
        isDate: {
          msg: "Due date must be a valid date"
        }
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Todo',
  });

  return Todo;
};
