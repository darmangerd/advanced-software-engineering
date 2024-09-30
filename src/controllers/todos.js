// contains the logic for handling the requests to the /todos endpoint
const { getConnection } = require('../db');

// List all todos with their tags
async function listTodos(ctx) {
  try {
    const connection = await getConnection();
    const sql = `
      SELECT 
          t.id AS id,
          t.title,
          t.completed,
          t.order,
          tg.id AS tag_id,
          tg.title AS tag_title
      FROM todos t
      LEFT JOIN todos_tags tt ON t.id = tt.todo_ref_id
      LEFT JOIN tags tg ON tt.tag_ref_id = tg.id;
    `;

    const [results] = await connection.query(sql);
    connection.end();

    // Transform results to have todos with a list of tags
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
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Create a new todo with associated tags (if provided)
async function addTodo(ctx) {
  const todo = ctx.request.body;

  if (!todo.title) {
    ctx.throw(400, { error: '"title" is a required field' });
  }

  try {
    const connection = await getConnection();
    
    // Insert the new todo
    const sql = 'INSERT INTO todos (title, completed, `order`) VALUES (?, ?, ?)';
    const values = [todo.title, todo.completed || false, todo.order || 1];
    const [result] = await connection.execute(sql, values);
    const newTodoId = result.insertId.toString();

    // Insert associated tags if provided
    if (todo.tags && Array.isArray(todo.tags) && todo.tags.length > 0) {
      const tagInsertPromises = todo.tags.map(async (tagId) => {
        await connection.execute('INSERT INTO todos_tags (todo_ref_id, tag_ref_id) VALUES (?, ?)', [newTodoId, tagId]);
      });
      await Promise.all(tagInsertPromises);
    }

    connection.end();

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
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Clear all todos
async function clearTodos(ctx) {
  try {
    const connection = await getConnection();
    await connection.query('DELETE FROM todos');
    connection.end();
    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Get a specific todo with its tags
async function getTodo(ctx) {
  const id = ctx.params.id;

  try {
    const connection = await getConnection();
    const sql = `
      SELECT 
          t.id AS id,
          t.title,
          t.completed,
          t.order,
          tg.id AS tag_id,
          tg.title AS tag_title
      FROM todos t
      LEFT JOIN todos_tags tt ON t.id = tt.todo_ref_id
      LEFT JOIN tags tg ON tt.tag_ref_id = tg.id
      WHERE t.id = ?;
    `;

    const [results] = await connection.execute(sql, [id]);
    connection.end();

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

    ctx.body = todo;
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Update a specific todo
async function updateTodo(ctx) {
  const id = ctx.params.id;
  const updates = ctx.request.body;

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM todos WHERE id = ?', [id]);

    if (rows.length === 0) {
      connection.end();
      ctx.throw(404, { error: 'Todo not found' });
    }

    const currentTodo = rows[0];

    const updatedTitle = updates.title !== undefined ? updates.title : currentTodo.title;
    const updatedCompleted = updates.completed !== undefined ? updates.completed : currentTodo.completed;
    const updatedOrder = updates.order !== undefined ? updates.order : currentTodo.order;

    const updateSql = `
      UPDATE todos 
      SET title = ?, completed = ?, \`order\` = ? 
      WHERE id = ?;
    `;
    await connection.execute(updateSql, [updatedTitle, updatedCompleted, updatedOrder, id]);
    connection.end();

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
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Delete a specific todo
async function deleteTodo(ctx) {
  const id = ctx.params.id;

  try {
    const connection = await getConnection();
    const [result] = await connection.execute('DELETE FROM todos WHERE id = ?', [id]);
    connection.end();

    if (result.affectedRows === 0) {
      ctx.throw(404, { error: 'Todo not found' });
    }

    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Get tags associated with a specific todo
async function getTagsTodo(ctx) {
  const todoId = ctx.params.id;

  try {
    const connection = await getConnection();
    const sql = `
      SELECT 
          tg.id AS id,
          tg.title AS tag_title
      FROM todos_tags tt
      LEFT JOIN tags tg ON tt.tag_ref_id = tg.id
      WHERE tt.todo_ref_id = ?;
    `;

    const [results] = await connection.execute(sql, [todoId]);
    connection.end();

    const tags = results.map(row => ({
      id: row.id.toString(),
      title: row.tag_title,
      url: `http://${ctx.host}/tags/${row.id}`
    }));

    ctx.status = 200;
    ctx.body = tags;
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Associate a tag with a todo
async function setTagTodo(ctx) {
  const todoId = ctx.params.id;
  const tag = ctx.request.body;

  if (!tag.id) {
    ctx.throw(400, { error: '"id" is a required field in the request body' });
  }

  const tagId = tag.id;

  try {
    const connection = await getConnection();
    await connection.execute('INSERT INTO todos_tags (todo_ref_id, tag_ref_id) VALUES (?, ?)', [todoId, tagId]);
    connection.end();

    ctx.status = 200; // No Content
    tag.url = `http://${ctx.host}/tags/${tagId}`;
    ctx.body = tag;
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Clear all tags from a specific todo
async function clearTagsTodo(ctx) {
  const todoId = ctx.params.id;

  try {
    const connection = await getConnection();
    await connection.execute('DELETE FROM todos_tags WHERE todo_ref_id = ?', [todoId]);
    connection.end();

    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Remove a specific tag association from a todo
async function clearTagTodo(ctx) {
  const todoId = ctx.params.id;
  const tagId = ctx.params.tag_id;

  try {
    const connection = await getConnection();
    const sql = 'DELETE FROM todos_tags WHERE todo_ref_id = ? AND tag_ref_id = ?';
    const [result] = await connection.execute(sql, [todoId, tagId]);
    connection.end();

    if (result.affectedRows === 0) {
      ctx.throw(404, { error: `No association found between Todo ID ${todoId} and Tag ID ${tagId}` });
    }

    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}


// List all tags
async function listTags(ctx) {
  try {
    const connection = await getConnection();
    const sql = `
      SELECT 
          tg.id AS tag_id,
          tg.title AS tag_title,
          t.id AS todo_id,
          t.title AS todo_title,
          t.completed,
          t.order
      FROM tags tg
      LEFT JOIN todos_tags tt ON tg.id = tt.tag_ref_id
      LEFT JOIN todos t ON tt.todo_ref_id = t.id;
    `;

    const [results] = await connection.query(sql);
    connection.end();

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
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Create a new tag and associate todos to it (if provided)
async function createTag(ctx) {
  const tag = ctx.request.body;

  if (!tag.title) {
    ctx.throw(400, { error: '"title" is a required field' });
  }

  try {
    const connection = await getConnection();

    // Insert the new tag
    const sql = 'INSERT INTO tags (title) VALUES (?)';
    const values = [tag.title];
    const [result] = await connection.execute(sql, values);
    const newTagId = result.insertId.toString();

    // Insert associated todos if provided
    if (tag.todos && Array.isArray(tag.todos)) {
      const todoAssociations = tag.todos.map(todoId => [todoId, newTagId]);
      await connection.query('INSERT INTO todos_tags (todo_ref_id, tag_ref_id) VALUES ?', [todoAssociations]);
    }

    connection.end();

    const newTag = {
      id: newTagId,
      title: tag.title,
      url: `http://${ctx.host}/tags/${newTagId}`
    };

    ctx.status = 201;
    ctx.body = newTag;
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Clear all tags
async function clearTags(ctx) {
  try {
    const connection = await getConnection();
    await connection.query('DELETE FROM tags');
    connection.end();

    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Get a specific tag
async function getTag(ctx) {
  const tagId = ctx.params.id;

  try {
    const connection = await getConnection();
    const sql = `
      SELECT 
          tg.id AS tag_id,
          tg.title AS tag_title,
          t.id AS todo_id,
          t.title AS todo_title,
          t.completed,
          t.order
      FROM tags tg
      LEFT JOIN todos_tags tt ON tg.id = tt.tag_ref_id
      LEFT JOIN todos t ON tt.todo_ref_id = t.id
      WHERE tg.id = ?;
    `;

    const [results] = await connection.execute(sql, [tagId]);
    connection.end();

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
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Update a specific tag
async function updateTag(ctx) {
  const tagId = ctx.params.id;
  const { title } = ctx.request.body;

  if (!title) {
    ctx.throw(400, { error: '"title" is a required field' });
  }

  try {
    const connection = await getConnection();
    const sql = 'UPDATE tags SET title = ? WHERE id = ?';
    await connection.execute(sql, [title, tagId]);
    connection.end();

    const updatedTag = {
      id: tagId.toString(),
      title: title,
      url: `http://${ctx.host}/tags/${tagId}`
    };

    ctx.status = 200;
    ctx.body = updatedTag;
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Delete a specific tag
async function clearTag(ctx) {
  const tagId = ctx.params.id;

  try {
    const connection = await getConnection();
    const sql = 'DELETE FROM tags WHERE id = ?';
    const [result] = await connection.execute(sql, [tagId]);
    connection.end();

    if (result.affectedRows === 0) {
      ctx.throw(404, { error: 'Tag not found' });
    }

    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

// Retrieve the list of todos associated with a specific tag
async function getTodosByTag(ctx) {
  const tagId = ctx.params.id;

  try {
    const connection = await getConnection();
    const sql = `
      SELECT 
          t.id AS id,
          t.title,
          t.completed,
          t.order
      FROM todos_tags tt
      LEFT JOIN todos t ON tt.todo_ref_id = t.id
      WHERE tt.tag_ref_id = ?;
    `;
    
    const [results] = await connection.execute(sql, [tagId]);
    connection.end();

    if (results.length === 0) {
      ctx.throw(404, { error: `Tag with ID ${tagId} not found or has no todos` });
    }

    const todos = results.map(row => ({
      id: row.id.toString(),
      title: row.title,
      completed: !!row.completed,
      url: `http://${ctx.host}/todos/${row.id}`,
      order: row.order
    }));

    ctx.status = 200;
    ctx.body = todos;
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    ctx.status = 500;
    ctx.body = 'Erreur de connexion à la base de données';
  }
}

module.exports = {
  listTodos,
  addTodo,
  clearTodos,
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
};