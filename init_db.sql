CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    `order` INT NOT NULL
);


CREATE TABLE todos_tags (
    tag_ref_id INT NOT NULL,
    todo_ref_id INT NOT NULL,
    PRIMARY KEY (todo_ref_id, tag_ref_id),
    FOREIGN KEY (todo_ref_id) REFERENCES todos (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_ref_id) REFERENCES tags (id) ON DELETE CASCADE
);

INSERT INTO tags (title) VALUES ('tag1');
INSERT INTO tags (title) VALUES ('tag2');
INSERT INTO tags (title) VALUES ('tag3');

INSERT INTO todos (title, completed, `order`) VALUES ('todo1', false, 1);
INSERT INTO todos (title, completed, `order`) VALUES ('todo2', true, 2);
INSERT INTO todos (title, completed, `order`) VALUES ('todo3', false, 3);

INSERT INTO todos_tags (tag_ref_id, todo_ref_id) VALUES (1, 1);  
INSERT INTO todos_tags (tag_ref_id, todo_ref_id) VALUES (2, 1);  
INSERT INTO todos_tags (tag_ref_id, todo_ref_id) VALUES (2, 2);  
INSERT INTO todos_tags (tag_ref_id, todo_ref_id) VALUES (3, 3); 