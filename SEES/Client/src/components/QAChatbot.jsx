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
    const lowerCaseMessage = message.toLowerCase().trim();
    
    // Handle empty messages
    if (!lowerCaseMessage) {
      this.actionProvider.handleEmptyMessage();
      return;
    }

    // Handle greetings
    if (this.containsAny(lowerCaseMessage, ['hi', 'hello', 'hey', 'howdy', 'greetings'])) {
      this.actionProvider.handleGreeting();
      return;
    }

    // Handle farewells
    if (this.containsAny(lowerCaseMessage, ['bye', 'goodbye', 'see you', 'farewell'])) {
      this.actionProvider.handleFarewell();
      return;
    }

    // Handle thank you messages
    if (this.containsAny(lowerCaseMessage, ['thank', 'thanks', 'appreciate'])) {
      this.actionProvider.handleThanks();
      return;
    }

    // Handle help requests
    if (this.containsAny(lowerCaseMessage, ['help', 'assist', 'support'])) {
      this.actionProvider.handleHelp();
      return;
    }
    
    // Handle specific questions about SEES
    if (this.containsAny(lowerCaseMessage, ['what is sees', 'about sees', 'tell me about', 'purpose', 'mission'])) {
      this.actionProvider.handleSeesInfo();
      return;
    }

    // Handle registration questions
    if (this.containsAny(lowerCaseMessage, ['register', 'sign up', 'join', 'create account', 'how to register'])) {
      if (lowerCaseMessage.includes('event')) {
        this.actionProvider.handleEventRegistration();
      } else {
        this.actionProvider.handleAccountRegistration();
      }
      return;
    }

    // Handle role questions
    if (this.containsAny(lowerCaseMessage, ['role', 'account type', 'user type', 'permissions'])) {
      this.actionProvider.handleRolesInfo();
      return;
    }

    // Handle event related questions
    if (this.containsAny(lowerCaseMessage, ['event', 'workshop', 'seminar', 'conference', 'class'])) {
      if (this.containsAny(lowerCaseMessage, ['create', 'organize', 'host', 'schedule'])) {
        this.actionProvider.handleEventCreation();
      } else if (this.containsAny(lowerCaseMessage, ['find', 'search', 'discover', 'browse'])) {
        this.actionProvider.handleEventSearch();
      } else if (this.containsAny(lowerCaseMessage, ['cancel', 'refund'])) {
        this.actionProvider.handleEventCancellation();
      } else {
        this.actionProvider.handleEventInfo();
      }
      return;
    }
    
    // Handle payment questions
    if (this.containsAny(lowerCaseMessage, ['payment', 'pay', 'cost', 'price', 'fee', 'refund', 'money'])) {
      this.actionProvider.handlePaymentInfo();
      return;
    }
    
    // Handle profile questions
    if (this.containsAny(lowerCaseMessage, ['profile', 'account', 'settings', 'personal info'])) {
      this.actionProvider.handleProfileInfo();
      return;
    }
    
    // Handle technical issues
    if (this.containsAny(lowerCaseMessage, ['error', 'bug', 'problem', 'not working', 'issue', 'trouble'])) {
      this.actionProvider.handleTechnicalIssues();
      return;
    }

    // Default response for unrecognized queries
    this.actionProvider.handleGeneralResponse(message);
  }
  
  // Helper function to check if message contains any of the keywords
  containsAny(text, keywords) {
    return keywords.some(keyword => 
      text.includes(keyword) || 
      text === keyword || 
      text.startsWith(`${keyword} `) || 
      text.endsWith(` ${keyword}`)
    );
  }
}

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  handleEmptyMessage = () => {
    const message = this.createChatBotMessage(
      "I didn't catch that. How can I help you with SEES today?"
    );
    this.updateChatbotState(message);
  };

  handleGreeting = () => {
    const responses = [
      "Hello! How can I assist you with SEES today?",
      "Hi there! I'm your SEES assistant. What would you like to know?",
      "Hey! Welcome to SEES. What can I help you with?",
      "Greetings! I'm here to answer your questions about the Smart Education Events System."
    ];
    const message = this.createChatBotMessage(this.getRandomResponse(responses));
    this.updateChatbotState(message);
  };

  handleFarewell = () => {
    const responses = [
      "Goodbye! Feel free to return if you have more questions.",
      "See you later! Don't hesitate to ask more questions about SEES anytime.",
      "Farewell! Have a great day and enjoy your SEES experience.",
      "Bye for now! I'll be here when you need more information about SEES."
    ];
    const message = this.createChatBotMessage(this.getRandomResponse(responses));
    this.updateChatbotState(message);
  };

  handleThanks = () => {
    const responses = [
      "You're welcome! Is there anything else I can help you with?",
      "Happy to help! Do you have any other questions about SEES?",
      "Anytime! Feel free to ask if you need more assistance with SEES.",
      "No problem at all! Let me know if there's anything else you'd like to know."
    ];
    const message = this.createChatBotMessage(this.getRandomResponse(responses));
    this.updateChatbotState(message);
  };

  handleHelp = () => {
    const message = this.createChatBotMessage(
      "I can help you with information about SEES, including: \n\n" +
      "• Creating and finding events\n" +
      "• Account registration and user roles\n" +
      "• Event registration process\n" +
      "• Payment information\n" +
      "• Technical support\n\n" +
      "What specific aspect of SEES would you like to know more about?"
    );
    this.updateChatbotState(message);
  };

  handleSeesInfo = () => {
    const responses = [
      "SEES (Smart Education Events System) is a comprehensive platform designed to connect people with educational opportunities. It allows users to discover, organize, and participate in various educational events tailored to their interests and learning goals.",
      "The Smart Education Events System (SEES) is our platform that brings together event organizers and attendees in the educational space. We use smart matching algorithms to help you find events that align with your skills, interests, and career goals.",
      "SEES stands for Smart Education Events System. It's a platform where you can discover workshops, seminars, conferences, and courses that match your professional interests. Our system uses AI to recommend events based on your profile and past activities."
    ];
    const message = this.createChatBotMessage(this.getRandomResponse(responses));
    this.updateChatbotState(message);
  };

  handleEventRegistration = () => {
    const message = this.createChatBotMessage(
      "To register for an event on SEES:\n\n" +
      "1. Navigate to the event details page\n" +
      "2. Click the 'Register' or 'Attend' button\n" +
      "3. Complete any required payment (if it's a paid event)\n" +
      "4. You'll receive a confirmation email with event details\n\n" +
      "If you need to cancel, you can do so from your dashboard up to 24 hours before the event starts."
    );
    this.updateChatbotState(message);
  };

  handleAccountRegistration = () => {
    const message = this.createChatBotMessage(
      "Creating a SEES account is simple:\n\n" +
      "1. Click 'Sign Up' in the top navigation\n" +
      "2. Enter your email and create a password\n" +
      "3. Select your account type (Client, Admin, or Promoter)\n" +
      "4. Complete your profile with skills and interests\n" +
      "5. Verify your email address\n\n" +
      "Once verified, you'll have full access to SEES features based on your account type."
    );
    this.updateChatbotState(message);
  };

  handleRolesInfo = () => {
    const message = this.createChatBotMessage(
      "SEES has three user roles, each with different capabilities:\n\n" +
      "• Client: Attend events, build a profile of skills and interests, receive personalized event recommendations, and track your learning journey.\n\n" +
      "• Admin: Create and manage events, access analytics about event performance, manage registrations, and communicate with attendees.\n\n" +
      "• Promoter: Promote events to target audiences, track promotion performance, earn commissions, and help connect event organizers with potential attendees."
    );
    this.updateChatbotState(message);
  };

  handleEventInfo = () => {
    const message = this.createChatBotMessage(
      "SEES supports various educational events including workshops, seminars, conferences, courses, and webinars. Each event listing includes detailed information about the content, schedule, prerequisites, and learning outcomes. You can browse events by category, date, format (in-person or virtual), and skill level."
    );
    this.updateChatbotState(message);
  };

  handleEventCreation = () => {
    const message = this.createChatBotMessage(
      "To create an event as an Admin:\n\n" +
      "1. Navigate to your dashboard and select 'Create Event'\n" +
      "2. Fill in details like title, description, date, time, and capacity\n" +
      "3. Add any prerequisites or learning outcomes\n" +
      "4. Set pricing if applicable\n" +
      "5. Upload related materials or resources\n" +
      "6. Publish your event when ready\n\n" +
      "You can also save drafts and preview how your event will appear to users before publishing."
    );
    this.updateChatbotState(message);
  };

  handleEventSearch = () => {
    const message = this.createChatBotMessage(
      "Finding events on SEES is easy:\n\n" +
      "1. Use the search bar on the dashboard for keyword searches\n" +
      "2. Filter results by category, date, format, or price\n" +
      "3. Check the 'Recommended for You' section for personalized suggestions\n" +
      "4. Browse featured events on the homepage\n" +
      "5. Follow topics or organizers to see their upcoming events\n\n" +
      "Our AI also learns from your interests and past attendance to suggest relevant events."
    );
    this.updateChatbotState(message);
  };

  handleEventCancellation = () => {
    const message = this.createChatBotMessage(
      "If you need to cancel your registration:\n\n" +
      "1. Go to 'My Events' in your dashboard\n" +
      "2. Find the event you wish to cancel\n" +
      "3. Click 'Cancel Registration'\n" +
      "4. Follow the prompts to complete the cancellation\n\n" +
      "Refund policies vary by event. Generally, cancellations made at least 24 hours before the event are eligible for a full refund. Later cancellations may receive partial or no refunds, depending on the organizer's policy."
    );
    this.updateChatbotState(message);
  };

  handlePaymentInfo = () => {
    const message = this.createChatBotMessage(
      "SEES supports several payment methods including credit/debit cards, PayPal, and bank transfers for paid events. All transactions are secure and encrypted. If you're hosting events, payments are transferred to your account after the event concludes, minus a small platform fee. For refunds, please check the specific event's cancellation policy, which is displayed on the event page."
    );
    this.updateChatbotState(message);
  };

  handleProfileInfo = () => {
    const message = this.createChatBotMessage(
      "Your SEES profile is key to getting personalized experiences:\n\n" +
      "• Add skills, interests, and expertise to receive targeted event recommendations\n" +
      "• Track your learning journey and achievements\n" +
      "• Showcase your participation history\n" +
      "• Connect with other professionals\n\n" +
      "To update your profile, click on your username in the top right corner and select 'Edit Profile'."
    );
    this.updateChatbotState(message);
  };

  handleTechnicalIssues = () => {
    const message = this.createChatBotMessage(
      "If you're experiencing technical difficulties:\n\n" +
      "1. Try refreshing your browser or clearing cache\n" +
      "2. Ensure you're using a supported browser (Chrome, Firefox, Safari, or Edge)\n" +
      "3. Check our status page for any reported outages\n" +
      "4. Contact support at support@sees.edu\n\n" +
      "Our technical team typically responds within 24 hours on business days."
    );
    this.updateChatbotState(message);
  };

  handleGeneralResponse = (userMessage) => {
    // More conversational and context-aware response
    const userMessageLower = userMessage.toLowerCase();
    let responseText;
    
    if (userMessageLower.length < 5) {
      responseText = "I need a bit more information to help you. Could you elaborate on what you'd like to know about SEES?";
    } else if (userMessageLower.includes('why') || userMessageLower.includes('how come')) {
      responseText = "That's an interesting question about SEES. While I don't have all the specific details, our platform was designed to make educational events more accessible and personalized. Is there a particular aspect you're curious about?";
    } else if (userMessageLower.includes('who') || userMessageLower.includes('when') || userMessageLower.includes('where')) {
      responseText = "I'd be happy to help with your question about SEES. Could you provide a bit more context so I can give you accurate information?";
    } else {
      responseText = "I'm not sure I fully understand your question about SEES. Could you rephrase or specify what aspect of our educational events platform you're interested in? I can help with registration, events, user roles, payments, and technical support.";
    }
    
    const message = this.createChatBotMessage(responseText);
    this.updateChatbotState(message);
  };
  
  // Helper to get random response for variety
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

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