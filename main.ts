import * as TelegramBot from 'node-telegram-bot-api';

import { getExplosm } from './src/comic_types/getExplosm';
import { getXKCD } from './src/comic_types/getXKCD';

import { token } from './token';

const bot = new TelegramBot(token, { polling: true });

console.log('bot running');

bot.on('message', json => {
  if (json.hasOwnProperty('text')) {
    const chatID = json.chat.id;
    const message = json.text;
    const splitMessage = message.split(/[ ,]+/);
    const comicType = splitMessage[0];
    const comicNumber = splitMessage[1];

    const availableComicTypes = {
      '/explosm': getExplosm,
      '/xkcd': getXKCD,
    };

    const processComic = availableComicTypes[comicType];
    processComic(bot, comicNumber, chatID);
  }
});
