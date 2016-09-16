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
      case '/explosm':
        getExplosm(comicNumber, chatID);
        break;
      case '/xkcd':
        getXKCD(comicNumber, chatID);
        break;
      /*
      case '/commitstrip':
        getCommitStrip(comicNumber, chatID);
        break;
      */
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
      sendMessage(chatID, image);
    }
  });
}

function getCommitStrip(number, chatID) {
  var url = 'http://www.commitstrip.com/?random=1';
  var container = '#entry-content img';

  request(url, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      image = $(container).attr('src');
      console.log($);
      //sendMessage(chatID, image);
    }
  });
}

function getXKCD(number, chatID) {
  var url = 'http://xkcd.com/info.0.json';
  var amountComics;
  var alt;

  request({
    url: url,
    json: true
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (number == 'latest') {
        image = body.img;
        alt = body.alt;
        sendMessage(chatID, image);
        sendMessage(chatID, 'No.' + body.num + ": " + alt);
      } else {
        if (number == null) {
          amountComics = body.num;
          number = Math.floor(Math.random() * amountComics) + 1;
        }

        url = 'http://xkcd.com/' + number + '/info.0.json';
        request({
          url: url,
          json: true
        }, function(error, response, body) {
          if(!error & response.statusCode == 200) {
            image = body.img;
            alt = body.alt;
            sendMessage(chatID, image);
            sendMessage(chatID, 'No.' + body.num + ": " + alt);
          }
        });        
      }
    }
  });
}

function sendMessage(chatID, link) {
  bot.sendMessage(chatID, link);
}

console.log('bot running');