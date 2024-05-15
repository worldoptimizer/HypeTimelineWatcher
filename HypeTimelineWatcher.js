/*!
 * Hype Timeline Watcher Extension
 * Copyright (2024) Max Ziebell, (https://maxziebell.de). MIT-license
 */

/*
 * Version-History
 * 1.0.0 Initial release under MIT-license
 * 1.0.1 Added timeline watcher functionality and onTimelineProgress callback support
 * 1.0.2 Added callback support for onTimelineComplete
 * 1.0.3 Updated callbacks to conform to Hype function signature
 * 1.0.4 Cleaned up code to adhere to DRY principle
 * 1.0.5 Fixed reference error and ensured hypeDocument is properly passed
 * 1.0.6 Refactored to use settings object and added support for symbolInstance
 * 1.0.7 Added unique key for timelines using symbolInstance.element().id
 * 1.0.8 Fixed undefined errors and improved robustness
 * 1.0.9 Added default handling for options parameter
 * 1.1.0 Added support for timeline start, pause, and resume events
 * 1.1.1 Hybrid solution using built-in complete event and custom watchers for other events
 * 1.1.2 Added rounding helper for time values and unwatchTimelineByName
 */

/*!
 * Hype Timeline Watcher Extension
 * Copyright (2024) Max Ziebell, (https://maxziebell.de). MIT-license
 */

