const useConnection = require('../database');

// Get the list of all todos
async function getTodoList(ctx) {
    try {
        const connection = await useConnection();
        const sql = `
            SELECT 
                t.id AS id,
                t.title,
                t.completed,
                t.order,
                tg.id AS tag_id,
                tg.title AS tag_title
            FROM todos t
            LEFT JOIN todos_tags tt ON t.id = tt.todo_id
            LEFT JOIN tags tg ON tt.tag_id = tg.id;
        `;

        const [results] = await connection.query(sql);

        const todos = [];
        const todoMap = {};

        results.forEach(row => {
            if (!todoMap[row.id]) {
                todoMap[row.id] = {
                    id: row.id.toString(),
                    title: row.title,
                    completed: row.completed === 1,
                    url: `http://${ctx.host}/todos/${row.id}`,
                    order: row.order,
                    tags: [],
                };
                todos.push(todoMap[row.id]);
            }

            if (row.tag_id) {
                todoMap[row.id].tags.push({
                    id: row.tag_id.toString(),
                    title: row.tag_title,
                    url: `http://${ctx.host}/tags/${row.tag_id}`,
                });
            }
        });

        ctx.status = 200;
        ctx.body = todos;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to retrieve todos' };
    }
}

// Create a new todo
async function createTodo(ctx) {
    const { title, completed = false, order = 0 } = ctx.request.body;

    if (!title) {
        ctx.status = 400;
        ctx.body = { error: "Todo title is required" };
        return;
    }

    try {
        const sql = 'INSERT INTO todos (title, completed, `order`) VALUES (?, ?, ?)';
        const values = [title, completed, order];

        const connection = await useConnection();
        const [results] = await connection.execute(sql, values);
        const id = results.insertId.toString();

        const newTodo = {
            id,
            title,
            completed,
            url: `http://${ctx.host}/todos/${id}`,
            order,
        };

        ctx.status = 201;
        ctx.body = newTodo;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to create todo' };
    }
}

// Delete all todos
async function deleteAllTodos(ctx) {
    try {
        const connection = await useConnection();
        const sql = 'DELETE FROM todos;';
        await connection.query(sql);
        ctx.status = 204;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to delete todos' };
    }
}

// Get one todo by ID
async function getTodo(ctx) {
    const todoId = ctx.params.id;

    try {
        const connection = await useConnection();
        const sql = `
            SELECT 
                t.id AS id,
                t.title,
                t.completed,
                t.order,
                tg.id AS tag_id,
                tg.title AS tag_title
            FROM todos t
            LEFT JOIN todos_tags tt ON t.id = tt.todo_id
            LEFT JOIN tags tg ON tt.tag_id = tg.id       
            WHERE t.id = ?;
        `;

        const [results] = await connection.execute(sql, [todoId]);

        if (results.length === 0) {
            ctx.status = 404;
            ctx.body = { error: `Todo with ID ${todoId} not found` };
            return;
        }

        const todo = {
            id: results[0].id.toString(),
            title: results[0].title,
            completed: results[0].completed === 1,
            url: `http://${ctx.host}/todos/${results[0].id}`,
            order: results[0].order,
            tags: results.filter(row => row.tag_id).map(row => ({
                id: row.tag_id.toString(),
                title: row.tag_title,
                url: `http://${ctx.host}/tags/${row.tag_id}`,
            })),
        };

        ctx.status = 200;
        ctx.body = todo;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to retrieve todo' };
    }
}

// Delete one todo by ID
async function deleteTodo(ctx) {
    const todoId = ctx.params.id;

    try {
        const connection = await useConnection();
        const sql = 'DELETE FROM todos WHERE id = ?;';

        const [results] = await connection.execute(sql, [todoId]);

        if (results.affectedRows === 0) {
            ctx.status = 404;
            ctx.body = { error: `Todo with ID ${todoId} not found` };
            return;
        }

        ctx.status = 204;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to delete todo' };
    }
}

