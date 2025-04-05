import React, { useState, useEffect } from 'react';
import ChatBot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import "../theme/QAChatbot.css";

class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();
    
    // Simple keyword recognition for common questions
    if (lowerCaseMessage.includes('what is sees') || lowerCaseMessage.includes('about sees')) {
      this.actionProvider.handleSeesInfo();
    } else if (lowerCaseMessage.includes('register') || lowerCaseMessage.includes('sign up')) {
      this.actionProvider.handleRegisterInfo();
    } else if (lowerCaseMessage.includes('role') || lowerCaseMessage.includes('account type')) {
      this.actionProvider.handleRolesInfo();
    } else if (lowerCaseMessage.includes('event')) {
      this.actionProvider.handleEventInfo();
    } else {
      this.actionProvider.handleDefault();
    }
  }
}

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  handleSeesInfo = () => {
    const message = this.createChatBotMessage(
      "SEES is a Smart Education Events System designed to help you discover, organize, and attend educational events with ease."
    );
    this.updateChatbotState(message);
  };

  handleRegisterInfo = () => {
    const message = this.createChatBotMessage(
      "To register for an event, navigate to the event details page and click the 'Register Now' button."
    );
    this.updateChatbotState(message);
  };

  handleRolesInfo = () => {
    const message = this.createChatBotMessage(
      "We have three roles: Client (attend events), Admin (create events), and Promoter (promote events)."
    );
    this.updateChatbotState(message);
  };

  handleEventInfo = () => {
    const message = this.createChatBotMessage(
      "You can browse all our events on the dashboard. Filter by category, date, or search for specific interests."
    );
    this.updateChatbotState(message);
  };

  handleDefault = () => {
    const message = this.createChatBotMessage(
      "I'm not sure I understand. Try asking about SEES, how to register for events, or what roles are available."
    );
    this.updateChatbotState(message);
  };

  updateChatbotState = (message) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };
}

const QAChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(false);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        if (hasNewMessages) setHasNewMessages(false);
    };

    // Optional: Demo of notification dot
    useEffect(() => {
        // Simulate receiving a new message after 30 seconds if the chatbot is closed
        const timer = setTimeout(() => {
            if (!isOpen) {
                setHasNewMessages(true);
            }
        }, 30000);
        
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Custom header component with close button
    const CustomHeader = () => (
        <div className="react-chatbot-kit-header">
            <div className="chatbot-header-title">AI Assistant</div>
            <button 
                className="chatbot-close-btn" 
                onClick={toggleChatbot}
                aria-label="Close chatbot"
            >
                ✕
            </button>
        </div>
    );

    const config = {
        initialMessages: [
            {
                id: 1,
                message: "Hi there! I'm your AI assistant. How can I help you today?",
                delay: 300,
            }
        ],
        customComponents: {
            header: () => <CustomHeader />
        },
        widgets: [],
        customStyles: {
            botMessageBox: {
                backgroundColor: '#9c27b0',
            },
            chatButton: {
                backgroundColor: '#9c27b0',
            },
        }
    };

    return (
        <div className="chatbot-wrapper">
            {isOpen ? (
                <div className="chatbot-container">
                    <ChatBot
                        config={config}
                        messageParser={MessageParser}
                        actionProvider={ActionProvider}
                    />
                </div>
            ) : (
                <button 
                    className="chatbot-toggle-btn" 
                    onClick={toggleChatbot}
                    aria-label="Open chat assistant"
                >
                    <span>💬</span>
                    {hasNewMessages && <div className="notification-dot"></div>}
                </button>
            )}
        </div>
    );
};

export default QAChatbot;