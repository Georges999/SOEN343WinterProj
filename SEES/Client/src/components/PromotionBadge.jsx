
import React from 'react';

function PromotionBadge({ level }) {
  if (level === 'none' || !level) return null;
  
  const badgeStyles = {
    basic: {
      backgroundColor: '#4caf50',
      color: 'white',
    },
    premium: {
      backgroundColor: '#2196f3',
      color: 'white',
    },
    featured: {
      backgroundColor: '#9c27b0',
      color: 'white',
    }
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      ...badgeStyles[level]
    }}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </div>
  );
}

export default PromotionBadge;