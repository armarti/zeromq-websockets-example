import { Dealer, Buffer } from 'jszmq';
import { encode, decode } from "@msgpack/msgpack";

interface ProjMessage {
    message: number;
}

const ENDPOINT_URL = 'ws://127.0.0.1:8000';
const dealer = new Dealer();
dealer.connect(ENDPOINT_URL);

dealer.on('message', function(msg){
    const decodedMsg = <ProjMessage>decode(msg);
    console.log('Received: ', decodedMsg);
    setTimeout(() => {
        decodedMsg.message++;
        console.log('Sending: ', decodedMsg);
        const encodedMsg = Buffer.from(encode(decodedMsg));
        dealer.send(encodedMsg);
    }, 5000);
});

dealer.send(Buffer.from(encode({
    message: 1
})));
