# JS Discord Assignment

This project is a starter file for the Discord.js library for COMP2068, JS Frameworks. It is intentionally left incomplete, with chat.hbs, DiscordBot.js, and Message.js all as empty shells. 

For a complete implementation, see [https://github.com/chrisbarbati/DiscordAssignment](https://github.com/chrisbarbati/DiscordAssignment)

## Installation

1. Clone this repository in a location of your choosing
2. Open a terminal in that location and run "npm install"
3. Create a .env file in the directory, and add the following keys:
    - DISCORD_TOKEN
    - DISCORD_CLIENT
    - DISCORD_CHANNEL_ID
    - OPENAI_API_KEY
    - CONNECTION_STRING_MONGODB
    (The last two are optional, and can be ignored if you do not intend to use the scheduling or AI response features)
4. Run the project with "nodemon"

## Instructions

### Creating Message.js

Message.js is a simple class that holds the author and content of a Discord message. This was to simplify accessing the data elsewhere in the code, as a full Discord message response is a fairly large JSON file.

    class message{
        constructor(content, sender){
            this.content = content; // The text content of the message
            this.sender = sender; // The user who sent the message
        }
    }

    module.exports = message;

It consists only of two member variables, each of which is passed in the constructor.

### Creating DiscordBot.js

DiscordBot.js is an object-oriented representation of a Discord bot, using the Discord.js library. Complete code can be found in the completed repository, but we will make a simple implementation. Our implementation will simply be able to send a message to the channel, and retrieve the past messages from the channel.

This is the provided shell. We will need to build out the member functions ourselves.

    var Client = require('discord.js').Client;
    var GatewayIntentBits = require('discord.js').GatewayIntentBits;
    var Message = require('./message.js');
    const configs = require('../configs/globals');

    class DiscordBot {
        
    }

    var bot = new DiscordBot();

    module.exports = bot;

First, we need member variables and a constructor. In our case, we are only using one bot in our software, so it simplifies things to use a parameter-less constructor and simply get the environment variables from the config file:

    class DiscordBot(){
        client; //Holds the client ID of the bot
        channel; //Holds the channel to which the bot will send messages
        token; //Holds our access token
        channelID; //Holds the channel ID representing the above channel
        initialized = false; //Boolean to determine whether the bot has been initialized

        // Constructor takes no parameters, but if application is to be expanded it should take the token and channelID as parameters
        constructor(){
            this.token = configs.Discord.Token;
            this.channelID = configs.Discord.ChannelID;

            console.log('Bot constructed')

        }
    }

Once that is complete, we need an init() method and setter for the channel. These must be set in a specific order, and we need to use await in order to avoid concurrency issues:

    // Initialize the bot
    async init() {
        this.client = new Client({ intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions]}); // These intents represent the permissions of the bot
        await this.client.login(this.token);

        await this.client.once('ready', () => {
            console.log('Bot ready');
        });
        
        this.channel = await this.setChannel();

        this.initialized = true;

        //Additional configurations go here. Eg. Listener to respond when a message is sent to the bot.
    }

    // Set the channel.
    async setChannel(){
        return new Promise((resolve, reject) => {
            this.client.channels.fetch(this.channelID)
                .then(channel => {
                    this.channel = channel;
                    resolve(this.channel);
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

Lastly, we need to be able to send a text message and receive one. Sending a message is very simple:

    // Send a text message to the channel
    async sendMessage(message){
        await this.channel.send(message)
        .then(message => console.log(`Sent message: ${message.content}`))
        .catch(console.error);
    }

Getting messages is a bit more complicated

    // Get the past messages from the channel (up to 50)
    async getMessages(){

        //Below gets the prior messages from the server, default 50.
        const messagesList = await this.channel.messages.fetch();

        // We will make a new array to hold Message objects, created from the messages we just retrieved
        var messages = [];

        //Populates the messages array with new Message objects
        for(let message of messagesList){
            var content = message[1].content;
            var sender = message[1].author.username;
            const msg = new Message(content, sender);
            messages.push(msg);
        }

        // Required to return the messages in reverse chronological order
        messages.reverse();

        return messages;
    }

### Creating chat.hbs

Now that this basic back-end code is complete, we need to build out chat.hbs. Chat.hbs represents the chat function of the webpage, and will provide a front-end for the user to send and view messages.

CSS is already included with this repository, so we will just worry about the markup:


    <body class="chatBody" data-messages="{{json messages}}"> <!-- Add a data attribute to let us access the messages passed from the router -->
        <div class="chatContainer">
        <h1 class="chatBox">Discord Chat</h1>
            <div class="chatBox">
                <div class="chatBoxWindow">
                </div>
            <div  class="chatForm">
                <form action="/chat" method="POST">
                    <input type="text" name="message" placeholder="Enter your message...">
                    <br>
                    <button class="buttonChat" type="submit">Send</button>
                </form>
                <form action="/" method="GET">
                    <button class="buttonChat">Back</button>
                </form>
            </div>
        </div>
    </body>

This markup creates a simple interface and provides an empty div that we will populate with messages. Populating it will be done in Javascript, because it lets us style the chatbox a bit more realistically.

You may have noticed the data-messages="{{json messages}}" in the body tag. What we're doing there is making use of an hbs helper method defined in app.js. The helper method will make it easier to access the messages passed from the router in the client-side code. You can see the helper code in app.js, but basically it accepts the data from the router, converts it to json, and then stores it in that attribute. Then in our script section, we will retrieve it:

    <script>
        
        var chatWindow = document.querySelector('.chatBoxWindow');

        // Get all messages passed from the router and store them in a local variable
        var messages = JSON.parse(document.body.dataset.messages);

        function populateMessages(){
            // Clear the chat window before displaying the messages
            chatWindow.innerHTML = '';

            // For each message, create a new div element and append it to the chat window
            for (var i = 0; i < messages.length; i++) {
                // Get the current message
                var message = messages[i];

                // Create a new div element to display the message, and set its text content to the message content
                const messageContent = message.content;

                var messageDiv = document.createElement('div');
                messageDiv.classList.add('message');
                messageDiv.textContent = messageContent;
                
                // Each message needs to be wrapped in a div to display the sender's name
                var messageWrapperDiv = document.createElement('div');
                messageWrapperDiv.classList.add('messageWrapper');

                // Create a new div element to display the sender's name, and set its text content to the sender's name
                var sender = document.createElement('div');
                sender.textContent = message.sender;

                // Append the sender and message divs to the message wrapper div
                messageWrapperDiv.appendChild(sender);
                messageWrapperDiv.appendChild(messageDiv);

                // Align the message to left or right depending on sender. 
                if (message.sender === 'JSAssignmentBot') {
                    messageWrapperDiv.style.setProperty('align-self', 'flex-end');
                } else {
                    messageWrapperDiv.style.setProperty('align-self', 'flex-start');
                }
                
                chatWindow.appendChild(messageWrapperDiv);
            }
        }

        // Call the populateMessages function to display the messages
        populateMessages();

        // Scroll to the bottom of the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight;
    </script>

While this code is thoroughly commented, it's worth explaining how it works. For each message in the list passed from the router, three elements are created: messageDiv, sender, and messageWrapperDiv. This is to allow us to render the sender's username above the round button-shaped message, and wrap them both inside the messageWrapperDiv.

The alignment is dependent on the sender. In this case, our bot is called JSAssignmentBot, so if the sender is equal to JSAssignmentBot we will align the messages to the right. Otherwise, we will align it to the left. It's worth noting that by default Discord itself aligns all messages left in it's UI, but to keep this front-end simple it seemed cleaner to align them left and right to be able to easily distinguish bot messages from regular message.

All of the messageWrapperDivs are appended to the chatWindow as a child element, and lastly we set the scroll-position of the window to the bottom so we can see the newest messages first.