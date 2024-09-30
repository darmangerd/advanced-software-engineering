const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const todosRoutes = require('./routes/todos');
const tagsRoutes = require('./routes/tags');

const app = new Koa();

app
  .use(bodyParser())
  .use(cors())
  .use(todosRoutes.routes())
  .use(todosRoutes.allowedMethods())
  .use(tagsRoutes.routes())
  .use(tagsRoutes.allowedMethods());

app.listen(8080, () => {
  console.log('Server started on port 8080');
});
