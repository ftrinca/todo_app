const Router = require('koa-router');

const {
    getTagList,
    createTag,
    deleteAllTags,
    getTag,
    deleteTag,
    updateTag,
    getTodoListOfTag
} = require('../functions/tags');

const router = new Router();

router.get('/tags', getTagList);
router.post('/tags', createTag);
router.delete('/tags', deleteAllTags);

router.get('/tags/:id', getTag);
router.patch('/tags/:id', updateTag);
router.delete('/tags/:id', deleteTag);

router.get('/tags/:id/todos', getTodoListOfTag);

module.exports = router;