(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /*!
                                                                                                                                                                                                                                                                               * @realeyes/environment-checker version: 2.3.1
                                                                                                                                                                                                                                                                               * Built on: 2017-03-10T13:25:37.998Z
                                                                                                                                                                                                                                                                               * Released under the Apache License, Version 2.0
                                                                                                                                                                                                                                                                               * @copyright Realeyes OU. All rights reserved.
                                                                                                                                                                                                                                                                               */

var _swfobject = require('swfobject');

var _swfobject2 = _interopRequireDefault(_swfobject);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _environmentDetector = require('@realeyes/environment-detector');

var _environmentDetector2 = _interopRequireDefault(_environmentDetector);

var _browsers = require('@realeyes/environment-detector/lib/browsers');

var _browsers2 = _interopRequireDefault(_browsers);

var _platform = require('@realeyes/environment-detector/lib/platform');

var _platform2 = _interopRequireDefault(_platform);

var _capabilities = require('@realeyes/environment-detector/lib/capabilities');

var _capabilities2 = _interopRequireDefault(_capabilities);

var _Logger = require('@realeyes/environment-detector/lib/utils/Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var DEFAULT_FLASH_DETECTOR_PATH = 'https://codesdwncdn.realeyesit.com/environment-checker/release/2.3.1/environment-detector.swf';

/**
 * @typedef {{
 *   checksPassed: boolean,
 *   failureReasonCode: number,
 *   failureReasonString: string,
 *   detectorResult: EnvironmentDetectionResult,
 * }} EnvironmentCheckResult
 */

/**
 * Checks if element is present in the array.
 *
 * @param {Array} arr The array
 * @param {*} value The value
 * @return {boolean}
 */
function inArray(arr, value) {
    if (typeof Array.prototype.indexOf === 'function') {
        return arr.indexOf(value) !== -1;
    }

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            return true;
        }
    }

    return false;
}

/**
 * Compares the version strings.
 *
 * @param {string} v1 First version
 * @param {string} v2 Second version
 * @return {number}
 */
function compareVersions(v1, v2) {
    var s1 = v1.split('.');
    var s2 = v2.split('.');

    for (var i = 0; i < Math.max(s1.length, s2.length); i++) {
        var n1 = parseInt(s1[i] || 0, 10);
        var n2 = parseInt(s2[i] || 0, 10);

        if (n1 > n2) return 1;
        if (n2 > n1) return -1;
    }

    return 0;
}

/**
 * Returns the first match for the regexp.
 *
 * @param {string} str String
 * @param {RegExp} regex Regular expression used for matching
 * @return {string}
 */
function getFirstMatch(str, regex) {
    var match = str.match(regex);

    if (match && match.length > 1) {
        return match[1];
    }

    return '';
}

window.Realeyesit = window.Realeyesit || {};
window.Realeyesit.EnvironmentalDetectionAPI = {
    VERSION: '2.3.1',

    BLACKLISTED_FLASH_VERSIONS: ['11.4.31.110'],

    MIN_FLASH_VERSION: '10.2.0',

    BLACKLISTED_BROWSERS: [[_browsers2['default'].names.INTERNET_EXPLORER, '0-8'], [_browsers2['default'].names.FIREFOX, '0-3'], [_browsers2['default'].names.OPERA, '0-11']],

    checkResults: {
        checksPassed: null,
        failureReasonCode: null,
        failureReasonString: null
    },

    failureReasonCodes: {
        FLASH_NOT_INSTALLED: 1,
        FLASH_TOO_OLD: 2,
        FLASH_BLACKLISTED: 3,
        BROWSER_NOT_CAPABLE: 4,
        MOBILE_BROWSER: 5,
        NO_WEBCAMS_DETECTED: 6,
        OTHER_ERROR: 7
    },

    /**
     * Performs a list of checks and calls the callback with the checkResults object.
     *
     * @param {function({EnvironmentCheckResult})} callback Callback function
     * @param {*} flash Flash detection options
     * @param {*} logger Logging options
     * @return {undefined}
     */
    start: function start(callback) {
        var _this = this;

        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref$flash = _ref.flash,
            flash = _ref$flash === undefined ? { path: DEFAULT_FLASH_DETECTOR_PATH } : _ref$flash,
            _ref$logger = _ref.logger,
            logger = _ref$logger === undefined ? {} : _ref$logger;

        var loggerOpts = { disable: logger.disable, sid: (0, _v2['default'])() };
        var ecLogger = new _Logger2['default'](loggerOpts);
        ecLogger.log('environment-checker started', { version: this.VERSION });

        this.clearResults();
        this.checkResults.checksPassed = false;
        var ua = navigator.userAgent;
        var skip = [];

        if (/firefox/i.test(navigator.userAgent) && compareVersions(getFirstMatch(ua, /(?:firefox)[ /](\d+(\.\d+)?)/i), '31') >= 0 || /chrome/i.test(navigator.userAgent) && !/edge/i.test(ua) && compareVersions(getFirstMatch(ua, /(?:chrome)\/(\d+(\.\d+)?)/i), '38') >= 0 || /opera|opr|opios/i.test(navigator.userAgent) && compareVersions(getFirstMatch(ua, /(?:opera|opr|opios)[\s/](\d+(\.\d+)?)/i), '38') >= 0) {
            skip.push('flash');
        }

        var detectorOptions = { flash: flash, skip: skip, logger: loggerOpts };
        ecLogger.log('environment-checker calling detector', detectorOptions);

        (0, _environmentDetector2['default'])(detectorOptions).then(function (result) {
            ecLogger.log('environment-checker received detection result', result);

            var flashVersionString = '';

            if (!inArray(skip, 'flash')) {
                var flashVersion = (0, _swfobject2['default'])().getFlashPlayerVersion();
                flashVersionString = flashVersion.major + '.' + flashVersion.minor + '.' + flashVersion.release;
            }

            if (!_this.checkBrowser(result)) {
                _this.checkResults.failureReasonCode = _this.failureReasonCodes.BROWSER_NOT_CAPABLE;
                _this.checkResults.failureReasonString = 'BROWSER_NOT_CAPABLE';
            } else if (result.platform.type === _platform2['default'].types.MOBILE) {
                _this.checkResults.failureReasonCode = _this.failureReasonCodes.MOBILE_BROWSER;
                _this.checkResults.failureReasonString = 'MOBILE_BROWSER';
            } else if (result.flash === null) {
                _this.checkResults.failureReasonCode = _this.failureReasonCodes.FLASH_NOT_INSTALLED;
                _this.checkResults.failureReasonString = 'FLASH_NOT_INSTALLED';
            } else if (compareVersions(flashVersionString, _this.MIN_FLASH_VERSION) === -1) {
                _this.checkResults.failureReasonCode = _this.failureReasonCodes.FLASH_TOO_OLD;
                _this.checkResults.failureReasonString = 'FLASH_TOO_OLD';
            } else if (_this.BLACKLISTED_FLASH_VERSIONS.indexOf(result.flash.version) !== -1) {
                _this.checkResults.failureReasonCode = _this.failureReasonCodes.FLASH_BLACKLISTED;
                _this.checkResults.failureReasonString = 'FLASH_BLACKLISTED';
            } else if (result.flash.webcams.length === 0) {
                _this.checkResults.failureReasonCode = _this.failureReasonCodes.NO_WEBCAMS_DETECTED;
                _this.checkResults.failureReasonString = 'NO_WEBCAMS_DETECTED';
            } else {
                _this.checkResults.checksPassed = true;
            }

            if (result && _this.checkResults.failureReasonCode === _this.failureReasonCodes.FLASH_NOT_INSTALLED && inArray(skip, 'flash')) {
                if (result.webcams.length > 0) {
                    _this.checkResults.checksPassed = true;
                    _this.checkResults.failureReasonCode = null;
                    _this.checkResults.failureReasonString = null;
                } else {
                    _this.checkResults.failureReasonCode = _this.failureReasonCodes.NO_WEBCAMS_DETECTED;
                    _this.checkResults.failureReasonString = 'NO_WEBCAMS_DETECTED';
                }
            }

            _this.checkResults.detectorResult = result;

            ecLogger.log('environment-checker result', _this.checkResults);

            return callback(_this.checkResults);
        }, function (err) {
            _this.checkResults.failureReasonCode = _this.failureReasonCodes.OTHER_ERROR;
            _this.checkResults.failureReasonString = err.message;

            ecLogger.log('environment-checker error', err);

            return callback(_this.checkResults);
        });
    },


    /**
     * Checks if browser is capable for DC1 recording.
     *
     * @param {EnvironmentDetectionResult} res Environment check result
     * @return {boolean}
     */
    checkBrowser: function checkBrowser(res) {
        // TODO: this check is probably better to be performed in "@realeyes/environment-detector/lib/browsers" module
        // Detect IE <=7
        if (inArray(res.capabilities, _capabilities2['default'].names.DOCUMENT_ALL) && !inArray(res.capabilities, _capabilities2['default'].names.DOCUMENT_QUERY_SELECTOR)) {
            return false;
        }

        for (var i = 0; i < this.BLACKLISTED_BROWSERS.length; i++) {
            var name = this.BLACKLISTED_BROWSERS[i][0];

            var _BLACKLISTED_BROWSERS = this.BLACKLISTED_BROWSERS[i][1].split('-'),
                from = _BLACKLISTED_BROWSERS[0],
                to = _BLACKLISTED_BROWSERS[1];

            if (name === res.browser.name && compareVersions(res.browser.version, from) >= 0 && compareVersions(res.browser.version, to) <= 0) {
                return false;
            }
        }

        return true;
    },


    /**
     * Resets the checkResults object.
     *
     * @return {undefined}
     */
    clearResults: function clearResults() {
        this.checkResults = {
            checksPassed: null,
            failureReasonCode: null,
            failureReasonString: null
        };
    }
};

/* eslint-disable */
/**
 * Start detection immediately when window has a env detect callback.
 */
