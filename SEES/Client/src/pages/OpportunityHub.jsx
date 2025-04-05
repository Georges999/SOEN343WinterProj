import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    // Fetch recommendations based on profile
    const fetchRecommendations = async () => {
        setLoading(true);
        setError('');
        try {
            const profile = { skills, achievements, expertise };
            const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
            
            // Update user profile first
            if (user?._id) {
                const profileResponse = await fetch(`/api/users/${user._id}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(profile)
                });
                
                if (!profileResponse.ok) {
                    throw new Error('Failed to update profile');
                }
            }
            
            // Then get recommendations
            const response = await fetch('/api/events/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
            
            if (!response.ok) {
                throw new Error('Failed to get recommendations');
            }
            
            const data = await response.json();
            setRecommendations(data);
            setProfileComplete(true);
        } catch (err) {
            setError(err.message || 'Failed to fetch recommendations');
        } finally {
            setLoading(false);
        }
    };

    // Configure chatbot
    const config = {
        initialMessages: [
            {
                id: 1,
                message: "Hello! I'm your event matchmaker. Let's find the perfect opportunities for you. Let's start with your skills.",
            },
            {
                id: 2,
                message: "What are some of your key skills? (e.g., 'JavaScript, Project Management, Data Analysis')",
            }
        ],
        botName: "EventMatch AI",
        customStyles: {
            botMessageBox: {
                backgroundColor: '#3778c2',
            },
            chatButton: {
                backgroundColor: '#3778c2',
            },
        }
    };

    const MessageParser = ({ children, actions }) => {
        const parse = (message) => {
            const currentState = actions.getCurrentState();
            
            if (currentState === 'skills') {
                const newSkills = message.split(',').map(s => s.trim()).filter(s => s);
                if (newSkills.length > 0) {
                    actions.updateSkills(newSkills);
                    actions.nextQuestion('achievements');
                } else {
                    actions.handleInvalidInput("Please enter at least one skill.");
                }
            } else if (currentState === 'achievements') {
                const newAchievements = message.split(',').map(s => s.trim()).filter(s => s);
                if (newAchievements.length > 0) {
                    actions.updateAchievements(newAchievements);
                    actions.nextQuestion('expertise');
                } else {
                    actions.handleInvalidInput("Please enter at least one achievement.");
                }
            } else if (currentState === 'expertise') {
                const newExpertise = message.split(',').map(s => s.trim()).filter(s => s);
                if (newExpertise.length > 0) {
                    actions.updateExpertise(newExpertise);
                    actions.completeProfile();
                } else {
                    actions.handleInvalidInput("Please enter at least one area of expertise.");
                }
            }
        };

        return (
            <div>
                {React.Children.map(children, (child) => {
                    return React.cloneElement(child, {
                        parse: parse,
                        actions: actions,
                    });
                })}
            </div>
        );
    };

    const ActionProvider = ({ createChatBotMessage, setState, children }) => {
        const getCurrentState = () => {
            let state;
            setState(prev => {
                state = prev.currentState || 'skills';
                return prev;
            });
            return state;
        };

        const handleInvalidInput = (message) => {
            const botMessage = createChatBotMessage(message);
            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, botMessage],
            }));
        };

        const updateSkills = (newSkills) => {
            setState((prev) => ({ 
                ...prev, 
                skills: [...(prev.skills || []), ...newSkills],
                currentState: 'skills'
            }));
            setSkills(prevSkills => [...prevSkills, ...newSkills]);
        };

        const updateAchievements = (newAchievements) => {
            setState((prev) => ({ 
                ...prev, 
                achievements: [...(prev.achievements || []), ...newAchievements],
                currentState: 'achievements'
            }));
            setAchievements(prevAchievements => [...prevAchievements, ...newAchievements]);
        };

        const updateExpertise = (newExpertise) => {
            setState((prev) => ({ 
                ...prev, 
                expertise: [...(prev.expertise || []), ...newExpertise],
                currentState: 'expertise'
            }));
            setExpertise(prevExpertise => [...prevExpertise, ...newExpertise]);
        };

        const nextQuestion = (type) => {
            setState((prev) => ({ ...prev, currentState: type }));
            let message = '';
            
            if (type === 'achievements') {
                message = "Excellent! Those are valuable skills. Now, tell me about your key achievements or projects you're proud of.";
            } else if (type === 'expertise') {
                message = "Impressive achievements! Finally, what specific areas or industries are you most experienced or interested in?";
            }

            const botMessage = createChatBotMessage(message);
            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, botMessage],
            }));
        };

        const completeProfile = () => {
            setState((prev) => ({ ...prev, currentState: 'complete' }));
            
            const botMessage = createChatBotMessage(
                "Thank you! Based on your profile, I'm finding events that match your background and interests. This will help you connect with the right opportunities and people."
            );
            
            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, botMessage],
            }));
            
            // Fetch recommendations after a short delay
            setTimeout(() => {
                fetchRecommendations();
            }, 1000);
        };

        return (
            <div>
                {React.Children.map(children, (child) => {
                    return React.cloneElement(child, {
                        actions: {
                            updateSkills,
                            updateAchievements,
                            updateExpertise,
                            nextQuestion,
                            completeProfile,
                            handleInvalidInput,
                            getCurrentState,
                            currentState: getCurrentState()
                        },
                    });
                })}
            </div>
        );
    };

    const startNewProfile = () => {
        setSkills([]);
        setAchievements([]);
        setExpertise([]);
        setRecommendations([]);
        setProfileComplete(false);
        setShowChatbot(true);
    };

    const useExistingProfile = () => {
        fetchRecommendations();
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
                            {recommendations.map(event => (
                                <div className="event-recommendation-card" key={event._id}>
                                    <h4>{event.title}</h4>
                                    <div className="event-meta">
                                        <span className="event-date">
                                            <i className="far fa-calendar"></i> 
                                            {new Date(event.dateTime).toLocaleDateString()}
                                        </span>
                                        <span className="event-location">
                                            <i className="fas fa-map-marker-alt"></i> 
                                            {event.location}
                                        </span>
                                    </div>
                                    <p className="event-description">{event.description}</p>
                                    <div className="match-reasons">
                                        <h5>Why this matches you:</h5>
                                        <ul>
                                            {event.matchReasons && event.matchReasons.map((reason, idx) => (
                                                <li key={`reason-${idx}`}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Link to={`/events/${event._id}`} className="view-event">
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