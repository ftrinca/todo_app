-- Create the `todos` table
CREATE TABLE IF NOT EXISTS `todos` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    `order` INT DEFAULT 0
);

-- Create the `tags` table
CREATE TABLE IF NOT EXISTS `tags` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

-- Create the `todos_tags` table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS `todos_tags` (
    todo_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (todo_id, tag_id),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);