(function () {
    if (_typeof(window._RealeyesitEnvDetectParams) === 'object' && typeof window._RealeyesitEnvDetectParams._callback === 'function') {
        window.Realeyesit.EnvironmentalDetectionAPI.start(window._RealeyesitEnvDetectParams._callback);
    } else {
        if (typeof window._RealeyesitEnvDetectCallback === 'function') {
            window.Realeyesit.EnvironmentalDetectionAPI.start(window._RealeyesitEnvDetectCallback);
        }
    }
})();
/* eslint-enable */

},{"@realeyes/environment-detector":5,"@realeyes/environment-detector/lib/browsers":2,"@realeyes/environment-detector/lib/capabilities":3,"@realeyes/environment-detector/lib/platform":7,"@realeyes/environment-detector/lib/utils/Logger":9,"swfobject":21,"uuid/v4":24}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _getFirstMatch = require('./utils/getFirstMatch');

var _getFirstMatch2 = _interopRequireDefault(_getFirstMatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Enum for the browsers that we can detect.
 *
 * @enum {string}
 */
var names = {
    OPERA: 'Opera',
    SAMSUNG_BROWSER: 'Samsung Internet for Android',
    YANDEX_BROWSER: 'Yandex Browser',
    PUFFIN: 'Puffin',
    K_MELEON: 'K-Meleon',
    WINDOWS_PHONE: 'Windows Phone',
    INTERNET_EXPLORER: 'Internet Explorer',
    MICROSOFT_EDGE: 'Microsoft Edge',
    FIREFOX: 'Firefox',
    AMAZON_SILK: 'Amazon Silk',
    PHANTOM_JS: 'PhantomJS',
    CHROMIUM: 'Chromium',
    CHROME: 'Chrome',
    ANDROID: 'Android',
    SAFARI: 'Safari',
    UNKNOWN: 'Unknown'
};

/**
 * List of tests.
 */
/**
 * Browser detection.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

var tests = [{
    browserName: names.OPERA,
    testRegex: /opera|opr|opios/i,
    versionRegex: /(?:opera|opr|opios)[\s/](\d+(\.\d+)?)/i
}, {
    browserName: names.SAMSUNG_BROWSER,
    testRegex: /SamsungBrowser/i,
    versionRegex: /(?:SamsungBrowser)[\s/](\d+(\.\d+)?)/i
}, {
    browserName: names.YANDEX_BROWSER,
    testRegex: /yabrowser/i,
    versionRegex: /(?:yabrowser)[\s/](\d+(\.\d+)?)/i
}, {
    browserName: names.PUFFIN,
    testRegex: /puffin/i,
    versionRegex: /(?:puffin)[\s/](\d+(?:\.\d+)?)/i
}, {
    browserName: names.K_MELEON,
    testRegex: /k-meleon/i,
    versionRegex: /(?:k-meleon)[\s/](\d+(?:\.\d+)+)/i
}, {
    browserName: names.WINDOWS_PHONE,
    testRegex: /windows phone/i,
    versionRegex: /(?:iemobile|edge)\/(\d+(\.\d+)?)/i
}, {
    browserName: names.INTERNET_EXPLORER,
    testRegex: /msie|trident/i,
    versionRegex: /(?:msie |rv:)(\d+(\.\d+)?)/i
}, {
    browserName: names.MICROSOFT_EDGE,
    testRegex: /chrome.+? edge/i,
    versionRegex: /edge\/(\d+(\.\d+)?)/i
}, {
    browserName: names.FIREFOX,
    testRegex: /firefox|iceweasel|fxios/i,
    versionRegex: /(?:firefox|iceweasel|fxios)[ /](\d+(\.\d+)?)/i
}, {
    browserName: names.AMAZON_SILK,
    testRegex: /silk/i,
    versionRegex: /silk\/(\d+(\.\d+)?)/i
}, {
    browserName: names.PHANTOM_JS,
    testRegex: /phantom/i,
    versionRegex: /phantomjs\/(\d+(\.\d+)?)/i
}, {
    browserName: names.CHROMIUM,
    testRegex: /chromium/i,
    versionRegex: /(?:chromium)[\s/](\d+(?:\.\d+)?)/i
}, {
    browserName: names.CHROME,
    testRegex: /chrome|crios|crmo/i,
    versionRegex: /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i
}, {
    browserName: names.ANDROID,
    testRegex: /android/i,
    versionRegex: null
}, {
    browserName: names.SAFARI,
    testRegex: /safari|applewebkit/i,
    versionRegex: null
}];

exports['default'] = {
    names: names,

    /**
     * Detects current browser name and version.
     *
     * @param {string} ua User Agent string
     * @return {{
     *   name: string,
     *   version: ?string
     * }}
     */
    detect: function detect(ua) {
        for (var i = 0; i < tests.length; i++) {
            if (tests[i].testRegex.test(ua)) {
                return {
                    name: tests[i].browserName,
                    version: (0, _getFirstMatch2['default'])(ua, tests[i].versionRegex) || (0, _getFirstMatch2['default'])(ua, /version\/(\d+(\.\d+)?)/i) || null
                };
            }
        }

        return {
            name: names.UNKNOWN,
            version: null
        };
    }
};

},{"./utils/getFirstMatch":12}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _swfobject = require('swfobject');

var _swfobject2 = _interopRequireDefault(_swfobject);

var _inArray = require('./utils/inArray');

var _inArray2 = _interopRequireDefault(_inArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Enum for capabilities that we can detect.
 *
 * @enum
 */
/**
 * Capabilities detection.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

var names = {
    FLASH: 'flash',
    GET_USER_MEDIA: 'navigator.getUserMedia',
    MEDIA_RECORDER: 'MediaRecorder',
    WEBCAM: 'webcam',
    DOCUMENT_ALL: 'document.all',
    DOCUMENT_QUERY_SELECTOR: 'document.querySelector',
    HTTP: 'http',
    HTTPS: 'https',
    LOCALHOST: 'localhost'
};

/**
 * List of tests.
 */
var tests = [{
    capabilityName: names.FLASH,

    test: function test() {
        var s = (0, _swfobject2['default'])();
        var version = s.getFlashPlayerVersion();

        return !(version.major === 0 && version.minor === 0 && version.release === 0);
    }
}, {
    capabilityName: names.GET_USER_MEDIA,

    test: function test() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
}, {
    capabilityName: names.MEDIA_RECORDER,

    test: function test() {
        return typeof window.MediaRecorder === 'function';
    }
}, {
    capabilityName: names.DOCUMENT_ALL,

    test: function test() {
        return document.querySelector !== undefined;
    }
}, {
    capabilityName: names.DOCUMENT_QUERY_SELECTOR,

    test: function test() {
        return typeof document.querySelector === 'function';
    }
}, {
    capabilityName: names.HTTP,

    test: function test() {
        return document.location.protocol === 'http:';
    }
}, {
    capabilityName: names.HTTPS,

    test: function test() {
        return document.location.protocol === 'https:';
    }
}, {
    capabilityName: names.LOCALHOST,

    test: function test() {
        return document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1';
    }
}];

exports['default'] = {
    names: names,

    /**
     * Returns the list of capabilities available in current browser.
     *
     * @param {Array.<string>} skip Array of checks to skip
     * @return {Array.<string>}
     */
    detect: function detect() {
        var skip = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        var results = [];

        for (var i = 0; i < tests.length; i++) {
            if (!(0, _inArray2['default'])(skip, tests[i].capabilityName) && tests[i].test()) {
                results.push(tests[i].capabilityName);
            }
        }

        return results;
    }
};

},{"./utils/inArray":13,"swfobject":21}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _nativePromiseOnly = require('native-promise-only');

var _nativePromiseOnly2 = _interopRequireDefault(_nativePromiseOnly);

var _swfobject = require('swfobject');

var _swfobject2 = _interopRequireDefault(_swfobject);

var _timeout = require('./utils/timeout');

var _timeout2 = _interopRequireDefault(_timeout);

var _waitForDocumentReady = require('./utils/waitForDocumentReady');

var _waitForDocumentReady2 = _interopRequireDefault(_waitForDocumentReady);

var _currentScriptPath = require('./utils/currentScriptPath');

var _currentScriptPath2 = _interopRequireDefault(_currentScriptPath);

var _visible = require('./utils/visible');

var _visible2 = _interopRequireDefault(_visible);

var _FlashDetectionError = require('./utils/FlashDetectionError');

var _FlashDetectionError2 = _interopRequireDefault(_FlashDetectionError);

var _TimeoutError = require('./utils/TimeoutError');

