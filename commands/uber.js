exports.run = (bot, msg, args, db, roles, channelID) => {
  //Get the uberlab layour + link manually.
  const parser = require('./parser.js');
  const Discord = require('discord.js');
  
  var cId;
  if (msg != undefined) {
    cId = msg.channel.id;
  } else {
    cId = channelID;
  }

  //Retrieves the embed from our parser class and sends it to the appropriate channel.
  parser.getEmbed("uber", function (uberEmbed) {
    bot.channel.send(uberEmbed)
      .catch(error => console.log(error));
  });
}