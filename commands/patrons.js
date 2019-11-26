exports.run = (bot, msg, args, db) => {

    const Discord = require('discord.js');
    //File system import.
    const fs = require('fs');
    //Imports the command information file.
    const patrons = JSON.parse(fs.readFileSync('./commands/patrons.json', 'utf8'));
    //Retrieves the default prefix from the settings file
    const {
        default_prefix
    } = require('../settings.json');
    //Retrieves the prefix from the DB
    var prefix = db.get(`servers.${msg.guild.id}.prefix`).value();
    if (prefix == undefined) {
        prefix = default_prefix;
    }

    //The help embed, setColor sets the border color.
    var patronEmbed = new Discord.RichEmbed().setColor(0x19B366);
    patronEmbed.setTitle(`Thank you for your support.`);
    patronEmbed.setURL(`https://www.patreon.com/anoobisbots`)

    for (page in patrons) {
        for (patron in patrons[page]) {
            patronEmbed.addField(`**${patrons[page][patron].name}**`, `**Monthly donation:** $${patrons[page][patron].amount}`);
        }
    }
    msg.author.send(patronEmbed);
}