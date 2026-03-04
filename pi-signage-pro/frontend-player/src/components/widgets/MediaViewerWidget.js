import React from 'react';

const MediaViewerWidget = ({ options }) => {
  const { url, type, fit = 'contain', loop = true, muted = true, autoPlay = true } = options || {};

  if (!url) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: '#333',
        color: '#ccc'
      }}>
        No Media Source Provided
      </div>
    );
  }

  // Determine if image or video based on explicit type or file extension
  const isVideo = type === 'video' || /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      backgroundColor: options?.bgColor || 'transparent',
      overflow: 'hidden'
    }}>
      {isVideo ? (
        <video
          src={url}
          loop={loop}
          muted={muted}
          autoPlay={autoPlay}
          style={{ width: '100%', height: '100%', objectFit: fit }}
        />
      ) : (
        <img
          src={url}
          alt="Media Viewer"
          style={{ width: '100%', height: '100%', objectFit: fit }}
        />
      )}
    </div>
  );
};

export default MediaViewerWidget;
