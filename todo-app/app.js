const { request, response } = require('express');
const express = require('express');
const app = express();
const { Todo } = require("./models");
const bodyParser = require('body-parser');
const path=require('path');

app.use(bodyParser.json()); // Middleware for parsing JSON bodies
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

// Simple endpoint to test the API
app.get("/", async(request, response) => {
  const allTodos=await Todo.getTodos();
  if(request.accepts('html')){
    response.render("index",{allTodos});
  }
  else{
    response.json({allTodos})
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
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Mark a To-Do as completed
app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("we have to update a todo with ID:", request.params.id);
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    const updatedTodo = await todo.update({ completed: true });
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Delete a To-Do by ID
app.delete("/todos/:id", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id); // Find the todo by ID
    if (!todo) {
      return response.status(404).json(false); // Return false if the todo doesn't exist
    }
    await todo.destroy(); // Delete the todo
    return response.json(true); // Return true if the deletion was successful
  } catch (error) {
    console.log(error);
    return response.status(500).json(false); // Return false in case of error
  }
});

module.exports = app;
