import { sendComic } from '../sendComic';
import { load } from 'cheerio';
import { get as g } from 'request-promise';
const get = g as any;

export function getExplosm(bot, number, chatID) {
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
    //url += number != null ? number : 'random';
    url += 'random';
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
