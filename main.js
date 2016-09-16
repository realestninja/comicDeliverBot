var token = '';
var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});
var request = require('request');
var cheerio = require('cheerio');
var $;
var image;

bot.on('message', function(json) {
  if (json.hasOwnProperty('text')) {
    var chatID = json.chat.id;
    var message = json.text;

    if (message == '!comic') {
      request('http://explosm.net/comics/random', function(error, response, body) {
        if(!error && response.statusCode == 200) {
          $ = cheerio.load(body);
          image = $('#main-comic').attr('src').slice(2);
          sendComic(chatID, image);
        }
      });
    }
  }
});

function sendComic(chatID, link) {
  bot.sendMessage(chatID, link);
}

console.log('bot running');