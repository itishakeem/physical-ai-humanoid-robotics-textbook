// src/components/ChatWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@site/src/contexts/AuthContext";
import "./ChatWidget.css";

const BACKEND_URL = "http://127.0.0.1:8000/chat";
const API_BASE_URL = "http://127.0.0.1:8000/api/chat-history";

// Random welcome messages for non-logged-in users
const RANDOM_WELCOME_MESSAGES = [
  "Hello there!",
  "Welcome to our AI Assistant!",
  "Hi! How can I help you today?",
  "Welcome! Ask me anything about humanoid robotics.",
  "Hello! Ready to explore humanoid robotics?",
  "Welcome! I'm here to help you learn.",
];

const getRandomWelcomeMessage = () => {
  return RANDOM_WELCOME_MESSAGES[Math.floor(Math.random() * RANDOM_WELCOME_MESSAGES.length)];
};

export default function ChatWidget() {
  const { user, token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [backendOnline, setBackendOnline] = useState(true);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  // Set welcome message based on auth status
  useEffect(() => {
    if (isAuthenticated && user) {
      setWelcomeMessage(`Welcome, ${user.first_name}!`);
    } else {
      setWelcomeMessage(getRandomWelcomeMessage());
    }
  }, [isAuthenticated, user]);

  // Load all chats on mount if authenticated - ONLY ONCE
  useEffect(() => {
    if (isAuthenticated && chats.length === 0) {
      loadChats();
    } else if (!isAuthenticated) {
      setLoadingChats(false);
      setCurrentMessages([]);
      setChats([]);
      setCurrentChatId(null);
    }
  }, [isAuthenticated]);

  // Load messages when current chat changes - PREVENT LOOPS
  useEffect(() => {
    if (currentChatId && isAuthenticated) {
      loadChatMessages(currentChatId);
    }
  }, [currentChatId]);

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Removed health check - causes false offline warnings and delays

  const loadChats = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error("Failed to load chats");
      }

      const data = await response.json();

      // Convert backend format (snake_case) to frontend format (camelCase)
      const formattedChats = data.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        message_count: chat.message_count
      }));

      setChats(formattedChats);

      if (formattedChats.length > 0 && !currentChatId) {
        setCurrentChatId(formattedChats[0].id);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChatMessages = async (chatId) => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Failed to load messages");
      const data = await response.json();
      setCurrentMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setCurrentMessages([]);
    }
  };

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ 
        top: bodyRef.current.scrollHeight, 
        behavior: "smooth" 
      });
    }
  }, [currentMessages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  const startNewChat = async () => {
    if (!isAuthenticated) {
      // For non-authenticated users, just clear the chat
      setCurrentMessages([]);
      setCurrentChatId(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: "New Conversation" })
      });

      if (!response.ok) throw new Error("Failed to create chat");

      const newChatData = await response.json();

      // Convert backend format (created_at) to frontend format (createdAt)
      const newChat = {
        id: newChatData.id,
        title: newChatData.title,
        createdAt: newChatData.created_at,
        updatedAt: newChatData.updated_at,
        message_count: newChatData.messages?.length || 1
      };

      // Update chats list with the new chat at the top
      setChats(prev => [newChat, ...prev]);

      // Set this as the current chat
      setCurrentChatId(newChat.id);

      // Set the welcome message from the response
      if (newChatData.messages && newChatData.messages.length > 0) {
        const formattedMessages = newChatData.messages.map(msg => ({
          role: msg.role,
          text: msg.text,
          id: msg.id
        }));
        setCurrentMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      // Clear UI even on error
      setCurrentMessages([]);
      setCurrentChatId(null);
    }
  };

  const clearCurrentChat = async () => {
    if (!currentChatId || !isAuthenticated) return;
    if (window.confirm("Clear all messages in this chat? This cannot be undone.")) {
      try {
        const response = await fetch(`${API_BASE_URL}/chats/${currentChatId}/clear`, {
          method: "PUT",
          headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error("Failed to clear chat");
        await loadChatMessages(currentChatId);
      } catch (error) {
        console.error("Error clearing chat:", error);
        alert("Failed to clear chat. Please try again.");
      }
    }
  };

  const clearAllHistory = async () => {
    if (!isAuthenticated) return;

    // Instant UI update
    setChats([]);
    setCurrentChatId(null);
    setCurrentMessages([]);
    setShowClearAllConfirm(false);

    // Delete in background
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        loadChats(); // Restore on failure
      }
    } catch (error) {
      console.error("Error clearing all history:", error);
      loadChats(); // Restore on failure
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };


  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    // Variable to hold the active chat ID for this message
    let activeChatId = currentChatId;

    // If authenticated but no chat ID, create one first
    if (isAuthenticated && !currentChatId) {
      try {
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ title: "New Conversation" })
        });
        if (!response.ok) throw new Error("Failed to create chat");
        const newChatData = await response.json();

        // Convert backend format to frontend format
        const newChat = {
          id: newChatData.id,
          title: newChatData.title,
          createdAt: newChatData.created_at,
          updatedAt: newChatData.updated_at,
          message_count: newChatData.messages?.length || 1
        };

        // Add to chats list
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        activeChatId = newChat.id; // Use this chat ID for the current message

        // Set welcome message if present
        if (newChatData.messages && newChatData.messages.length > 0) {
          const formattedMessages = newChatData.messages.map(msg => ({
            role: msg.role,
            text: msg.text,
            id: msg.id
          }));
          setCurrentMessages(formattedMessages);
        }
        // Don't return here - continue with sending the message
      } catch (error) {
        console.error("Error creating new chat:", error);
        // Even if chat creation fails, allow chat without saving (fallback to anonymous mode)
        console.log("Falling back to anonymous chat mode");
      }
    }

    // Optimistically add user message to UI
    const tempUserMsg = { role: "user", text: userText, id: Date.now() };
    const tempBotMsg = { role: "bot", text: "", id: Date.now() + 1 };
    setCurrentMessages(prev => [...prev, tempUserMsg, tempBotMsg]);

    setIsLoading(true);

    try {
      // Save user message to database (if authenticated and has chat ID) - non-blocking
      if (isAuthenticated && activeChatId) {
        fetch(`${API_BASE_URL}/chats/${activeChatId}/messages`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ role: "user", text: userText })
        }).catch(err => console.error("Error saving user message:", err));
      }

      // Prepare conversation history for context (last 10 messages)
      const conversationHistory = currentMessages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Get bot response via streaming (include user level and conversation history)
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          stream: true,
          user_level: isAuthenticated && user ? user.developer_level : "Intermediate",
          conversation_history: conversationHistory
        })
      });

      if (!res.ok) throw new Error('Network response was not ok');

      // Immediately enable input after request starts - user can type next message while bot responds
      setIsLoading(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream completed. Total text length:", botText.length);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          botText += chunk;

          // Update bot message in UI as it streams
          setCurrentMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === "bot") {
              updated[updated.length - 1] = { ...lastMsg, text: botText };
            }
            return updated;
          });
        }
      } catch (streamError) {
        console.error("Streaming error:", streamError);
        // Continue with whatever text was received
        console.log("Partial response received:", botText.length, "characters");
      }

      // Save bot message to database after streaming completes (if authenticated)
      if (isAuthenticated && activeChatId) {
        // Save the message without blocking the UI
        fetch(`${API_BASE_URL}/chats/${activeChatId}/messages`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ role: "bot", text: botText })
        }).catch(err => console.error("Error saving bot message:", err));
      }

    } catch (error) {
      console.error('Chat error:', error);
      setCurrentMessages(prev => {
        const updated = [...prev];
        // Remove the empty bot message and add error message
        updated.pop();
        updated.push({
          role: "bot",
          text: "⚠️ Connection error. Please check if the backend is running on http://127.0.0.1:8000",
          id: Date.now()
        });
        return updated;
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteChat = async (chatId, e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) return;

    if (showDeleteConfirm === chatId) {
      // User confirmed deletion - immediate UI update for responsiveness
      console.log('Deleting chat:', chatId);

      // Update local state immediately for instant feedback
      const updatedChats = chats.filter(c => c.id !== chatId);
      setChats(updatedChats);

      // If deleted chat was current, switch to another or clear
      if (currentChatId === chatId) {
        if (updatedChats.length > 0) {
          setCurrentChatId(updatedChats[0].id);
        } else {
          setCurrentChatId(null);
          setCurrentMessages([]);
        }
      }

      setShowDeleteConfirm(null);

      // Perform actual deletion in background
      try {
        const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Failed to delete chat' }));
          console.error('Delete chat error:', errorData);
          // Reload chats to restore state if deletion failed
          loadChats();
        }

        console.log('Chat deleted successfully');
      } catch (error) {
        console.error("Error deleting chat:", error);
        // Reload chats to restore state
        loadChats();
      }
    } else {
      // First click - show confirmation
      setShowDeleteConfirm(chatId);
      setTimeout(() => setShowDeleteConfirm(null), 3000);
    }
  };

  if (typeof window === "undefined") return null;

  return (
    <>
      {/* FAB Button */}
      <div 
        className="fab" 
        onClick={() => setOpen(!open)}
        role="button"
        aria-label="Toggle chat"
      >
        <svg 
          viewBox="0 0 24 24" 
          width="30" 
          height="30" 
          fill="currentColor"
          style={{ 
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s'
          }}
        >
          {open ? (
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          ) : (
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          )}
        </svg>
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chat-container">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-header">
              <button
                onClick={startNewChat}
                className="new-chat-btn"
                disabled={isLoading}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {!isAuthenticated ? "Clear Chat" : "+ New Chat"}
                </span>
              </button>
              {chats.length > 0 && isAuthenticated && (
                <button
                  onClick={() => setShowClearAllConfirm(!showClearAllConfirm)}
                  className="clear-all-btn"
                  title="Clear all history"
                >
                  🗑️ Clear All
                </button>
              )}
              {showClearAllConfirm && (
                <div className="confirm-dialog">
                  <p>Delete all chats?</p>
                  <div className="confirm-buttons">
                    <button onClick={clearAllHistory} className="confirm-yes">Yes</button>
                    <button onClick={() => setShowClearAllConfirm(false)} className="confirm-no">No</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-list">
              {!isAuthenticated ? (
                <div className="empty-history">
                  <p style={{ fontSize: '13px', marginBottom: '8px' }}>💬 Chat freely!</p>
                  <p className="empty-hint" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    Sign in to save your chat history across sessions
                  </p>
                </div>
              ) : loadingChats ? (
                <div className="empty-history">
                  <p>Loading...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="empty-history">
                  <p>No chat history</p>
                  <p className="empty-hint">Start a new conversation!</p>
                </div>
              ) : (
                chats.map(chat => (
                  <div
                    key={chat.id}
                    className={`chat-item ${currentChatId === chat.id ? "active" : ""} ${showDeleteConfirm === chat.id ? "delete-confirm" : ""}`}
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setShowDeleteConfirm(null);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="chat-item-content">
                      <span className="chat-item-title">{chat.title}</span>
                      {chat.createdAt && (
                        <span className="chat-item-time">{formatDate(chat.createdAt)}</span>
                      )}
                    </div>
                    {showDeleteConfirm === chat.id ? (
                      <button
                        className="delete-chat-btn confirm"
                        onClick={(e) => deleteChat(chat.id, e)}
                        aria-label="Confirm delete"
                        title="Confirm delete"
                      >
                        ✓
                      </button>
                    ) : (
                      <button
                        className="delete-chat-btn"
                        onClick={(e) => deleteChat(chat.id, e)}
                        aria-label="Delete chat"
                        title="Delete chat"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat */}
          <div className="main-chat">
            <div className="header">
              <div className="header-left">
                <h3>
                  {isAuthenticated && user
                    ? `🤖 Welcome, ${user.first_name}!`
                    : "🤖 Humanoid Robotics Expert"}
                </h3>
                {currentChatId && isAuthenticated && (
                  <button
                    onClick={clearCurrentChat}
                    className="clear-chat-btn"
                    title="Clear current chat"
                    aria-label="Clear current chat"
                  >
                    🗑️ Clear
                  </button>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="close"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            <div className="messages" ref={bodyRef}>
              {currentMessages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: '#667eea', fontSize: '16px' }}>
                    Ask me anything
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    Humanoid Robotics Expert
                  </div>
                  {!isAuthenticated && (
                    <div style={{
                      fontSize: '11px',
                      color: '#888',
                      marginTop: '12px',
                      padding: '8px',
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      💡 Sign in to save chat history
                    </div>
                  )}
                </div>
              ) : (
                currentMessages.map((m, i) => (
                  <div key={i} className={`message ${m.role}`}>
                    <div className="bubble">
                      {m.text || <span style={{ opacity: 0.5 }}>●●●</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="input-area">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about ZMP, torque control, or Atlas..."
                disabled={isLoading}
                aria-label="Message input"
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()} 
                className="send-btn"
                aria-label="Send message"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  width="22" 
                  height="22" 
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}