var _TimeoutError2 = _interopRequireDefault(_TimeoutError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * @typedef {?{
 *   version: string,
 *   webcams: Array.<string>
 * }} FlashResult
 */

/**
 * Flash detector default options.
 */
/**
 * Flash detection.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

var DEFAULT_SWF_PATH = _currentScriptPath2['default'] + 'environment-detector.swf';
var DEFAULT_TEST_TIMEOUT = 10000;
var DEFAULT_CONTAINER_ID = 'Realeyesit_FlashEnvironmentDetector';
var DEFAULT_MIN_FLASH_VERSION = '10.2.0';

/**
 * Caches the flash object element.
 */
var flashEl = void 0;

exports['default'] = {
    /**
     * Embeds the SWF and resolves with the detection result.
     *
     * @param {string} path The url of swf
     * @param {string} containerId Placeholder element id
     * @param {string} minFlashVersion Target player version
     * @return {Promise.<FlashResult>}
     */
    embedSWF: function embedSWF(path, containerId, minFlashVersion) {
        return new _nativePromiseOnly2['default'](function (resolve, reject) {
            var s = (0, _swfobject2['default'])();

            // immediately resolve if we have a cached flash element
            if (flashEl !== undefined) {
                resolve(flashEl);
                return;
            }

            // create a flash placeholder element
            var container = document.createElement('div');
            container.id = containerId;
            document.body.appendChild(container);

            // use CSS to set flash object style, otherwise the flash ExternalInterface does not work in Safari
            s.createCSS('#' + containerId, 'position: absolute; top: -10px;');
            s.embedSWF(path, // the url of swf
            containerId, // placeholder element id
            '10', // width
            '1', // height
            minFlashVersion, // target player version
            null, // express install swf url
            null, // flashvars
            { allowScriptAccess: 'always' }, // object params
            null, // object attributes
            function (e) {
                // callback function
                if (!e.success) {
                    reject(new _FlashDetectionError2['default']());
                } else {
                    window.Realeyesit = window.Realeyesit || {};
                    window.Realeyesit.FlashEnvironmentDetectorReady = resolve;
                }
            });
        });
    },


    /**
     * Performs a flash detection. Resolves with the version of flash and array of webcam names.
     *
     * @param {string} path Url of the swf checker component
     * @param {boolean} skip Skip flash check
     * @param {Logger} logger Skip flash check
     * @param {number} testTimeout Timeout for the test in ms
     * @param {string} containerId Id of the placeholder element
     * @param {string} minFlashVersion Target player version
     * @return {Promise.<FlashResult>}
     */
    detect: function detect() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$path = _ref.path,
            path = _ref$path === undefined ? DEFAULT_SWF_PATH : _ref$path,
            _ref$testTimeout = _ref.testTimeout,
            testTimeout = _ref$testTimeout === undefined ? DEFAULT_TEST_TIMEOUT : _ref$testTimeout,
            _ref$containerId = _ref.containerId,
            containerId = _ref$containerId === undefined ? DEFAULT_CONTAINER_ID : _ref$containerId,
            _ref$minFlashVersion = _ref.minFlashVersion,
            minFlashVersion = _ref$minFlashVersion === undefined ? DEFAULT_MIN_FLASH_VERSION : _ref$minFlashVersion;

        var _this = this;

        var skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var logger = arguments[2];

        if (skip) {
            logger.log('environment-detector/flash detection skipped');

            return _nativePromiseOnly2['default'].resolve(null);
        }

        logger.log('environment-detector/flash detection started');

        return (0, _visible2['default'])().then(function () {
            logger.log('environment-detector/flash page visible');

            return (0, _timeout2['default'])(testTimeout, (0, _waitForDocumentReady2['default'])().then(function () {
                logger.log('environment-detector/flash document ready');

                return _this.embedSWF(path, containerId, minFlashVersion);
            }))['catch'](function (e) {
                if (e instanceof _FlashDetectionError2['default']) {
                    logger.log('environment-detector/flash embedding failed');
                } else if (e instanceof _TimeoutError2['default']) {
                    logger.log('environment-detector/flash detection timed out');
                } else {
                    logger.log('environment-detector/flash detection failed for unknown reason');
                }

                return null;
            });
        });
    }
};

},{"./utils/FlashDetectionError":8,"./utils/TimeoutError":10,"./utils/currentScriptPath":11,"./utils/timeout":14,"./utils/visible":15,"./utils/waitForDocumentReady":16,"native-promise-only":20,"swfobject":21}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = detect;

var _browsers = require('./browsers');

var _browsers2 = _interopRequireDefault(_browsers);

var _platform = require('./platform');

var _platform2 = _interopRequireDefault(_platform);

var _os = require('./os');

var _os2 = _interopRequireDefault(_os);

var _capabilities = require('./capabilities');

var _capabilities2 = _interopRequireDefault(_capabilities);

var _flash = require('./flash');

var _flash2 = _interopRequireDefault(_flash);

var _webcam = require('./webcam');

var _webcam2 = _interopRequireDefault(_webcam);

var _Logger = require('./utils/Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _inArray = require('./utils/inArray');

var _inArray2 = _interopRequireDefault(_inArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * @typedef {{
 *   browser: {
 *     name: string,
 *     version: string,
 *   },
 *   platform: {
 *     type: string,
 *   },
 *   os: {
 *     name: string,
 *     version: string,
 *   },
 *   flash: ?{
 *     version: string,
 *     webcams: Array.<string>,
 *   },
 *   webcams: Array.<string>,
 *   capabilities: Array.<string>,
 * }} EnvironmentDetectionResult
 */

/**
 * @typedef {{
 *   flash: ?{
 *     path: ?string,
 *     testTimeout: ?number,
 *     containerId: ?string,
 *     minFlashVersion: ?string,
 *   },
 *   skip: Array.<string>,
 *   logger: ?{
 *      path: ?string,
 *      disable: ?boolean,
 *   },
 * }} EnvironmentDetectionOptions
 */

/**
 * @param {?EnvironmentDetectionOptions} options Options
 * @return {Promise.<EnvironmentDetectionResult>}
 */
/**
 * Environment detection function.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

function detect() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var ua = navigator.userAgent;
    var logger = new _Logger2['default'](options.logger);
    var skipFlash = options.skip && (0, _inArray2['default'])(options.skip, 'flash');

    logger.log('environment-detector started', options);

    return _flash2['default'].detect(options.flash, skipFlash, logger).then(function (flashResult) {
        return _webcam2['default'].detect(flashResult).then(function (webcamsResult) {
            var result = {
                browser: _browsers2['default'].detect(ua),
                platform: _platform2['default'].detect(ua),
                os: _os2['default'].detect(ua),
                flash: flashResult,
                webcams: webcamsResult,
                capabilities: _capabilities2['default'].detect(options.skip)
            };

            logger.log('environment-detector result', result);

            return result;
        });
    })['catch'](function (e) {
        logger.log('environment-detector failed', e);

        throw e;
    });
}

},{"./browsers":2,"./capabilities":3,"./flash":4,"./os":6,"./platform":7,"./utils/Logger":9,"./utils/inArray":13,"./webcam":17}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _getFirstMatch = require('./utils/getFirstMatch');

var _getFirstMatch2 = _interopRequireDefault(_getFirstMatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Enum for OSs that we can detect.
 *
 * @enum {string}
 */
var names = {
    WINDOWS_PHONE: 'windowsphone',
    IOS: 'ios',
    ANDROID: 'android',
    MAC_OS: 'macos',
    WINDOWS: 'windows',
    LINUX: 'linux',
    UNKNOWN: 'unknown'
};

/**
 * List of tests.
 */
/**
 * OS detection.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

var tests = [{
    osName: names.WINDOWS_PHONE,
    testRegex: /windows phone/i,
    getVersion: function getVersion(ua) {
        return (0, _getFirstMatch2['default'])(ua, /windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    }
}, {
    osName: names.IOS,
    testRegex: /(ipod|iphone|ipad)/i,
    getVersion: function getVersion(ua) {
        return (0, _getFirstMatch2['default'])(ua, /os (\d+([_\s]\d+)*) like mac os x/i).split('_').join('.');
    }
}, {
    osName: names.ANDROID,
    testRegex: /^((?!.*like android).*android)|silk/i,
    getVersion: function getVersion(ua) {
        return (0, _getFirstMatch2['default'])(ua, /android[ /-](\d+(\.\d+)*)/i);
    }
}, {
    osName: names.MAC_OS,
    testRegex: /macintosh/i,
    getVersion: function getVersion(ua) {
        return ua.replace(/.*?OS X (.*?)(\)|;).*/, '$1').split('_').join('.');
    }
}, {
    osName: names.WINDOWS,
    testRegex: /windows/i,
    getVersion: function getVersion(ua) {
        return ua.replace(/.*?Windows (.*?)(\)|;).*/, '$1');
    }
}, {
    osName: names.LINUX,
    testRegex: /linux/i,
    getVersion: function getVersion() {
        return null;
    }
}];

exports['default'] = {
    names: names,

    /**
     * Returns the OS name and version.
     *
     * @param {string} ua User Agent string
     * @return {{
     *   name: string,
     *   version: ?string
     * }}
     */
    detect: function detect(ua) {
        for (var i = 0; i < tests.length; i++) {
            if (tests[i].testRegex.test(ua)) {
                return {
                    name: tests[i].osName,
                    version: tests[i].getVersion(ua) || (0, _getFirstMatch2['default'])(ua, /version\/(\d+\.\d+)/i) || null
                };
            }
        }

        return {
            name: names.UNKNOWN,
            version: null
        };
    }
};

},{"./utils/getFirstMatch":12}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _getFirstMatch = require('./utils/getFirstMatch');

var _getFirstMatch2 = _interopRequireDefault(_getFirstMatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Enum for platform types that we can detect.
 *
 * @enum {string}
 */
var types = {
    MOBILE: 'mobile',
    TABLET: 'tablet',
    DESKTOP: 'desktop'
}; /**
    * Platform detection.
    *
    * Based on code from https://github.com/ded/bowser by Dustin Diaz.
    *
    * @copyright Realeyes OU. All rights reserved.
    */

exports['default'] = {
    types: types,

    /**
     * Returns the platform type
     *
     * @param {string} ua User agent string
     * @return {{
     *   type: string
     * }}
     */
    detect: function detect(ua) {
        var tablet = /tablet/i.test(ua);
        var mobile = !tablet && /[^-]mobi/i.test(ua);
        var ios = (0, _getFirstMatch2['default'])(ua, /(ipod|iphone|ipad)/i).toLowerCase();
        var likeAndroid = /like android/i.test(ua);
        var android = !likeAndroid && /android/i.test(ua);
        var nexusMobile = /nexus\s*[0-6]\s*/i.test(ua);
        var nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua);
        var androidVersion = (0, _getFirstMatch2['default'])(ua, /android[ /-](\d+(\.\d+)*)/i).split('.')[0];
        var silk = /silk/i.test(ua);

        if (tablet || nexusTablet || ios === 'ipad' || android && (+androidVersion === 3 || +androidVersion >= 4 && !mobile) || silk) {
            return { type: types.TABLET };
        } else if (mobile || nexusMobile) {
            return { type: types.MOBILE };
        }

        return { type: types.DESKTOP };
    }
};

},{"./utils/getFirstMatch":12}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _es6Error = require('es6-error');

