# Consent banner

This NPM package provides code for implementing a lightweight and accessible cookie / data consent banner on
Mozilla websites. This banner is used primarily by the Websites Team on sites such as www.mozilla.org,
but the code is provided here as a package should other teams at Mozilla find it useful.

## What does it do?

The package contains all the CSS/JS required for displaying a banner, the necessary functions for accepting
or rejecting cookies, as well as an event based system to help your website code to manage user consent
actions. The UI and copy has been reviewed by Mozilla's legal team, and has also undergone internal
[accessibility review][a11y-review]. The banner behavior defaults to opt-in for cookies, however it can also
be configured to be opt-out depending on your requirements.

[a11y-review]: https://bugzilla.mozilla.org/show_bug.cgi?id=1878274

## When should this banner be used?

Please see the Mozilla [confluence page][confluence-page] for an FAQ on how and when a cookie banner should
be used on Mozilla websites. You can also ask questions in the `#websites-cookie-banner` channel on Slack.

[confluence-page]: https://mozilla-hub.atlassian.net/wiki/spaces/EN/pages/538050566/Cookie+Banner+Implementation+On+Mozilla.org

## What does it not do?

This package does not take on responsibility for deciding **if** the banner should be displayed depending on
a website visitor's geographical location. That part is up to individual sites to decide what is required /
appropriate. Mozilla's legal team can help with guidance for individual sites to follow.

## Does the banner set a cookie that can be used across Mozilla subdomains?

Mozilla's legal team have stated that it is OK to assume that consent applies across `mozilla.org` subdomains,
as long as the technologies deployed on those subdomains function in the same way (and for the same purposes).
As such, the banner sets a consent cookie with a default domain of `.mozilla.org` when either accepting or
rejecting cookies.

It is therefore recommended to talk to legal about how your website uses cookies and other analytics tools
first, before using this banner. We should not assume that consent applies across Mozilla websites that are
on entirely different domains.

## How can visitors change their cookie settings after interacting with the banner?

There will be a [cookie settings page][cookie-setings-page] hosted on https://www.mozilla.org/ that explains
how Mozilla uses cookies and other analytics technologies. The page also enables people to update their cookie
settings after interacting with the banner. It is a legal requirement to link to this page in the banner UI,
as well as via a "Cookies" link in the website footer so that people can get back to it after the banner has
been dismissed.

> [!IMPORTANT]
> Mozilla websites should only link to the hosted cookie settings page above if their website is also hosted
> on a `mozilla.org` subdomain, and are using the default consent cookie that can be read across Mozilla
> subdomains. Mozilla websites on entirely different domains or using different consent cookies should implement
> their own settings page.

[cookie-setings-page]: https://www.mozilla.org/privacy/websites/cookie-settings/

## Installation

Install via NPM:

```
npm install @mozmeao/consent-banner --save
```

It is also required to install [@mozmeao/cookie-helper][cookie-helper] as a peer dependency.

[cookie-helper]: https://github.com/mozmeao/cookie-helper/

```
npm install @mozmeao/cookie-helper --save
```

## Usage

### Banner JavaScript

Import the banner via `import`, `require`, or by using a global variable in your script tag (choose one of
the methods below):

```javascript
// ES module
import MozConsentBanner from '@mozmeao/consent-banner';

// Common JS
const MozConsentBanner = require('@mozmeao/consent-banner');

// Global variable
const MozConsentBanner = window.MozConsentBanner;
```

You must also load `CookieHelper` (which can also be imported using any of the above methods), and pass that as an
option to the banner when initializing it:

```javascript
import CookieHelper from '@mozmeao/cookie-helper';
```

To initialize the banner:

```javascript
MozConsentBanner.init({
    helper: CookieHelper,
});
```

There are also several other optional arguments you can use when initializing the banner. A full list
of options are shown below:

| Option | Required | Type | Description | Default Value |
| ------ | -------- | ---- | ----------- | ------------- |
| cookieDomain | false | String | Sets a consent cookie for a specific host name | `.mozilla.org` |
| cookieExpiryDays | false | Number | Consent cookie expiry by number of days. | `182` (6 months) |
| cookieID | false | String | Consent cookie identifier. | `moz-consent-pref` |
| helper | true | Object | Reference to `@mozmeao/cookie-helper` peer dependency. | `null` |
| optOut | false | Boolean | Sets the banner to opt-out mode. | `false` |

