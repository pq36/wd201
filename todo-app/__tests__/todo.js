const request = require("supertest");
const db = require("../models/index"); // Corrected to models
const app = require("../app");
let server, agent;

describe("Todo test suite", () => {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true }); // Sync the database
        server = app.listen(3000, () => { });
        agent = request.agent(server);
    });

    afterAll(async () => {
        await db.sequelize.close();
        server.close();
    });

    // Test to create a new To-Do and verify response
    test("responds with JSON at /todos", async () => {
        const response = await agent.post('/todos').send({
            title: 'Buy milk',
            dueDate: new Date().toISOString(),
            completed: false
        });

        expect(response.statusCode).toBe(200);
        expect(response.header["content-type"]).toBe(
            "application/json; charset=utf-8"
        );

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

    // Test to delete a To-Do by ID
    test("Delete a todo by ID", async () => {
        // First create a new To-Do
        const response = await agent.post('/todos').send({
            title: 'Buy eggs',
            dueDate: new Date().toISOString(),
            completed: false
        });

        const parsedResponse = JSON.parse(response.text);
        const todoID = parsedResponse.id;

        // Ensure the To-Do was created
        expect(parsedResponse.title).toBe('Buy eggs');
        expect(parsedResponse.completed).toBe(false);

        // Now delete the To-Do
        const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
        expect(deleteResponse.statusCode).toBe(200);

        const deleteParsedResponse = JSON.parse(deleteResponse.text);
        expect(deleteParsedResponse.message).toBe("Todo deleted successfully");

        // Verify that the To-Do no longer exists by trying to get it again
        const getDeletedTodoResponse = await agent.get(`/todos/${todoID}`).send();
        expect(getDeletedTodoResponse.statusCode).toBe(404);
    });
});
