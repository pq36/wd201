const { request, response } = require('express');
const express = require('express');
const app = express();
const { Todo } = require("./models");
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json()); // Middleware for parsing JSON bodies
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Simple endpoint to test the API
app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  if (request.accepts('html')) {
    response.render("index", { allTodos });
  } else {
    response.json({ allTodos });
  }
});

// Get all To-Dos
app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll(); // Fetch all To-Dos from the database
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Create a new To-Do
app.post('/todos', async (request, response) => {
  console.log("creating a todo", request.body);
  try {
    const todo = await Todo.create({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false
    });
    return response.redirect('/');
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Update a To-Do's completion status
app.put("/todos/:id", async (request, response) => {
  console.log("Updating completion status of todo with ID:", request.params.id);
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }

    // Update the 'completed' status based on the request body
    const updatedTodo = await todo.update({ completed: request.body.completed });
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Delete a To-Do
app.delete("/todos/:id", async (request, response) => {
  try {
    const rowsDeleted = await Todo.destroy({
      where: { id: request.params.id }
    });
    if (rowsDeleted === 0) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
