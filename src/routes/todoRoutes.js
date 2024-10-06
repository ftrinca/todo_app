const Router = require('koa-router');

const{
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
} = require('../functions/todos');

const router = new Router();

router.get('/todos/', getTodoList);
router.post('/todos/', createTodo);
router.delete('/todos/', deleteAllTodos);

router.get('/todos/:id', getTodo);
router.delete('/todos/:id', deleteTodo);
router.patch('/todos/:id', updateTodo);

router.get('/todos/:id/tags', getTagListOfTodo);
router.post('/todos/:id/tags', setTagOfTodo);
router.delete('/todos/:id/tags', deleteAllTagsFromTodo);

router.delete('/todos/:id/tags/:tag_id', deleteTagFromTodo);

module.exports = router;