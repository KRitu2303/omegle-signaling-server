const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 3000 });

let waitingUser = null;

server.on("connection", (socket) => {
    console.log("✅ New user connected");

    socket.on("message", (message) => {
        let data = JSON.parse(message);

        if (data.type === "find_match") {
            if (waitingUser) {
                // ✅ Peer Matching
                socket.partner = waitingUser;
                waitingUser.partner = socket;

                console.log("✅ Match found!");

                // ✅ Tell both users that they are matched
                socket.send(JSON.stringify({ type: "match_found" }));
                waitingUser.send(JSON.stringify({ type: "match_found" }));

                waitingUser = null;
            } else {
                waitingUser = socket;
                console.log("⏳ Waiting for a second user...");
            }
        }

        if (data.type === "offer") {
            if (socket.partner) {
                console.log("📡 Sending offer to partner...");
                socket.partner.send(JSON.stringify({ type: "offer", offer: data.offer }));
            }
        }

        if (data.type === "answer") {
            if (socket.partner) {
                console.log("📡 Sending answer to partner...");
                socket.partner.send(JSON.stringify({ type: "answer", answer: data.answer }));
            }
        }

        if (data.type === "ice-candidate") {
            if (socket.partner) {
                console.log("🔄 Exchanging ICE Candidates...");
                socket.partner.send(JSON.stringify({ type: "ice-candidate", candidate: data.candidate }));
            }
        }

        if (data.type === "chat_message") {
            if (socket.partner) {
                console.log("💬 Sending chat message to partner...");
                socket.partner.send(JSON.stringify({ type: "chat_message", message: data.message }));
            }
        }
    });

    socket.on("close", () => {
        if (waitingUser === socket) {
            waitingUser = null;
        }
        if (socket.partner) {
            console.log("❌ User disconnected, notifying partner...");
            socket.partner.send(JSON.stringify({ type: "peer_disconnected" }));
            socket.partner = null;
        }
        console.log("❌ User disconnected");
    });
});

console.log("🚀 Signaling Server is running on port 3000");
