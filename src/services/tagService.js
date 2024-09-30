const { getConnection } = require('../db');

// Get all tags with associated todos
async function getAllTags() {
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
  return results;
}

// Get a specific tag by id with associated todos
async function getTagById(tagId) {
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
  return results;
}

// Create a new tag
async function createTag({ title }) {
  const connection = await getConnection();
  const sql = 'INSERT INTO tags (title) VALUES (?)';
  const [result] = await connection.execute(sql, [title]);
  connection.end();
  return result.insertId.toString();
}

// Update a specific tag
async function updateTagById(tagId, { title }) {
  const connection = await getConnection();
  const sql = 'UPDATE tags SET title = ? WHERE id = ?';
  await connection.execute(sql, [title, tagId]);
  connection.end();
}

// Delete a specific tag
async function deleteTagById(tagId) {
  const connection = await getConnection();
  const sql = 'DELETE FROM tags WHERE id = ?';
  const [result] = await connection.execute(sql, [tagId]);
  connection.end();
  return result.affectedRows;
}

// Clear all tags
async function clearAllTags() {
  const connection = await getConnection();
  await connection.query('DELETE FROM tags');
  connection.end();
}

// Get todos associated with a specific tag
async function getTodosByTagId(tagId) {
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
  return results;
}

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTagById,
  deleteTagById,
  clearAllTags,
  getTodosByTagId
};
