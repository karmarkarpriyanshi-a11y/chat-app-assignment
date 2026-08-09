import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000'; 
const socket = io(BACKEND_URL);

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Error fetching messages:", err));

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageData = {
      sender: username,
      text: inputMessage,
    };

    socket.emit('send_message', messageData);
    setInputMessage('');
  };

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Enter Your Name to Join Chat</h2>
        <input 
          type="text" 
          placeholder="Enter username..." 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <br /><br />
        <button 
          onClick={() => username.trim() && setIsLoggedIn(true)} 
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', border: '1px solid #ccc', borderRadius: '8px', padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>Real-Time Chat App</h3>
      <div style={{ height: '350px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '16px', borderRadius: '4px', background: '#f9f9f9' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '12px', textAlign: msg.sender === username ? 'right' : 'left' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>{msg.sender} ({msg.timestamp})</span>
            <div>
              <p style={{ 
                margin: '4px 0 0 0', 
                background: msg.sender === username ? '#dcf8c6' : '#ffffff', 
                display: 'inline-block', 
                padding: '8px 12px', 
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)' 
              }}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;