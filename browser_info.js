"use strict";

;(function() {

	var root                 = this;
	var previous_BrowserInfo = root.BrowserInfo;

	var has_require = typeof require !== 'undefined';

	var BrowserInfo = root.BrowserInfo = function(win) {
		var self = this;

		if (!win || !win.document || !win.location || !win.alert || !win.setInterval) {
			throw new Error('BrowserInfo requires a valid window object.');
		}

		self.window = win;

		self.collect = function() {

			win = self.window || {};

			var unknown = 'Unknown';

			// display resolution
			if (win.screen && win.screen.width && win.screen.height) {
				self.displayResolution = '' + win.screen.width + ' x ' + win.screen.height;
			}
			else {
				self.displayResolution = unknown;
			}

			// display is retina
			var retinaMediaQuery = '(-webkit-min-device-pixel-ratio: 1.5),\
		            (min--moz-device-pixel-ratio: 1.5),\
		            (-o-min-device-pixel-ratio: 3/2),\
		            (min-resolution: 1.5dppx)';
			if (win.devicePixelRatio > 1) {
				self.displayIsRetina = true;
			}
			else if (win.matchMedia && win.matchMedia(retinaMediaQuery).matches) {
				self.displayIsRetina = true;
			}
			else {
				self.displayIsRetina = false;
			}

			// browser viewport size
			if (win.document && win.document.documentElement && win.document.documentElement.clientWidth && win.innerWidth) {
				var width = Math.max(win.document.documentElement.clientWidth, win.innerWidth || 0);
				var height = Math.max(win.document.documentElement.clientHeight, win.innerHeight || 0);
				self.viewportSize = '' + width + ' x ' + height;
			}
			else {
				self.viewportSize = unknown;
			}

			// browser name and version
			var nVer = win.navigator.appVersion;
			var nAgt = win.navigator.userAgent;
			var browser = win.navigator.appName;
			var version = '' + win.parseFloat(win.navigator.appVersion);
			var majorVersion = win.parseInt(win.navigator.appVersion, 10);
			var nameOffset, verOffset, ix;

			// Opera
			if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
				browser = 'Opera';
				version = nAgt.substring(verOffset + 6);
				if ((verOffset = nAgt.indexOf('Version')) !== -1) {
					version = nAgt.substring(verOffset + 8);
				}
			}

			// MSIE
			else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
				browser = 'Microsoft Internet Explorer';
				version = nAgt.substring(verOffset + 5);
			}

			//IE 11 no longer identifies itself as MS IE, so trap it
			//http://stackoverflow.com/questions/17907445/how-to-detect-ie11
			else if ((browser === 'Netscape') && (nAgt.indexOf('Trident/') !== -1)) {

				browser = 'Microsoft Internet Explorer';
				version = nAgt.substring(verOffset + 5);
				if ((verOffset = nAgt.indexOf('rv:')) !== -1) {
					version = nAgt.substring(verOffset + 3);
				}

			}

			// Edge
			else if ((verOffset = nAgt.indexOf('Edge')) !== -1) {
				browser = 'Edge';
				version = nAgt.substring(verOffset + 5);
			}

			// Chrome
			else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
				browser = 'Chrome';
				version = nAgt.substring(verOffset + 7);
			}

			// Safari
			else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
				browser = 'Safari';
				version = nAgt.substring(verOffset + 7);
				if ((verOffset = nAgt.indexOf('Version')) !== -1) {
					version = nAgt.substring(verOffset + 8);
				}

				// Chrome on iPad identifies itself as Safari. Actual results do not match what Google claims
				//  at: https://developers.google.com/chrome/mobile/docs/user-agent?hl=ja
				//  No mention of chrome in the user agent string. However it does mention CriOS, which presumably
				//  can be keyed on to detect it.
				if (nAgt.indexOf('CriOS') !== -1) {
					//Chrome on iPad spoofing Safari...correct it.
					browser = 'Chrome';
					//Don't believe there is a way to grab the accurate version number, so leaving that for now.
				}
			}

			// Firefox
			else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
				browser = 'Firefox';
				version = nAgt.substring(verOffset + 8);
			}

			// Other browsers
			else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
				browser = nAgt.substring(nameOffset, verOffset);
				version = nAgt.substring(verOffset + 1);
				if (browser.toLowerCase() === browser.toUpperCase()) {
					browser = win.navigator.appName;
				}
			}

			// trim the version string
			if ((ix = version.indexOf(';')) !== -1) version = version.substring(0, ix);
			if ((ix = version.indexOf(' ')) !== -1) version = version.substring(0, ix);
			if ((ix = version.indexOf(')')) !== -1) version = version.substring(0, ix);

			majorVersion = parseInt('' + version, 10);
			if (isNaN(majorVersion)) {
				version = '' + parseFloat(win.navigator.appVersion);
				majorVersion = parseInt(win.navigator.appVersion, 10);
			}

			self.name    = browser;
			self.version = version;

			// cookies enabled
			var cookiesEnabled = (win.navigator && win.navigator.cookieEnabled) ? true : false;

			if (win.navigator && typeof win.navigator.cookieEnabled === 'undefined' && !cookiesEnabled) {
				win.document.cookie = 'testcookie';
				cookiesEnabled = (win.document && win.document.cookie && win.document.cookie.indexOf('testcookie') !== -1) ? true : false;
			}

			self.cookiesEnabled = cookiesEnabled;

			// local storage enabled
			var localStorageTestString = 'browser-info';
			try {
				win.localStorage.setItem(localStorageTestString, localStorageTestString);
				win.localStorage.removeItem(localStorageTestString);
				win.sessionStorage.setItem(localStorageTestString, localStorageTestString);
				win.sessionStorage.removeItem(localStorageTestString);
				self.localStorageEnabled = true;
			} catch(e) {
				self.localStorageEnabled = false;
			}

			// os name and version
			var os = unknown;
			var clientStrings = [
				{s:'Windows 3.11', r:/Win16/},
				{s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
				{s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
				{s:'Windows 98', r:/(Windows 98|Win98)/},
				{s:'Windows CE', r:/Windows CE/},
				{s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
				{s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
				{s:'Windows Server 2003', r:/Windows NT 5.2/},
				{s:'Windows Vista', r:/Windows NT 6.0/},
				{s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
				{s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
				{s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
				{s:'Windows 10', r:/Windows NT 10.0/},
				{s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
				{s:'Windows ME', r:/Windows ME/},
				{s:'Android', r:/Android/},
				{s:'Open BSD', r:/OpenBSD/},
				{s:'Sun OS', r:/SunOS/},
				{s:'Linux', r:/(Linux|X11)/},
				{s:'iOS', r:/(iPhone|iPad|iPod)/},
				{s:'Mac OS X', r:/Mac OS X/},
				{s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
				{s:'QNX', r:/QNX/},
				{s:'UNIX', r:/UNIX/},
				{s:'BeOS', r:/BeOS/},
				{s:'OS/2', r:/OS\/2/},
				{s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
			];
			for (var id in clientStrings) {
				if (clientStrings.hasOwnProperty(id)) {
					var cs = clientStrings[id];
					if (cs.r.test(nAgt)) {
						os = cs.s;
						break;
					}
				}
			}

			var osVersion = unknown;

			if (/Windows/.test(os)) {
				osVersion = /Windows (.*)/.exec(os)[1];
				os = 'Windows';
			}

			switch (os) {
				case 'Mac OS X':
					osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
					break;
				case 'Android':
					osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
					break;
				case 'iOS':
					osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
					osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
					break;
			}

			self.osName    = os;
			self.osVersion = osVersion;

			return {
				displayResolution   : self.displayResolution,
				displayIsRetina     : self.displayIsRetina,
				viewportSize        : self.viewportSize,
				name                : self.name,
				version             : self.version,
				cookiesEnabled      : self.cookiesEnabled,
				localStorageEnabled : self.localStorageEnabled,
				osName              : self.osName,
				osVersion           : self.osVersion,
			};

		};

	};

	BrowserInfo.noConflict = function() {
		root.BrowserInfo = previous_BrowserInfo;
		return BrowserInfo;
	};

	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = BrowserInfo;
		}
		exports.BrowserInfo = BrowserInfo;
	}
	else {
		root.BrowserInfo = BrowserInfo;
	}

}).call(this);
