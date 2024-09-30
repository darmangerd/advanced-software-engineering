const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const todosRoutes = require('./routes/todos');

const app = new Koa();

app
  .use(bodyParser())
  .use(cors())
  .use(todosRoutes.routes())
  .use(todosRoutes.allowedMethods());

app.listen(8080, () => {
  console.log('Serveur démarré sur le port 8080');
});
