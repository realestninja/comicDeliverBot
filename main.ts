import * as TelegramBot from 'node-telegram-bot-api';
import * as process from 'process';

import { getExplosm } from './src/comic_types/getExplosm';
import { getXKCD } from './src/comic_types/getXKCD';

import { token, botSettings, url } from './settings';

/*
const bot = new TelegramBot(options, botSettings);
bot.setWebHook(url);
*/

const bot = new TelegramBot(token, { polling: true });

console.log('bot running - pid: ' +  process.pid);

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

    if (comicType in availableComicTypes) {
      const processComic = availableComicTypes[comicType];
      processComic(bot, comicNumber, chatID);
    }
  }
});
