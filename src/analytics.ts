import * as analytics from 'nodealytics';
import { basicUrl, analyticsID } from '../settings';

analytics.initialize(analyticsID, basicUrl);

export function sendReport(comicType) {
  analytics.trackEvent('ComicType', comicType);
}
