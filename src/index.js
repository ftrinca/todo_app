const Koa = require('koa');

const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const todoRoutes = require('./routes/todoRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = new Koa();

app.use(cors());
app.use(bodyParser());

app.use(todoRoutes.routes());
app.use(todoRoutes.allowedMethods());
app.use(tagRoutes.routes());
app.use(tagRoutes.allowedMethods());

app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});