var token = '';

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});
var cheerio = require('cheerio');
var rp = require('request-promise');

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

      default: break;
    }
  }
});

function sendComic(chatID, img, text) {
  bot.sendMessage(chatID, img);

  if(text) {
    bot.sendMessage(chatID, text);
  }

  console.log('comic has been delivered');
}

function getExplosm(number, chatID) {
  var url = 'http://explosm.net/';
  var container = number == 'latest' ? '#featured-comic' : '#main-comic';
  var image;
  /*
  -'main-comic' is the container ID for comics
  -however, the latest comic has a different cotainer ID which is named 'featured-comic'
  */

  if (number != 'latest') {
    url += 'comics/';
    url += number != null ? number : 'random';
  }

  rp(url).then(function(data) {
    var $ = cheerio.load(data); //store DOM-like content
    image = $(container).attr('src').slice(2); //use cheerio (jquery like) to get 'src' attr
    sendComic(chatID, image);
  })
  .catch(function(error) {
    console.log('request-promise failed');
  });
}

function getXKCD(number, chatID) {
  /*
  -every xkcd comic can be requested by calling the API with a comic-specific url.
  -more information: https://xkcd.com/json.html

  -url is initially set to the latest comic.
  -JSON of the latest comic also has the information about total amount of available comics
  */
  var url = 'http://xkcd.com/info.0.json'; 
  var amountComics; //required to create a random number within the range of existing comics

  //if number == latest -> send the last comic that was released
  if (number == 'latest') {
    handleXkcdRequest(chatID, url);
  } else {
    //if a specific or random comic was requested -> get the amount of existing comics first
    rp({url: url, json: true}).then(function(data) {
      amountComics = data.num;
    })
    .then(function() {
      if (number == null || number > amountComics) {
        //set number to a random value if no number is given or if given number exceeds the range
        number = Math.floor(Math.random() * amountComics) + 1;
      }

      //change the API url to the corresponding request
      url = 'http://xkcd.com/' + number + '/info.0.json';
      handleXkcdRequest(chatID, url);
    })
    .catch(function(error) {
      console.log('request-promise failed');
    });
  }
}

function handleXkcdRequest(chatID, url) {
  rp({url: url, json: true})
    .then(function(data) {
      sendComic(chatID, data.img, 'No.' + data.num + ": " + data.alt);
      //data.alt is an alternative text which is featured on every xkcd comic
    }
  ); 
}