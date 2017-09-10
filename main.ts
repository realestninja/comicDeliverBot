import * as TelegramBot from 'node-telegram-bot-api';
import { load } from 'cheerio';
import { get as g } from 'request-promise';

import { sendComic } from './src/sendComic';
import { getExplosm } from './src/comicTypes/getExplosm';
import { getXKCD } from './src/comicTypes/getXKCD';

import { token } from './token';

const get = g as any;
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
        getExplosm(bot, comicNumber, chatID);
        break;

      case '/xkcd':
        getXKCD(bot, comicNumber, chatID);
        break;

      default:
        break;
    }
  }
});
