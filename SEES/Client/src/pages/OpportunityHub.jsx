import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createChatBotMessage } from 'react-chatbot-kit';
import ChatBot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import '../theme/OpportunityHub.css';

const OpportunityHub = ({ user }) => {
    const [skills, setSkills] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [expertise, setExpertise] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [profileComplete, setProfileComplete] = useState(false);
    const [showChatbot, setShowChatbot] = useState(true);
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    
    console.log("Current user data:", user); // Debug user info

    // Check if user already has profile data
    useEffect(() => {
        if (user) {
            if (user.skills?.length > 0 || user.achievements?.length > 0 || user.expertise?.length > 0) {
                setSkills(user.skills || []);
                setAchievements(user.achievements || []);
                setExpertise(user.expertise || []);
                setHasExistingProfile(true);
                setShowChatbot(false);
            }
        }
    }, [user]);

  // Update the fetchRecommendations function with proper API URLs
const fetchRecommendations = async (skipProfileUpdate = false) => {
    setLoading(true);
    setError('');
    
    try {
        const profile = { skills, achievements, expertise };
        const token = user?.token || localStorage.getItem('token') || 
                     (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.token : null);
        
        if (!token) {
            throw new Error('Authentication token is missing. Please login again.');
        }
        
        console.log("Profile data to send:", profile); // Debug profile data
        
        // Update user profile first (if needed)
        if (!skipProfileUpdate && user?._id) {
            try {
                console.log(`Attempting to update profile for user ID: ${user._id}`);
                
                // Use absolute URL with correct port (5000)
                const profileResponse = await fetch(`http://localhost:5000/api/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(profile)
                });
                
                console.log("Profile update response status:", profileResponse.status);
                
                if (!profileResponse.ok) {
                    const errorData = await profileResponse.json();
                    console.error("Profile update error:", errorData);
                    // Continue with recommendations even if profile update fails
                } else {
                    const updatedUser = await profileResponse.json();
                    console.log("Profile updated successfully:", updatedUser);
                }
            } catch (profileError) {
                console.error("Error updating profile:", profileError);
                // Continue with recommendations even if profile update fails
            }
        }
        
        // Then get recommendations - use absolute URL with correct port (5000)
        const response = await fetch('http://localhost:5000/api/auth/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profile)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get recommendations: ${response.status} ${response.statusText}`);
        }
        
        const responseText = await response.text(); // First get the raw text
        console.log("Raw API response:", responseText); // Log the raw response for debugging
        
        // Only parse as JSON if there's actual content
        if (responseText.trim()) {
            const data = JSON.parse(responseText);
            console.log("Recommendations received:", data);
            setRecommendations(data);
            setProfileComplete(true);
            setShowChatbot(false);
        } else {
            console.warn("Empty response from recommendations API");
            setRecommendations([]);
            setProfileComplete(true);
            setShowChatbot(false);
        }
    } catch (err) {
        console.error("Error in fetchRecommendations:", err);
        setError(err.message || 'Failed to fetch recommendations');
    } finally {
        setLoading(false);
    }
};
    // Define chatbot config
    const config = {
        initialMessages: [
            createChatBotMessage("Hello! I'm your event matchmaker. Let's find the perfect opportunities for you. Let's start with your skills."),
            createChatBotMessage("What are some of your key skills? (e.g., 'JavaScript, Project Management, Data Analysis')")
        ],
        botName: "EventMatch AI",
        customStyles: {
            botMessageBox: {
                backgroundColor: '#3778c2',
            },
            chatButton: {
                backgroundColor: '#3778c2',
            },
        },
        state: {
            currentState: 'skills',
            skills: [],
            achievements: [],
            expertise: []
        }
    };

    // Message parser class
    class MessageParser {
        constructor(actionProvider, state) {
            this.actionProvider = actionProvider;
            this.state = state;
        }
        
        parse(message) {
            console.log("Parsing message:", message); // Debug incoming messages
            const currentState = this.state.currentState || 'skills';
            console.log("Current state:", currentState); // Debug current state
            
            if (currentState === 'skills') {
                const newSkills = message.split(',').map(s => s.trim()).filter(s => s);
                console.log("Parsed skills:", newSkills); // Debug parsed skills
                
                if (newSkills.length > 0) {
                    this.actionProvider.updateSkills(newSkills);
                    this.actionProvider.nextQuestion('achievements');
                } else {
                    this.actionProvider.handleInvalidInput("Please enter at least one skill.");
                }
            } else if (currentState === 'achievements') {
                const newAchievements = message.split(',').map(s => s.trim()).filter(s => s);
                console.log("Parsed achievements:", newAchievements); // Debug parsed achievements
                
                if (newAchievements.length > 0) {
                    this.actionProvider.updateAchievements(newAchievements);
                    this.actionProvider.nextQuestion('expertise');
                } else {
                    this.actionProvider.handleInvalidInput("Please enter at least one achievement.");
                }
            } else if (currentState === 'expertise') {
                const newExpertise = message.split(',').map(s => s.trim()).filter(s => s);
                console.log("Parsed expertise:", newExpertise); // Debug parsed expertise
                
                if (newExpertise.length > 0) {
                    this.actionProvider.updateExpertise(newExpertise);
                    this.actionProvider.completeProfile();
                } else {
                    this.actionProvider.handleInvalidInput("Please enter at least one area of expertise.");
                }
            }
        }
    }

    // Action provider class
    class ActionProvider {
        constructor(createChatBotMessage, setStateFunc) {
            this.createChatBotMessage = createChatBotMessage;
            this.setState = setStateFunc;
        }

        handleInvalidInput = (message) => {
            const botMessage = this.createChatBotMessage(message);
            this.updateChatbotState(botMessage);
        };

        updateSkills = (newSkills) => {
            this.setState((prev) => ({
                ...prev,
                skills: [...(prev.skills || []), ...newSkills],
                currentState: 'skills'
            }));
            setSkills(prevSkills => [...prevSkills, ...newSkills]);
            console.log("Skills updated:", [...skills, ...newSkills]); // Debug skills update
        };

        updateAchievements = (newAchievements) => {
            this.setState((prev) => ({
                ...prev,
                achievements: [...(prev.achievements || []), ...newAchievements],
                currentState: 'achievements'
            }));
            setAchievements(prevAchievements => [...prevAchievements, ...newAchievements]);
            console.log("Achievements updated:", [...achievements, ...newAchievements]); // Debug achievements update
        };

        updateExpertise = (newExpertise) => {
            this.setState((prev) => ({
                ...prev,
                expertise: [...(prev.expertise || []), ...newExpertise],
                currentState: 'expertise'
            }));
            setExpertise(prevExpertise => [...prevExpertise, ...newExpertise]);
            console.log("Expertise updated:", [...expertise, ...newExpertise]); // Debug expertise update
        };

        nextQuestion = (type) => {
            this.setState((prev) => ({ ...prev, currentState: type }));
            let message = '';
            
            if (type === 'achievements') {
                message = "Excellent! Those are valuable skills. Now, tell me about your key achievements or projects you're proud of.";
            } else if (type === 'expertise') {
                message = "Impressive achievements! Finally, what specific areas or industries are you most experienced or interested in?";
            }

            const botMessage = this.createChatBotMessage(message);
            this.updateChatbotState(botMessage);
        };

        completeProfile = () => {
            this.setState((prev) => ({ ...prev, currentState: 'complete' }));
            
            const botMessage = this.createChatBotMessage(
                "Thank you! Based on your profile, I'm finding events that match your background and interests. This will help you connect with the right opportunities and people."
            );
            
            this.updateChatbotState(botMessage);
            
            // Skip profile update and just get recommendations
            // This avoids the problematic /:id/profile endpoint
            setTimeout(() => {
                fetchRecommendations(true);
            }, 1500);
        };

        updateChatbotState = (message) => {
            this.setState(prev => ({
                ...prev, 
                messages: [...prev.messages, message]
            }));
        };
    }

    const startNewProfile = () => {
        setSkills([]);
        setAchievements([]);
        setExpertise([]);
        setRecommendations([]);
        setProfileComplete(false);
        setShowChatbot(true);
    };

    const useExistingProfile = () => {
        fetchRecommendations(true); // Skip profile update, just get recommendations
    };

    return (
        <div className="opportunity-hub-container">
            <div className="opportunity-hub">
                <h2>Opportunity Hub</h2>
                <p className="opportunity-hub-intro">
                    Connect with events that match your professional profile and interests.
                    Our AI assistant will help find opportunities that enhance your networking and career growth.
                </p>

                {hasExistingProfile && !showChatbot && !profileComplete && (
                    <div className="existing-profile">
                        <h3>We already have some information about you</h3>
                        <div className="profile-summary">
                            {skills.length > 0 && (
                                <div className="profile-section">
                                    <h4>Skills</h4>
                                    <div className="tags">
                                        {skills.map((skill, idx) => (
                                            <span key={`skill-${idx}`} className="tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {achievements.length > 0 && (
                                <div className="profile-section">
                                    <h4>Achievements</h4>
                                    <div className="tags">
                                        {achievements.map((achievement, idx) => (
                                            <span key={`achievement-${idx}`} className="tag">{achievement}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {expertise.length > 0 && (
                                <div className="profile-section">
                                    <h4>Areas of Expertise</h4>
                                    <div className="tags">
                                        {expertise.map((area, idx) => (
                                            <span key={`expertise-${idx}`} className="tag">{area}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="profile-actions">
                            <button 
                                className="use-existing-btn"
                                onClick={useExistingProfile}
                            >
                                Use this profile
                            </button>
                            <button 
                                className="start-new-btn" 
                                onClick={startNewProfile}
                            >
                                Create new profile
                            </button>
                        </div>
                    </div>
                )}

                {showChatbot && !profileComplete && (
                    <div className="chatbot-container">
                        <ChatBot
                            config={config}
                            messageParser={MessageParser}
                            actionProvider={ActionProvider}
                            headerText="Event Matchmaker"
                            placeholderText="Type your response here..."
                        />
                    </div>
                )}

                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Finding perfect events for you...</p>
                    </div>
                )}
                
                {error && <div className="error-message">{error}</div>}

                {profileComplete && recommendations.length > 0 && (
                    <div className="recommendations">
                        <h3>Recommended Events for You</h3>
                        <p className="recommendation-intro">
                            Based on your profile, we've found these events that match your background and interests:
                        </p>
                        <div className="event-recommendations">
                            {recommendations.map((rec, index) => (
                                <div className="event-recommendation-card" key={index}>
                                    <h4>{rec.event?.title || rec.title || 'Untitled Event'}</h4>
                                    <div className="event-meta">
                                        <span className="event-date">
                                            <i className="far fa-calendar"></i> 
                                            {new Date((rec.event?.dateTime || rec.dateTime || new Date())).toLocaleDateString()}
                                        </span>
                                        <span className="event-location">
                                            <i className="fas fa-map-marker-alt"></i> 
                                            {rec.event?.location || rec.location || 'Online'}
                                        </span>
                                    </div>
                                    <p className="event-description">
                                        {rec.event?.description || rec.description || 'No description available'}
                                    </p>
                                    <div className="match-score">
                                        <h5>Match Score: {Math.round((rec.score || 0.5) * 100)}%</h5>
                                    </div>
                                    <Link to={`/events/${rec.event?._id || rec._id || '#'}`} className="view-event">
                                        View Event Details
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <button className="refresh-btn" onClick={startNewProfile}>
                            Update Your Profile
                        </button>
                    </div>
                )}

                {profileComplete && recommendations.length === 0 && (
                    <div className="no-recommendations">
                        <h3>No Matching Events Found</h3>
                        <p>We couldn't find any events that match your profile right now. Check back soon as new events are added regularly.</p>
                        <button className="refresh-btn" onClick={startNewProfile}>
                            Update Your Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpportunityHub;