const todoService = require('../models/todoModel');

// List all todos with their tags
async function listTodos(ctx) {
  try {
    const results = await todoService.getAllTodos();
    const todos = [];
    const todoMap = {};

    results.forEach(row => {
      if (!todoMap[row.id]) {
        todoMap[row.id] = {
          id: row.id.toString(),
          title: row.title,
          completed: !!row.completed,
          url: `http://${ctx.host}/todos/${row.id}`,
          order: row.order,
          tags: []
        };
        todos.push(todoMap[row.id]);
      }

      if (row.tag_id) {
        todoMap[row.id].tags.push({
          id: row.tag_id.toString(),
          title: row.tag_title,
          url: `http://${ctx.host}/tags/${row.tag_id}`
        });
      }
    });

    ctx.status = 200;
    ctx.body = todos;
  } catch (error) {
    console.error('Error while retrieving todos:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Create a new todo with associated tags (if provided)
async function addTodo(ctx) {
  const todo = ctx.request.body;

  if (!todo.title) {
    ctx.throw(400, { error: '"title" is a required field' });
  }

  try {
    const newTodoId = await todoService.createTodo({
      title: todo.title,
      completed: todo.completed,
      order: todo.order
    });

    if (todo.tags && Array.isArray(todo.tags) && todo.tags.length > 0) {
      await todoService.addTagsToTodo(newTodoId, todo.tags);
    }

    const newTodo = {
      id: newTodoId,
      title: todo.title,
      completed: !!todo.completed,
      order: todo.order || 1,
      tags: todo.tags || [],
      url: `http://${ctx.host}/todos/${newTodoId}`
    };

    ctx.status = 201;
    ctx.body = newTodo;
  } catch (error) {
    console.error('Error while creating the todo:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Get a specific todo with its tags
async function getTodoById(ctx) {
  const id = ctx.params.id;

  try {
    const results = await todoService.getTodoById(id);
    if (results.length === 0) {
      ctx.throw(404, { error: 'Todo not found' });
    }

    const todo = {
      id: results[0].id.toString(),
      title: results[0].title,
      completed: !!results[0].completed,
      url: `http://${ctx.host}/todos/${results[0].id}`,
      order: results[0].order,
      tags: []
    };

    results.forEach(row => {
      if (row.tag_id) {
        todo.tags.push({
          id: row.tag_id.toString(),
          title: row.tag_title,
          url: `http://${ctx.host}/tags/${row.tag_id}`
        });
      }
    });

    ctx.status = 200;
    ctx.body = todo;
  } catch (error) {
    console.error('Error while retrieving the todo:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Update a specific todo
async function updateTodoById(ctx) {
  const id = ctx.params.id;
  const updates = ctx.request.body;

  try {
    const results = await todoService.getTodoById(id);
    if (results.length === 0) {
      ctx.throw(404, { error: 'Todo not found' });
    }

    const currentTodo = results[0];
    const updatedTitle = updates.title !== undefined ? updates.title : currentTodo.title;
    const updatedCompleted = updates.completed !== undefined ? updates.completed : currentTodo.completed;
    const updatedOrder = updates.order !== undefined ? updates.order : currentTodo.order;

    await todoService.updateTodoById(id, { title: updatedTitle, completed: updatedCompleted, order: updatedOrder });

    const updatedTodo = {
      id: id.toString(),
      title: updatedTitle,
      completed: !!updatedCompleted,
      url: `http://${ctx.host}/todos/${id}`,
      order: updatedOrder
    };

    ctx.status = 200;
    ctx.body = updatedTodo;
  } catch (error) {
    console.error('Error while updating the todo:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Delete a specific todo
async function deleteTodoById(ctx) {
  const id = ctx.params.id;

  try {
    const affectedRows = await todoService.deleteTodoById(id);
    if (affectedRows === 0) {
      ctx.throw(404, { error: 'Todo not found' });
    }

    ctx.status = 204;
  } catch (error) {
    console.error('Error while deleting the todo:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Clear all todos
async function clearTodos(ctx) {
  try {
    await todoService.clearAllTodos();
    ctx.status = 204;
  } catch (error) {
    console.error('Error while deleting all todos:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Get tags associated with a specific todo
async function getTagsForTodoId(ctx) {
  const todoId = ctx.params.id;

  try {
    const tags = await todoService.getTagsForTodoId(todoId);
    const tagList = tags.map(row => ({
      id: row.id.toString(),
      title: row.tag_title,
      url: `http://${ctx.host}/tags/${row.id}`
    }));

    ctx.status = 200;
    ctx.body = tagList;
  } catch (error) {
    console.error('Error while retrieving tags for the todo:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Associate a tag with a todo
async function setTagForTodoId(ctx) {
  const todoId = ctx.params.id;
  const tag = ctx.request.body;

  if (!tag.id) {
    ctx.throw(400, { error: '"id" is a required field in the request body' });
  }

  try {
    await todoService.addTagsToTodo(todoId, [tag.id]);
    tag.url = `http://${ctx.host}/tags/${tag.id}`;

    ctx.status = 200;
    ctx.body = tag;
  } catch (error) {
    console.error('Error while associating the tag with the todo:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Clear all tags from a specific todo
async function clearTagsFromTodoId(ctx) {
  const todoId = ctx.params.id;

  try {
    await todoService.clearTagsForTodoId(todoId);
    ctx.status = 204;
  } catch (error) {
    console.error('Error while deleting tags from the todo:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

// Remove a specific tag from a todo
async function removeTagFromTodoById(ctx) {
  const todoId = ctx.params.id;
  const tagId = ctx.params.tag_id;

  try {
    const affectedRows = await todoService.removeTagFromTodoById(todoId, tagId);
    if (affectedRows === 0) {
      ctx.throw(404, { error: `No association found between Todo ID ${todoId} and Tag ID ${tagId}` });
    }

    ctx.status = 204;
  } catch (error) {
    console.error('Error while deleting the associated tag from the todo:', error);
    ctx.status = 500;
    ctx.body = 'Database connection error';
  }
}

module.exports = {
  listTodos,
  addTodo,
  getTodoById,
  updateTodoById,
  deleteTodoById,
  clearTodos,
  getTagsForTodoId,
  setTagForTodoId,
  clearTagsFromTodoId,
  removeTagFromTodoById
};
