import React, { useState, useEffect } from 'react';
import { Heart, X, Plus, User, BarChart3, LogOut, Camera } from 'lucide-react';

const TinderApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Sample initial data
  const initialUsers = [
    {
      id: 1,
      name: "Alex",
      age: 25,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      subtitle: "Love hiking and good coffee ☕",
      smashes: 0,
      passes: 0,
      isOwner: false
    },
    {
      id: 2,
      name: "Sam",
      age: 28,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
      subtitle: "Artist and dog lover 🎨🐕",
      smashes: 0,
      passes: 0,
      isOwner: false
    }
  ];

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('tinderUsers') || '[]');
    const savedCurrentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (savedUsers.length === 0) {
      setUsers(initialUsers);
      localStorage.setItem('tinderUsers', JSON.stringify(initialUsers));
    } else {
      setUsers(savedUsers);
    }

    if (savedCurrentUser) {
      setCurrentUser(savedCurrentUser);
      setShowLogin(false);
    }
  }, []);

  const saveToStorage = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem('tinderUsers', JSON.stringify(newUsers));
  };

  const handleLogin = (username, password) => {
    if (username && password) {
      const user = { username, id: Date.now() };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setShowLogin(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowLogin(true);
    setShowAbout(false);
  };

  const handleSwipe = (direction) => {
    if (currentCardIndex >= users.length) return;

    const updatedUsers = [...users];
    const currentCard = updatedUsers[currentCardIndex];
    
    if (direction === 'right') {
      currentCard.smashes += 1;
    } else {
      currentCard.passes += 1;
    }

    saveToStorage(updatedUsers);
    setCurrentCardIndex(prev => prev + 1);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    setDragOffset({ startX: clientX, startY: clientY, x: 0, y: 0 });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    
    const newX = clientX - dragOffset.startX;
    const newY = clientY - dragOffset.startY;
    
    setDragOffset(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(dragOffset.x) > 100) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleUpload = (imageUrl, subtitle) => {
    const newUser = {
      id: Date.now(),
      name: currentUser.username,
      age: 25,
      image: imageUrl,
      subtitle: subtitle || "New to the app!",
      smashes: 0,
      passes: 0,
      isOwner: true,
      ownerId: currentUser.id
    };

    const updatedUsers = [...users, newUser];
    saveToStorage(updatedUsers);
    setShowUpload(false);
  };

  const getUserPosts = () => {
    return users.filter(user => user.ownerId === currentUser?.id);
  };

  if (showLogin) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const currentCard = users[currentCardIndex];
  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) / 300;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-600">SwipeApp</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors"
          >
            <User size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {showAbout && (
        <AboutPage 
          userPosts={getUserPosts()} 
          onClose={() => setShowAbout(false)} 
        />
      )}

      {showUpload && (
        <UploadModal 
          onUpload={handleUpload} 
          onClose={() => setShowUpload(false)} 
        />
      )}

      {!showAbout && !showUpload && (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-4">
          <div className="relative w-80 h-96">
            {currentCard ? (
              <div
                className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transform transition-transform"
                style={{
                  transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
                  opacity: opacity
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                <img
                  src={currentCard.image}
                  alt={currentCard.name}
                  className="w-full h-3/4 object-cover"
                  draggable={false}
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{currentCard.name}, {currentCard.age}</h3>
                  <p className="text-gray-600 text-sm mt-2">{currentCard.subtitle}</p>
                </div>
                
                {/* Swipe indicators */}
                {dragOffset.x > 50 && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    SMASH
                  </div>
                )}
                {dragOffset.x < -50 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    PASS
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-2xl">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-500 mb-4">No more cards!</h3>
                  <p className="text-gray-400">Check back later for more profiles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!showAbout && !showUpload && currentCard && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-8">
          <button
            onClick={() => handleSwipe('left')}
            className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors"
          >
            <X size={24} />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
          >
            <Heart size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">Welcome to SwipeApp</h2>
        <div className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

const AboutPage = ({ userPosts, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Posts & Stats</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {userPosts.length === 0 ? (
            <p className="text-gray-500 text-center">No posts yet. Upload your first photo!</p>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => {
                const total = post.smashes + post.passes;
                const smashRate = total > 0 ? Math.round((post.smashes / total) * 100) : 0;
                
                return (
                  <div key={post.id} className="border rounded-lg p-4 flex space-x-4">
                    <img
                      src={post.image}
                      alt={post.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{post.subtitle}</h3>
                      <div className="mt-2 flex space-x-4 text-sm">
                        <span className="text-green-600">❤️ {post.smashes} Smashes</span>
                        <span className="text-red-600">✕ {post.passes} Passes</span>
                      </div>
                      <div className="mt-1">
                        <div className="flex items-center space-x-2">
                          <BarChart3 size={16} />
                          <span className="text-sm font-medium">{smashRate}% Smash Rate</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${smashRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UploadModal = ({ onUpload, onClose }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [subtitle, setSubtitle] = useState('');

  const handleSubmit = () => {
    if (imageUrl.trim()) {
      onUpload(imageUrl, subtitle);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Upload New Photo</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Tell them about yourself..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sop;