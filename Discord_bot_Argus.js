const Discord = require('discord.js');
const bot = new Discord.Client();
//Bot settings file, contains tokens and prefix.
const { default_prefix, token } = require('./settings.json');
var prefix;
//LowDB database.
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/argusbot_db.json');
const db = low(adapter);
db.defaults({
  servers: {}
}).write();

bot.on('ready', () => {
  console.log(`Launching ${bot.user.tag}...`);
  console.log("Successful launch.\n");
  //Bot status to display help cmd.
  bot.user.setPresence({
    game: {
      name: `with his food... | ~~help`
    },
    status: 'online'
  });
});

bot.on('message', message => {

  if (!message.guild) return;

  //**Prefix processing**
  //Retrieves the current prefix from the DB.
  prefix = db.get(`servers.${message.guild.id}.prefix`).value();

  //If no prefix is found for the server, the default one is set.
  if (prefix == undefined) {
    prefix = default_prefix;
  }

  //**Message processing**
  //Checks to make sure the message starts with a prefix, it is not the bot sending the message and the message is not being read in Direct Messages.
  if ((!message.content.startsWith(prefix) || message.author.bot) &&
        (!message.content.startsWith(`${default_prefix}prefix`) &&
            !message.content.startsWith(`${default_prefix}help`))) {
    return;
  }
  //The message is split up into arguments at every space, the prefix is removed.
  let args = message.content.slice(prefix.length).trim().split(' ');
  //Determines if a default prefix command is used and how to split the arguments based on that.
  if (message.content.startsWith(`${default_prefix}prefix`) || message.content.startsWith(`${default_prefix}help`)) {
    args = message.content.slice(default_prefix.length).trim().split(' ');
  } else {
    args = message.content.slice(prefix.length).trim().split(' ');
  }
  //The first word or "command" is stored and converted back to lower case
  let cmd = args.shift().toLowerCase();
  //Stores the user's roles for permission checks
  let roles = message.member.roles;

  try {

    if (cmd == 'state') {

      switch (args[0]) {
        case undefined:
          message.channel.send('Current update state: \`' + db.get(`servers.${message.guild.id}.${message.channel.id}`).value() + '\`');
          break;

        case "on":
          //Start automatically posting the uber lab layout.
          //Sets the "posting" state to 'on' in the DB.
          db.set(`servers.${message.guild.id}.${message.channel.id}`, 'on').write();
          //Sets the posted state to 'no' in the DB.
          db.set(`servers.${message.guild.id}.posted`, 'no').write();
          console.log('State set to: ' + db.get(`servers.${message.guild.id}.${message.channel.id}`).value());
          message.channel.send(`Automatic posting enabled. To disable use \`${prefix}state off\``);
          break;

        case "off":
          //Stop the automatically posting the uber lab layout.

          //Sets the "posting" state to 'off' in the DB.
          db.set(`servers.${message.guild.id}.${message.channel.id}`, 'off').write();
          //Sets the posted state to 'no' in the DB.
          db.set(`servers.${message.guild.id}.posted`, 'no').write();
          console.log('State set to: ' + db.get(`servers.${message.guild.id}.${message.channel.id}`).value());
          message.channel.send(`Automatic posting disabled. To enable use \`${prefix}state on\``);
          break;

        default:
          //Tells the user the correct usage.
          message.channel.send(`Incorrect usage. \`${prefix}state [on/off] or ${prefix}state\``);
      }
    }

  } catch (e1) {
    console.log(e1);
  }

  try {
    //The commands are ran by passing the variable select the {cmd}.js file
    //The file is stored in a variable.
    if (cmd == 'eternal') {
      cmd = 'uber';
    }
    let commandFile = require(`./commands/${cmd}.js`);
    //The stored command file is ran with the function arguments of bot, message and arguments.
    commandFile.run(bot, message, args, db, roles);
  } catch (e) {
    //Error logging.
    console.log(e);
    //Command usage logging, who used what command.
  } finally {
    //Command usage.
    console.log(`${message.author.username} (tag: ${message.author.tag}) ran the command: ${cmd}`);
  }
});

function loop() {
  //Iterates over a map of the guilds and stores the key(guild id) in guildId, and a map of the other server properties in guild.
  for ([guildId, guild] of bot.guilds.cache) {
    //Iterates over the channels attribute of the guilds and stores the key(channel id) in channelId, and a map of the channel properties in channel.
    for ([channelId, channel] of guild.channels.cache) {
      //uber.js file to run the cmd.
      const uber = require('./commands/uber.js');
      //Creates a new date for comparison every time the loop plays.
      var now = new Date();

      //Checks if it's the specified time of day, if the bot has the posting state on, and if it has posted already.
      if (now.getHours() === 4 && db.get(`servers.${guildId}.${channelId}`).value() === 'on' && db.get(`servers.${guildId}.posted`) == 'no') {
        //Passes the needed references to the uber.js cmd file.
        uber.run(bot, undefined, undefined, undefined, undefined, channelId);
        //Sets the posted marker to 'yes' in the DB.
        db.set(`servers.${guildId}.posted`, 'yes').write();
        console.log(`Posted layout to: ${guildId}`);
      }
      //Resets the posted marker if it is not the specified time of day and if it is set to 'yes'.
      if (now.getHours() != 4 && db.get(`servers.${guildId}.posted`).value() == 'yes') {
        //Changes the marker to 'no'.
        db.set(`servers.${guildId}.posted`, 'no').write();
        console.log(`Changed posted status for: ${guildId}`);
      }
    }
  }
  //Makes the function run again in 6 seconds.
  setTimeout(loop, 6000);
}

loop();


bot.login(token);
