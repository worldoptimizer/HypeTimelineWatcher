![Hype Timeline Watcher|690x487](https://playground.maxziebell.de/Hype/TimelineWatcher/HypeTimelineWatcher.jpg)

# Getting Started with Hype Timeline Watcher Extension

This guide will help you get started with the Hype Timeline Watcher Extension, from basic usage to more advanced configurations.

## Simple Usage: Handling Timeline Completion

1. **Define `onTimelineComplete` Function**:  
   Create the `onTimelineComplete` function in your Hype document's functions. This function will handle completion events for any timeline without the need to watch it.

   ```javascript
   // Create a new function in Hype named 'onTimelineComplete'
   function onTimelineComplete(hypeDocument, element, event) {
     console.log('Timeline:', event.timelineName, 'is complete');
   }
   ```

## Watching a Timeline with Progress Events

To handle progress events, you need to watch a timeline.

1. **Define `onTimelineProgress` Function**:  
   Create the `onTimelineProgress` function in your Hype document's functions to handle progress events.

   ```javascript
   // Create a new function in Hype named 'onTimelineProgress'
   function onTimelineProgress(hypeDocument, element, event) {
     console.log('Timeline:', event.timelineName, 'Current Time:', event.currentTime);
   }
   ```

2. **Watch a Timeline**:  
   Add the following code to your scene's load action or a suitable initialization script to start watching a timeline.

   ```javascript
   hypeDocument.watchTimelineByName('MyTimeline');
   ```

## Differentiating Timelines by Name

If you have multiple timelines and want to handle them differently, use the `timelineName` from the event object to differentiate them.

1. **Update `onTimelineProgress` Function**:  
   Modify the `onTimelineProgress` function to use a switch statement based on the timeline name.

   ```javascript
   // Create a new function in Hype named 'onTimelineProgress'
   function onTimelineProgress(hypeDocument, element, event) {
     switch (event.timelineName) {
       case 'Timeline1':
         console.log('Timeline1 progress:', event.currentTime);
         break;
       case 'Timeline2':
         console.log('Timeline2 progress:', event.currentTime);
         break;
       default:
         console.log('Other timeline progress:', event.currentTime);
         break;
     }
   }
   ```

2. **Update `onTimelineComplete` Function**:  
   Similarly, modify the `onTimelineComplete` function.

   ```javascript
   // Create a new function in Hype named 'onTimelineComplete'
   function onTimelineComplete(hypeDocument, element, event) {
     switch (event.timelineName) {
       case 'Timeline1':
         console.log('Timeline1 is complete');
         break;
       case 'Timeline2':
         console.log('Timeline2 is complete');
         break;
       default:
         console.log('Other timeline is complete');
         break;
     }
   }
   ```

3. **Watch Multiple Timelines**:  
   Watch multiple timelines by adding them in your initialization script.

   ```javascript
   hypeDocument.watchTimelineByName('Timeline1');
   hypeDocument.watchTimelineByName('Timeline2');
   ```

## Using Custom Callbacks

For more advanced usage, you can specify custom callbacks directly when watching timelines.

1. **Watch a Timeline with Custom Callbacks**:  
   Use the following code to watch a timeline and specify custom callbacks for progress, start, pause, resume, and completion events.

   ```javascript
   hypeDocument.watchTimelineByName('MyTimeline', {
     onTimelineProgress: function(hypeDocument, element, event) {
       console.log('Custom Progress:', event.timelineName, 'Current Time:', event.currentTime);
     },
     onTimelineComplete: function(hypeDocument, element, event) {
       console.log('Custom Complete:', event.timelineName, 'is complete');
     },
     onTimelineStart: function(hypeDocument, element, event) {
       console.log('Custom Start:', event.timelineName, 'has started');
     },
     onTimelinePause: function(hypeDocument, element, event) {
       console.log('Custom Pause:', event.timelineName, 'has paused');
     },
     onTimelineResume: function(hypeDocument, element, event) {
       console.log('Custom Resume:', event.timelineName, 'has resumed');
     }
   });
   ```

## Watching Timelines in Symbols

To watch timelines within symbols, you need to pass the `symbolInstance` in the settings object.

1. **Watch a Timeline in a Symbol**:  
   Use the following code to watch a timeline within a symbol and specify custom callbacks.

   ```javascript
   var symbolInstance = hypeDocument.getSymbolInstanceById('symbolId');
   symbolInstance.watchTimelineByName('MySymbolTimeline', {
     onTimelineProgress: function(hypeDocument, element, event) {
       console.log('Custom Progress for Symbol:', event.timelineName, 'Current Time:', event.currentTime);
     },
     onTimelineComplete: function(hypeDocument, element, event) {
       console.log('Custom Complete for Symbol:', event.timelineName, 'is complete');
     },
     onTimelineStart: function(hypeDocument, element, event) {
       console.log('Custom Start for Symbol:', event.timelineName, 'has started');
     },
     onTimelinePause: function(hypeDocument, element, event) {
       console.log('Custom Pause for Symbol:', event.timelineName, 'has paused');
     },
     onTimelineResume: function(hypeDocument, element, event) {
       console.log('Custom Resume for Symbol:', event.timelineName, 'has resumed');
     }
   });
   ```

## Unwatching Timelines

To stop watching a timeline, use the `unwatchTimelineByName` function.

1. **Unwatch a Timeline**:  
   Add the following code to stop watching a specific timeline.

   ```javascript
   hypeDocument.unwatchTimelineByName('MyTimeline');
   ```

2. **Unwatch a Timeline in a Symbol**:  
   If you are watching a timeline within a symbol, use the following code to stop watching it.

   ```javascript
   var symbolInstance = hypeDocument.getSymbolInstanceById('symbolId');
   symbolInstance.unwatchTimelineByName('MySymbolTimeline');
   ```

By following these steps, you can set up the Hype Timeline Watcher Extension for simple usage, differentiate timeline handling, utilize custom callbacks for more advanced functionality, including within symbols, and unwatch timelines when they are no longer needed.


Content Delivery Network (CDN)
--

Latest version can be linked into your project using the following in the head section of your project:

```html
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeTimelineWatcher/HypeTimelineWatcher.min.js"></script>
```

Optionally you can also link a SRI version or specific releases. 
Read more about that on the JsDelivr (CDN) page for this extension at [JsDelivr - HypeTimelineWatcher](https://www.jsdelivr.com/package/gh/worldoptimizer/HypeTimelineWatcher).

Learn how to use the latest extension version and how to combine extensions into one file at
[HypeCookBook - Including external files and Hype extensions](https://github.com/worldoptimizer/HypeCookBook/wiki/Including-external-files-and-Hype-extensions).

---

Based on this thread and a simpler version found here:
https://forums.tumult.com/t/timeline-run-when-i-run-another-two-timelines/23837/10?u=maxzieb
