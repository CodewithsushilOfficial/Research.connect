import React from 'react';
import { MessagingProvider } from '../context/MessagingContext';
import { SocketProvider } from '../context/MessageSimulationContext';
import MessagesPage from '../components/messages/MessagesPage';

const MessagesRoute = () => {
  return (
    <div className="w-full">
      <MessagingProvider>
        <SocketProvider>
          <MessagesPage />
        </SocketProvider>
      </MessagingProvider>
    </div>
  );
};

export default MessagesRoute;
