import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GridLayout from 'react-grid-layout';
import useStore from '../store';
import { Clock, Image as ImageIcon, MessageSquare, Timer, Save, Play, Trash2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:3001`;

const Dashboard = () => {
  const [layouts, setLayouts] = useState([]);
  const [activeLayoutId, setActiveLayoutId] = useState(null);
  const [currentLayout, setCurrentLayout] = useState({ id: 'new', name: 'New Layout', widgets: [] });
  const [mediaList, setMediaList] = useState([]);
  const token = useStore((state) => state.token);

  const fetchLayouts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/layouts`, { headers: { Authorization: `Bearer ${token}` } });
      setLayouts(res.data);
      const active = res.data.find(l => l.isActive);
      if (active) setActiveLayoutId(active.id);
      if (res.data.length > 0 && currentLayout.id === 'new') {
        setCurrentLayout(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/media`, { headers: { Authorization: `Bearer ${token}` } });
      setMediaList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLayouts();
      fetchMedia();
    }
  }, [token]);

  const addWidget = (type) => {
    const newWidget = {
      id: `w-${Date.now()}`,
      type,
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      options: {}
    };

    if (type === 'media' && mediaList.length > 0) {
      newWidget.options = { url: `${API_URL}/uploads/${mediaList[0].filename}`, type: mediaList[0].mimetype.split('/')[0] };
    } else if (type === 'ticker') {
      newWidget.options = { message: 'Enter your scrolling text here...' };
    } else if (type === 'countdown') {
      newWidget.options = { targetDate: new Date(Date.now() + 86400000).toISOString() }; // Tomorrow
    }

    setCurrentLayout({ ...currentLayout, widgets: [...currentLayout.widgets, newWidget] });
  };

  const removeWidget = (id) => {
    setCurrentLayout({
      ...currentLayout,
      widgets: currentLayout.widgets.filter(w => w.id !== id)
    });
  };

  const onLayoutChange = (newLayout) => {
    const updatedWidgets = currentLayout.widgets.map(w => {
      const l = newLayout.find(item => item.i === w.id);
      return l ? { ...w, x: l.x, y: l.y, w: l.w, h: l.h } : w;
    });
    setCurrentLayout({ ...currentLayout, widgets: updatedWidgets });
  };

  const saveLayout = async () => {
    try {
      if (currentLayout.id === 'new') {
        const res = await axios.post(`${API_URL}/api/layouts`, { name: currentLayout.name, widgets: currentLayout.widgets }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentLayout(res.data);
        alert('Layout created successfully');
      } else {
        await axios.put(`${API_URL}/api/layouts/${currentLayout.id}`, { name: currentLayout.name, widgets: currentLayout.widgets }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Layout saved successfully');
      }
      fetchLayouts();
    } catch (err) {
      console.error(err);
      alert('Error saving layout');
    }
  };

  const activateLayout = async (id) => {
    try {
      await axios.post(`${API_URL}/api/layouts/${id}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveLayoutId(id);
      alert('Layout activated on Player Screen');
    } catch (err) {
      console.error(err);
      alert('Error activating layout');
    }
  };

  const updateWidgetOption = (id, key, value) => {
    const updated = currentLayout.widgets.map(w => {
      if (w.id === id) {
        return { ...w, options: { ...w.options, [key]: value } };
      }
      return w;
    });
    setCurrentLayout({ ...currentLayout, widgets: updated });
  };

  const renderWidgetConfig = (w) => {
    if (w.type === 'media') {
      return (
        <div style={{ marginTop: '10px' }}>
          <select
            value={w.options?.url?.split('/').pop() || ''}
            onChange={(e) => {
              const selectedMedia = mediaList.find(m => m.filename === e.target.value);
              updateWidgetOption(w.id, 'url', `${API_URL}/uploads/${selectedMedia.filename}`);
              updateWidgetOption(w.id, 'type', selectedMedia.mimetype.split('/')[0]);
            }}
            style={{ width: '100%', padding: '5px' }}
          >
            <option value="">Select Media...</option>
            {mediaList.map(m => <option key={m.id} value={m.filename}>{m.originalname}</option>)}
          </select>
        </div>
      );
    }
    if (w.type === 'ticker') {
      return (
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={w.options?.message || ''}
            onChange={(e) => updateWidgetOption(w.id, 'message', e.target.value)}
            style={{ width: '100%', padding: '5px' }}
            placeholder="Ticker Message"
          />
        </div>
      );
    }
    if (w.type === 'countdown') {
      return (
        <div style={{ marginTop: '10px' }}>
          <input
            type="datetime-local"
            value={w.options?.targetDate ? new Date(w.options.targetDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => updateWidgetOption(w.id, 'targetDate', new Date(e.target.value).toISOString())}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
      );
    }
    if (w.type === 'clock') {
      return (
        <div style={{ marginTop: '10px', fontSize: '12px' }}>Clock Widget (Auto-updates)</div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', background: '#fff', borderRight: '1px solid #ddd', padding: '20px', overflowY: 'auto' }}>
        <h3>Layout Selection</h3>
        <select
          value={currentLayout.id}
          onChange={(e) => {
            if (e.target.value === 'new') {
              setCurrentLayout({ id: 'new', name: 'New Layout', widgets: [] });
            } else {
              setCurrentLayout(layouts.find(l => l.id.toString() === e.target.value));
            }
          }}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        >
          <option value="new">+ Create New Layout</option>
          {layouts.map(l => (
            <option key={l.id} value={l.id}>{l.name} {l.id === activeLayoutId ? '(Active)' : ''}</option>
          ))}
        </select>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={currentLayout.name}
            onChange={(e) => setCurrentLayout({ ...currentLayout, name: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
            placeholder="Layout Name"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={saveLayout} style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <Save size={16} /> Save
          </button>
          {currentLayout.id !== 'new' && (
            <button onClick={() => activateLayout(currentLayout.id)} style={{ flex: 1, padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <Play size={16} /> Push to Screen
            </button>
          )}
        </div>

        <h3>Add Widgets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button onClick={() => addWidget('clock')} style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><Clock size={24}/> Clock</button>
          <button onClick={() => addWidget('media')} style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><ImageIcon size={24}/> Media</button>
          <button onClick={() => addWidget('ticker')} style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><MessageSquare size={24}/> Ticker</button>
          <button onClick={() => addWidget('countdown')} style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><Timer size={24}/> Countdown</button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div style={{ flex: 1, background: '#f0f2f5', padding: '20px', overflowY: 'auto' }}>
        <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative' }}>
          <div style={{ padding: '10px', background: '#333', color: '#fff', fontSize: '12px' }}>
            Display Area Preview (16:9 Aspect Ratio Simulation)
          </div>
          {/* We simulate a 12-column grid. The container represents the screen. */}
          <div style={{ width: '100%', minHeight: '600px', position: 'relative' }}>
            <GridLayout
              className="layout"
              layout={currentLayout.widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))}
              cols={12}
              rowHeight={50}
              width={800} // This is a fixed width for the admin preview, can be made responsive
              onLayoutChange={onLayoutChange}
              style={{ background: '#222' }}
            >
              {currentLayout.widgets.map(w => (
                <div key={w.id} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #555', color: '#fff', padding: '10px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '5px' }}>
                    <strong>{w.type.toUpperCase()}</strong>
                    <button onClick={() => removeWidget(w.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {renderWidgetConfig(w)}
                </div>
              ))}
            </GridLayout>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
