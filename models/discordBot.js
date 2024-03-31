var Client = require('discord.js').Client;
var GatewayIntentBits = require('discord.js').GatewayIntentBits;
var Message = require('./message.js');
const configs = require('../configs/globals');
//const { OpenAI } = require('openai');

//const openai = new OpenAI();

/*
    Object-oriented representation of a Discord bot, using the discord.js library.

    This can all be done more simply without the class, or simply done in the index.js file, but creating a class 
    is a good way to separate the logic and make the application more extensible in the future (eg. one server, multiple bots)

    Implementation adapted from https://discord.js.org/docs/packages/discord.js/14.14.1
*/

class DiscordBot {
    
}

var bot = new DiscordBot();

module.exports = bot;