var _es6Error2 = _interopRequireDefault(_es6Error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * FlashDetectionError.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @copyright Realeyes OU. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var FlashDetectionError = function (_ExtendableError) {
  _inherits(FlashDetectionError, _ExtendableError);

  function FlashDetectionError() {
    _classCallCheck(this, FlashDetectionError);

    return _possibleConstructorReturn(this, _ExtendableError.apply(this, arguments));
  }

  return FlashDetectionError;
}(_es6Error2['default']);

exports['default'] = FlashDetectionError;

},{"es6-error":18}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _json = require('json3');

var _json2 = _interopRequireDefault(_json);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _currentScriptPath = require('./currentScriptPath');

var _currentScriptPath2 = _interopRequireDefault(_currentScriptPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Logger.
                                                                                                                                                           *
                                                                                                                                                           * @copyright Realeyes OU. All rights reserved.
                                                                                                                                                           */

var DEFAULT_LOGGER_PATH = _currentScriptPath2['default'] + 'log.gif';

var Logger = function () {
    /**
     * Creates a Logger instance.
     *
     * @param {string} path Path to the tracking pixel
     * @param {boolean} disable Pass true to disable logging
     * @param {string} sid Session ID
     */
    function Logger() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$path = _ref.path,
            path = _ref$path === undefined ? DEFAULT_LOGGER_PATH : _ref$path,
            _ref$disable = _ref.disable,
            disable = _ref$disable === undefined ? false : _ref$disable,
            _ref$sid = _ref.sid,
            sid = _ref$sid === undefined ? (0, _v2['default'])() : _ref$sid;

        _classCallCheck(this, Logger);

        this.sid = sid;
        this.pending = Promise.resolve();
        this.path = path;
        this.disabled = disable;
    }

    /**
     * Sends the log message.
     *
     * @param {string} name Log message name
     * @param {Object} data Log message payload
     * @return {undefined}
     */


    Logger.prototype.log = function log(name) {
        var _this = this;

        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.disabled) {
            return;
        }

        var msg = {
            ts: +new Date(),
            sid: this.sid,
            name: name,
            data: data
        };

        this.pending = this.pending.then(new Promise(function (resolve) {
            var img = document.createElement('img');
            var done = function done() {
                img.parentNode.removeChild(img);
                resolve();
            };
            img.style.position = 'absolute';
            img.style.top = '-10px';
            img.onload = done;
            img.onerror = done;
            img.src = _this.path + '?msg=' + encodeURIComponent(_json2['default'].stringify(msg));
            document.body.appendChild(img);
        }));
    };

    return Logger;
}();

exports['default'] = Logger;

},{"./currentScriptPath":11,"json3":19,"uuid/v4":24}],10:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _es6Error = require('es6-error');

var _es6Error2 = _interopRequireDefault(_es6Error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * TimeoutError.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @copyright Realeyes OU. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var TimeoutError = function (_ExtendableError) {
  _inherits(TimeoutError, _ExtendableError);

  function TimeoutError() {
    _classCallCheck(this, TimeoutError);

    return _possibleConstructorReturn(this, _ExtendableError.apply(this, arguments));
  }

  return TimeoutError;
}(_es6Error2['default']);

exports['default'] = TimeoutError;

},{"es6-error":18}],11:[function(require,module,exports){
'use strict';

exports.__esModule = true;
/**
 * currentScriptPath helper.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

/**
 * Returns the current script path.
 *
 * @return {string}
 */
function getPath() {
  if (document.currentScript !== undefined) {
    return document.currentScript.src.split('/').slice(0, -1).join('/') + '/';
  }

  // Try to guess the script path in old browsers that do not support "document.currentScript" by parsing the "src"
  // property of the last script tag in the document this will only work if the environment-checker.js bundle was
  // included in the html document directly not using "async" of "defer" attributes.
  // This will also give wrong result if the script tag was
  // embedded dynamically and was not inserted after the last script tag in the document.
  //
  // If the environment-checker.js was embedded using one of the mentioned techniques please use the
  // EnvironmentDetectionOptions to pass the flash.path string to the library.
  var scripts = document.getElementsByTagName('script');
  var src = scripts[scripts.length - 1].src.split('?')[0];

  return src.split('/').slice(0, -1).join('/') + '/';
}

exports['default'] = getPath();

},{}],12:[function(require,module,exports){
'use strict';

exports.__esModule = true;

/**
 * getFirstMatch helper.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

/**
 * Returns the first match for the regexp.
 *
 * @param {string} str String
 * @param {RegExp} regex Regular expression used for matching
 * @return {string}
 */
exports['default'] = function (str, regex) {
  var match = str.match(regex);

  if (match && match.length > 1) {
    return match[1];
  }

  return '';
};

},{}],13:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = inArray;
/**
 * inArray helper.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

/**
 * Checks if element is present in the array.
 *
 * @param {Array} arr The array
 * @param {*} value The value
 * @return {boolean}
 */
function inArray(arr, value) {
    if (typeof Array.prototype.indexOf === 'function') {
        return arr.indexOf(value) !== -1;
    }

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            return true;
        }
    }

    return false;
}

},{}],14:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = timeout;

var _nativePromiseOnly = require('native-promise-only');

var _nativePromiseOnly2 = _interopRequireDefault(_nativePromiseOnly);

var _TimeoutError = require('./TimeoutError');

var _TimeoutError2 = _interopRequireDefault(_TimeoutError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Rejects a pending promise after a specified timeout.
 *
 * @param {number} ms Number of milliseconds to wait before the call will be rejected
 * @param {Promise} promise Promise to execute
 * @return {Promise}
 */
/**
 * timeout helper.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

function timeout(ms, promise) {
    var pending = true;

    return _nativePromiseOnly2['default'].race([promise.then(function (v) {
        pending = false;return v;
    }), new _nativePromiseOnly2['default'](function (_, reject) {
        return setTimeout(function () {
            if (pending) {
                reject(new _TimeoutError2['default']());
            }
        }, ms);
    })]);
}

},{"./TimeoutError":10,"native-promise-only":20}],15:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _visibilityjs = require('visibilityjs');

var _visibilityjs2 = _interopRequireDefault(_visibilityjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function () {
  return new Promise(function (resolve) {
    _visibilityjs2['default'].onVisible(resolve);
  });
}; /**
    * visibility wrapper.
    *
    * @copyright Realeyes OU. All rights reserved.
    */

},{"visibilityjs":25}],16:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function () {
    return new Promise(function (resolve) {
        if (document.readyState === 'complete') {
            resolve();
            return;
        }

        if (typeof document.addEventListener === 'function') {
            // modern browsers
            document.addEventListener('readystatechange', function () {
                if (document.readyState === 'complete') {
                    resolve();
                }
            });
        } else if (window.attachEvent) {
            // old browsers
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState === 'complete') {
                    resolve();
                }
            });
        }
    });
};

},{}],17:[function(require,module,exports){
'use strict';

exports.__esModule = true;
/**
 * Webcam detection.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

exports['default'] = {
    /**
     * Returns the array of detected webcams.
     *
     * @param {FlashResult} flashResult Flash result object
     * @return {Promise.<Array.<string>>}
     */
    detect: function detect(flashResult) {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            return navigator.mediaDevices.enumerateDevices().then(function (devices) {
                var result = [];

                for (var i = 0; i < devices.length; i++) {
                    if (devices[i].kind === 'videoinput') {
                        var name = devices[i].label ? devices[i].label : 'unknown';
                        result.push(name);
                    }
                }

                return result;
            });
        } else if (flashResult !== null) {
            return Promise.resolve(flashResult.webcams);
        }

        return Promise.resolve([]);
    }
};

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    cls.apply(this, arguments);
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var ExtendableError = function (_extendableBuiltin2) {
  _inherits(ExtendableError, _extendableBuiltin2);

  function ExtendableError() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, ExtendableError);

    // extending Error is weird and does not propagate `message`
    var _this = _possibleConstructorReturn(this, (ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call(this, message));

    Object.defineProperty(_this, 'message', {
      configurable: true,
      enumerable: false,
      value: message,
      writable: true
    });

    Object.defineProperty(_this, 'name', {
      configurable: true,
      enumerable: false,
      value: _this.constructor.name,
      writable: true
    });

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(_this, _this.constructor);
      return _possibleConstructorReturn(_this);
    }

    Object.defineProperty(_this, 'stack', {
      configurable: true,
      enumerable: false,
      value: new Error(message).stack,
      writable: true
    });
    return _this;
  }

  return ExtendableError;
}(_extendableBuiltin(Error));

