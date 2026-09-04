import mongoose from 'mongoose';
import { ChatLog } from '../models/ChatLog.js';
import { answerUserChatQuery } from '../services/ragChatService.js';
import { TIER_LIMITS } from './subscriptionController.js';
import { memoryStore } from '../services/store.js';

export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    const tier = req.user.subscription?.tier || 'free';
    const dailyLimit = (TIER_LIMITS[tier] || TIER_LIMITS.free).ragMessagesPerDay;
    const todayStr = new Date().toISOString().split('T')[0];
    const isFromToday = (entry) => {
      const ts = entry?.timestamp || entry?.createdAt;
      if (!ts) return true; // entries without timestamps count toward today
      return new Date(ts).toISOString().split('T')[0] === todayStr;
    };

    // Load the user's chat log FIRST so the daily tier limit is enforced
    // before any model call is made.
    let chatLog = null;
    if (isDbConnected) {
      chatLog = await ChatLog.findOne({ userId: req.user._id });
    } else {
      chatLog = memoryStore.chatLogs.find((c) => String(c.userId) === String(req.user._id));
    }

    const userMessagesToday = (chatLog?.messages || []).filter(
      (m) => m.sender === 'user' && isFromToday(m)
    ).length;

    if (userMessagesToday >= dailyLimit) {
      const tierLabel = (TIER_LIMITS[tier] || TIER_LIMITS.free).title;
      return res.status(403).json({
        message: `Daily AI coaching limit reached (${dailyLimit} messages/day on ${tierLabel}). Upgrade to Pro Coach or Elite VIP for unlimited AI chat.`,
        code: 'RAG_DAILY_LIMIT'
      });
    }

    const { reply, flagged, flagReason } = await answerUserChatQuery({
      user: req.user,
      query: message
    });

    if (isDbConnected) {
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
