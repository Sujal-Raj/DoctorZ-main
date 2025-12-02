import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
// import api from "../../Services/mainApi";

// Initialize socket outside component to avoid multiple connections
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

const DoctorChat = () => {
  const { roomId } = useParams(); // gets from path `/doctor-chat/:roomId`
  const location = useLocation();
  const {  doctorId } = location.state || {};
  // Set user id: usually from auth context, but fallback for example
  const userId = doctorId || "doctor";

  interface ChatMessage {
    _id?: string;
    roomId: string;
    senderId: string;
    message: string;
    createdAt?: string;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]); // each message: { _id?, roomId, senderId, message, createdAt }
  const [msg, setMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Register current user with server so server's onlineUsers map is populated
  useEffect(() => {
    if (!userId) return;
    socket.emit("register", userId);
  }, [userId]);

  // Handle socket events: set up handlers, then join room
  useEffect(() => {
    if (!roomId) return;

    // history handler: server sends an array of normalized messages
    interface ChatMessage {
      _id?: string;
      roomId: string;
      senderId: string;
      message: string;
      createdAt?: string;
    }

    type HistoryEvent = ChatMessage[];

    const handleHistory = (history: HistoryEvent) => {
      // history expected shape: [{ _id, roomId, senderId, message, createdAt }, ...]
      if (Array.isArray(history)) {
      setMessages(history);
      } else {
      setMessages([]);
      }
    };

    // incoming message handler
    interface ReceiveMessageData {
      _id: string;
      roomId: string;
      senderId: string;
      message: string;
      createdAt?: string;
    }

    const handleReceive = (data: ReceiveMessageData) => {
      setMessages((prev: ChatMessage[]) => [
      ...prev,
      {
        _id: data._id,
        roomId: data.roomId,
        senderId: data.senderId,
        message: data.message,
        createdAt: data.createdAt || new Date().toISOString(),
      },
      ]);
    };

    // error handler (optional)
    interface SocketError {
      message?: string;
      code?: string | number;
      [key: string]: any;
    }

    const handleError = (err: SocketError) => {
      console.error("Socket error:", err);
    };

    // attach listeners BEFORE joining so we don't miss history/first messages
    socket.on("history", handleHistory);
    socket.on("receiveMessage", handleReceive);
    socket.on("error", handleError);

    // now ask server to join room (server will send "history" after join)
    socket.emit("joinRoom", roomId);

    return () => {
      socket.off("history", handleHistory);
      socket.off("receiveMessage", handleReceive);
      socket.off("error", handleError);
      // note: do not disconnect the socket here; just remove listeners
    };
  }, [roomId]);

  // keep scroll at the bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    if (!roomId) return;

    const messageData = { roomId, senderId: userId, message: msg };

    // optimistic UI update with temporary id and timestamp
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      roomId,
      senderId: userId,
      message: msg,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("sendMessage", messageData);

    setMsg("");
  };

  return (
    <div className="h-full flex flex-col border rounded max-w-lg mx-auto mt-4 shadow-lg bg-white">
      <div className="p-4 font-bold border-b bg-gray-100">Chat with Patient</div>
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: "400px" }}>
        {messages.map((m, i) => (
          <div
            key={m._id ?? i}
            className={`mb-2 flex ${m.senderId === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded ${
                m.senderId === userId ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              <div>{m.message}</div>
              <div style={{ fontSize: 11, color: "#4b5563", marginTop: 6 }}>
                {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex p-2 border-t">
        <input
          className="flex-1 border p-2 rounded"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded shadow"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DoctorChat;
