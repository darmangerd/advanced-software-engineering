const Router = require('koa-router');
const {
  listTags,
  createTag,
  clearTags,
  getTagById,
  updateTagById,
  deleteTagById,
  getTodosByTagId
} = require('../controllers/tags');

const router = new Router();

router.get('/tags/', listTags);                    // List all tags
router.post('/tags/', createTag);                  // Create a new tag
router.del('/tags/', clearTags);                   // Clear all tags
router.get('/tags/:id', getTagById);               // Get a specific tag
router.patch('/tags/:id', updateTagById);          // Update a specific tag
router.del('/tags/:id', deleteTagById);            // Delete a specific tag
router.get('/tags/:id/todos', getTodosByTagId);    // Get todos associated with a specific tag

module.exports = router;
