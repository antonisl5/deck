import React, { useState, useEffect } from 'react';

const CountdownWidget = ({ options }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isFinished, setIsFinished] = useState(false);

  const targetDateStr = options?.targetDate || new Date().toISOString();
  const targetDate = new Date(targetDateStr).getTime();
  const label = options?.label || 'Countdown:';
  const finishedMessage = options?.finishedMessage || 'Countdown Complete!';

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(intervalId);
        setIsFinished(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsFinished(false);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  const bgColor = options?.bgColor || '#2c3e50';
  const textColor = options?.textColor || '#ecf0f1';
  const fontSize = options?.fontSize || '2rem';
  const labelSize = options?.labelSize || '1.5rem';

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: bgColor,
    color: textColor,
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    boxSizing: 'border-box',
    textAlign: 'center'
  };

  const timeBlockStyle = {
    display: 'inline-block',
    margin: '0 10px',
    textAlign: 'center'
  };

  const numberStyle = {
    fontSize: fontSize,
    fontWeight: 'bold',
    display: 'block'
  };

  const unitStyle = {
    fontSize: '0.4em',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  if (isFinished) {
    return (
      <div style={containerStyle}>
        <h2 style={{ fontSize: fontSize, margin: 0 }}>{finishedMessage}</h2>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {label && <div style={{ fontSize: labelSize, marginBottom: '10px' }}>{label}</div>}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={timeBlockStyle}>
          <span style={numberStyle}>{String(timeLeft.days).padStart(2, '0')}</span>
          <span style={unitStyle}>Days</span>
        </div>
        <span style={{ fontSize, fontWeight: 'bold' }}>:</span>
        <div style={timeBlockStyle}>
          <span style={numberStyle}>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span style={unitStyle}>Hours</span>
        </div>
        <span style={{ fontSize, fontWeight: 'bold' }}>:</span>
        <div style={timeBlockStyle}>
          <span style={numberStyle}>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span style={unitStyle}>Mins</span>
        </div>
        <span style={{ fontSize, fontWeight: 'bold' }}>:</span>
        <div style={timeBlockStyle}>
          <span style={numberStyle}>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span style={unitStyle}>Secs</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownWidget;
