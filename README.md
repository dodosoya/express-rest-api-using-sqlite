# Build REST API with Express and SQLite 

## Features
* Build REST API with Express and SQLite
* Add tests using Jest and SuperTest

## Steps
1. Initialize the project
    ```
    $ mkdir express-rest-api-using-sqlite
    $ cd express-rest-api-using-sqlite
    $ npm init -y
    ```
    　
2. Install packeages
    ```
    $ yarn add express sqlite3 dotenv
    $ yarn add --dev nodemon jest supertest
    ```

3. Add the user controller

    ./src/controllers/user.controller.js
    ```js
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
    ```

    ./src/controllers/index.js
    ```js
    const userController = require('./user.controller');

    module.exports = {
      userController
    };
    ```

4. Add API routes

    ./src/routes/index.js
    ```js
    const express = require('express');
    const { userController } = require('../controllers');

    const router = express.Router();

    router.post('/users/', userController.createUser);
    router.get('/users/', userController.getUsers);
    router.get('/users/:id', userController.getUser);
    router.put('/users/:id', userController.updateUser);
    router.delete('/users/:id', userController.deleteUser);

    module.exports = router;
    ```

5. Add the Express application

    ./src/app.js
    ```js
    const express = require('express');
    const routes = require('./routes');

    const app = express();

    app.use(express.json());
    app.use('/api', routes);

    module.exports = app;
    ```

    ./src/index.js
    ```js
    const dotenv = require('dotenv').config();
    const app = require('./app');

    if (dotenv.error) throw dotenv.error;

    const port = process.env.EXPRESS_PORT;

    app.listen(port, () => {
      console.log('Server is running on port ' + port);
    });
    ```

    ./.env
    ```
    EXPRESS_PORT=3000
    ```

6. Add tests

    ./tests/app.test.js
    ```js
    const request = require('supertest');
    const app = require('../src/app');

    describe('Test endpoint: /api/users', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'test';
      });

      test('create user', async () => {
        await request(app)
          .post('/api/users')
          .send({ name: 'Ryan', age: 18 });
        const res = await request(app).get('/api/users');
        const response = [
          { id: 1, name: 'Ryan', age: 18 }
        ];
        expect(res.status).toBe(200);
        expect(res.body).toEqual(response);
      });
      
      test('get users', async () => {
        const res = await request(app).get('/api/users');
        const response = [
          { id: 1, name: 'Ryan', age: 18 }
        ];
        expect(res.status).toBe(200);
        expect(res.body).toEqual(response);
      });

      test('get specific user', async () => {
        const res = await request(app).get('/api/users/1');
        const response = { id: 1, name: 'Ryan', age: 18 };
        expect(res.status).toBe(200);
        expect(res.body).toEqual(response);
      });
      
      test('update user', async () => {
        await request(app)
          .put('/api/users/1')
          .send({ name: 'Ryan+', age: 20 });
        const res = await request(app).get('/api/users/1');
        const response = { id: 1, name: 'Ryan+', age: 20 };
        expect(res.status).toBe(200);
        expect(res.body).toEqual(response);
      });
      
      test('delete user', async () => {
        await request(app).delete('/api/users/1');
        const res = await request(app).get('/api/users/1');
        const response = {};
        expect(res.status).toBe(200);
        expect(res.body).toEqual(response);
      });
    });
    ```

7. Modify scripts in package.json
    ```json
    {
      // ...
      "scripts": {
        "start": "CHOKIDAR_USEPOLLING=true nodemon ./src/index.js",
        "test": "jest --verbose"
      },
      // ...
    }
    ```

8.  Run tests
    ```bash
    $ npm test
    ```

9.  Run the application and the API endpoint is http://localhost:3000/api/users
    ```bash
    $ npm start
    ``` 