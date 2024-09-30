// defines the routes for the todo API and links them to the corresponding controller functions.
const Router = require('koa-router');
const {
  listTodos,
  clearTodos,
  addTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  getTagsTodo,
  setTagTodo,
  clearTagsTodo,
  clearTagTodo,
  listTags,
  createTag,
  clearTags,
  getTag,
  updateTag,
  clearTag,
  getTodosByTag
} = require('../controllers/todos');

const router = new Router();

// Todos routes
router.get('/todos/', listTodos);            // List all todos
router.del('/todos/', clearTodos);           // Clear all todos
router.post('/todos/', addTodo);             // Add a new todo with tags
router.get('/todos/:id', getTodo);           // Get a specific todo
router.patch('/todos/:id', updateTodo);      // Update a specific todo
router.del('/todos/:id', deleteTodo);        // Delete a specific todo

// Todo Tags routes
router.get('/todos/:id/tags', getTagsTodo);          // Get tags associated with a specific todo
router.post('/todos/:id/tags', setTagTodo);          // Associate a tag with a specific todo
router.del('/todos/:id/tags', clearTagsTodo);        // Clear all tags from a specific todo
router.del('/todos/:id/tags/:tag_id', clearTagTodo); // Remove a specific tag from a todo

// Tags routes
router.get('/tags/', listTags);                      // List all tags
router.post('/tags/', createTag);                    // Create a new tag and associate todos
router.del('/tags/', clearTags);                     // Clear all tags
router.get('/tags/:id', getTag);                     // Get a specific tag
router.patch('/tags/:id', updateTag);                // Update a specific tag
router.del('/tags/:id', clearTag);                   // Delete a specific tag
router.get('/tags/:id/todos', getTodosByTag);        // Get todos associated with a specific tag

module.exports = router;
