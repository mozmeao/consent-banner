/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import MozConsentBanner from '../src/index.js';
import CookieHelper from '@mozmeao/cookie-helper';

function clickAcceptButton() {
    document.getElementById('moz-consent-banner-button-accept').click();
}

function clickRejectButton() {
    document.getElementById('moz-consent-banner-button-accept').click();
}

describe('MozConsentBanner', function () {
    describe('init()', function () {
        let callbacks;

        beforeEach(function () {
            const banner = `<aside class="moz-consent-banner" id="moz-consent-banner" role="region" aria-label="Cookie Banner" data-nosnippet="true">
                <div class="moz-consent-banner-content">
                <h2 class="moz-consent-banner-heading">Banner heading</h2>
                <div class="moz-consent-banner-copy">
                    <p>Banner copy</p>
                    <div class="moz-consent-banner-controls">
                    <button type="button" id="moz-consent-banner-button-reject" class="moz-consent-banner-button-reject mzp-c-button">
                        Reject
                    </button>
                    <button type="button" id="moz-consent-banner-button-accept" class="moz-consent-banner-button-accept mzp-c-button">
                        Accept
                    </button>
                    <a href="https://www.mozilla.org/privacy/websites/cookie-settings/">Cookie settings</a>
                    </div>
                </div>
                </div>
            </aside>`;

            document.body.insertAdjacentHTML('beforeend', banner);

            callbacks = {
                openBanner: () => {
                    document
                        .getElementById('moz-consent-banner-button-accept')
                        .addEventListener(
                            'click',
                            MozConsentBanner.onAcceptClick,
                            false
                        );
                    document
                        .getElementById('moz-consent-banner-button-reject')
                        .addEventListener(
                            'click',
                            MozConsentBanner.onRejectClick,
                            false
                        );
                },
                closeBanner: () => {
                    document
                        .getElementById('moz-consent-banner-button-accept')
                        .removeEventListener(
                            'click',
                            MozConsentBanner.onAcceptClick,
                            false
                        );
                    document
                        .getElementById('moz-consent-banner-button-reject')
                        .removeEventListener(
                            'click',
                            MozConsentBanner.onRejectClick,
                            false
                        );
                }
            };

            spyOn(callbacks, 'openBanner').and.callThrough();
            spyOn(callbacks, 'closeBanner').and.callThrough();

            window.addEventListener(
                'mozConsentOpen',
                callbacks.openBanner,
                false
            );
            window.addEventListener(
                'mozConsentClose',
                callbacks.closeBanner,
                false
            );
        });

        afterEach(function () {
            const banner = document.getElementById('moz-consent-banner');

            if (banner) {
                banner.parentNode.removeChild(banner);
            }

            window.removeEventListener(
                'mozConsentOpen',
                callbacks.openBanner,
                false
            );
            window.removeEventListener(
                'mozConsentClose',
                callbacks.closeBanner,
                false
            );
        });

        it('should fire mozConsentOpen event when consent cookie does not exist', function () {
            spyOn(CookieHelper, 'setItem');

            const banner = MozConsentBanner.init({
                helper: CookieHelper
            });

            expect(banner).toBeTrue();
            expect(callbacks.openBanner).toHaveBeenCalled();
        });

        it('should fire mozConsentClose events when accept button is clicked', function () {
            spyOn(CookieHelper, 'setItem');

            const banner = MozConsentBanner.init({
                helper: CookieHelper
            });

            expect(banner).toBeTrue();
            expect(callbacks.openBanner).toHaveBeenCalled();
            clickAcceptButton();
            expect(callbacks.closeBanner).toHaveBeenCalled();
        });

        it('should fire mozConsentClose events when reject button is clicked', function () {
            spyOn(CookieHelper, 'setItem');

            const banner = MozConsentBanner.init({
                helper: CookieHelper
            });

            expect(banner).toBeTrue();
            expect(callbacks.openBanner).toHaveBeenCalled();
            clickRejectButton();
            expect(callbacks.closeBanner).toHaveBeenCalled();
        });

        it('should should fire a mozConsentStatus event when accept button is clicked', function () {
            spyOn(CookieHelper, 'setItem');

            const obj = {
                result: {},
                onChange: (e) => {
                    obj.result = e.detail;
                }
            };

            spyOn(obj, 'onChange').and.callThrough();

            window.addEventListener('mozConsentStatus', obj.onChange, false);

            MozConsentBanner.init({
                helper: CookieHelper
            });

            document.getElementById('moz-consent-banner-button-accept').click();

            expect(obj.onChange).toHaveBeenCalled();
            expect(obj.result).toEqual({
                analytics: true,
                preference: true
            });
        });

        it('should should fire a mozConsentStatus event when reject button is clicked', function () {
            spyOn(CookieHelper, 'setItem');

            const obj = {
                result: {},
                onChange: (e) => {
                    obj.result = e.detail;
                }
            };

            spyOn(obj, 'onChange').and.callThrough();

            window.addEventListener('mozConsentStatus', obj.onChange, false);

            MozConsentBanner.init({
                helper: CookieHelper
            });

            document.getElementById('moz-consent-banner-button-reject').click();

            expect(obj.onChange).toHaveBeenCalled();
            expect(obj.result).toEqual({
                analytics: false,
                preference: false
            });
        });

        it('should should set a consent cookie when accept button is clicked', function () {
            spyOn(CookieHelper, 'setItem');

            MozConsentBanner.init({
                helper: CookieHelper
            });

            document.getElementById('moz-consent-banner-button-accept').click();

            expect(CookieHelper.setItem).toHaveBeenCalledWith(
                'moz-consent-pref',
                '{"analytics":true,"preference":true}',
                jasmine.any(String),
                '/',
                null,
                false,
                'lax'
            );
        });

        it('should should set a consent cookie when reject button is clicked', function () {
            spyOn(CookieHelper, 'setItem');

            MozConsentBanner.init({
                helper: CookieHelper
            });

            document.getElementById('moz-consent-banner-button-reject').click();

            expect(CookieHelper.setItem).toHaveBeenCalledWith(
                'moz-consent-pref',
                '{"analytics":false,"preference":false}',
                jasmine.any(String),
                '/',
                null,
                false,
                'lax'
            );
        });

        it('should fire a mozConsentStatus event instead of mozConsentOpen if a consent cookie is already set', function () {
            spyOn(CookieHelper, 'setItem');

            const obj = {
                result: {},
                onChange: (e) => {
                    obj.result = e.detail;
                }
            };

            const config = {
                functional: true,
                analytics: false
            };

            spyOn(obj, 'onChange').and.callThrough();
            spyOn(MozConsentBanner, 'getConsentCookie').and.returnValue(config);

            window.addEventListener('mozConsentStatus', obj.onChange, false);

            MozConsentBanner.init({
                helper: CookieHelper
            });

            expect(callbacks.openBanner).not.toHaveBeenCalled();
            expect(obj.onChange).toHaveBeenCalled();
            expect(obj.result).toEqual(config);
        });

        it('should should fire a mozConsentStatus event as well as a mozConsentOpen event if the banner is set to opt-out', function () {
            spyOn(CookieHelper, 'setItem');

            const obj = {
                result: {},
                onChange: (e) => {
                    obj.result = e.detail;
                }
            };

            spyOn(obj, 'onChange').and.callThrough();

            window.addEventListener('mozConsentStatus', obj.onChange, false);

            MozConsentBanner.init({
                helper: CookieHelper,
                optOut: true
            });

            expect(callbacks.openBanner).toHaveBeenCalled();
            expect(obj.onChange).toHaveBeenCalled();
            expect(obj.result).toEqual({
                analytics: true,
                preference: true
            });
        });

        it('should should set a consent cookie with custom values as expected', function () {
            spyOn(CookieHelper, 'setItem');

            MozConsentBanner.init({
                cookieDomain: 'www.example.com',
                cookieID: 'my-custom-cookie',
                helper: CookieHelper
            });

            document.getElementById('moz-consent-banner-button-accept').click();

            expect(CookieHelper.setItem).toHaveBeenCalledWith(
                'my-custom-cookie',
                '{"analytics":true,"preference":true}',
                jasmine.any(String),
                '/',
                'www.example.com',
                false,
                'lax'
            );
        });

        it('should return false is options object is invalid', function () {
            spyOn(CookieHelper, 'setItem');

            spyOn(MozConsentBanner, 'verifyOptions').and.returnValue(
                'some non successful error message'
            );
            const banner = MozConsentBanner.init();
            expect(banner).toBeFalse();
        });
    });

    describe('verifyOptions', function () {
        let options;

        beforeEach(function () {
            options = {
                cookieDomain: null,
                cookieExpiryDays: 182,
                cookieID: 'moz-consent-pref',
                optOut: false,
                helper: CookieHelper
            };
        });

        it('should return an success message if supplied options are all valid', function () {
            const result = MozConsentBanner.verifyOptions(options);
            expect(result).toEqual('verifyOptions(): success.');
        });

        it('should return an error message if options.cookieExpiryDays is not set', function () {
            options.cookieExpiryDays = null;
            const result = MozConsentBanner.verifyOptions(options);
            expect(result).toEqual(
                'verifyOptions(): options.cookieExpiryDays not set.'
            );
        });

        it('should return an error message if options.helper is not set', function () {
            options.helper = null;
            const result = MozConsentBanner.verifyOptions(options);
            expect(result).toEqual('verifyOptions(): options.helper not set.');
        });

        it('should return an error message if options.optOut is not set', function () {
            options.optOut = null;
            const result = MozConsentBanner.verifyOptions(options);
            expect(result).toEqual('verifyOptions(): options.optOut not set.');
        });

        it('should return an error message if cookies are not enabled by the browser', function () {
            spyOn(CookieHelper, 'enabled').and.returnValue(false);
            const result = MozConsentBanner.verifyOptions(options);
            expect(result).toEqual('verifyOptions(): cookies are disabled.');
        });
    });

    describe('getHostName', function () {
        it('should return null by default', function () {
            const result = MozConsentBanner.getHostName();
            expect(result).toEqual(null);
        });

        it('should return ".mozilla.org" for mozilla.org subdomains', function () {
            const result1 = MozConsentBanner.getHostName('www.mozilla.org');
            expect(result1).toEqual('.mozilla.org');

            const result2 = MozConsentBanner.getHostName('support.mozilla.org');
            expect(result2).toEqual('.mozilla.org');

            const result3 = MozConsentBanner.getHostName('addons.mozilla.org');
            expect(result3).toEqual('.mozilla.org');
        });

        it('should return ".allizom.org" for mozilla.org staging subdomains', function () {
            const result1 = MozConsentBanner.getHostName('www.allizom.org');
            expect(result1).toEqual('.allizom.org');

            const result2 = MozConsentBanner.getHostName('www-dev.allizom.org');
            expect(result2).toEqual('.allizom.org');

            const result3 = MozConsentBanner.getHostName(
                'www-demo1.allizom.org'
            );
            expect(result3).toEqual('.allizom.org');
        });
    });
});
