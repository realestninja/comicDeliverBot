export function sendComic(bot, chatID, img, text) {
  bot.sendMessage(chatID, img);

  if (text) {
    bot.sendMessage(chatID, text);
  }
}
