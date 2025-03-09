const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3000 });

let waitingUser = null;

server.on("connection", (socket) => {
    console.log("New user connected");

    socket.on("message", (message) => {
        let data = JSON.parse(message);

        if (data.type === "find_match") {
            if (waitingUser) {
                socket.partner = waitingUser;
                waitingUser.partner = socket;

                let offer = { type: "offer", offer: waitingUser.offer };
                socket.send(JSON.stringify(offer));
                waitingUser.send(JSON.stringify({ type: "match_found" }));

                waitingUser = null;
            } else {
                waitingUser = socket;
            }
        }

        if (data.type === "offer") {
            socket.offer = data.offer;
        }

        if (data.type === "answer" && socket.partner) {
            socket.partner.send(JSON.stringify({ type: "answer", answer: data.answer }));
        }

        if (data.type === "ice-candidate" && socket.partner) {
            socket.partner.send(JSON.stringify({ type: "ice-candidate", candidate: data.candidate }));
        }
    });

    socket.on("close", () => {
        if (waitingUser === socket) {
            waitingUser = null;
        }
    });
});

console.log("Signaling Server is running on port 3000");
