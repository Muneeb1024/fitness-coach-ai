import mongoose from 'mongoose';
import { ChatLog } from '../models/ChatLog.js';
import { answerUserChatQuery } from '../services/ragChatService.js';
import { memoryStore } from '../services/store.js';

export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const { reply, flagged, flagReason } = await answerUserChatQuery({
      user: req.user,
      query: message
    });

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let chatLog = await ChatLog.findOne({ userId: req.user._id });
      if (!chatLog) chatLog = new ChatLog({ userId: req.user._id, messages: [] });

      chatLog.messages.push(
        { sender: 'user', text: message, timestamp: new Date() },
        { sender: 'ai', text: reply, timestamp: new Date() }
      );

      if (flagged) {
        chatLog.flagged = true;
        chatLog.flagReason = flagReason;
      }

      await chatLog.save();
      return res.json({ reply, flagged, chatHistory: chatLog.messages });
    }

    let chatLog = memoryStore.chatLogs.find((c) => String(c.userId) === String(req.user._id));
    if (!chatLog) {
      chatLog = { _id: `chat_${Date.now()}`, userId: req.user._id, messages: [], flagged: false, flagReason: '' };
      memoryStore.chatLogs.push(chatLog);
    }

    chatLog.messages.push(
      { sender: 'user', text: message, timestamp: new Date() },
      { sender: 'ai', text: reply, timestamp: new Date() }
    );

    if (flagged) {
      chatLog.flagged = true;
      chatLog.flagReason = flagReason;
    }

    res.json({ reply, flagged, chatHistory: chatLog.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const chatLog = await ChatLog.findOne({ userId: req.user._id });
      return res.json({ history: chatLog ? chatLog.messages : [] });
    }

    const chatLog = memoryStore.chatLogs.find((c) => String(c.userId) === String(req.user._id));
    res.json({ history: chatLog ? chatLog.messages : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
