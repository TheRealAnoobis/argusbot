exports.run = (bot, msg, args, db, roles, channelID) => {

    const parser = require('./parser.js');
    const Discord = require('discord.js');

    //Retrieves the embed from our parser class and sends it to the appropriate channel.
    parser.getEmbed("merciless", function (mercilessEmbed) {
        msg.channel.send(mercilessEmbed)
            .catch(error => console.log(error));
    });
}