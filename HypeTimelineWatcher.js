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
 */

if ("HypeTimelineWatcher" in window === false) {
  window['HypeTimelineWatcher'] = (function () {
    if ("HYPE_eventListeners" in window === false) {
      window.HYPE_eventListeners = [];
    }

    var _timelines = {};
    var _raf = null;

    function HypeDocumentLoad(hypeDocument, element, event) {
      // Extend hypeDocument
      hypeDocument.isTimelineComplete = function(timelineName) {
        return hypeDocument.currentTimeInTimelineNamed(timelineName) === hypeDocument.durationForTimelineNamed(timelineName);
      };

      hypeDocument.watchTimelineByName = function(timelineName, options = {}) {
        addTimelineWatcher(hypeDocument, null, timelineName, options);
      };
    }

    function HypeSymbolLoad(hypeDocument, element, event) {
      var symbolInstance = hypeDocument.getSymbolInstanceById(element.id);
      // Extend symbolInstance
      symbolInstance.isTimelineComplete = function(timelineName) {
        return symbolInstance.currentTimeInTimelineNamed(timelineName) === symbolInstance.durationForTimelineNamed(timelineName);
      };

      symbolInstance.watchTimelineByName = function(timelineName, options = {}) {
        addTimelineWatcher(hypeDocument, symbolInstance, timelineName, options);
      };
    }

    function addTimelineWatcher(hypeDocument, symbolInstance, timelineName, options) {
      var key = generateKey(timelineName, symbolInstance);
      _timelines[key] = { 
        onProgressCallback: options.onProgressCallback, 
        onCompleteCallback: options.onCompleteCallback,
        lastTime: -1,
        hypeDocument: hypeDocument,
        symbolInstance: symbolInstance,
        timelineName: timelineName
      };
      if (!_raf) {
        _raf = requestAnimationFrame(checkTimelines);
      }
    }

    function generateKey(timelineName, symbolInstance) {
      return symbolInstance ? symbolInstance.element().id + ':' + timelineName : timelineName;
    }

    function checkTimelines() {
      for (var key in _timelines) {
        if (_timelines.hasOwnProperty(key)) {
          var item = _timelines[key];
          var currentTime;
          if (item.symbolInstance) {
            currentTime = item.symbolInstance.currentTimeInTimelineNamed(item.timelineName);
          } else {
            currentTime = item.hypeDocument.currentTimeInTimelineNamed(item.timelineName);
          }
          if (currentTime !== item.lastTime) {
            item.lastTime = currentTime;
            handleTimelineProgress(item.hypeDocument, item.symbolInstance, item.timelineName, currentTime, item.onProgressCallback);
            if (isTimelineComplete(item, item.timelineName)) {
              handleTimelineComplete(item.hypeDocument, item.symbolInstance, item.timelineName, item.onCompleteCallback);
            }
          }
        }
      }
      _raf = requestAnimationFrame(checkTimelines);
    }

    function isTimelineComplete(item, timelineName) {
      if (item.symbolInstance) {
        return item.symbolInstance.currentTimeInTimelineNamed(timelineName) === item.symbolInstance.durationForTimelineNamed(timelineName);
      } else {
        return item.hypeDocument.currentTimeInTimelineNamed(timelineName) === item.hypeDocument.durationForTimelineNamed(timelineName);
      }
    }

    function handleTimelineProgress(hypeDocument, symbolInstance, timelineName, currentTime, callback) {
      const event = { timelineName: timelineName, currentTime: currentTime, symbolInstance: symbolInstance };
      if (callback && typeof callback === 'function') {
        callback(hypeDocument, null, event);
      } else if (typeof hypeDocument.functions().onTimelineProgress === 'function') {
        hypeDocument.functions().onTimelineProgress(hypeDocument, null, event);
      } else if (typeof hypeDocument['onTimelineProgress'] === 'function') {
        hypeDocument['onTimelineProgress'](hypeDocument, null, event);
      }
    }

    function handleTimelineComplete(hypeDocument, symbolInstance, timelineName, callback) {
      const event = { timelineName: timelineName, symbolInstance: symbolInstance };
      if (callback && typeof callback === 'function') {
        callback(hypeDocument, null, event);
      } else if (typeof hypeDocument.functions().onTimelineComplete === 'function') {
        hypeDocument.functions().onTimelineComplete(hypeDocument, null, event);
      } else if (typeof hypeDocument['onTimelineComplete'] === 'function') {
        hypeDocument['onTimelineComplete'](hypeDocument, null, event);
      }
    }

    function HypeTimelineComplete(hypeDocument, element, event) {
      handleTimelineComplete(hypeDocument, null, event.timelineName);
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

    window.HYPE_eventListeners.push({"type": "HypeDocumentLoad", "callback": HypeDocumentLoad});
    window.HYPE_eventListeners.push({"type": "HypeSymbolLoad", "callback": HypeSymbolLoad});
    window.HYPE_eventListeners.push({"type": "HypeTimelineComplete", "callback": HypeTimelineComplete});
    window.HYPE_eventListeners.push({"type": "HypeScenePrepareForDisplay", "callback": HypeScenePrepareForDisplay});
    window.HYPE_eventListeners.push({"type": "HypeSceneUnload", "callback": HypeSceneUnload});

    return {
      version: '1.0.9'
    };

  })();
}
