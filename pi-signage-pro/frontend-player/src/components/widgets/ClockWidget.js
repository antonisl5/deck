import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ClockWidget = ({ options }) => {
  const [time, setTime] = useState(new Date());

  // Format options: 'HH:mm:ss' or 'hh:mm a' or including date
  const dateFormat = options?.format || 'HH:mm:ss';
  const showDate = options?.showDate || false;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      backgroundColor: options?.bgColor || 'transparent',
      color: options?.textColor || '#ffffff',
      fontFamily: options?.fontFamily || 'Arial, sans-serif',
      fontSize: options?.fontSize || '4rem',
      fontWeight: 'bold',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <div style={{ textAlign: 'center' }}>
        {format(time, dateFormat)}
      </div>
      {showDate && (
        <div style={{ fontSize: '0.4em', marginTop: '10px' }}>
          {format(time, 'EEEE, MMMM do, yyyy')}
        </div>
      )}
    </div>
  );
};

export default ClockWidget;
