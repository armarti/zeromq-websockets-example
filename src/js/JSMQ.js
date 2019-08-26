/**
 * This file has been modified from its original. The original
 * is available at https://github.com/zeromq/JSMQ.
 *
 * This Source Code Form is subject to the
 * terms of the Mozilla Public License, v.
 * 2.0. If a copy of the MPL was not
 * distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
// Endpoint class
function Endpoint(address) {

    const ClosedState = 0,
          ConnectingState = 1,
          ActiveState = 2,
          that = this;

    let reconnectTries = 0,
         webSocket = null,
         state = ClosedState,
         incomingMessage = null;

    console.log('connecting to ' + address);

    open();

    function open() {
        if(webSocket !== null) {
            webSocket.onopen = null;
            webSocket.onclose = null;
            webSocket.onmessage = null;
        }
        webSocket = new window.WebSocket(address, ['WSNetMQ', 'ZWS2.0']);
        webSocket.binaryType = 'arraybuffer';
        state = ConnectingState;
        webSocket.onopen = onopen;
        webSocket.onclose = onclose;
        webSocket.onmessage = onmessage;
        reconnectTries++;
    }

    function onopen() {
        console.log(`WebSocket opened to ${address}`);
        reconnectTries = 0;
        state = ActiveState;
        if(that.activated != null) {
            that.activated(that);
        }
    }

    function onclose() {
        console.log('WebSocket closed ' + address);
        const stateBefore = state;
        state = ClosedState;
        if(stateBefore === ActiveState && that.deactivated !== null) {
            that.deactivated(that);
        }
        if(reconnectTries > 10) {
            window.setTimeout(open, 2000);
        } else {
            open();
        }
    }

    function onmessage(ev) {
        if(ev.data instanceof Blob) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                processFrame(this.result);
            };
            fileReader.readAsArrayBuffer(ev.data);
        } else if(ev.data instanceof ArrayBuffer) {
            processFrame(ev.data);
        }
        // Other message type are not supported and will just be dropped
    }

    function processFrame(frame) {
        const view = new Uint8Array(frame);
        const more = view[0];
        if(incomingMessage == null) {
            incomingMessage = new JSMQ.Message();
        }
        incomingMessage.addBuffer(view.subarray(1));
        if(more === 0) {  // last message
            if(that.onMessage != null) {
                that.onMessage(that, incomingMessage);
            }
            incomingMessage = null;
        }
    }

    this.activated = null;  // activated event, when the socket is open
    this.deactivated = null;  // deactivated event
    this.onMessage = null;

    this.getIsActive = function() {
        return state === ActiveState;
    };

    this.getIsConnecting = function() {
        return state === ConnectingState;
    };

    this.write = function(message) {
        const messageSize = message.getSize();
        for(let j = 0; j < messageSize; j++) {
            const frame = message.getBuffer(j);
            const data = new Uint8Array(frame.length + 1);
            data[0] = j === (messageSize - 1) ? 0 : 1;  // set the more byte
            data.set(frame, 1);
            webSocket.send(data);
        }
    };
}

// LoadBalancer
function LB() {
    const endpoints = [],
          that = this;
    let current = 0,
        isActive = false;

    this.writeActivated = null;

    this.attach = function(endpoint) {
        endpoints.push(endpoint);
        if(!isActive) {
            isActive = true;
            if(that.writeActivated != null) {
                that.writeActivated();
            }
        }
    };

    this.terminated = function(endpoint) {
        const index = endpoints.indexOf(endpoint);
        if(current === (endpoints.length - 1)) {
            current = 0;
        }
        endpoints.splice(index, 1);
    };

    this.send = function(message) {
        if(endpoints.length === 0) {
            isActive = false;
            return false;
        }
        endpoints[current].write(message);
        current = (current + 1) % endpoints.length;
        return true;
    };

    this.getHasOut = function() {
        if(inprogress) {
            return true;
        }
        return endpoints.length > 0;
    };
}

// SocketBase Class
function SocketBase(xattachEndpoint, xendpointTerminated, xhasOut, xsend, xonMessage) {
    this.onMessage = null;
    this.sendReady = null;
    const endpoints = [];

    function onEndpointActivated(endpoint) {
        xattachEndpoint(endpoint);
    }

    function onEndpointDeactivated(endpoint) {
        xendpointTerminated(endpoint);
    }

    this.connect = function(address) {
        const endpoint = new Endpoint(address);
        endpoint.activated = onEndpointActivated;
        endpoint.deactivated = onEndpointDeactivated;
        endpoint.onMessage = xonMessage;
        endpoints.push(endpoint);
    };

    this.disconnect = function(address) { /* TODO: implement disconnect */ };

    this.isConnected = function() {
        for(let i = 0; i < endpoints.length; i++) {
            if(!endpoints[i].getIsActive()) {
                return false;
            }
        }
        return true;
    };

    this.isConnecting = function() {
        for(let i = 0; i < endpoints.length; i++) {
            if(!endpoints[i].getIsConnecting()) {
                return false;
            }
        }
        return true;
    };

    this.send = function(message) {
        return xsend(message);
    };

    this.getHasOut = function() {
        return xhasOut();
    };
}

// JSMQ namespace
function JSMQ() { }

