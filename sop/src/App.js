import React, { useState, useEffect } from 'react';
import { Heart, X, Plus, User, BarChart3, LogOut, Camera } from 'lucide-react';
import './App.css';

function App() {
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
    <div className="app">
      <nav className="navbar">
        <h1 className="app-title">SwipeApp</h1>
        <div className="nav-buttons">
          <button
            onClick={() => setShowUpload(true)}
            className="nav-btn upload-btn"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="nav-btn about-btn"
          >
            <User size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="nav-btn logout-btn"
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
        <div className="card-container">
          <div className="card-wrapper">
            {currentCard ? (
              <div
                className="card"
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
                  className="card-image"
                  draggable={false}
                />
                <div className="card-info">
                  <h3 className="card-name">{currentCard.name}, {currentCard.age}</h3>
                  <p className="card-subtitle">{currentCard.subtitle}</p>
                </div>
                
                {dragOffset.x > 50 && (
                  <div className="swipe-indicator smash">
                    SMASH
                  </div>
                )}
                {dragOffset.x < -50 && (
                  <div className="swipe-indicator pass">
                    PASS
                  </div>
                )}
              </div>
            ) : (
              <div className="no-cards">
                <div className="no-cards-content">
                  <h3 className="no-cards-title">No more cards!</h3>
                  <p className="no-cards-text">Check back later for more profiles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!showAbout && !showUpload && currentCard && (
        <div className="action-buttons">
          <button
            onClick={() => handleSwipe('left')}
            className="action-btn pass-btn"
          >
            <X size={24} />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="action-btn smash-btn"
          >
            <Heart size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <h2 className="login-title">Welcome to SwipeApp</h2>
        <div className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="login-button"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

function AboutPage({ userPosts, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">Your Posts & Stats</h2>
            <button
              onClick={onClose}
              className="close-button"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="modal-content">
          {userPosts.length === 0 ? (
            <p className="no-posts">No posts yet. Upload your first photo!</p>
          ) : (
            <div className="posts-list">
              {userPosts.map((post) => {
                const total = post.smashes + post.passes;
                const smashRate = total > 0 ? Math.round((post.smashes / total) * 100) : 0;
                
                return (
                  <div key={post.id} className="post-item">
                    <img
                      src={post.image}
                      alt={post.name}
                      className="post-image"
                    />
                    <div className="post-details">
                      <h3 className="post-subtitle">{post.subtitle}</h3>
                      <div className="post-stats">
                        <span className="stat smash-stat">❤️ {post.smashes} Smashes</span>
                        <span className="stat pass-stat">✕ {post.passes} Passes</span>
                      </div>
                      <div className="rate-section">
                        <div className="rate-info">
                          <BarChart3 size={16} />
                          <span className="rate-text">{smashRate}% Smash Rate</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
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
}

function UploadModal({ onUpload, onClose }) {
  const [imageUrl, setImageUrl] = useState('');
  const [subtitle, setSubtitle] = useState('');

  const handleSubmit = () => {
    if (imageUrl.trim()) {
      onUpload(imageUrl, subtitle);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="upload-modal">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">Upload New Photo</h2>
            <button
              onClick={onClose}
              className="close-button"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="upload-form">
          <div className="form-group">
            <label className="form-label">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Tell them about yourself..."
              className="form-input"
            />
          </div>
          
          <div className="form-buttons">
            <button
              onClick={onClose}
              className="form-btn cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="form-btn submit-btn"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;