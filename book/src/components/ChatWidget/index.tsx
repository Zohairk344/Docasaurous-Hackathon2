import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatWidget.module.css';
import { X, Send, Bot, User, Loader2, Sparkles, MessageCircle, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from '@docusaurus/Link'; // For the Login button
import { authClient } from '../../lib/auth-client'; // Import Auth

interface Message {
  sender: 'user' | 'bot';
  text: string;
  sources?: { url: string; document_id: string }[];
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AUTH CHECK
  const { data: session } = authClient.useSession();

  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: "Hi there! I'm your **Physical AI Assistant**. \n\nI can help you understand concepts like **ROS 2**, **Gazebo**, or **Humanoid Control**. What are you working on today?" 
    }
  ]);

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userText = input;
    setInput('');
    
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/rag/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: userText }),
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        
        setMessages(prev => [...prev, { 
            sender: 'bot', 
            text: data.answer, 
            sources: data.sources 
        }]);

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { 
            sender: 'bot', 
            text: "⚠️ **Connection Error**: I couldn't reach the AI brain. Please make sure the backend server is running." 
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatWidgetContainer}>
      
      {/* --- CHAT WINDOW --- */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
        
        {/* Header */}
        <div className={styles.chatHeader} onClick={toggleOpen}>
          <div className={styles.headerTitle}>
            <div className={styles.botIconWrapper}>
                {session ? <Bot size={20} color="#00f3ff" /> : <Lock size={18} color="#ff5757"/>}
            </div>
            <div>
                <h3>{session ? 'AI Assistant' : 'Chat Locked'}</h3>
                <span className={styles.statusIndicator} style={!session ? {color: '#888'} : {}}>
                    {session ? '● Online' : '● Login Required'}
                </span>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleOpen(); }} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* --- CONTENT AREA --- */}
        {session ? (
            // LOGGED IN VIEW (Normal Chat)
            <>
                <div className={styles.chatMessages}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.messageRow} ${styles[msg.sender]}`}>
                    <div className={styles.avatar}>
                        {msg.sender === 'bot' ? <Sparkles size={14} /> : <User size={14} />}
                    </div>
                    <div className={styles.messageBubble}>
                        <div className="markdown-body">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className={styles.sourcesContainer}>
                                <span className={styles.sourceLabel}>Sources:</span>
                                <div className={styles.sourceList}>
                                    {msg.sources.map((src, i) => (
                                        <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className={styles.sourceChip}>
                                            {i + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className={`${styles.messageRow} ${styles.bot}`}>
                    <div className={styles.avatar}><Sparkles size={14} /></div>
                    <div className={styles.messageBubble}>
                        <div className={styles.typingIndicator}>
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
                </div>

                <div className={styles.chatInputArea}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                />
                <button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className={styles.spin} size={18} /> : <Send size={18} />}
                </button>
                </div>
            </>
        ) : (
            // LOCKED VIEW (Guest)
            <div style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', 
                padding: '2rem', textAlign: 'center', color: '#ccc' 
            }}>
                <div style={{ 
                    background: 'rgba(255, 87, 87, 0.1)', 
                    padding: '1rem', borderRadius: '50%', marginBottom: '1rem' 
                }}>
                    <Lock size={32} color="#ff5757" />
                </div>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Assistant Locked</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    Sign in to access the RAG AI Assistant and ask questions about the textbook.
                </p>
                <Link to="/login" className="button button--primary button--block">
                    Login / Signup
                </Link>
            </div>
        )}
      </div>

      {/* Toggle Button */}
      <button onClick={toggleOpen} className={`${styles.chatIcon} ${isOpen ? styles.hidden : ''}`}>
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default ChatWidget;