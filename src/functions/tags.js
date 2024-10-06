const useConnection = require('../database');

// Get the list of all tags
async function getTagList(ctx) {
    try {
        const connection = await useConnection();
        const sql = 'SELECT id, title FROM tags;';
        const [results] = await connection.query(sql);

        const tags = results.map(tag => ({
            id: tag.id.toString(),
            title: tag.title,
            url: `http://${ctx.host}/tags/${tag.id}`,
        }));

        ctx.status = 200;
        ctx.body = tags;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to retrieve tags' };
    }
}

// Create a new tag
async function createTag(ctx) {
    const { title } = ctx.request.body;

    if (!title) {
        ctx.status = 400;
        ctx.body = { error: "Tag title is required" };
        return;
    }

    try {
        const connection = await useConnection();
        const sql = 'INSERT INTO tags (title) VALUES (?);';
        const [results] = await connection.execute(sql, [title]);

        const newTag = {
            id: results.insertId.toString(),
            title,
            url: `http://${ctx.host}/tags/${results.insertId}`,
        };

        ctx.status = 201;
        ctx.body = newTag;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to create tag' };
    }
}

// Delete all tags
async function deleteAllTags(ctx) {
    try {
        const connection = await useConnection();
        const sql = 'DELETE FROM tags;';
        await connection.query(sql);

        ctx.status = 204;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to delete all tags' };
    }
}

// Get a single tag by ID
async function getTag(ctx) {
    const tagId = ctx.params.id;

    try {
        const connection = await useConnection();
        const sql = `
            SELECT 
                tg.id AS tag_id,
                tg.title AS tag_title,
                t.id AS todo_id,
                t.title AS todo_title,
                t.completed,
                t.order
            FROM tags tg
            LEFT JOIN todos_tags tt ON tg.id = tt.tag_id
            LEFT JOIN todos t ON tt.todo_id = t.id
            WHERE tg.id = ?;
        `;
        const [results] = await connection.execute(sql, [tagId]);

        if (results.length === 0) {
            ctx.status = 404;
            ctx.body = { error: `Tag with ID ${tagId} not found` };
            return;
        }

        const tag = {
            id: results[0].tag_id.toString(),
            title: results[0].tag_title,
            url: `http://${ctx.host}/tags/${results[0].tag_id}`,
            todos: results
                .filter(row => row.todo_id)
                .map(row => ({
                    id: row.todo_id.toString(),
                    title: row.todo_title,
                    completed: row.completed === 1,
                    url: `http://${ctx.host}/todos/${row.todo_id}`,
                    order: row.order,
                })),
        };

        ctx.status = 200;
        ctx.body = tag;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to retrieve tag' };
    }
}

// Delete a single tag by ID
async function deleteTag(ctx) {
    const tagId = ctx.params.id;

    try {
        const connection = await useConnection();
        const sql = 'DELETE FROM tags WHERE id = ?;';
        const [results] = await connection.execute(sql, [tagId]);

        if (results.affectedRows === 0) {
            ctx.status = 404;
            ctx.body = { error: `Tag with ID ${tagId} not found` };
            return;
        }

        ctx.status = 204;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to delete tag' };
    }
}

// Update a tag by ID
async function updateTag(ctx) {
    const tagId = ctx.params.id;
    const { title } = ctx.request.body;

    if (!title) {
        ctx.status = 400;
        ctx.body = { error: "Tag title is required" };
        return;
    }

    try {
        const connection = await useConnection();
        const sql = 'UPDATE tags SET title = ? WHERE id = ?;';
        const [results] = await connection.execute(sql, [title, tagId]);

        if (results.affectedRows === 0) {
            ctx.status = 404;
            ctx.body = { error: `Tag with ID ${tagId} not found` };
            return;
        }

        const updatedTag = {
            id: tagId.toString(),
            title,
            url: `http://${ctx.host}/tags/${tagId}`,
        };

        ctx.status = 200;
        ctx.body = updatedTag;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to update tag' };
    }
}

// Get the list of todos associated with a tag
async function getTodoListOfTag(ctx) {
    const tagId = ctx.params.id;

    try {
        const connection = await useConnection();
        const sql = `
            SELECT 
                t.id AS id,
                t.title,
                t.completed,
                t.order
            FROM todos_tags tt
            LEFT JOIN todos t ON tt.todo_id = t.id
            WHERE tt.tag_id = ?;
        `;
        const [results] = await connection.execute(sql, [tagId]);

        if (results.length === 0) {
            ctx.status = 404;
            ctx.body = { error: `Tag with ID ${tagId} not found or has no todos` };
            return;
        }

        const todos = results.map(row => ({
            id: row.id.toString(),
            title: row.title,
            completed: row.completed === 1,
            url: `http://${ctx.host}/todos/${row.id}`,
            order: row.order,
        }));

        ctx.status = 200;
        ctx.body = todos;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to retrieve todos for tag' };
    }
}

module.exports = {
    getTagList,
    createTag,
    deleteAllTags,
    getTag,
    deleteTag,
    updateTag,
    getTodoListOfTag,
};
