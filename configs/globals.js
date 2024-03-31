// Set up dotenv
require('dotenv').config();

// Global variables
const configurations = {
    ConnectionStrings: {
        MongoDB: process.env.CONNECTION_STRING_MONGODB
    },
    Discord: {
        Token: process.env.DISCORD_TOKEN,
        Client: process.env.DISCORD_CLIENT,
        ChannelID: process.env.DISCORD_CHANNEL_ID
    }
};

module.exports = configurations;