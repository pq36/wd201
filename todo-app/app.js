const { request, response } = require('express');
const express = require('express');
const app = express();
const { Todo } = require("./models");
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // Fixed middleware invocation

app.post("/", (request, response) => {
  response.send("hello world");
});

app.get("/todos", (request, response) => {
  console.log("todo list");
});

app.post('/todos', async (request, response) => {
  console.log("creating a todo", request.body);
  try {
    const todo = await Todo.create({ title: request.body.title, dueDate: request.body.dueDate, completed: false });
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error); // Use 'error' instead of 'e'
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("we have to update a todo with ID:", request.params.id);
  try {
    const todo = await Todo.findByPk(request.params.id); // Correct method name
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    const updatedTodo = await todo.update({ completed: true }); // Update specific todo
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error); // Use 'error' instead of 'e'
  }
});

app.delete("/todos/:id", async (request, response) => { // Added missing slash
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    await todo.destroy();
    return response.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
