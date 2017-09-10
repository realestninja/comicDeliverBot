import { sendComic } from '../sendComic';
import { get as g } from 'request-promise';
const get = g as any;

export function getXKCD(bot, number, chatID) {
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
    handleXkcdRequest(bot, chatID, url);
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
        handleXkcdRequest(bot, chatID, url);
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function handleXkcdRequest(bot, chatID, url) {
  get({ json: true, url })
    .then(data => {
      sendComic(bot, chatID, data.img, 'No.' + data.num + ': ' + data.alt);
      // data.alt is an alternative text which is featured on every xkcd comic
    });
}
