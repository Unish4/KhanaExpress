import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Socket connected to server:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Customer order tracking room
  joinOrderRoom(orderId) {
    if (!this.socket) this.connect();
    this.socket.emit('join:order', orderId);
  }

  leaveOrderRoom(orderId) {
    if (this.socket) {
      this.socket.emit('leave:order', orderId);
    }
  }

  // Restaurant owner incoming orders room
  joinRestaurantRoom(restaurantId) {
    if (!this.socket) this.connect();
    this.socket.emit('join:restaurant', restaurantId);
  }

  // Delivery partner feed
  joinDeliveryFeed() {
    if (!this.socket) this.connect();
    this.socket.emit('join:delivery');
  }

  // Event Listeners
  onOrderStatusUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('order_status_updated', callback);
    return () => this.socket?.off('order_status_updated', callback);
  }

  onNewOrderReceived(callback) {
    if (!this.socket) this.connect();
    this.socket.on('new_order_received', callback);
    return () => this.socket?.off('new_order_received', callback);
  }

  onOrderReadyForPickup(callback) {
    if (!this.socket) this.connect();
    this.socket.on('order_ready_for_pickup', callback);
    return () => this.socket?.off('order_ready_for_pickup', callback);
  }
}

export const socketService = new SocketService();
export default socketService;
