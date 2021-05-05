const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task');
const auth = require('../middleware/auth');

//* POST|create a task
router.post('/tasks', auth, taskController.createTask);

//* GET|Get all tasks
router.get('/tasks', auth, taskController.getTasks);

//* GET|Get a single task
router.get('/tasks/:id', auth, taskController.getTask);

//* PATCH|Update a task
router.patch('/tasks/:id', auth, taskController.updateTask);

//* DELETE|Delete a task
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;
