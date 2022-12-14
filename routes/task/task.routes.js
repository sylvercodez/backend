const express = require('express');
const { body } = require('express-validator');
const authenticateUser = require('../../middlewares/authentication');

const {
  getTasks,
  declineTask,
  acceptTask,
  taskComplete,
  pendingTask,
  getCurrentUserTasks,
} = require('./task.controller');

const taskRouter = express.Router();

taskRouter.get('/', authenticateUser, getTasks);
taskRouter.get('/user-tasks', authenticateUser, getCurrentUserTasks);
taskRouter.patch('/:taskId/decline', authenticateUser, declineTask);
taskRouter.patch('/:taskId/accept', authenticateUser, acceptTask);
taskRouter.patch('/:taskId/pending', authenticateUser, pendingTask);
taskRouter.patch('/:taskId/complete', authenticateUser, taskComplete);

module.exports = taskRouter;
