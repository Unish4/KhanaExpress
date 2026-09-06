import { Server } from "socket.io";
import { ENV } from "./env.js";

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ENV.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // Join tracking room for specific order
    socket.on("join:order", (orderId) => {
      if (orderId) {
        const room = `order_${orderId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined ${room}`);
      }
    });

    // Leave order room
    socket.on("leave:order", (orderId) => {
      if (orderId) {
        const room = `order_${orderId}`;
        socket.leave(room);
        console.log(`Socket ${socket.id} left ${room}`);
      }
    });

    // Join restaurant incoming orders room
    socket.on("join:restaurant", (restaurantId) => {
      if (restaurantId) {
        const room = `restaurant_${restaurantId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined ${room}`);
      }
    });

    // Join delivery feed for ready orders
    socket.on("join:delivery", () => {
      const room = "delivery_feed";
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("Socket.io instance not initialized yet!");
  }
  return io;
};

// Helper: Emit order status updates to customer order room
export const emitOrderUpdate = (orderId, orderData) => {
  if (io && orderId) {
    io.to(`order_${orderId}`).emit("order_status_updated", orderData);
  }
};

// Helper: Emit new order notification to restaurant owner room
export const emitNewOrder = (restaurantId, orderData) => {
  if (io && restaurantId) {
    io.to(`restaurant_${restaurantId}`).emit("new_order_received", orderData);
  }
};

// Helper: Emit ready order notification to delivery partners feed
export const emitOrderReady = (orderData) => {
  if (io) {
    io.to("delivery_feed").emit("order_ready_for_pickup", orderData);
  }
};