#### Opening and closing the banner UI

The consent banner code aims to be UI independent, so it fires custom JavaScript events for when things should happen.
For example, when the banner should open a `mozConsentOpen` event is fired. And when the banner should close it fires a
`mozConsentClose` event. A website can add standard event listeners on the `window` object for these events.

```javascript
// Bind open and close events before calling init().
window.addEventListener('mozConsentOpen', openBanner, false);
window.addEventListener('mozConsentClose', closeBanner, false);

MozConsentBanner.init({
    helper: CookieHelper,
});
```

> [!IMPORTANT]
> The `mozConsentOpen` event listener should be bound before `init()` is called, since the event can fire straight away.

The `mozConsentOpen` event will be fired automatically when `init()` is called and a consent cookie does not yet exist.
Similarly, the `mozConsentClose` event will be fired when cookies are either accepted or rejected and the banner is no
longer needed to remain open.

Here are is a basic vanilla JS example for handling opening and closing the banner:

```javascript
function openBanner() {
    // Bind click event listeners for banner buttons
    document
        .getElementById('moz-consent-banner-button-accept')
        .addEventListener('click', MozConsentBanner.onAcceptClick, false);
    document
        .getElementById('moz-consent-banner-button-reject')
        .addEventListener('click', MozConsentBanner.onRejectClick, false);

    // Show the banner
    document.getElementById('moz-consent-banner').classList.add('is-visible');
}

function closeBanner() {
    // Unbind click event listeners
    document
        .getElementById('moz-consent-banner-button-accept')
        .removeEventListener('click', MozConsentBanner.onAcceptClick, false);
    document
        .getElementById('moz-consent-banner-button-reject')
        .removeEventListener('click', MozConsentBanner.onRejectClick, false);

    // Hide the banner
    document.getElementById('moz-consent-banner').classList.remove('is-visible');
}
```

### Consent cookie

When either accepting or rejecting cookies, a consent cookie with the following attribute key/value pairs is set.

| Attribute | Value |
| --------- | ----- |
| id | Defaults to `moz-consent-pref`. |
| value | A stringified JSON object representing a visitor's granular cookie consent settings e.g. `{ preference: true, analytics: false }`. Each key represents the consent status for "preference cookies" and "analytics cookies" respectively. |
| expiry | Defaults to 6 months from the date when the cookie is set. |
| path | Set to `/` so the cookie is readable from all pages. |
| domain | Defaults to the same domain where the cookie was created. If the website is a mozilla.org subdomain, then the cookie domain will be set to `.mozilla.org` so that it is readable across all mozilla.org subdomains. |
| samesite | Set to `lax`. |

### Listening for consent status in website code

When the accept or reject buttons are clicked, the banner's JavaScript will fire a custom `mozConsentStatus`
event. Your website's code can listen for this event and respond accordingly to determine if analytics scripts
should be loaded, or attribution code should be run.

```javascript
function initAnalytics(e) {
    const hasConsent = e.detail.analytics;

    if (hasConsent) {
        // Load analytics code / scripts here

        window.removeEventListener('mozConsentStatus', initAnalytics, false);
    }
}

window.addEventListener('mozConsentStatus', initAnalytics, false);
```

> [!IMPORTANT]
> To ensure that your front-end code receives events correctly, it is important to make sure that
> `MozConsentBanner.init()` is called **after** `mozConsentStatus` event listeners have been bound
> in your website's code. The easiest way to do this is to make sure the banner JS is the last
> script loaded in your web page, or to wait for the window `load` event to fire.

If the banner has been interacted with previously and a consent cookie already exists when `init()` is called,
a `mozConsentStatus` event will fire instead of a `mozConsentOpen` event.

### Banner HTML

As mentioned earlier, the banner JavaScript code is written in a way that aims to be _UI independent_. This is because
Mozilla websites are often built using different technology stacks for the front-end. Rather than try and take on the
role of rendering HTML, it is instead left to the website implementing the banner.

Here's an example of the recommended banner HTML markup:

