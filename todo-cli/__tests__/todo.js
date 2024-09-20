/* eslint-disable no-unused-vars */
const todoList = require('../todo');
const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

describe("Todolist Test Suite", () => {
    beforeAll(() => {
        // Clear the existing todos to avoid overlap in tests
        all.length = 0;

        // Add a test todo with today's date
        add({
            title: "Test todo",
            completed: false,
            dueDate: new Date().toLocaleDateString("en-CA"),
        });
    });

    test("Should add new todo", () => {
        const todoItemCount = all.length;
        add({
            title: "New Test Todo",
            completed: false,
            dueDate: new Date().toLocaleDateString("en-CA"),
        });
        expect(all.length).toBe(todoItemCount + 1);
    });

    test("Should mark a todo as complete", () => {
        expect(all[0].completed).toBe(false); // Initial state
        markAsComplete(0);
        expect(all[0].completed).toBe(true); // After marking as complete
    });

    test("Should retrieve overdue items", () => {
        // Add an overdue item with a past date
        add({
            title: "Overdue Todo",
            completed: false,
            dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString("en-CA"),
        });

        const overdueItems = overdue();
        expect(overdueItems.length).toBe(1);
        expect(overdueItems[0].title).toBe("Overdue Todo");
    });

    test("Should retrieve due today items", () => {
        const dueTodayItems = dueToday();
        expect(dueTodayItems.length).toBe(2); // Since two items were added for today
        expect(dueTodayItems[0].title).toBe("Test todo");
    });

    test("Should retrieve due later items", () => {
        // Add a due later item with a future date
        add({
            title: "Future Todo",
            completed: false,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-CA"),
        });

        const dueLaterItems = dueLater();
        expect(dueLaterItems.length).toBe(1);
        expect(dueLaterItems[0].title).toBe("Future Todo");
    });
});
