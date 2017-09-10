import * as TelegramBot from 'node-telegram-bot-api';
import { load } from 'cheerio';
import { get as g } from 'request-promise';
import { sendComic } from './src/functions';

const get = g as any;

const token = '';
const bot = new TelegramBot(token, { polling: true });

console.log('bot running');

bot.on('message', json => {
  if (json.hasOwnProperty('text')) {
    const chatID = json.chat.id;
    const message = json.text;
    const splitMessage = message.split(/[ ,]+/);
    // first word is the comic type. for now either /xkcd or /explosm
    const comicType = splitMessage[0];
    // can be left empty. otherwise either a number or 'latest'
    const comicNumber = splitMessage[1];

    switch (comicType) {
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

function getExplosm(number, chatID) {
  let url = 'http://explosm.net/';
  const container = number === 'latest' ? '#featured-comic' : '#main-comic';
  let image;

  /**
   * -'main-comic' is the container ID for comics
   * -however, the latest comic has a different
   * container ID which is named 'featured-comic'
   */

  if (number !== 'latest') {
    url += 'comics/';
    url += number != null ? number : 'random';
  }

  get(url).then(data => {
    // store DOM-like content
    const $ = load(data);
    const positionToCut = 2;
    // use cheerio (jquery like) to get 'src' attr
    image = $(container).attr('src').slice(positionToCut);
    sendComic(bot, chatID, image, null);
  })
    .catch(error => {
      console.log(error);
    });
}

function getXKCD(number, chatID) {
  /**
   * -every xkcd comic can be requested by calling the API with a
   * comic-specific url.
   * -more information: https://xkcd.com/json.html
   * -url is initially set to the latest comic.
   * -JSON of the latest comic also has the information about total amount of
   * available comics
   */

  let url = 'http://xkcd.com/info.0.json';
  // required to create a random number within the range of existing comics
  let amountComics;

  // if number == latest -> send the last comic that was released
  if (number === 'latest') {
    handleXkcdRequest(chatID, url);
  } else {

    /**
     * if a specific or random comic was requested -> get the amount of existing
     * comics first
     */
    get({ json: true, url }).then(data => {
      amountComics = data.num;
    })
      .then(() => {
        if (number == null || number > amountComics) {
          /**
           * set number to a random value if no number is given or if given
           * number exceeds the range
           */
          number = Math.floor(Math.random() * amountComics) + 1;
        }

        // change the API url to the corresponding request
        url = 'http://xkcd.com/' + number + '/info.0.json';
        handleXkcdRequest(chatID, url);
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function handleXkcdRequest(chatID, url) {
  get({ json: true, url })
    .then(data => {
      sendComic(bot, chatID, data.img, 'No.' + data.num + ': ' + data.alt);
      // data.alt is an alternative text which is featured on every xkcd comic
    });
}
