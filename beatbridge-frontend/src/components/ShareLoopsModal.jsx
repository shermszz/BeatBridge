import React, { useState } from 'react';
import config from '../config';
import '../styles/ShareLoopsModal.css';

const ShareLoopsModal = ({ isOpen, onClose, myJams, onShare }) => {
  //filter out any "new" or string IDs; only keep actual numeric PKs
  const realJams = myJams.filter(j => Number.isInteger(j.id));
  const [selectedLoops, setSelectedLoops] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleToggleLoop = (jamId) => {
    // Don't allow selection if a link has already been generated
    if (shareLink) return;
    
    setSelectedLoops(prev => {
      if (prev.includes(jamId)) {
        return prev.filter(id => id !== jamId);
      } else {
        return [...prev, jamId];
      }
    });
  };

  const handleGenerateLink = async () => {
    if (selectedLoops.length === 0) {
      setError('Please select at least one loop to share');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/shared-loops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jam_session_ids: selectedLoops
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      const shareLink = `${window.location.origin}/shared-loops/${data.share_id}`;
      setShareLink(shareLink);
      onShare && onShare(shareLink);
    } catch (err) {
      setError(err.message || 'Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        // Fallback: select the text for manual copying
        const linkElement = document.getElementById('share-link');
        if (linkElement) {
          linkElement.select();
        }
      });
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedLoops([]);
    setShareLink('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay">
      <div className="share-modal">
        <button className="close-button" onClick={handleClose}>&times;</button>
        <h2>Share Loops</h2>
        
        {!shareLink ? (
          <>
            <p className="description-text">
              Share your beats with others! You can select one or more tracks below to generate a shareable link. 
              Recipients will be able to view and play your selected tracks.
            </p>
            
            <div className="loops-list">
              {realJams.map(jam => (
                <div key={jam.id} className="loop-item">
                  <label className="loop-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedLoops.includes(jam.id)}
                      onChange={() => handleToggleLoop(jam.id)}
                    />
                    <span className="loop-title">{jam.title}</span>
                  </label>
                </div>
              ))}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button 
              className="generate-link-button"
              onClick={handleGenerateLink}
              disabled={isGenerating || selectedLoops.length === 0}
            >
              {isGenerating ? 'Generating...' : 'Generate Share Link'}
            </button>
          </>
        ) : (
          <>
            <p className="description-text">
              Your share link has been generated successfully! Copy the link below to share with others.
            </p>
            
            <div className="share-link-container">
              <input
                id="share-link"
                type="text"
                value={shareLink}
                readOnly
                className="share-link-input"
              />
              <button className="copy-link-button" onClick={handleCopyLink}>
                Copy Link
              </button>
            </div>
            
            <div className="share-actions">
              <button className="new-share-button" onClick={handleClose}>
                Create New Share Link
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShareLoopsModal; 