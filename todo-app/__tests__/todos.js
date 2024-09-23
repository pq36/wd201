const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
let server, agent;

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => { });
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  // Test to create a new To-Do
  test("responds with JSON at /todos", async () => {
    const response = await agent.post('/todos').send({
      title: 'Buy milk',
      dueDate: new Date().toISOString(),
      completed: false
    });

    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe("application/json; charset=utf-8");

    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  // Test to mark a To-Do as completed
  test("Mark a todo as complete", async () => {
    const response = await agent.post('/todos').send({
      title: 'Buy milk',
      dueDate: new Date().toISOString(),
      completed: false
    });

    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;
    expect(parsedResponse.completed).toBe(false);

    const markCompleteResponse = await agent.put(`/todos/${todoID}/markAsCompleted`).send();
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  // Test to fetch all To-Dos
  test("Fetch all todos in the database", async () => {
    const response = await agent.get('/todos').send();
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe("application/json; charset=utf-8");

    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.length).toBeGreaterThan(0); // Expect at least one todo
  });

  // Test to delete a To-Do and verify boolean response
  test("Delete a todo by ID and return true if successful", async () => {
    // First create a new To-Do
    const createResponse = await agent.post('/todos').send({
      title: 'Buy eggs',
      dueDate: new Date().toISOString(),
      completed: false
    });

    const parsedCreateResponse = JSON.parse(createResponse.text);
    const todoID = parsedCreateResponse.id;

    // Now delete the To-Do
    const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
    expect(deleteResponse.statusCode).toBe(200);

    const deleteParsedResponse = JSON.parse(deleteResponse.text);
    expect(deleteParsedResponse).toBe(true); // Check if the response is true

    // Try to delete the same To-Do again, should return false
    const deleteAgainResponse = await agent.delete(`/todos/${todoID}`).send();
    expect(deleteAgainResponse.statusCode).toBe(404);
    const deleteAgainParsedResponse = JSON.parse(deleteAgainResponse.text);
    expect(deleteAgainParsedResponse).toBe(false); // Check if the response is false
  });
});
