const schedule = require('node-schedule');
const Task = require('../models/task');
const bot = require('../models/discordBot');

/*
    Handles the scheduling of tasks.

    Simple demonstration for now
*/

// Get all tasks from the database, and schedule them to run at the specified intervals
async function scheduleTasks() {

  await bot.init();

  var tasks = await Task.find();

  tasks.forEach(task => {
    var taskString = getCronString(task);
    schedule.scheduleJob(taskString, function(){
      console.log('Scheduled job ran at ' + new Date());
      bot.sendMessage(task.message);
    });
  });
}

// Generate a cron string from a task interval
function getCronString(task) {
  var cronString = '*/' + task.interval + ' * * * *';
  console.log('Cron string: ' + cronString);
  return cronString;
}


// Stop all tasks, and reschedule them
async function refreshScheduledTasks(){
  await schedule.gracefulShutdown();
}

var initialized = false;

// Set a listener to watch for changes to the tasks collection in Mongo and refresh the schedule accordingly
async function watchTasks(){
  const taskCollection = Task.watch();

  if(!initialized){
    await scheduleTasks();
    initialized = true;
  }

  taskCollection.on('change', async function(change){
    console.log('Change detected in tasks collection');
    await refreshScheduledTasks();
    await scheduleTasks();
    console.log('Tasks rescheduled');
  });
}

module.exports = watchTasks();