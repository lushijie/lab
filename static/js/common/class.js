var element = document.getElementById('scrollable-element');

var isMacWebkit = (navigator.userAgent.indexOf("Macintosh") !== -1 &&
                           navigator.userAgent.indexOf("WebKit") !== -1);
        var isFirefox = (navigator.userAgent.indexOf("firefox") !== -1);

        // Register mousewheel event handlers.
        element.onwheel = wheelHandler;       // Future browsers
        element.onmousewheel = wheelHandler;  // Most current browsers
        if (isFirefox) {              // Firefox only
            element.scrollTop = 0;
            element.addEventListener("DOMMouseScroll", wheelHandler, false);
        }
        // prevent from scrolling parrent elements
        function wheelHandler(event) {
            var e = event || window.event;  // Standard or IE event object

            // Extract the amount of rotation from the event object, looking
            // for properties of a wheel event object, a mousewheel event object
            // (in both its 2D and 1D forms), and the Firefox DOMMouseScroll event.
            // Scale the deltas so that one "click" toward the screen is 30 pixels.
            // If future browsers fire both "wheel" and "mousewheel" for the same
            // event, we'll end up double-counting it here. Hopefully, however,
            // cancelling the wheel event will prevent generation of mousewheel.
            var deltaX = e.deltaX * -30 ||  // wheel event
                      e.wheelDeltaX / 4 ||  // mousewheel
                                    0;    // property not defined
            var deltaY = e.deltaY * -30 ||  // wheel event
                      e.wheelDeltaY / 4 ||  // mousewheel event in Webkit
       (e.wheelDeltaY === undefined &&      // if there is no 2D property then
                      e.wheelDelta / 4) ||  // use the 1D wheel property
                         e.detail * -10 ||  // Firefox DOMMouseScroll event
                                   0;     // property not defined

            // Most browsers generate one event with delta 120 per mousewheel click.
            // On Macs, however, the mousewheels seem to be velocity-sensitive and
            // the delta values are often larger multiples of 120, at
            // least with the Apple Mouse. Use browser-testing to defeat this.
            if (isMacWebkit) {
                deltaX /= 30;
                deltaY /= 30;
            }
            e.currentTarget.scrollTop -= deltaY;
            // If we ever get a mousewheel or wheel event in (a future version of)
            // Firefox, then we don't need DOMMouseScroll anymore.
            if (isFirefox && e.type !== "DOMMouseScroll")
                element.removeEventListener("DOMMouseScroll", wheelHandler, false);

            // Don't let this event bubble. Prevent any default action.
            // This stops the browser from using the mousewheel event to scroll
            // the document. Hopefully calling preventDefault() on a wheel event
            // will also prevent the generation of a mousewheel event for the
            // same rotation.
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            e.cancelBubble = true;  // IE events
            e.returnValue = false;  // IE events
            return false;
        }
