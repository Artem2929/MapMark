export const useMessagesSocket = ({ 
  activeChat, 
  currentUserId, 
  onNewMessage, 
  onUserOnline, 
  onUserOffline 
}) => {
  // WebSocket поки не реалізований
  const sendTyping = () => {
    // Заглушка
  }

  return {
    sendTyping,
    isConnected: false
  }
}