exports.default = ExtendableError;
module.exports = exports['default'];

},{}],19:[function(require,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],20:[function(require,module,exports){
(function (global){
/*! Native Promise Only
    v0.8.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	// special form of UMD for polyfilling across evironments
	context[name] = context[name] || definition();
	if (typeof module != "undefined" && module.exports) { module.exports = context[name]; }
	else if (typeof define == "function" && define.amd) { define(function $AMD$(){ return context[name]; }); }
})("Promise",typeof global != "undefined" ? global : this,function DEF(){
	/*jshint validthis:true */
	"use strict";

	var builtInProp, cycle, scheduling_queue,
		ToString = Object.prototype.toString,
		timer = (typeof setImmediate != "undefined") ?
			function timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// dammit, IE8.
	try {
		Object.defineProperty({},"x",{});
		builtInProp = function builtInProp(obj,name,val,config) {
			return Object.defineProperty(obj,name,{
				value: val,
				writable: true,
				configurable: config !== false
			});
		};
	}
	catch (err) {
		builtInProp = function builtInProp(obj,name,val) {
			obj[name] = val;
			return obj;
		};
	}

	// Note: using a queue instead of array for efficiency
	scheduling_queue = (function Queue() {
		var first, last, item;

		function Item(fn,self) {
			this.fn = fn;
			this.self = self;
			this.next = void 0;
		}

		return {
			add: function add(fn,self) {
				item = new Item(fn,self);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function drain() {
				var f = first;
				first = last = cycle = void 0;

				while (f) {
					f.fn.call(f.self);
					f = f.next;
				}
			}
		};
	})();

	function schedule(fn,self) {
		scheduling_queue.add(fn,self);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	// promise duck typing
	function isThenable(o) {
		var _then, o_type = typeof o;

		if (o != null &&
			(
				o_type == "object" || o_type == "function"
			)
		) {
			_then = o.then;
		}
		return typeof _then == "function" ? _then : false;
	}

	function notify() {
		for (var i=0; i<this.chain.length; i++) {
			notifyIsolated(
				this,
				(this.state === 1) ? this.chain[i].success : this.chain[i].failure,
				this.chain[i]
			);
		}
		this.chain.length = 0;
	}

	// NOTE: This is a separate function to isolate
	// the `try..catch` so that other code can be
	// optimized better
	function notifyIsolated(self,cb,chain) {
		var ret, _then;
		try {
			if (cb === false) {
				chain.reject(self.msg);
			}
			else {
				if (cb === true) {
					ret = self.msg;
				}
				else {
					ret = cb.call(void 0,self.msg);
				}

				if (ret === chain.promise) {
					chain.reject(TypeError("Promise-chain cycle"));
				}
				else if (_then = isThenable(ret)) {
					_then.call(ret,chain.resolve,chain.reject);
				}
				else {
					chain.resolve(ret);
				}
			}
		}
		catch (err) {
			chain.reject(err);
		}
	}

	function resolve(msg) {
		var _then, self = this;

		// already triggered?
		if (self.triggered) { return; }

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		try {
			if (_then = isThenable(msg)) {
				schedule(function(){
					var def_wrapper = new MakeDefWrapper(self);
					try {
						_then.call(msg,
							function $resolve$(){ resolve.apply(def_wrapper,arguments); },
							function $reject$(){ reject.apply(def_wrapper,arguments); }
						);
					}
					catch (err) {
						reject.call(def_wrapper,err);
					}
				})
			}
			else {
				self.msg = msg;
				self.state = 1;
				if (self.chain.length > 0) {
					schedule(notify,self);
				}
			}
		}
		catch (err) {
			reject.call(new MakeDefWrapper(self),err);
		}
	}

	function reject(msg) {
		var self = this;

		// already triggered?
		if (self.triggered) { return; }

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		self.msg = msg;
		self.state = 2;
		if (self.chain.length > 0) {
			schedule(notify,self);
		}
	}

	function iteratePromises(Constructor,arr,resolver,rejecter) {
		for (var idx=0; idx<arr.length; idx++) {
			(function IIFE(idx){
				Constructor.resolve(arr[idx])
				.then(
					function $resolver$(msg){
						resolver(idx,msg);
					},
					rejecter
				);
			})(idx);
		}
	}

	function MakeDefWrapper(self) {
		this.def = self;
		this.triggered = false;
	}

	function MakeDef(self) {
		this.promise = self;
		this.state = 0;
		this.triggered = false;
		this.chain = [];
		this.msg = void 0;
	}

	function Promise(executor) {
		if (typeof executor != "function") {
			throw TypeError("Not a function");
		}

		if (this.__NPO__ !== 0) {
			throw TypeError("Not a promise");
		}

		// instance shadowing the inherited "brand"
		// to signal an already "initialized" promise
		this.__NPO__ = 1;

		var def = new MakeDef(this);

		this["then"] = function then(success,failure) {
			var o = {
				success: typeof success == "function" ? success : true,
				failure: typeof failure == "function" ? failure : false
			};
			// Note: `then(..)` itself can be borrowed to be used against
			// a different promise constructor for making the chained promise,
			// by substituting a different `this` binding.
			o.promise = new this.constructor(function extractChain(resolve,reject) {
				if (typeof resolve != "function" || typeof reject != "function") {
					throw TypeError("Not a function");
				}

				o.resolve = resolve;
				o.reject = reject;
			});
			def.chain.push(o);

			if (def.state !== 0) {
				schedule(notify,def);
			}

			return o.promise;
		};
		this["catch"] = function $catch$(failure) {
			return this.then(void 0,failure);
		};

		try {
			executor.call(
				void 0,
				function publicResolve(msg){
					resolve.call(def,msg);
				},
				function publicReject(msg) {
					reject.call(def,msg);
				}
			);
		}
		catch (err) {
			reject.call(def,err);
		}
	}

	var PromisePrototype = builtInProp({},"constructor",Promise,
		/*configurable=*/false
	);

	// Note: Android 4 cannot use `Object.defineProperty(..)` here
	Promise.prototype = PromisePrototype;

	// built-in "brand" to signal an "uninitialized" promise
	builtInProp(PromisePrototype,"__NPO__",0,
		/*configurable=*/false
	);

	builtInProp(Promise,"resolve",function Promise$resolve(msg) {
		var Constructor = this;

		// spec mandated checks
		// note: best "isPromise" check that's practical for now
		if (msg && typeof msg == "object" && msg.__NPO__ === 1) {
			return msg;
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			resolve(msg);
		});
	});

	builtInProp(Promise,"reject",function Promise$reject(msg) {
		return new this(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			reject(msg);
		});
	});

	builtInProp(Promise,"all",function Promise$all(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}
		if (arr.length === 0) {
			return Constructor.resolve([]);
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			var len = arr.length, msgs = Array(len), count = 0;

			iteratePromises(Constructor,arr,function resolver(idx,msg) {
				msgs[idx] = msg;
				if (++count === len) {
					resolve(msgs);
				}
			},reject);
		});
	});

	builtInProp(Promise,"race",function Promise$race(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			iteratePromises(Constructor,arr,function resolver(idx,msg){
				resolve(msg);
			},reject);
		});
	});

	return Promise;
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],21:[function(require,module,exports){
/*!    SWFObject v2.3.20130521 <http://github.com/swfobject/swfobject>
 is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/* global ActiveXObject: false */

var swfobject = function () {

    var UNDEF = "undefined",
        OBJECT = "object",
        SHOCKWAVE_FLASH = "Shockwave Flash",
        SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
        FLASH_MIME_TYPE = "application/x-shockwave-flash",
        EXPRESS_INSTALL_ID = "SWFObjectExprInst",
        ON_READY_STATE_CHANGE = "onreadystatechange",

        win = window,
        doc = document,
        nav = navigator,

        plugin = false,
        domLoadFnArr = [],
        regObjArr = [],
        objIdArr = [],
        listenersArr = [],
        storedFbContent,
        storedFbContentId,
        storedCallbackFn,
        storedCallbackObj,
        isDomLoaded = false,
        isExpressInstallActive = false,
        dynamicStylesheet,
        dynamicStylesheetMedia,
        autoHideShow = true,
        encodeURIEnabled = false,

		/* Centralized function for browser feature detection
		 - User agent string detection is only used when no good alternative is possible
		 - Is executed directly for optimal performance
		 */
        ua = function () {
            var w3cdom = typeof doc.getElementById !== UNDEF && typeof doc.getElementsByTagName !== UNDEF && typeof doc.createElement !== UNDEF,
                u = nav.userAgent.toLowerCase(),
                p = nav.platform.toLowerCase(),
                windows = p ? /win/.test(p) : /win/.test(u),
                mac = p ? /mac/.test(p) : /mac/.test(u),
                webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
                ie = nav.appName === "Microsoft Internet Explorer",
                playerVersion = [0, 0, 0],
                d = null;
            if (typeof nav.plugins !== UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] === OBJECT) {
                d = nav.plugins[SHOCKWAVE_FLASH].description;
                // nav.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
                if (d && (typeof nav.mimeTypes !== UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {
                    plugin = true;
                    ie = false; // cascaded feature detection for Internet Explorer
                    d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                    playerVersion[0] = toInt(d.replace(/^(.*)\..*$/, "$1"));
                    playerVersion[1] = toInt(d.replace(/^.*\.(.*)\s.*$/, "$1"));
                    playerVersion[2] = /[a-zA-Z]/.test(d) ? toInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1")) : 0;
                }
            }
            else if (typeof win.ActiveXObject !== UNDEF) {
                try {
                    var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                    if (a) { // a will return null when ActiveX is disabled
                        d = a.GetVariable("$version");
                        if (d) {
                            ie = true; // cascaded feature detection for Internet Explorer
                            d = d.split(" ")[1].split(",");
                            playerVersion = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                        }
                    }
                }
                catch (e) {}
            }
            return {w3: w3cdom, pv: playerVersion, wk: webkit, ie: ie, win: windows, mac: mac};
        }(),

		/* Cross-browser onDomLoad
		 - Will fire an event as soon as the DOM of a web page is loaded
		 - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
		 - Regular onload serves as fallback
		 */
        onDomLoad = function () {
            if (!ua.w3) { return; }
            if ((typeof doc.readyState !== UNDEF && (doc.readyState === "complete" || doc.readyState === "interactive")) || (typeof doc.readyState === UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically
                callDomLoadFunctions();
            }
            if (!isDomLoaded) {
                if (typeof doc.addEventListener !== UNDEF) {
                    doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
                }
                if (ua.ie) {
                    doc.attachEvent(ON_READY_STATE_CHANGE, function detach() {
                        if (doc.readyState === "complete") {
                            doc.detachEvent(ON_READY_STATE_CHANGE, detach);
                            callDomLoadFunctions();
                        }
                    });
                    if (win == top) { // if not inside an iframe
                        (function checkDomLoadedIE() {
                            if (isDomLoaded) { return; }
                            try {
                                doc.documentElement.doScroll("left");
                            }
                            catch (e) {
                                setTimeout(checkDomLoadedIE, 0);
                                return;
                            }
                            callDomLoadFunctions();
                        }());
                    }
                }
                if (ua.wk) {
                    (function checkDomLoadedWK() {
                        if (isDomLoaded) { return; }
                        if (!/loaded|complete/.test(doc.readyState)) {
                            setTimeout(checkDomLoadedWK, 0);
                            return;
                        }
                        callDomLoadFunctions();
                    }());
                }
            }
        }();

    function callDomLoadFunctions() {
        if (isDomLoaded || !document.getElementsByTagName("body")[0]) { return; }
        try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
            var t, span = createElement("span");
            span.style.display = "none"; //hide the span in case someone has styled spans via CSS
            t = doc.getElementsByTagName("body")[0].appendChild(span);
            t.parentNode.removeChild(t);
            t = null; //clear the variables
            span = null;
        }
        catch (e) { return; }
        isDomLoaded = true;
        var dl = domLoadFnArr.length;
        for (var i = 0; i < dl; i++) {
            domLoadFnArr[i]();
        }
    }

    function addDomLoadEvent(fn) {
        if (isDomLoaded) {
            fn();
        }
        else {
            domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
        }
    }

	/* Cross-browser onload
	 - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
	 - Will fire an event as soon as a web page including all of its assets are loaded
	 */
    function addLoadEvent(fn) {
        if (typeof win.addEventListener !== UNDEF) {
            win.addEventListener("load", fn, false);
        }
        else if (typeof doc.addEventListener !== UNDEF) {
            doc.addEventListener("load", fn, false);
        }
        else if (typeof win.attachEvent !== UNDEF) {
            addListener(win, "onload", fn);
        }
        else if (typeof win.onload === "function") {
            var fnOld = win.onload;
            win.onload = function () {
                fnOld();
                fn();
            };
        }
        else {
            win.onload = fn;
        }
    }

	/* Detect the Flash Player version for non-Internet Explorer browsers
	 - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
	 a. Both release and build numbers can be detected
	 b. Avoid wrong descriptions by corrupt installers provided by Adobe
	 c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
	 - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
	 */
    function testPlayerVersion() {
        var b = doc.getElementsByTagName("body")[0];
        var o = createElement(OBJECT);
        o.setAttribute("style", "visibility: hidden;");
        o.setAttribute("type", FLASH_MIME_TYPE);
        var t = b.appendChild(o);
        if (t) {
            var counter = 0;
            (function checkGetVariable() {
                if (typeof t.GetVariable !== UNDEF) {
                    try {
                        var d = t.GetVariable("$version");
                        if (d) {
                            d = d.split(" ")[1].split(",");
                            ua.pv = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                        }
                    } catch (e) {
                        //t.GetVariable("$version") is known to fail in Flash Player 8 on Firefox
                        //If this error is encountered, assume FP8 or lower. Time to upgrade.
                        ua.pv = [8, 0, 0];
                    }
                }
                else if (counter < 10) {
                    counter++;
                    setTimeout(checkGetVariable, 10);
                    return;
                }
                b.removeChild(o);
                t = null;
                matchVersions();
            }());
        }
        else {
            matchVersions();
        }
    }

	/* Perform Flash Player and SWF version matching; static publishing only
	 */
    function matchVersions() {
        var rl = regObjArr.length;
        if (rl > 0) {
            for (var i = 0; i < rl; i++) { // for each registered object element
                var id = regObjArr[i].id;
                var cb = regObjArr[i].callbackFn;
                var cbObj = {success: false, id: id};
                if (ua.pv[0] > 0) {
                    var obj = getElementById(id);
                    if (obj) {
                        if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                            setVisibility(id, true);
                            if (cb) {
                                cbObj.success = true;
                                cbObj.ref = getObjectById(id);
                                cbObj.id = id;
                                cb(cbObj);
                            }
                        }
                        else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                            var att = {};
                            att.data = regObjArr[i].expressInstall;
                            att.width = obj.getAttribute("width") || "0";
                            att.height = obj.getAttribute("height") || "0";
                            if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
                            if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
                            // parse HTML object param element's name-value pairs
                            var par = {};
                            var p = obj.getElementsByTagName("param");
                            var pl = p.length;
                            for (var j = 0; j < pl; j++) {
                                if (p[j].getAttribute("name").toLowerCase() !== "movie") {
                                    par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                                }
                            }
                            showExpressInstall(att, par, id, cb);
                        }
                        else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display fallback content instead of SWF
                            displayFbContent(obj);
                            if (cb) { cb(cbObj); }
                        }
                    }
                }
                else { // if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or fallback content)
                    setVisibility(id, true);
                    if (cb) {
                        var o = getObjectById(id); // test whether there is an HTML object element or not
                        if (o && typeof o.SetVariable !== UNDEF) {
                            cbObj.success = true;
                            cbObj.ref = o;
                            cbObj.id = o.id;
                        }
                        cb(cbObj);
                    }
                }
            }
        }
    }

	/* Main function
	 - Will preferably execute onDomLoad, otherwise onload (as a fallback)
	 */
    domLoadFnArr[0] = function () {
        if (plugin) {
            testPlayerVersion();
        }
        else {
            matchVersions();
        }
    };

    function getObjectById(objectIdStr) {
        var r = null,
            o = getElementById(objectIdStr);

        if (o && o.nodeName.toUpperCase() === "OBJECT") {
            //If targeted object is valid Flash file
            if (typeof o.SetVariable !== UNDEF) {
                r = o;
            } else {
                //If SetVariable is not working on targeted object but a nested object is
                //available, assume classic nested object markup. Return nested object.

                //If SetVariable is not working on targeted object and there is no nested object,
                //return the original object anyway. This is probably new simplified markup.

                r = o.getElementsByTagName(OBJECT)[0] || o;
            }
        }

        return r;
    }

	/* Requirements for Adobe Express Install
	 - only one instance can be active at a time
	 - fp 6.0.65 or higher
	 - Win/Mac OS only
	 - no Webkit engines older than version 312
	 */
    function canExpressInstall() {
        return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
    }

	/* Show the Adobe Express Install dialog
	 - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
	 */
    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {

        var obj = getElementById(replaceElemIdStr);

        //Ensure that replaceElemIdStr is really a string and not an element
        replaceElemIdStr = getId(replaceElemIdStr);

        isExpressInstallActive = true;
        storedCallbackFn = callbackFn || null;
        storedCallbackObj = {success: false, id: replaceElemIdStr};

        if (obj) {
            if (obj.nodeName.toUpperCase() === "OBJECT") { // static publishing
                storedFbContent = abstractFbContent(obj);
                storedFbContentId = null;
            }
            else { // dynamic publishing
                storedFbContent = obj;
                storedFbContentId = replaceElemIdStr;
            }
            att.id = EXPRESS_INSTALL_ID;
            if (typeof att.width === UNDEF || (!/%$/.test(att.width) && toInt(att.width) < 310)) { att.width = "310"; }
            if (typeof att.height === UNDEF || (!/%$/.test(att.height) && toInt(att.height) < 137)) { att.height = "137"; }
            var pt = ua.ie ? "ActiveX" : "PlugIn",
                fv = "MMredirectURL=" + encodeURIComponent(win.location.toString().replace(/&/g, "%26")) + "&MMplayerType=" + pt + "&MMdoctitle=" + encodeURIComponent(doc.title.slice(0, 47) + " - Flash Player Installation");
            if (typeof par.flashvars !== UNDEF) {
                par.flashvars += "&" + fv;
            }
            else {
                par.flashvars = fv;
            }
            // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
            // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
            if (ua.ie && obj.readyState != 4) {
                var newObj = createElement("div");
                replaceElemIdStr += "SWFObjectNew";
                newObj.setAttribute("id", replaceElemIdStr);
                obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
                obj.style.display = "none";
                removeSWF(obj); //removeSWF accepts elements now
            }
            createSWF(att, par, replaceElemIdStr);
        }
    }

	/* Functions to abstract and display fallback content
	 */
    function displayFbContent(obj) {
        if (ua.ie && obj.readyState != 4) {
            // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
            // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
            obj.style.display = "none";
            var el = createElement("div");
            obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the fallback content
            el.parentNode.replaceChild(abstractFbContent(obj), el);
            removeSWF(obj); //removeSWF accepts elements now
        }
        else {
            obj.parentNode.replaceChild(abstractFbContent(obj), obj);
        }
    }

    function abstractFbContent(obj) {
        var ac = createElement("div");
        if (ua.win && ua.ie) {
            ac.innerHTML = obj.innerHTML;
        }
        else {
            var nestedObj = obj.getElementsByTagName(OBJECT)[0];
            if (nestedObj) {
                var c = nestedObj.childNodes;
                if (c) {
                    var cl = c.length;
                    for (var i = 0; i < cl; i++) {
                        if (!(c[i].nodeType == 1 && c[i].nodeName === "PARAM") && !(c[i].nodeType == 8)) {
                            ac.appendChild(c[i].cloneNode(true));
                        }
                    }
                }
            }
        }
        return ac;
    }

    function createIeObject(url, paramStr) {
        var div = createElement("div");
        div.innerHTML = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='" + url + "'>" + paramStr + "</object>";
        return div.firstChild;
    }

	/* Cross-browser dynamic SWF creation
	 */
    function createSWF(attObj, parObj, id) {
        var r, el = getElementById(id);
        id = getId(id); // ensure id is truly an ID and not an element

        if (ua.wk && ua.wk < 312) { return r; }

        if (el) {
            var o = (ua.ie) ? createElement("div") : createElement(OBJECT),
                attr,
                attrLower,
                param;

            if (typeof attObj.id === UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the fallback content
                attObj.id = id;
            }

            //Add params
            for (param in parObj) {
                //filter out prototype additions from other potential libraries and IE specific param element
                if (parObj.hasOwnProperty(param) && param.toLowerCase() !== "movie") {
                    createObjParam(o, param, parObj[param]);
                }
            }

            //Create IE object, complete with param nodes
            if (ua.ie) { o = createIeObject(attObj.data, o.innerHTML); }

            //Add attributes to object
            for (attr in attObj) {
                if (attObj.hasOwnProperty(attr)) { // filter out prototype additions from other potential libraries
                    attrLower = attr.toLowerCase();

                    // 'class' is an ECMA4 reserved keyword
                    if (attrLower === "styleclass") {
                        o.setAttribute("class", attObj[attr]);
                    } else if (attrLower !== "classid" && attrLower !== "data") {
                        o.setAttribute(attr, attObj[attr]);
                    }
                }
            }

            if (ua.ie) {
                objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
            } else {
                o.setAttribute("type", FLASH_MIME_TYPE);
                o.setAttribute("data", attObj.data);
            }

            el.parentNode.replaceChild(o, el);
            r = o;
        }

        return r;
    }

    function createObjParam(el, pName, pValue) {
        var p = createElement("param");
        p.setAttribute("name", pName);
        p.setAttribute("value", pValue);
        el.appendChild(p);
    }

	/* Cross-browser SWF removal
	 - Especially needed to safely and completely remove a SWF in Internet Explorer
	 */
    function removeSWF(id) {
        var obj = getElementById(id);
        if (obj && obj.nodeName.toUpperCase() === "OBJECT") {
            if (ua.ie) {
                obj.style.display = "none";
                (function removeSWFInIE() {
                    if (obj.readyState == 4) {
                        //This step prevents memory leaks in Internet Explorer
                        for (var i in obj) {
                            if (typeof obj[i] === "function") {
                                obj[i] = null;
                            }
                        }
                        obj.parentNode.removeChild(obj);
                    } else {
                        setTimeout(removeSWFInIE, 10);
                    }
                }());
            }
            else {
                obj.parentNode.removeChild(obj);
            }
        }
    }

    function isElement(id) {
        return (id && id.nodeType && id.nodeType === 1);
    }

    function getId(thing) {
        return (isElement(thing)) ? thing.id : thing;
    }

	/* Functions to optimize JavaScript compression
	 */
    function getElementById(id) {

        //Allow users to pass an element OR an element's ID
        if (isElement(id)) { return id; }

        var el = null;
        try {
            el = doc.getElementById(id);
        }
        catch (e) {}
        return el;
    }

    function createElement(el) {
        return doc.createElement(el);
    }

    //To aid compression; replaces 14 instances of pareseInt with radix
    function toInt(str) {
        return parseInt(str, 10);
    }

	/* Updated attachEvent function for Internet Explorer
	 - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
	 */
    function addListener(target, eventType, fn) {
        target.attachEvent(eventType, fn);
        listenersArr[listenersArr.length] = [target, eventType, fn];
    }

	/* Flash Player and SWF content version matching
	 */
    function hasPlayerVersion(rv) {
        rv += ""; //Coerce number to string, if needed.
        var pv = ua.pv, v = rv.split(".");
        v[0] = toInt(v[0]);
        v[1] = toInt(v[1]) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
        v[2] = toInt(v[2]) || 0;
        return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    }

	/* Cross-browser dynamic CSS creation
	 - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
	 */
    function createCSS(sel, decl, media, newStyle) {
        var h = doc.getElementsByTagName("head")[0];
        if (!h) { return; } // to also support badly authored HTML pages that lack a head element
        var m = (typeof media === "string") ? media : "screen";
        if (newStyle) {
            dynamicStylesheet = null;
            dynamicStylesheetMedia = null;
        }
        if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
            // create dynamic stylesheet + get a global reference to it
            var s = createElement("style");
            s.setAttribute("type", "text/css");
            s.setAttribute("media", m);
            dynamicStylesheet = h.appendChild(s);
            if (ua.ie && typeof doc.styleSheets !== UNDEF && doc.styleSheets.length > 0) {
                dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
            }
            dynamicStylesheetMedia = m;
        }
        // add style rule
        if (dynamicStylesheet) {
            if (typeof dynamicStylesheet.addRule !== UNDEF) {
                dynamicStylesheet.addRule(sel, decl);
            } else if (typeof doc.createTextNode !== UNDEF) {
                dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
            }
        }
    }

    function setVisibility(id, isVisible) {
        if (!autoHideShow) { return; }
        var v = isVisible ? "visible" : "hidden",
            el = getElementById(id);
        if (isDomLoaded && el) {
            el.style.visibility = v;
        } else if (typeof id === "string") {
            createCSS("#" + id, "visibility:" + v);
        }
    }

	/* Filter to avoid XSS attacks
	 */
    function urlEncodeIfNecessary(s) {
        var regex = /[\\\"<>\.;]/;
        var hasBadChars = regex.exec(s) !== null;
        return hasBadChars && typeof encodeURIComponent !== UNDEF ? encodeURIComponent(s) : s;
    }

	/* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
	 */
    var cleanup = function () {
        if (ua.ie) {
            window.attachEvent("onunload", function () {
                // remove listeners to avoid memory leaks
                var ll = listenersArr.length;
                for (var i = 0; i < ll; i++) {
                    listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
                }
                // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
                var il = objIdArr.length;
                for (var j = 0; j < il; j++) {
                    removeSWF(objIdArr[j]);
                }
                // cleanup library's main closures to avoid memory leaks
                for (var k in ua) {
                    ua[k] = null;
                }
                ua = null;
                for (var l in swfobject) {
                    swfobject[l] = null;
                }
                swfobject = null;
            });
        }
    }();

    return {
		/* Public API
		 - Reference: http://code.google.com/p/swfobject/wiki/documentation
		 */
        registerObject: function (objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
            if (ua.w3 && objectIdStr && swfVersionStr) {
                var regObj = {};
                regObj.id = objectIdStr;
                regObj.swfVersion = swfVersionStr;
                regObj.expressInstall = xiSwfUrlStr;
                regObj.callbackFn = callbackFn;
                regObjArr[regObjArr.length] = regObj;
                setVisibility(objectIdStr, false);
            }
            else if (callbackFn) {
                callbackFn({success: false, id: objectIdStr});
            }
        },

        getObjectById: function (objectIdStr) {
            if (ua.w3) {
                return getObjectById(objectIdStr);
            }
        },

        embedSWF: function (swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {

            var id = getId(replaceElemIdStr),
                callbackObj = {success: false, id: id};

            if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
                setVisibility(id, false);
                addDomLoadEvent(function () {
                    widthStr += ""; // auto-convert to string
                    heightStr += "";
                    var att = {};
                    if (attObj && typeof attObj === OBJECT) {
                        for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                            att[i] = attObj[i];
                        }
                    }
                    att.data = swfUrlStr;
                    att.width = widthStr;
                    att.height = heightStr;
                    var par = {};
                    if (parObj && typeof parObj === OBJECT) {
                        for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                            par[j] = parObj[j];
                        }
                    }
                    if (flashvarsObj && typeof flashvarsObj === OBJECT) {
                        for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                            if (flashvarsObj.hasOwnProperty(k)) {

                                var key = (encodeURIEnabled) ? encodeURIComponent(k) : k,
                                    value = (encodeURIEnabled) ? encodeURIComponent(flashvarsObj[k]) : flashvarsObj[k];

                                if (typeof par.flashvars !== UNDEF) {
                                    par.flashvars += "&" + key + "=" + value;
                                }
                                else {
                                    par.flashvars = key + "=" + value;
                                }

                            }
                        }
                    }
                    if (hasPlayerVersion(swfVersionStr)) { // create SWF
                        var obj = createSWF(att, par, replaceElemIdStr);
                        if (att.id == id) {
                            setVisibility(id, true);
                        }
                        callbackObj.success = true;
                        callbackObj.ref = obj;
                        callbackObj.id = obj.id;
                    }
                    else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
                        att.data = xiSwfUrlStr;
                        showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                        return;
                    }
                    else { // show fallback content
                        setVisibility(id, true);
                    }
                    if (callbackFn) { callbackFn(callbackObj); }
                });
            }
            else if (callbackFn) { callbackFn(callbackObj); }
        },

        switchOffAutoHideShow: function () {
            autoHideShow = false;
        },

        enableUriEncoding: function (bool) {
            encodeURIEnabled = (typeof bool === UNDEF) ? true : bool;
        },

        ua: ua,

        getFlashPlayerVersion: function () {
            return {major: ua.pv[0], minor: ua.pv[1], release: ua.pv[2]};
        },

        hasFlashPlayerVersion: hasPlayerVersion,

        createSWF: function (attObj, parObj, replaceElemIdStr) {
            if (ua.w3) {
                return createSWF(attObj, parObj, replaceElemIdStr);
            }
            else {
                return undefined;
            }
        },

        showExpressInstall: function (att, par, replaceElemIdStr, callbackFn) {
            if (ua.w3 && canExpressInstall()) {
                showExpressInstall(att, par, replaceElemIdStr, callbackFn);
            }
        },

        removeSWF: function (objElemIdStr) {
            if (ua.w3) {
                removeSWF(objElemIdStr);
            }
        },

        createCSS: function (selStr, declStr, mediaStr, newStyleBoolean) {
            if (ua.w3) {
                createCSS(selStr, declStr, mediaStr, newStyleBoolean);
            }
        },

        addDomLoadEvent: addDomLoadEvent,

        addLoadEvent: addLoadEvent,

        getQueryParamValue: function (param) {
            var q = doc.location.search || doc.location.hash;
            if (q) {
                if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
                if (!param) {
                    return urlEncodeIfNecessary(q);
                }
                var pairs = q.split("&");
                for (var i = 0; i < pairs.length; i++) {
                    if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                        return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
                    }
                }
            }
            return "";
        },

        // For internal usage only
        expressInstallCallback: function () {
            if (isExpressInstallActive) {
                var obj = getElementById(EXPRESS_INSTALL_ID);
                if (obj && storedFbContent) {
                    obj.parentNode.replaceChild(storedFbContent, obj);
                    if (storedFbContentId) {
                        setVisibility(storedFbContentId, true);
                        if (ua.ie) { storedFbContent.style.display = "block"; }
                    }
                    if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
                }
                isExpressInstallActive = false;
            }
        },

        version: "2.3"

    };
};

