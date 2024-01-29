import CookieHelper from '@mozmeao/cookie-helper';
import MozConsentBanner from '../src/index.js';

function openBanner() {
    // Bind event listeners
    document
        .getElementById('moz-consent-banner-button-accept')
        .addEventListener('click', MozConsentBanner.onAcceptClick, false);
    document
        .getElementById('moz-consent-banner-button-reject')
        .addEventListener('click', MozConsentBanner.onRejectClick, false);

    // Show banner
    document.getElementById('moz-consent-banner').classList.add('is-visible');
}

function closeBanner() {
    // Unbind event listeners
    document
        .getElementById('moz-consent-banner-button-accept')
        .removeEventListener('click', MozConsentBanner.onAcceptClick, false);
    document
        .getElementById('moz-consent-banner-button-reject')
        .removeEventListener('click', MozConsentBanner.onRejectClick, false);

    // Hide banner
    document
        .getElementById('moz-consent-banner')
        .classList.remove('is-visible');
}

// Bind event listeners before calling init().
window.addEventListener('mozConsentOpen', openBanner, false);
window.addEventListener('mozConsentClose', closeBanner, false);
window.addEventListener('mozConsentStatus', (e) => {
    console.log(e.detail); // eslint-disable-line no-console
});

MozConsentBanner.init({
    helper: CookieHelper
});
