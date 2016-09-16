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
    var splitMessage = message.split(/[ ,]+/);

    var comicType = splitMessage[0];
    var comicNumber = splitMessage[1];

    switch(comicType) {
      case '!explosm':
        getExplosm(comicNumber, chatID);
        break;
      default:
        break;
    }
  }
});

function getExplosm(number, chatID) {
  var url = 'http://explosm.net/';
  var container = '#featured-comic';

  if (number != 'latest') {
    url += 'comics/';
    url += number != null ? number : 'random';
    container = '#main-comic';
  }

  request(url, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      image = $(container).attr('src').slice(2);
      sendComic(chatID, image);
    }
  });
}

function sendComic(chatID, link) {
  bot.sendMessage(chatID, link);
}

console.log('bot running');