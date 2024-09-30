const tagService = require('../models/tagModel');

// List all tags with their associated todos
async function listTags(ctx) {
  try {
    const results = await tagService.getAllTags();
    const tags = [];
    const tagMap = {};

    results.forEach(row => {
      if (!tagMap[row.tag_id]) {
        tagMap[row.tag_id] = {
          id: row.tag_id.toString(),
          title: row.tag_title,
          url: `http://${ctx.host}/tags/${row.tag_id}`,
          todos: []
        };
        tags.push(tagMap[row.tag_id]);
      }

      if (row.todo_id) {
        tagMap[row.tag_id].todos.push({
          id: row.todo_id.toString(),
          title: row.todo_title,
          completed: !!row.completed,
          url: `http://${ctx.host}/todos/${row.todo_id}`,
          order: row.order
        });
      }
    });

    ctx.status = 200;
    ctx.body = tags;
  } catch (error) {
    console.error('Error while retrieving tags:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Create a new tag
async function createTag(ctx) {
  const tag = ctx.request.body;

  if (!tag.title) {
    ctx.throw(400, { error: '"title" is a required field' });
  }

  try {
    const newTagId = await tagService.createTag({ title: tag.title });

    const newTag = {
      id: newTagId,
      title: tag.title,
      url: `http://${ctx.host}/tags/${newTagId}`
    };

    ctx.status = 201;
    ctx.body = newTag;
  } catch (error) {
    console.error('Error while creating the tag:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Clear all tags
async function clearTags(ctx) {
  try {
    await tagService.clearAllTags();
    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Error while deleting tags:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Get a specific tag by id with associated todos
async function getTagById(ctx) {
  const tagId = ctx.params.id;

  try {
    const results = await tagService.getTagById(tagId);

    if (results.length === 0) {
      ctx.throw(404, { error: 'Tag not found' });
    }

    const tag = {
      id: results[0].tag_id.toString(),
      title: results[0].tag_title,
      url: `http://${ctx.host}/tags/${results[0].tag_id}`,
      todos: []
    };

    results.forEach(row => {
      if (row.todo_id) {
        tag.todos.push({
          id: row.todo_id.toString(),
          title: row.todo_title,
          completed: !!row.completed,
          url: `http://${ctx.host}/todos/${row.todo_id}`,
          order: row.order
        });
      }
    });

    ctx.status = 200;
    ctx.body = tag;
  } catch (error) {
    console.error('Error while retrieving the tag:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Update a specific tag
async function updateTagById(ctx) {
  const tagId = ctx.params.id;
  const { title } = ctx.request.body;

  if (!title) {
    ctx.throw(400, { error: '"title" is a required field' });
  }

  try {
    await tagService.updateTagById(tagId, { title });

    const updatedTag = {
      id: tagId.toString(),
      title: title,
      url: `http://${ctx.host}/tags/${tagId}`
    };

    ctx.status = 200;
    ctx.body = updatedTag;
  } catch (error) {
    console.error('Error while updating the tag:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Delete a specific tag
async function deleteTagById(ctx) {
  const tagId = ctx.params.id;

  try {
    const affectedRows = await tagService.deleteTagById(tagId);
    if (affectedRows === 0) {
      ctx.throw(404, { error: 'Tag not found' });
    }

    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Error while deleting the tag:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Get todos associated with a specific tag
async function getTodosByTagId(ctx) {
  const tagId = ctx.params.id;

  try {
    const todos = await tagService.getTodosByTagId(tagId);
    const todoList = todos.map(row => ({
      id: row.id.toString(),
      title: row.title,
      completed: !!row.completed,
      url: `http://${ctx.host}/todos/${row.id}`,
      order: row.order
    }));

    ctx.status = 200;
    ctx.body = todoList;
  } catch (error) {
    console.error('Error while retrieving todos for the tag:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

module.exports = {
  listTags,
  createTag,
  clearTags,
  getTagById,
  updateTagById,
  deleteTagById,
  getTodosByTagId
};
