const Task = require('../models/task');

const createTask = async (req, res, next) => {
  const tasks = new Task({ ...req.body, owner: req.user._id });
  try {
    const task = await tasks.save();
    res.status(201).json({ task: task });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    let match = { owner: req.user._id };
    let sort = {};
    if (req.query.completed) {
      match.completed = req.query.completed;
    }

    if (req.query.sortBy) {
      const sortArr = req.query.sortBy.split(':');
      sort[sortArr[0]] = sortArr[1] === 'asc' ? 1 : -1;
    }
    const tasks = await Task.find(match)
      .skip(Number.parseInt(req.query.skip))
      .limit(Number.parseInt(req.query.limit))
      .sort(sort);

    res.status(200).json({
      tasks: tasks,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const getTask = async (req, res, next) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id: _id, owner: req.user._id });
    if (!task) {
      let error = new Error('Task do not exist in our record');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      task: task,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdate = ['description', 'completed'];
  const isValidOperation = updates.every((update) => {
    return allowedUpdate.includes(update);
  });

  if (!isValidOperation) {
    return res.status(422).json({
      error: 'Invalid Update Operation',
    });
  }

  try {
    let task = await Task.findOne({ _id: _id, owner: req.user._id });

    if (!task) {
      const error = new Error('task do not exist in our record');
      error.statusCode = 404;
      throw error;
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    task = await task.save();
    res.status(200).json({ task: task });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id: _id, owner: req.user._id });
    if (!task) {
      const error = new Error('Task do not exist in our record');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      task: task,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = {
  createTask: createTask,
  getTasks: getTasks,
  getTask: getTask,
  updateTask: updateTask,
  deleteTask: deleteTask,
};
