
// publisher and subscriber problem
function PubSub() {
  const subscribers = {};

  function checkIfEventNameHasArrayOfCallbacks(eventName) {
    const currentEventName = subscribers[eventName];
    const doesCurrentEventHaveAnArrayOfCallbacks = currentEventName && Array.isArray(currentEventName);

    if (doesCurrentEventHaveAnArrayOfCallbacks) {
      return currentEventName;
    }

    return false;
  }

  function subscribe(eventName, eventCallback) {
    // console.log("Subscribe", eventName, eventCallback);
    const isEventAlreadyPresent = checkIfEventNameHasArrayOfCallbacks(eventName);
    if (!isEventAlreadyPresent) {
      subscribers[eventName] = [];
    }
    const currentEventLength = subscribers[eventName].push(eventCallback);
    const currentEventIndex = currentEventLength - 1;

    return function unSubscribe() {
      subscribers[eventName].splice(currentEventIndex, 1);
    };
  }

  function publish(eventName, params) {
    // console.log("Publish", eventName, params);
    const currentEventName = subscribers[eventName];
    const isEventAlreadyPresent = checkIfEventNameHasArrayOfCallbacks(eventName);

    if (!isEventAlreadyPresent) {
      return;
    }
    const currentEventNameLength = currentEventName.length;
    for (let i = 0; i < currentEventNameLength; i += 1) {
      currentEventName[i](params);
    }
  }

  return {
    subscribe,
    publish
  };
}


var DevtoolsProxyBridge = function() {
  var pubSub = PubSub();
  var devtoolsURL;
  var devtoolsWS;
  var messageQueue;

  function init(url) {
   devtoolsURL = url; 
   messageQueue = [];
   connect();
  }

  function connect() {
    devtoolsWS = new window.WebSocket(devtoolsURL);

    devtoolsWS.addEventListener('message', function(data) {
      pubSub.publish('message', data);
    });

    devtoolsWS.addEventListener('open', function() {
      messageQueue.forEach(function(data) {
        devtoolsWS.send(data);
      });
      messageQueue = [];
    });

    pubSub.subscribe("send", function(data) {
      if (devtoolsWS.readyState === devtoolsWS.OPEN) {
        devtoolsWS.send(data);
      } else {
        messageQueue.push(data);
      }
    });
  }

  function addEventListener(event, func) {
    pubSub.subscribe(event, func)
  }

  function send(event) {
   pubSub.publish("send", event); 
  }


  return {
    init: init,
    addEventListener: addEventListener,
    send: send
  };
};


export default DevtoolsProxyBridge;

