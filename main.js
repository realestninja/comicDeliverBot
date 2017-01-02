var token = '';

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});

var request = require('request-promise');
var cheerio = require('cheerio');

var image;

console.log('bot running');

bot.on('message', function(json) {
  if (json.hasOwnProperty('text')) {
    var chatID = json.chat.id; 
    var message = json.text;
    var splitMessage = message.split(/[ ,]+/); //split message into words
    var comicType = splitMessage[0]; //first word is the comic type. for now either /xkcd or /explosm
    var comicNumber = splitMessage[1]; //can be left empty. otherwise either a number or 'latest'

    switch(comicType) {
      case '/explosm':
        getExplosm(comicNumber, chatID);
      break;

      case '/xkcd':
        getXKCD(comicNumber, chatID);
      break;
      
      default:
      break;
    }
  }
});

function sendMessage(chatID, img, text) {
  bot.sendMessage(chatID, img);

  if(text) {
    bot.sendMessage(chatID, text);
  }

  console.log('comic has been delivered');
}

function getExplosm(number, chatID) {
  var url = 'http://explosm.net/';
  var container = number == 'latest' ? '#featured-comic' : '#main-comic';
  /*
  -'main-comic' is the container ID for comics
  -however, the latest comic has a different cotainer ID which is named 'featured-comic'
  */

  if (number != 'latest') {
    url += 'comics/';
    url += number != null ? number : 'random';
  }

  request(url, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      var $ = cheerio.load(body); //store DOM-like content
      image = $(container).attr('src').slice(2); //use cheerio (jquery like) to get 'src' attr
      sendMessage(chatID, image);
    }
  });
}

function getXKCD(number, chatID) {
  /*
  -url is initially set to call the API for the latest comic.
  -JSON of latest comic also has the information of total amount of comics
  */
  var url = 'http://xkcd.com/info.0.json'; 
  var altText; //xkcd features a hidden text for each comic which will be stored here

  if (number == 'latest') {
    request({ url: url, json: true }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        image = body.img;
        altText = body.alt;
        sendMessage(chatID, image, 'No.' + body.num + ": " + altText);
      }
    });
  } else {
    request({url: url, json: true }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        amountComics = body.num;
      }
    }).then(function(data) {
      if (number == null || number > amountComics) {
        number = Math.floor(Math.random() * amountComics) + 1;
      }

      url = 'http://xkcd.com/' + number + '/info.0.json';
      request({
        url: url,
        json: true
      }, function(error, response, body) {
        if(!error & response.statusCode == 200) {
          image = body.img;
          altText = body.alt;
          sendMessage(chatID, image, 'No.' + body.num + ": " + altText);
        }
      });  
    });
  }
}