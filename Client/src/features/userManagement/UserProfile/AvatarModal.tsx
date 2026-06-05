import React from 'react';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatar: string) => void;
}

// Available sports and fitness avatars for the user to choose from
const FITNESS_AVATARS = ['🏋️‍♂️', '🏃‍♂️', '🚴‍♂️', '🧘‍♂️', '🥊', '🏊‍♂️', '🤸‍♂️', '🧗‍♂️', '🔥', '💪', '🏆', '👟'];

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose, onSelectAvatar }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#1e293b', // Matches the dark/slate theme of BudiFit
        padding: '24px',
        borderRadius: '16px',
        width: '320px',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        border: '1px solid #334155'
      }}>
        <h3 style={{ color: '#f8fafc', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
          Choose Your Avatar
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
          Select an icon that fits your training vibe today
        </p>

        {/* Avatar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {FITNESS_AVATARS.map((avatar) => (
            <button
              key={avatar}
              onClick={() => {
                onSelectAvatar(avatar);
                onClose();
              }}
              style={{
                fontSize: '28px',
                padding: '8px',
                background: '#334155',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.1s ease, background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
            >
              {avatar}
            </button>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '6px',
            fontSize: '14px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AvatarModal;