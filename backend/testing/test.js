import WebSocket from "ws";

const meetingId = "9b654770-6ec5-40cf-9885-51f8e192f298";
const API_KEY = "ABCD";

const ws = new WebSocket(`ws://localhost:8000/api/meetings/ws/chat/${meetingId}`);

ws.on("message", (raw) => {
    const text = raw.toString();

    let msg = null;
    try {
        msg = JSON.parse(text);
    } catch {
        // not JSON → treat as normal chat reply
        console.log("chat reply:", text);
        return;
    }

    // JSON branch (handshake / acks)
    console.log("server ->", msg);

    if (msg.type === "handshake_required") {
        ws.send(JSON.stringify({ x_api_key: API_KEY }));
        return;
    }

    if (msg.type === "handshake_ok") {
        console.log("chat ready");
        ws.send("hello bot 👋");
        return;
    }
});
