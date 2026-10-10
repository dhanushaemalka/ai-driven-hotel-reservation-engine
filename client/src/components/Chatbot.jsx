import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

// Emotion-based themes (maps to backend sentiment values: positive, negative, neutral, angry)
// HCI Principle: Affective Computing - UI adapts to user's emotional state
const THEMES = {
  positive: {
    primary: '#10B981',      // Emerald Green
    secondary: '#34D399',
    background: '#ECFDF5',
    text: '#065F46',
    emoji: '😊',
    label: 'happy',
    headerBg: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  },
  neutral: {
    primary: '#3B82F6',      // Blue
    secondary: '#60A5FA',
    background: '#EFF6FF',
    text: '#1E40AF',
    emoji: '🤖',
    label: 'neutral',
    headerBg: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  },
  negative: {
    primary: '#F59E0B',      // Amber (empathetic, not alarming)
    secondary: '#FBBF24',
    background: '#FFFBEB',
    text: '#92400E',
    emoji: '😟',
    label: 'concerned',
    headerBg: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  },
  angry: {
    primary: '#DC2626',      // Red (crisis mode)
    secondary: '#EF4444',
    background: '#FEF2F2',
    text: '#991B1B',
    emoji: '🚨',
    label: 'urgent',
    headerBg: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
  },
};

// Intent icons for visual feedback
const INTENT_ICONS = {
  negotiation: '💰',
  complaint: '🎯',
  recommendation: '🗺️',
  booking: '📅',
  general_info: '💬',
  error: '⚠️',
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState('neutral');
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [needsHumanEscalation, setNeedsHumanEscalation] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [negotiationState, setNegotiationState] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const theme = THEMES[currentSentiment] || THEMES.neutral;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Check AI health on mount
  useEffect(() => {
    checkAIHealth();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const checkAIHealth = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/ai/health`);
      const data = await res.json();
      setAiStatus(data.success ? 'online' : 'offline');
    } catch {
      setAiStatus('offline');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId, // Persistent session for multi-turn conversations
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update UI state based on LangGraph response
        const sentiment = data.sentiment || 'neutral';
        setCurrentSentiment(sentiment);
        setIsCrisisMode(data.isCrisisMode || false);
        setNeedsHumanEscalation(data.needsHumanEscalation || false);
        
        // Track negotiation state for multi-turn negotiations
        if (data.negotiationData) {
          setNegotiationState(data.negotiationData);
        }

        // Add AI response with enhanced metadata
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          sentiment: sentiment,
          intent: data.intent,
          negotiationData: data.negotiationData,
          metadata: data.metadata,
        }]);

        // Show toast for special states
        if (data.needsHumanEscalation) {
          toast.error('Our team has been notified. Expect a call soon!', { duration: 5000 });
        }
        if (data.negotiationData?.status === 'accepted') {
          toast.success(`Deal confirmed at $${data.negotiationData.final_price}/night! 🎉`, { duration: 5000 });
        }
      } else {
        // Fallback response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.fallbackResponse || "I'm sorry, I'm having trouble right now. Please contact us at +94 77 123 4567.",
          isError: true,
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm unable to connect right now. Please try again or contact Renu & Nalaka directly at +94 77 123 4567.",
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentSentiment('neutral');
    setIsCrisisMode(false);
    setNeedsHumanEscalation(false);
    setNegotiationState(null);
  };

  // Welcome message when chat opens
  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Ayubowan! 🙏 Welcome to Cloudy Hill Cottage. I'm your AI concierge. I can help you with:\n\n• Room availability & pricing\n• Negotiating rates\n• Local attractions & activities\n• Booking questions\n• Any concerns or feedback\n\nHow can I assist you today?",
      }]);
    }
  };

  return createPortal(
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl"
          style={{ background: theme.headerBg }}
          aria-label="Open chat"
        >
          <span className="animate-bounce">💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: theme.background,
            border: isCrisisMode ? '3px solid #DC2626' : 'none',
          }}
        >
          {/* Header */}
          <div
            className="p-4 text-white flex items-center justify-between"
            style={{ background: theme.headerBg }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{theme.emoji}</span>
              <div>
                <h3 className="font-bold text-lg">Cloudy Hill Cottage</h3>
                <p className="text-xs opacity-90">
                  {aiStatus === 'online' ? '🟢 AI Concierge Online' : '🔴 Offline - Limited Mode'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Crisis Mode Banner */}
          {isCrisisMode && (
            <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold animate-pulse">
              🚨 PRIORITY SUPPORT ACTIVATED - Your concern is our top priority
            </div>
          )}

          {/* Human Escalation Banner */}
          {needsHumanEscalation && !isCrisisMode && (
            <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-bold">
              📞 Our team will contact you shortly
            </div>
          )}

          {/* Active Negotiation Indicator */}
          {negotiationState?.status === 'active' && (
            <div className="bg-blue-500 text-white px-3 py-1.5 text-center text-xs">
              💰 Negotiation Round {negotiationState.round} | {negotiationState.room_type} Room
            </div>
          )}

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: theme.background }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'rounded-br-md text-white'
                      : 'rounded-bl-md'
                  } ${msg.isError ? 'border-2 border-red-300' : ''}`}
                  style={{
                    backgroundColor: msg.role === 'user' ? theme.primary : 'white',
                    color: msg.role === 'user' ? 'white' : theme.text,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {/* Intent indicator */}
                  {msg.intent && msg.role === 'assistant' && (
                    <span className="text-xs opacity-60 mt-1 block">
                      {INTENT_ICONS[msg.intent] || '💬'} {msg.intent.replace('_', ' ')}
                    </span>
                  )}
                  {/* Negotiation progress indicator */}
                  {msg.negotiationData?.status === 'active' && msg.negotiationData?.counter_offers?.length > 0 && (
                    <div className="text-xs mt-2 p-2 bg-white/50 rounded">
                      <span className="font-semibold">Your offer: </span>
                      ${msg.negotiationData.current_offer}
                      {msg.negotiationData.counter_offers.slice(-1)[0]?.counter_offer && (
                        <span> → Counter: ${msg.negotiationData.counter_offers.slice(-1)[0].counter_offer}</span>
                      )}
                    </div>
                  )}
                  {msg.negotiationData?.status === 'accepted' && (
                    <div className="text-xs mt-2 p-2 bg-green-100 rounded text-green-800 font-semibold">
                      ✅ Deal! ${msg.negotiationData.final_price}/night
                      {msg.negotiationData.add_ons?.length > 0 && (
                        <span> + {msg.negotiationData.add_ons.join(', ')}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="p-3 rounded-2xl rounded-bl-md"
                  style={{ backgroundColor: 'white' }}
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto" style={{ backgroundColor: theme.background }}>
            {['Room prices?', 'Activities nearby?', 'Book a room'].map((action) => (
              <button
                key={action}
                onClick={() => {
                  setInputText(action);
                  inputRef.current?.focus();
                }}
                className="px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all hover:scale-105"
                style={{
                  backgroundColor: 'white',
                  color: theme.primary,
                  border: `1px solid ${theme.primary}`,
                }}
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div
            className="p-4 border-t"
            style={{ borderColor: theme.primary + '30' }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-full border-2 focus:outline-none transition-all text-sm"
                style={{
                  borderColor: theme.primary + '50',
                  backgroundColor: 'white',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputText.trim()}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: theme.headerBg }}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>

            {/* Sentiment indicator */}
            <div className="mt-2 text-center text-xs" style={{ color: theme.primary }}>
              <span>
                Detected mood: {theme.emoji} {theme.label || currentSentiment}
              </span>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

export default Chatbot;
