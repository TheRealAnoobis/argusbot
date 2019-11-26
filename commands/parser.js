//Get the lab layour + link manually.
const Discord = require('discord.js');
const cheerio = require('cheerio');
const settings = require('./../settings.json');
const request = require('request');
const dateFormatter = require('dateformat');

function getEmbed(labType, cb) {
    //Variable to store the URL of the current lab layout.
    let labURL;
    //HTML item to determine which URL to retrieve. (I know this is silly.)
    let menuitem;
    //Variable to store the response.
    let actualResponse = "";
    //Rich embed, cuz we fancy.
    let embed = new Discord.RichEmbed().setColor(0x19B366);
    //Sets the lab type to determine which HTML item to scrape.
    switch (labType) {
        case "normal":
            menuItem = '.menu-item-26909'
            break;
        case "cruel":
            menuItem = '.menu-item-26910'
            break;
        case "merciless":
            menuItem = '.menu-item-26911'
            break;
        case "uber":
            menuItem = '.menu-item-26912'
            break;
    }
    //Makes an HTML GET request for the current day's layout URL.
    request('https://www.poelab.com/', (err, res, html) => {
        //If there are no errors and the status code is 200 ('OK'), it proceeds.
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(html);
            //Stores the URL to the day's layout in a variable.
            labURL = $(menuItem).children('a').attr('href');
            if (labURL == undefined) {
                cb(`Could not find the Labyrinth URL. Contact noobie and/or toggle automatic posting off with \`${settings.prefix}state off\`.`);
                return;
            } else {
                labURL = labURL.toString();
            }

            //Adds the URL to the embed.
            embed.setURL(labURL);
            embed.setTitle("Link to Lab page");

            //If there are no errors and the status code is 200 ('OK'), it proceeds.
            request(labURL, (err, res, html) => {
                if (!err && res.statusCode == 200) {
                    //Array for the 2 layout files.
                    var files = [];
                    //Loads the HTML into the cheerio package.
                    var $ = cheerio.load(html);
                    //Stores the layout image URL in a variable.
                    let layout = $('.entry-content', '.clearfix').children('p').children('span').children('img').attr('src').toString().trim();

                    //Adds the two image files by URL to the end of an array.
                    files.push(layout);

                    if (labType == "uber" || labType == "merciless") {
                        //Stores the additional information image URL in a variable.
                        let additional = $('.entry-content', '.clearfix').children('.su-spoiler').first().children('.su-spoiler-content').children('img').attr('src').toString().trim();
                        files.push(additional);

                    }
                    //Attaches the 2 files to the embed message.
                    embed.attachFiles(files);
                    files = [];
                    //Sets the date of the posted layout.
                    embed.setDescription(`${dateFormatter(Date(), "dd/mm/yyyy")}`);
                    cb(embed);
                }
            });
        }
    });
}
module.exports.getEmbed = getEmbed;