JSMQ.Dealer = function() {
    const lb = new LB(),
          that = new SocketBase(xattachEndpoint, xendpointTerminated, xhasOut, xsend, xonMessage);

    lb.writeActivated = function() {
        if(that.sendReady != null) {
            that.sendReady(that);
        }
    };

    function xattachEndpoint(endpoint) {
        lb.attach(endpoint);
    }

    function xendpointTerminated(endpoint) {
        lb.terminated(endpoint);
    }

    function xhasOut() {
        return lb.getHasOut();
    }

    function xsend(message) {
        return lb.send(message);
    }

    function xonMessage(endpoint, message) {
        if(that.onMessage != null) {
            that.onMessage(message);
        }
    }

    return that;
};

JSMQ.Subscriber = function() {
    const that = new SocketBase(xattachEndpoint, xendpointTerminated, xhasOut, xsend, xonMessage),
          subscriptions = [],
          endpoints = [];
    let isActive = false;

    that.subscribe = function(subscription) {
        if(subscription instanceof Uint8Array) {
            // continue
        } else if(subscription instanceof ArrayBuffer) {
            subscription = new Uint8Array(subscription);
        } else {
            subscription = StringUtility.StringToUint8Array(String(subscription));
        }
        subscriptions.push(subscription);  // TODO: check if the subscription already exist
        const message = createSubscriptionMessage(subscription, true);
        for(let i = 0; i < endpoints.length; i++) {
            endpoints[i].write(message);
        }
    };

    that.unsubscribe = function(subscription) {
        if(subscription instanceof Uint8Array) {
            // continue
        } else if(subscription instanceof ArrayBuffer) {
            subscription = new Uint8Array(subscription);

        } else {
            subscription = StringUtility.StringToUint8Array(String(subscription));
        }
        for(let j = 0; j < subscriptions.length; j++) {
            if(subscriptions[j].length === subscription.length) {
                let equal = true;
                for(let k = 0; k < subscriptions[j].length; k++) {
                    if(subscriptions[j][k] !== subscription[k]) {
                        equal = false;
                        break;
                    }
                }
                if(equal) {
                    subscriptions.splice(j, 1);
                    break;
                }
            }
        }
        const message = createSubscriptionMessage(subscription, false);
        for(let i = 0; i < endpoints.length; i++) {
            endpoints[i].write(message);
        }
    };

    function createSubscriptionMessage(subscription, subscribe) {
        const frame = new Uint8Array(subscription.length + 1);
        frame[0] = subscribe ? 1 : 0;
        frame.set(subscription, 1);
        const message = new JSMQ.Message();
        message.addBuffer(frame);
        return message;
    }

    function xattachEndpoint(endpoint) {
        endpoints.push(endpoint);
        for(let i = 0; i < subscriptions.length; i++) {
            const message = createSubscriptionMessage(subscriptions[i], true);
            endpoint.write(message);
        }
        if(!isActive) {
            isActive = true;
            if(that.sendReady != null) {
                that.sendReady(that);
            }
        }
    }

    function xendpointTerminated(endpoint) {
        const index = endpoints.indexOf(endpoint);
        endpoints.splice(index, 1);
    }

    function xhasOut() {
        return false;
    }

    function xsend(message, more) {
        throw new Error('Send not supported on sub socket');
    }

    function xonMessage(endpoint, message) {
        if(that.onMessage != null) {
            that.onMessage(message);
        }
    }

    return that;
};

JSMQ.Message = function() {
    const frames = [];

    this.getSize = function() {
        return frames.length;
    };

    this.prependString = function(str) {  // add string at the begining of the message
        str = String(str);
        const buffer = new Uint8Array(str.length);  // one more byte is saved for the more byte
        StringUtility.StringToUint8Array(str, buffer);
        frames.splice(0, 0, buffer);
    };

    this.addString = function(str) {  // add the string at the end of the message
        str = String(str);
        const buffer = new Uint8Array(str.length);  // one more byte is saved for the more byte
        StringUtility.StringToUint8Array(str, buffer);
        frames.push(buffer);
    };

    // pop a string from the begining of the message
    this.popString = function() {
        const frame = this.popBuffer();
        return StringUtility.Uint8ArrayToString(frame);
    };

    this.popBuffer = function() {
        const frame = frames[0];
        frames.splice(0, 1);
        return frame;
    };

    this.addBuffer = function(buffer) {  // add buffer at the end of the message
        if(buffer instanceof ArrayBuffer) {
            frames.push(new Uint8Array(buffer));
        } else if(buffer instanceof Uint8Array) {
            frames.push(buffer);
        } else {
            throw new Error('unknown buffer type');
        }
    };

    this.getBuffer = function(i) {  // return Uint8Array at location i
        return frames[i];
    };
};

function StringUtility() { }

StringUtility.StringToUint8Array = function(str, buffer) {
    const strLen = str.length;
    if(typeof buffer === 'undefined') {
        buffer = new Uint8Array(strLen);
    }
    for(let i = 0; i < strLen; i++) {
        buffer[i] = str.charCodeAt(i);
    }
    return buffer;
};

/** @return {string} */
StringUtility.Uint8ArrayToString = function(buffer) {
    return String.fromCharCode.apply(null, buffer);
};
//
