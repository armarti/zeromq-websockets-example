#include <zmq.h>
#include <zmq.hpp>
#define MSGPACK_DEFAULT_API_VERSION 3
#include <msgpack.hpp>
#include <unordered_map>

int main() {
    zmq::context_t ctx;
    zmq::socket_t sock(ctx, zmq::socket_type::dealer);
    sock.bind("ws://127.0.0.1:8000");
    zmq::message_t inmsg;
    zmq::detail::recv_result_t sz;
    while((sz = sock.recv(inmsg, zmq::recv_flags::none))) {
        size_t szVal = sz.value_or(0);
        if(szVal) {
            msgpack::object_handle oh = msgpack::unpack(reinterpret_cast<char*>(inmsg.data()), szVal);
            msgpack::object obj = oh.get();
            auto objMap = obj.as<std::unordered_map<std::string, long long>>();
            objMap["message"]++;
            msgpack::sbuffer buf;
            msgpack::pack(&buf, objMap);
            zmq::message_t outmsg(buf.data(), buf.size());
            zmq::detail::send_result_t res = sock.send(outmsg, zmq::send_flags::dontwait);
        }
    }
    return 0;
}
