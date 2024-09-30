const { getConnection } = require('../db');

// Get all todos with their tags
async function getAllTodos() {
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
  return results;
}

// Get a specific todo with its tags
async function getTodoById(id) {
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
  return results;
}

// Create a new todo
async function createTodo({ title, completed = false, order = 1 }) {
  const connection = await getConnection();
  const sql = 'INSERT INTO todos (title, completed, `order`) VALUES (?, ?, ?)';
  const [result] = await connection.execute(sql, [title, completed, order]);
  connection.end();
  return result.insertId.toString();
}

// Add tags to a specific todo
async function addTagsToTodo(todoId, tagIds) {
  const connection = await getConnection();
  const tagInsertPromises = tagIds.map(async (tagId) => {
    await connection.execute('INSERT INTO todos_tags (todo_ref_id, tag_ref_id) VALUES (?, ?)', [todoId, tagId]);
  });
  await Promise.all(tagInsertPromises);
  connection.end();
}

// Update a specific todo
async function updateTodoById(id, { title, completed, order }) {
  const connection = await getConnection();
  const updateSql = `
    UPDATE todos 
    SET title = ?, completed = ?, \`order\` = ? 
    WHERE id = ?;
  `;
  await connection.execute(updateSql, [title, completed, order, id]);
  connection.end();
}

// Delete a specific todo
async function deleteTodoById(id) {
  const connection = await getConnection();
  const [result] = await connection.execute('DELETE FROM todos WHERE id = ?', [id]);
  connection.end();
  return result.affectedRows;
}

// Clear all todos
async function clearAllTodos() {
  const connection = await getConnection();
  await connection.query('DELETE FROM todos');
  connection.end();
}

// Get tags associated with a specific todo
async function getTagsForTodoId(todoId) {
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
  return results;
}

// Clear all tags from a specific todo
async function clearTagsForTodoId(todoId) {
  const connection = await getConnection();
  await connection.execute('DELETE FROM todos_tags WHERE todo_ref_id = ?', [todoId]);
  connection.end();
}

// Remove a specific tag from a todo
async function removeTagFromTodoById(todoId, tagId) {
  const connection = await getConnection();
  const sql = 'DELETE FROM todos_tags WHERE todo_ref_id = ? AND tag_ref_id = ?';
  const [result] = await connection.execute(sql, [todoId, tagId]);
  connection.end();
  return result.affectedRows;
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  addTagsToTodo,
  updateTodoById,
  deleteTodoById,
  clearAllTodos,
  getTagsForTodoId,
  clearTagsForTodoId,
  removeTagFromTodoById
};
