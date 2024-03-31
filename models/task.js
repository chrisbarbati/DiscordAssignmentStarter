const mongoose = require('mongoose');

/*
    Model for a Task object to be stored in the database.

    A task represents a message that should be sent to the chat at a certain time.
*/

const taskSchemaObj = {
    name: { type: String, required: true },
    description: { type: String, required: false}, //Description is optional
    date: { type: Date, required: true },
    message: { type: String, required: true},
    interval: { type: Number, required: true} //Interval in minutes
};

const mongooseSchema = mongoose.Schema(taskSchemaObj);

module.exports = mongoose.model('Task', mongooseSchema);