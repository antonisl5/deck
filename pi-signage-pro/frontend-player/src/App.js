import React, { useEffect } from 'react';
import io from 'socket.io-client';
import useStore from './store';
import ClockWidget from './components/widgets/ClockWidget';
import MediaViewerWidget from './components/widgets/MediaViewerWidget';
import TextTickerWidget from './components/widgets/TextTickerWidget';
import CountdownWidget from './components/widgets/CountdownWidget';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Socket connection
const socketUrl = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:3001`;
const socket = io(socketUrl);

function App() {
  const { widgets, setWidgets } = useStore();

  useEffect(() => {
    // Fetch initial layout
    fetch(`${socketUrl}/api/layouts/active`)
      .then(res => res.json())
      .then(data => {
        if (data && data.widgets) {
          setWidgets(data.widgets);
        }
      })
      .catch(err => console.error("Error fetching active layout:", err));

    // Listen for real-time updates
    socket.on('layout-updated', (data) => {
      console.log('Received layout update:', data);
      setWidgets(data.widgets || []);
    });

    return () => {
      socket.off('layout-updated');
    };
  }, [setWidgets]);

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'clock':
        return <ClockWidget options={widget.options} />;
      case 'media':
        return <MediaViewerWidget options={widget.options} />;
      case 'ticker':
        return <TextTickerWidget options={widget.options} />;
      case 'countdown':
        return <CountdownWidget options={widget.options} />;
      default:
        return <div>Unknown Widget Type</div>;
    }
  };

  const layout = widgets.map(w => ({
    i: w.id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    static: true // player mode is static
  }));

  if (widgets.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#000',
        color: '#fff',
        fontSize: '2rem'
      }}>
        Waiting for layout...
      </div>
    );
  }

  // Calculate row height based on a 1080p screen divided into a 12x12 grid roughly
  // We'll use a dynamic approach to fill the screen
  const gridWidth = window.innerWidth;
  const gridCols = 12;
  const rowHeight = window.innerHeight / 12;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden',
      position: 'relative',
      margin: 0,
      padding: 0
    }}>
      <GridLayout
        className="layout"
        layout={layout}
        cols={gridCols}
        rowHeight={rowHeight}
        width={gridWidth}
        margin={[0, 0]}
        isDraggable={false}
        isResizable={false}
      >
        {widgets.map(w => (
          <div key={w.id} style={{ overflow: 'hidden', zIndex: w.options?.zIndex || 1 }}>
            {renderWidget(w)}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}

export default App;
