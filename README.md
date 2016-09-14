# hcb-browser-info

Collects Browser Information.

## Installation

```bash
$ npm install hcb-browser-info
```

## Example
```js
var Browser = new BrowserInfo(window);
var data = Browser.collect();

// data includes all of the following Information
// but you can also access it directly from the created Browser object
var displayResolution   = data.displayResolution; // Browser.displayResolution
var displayIsRetina     = data.displayIsRetina; // Browser.displayIsRetina
var viewportSize        = data.viewportSize; // Browser.viewportSize
var name                = data.name; // Browser.name
var version             = data.version; // Browser.version
var cookiesEnabled      = data.cookiesEnabled; // Browser.cookiesEnabled
var localStorageEnabled = data.localStorageEnabled; // Browser.localStorageEnabled
var osName              = data.osName; // Browser.osName
var osVersion           = data.osVersion; // Browser.osVersion
```
