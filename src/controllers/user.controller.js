const sqlite3 = require('sqlite3').verbose();

const db = process.env.NODE_ENV === 'test' ? new sqlite3.Database(':memory:') : new sqlite3.Database('test.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)');
  if (process.env.NODE_ENV === 'test') {
    db.run('DELETE FROM users');
  }
});

const createUser = (req, res) => {
  const { name, age } = req.body;
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO users (name, age) VALUES (?, ?)');
    stmt.run(name, age);
    stmt.finalize();
    res.json(req.body);
  });
};

const getUsers = (req, res) => {
  db.serialize(() => {
    db.all('SELECT * FROM users', [], (err, rows) => {
      res.json(rows);
    });
  });
};

const getUser = (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    db.all('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
      if (rows.length)
        res.json(rows[0]);
      else
        res.json({});
    });
  });
};

const updateUser = (req, res) => {
  const { name, age } = req.body;
  const { id } = req.params;
  db.serialize(() => {
    const stmt = db.prepare('UPDATE users SET name = ?, age = ? WHERE id = ?');
    stmt.run(name, age, id);
    stmt.finalize();
    res.json(req.body);
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
    stmt.finalize();
    res.json(req.body);
  });
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
};