if ("HypeTimelineWatcher" in window === false) {
    window['HypeTimelineWatcher'] = (function() {
        if ("HYPE_eventListeners" in window === false) {
            window.HYPE_eventListeners = [];
        }

        var _timelines = {};
        var _raf = null;

        function roundTime(value) {
            return Math.round(value * 1000) / 1000;
        }

        function generateKey(hypeDocument, timelineName, symbolInstance) {
            const hid = hypeDocument.documentId();
            return symbolInstance ? hid + ':' + symbolInstance.element().id + ':' + timelineName : hid + ':' + timelineName;
        }

        function unwatchTimelineByName(hypeDocument, timelineName, symbolInstance = null) {
            var key = generateKey(hypeDocument, timelineName, symbolInstance);
            delete _timelines[key];
            if (Object.keys(_timelines).length === 0 && _raf) {
                cancelAnimationFrame(_raf);
                _raf = null;
            }
        }

        function HypeDocumentLoad(hypeDocument, element, event) {
            // Extend hypeDocument
            hypeDocument.isTimelineComplete = function(timelineName) {
                return roundTime(hypeDocument.currentTimeInTimelineNamed(timelineName)) === roundTime(hypeDocument.durationForTimelineNamed(timelineName));
            };

            hypeDocument.watchTimelineByName = function(timelineName, options = {}) {
                watchTimelineByName(hypeDocument, null, timelineName, options);
            };

            hypeDocument.unwatchTimelineByName = function(timelineName) {
                unwatchTimelineByName(hypeDocument, timelineName);
            };
        }

        function HypeSymbolLoad(hypeDocument, element, event) {
            var symbolInstance = hypeDocument.getSymbolInstanceById(element.id);
            // Extend symbolInstance
            symbolInstance.isTimelineComplete = function(timelineName) {
                return roundTime(symbolInstance.currentTimeInTimelineNamed(timelineName)) === roundTime(symbolInstance.durationForTimelineNamed(timelineName));
            };

            symbolInstance.watchTimelineByName = function(timelineName, options = {}) {
                watchTimelineByName(hypeDocument, symbolInstance, timelineName, options);
            };

            symbolInstance.unwatchTimelineByName = function(timelineName) {
                unwatchTimelineByName(hypeDocument, timelineName, symbolInstance);
            };
        }

        function watchTimelineByName(hypeDocument, symbolInstance, timelineName, options) {
            var key = generateKey(hypeDocument, timelineName, symbolInstance);
            _timelines[key] = {
                onTimelineProgress: options.onTimelineProgress,
                onTimelineComplete: options.onTimelineComplete,
                onTimelineStart: options.onTimelineStart,
                onTimelinePause: options.onTimelinePause,
                onTimelineResume: options.onTimelineResume,
                lastTime: -1,
                lastState: 'stopped', // can be 'playing', 'paused', or 'stopped'
                hypeDocument: hypeDocument,
                symbolInstance: symbolInstance,
                timelineName: timelineName
            };
            if (!_raf) {
                _raf = requestAnimationFrame(checkTimelines);
            }
        }

        function checkTimelines() {
            for (var key in _timelines) {
                if (_timelines.hasOwnProperty(key)) {
                    var item = _timelines[key];
                    var currentTime;
                    var isPlaying;
                    if (item.symbolInstance) {
                        currentTime = roundTime(item.symbolInstance.currentTimeInTimelineNamed(item.timelineName));
                        isPlaying = item.symbolInstance.isPlayingTimelineNamed(item.timelineName);
                    } else {
                        currentTime = roundTime(item.hypeDocument.currentTimeInTimelineNamed(item.timelineName));
                        isPlaying = item.hypeDocument.isPlayingTimelineNamed(item.timelineName);
                    }

                    let progressUpdate = currentTime !== item.lastTime;

                    if (progressUpdate) {
                        item.lastTime = currentTime;
                        if (item.lastState == 'playing') {
                            handleTimelineEvent(item.hypeDocument, item.symbolInstance, item.timelineName, item.onTimelineProgress, 'onTimelineProgress', currentTime);
                        }
                    }

                    if (progressUpdate) {
                        if (item.lastState === 'stopped') {
                            handleTimelineEvent(item.hypeDocument, item.symbolInstance, item.timelineName, item.onTimelineStart, 'onTimelineStart');
                            item.lastState = 'playing';
                        }
                        if (isTimelineComplete(item, item.timelineName)) {
                            handleTimelineEvent(item.hypeDocument, item.symbolInstance, item.timelineName, item.onTimelineComplete, 'onTimelineComplete');
                            item.lastState = 'stopped';
                        }
                        if (isPlaying && item.lastState === 'paused') {
                            handleTimelineEvent(item.hypeDocument, item.symbolInstance, item.timelineName, item.onTimelineResume, 'onTimelineResume');
                            item.lastState = 'playing';
                        }
                    } else {
                        if (!isPlaying) {
                            if (item.lastState === 'playing') {
                                handleTimelineEvent(item.hypeDocument, item.symbolInstance, item.timelineName, item.onTimelinePause, 'onTimelinePause');
                                item.lastState = 'paused';
                            }
                        }
                    }
                }
            }
            _raf = requestAnimationFrame(checkTimelines);
        }

        function isTimelineComplete(item, timelineName) {
            if (item.symbolInstance) {
                return roundTime(item.symbolInstance.currentTimeInTimelineNamed(timelineName)) === roundTime(item.symbolInstance.durationForTimelineNamed(timelineName));
            } else {
                return roundTime(item.hypeDocument.currentTimeInTimelineNamed(timelineName)) === roundTime(item.hypeDocument.durationForTimelineNamed(timelineName));
            }
        }

        function handleTimelineEvent(hypeDocument, symbolInstance, timelineName, callback, defaultFunctionName, currentTime = null) {
            const event = { timelineName: timelineName, symbolInstance: symbolInstance, currentTime: currentTime };
            const element = symbolInstance ? symbolInstance.element() : document.getElementById(hypeDocument.currentSceneId());
            if (callback && typeof callback === 'function') {
                callback(hypeDocument, element, event);
            }
            if (typeof hypeDocument.functions()[defaultFunctionName] === 'function') {
                hypeDocument.functions()[defaultFunctionName](hypeDocument, element, event);
            }
            if (typeof hypeDocument[defaultFunctionName] === 'function') {
                hypeDocument[defaultFunctionName](hypeDocument, element, event);
            }
        }

        function HypeTimelineComplete(hypeDocument, element, event) {
            var symbolInstance = element ? hypeDocument.getSymbolInstanceById(element.id) : null;
            handleTimelineEvent(hypeDocument, symbolInstance, event.timelineName, null, 'HypeTimelineComplete');
        }

        function HypeScenePrepareForDisplay(hypeDocument, element, event) {
            _timelines = {};
            if (_raf) {
                cancelAnimationFrame(_raf);
                _raf = null;
            }
        }

        function HypeSceneUnload(hypeDocument, element, event) {
            _timelines = {};
            if (_raf) {
                cancelAnimationFrame(_raf);
                _raf = null;
            }
        }

        window.HYPE_eventListeners.push({ "type": "HypeDocumentLoad", "callback": HypeDocumentLoad });
        window.HYPE_eventListeners.push({ "type": "HypeSymbolLoad", "callback": HypeSymbolLoad });
        window.HYPE_eventListeners.push({ "type": "HypeTimelineComplete", "callback": HypeTimelineComplete });
        window.HYPE_eventListeners.push({ "type": "HypeScenePrepareForDisplay", "callback": HypeScenePrepareForDisplay });
        window.HYPE_eventListeners.push({ "type": "HypeSceneUnload", "callback": HypeSceneUnload });

        return {
            version: '1.1.2'
        };

    })();
}
