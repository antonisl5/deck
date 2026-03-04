import React from 'react';

const TextTickerWidget = ({ options }) => {
  const message = options?.message || "No message provided for ticker.";
  const scrollSpeed = options?.speed || '15s'; // CSS duration like '10s', '20s'
  const bgColor = options?.bgColor || '#000000';
  const textColor = options?.textColor || '#ffffff';
  const fontSize = options?.fontSize || '2rem';
  const fontWeight = options?.fontWeight || 'normal';

  const containerStyle = {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: bgColor,
    color: textColor,
    fontSize: fontSize,
    fontWeight: fontWeight,
    position: 'relative'
  };

  const tickerAnimation = `
    @keyframes tickerScroll {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{tickerAnimation}</style>
      <div style={{
        display: 'inline-block',
        paddingLeft: '100%',
        animation: `tickerScroll ${scrollSpeed} linear infinite`
      }}>
        {message}
      </div>
    </div>
  );
};

export default TextTickerWidget;
