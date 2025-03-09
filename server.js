const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3000 });

let waitingUser = null;

server.on("connection", (socket) => {
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
  });

  socket.on("close", () => {
    if (waitingUser === socket) {
      waitingUser = null;
    }
  });
});

console.log("Signaling Server is running on port 3000");
