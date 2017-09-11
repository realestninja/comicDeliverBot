import * as TelegramBot from 'node-telegram-bot-api';

import { getExplosm } from './src/comic_types/getExplosm';
import { getXKCD } from './src/comic_types/getXKCD';

import { token } from './settings';
import { botSettings } from './settings';
import { url } from './settings';

const bot = new TelegramBot(token, botSettings);
bot.setWebHook(url);

// Just to ping!
bot.on('message', function onMessage(msg) {
  bot.sendMessage(msg.chat.id, 'I am alive on uberspace!');
});

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