module.exports = swfobject;

},{}],22:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;

},{}],23:[function(require,module,exports){
(function (global){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],24:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":22,"./lib/rng":23}],25:[function(require,module,exports){
module.exports = require('./lib/visibility.timers.js')

},{"./lib/visibility.timers.js":27}],26:[function(require,module,exports){
;(function (global) {
    "use strict";

    var lastId = -1;

    // Visibility.js allow you to know, that your web page is in the background
    // tab and thus not visible to the user. This library is wrap under
    // Page Visibility API. It fix problems with different vendor prefixes and
    // add high-level useful functions.
    var self = {

        // Call callback only when page become to visible for user or
        // call it now if page is visible now or Page Visibility API
        // doesn’t supported.
        //
        // Return false if API isn’t supported, true if page is already visible
        // or listener ID (you can use it in `unbind` method) if page isn’t
        // visible now.
        //
        //   Visibility.onVisible(function () {
        //       startIntroAnimation();
        //   });
        onVisible: function (callback) {
            var support = self.isSupported();
            if ( !support || !self.hidden() ) {
                callback();
                return support;
            }

            var listener = self.change(function (e, state) {
                if ( !self.hidden() ) {
                    self.unbind(listener);
                    callback();
                }
            });
            return listener;
        },

        // Call callback when visibility will be changed. First argument for
        // callback will be original event object, second will be visibility
        // state name.
        //
        // Return listener ID to unbind listener by `unbind` method.
        //
        // If Page Visibility API doesn’t supported method will be return false
        // and callback never will be called.
        //
        //   Visibility.change(function(e, state) {
        //       Statistics.visibilityChange(state);
        //   });
        //
        // It is just proxy to `visibilitychange` event, but use vendor prefix.
        change: function (callback) {
            if ( !self.isSupported() ) {
                return false;
            }
            lastId += 1;
            var number = lastId;
            self._callbacks[number] = callback;
            self._listen();
            return number;
        },

        // Remove `change` listener by it ID.
        //
        //   var id = Visibility.change(function(e, state) {
        //       firstChangeCallback();
        //       Visibility.unbind(id);
        //   });
        unbind: function (id) {
            delete self._callbacks[id];
        },

        // Call `callback` in any state, expect “prerender”. If current state
        // is “prerender” it will wait until state will be changed.
        // If Page Visibility API doesn’t supported, it will call `callback`
        // immediately.
        //
        // Return false if API isn’t supported, true if page is already after
        // prerendering or listener ID (you can use it in `unbind` method)
        // if page is prerended now.
        //
        //   Visibility.afterPrerendering(function () {
        //       Statistics.countVisitor();
        //   });
        afterPrerendering: function (callback) {
            var support   = self.isSupported();
            var prerender = 'prerender';

            if ( !support || prerender != self.state() ) {
                callback();
                return support;
            }

            var listener = self.change(function (e, state) {
                if ( prerender != state ) {
                    self.unbind(listener);
                    callback();
                }
            });
            return listener;
        },

        // Return true if page now isn’t visible to user.
        //
        //   if ( !Visibility.hidden() ) {
        //       VideoPlayer.play();
        //   }
        //
        // It is just proxy to `document.hidden`, but use vendor prefix.
        hidden: function () {
            return !!(self._doc.hidden || self._doc.webkitHidden);
        },

        // Return visibility state: 'visible', 'hidden' or 'prerender'.
        //
        //   if ( 'prerender' == Visibility.state() ) {
        //       Statistics.pageIsPrerendering();
        //   }
        //
        // Don’t use `Visibility.state()` to detect, is page visible, because
        // visibility states can extend in next API versions.
        // Use more simpler and general `Visibility.hidden()` for this cases.
        //
        // It is just proxy to `document.visibilityState`, but use
        // vendor prefix.
        state: function () {
            return self._doc.visibilityState       ||
                   self._doc.webkitVisibilityState ||
                   'visible';
        },

        // Return true if browser support Page Visibility API.
        //
        //   if ( Visibility.isSupported() ) {
        //       Statistics.startTrackingVisibility();
        //       Visibility.change(function(e, state)) {
        //           Statistics.trackVisibility(state);
        //       });
        //   }
        isSupported: function () {
            return !!(self._doc.visibilityState ||
                      self._doc.webkitVisibilityState);
        },

        // Link to document object to change it in tests.
        _doc: document || {},

        // Callbacks from `change` method, that wait visibility changes.
        _callbacks: { },

        // Listener for `visibilitychange` event.
        _change: function(event) {
            var state = self.state();

            for ( var i in self._callbacks ) {
                self._callbacks[i].call(self._doc, event, state);
            }
        },

        // Set listener for `visibilitychange` event.
        _listen: function () {
            if ( self._init ) {
                return;
            }

            var event = 'visibilitychange';
            if ( self._doc.webkitVisibilityState ) {
                event = 'webkit' + event;
            }

            var listener = function () {
                self._change.apply(self, arguments);
            };
            if ( self._doc.addEventListener ) {
                self._doc.addEventListener(event, listener);
            } else {
                self._doc.attachEvent(event, listener);
            }
            self._init = true;
        }

    };

    if ( typeof(module) != 'undefined' && module.exports ) {
        module.exports = self;
    } else {
        global.Visibility = self;
    }

})(this);

},{}],27:[function(require,module,exports){
;(function (window) {
    "use strict";

    var lastTimer = -1;

    var install = function (Visibility) {

        // Run callback every `interval` milliseconds if page is visible and
        // every `hiddenInterval` milliseconds if page is hidden.
        //
        //   Visibility.every(60 * 1000, 5 * 60 * 1000, function () {
        //       checkNewMails();
        //   });
        //
        // You can skip `hiddenInterval` and callback will be called only if
        // page is visible.
        //
        //   Visibility.every(1000, function () {
        //       updateCountdown();
        //   });
        //
        // It is analog of `setInterval(callback, interval)` but use visibility
        // state.
        //
        // It return timer ID, that you can use in `Visibility.stop(id)` to stop
        // timer (`clearInterval` analog).
        // Warning: timer ID is different from interval ID from `setInterval`,
        // so don’t use it in `clearInterval`.
        //
        // On change state from hidden to visible timers will be execute.
        Visibility.every = function (interval, hiddenInterval, callback) {
            Visibility._time();

            if ( !callback ) {
                callback = hiddenInterval;
                hiddenInterval = null;
            }

            lastTimer += 1;
            var number = lastTimer;

            Visibility._timers[number] = {
                visible:  interval,
                hidden:   hiddenInterval,
                callback: callback
            };
            Visibility._run(number, false);

            if ( Visibility.isSupported() ) {
                Visibility._listen();
            }
            return number;
        };

        // Stop timer from `every` method by it ID (`every` method return it).
        //
        //   slideshow = Visibility.every(5 * 1000, function () {
        //       changeSlide();
        //   });
        //   $('.stopSlideshow').click(function () {
        //       Visibility.stop(slideshow);
        //   });
        Visibility.stop = function(id) {
            if ( !Visibility._timers[id] ) {
                return false;
            }
            Visibility._stop(id);
            delete Visibility._timers[id];
            return true;
        };

        // Callbacks and intervals added by `every` method.
        Visibility._timers = { };

        // Initialize variables on page loading.
        Visibility._time = function () {
            if ( Visibility._timed ) {
                return;
            }
            Visibility._timed     = true;
            Visibility._wasHidden = Visibility.hidden();

            Visibility.change(function () {
                Visibility._stopRun();
                Visibility._wasHidden = Visibility.hidden();
            });
        };

        // Try to run timer from every method by it’s ID. It will be use
        // `interval` or `hiddenInterval` depending on visibility state.
        // If page is hidden and `hiddenInterval` is null,
        // it will not run timer.
        //
        // Argument `runNow` say, that timers must be execute now too.
        Visibility._run = function (id, runNow) {
            var interval,
                timer = Visibility._timers[id];

            if ( Visibility.hidden() ) {
                if ( null === timer.hidden ) {
                    return;
                }
                interval = timer.hidden;
            } else {
                interval = timer.visible;
            }

            var runner = function () {
                timer.last = new Date();
                timer.callback.call(window);
            }

            if ( runNow ) {
                var now  = new Date();
                var last = now - timer.last ;

                if ( interval > last ) {
                    timer.delay = setTimeout(function () {
                        timer.id = setInterval(runner, interval);
                        runner();
                    }, interval - last);
                } else {
                    timer.id = setInterval(runner, interval);
                    runner();
                }

            } else {
              timer.id = setInterval(runner, interval);
            }
        };

        // Stop timer from `every` method by it’s ID.
        Visibility._stop = function (id) {
            var timer = Visibility._timers[id];
            clearInterval(timer.id);
            clearTimeout(timer.delay);
            delete timer.id;
            delete timer.delay;
        };

        // Listener for `visibilitychange` event.
        Visibility._stopRun = function (event) {
            var isHidden  = Visibility.hidden(),
                wasHidden = Visibility._wasHidden;

            if ( (isHidden && !wasHidden) || (!isHidden && wasHidden) ) {
                for ( var i in Visibility._timers ) {
                    Visibility._stop(i);
                    Visibility._run(i, !isHidden);
                }
            }
        };

        return Visibility;
    }

    if ( typeof(module) != 'undefined' && module.exports ) {
        module.exports = install(require('./visibility.core'));
    } else {
        install(window.Visibility)
    }

})(window);

},{"./visibility.core":26}]},{},[1])
//# sourceMappingURL=Realeyesit.EnvironmentalDetectionAPI.js.map
