// server.js
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dbConnect from "./config/dbConfig.js"; // keep your existing DB connect file
import bookingRoutes from "./routes/booking.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import clinicRoutes from "./routes/clinic.routes.js";
import timeSlotsRoutes from "./routes/timeSlots.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import labRoutes from "./routes/lab.routes.js";
import emrRoutes from "./routes/emr.routes.js";
import messageModel from "./models/message.model.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import { createDefaultAdmin } from "./utils/createDefaultAdmin.js";
// dotenv.config();
dbConnect();
// const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dbConnect();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: "http://localhost:5173", // your frontend origin in development
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
});
const server = createServer(app);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // restrict in production to your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});
// Maps for tracking online users
const userToSocket = new Map(); // userId -> socketId
const socketToUser = new Map(); // socketId -> userId
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    // Register userId <-> socketId mapping
    socket.on("register", (userId) => {
        try {
            if (!userId)
                return;
            userToSocket.set(userId, socket.id);
            socketToUser.set(socket.id, userId);
            console.log(`User registered: ${userId} -> ${socket.id}`);
        }
        catch (error) {
            console.error("register err", error);
        }
    });
    // Join a room and send history (most recent first limited, then reversed to chronological)
    socket.on("joinRoom", async (roomId) => {
        try {
            if (!roomId)
                return;
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
            const limit = 50;
            const docs = await messageModel.find({ roomId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            // Normalize the docs to the shape client expects: { _id, roomId, senderId, message, type, createdAt }
            const normalized = docs.map(d => ({
                _id: d._id,
                roomId: d.roomId,
                senderId: d.senderId,
                message: d.text,
                type: d.type,
                createdAt: d.createdAt
            })).reverse(); // chronological (oldest -> newest)
            socket.emit("history", normalized);
            // optionally notify others in room that this socket joined
            socket.to(roomId).emit("user:joined", { socketId: socket.id, roomId });
        }
        catch (error) {
            console.error("joinRoom err", error);
            socket.emit("error", { message: "Failed to join room" });
        }
    });
    // Send message: save to DB, then emit normalized payload to the room
    socket.on("sendMessage", async (data) => {
        try {
            if (!data || !data.roomId || !data.senderId) {
                return socket.emit("error", { message: "Invalid message payload" });
            }
            const doc = new messageModel({
                roomId: data.roomId,
                senderId: data.senderId,
                text: data.message || "",
                type: data.type || "text"
            });
            const saved = await doc.save();
            const payload = {
                _id: saved._id,
                roomId: saved.roomId,
                senderId: saved.senderId,
                message: saved.text,
                type: saved.type,
                createdAt: saved.createdAt
            };
            io.to(data.roomId).emit("receiveMessage", payload);
        }
        catch (error) {
            console.error("sendMessage err", error);
            socket.emit("error", { message: "Failed to save message" });
        }
    });
    // Disconnect handling: cleanup maps
    socket.on("disconnect", () => {
        try {
            const userId = socketToUser.get(socket.id);
            if (userId) {
                userToSocket.delete(userId);
                socketToUser.delete(socket.id);
                console.log(`User ${userId} disconnected (socket ${socket.id})`);
            }
            else {
                console.log(`Socket disconnected: ${socket.id}`);
            }
        }
        catch (error) {
            console.error("disconnect err", error);
        }
    });
});
// Static uploads (if used)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json()); // ✅ to parse JSON requests
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/reports", express.static(path.join(process.cwd(), "uploads", "reports")));
// Your route mounts (unchanged)
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/availability", timeSlotsRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/emr", emrRoutes);
// app.use("/api/emr",emrRoutes);
app.use("/api/prescription", prescriptionRoutes);
// app.use(express.static(path.join(__dirname, "../../frontend/dist")));
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
// });
// console.log("STATIC PATH:", path.join(__dirname, "../../frontend/dist"));
// console.log("INDEX PATH:", path.join(__dirname, "../../frontend/dist/index.html"));
// server.listen(PORT,()=>{
//     console.log("Server running at " + PORT);
//     console.log("Socket also started");
// })
createDefaultAdmin();
// Start server
server.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
    console.log("Socket.IO server started");
});
//# sourceMappingURL=index.js.map