const messageService = require('../service/message.service');
const logger = require('../../../common/logger/winston');
const Message = require('../model/Message');

module.exports = (io, socket) => {
  const userId = socket.user.id || socket.user._id;

  /**
   * Listen for user joining conversation room.
   * Auto-marks messages as read and emits message:delivered to the sender.
   */
  socket.on('chat:join', async ({ conversationId }) => {
    if (!conversationId) return;
    const roomId = `conversation:${conversationId}`;
    socket.join(roomId);
    logger.info(`💬 Socket ${socket.id} (User: ${userId}) joined room: ${roomId}`);

    // Auto-mark incoming messages as seen and notify sender
    try {
      // Find undelivered messages sent by the other participant
      const undelivered = await Message.find({
        conversationId,
        senderId: { $ne: userId },
        status: { $in: ['sent', 'delivered'] }
      }).select('_id senderId').lean();

      if (undelivered.length > 0) {
        // Mark all as 'seen'
        await Message.updateMany(
          { _id: { $in: undelivered.map(m => m._id) } },
          { $set: { status: 'seen' } }
        );

        // Group by sender and emit message:read to each unique sender
        const senderIds = [...new Set(undelivered.map(m => m.senderId.toString()))];
        senderIds.forEach(senderId => {
          io.to(`user:${senderId}`).emit('message:read', {
            conversationId,
            readBy: userId
          });
        });

        // Refresh conversation list for current user
        io.to(`user:${userId}`).emit('conversation:update', { conversationId });
      }
    } catch (err) {
      logger.error(`Auto-read on chat:join error: ${err.message}`);
    }
  });

  /**
   * Listen for user leaving conversation room
   */
  socket.on('chat:leave', ({ conversationId }) => {
    if (!conversationId) return;
    const roomId = `conversation:${conversationId}`;
    socket.leave(roomId);
    logger.info(`💬 Socket ${socket.id} (User: ${userId}) left room: ${roomId}`);
  });

  /**
   * Listen for user typing
   */
  socket.on('chat:typing', async ({ conversationId }) => {
    if (!conversationId) return;
    try {
      const redisClient = require('../../../config/redis');
      if (redisClient && redisClient.isOpen && redisClient.isReady) {
        await redisClient.set(`typing:${conversationId}:${userId}`, 'true', { EX: 5 });
      }
    } catch (err) {
      logger.error(`Redis typing start error: ${err.message}`);
    }
    socket.to(`conversation:${conversationId}`).emit('typing:start', {
      conversationId,
      userId
    });
  });

  /**
   * Listen for user stop typing
   */
  socket.on('chat:stopTyping', async ({ conversationId }) => {
    if (!conversationId) return;
    try {
      const redisClient = require('../../../config/redis');
      if (redisClient && redisClient.isOpen && redisClient.isReady) {
        await redisClient.del(`typing:${conversationId}:${userId}`);
      }
    } catch (err) {
      logger.error(`Redis typing stop error: ${err.message}`);
    }
    socket.to(`conversation:${conversationId}`).emit('typing:stop', {
      conversationId,
      userId
    });
  });

  /**
   * Listen for chat read receipts (explicit mark-read from frontend)
   */
  socket.on('chat:read', async ({ conversationId }) => {
    if (!conversationId) return;
    try {
      await messageService.markAsRead(userId, conversationId);
    } catch (err) {
      logger.error(`Error marking message as read via socket: ${err.message}`);
    }
  });

  /**
   * Emit message:delivered to the sender when the message arrives
   * at the recipient's socket room. Called by the sendMessage flow via
   * the emitToRoom helper — no client event needed.
   * This handler allows the client to manually acknowledge delivery.
   */
  socket.on('message:ack', async ({ messageId, conversationId }) => {
    if (!messageId) return;
    try {
      const msg = await Message.findOneAndUpdate(
        { _id: messageId, senderId: { $ne: userId }, status: 'sent' },
        { $set: { status: 'delivered' } },
        { new: true }
      ).lean();

      if (msg) {
        io.to(`user:${msg.senderId}`).emit('message:delivered', {
          messageId,
          conversationId,
          deliveredTo: userId
        });
      }
    } catch (err) {
      logger.error(`message:ack error: ${err.message}`);
    }
  });

};

