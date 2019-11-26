exports.run = (bot, msg, args, db, roles, channelID) => {

    const parser = require('./parser.js');
    const Discord = require('discord.js');

    //Retrieves the embed from our parser class and sends it to the appropriate channel.
    parser.getEmbed("cruel", function (cruelEmbed) {
        msg.channel.send(cruelEmbed)
            .catch(error => console.log(error));
    });
}