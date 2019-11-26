exports.run = (bot, msg, args, db, roles, channelID) => {

    const parser = require('./parser.js');
    const Discord = require('discord.js');

    //Retrieves the embed from our parser class and sends it to the appropriate channel.
    parser.getEmbed("normal", function (normalEmbed) {
        msg.channel.send(normalEmbed)
            .catch(error => console.log(error));
    });
}