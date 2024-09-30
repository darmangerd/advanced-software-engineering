const Router = require('koa-router');
const {
  listTodos,
  clearTodos,
  addTodo,
  getTodoById,
  updateTodoById,
  deleteTodoById,
  getTagsForTodoId,
  setTagForTodoId,
  clearTagsFromTodoId,
  removeTagFromTodoById
} = require('../controllers/todos');

const router = new Router();

router.get('/todos/', listTodos);                // List all todos
router.post('/todos/', addTodo);                 // Add a new todo with tags
router.get('/todos/:id', getTodoById);           // Get a specific todo
router.patch('/todos/:id', updateTodoById);      // Update a specific todo
router.del('/todos/:id', deleteTodoById);        // Delete a specific todo
router.del('/todos/', clearTodos);               // Clear all todos

router.get('/todos/:id/tags', getTagsForTodoId);          // Get tags associated with a specific todo
router.post('/todos/:id/tags', setTagForTodoId);          // Associate a tag with a specific todo
router.del('/todos/:id/tags', clearTagsFromTodoId);       // Clear all tags from a specific todo
router.del('/todos/:id/tags/:tag_id', removeTagFromTodoById); // Remove a specific tag from a todo

module.exports = router;
