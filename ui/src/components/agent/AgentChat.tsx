import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, User, Bot, Trophy, MapPin, Star, ExternalLink, Clock, Zap } from 'lucide-react';

type Venue = {
  venue_name: string;
  platform: string;
  rating?: number;
  is_bookable: boolean;
  booking_url: string;
  location?: string;
  price_range?: string;
  available_slots?: string[];
  amenities?: string[];
};

type Message = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  venues?: Venue[];
};

type ExampleQuery = {
  id: string;
  text: string;
  description: string;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I\'m your sports booking assistant. I can help you find cricket, football, and badminton venues in Mumbai, Delhi, Bangalore, and Kakkanad. Just tell me what you need or try one of the examples below.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const exampleQueries: ExampleQuery[] = [
    {
      id: '1',
      text: 'Find cricket venues in Mumbai',
      description: 'Cricket in Mumbai'
    },
    {
      id: '2', 
      text: 'I need badminton courts in Kakkanad',
      description: 'Badminton in Kakkanad'
    },
    {
      id: '3',
      text: 'Show me football grounds in Bangalore',
      description: 'Football in Bangalore'
    },
    {
      id: '4',
      text: 'Find cricket venues in Delhi for weekend',
      description: 'Cricket in Delhi'
    },
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isTyping) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Call backend API
      const response = await callAgentChatAPI(query);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.text,
        timestamp: new Date(),
        venues: response.venues,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an error while processing your request. Please make sure the backend is running on localhost:8000 and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const callAgentChatAPI = async (message: string): Promise<{ text: string; venues?: Venue[] }> => {
    const API_ENDPOINT = 'http://localhost:8000/api/v1/agents/chat';
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          user_id: 'web_user_' + Date.now() // Generate a simple user ID
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const venues = data.slots_found || [];
      
      // Create a simple, elegant response text
      let responseText = data.response || 'Request processed successfully.';
      
      // If we have venues, replace any detailed list with a simple sentence
      if (venues.length > 0) {
        responseText = `Great! I found ${venues.length} excellent venue${venues.length !== 1 ? 's' : ''} for you. Check out the options below with booking details.`;
      }
      
      return {
        text: responseText,
        venues: venues
      };
      
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const handleExampleClick = (example: ExampleQuery) => {
    setInputValue(example.text);
    inputRef.current?.focus();
  };

  const handleBookNow = (venue: Venue) => {
    if (venue.booking_url) {
      window.open(venue.booking_url, '_blank');
    }
  };

  // Progressive loading messages for sports enthusiasts
  const loadingMessages = [
    "🏟️ Scouting your perfect playing field...",
    "🌍 Exploring the sports scene in your city...", 
    "📍 Pinpointing premium venues nearby...",
    "🔍 Hunting down the best courts & grounds...",
    "⚡ Checking live availability & slots...",
    "🎯 Matching you with top-rated venues..."
  ];

  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(0);
  
  // Handle progressive loading messages
  useEffect(() => {
    let interval: number;
    
    if (isTyping) {
      setCurrentLoadingIndex(0);
      interval = setInterval(() => {
        setCurrentLoadingIndex((prev) => {
          const next = prev + 1;
          if (next >= loadingMessages.length) {
            // Loop back to first message if we reach the end
            return 0;
          }
          return next;
        });
      }, 3000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTyping, loadingMessages.length]);

  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 px-6 py-6">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
        <Bot size={16} className="text-white" />
      </div>
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
        <span className="text-sm text-gray-500 ml-2 transition-all duration-500 ease-in-out">
          {loadingMessages[currentLoadingIndex]}
        </span>
      </div>
    </div>
  );

  const VenueCard = ({ venue, index }: { venue: Venue; index: number }) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600', 
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-blue-600'
    ];
    
    const gradient = gradients[index % gradients.length];
    
    return (
      <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Gradient Header */}
        <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
        
        <div className="p-4">
          {/* Venue Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                {venue.venue_name}
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${gradient} text-white`}>
                  {venue.platform}
                </div>
                {venue.rating && (
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {venue.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bookable Status */}
            <div className="flex items-center space-x-1">
              {venue.is_bookable ? (
                <>
                  <Zap size={12} className="text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Available</span>
                </>
              ) : (
                <>
                  <Clock size={12} className="text-amber-500" />
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Check</span>
                </>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-2 mb-4">
            {venue.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin size={12} className="text-gray-400" />
                <span className="text-xs">{venue.location}</span>
              </div>
            )}
            
            {venue.price_range && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="text-gray-400 text-xs">💰</span>
                <span className="text-xs">{venue.price_range}</span>
              </div>
            )}

            {venue.available_slots && venue.available_slots.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Available Slots:</span>
                <div className="flex flex-wrap gap-1">
                  {venue.available_slots.slice(0, 2).map((slot, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                      {slot}
                    </span>
                  ))}
                  {venue.available_slots.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                      +{venue.available_slots.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {venue.amenities && venue.amenities.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Amenities:</span>
                <div className="flex flex-wrap gap-1">
                  {venue.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-xs rounded-full text-blue-700 dark:text-blue-300">
                      {amenity}
                    </span>
                  ))}
                  {venue.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-xs rounded-full text-blue-700 dark:text-blue-300">
                      +{venue.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleBookNow(venue)}
              className={`flex-1 bg-gradient-to-r ${gradient} text-white py-2 px-3 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1`}
            >
              <span>{venue.is_bookable ? 'Book Now' : 'View Details'}</span>
              <ExternalLink size={12} />
            </button>
            
            <button 
              onClick={() => navigator.share?.({ 
                title: venue.venue_name, 
                url: venue.booking_url 
              }) || navigator.clipboard.writeText(venue.booking_url)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-xs">📤</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ExampleCard = ({ example }: { example: ExampleQuery }) => (
    <button
      onClick={() => handleExampleClick(example)}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all text-left group w-full"
    >
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-orange-500">🏏</span>
        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 text-sm">
          {example.description}
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{example.text}</p>
    </button>
  );

  // Show examples only on first load
  const showExamples = messages.length === 1;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <Trophy size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">Sports Venue Finder</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Find cricket, football & badminton venues</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-fade-in border-b border-gray-100 dark:border-gray-800 ${
                message.sender === 'user' 
                  ? 'bg-white dark:bg-gray-900' 
                  : 'bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className="px-6 py-6">
                <div className="flex space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.sender === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                        <User size={16} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                        <Trophy size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {message.sender === 'user' ? 'You' : 'Sports Assistant'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
                        {message.text}
                      </p>
                    </div>

                    {/* Venues Grid */}
                    {message.venues && message.venues.length > 0 && (
                      <div className="mt-6">
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Found {message.venues.length} venue{message.venues.length !== 1 ? 's' : ''}:
                          </span>
                        </div>
                        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                          {message.venues.map((venue, index) => (
                            <VenueCard key={index} venue={venue} index={index} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Show example queries only on first load */}
          {showExamples && (
            <div className="px-6 py-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Trophy size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <span className="font-medium text-gray-900 dark:text-white">Try these examples:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {exampleQueries.map((example) => (
                        <ExampleCard key={example.id} example={example} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Find cricket venues in Mumbai, badminton courts in Kakkanad..."
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 p-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <SendHorizontal size={18} />
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Connected to backend API at localhost:8000/api/v1/agents/chat • Supports cricket, football & badminton
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;