// Update an existing todo by ID
async function updateTodo(ctx) {
    const todoId = ctx.params.id;
    const { title, completed, order } = ctx.request.body;

    try {
        const connection = await useConnection();
        const checkTodoSql = 'SELECT * FROM todos WHERE id = ?;';
        const [todoResults] = await connection.execute(checkTodoSql, [todoId]);

        if (todoResults.length === 0) {
            ctx.status = 404;
            ctx.body = { error: `Todo with ID ${todoId} not found` };
            return;
        }

        const currentTodo = todoResults[0];
        const updatedTitle = title !== undefined ? title : currentTodo.title;
        const updatedCompleted = completed !== undefined ? completed : currentTodo.completed;
        const updatedOrder = order !== undefined ? order : currentTodo.order;

        const updateTodoSql = `
            UPDATE todos 
            SET title = ?, completed = ?, \`order\` = ? 
            WHERE id = ?;
        `;

        await connection.execute(updateTodoSql, [updatedTitle, updatedCompleted, updatedOrder, todoId]);

        const updatedTodo = {
            id: todoId.toString(),
            title: updatedTitle,
            completed: !!updatedCompleted,
            url: `http://${ctx.host}/todos/${todoId}`,
            order: updatedOrder,
        };

        ctx.status = 200;
        ctx.body = updatedTodo;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to update todo' };
    }
}

// Get the list of tags associated with a todo
async function getTagListOfTodo(ctx) {
    const todoId = ctx.params.id;

    try {
        const connection = await useConnection();
        const sql = `
            SELECT tag.id, tag.title
            FROM tags tag
            JOIN todos_tags tt ON tag.id = tt.tag_id
            WHERE tt.todo_id = ?;
        `;

        const [tags] = await connection.execute(sql, [todoId]);

        ctx.status = 200;
        ctx.body = tags.map(tag => ({
            id: tag.id.toString(),
            title: tag.title,
            url: `http://${ctx.host}/tags/${tag.id}`,
        }));
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to retrieve tags for todo' };
    }
}

// Associate a tag with a todo
async function setTagOfTodo(ctx) {
    const todoId = ctx.params.id;
    const { id: tagId } = ctx.request.body;

    if (!tagId) {
        ctx.throw(400, { error: '"id" is a required field in the request body' });
        return;
    }

    try {
        const connection = await useConnection();
        const associateSql = 'INSERT INTO todos_tags (todo_id, tag_id) VALUES (?, ?);';
        await connection.execute(associateSql, [todoId, tagId]);

        ctx.status = 200;
        ctx.body = { id: tagId.toString(), url: `http://${ctx.host}/tags/${tagId}`};
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to associate tag with todo' };
    }
}

// Delete all tags associated with a todo
async function deleteAllTagsFromTodo(ctx) {
    const todoId = ctx.params.id;

    try {
        const connection = await useConnection();
        const deleteTagsSql = 'DELETE FROM todos_tags WHERE todo_id = ?;';
        await connection.execute(deleteTagsSql, [todoId]);

        ctx.status = 204;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to delete tags from todo' };
    }
}

// Remove a tag from a todo
async function deleteTagFromTodo(ctx) {
    const todoId = ctx.params.id;
    const tagId = ctx.params.tag_id;

    try {
        const connection = await useConnection();
        const deleteTagSql = 'DELETE FROM todos_tags WHERE todo_id = ? AND tag_id = ?;';
        await connection.execute(deleteTagSql, [todoId, tagId]);

        ctx.status = 204;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to remove tag from todo' };
    }
}

module.exports = {
    getTodoList,
    createTodo,
    deleteAllTodos,
    getTodo,
    deleteTodo,
    updateTodo,
    getTagListOfTodo,
    setTagOfTodo,
    deleteAllTagsFromTodo,
    deleteTagFromTodo
}
