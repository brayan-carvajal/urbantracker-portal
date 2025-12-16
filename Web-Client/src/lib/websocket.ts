// Configuración WebSocket para recibir mensajes desde el backend

export const setupWebSocketConnection = (onMessage: (topic: string, message: any) => void) => {
  const socket = new WebSocket('ws://localhost:8080/ws/connect');

  socket.onopen = () => {
    console.log('✅ Conexión WebSocket establecida con el backend');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📥 Mensaje WebSocket recibido:', data);
    
    // Procesar el mensaje y extraer el topic y el payload
    if (data.topic && data.payload) {
      onMessage(data.topic, data.payload);
    }
  };

  socket.onerror = (error) => {
    console.error('❌ Error en la conexión WebSocket:', error);
  };

  socket.onclose = () => {
    console.log('🔌 Conexión WebSocket cerrada');
  };

  return socket;
};

export const subscribeToWebSocketTopic = (socket: WebSocket, topic: string) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ action: 'subscribe', topic }));
    console.log(`📩 Suscrito al topic WebSocket: ${topic}`);
  }
};