var express = require('express');
var router = express.Router();
var bot = require('../models/discordBot.js');

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(!bot.initialized){
    //Wait until DiscordBot is constructed and client and channel are set before sending a message
    await bot.init();
  }

  res.render('index', { title: 'Discord Application' });
});


router.get('/chat', async function(req, res, next) {
  if(!bot.initialized){
    //Wait until DiscordBot is constructed and client and channel are set before sending a message
    await bot.init();
  }

  var messagesList = await bot.getMessages();

  res.render('chat', { title: 'Chat', messages: messagesList });
});


//Accept a post request and send a message to the Discord channel
router.post('/chat', async function(req, res, next) {
  if(!bot.initialized){
    //Wait until DiscordBot is constructed and client and channel are set before sending a message
    await bot.init();
  }

  const message = req.body.message;

  if(message.substring(0, 2) === 'www' || message.substring(0, 3) === 'http'){
    await bot.sendImage(message);
  }else{
    await bot.sendMessage(message);
  }

  res.redirect('/chat');
});



module.exports = router;