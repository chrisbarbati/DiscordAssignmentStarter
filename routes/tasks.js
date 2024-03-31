const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const scheduler = require('../services/scheduler');

/*
    Routes for the tasks page and subpages
*/

// GET

// Serve the tasks page, displaying all tasks
router.get('/', async function(req, res, next) {
    console.log("GET route for /tasks");
    try {
        const tasks = await Task.find(); // Get all tasks from the database
        res.render('./tasks/viewTasks', { title: 'View Tasks', tasks}); // Render the viewTasks page with the tasks
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Serve the add task page, allowing the user to input a new task
router.get('/add', async function(req, res, next) {
    console.log("GET route for /tasks/add");
    res.render('./tasks/addTask', { title: 'Add Task'});
});

// Serve the edit task page, editing an existing task
router.get('/edit/:_id', async function(req, res, next) {
    console.log("GET route for /edit");

    // Find the task in the database
    try {
        const task = await Task.findOne({_id: req.params._id});
        res.render('./tasks/editTask', { title: 'Edit Task', task});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});

// Deletes a task from the database, and serves the tasks page again when complete.
router.get('/delete/:_id', async function(req, res, next) {
    console.log("GET route for /tasks/edit");

    // Delete the task from the database
    try {
        let currentTask = await Task.findOne({_id: req.params._id}); // Find the task matching the unique ID passed in the URL
        await currentTask.deleteOne(); // Delete the task from the database
        console.log("Task deleted from the database");
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});

// POST

// POST route for /add
router.post('/add', async function(req, res, next) {
    console.log("POST route for /tasks/add");

    // Process the form data and add the task to the database
    const { name, description, message, interval } = req.body;

    const date = new Date(); // Set the date to the current date

    // Create a new task object
    const newTask = new Task({
        name,
        description,
        date,
        message,
        interval
    });

    // Save the task to the database
    try {
        const task = await newTask.save();
        console.log("Task saved to the database");
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST route for /edit
router.post('/edit', async function(req, res, next) {
    console.log("POST route for /tasks/edit");

    try {
        // Find the task in the database with the ID matching the one in the request body
        const currentTask = await Task.findOne({_id: req.body._id});

        //Update the task in the database with the new selections (leaving the date unchanged)
        currentTask.name = req.body.name;
        currentTask.description = req.body.description;
        currentTask.message = req.body.message;
        currentTask.interval = req.body.interval;

        await currentTask.save();
        console.log("Task updated in the database");
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});


module.exports = router;