import { mountAnalyticsConsent } from '@peekaplate/analytics/consent';
import './style.css';

const main = document.querySelector('main');
if (main) mountAnalyticsConsent(main, import.meta.env, 'diner');
