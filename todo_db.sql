CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INT NOT NULL
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    title  VARCHAR(255) NOT NULL
);

CREATE TABLE todo_tags (
    todo_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (todo_id, tag_id),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);