# Example: Browser communication over ZeroMQ, over Websockets, with MessagePack

This is a bare-bones example of node-node communication over ØMQ. The
socket type is websockets, and one of the nodes is a web browser. That's 
the neat bit. 

Once built, the browser sends the "server" a number > the "server" adds 1
to the number > the number is sent back. Serialization is done in msgpack. 

Boost isn't really needed to run things as-is so you can comment it
out in the CMakeLists.txt if you like.