```html
<aside class="moz-consent-banner" id="moz-consent-banner" role="region" aria-label="Cookie Banner" data-nosnippet="true">
    <div class="moz-consent-banner-content">
        <h2  class="moz-consent-banner-heading">Help us improve your Mozilla experience</h2>
        <div class="moz-consent-banner-copy">
            <p>
                In addition to cookies necessary for this site to function, we’d like your permission to set some additional
                Cookies to better understand your browsing needs and improve your experience. Rest assured - we value your privacy.
            </p>
            <div class="moz-consent-banner-controls">
                <button type="button" id="moz-consent-banner-button-reject" class="moz-consent-banner-button moz-consent-banner-button-reject">
                    Reject All Additional Cookies
                </button>
                <button type="button" id="moz-consent-banner-button-accept" class="moz-consent-banner-button moz-consent-banner-button-accept">
                    Accept All Additional Cookies
                </button>
                <a href="https://www.mozilla.org/privacy/websites/cookie-settings/">
                    Cookie settings
                </a>
            </div>
        </div>
    </div>
</aside>
```

You can also view the [demo file][demo] in the GitHub repository to see a working example of the banner HTML.

[demo]: https://github.com/mozmeao/consent-banner/blob/master/demo/index.html

#### HTML accessibility guidelines

The default banner CSS styling has undergone internal accessibility review, however there are a couple of important
things to note in the banner HTML:

- The banner should be an `<aside>` element, with `role="region"` and `aria-label="Cookie Banner"` attributes, so that
  the banner can easily be searched for and discovered by screen reader users.
- The banner should be the first element that appears in your page's HTML, ideally right after the opening `<body>`.
  This helps to ensure that the buttons appear early in keyboard focus order, so users don't have to tab through all of
  the web page content before reaching the banner.

### Banner CSS

You can import the banner Sass styles using:

```scss
@import '~@mozmeao/consent-banner/styles';
```

There's also a pre-compiled CSS file called `styles.css` in the package root which you can alternatively load:

```html
<link href="/path/to/styles.css" rel="stylesheet" type="text/css">
```

> [!NOTE]
> The banner CSS defines the [Inter][inter] web font as a `font-family`, falling back to `san-serif`. This package
> does not include the Inter font directly, so the it must be loaded separately if you wish to use it.

[inter]: https://rsms.me/inter/

### Browser support

The banner is supported in all modern evergreen web browsers. It should also work in legacy browsers as far back as
Internet Explorer 9.

## Local development

1. Download this repo: `git clone https://github.com/mozmeao/consent-banner.git`
2. Move into repo folder: `cd consent-banner`
3. Build the banner files: `npm install && npm start`
4. A demo page for local development should automatically open at http://localhost:8000/

### Running tests

To perform a run of the front-end JS tests using [Jasmine][jasmine] and [Jasmine Browser Runner][jasmine-browser-runner]
in both Firefox and Chrome:

```
npm run test
```

### Building the NPM package

We use a Webpack configuration for building the contents of the NPM package ready for publishing. To build the
package, run:

```
npm run build
```

This will lint files, run tests, and then build the NPM package content in the `./dist/` directory.

### Publishing to NPM

These steps assume you have logged into the NPM CLI and are apart of the @mozmeao organization on NPM.

The package is published to NPM under the `@mozmeao/consent-bannner` namespace/package name. To publish a
release to NPM, use the following steps:

1. Before you start make sure the project's [CHANGELOG.md][changelog] is up to date.
2. Update the package `version` number in [package.json][package.json] (use [Semantic Versioning][semver]
   to determine what the new version number should be).
3. Update the package README [README.md][readme].
4. Run `npm install` to update the `package-lock.json` file.
5. Submit a pull request with your against the `main` branch. Once the changes have been approved and merged to main:
6. Run `npm run build` to run the front-end tests and then build the final package. The package contents will be located in `./dist/`.
7. Tag a new release. You can do this either using [Git tag][git-tag], or directly on the [GitHub website][releases].
   (Example: `git tag -a v1.1.0`). If you used [Git tag][git-tag], push your tags to the repo using `git push --tags`
8. If the build is successful and all tests pass, publish to NPM using `npm publish ./dist/`.

[git-tag]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[package.json]: https://github.com/mozmeao/consent-banner/blob/master/package.json
[releases]: https://github.com/mozmeao/consent-banner/releases/latest
[readme]: https://github.commozmeao/consent-banner/blob/master/README.md
[changelog]: https://github.com/mozmeao/consent-banner/blob/master/CHANGELOG.md
[jasmine-browser-runner]: https://jasmine.github.io/setup/browser.html
[jasmine]: https://jasmine.github.io/
