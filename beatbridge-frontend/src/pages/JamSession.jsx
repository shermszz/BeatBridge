import React, { useState, useEffect, useRef } from 'react';
import config from '../config';
import '../styles/JamSession.css';

// Dynamically generate instrument list from sounds folder
const SOUND_FILES = [
  'Crash.mp3',
  'Floor Tom.mp3',
  'Hi-Hat.mp3',
  'High Tom.mp3',
  'Kick.mp3',
  'Low Tom.mp3',
  'Open Hihat.mp3',
  'Ride.mp3',
  'Snare.mp3',
];
const ALL_INSTRUMENTS = SOUND_FILES.map(f => ({
  name: f.replace('.mp3', ''),
  id: f.replace(/\s|\./g, '').toLowerCase(),
  file: f
}));
const DEFAULT_INSTRUMENTS = [
  ALL_INSTRUMENTS.find(i => i.name === 'Hi-Hat'),
  ALL_INSTRUMENTS.find(i => i.name === 'Kick'),
  ALL_INSTRUMENTS.find(i => i.name === 'Snare'),
].filter(Boolean);

const TIME_SIGNATURES = [
  { label: '4/4', beats: 4, note: 4 },
  { label: '3/4', beats: 3, note: 4 },
  { label: '6/8', beats: 6, note: 8 },
];
const NOTE_RESOLUTIONS = [
  { label: '8th', stepsPerBeat: 2 },
  { label: '16th', stepsPerBeat: 4 },
  { label: '32nd', stepsPerBeat: 8 },
];

// Metronome click (simple oscillator)
function playMetronomeClick(audioCtx) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = 1800;
  gain.gain.value = 0.18;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.07);
}

const JamSession = () => {
  const [title, setTitle] = useState('');
  const [instruments, setInstruments] = useState([...DEFAULT_INSTRUMENTS]);
  const [timeSignature, setTimeSignature] = useState(TIME_SIGNATURES[0]);
  const [noteResolution, setNoteResolution] = useState(NOTE_RESOLUTIONS[1]); // default 16th
  const [steps, setSteps] = useState(timeSignature.beats * noteResolution.stepsPerBeat);
  const [pattern, setPattern] = useState(
    Array(DEFAULT_INSTRUMENTS.length).fill().map(() => Array(steps).fill(0))
  );
  const [myJams, setMyJams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addInstrumentId, setAddInstrumentId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(110);
  const [metronomeMuted, setMetronomeMuted] = useState(false);
  const audioBuffers = useRef({});
  const audioCtx = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'activate' or 'deactivate'

  // Update steps and pattern when time signature or note resolution changes
  useEffect(() => {
    const newSteps = timeSignature.beats * noteResolution.stepsPerBeat;
    setSteps(newSteps);
    setPattern(prev =>
      prev.map(row => {
        if (row.length === newSteps) return row;
        if (row.length < newSteps) return [...row, ...Array(newSteps - row.length).fill(0)];
        return row.slice(0, newSteps);
      })
    );
    setCurrentStep(-1);
    setIsPlaying(false);
  }, [timeSignature, noteResolution]);

  // Fetch user's jam sessions
  useEffect(() => {
    const fetchJams = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;
      const res = await fetch(`${config.API_BASE_URL}/api/jam-sessions/user/${userId}`);
      if (res.ok) {
        setMyJams(await res.json());
      }
    };
    fetchJams();
  }, []);

  // Load all sounds on mount
  useEffect(() => {
    audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    const loadSounds = async () => {
      for (const inst of ALL_INSTRUMENTS) {
        if (!audioBuffers.current[inst.id]) {
          const response = await fetch(`/sounds/${inst.file}`);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = await audioCtx.current.decodeAudioData(arrayBuffer);
          audioBuffers.current[inst.id] = buffer;
        }
      }
    };
    loadSounds();
    return () => {
      if (audioCtx.current) audioCtx.current.close();
    };
  }, []);

  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    const handleSpacebar = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (isPlaying) stopPlayback();
        else startPlayback();
      }
    };
    window.addEventListener('keydown', handleSpacebar);
    return () => window.removeEventListener('keydown', handleSpacebar);
  }, [isPlaying]);

  // Save a new jam session
  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${config.API_BASE_URL}/api/jam-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        pattern_json: pattern,
        is_public: true
      })
    });
    setLoading(false);
    if (res.ok) {
      alert('Jam session saved!');
      setTitle('');
      // Optionally, refresh jam list
    } else {
      alert('Failed to save jam session');
    }
  };

  // Sequencer grid toggle
  const toggleStep = (rowIdx, colIdx, forceMode = null) => {
    setPattern(prev => {
      const newPattern = prev.map(arr => [...arr]);
      const current = newPattern[rowIdx][colIdx];
      let newValue;
      if (forceMode === 'activate') newValue = 1;
      else if (forceMode === 'deactivate') newValue = 0;
      else newValue = current ? 0 : 1;
      newPattern[rowIdx][colIdx] = newValue;
      return newPattern;
    });
  };

  // Add instrument
  const handleAddInstrument = () => {
    if (!addInstrumentId) return;
    const inst = ALL_INSTRUMENTS.find(i => i.id === addInstrumentId);
    if (!inst || instruments.some(i => i.id === inst.id)) return;
    setInstruments(prev => [...prev, inst]);
    setPattern(prev => [...prev, Array(steps).fill(0)]);
    setAddInstrumentId('');
  };

  // Remove instrument
  const handleRemoveInstrument = (idx) => {
    setInstruments(prev => prev.filter((_, i) => i !== idx));
    setPattern(prev => prev.filter((_, i) => i !== idx));
  };

  // Playback logic using step state
  useEffect(() => {
    if (!isPlaying) return;
    let step = 0;
    setCurrentStep(0);
    // Calculate interval based on note resolution
    const intervalMs = (60 / bpm) * (4 / noteResolution.stepsPerBeat) * 1000;
    const interval = setInterval(() => {
      setCurrentStep(prevStep => {
        const nextStep = (prevStep + 1) % steps;
        // Play metronome if not muted
        if (!metronomeMuted) playMetronomeClick(audioCtx.current);
        // Play all active notes for this step
        instruments.forEach((inst, rowIdx) => {
          if (pattern[rowIdx][nextStep]) {
            const buffer = audioBuffers.current[inst.id];
            if (buffer && audioCtx.current) {
              const source = audioCtx.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioCtx.current.destination);
              source.start();
            }
          }
        });
        return nextStep;
      });
    }, intervalMs);
    // Play first step immediately
    if (!metronomeMuted) playMetronomeClick(audioCtx.current);
    instruments.forEach((inst, rowIdx) => {
      if (pattern[rowIdx][0]) {
        const buffer = audioBuffers.current[inst.id];
        if (buffer && audioCtx.current) {
          const source = audioCtx.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.current.destination);
          source.start();
        }
      }
    });
    return () => {
      clearInterval(interval);
      setCurrentStep(-1);
    };
    // eslint-disable-next-line
  }, [isPlaying, bpm, instruments, pattern, metronomeMuted, steps, noteResolution]);

  const startPlayback = () => {
    if (isPlaying) return;
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  return (
    <div className="jam-studio-container">
      {/* Jam Session Header and Description - styled like Song Recommendation */}
      <div className="jam-session-header">
        <h1 className="jam-session-title germania-font">
          <span role="img" aria-label="drum" className="jam-session-emoji"></span> Jam Session
        </h1>
        <p className="jam-session-subtitle">
          Create, edit, and play your own drum patterns! Click or drag to toggle steps, add or remove instruments, and experiment with rhythms. Use the controls below to save, play, or clear your session.
        </p>
        <p className="jam-session-shortcuts">
          <b>Shortcuts:</b> Spacebar = Play/Pause &nbsp;|&nbsp; Click = Toggle Step &nbsp;|&nbsp; Click & Drag = Multi-toggle &nbsp;|&nbsp; Clear All = Reset Grid
        </p>
      </div>
      {/* Top Bar */}
      <div className="jam-studio-topbar">
        <input
          className="jam-title-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Jam Title"
        />
        <div className="jam-studio-actions">
          <button onClick={handleSave} disabled={loading || !title}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={isPlaying ? stopPlayback : startPlayback}>
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <div className="jam-bpm-control">
            <label htmlFor="bpm-slider">BPM: <span>{bpm}</span></label>
            <input
              id="bpm-slider"
              type="range"
              min="60"
              max="200"
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              style={{ verticalAlign: 'middle', marginLeft: 8 }}
            />
          </div>
          <button onClick={() => setMetronomeMuted(m => !m)}>
            {metronomeMuted ? 'Unmute Metronome' : 'Mute Metronome'}
          </button>
          <button disabled>Export</button>
          <button disabled>Share</button>
        </div>
      </div>
      <div className="jam-studio-main">
        {/* Left: User's Loops */}
        <div className="jam-studio-sidebar">
          <h3>My Loops</h3>
          <ul className="jam-loops-list">
            {myJams.map(jam => (
              <li key={jam.id}>{jam.title}</li>
            ))}
          </ul>
        </div>
        {/* Center: Multi-track Editor (Sequencer) */}
        <div className="jam-studio-editor">
          <h3>Multi-track Editor</h3>
          {/* Controls for time signature and note resolution */}
          <div className="jam-studio-controls">
            <label style={{marginRight: '1.5rem'}}>
              Time Signature:
              <select
                value={timeSignature.label}
                onChange={e => {
                  const ts = TIME_SIGNATURES.find(t => t.label === e.target.value);
                  setTimeSignature(ts);
                }}
                style={{marginLeft: 8}}
              >
                {TIME_SIGNATURES.map(ts => (
                  <option key={ts.label} value={ts.label}>{ts.label}</option>
                ))}
              </select>
            </label>
            <label>
              Note Resolution:
              <select
                value={noteResolution.label}
                onChange={e => {
                  const nr = NOTE_RESOLUTIONS.find(n => n.label === e.target.value);
                  setNoteResolution(nr);
                }}
                style={{marginLeft: 8}}
              >
                {NOTE_RESOLUTIONS.map(nr => (
                  <option key={nr.label} value={nr.label}>{nr.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="jam-sequencer-grid">
            <table>
              <thead>
                <tr>
                  <th></th>
                  {Array.from({length: steps}).map((_, i) => (
                    <th key={i} className="jam-step-label">{i+1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {instruments.map((inst, rowIdx) => (
                  <tr key={inst.id}>
                    <td className="jam-inst-label">
                      {inst.name}
                      {instruments.length > 1 && (
                        <button className="jam-remove-inst" onClick={() => handleRemoveInstrument(rowIdx)} title="Remove">×</button>
                      )}
                    </td>
                    {pattern[rowIdx].map((val, colIdx) => (
                      <td
                        key={colIdx}
                        className={`jam-step-cell${val ? ' active' : ''}${currentStep === colIdx ? ' playing' : ''}`}
                        onMouseDown={e => {
                          setIsMouseDown(true);
                          const mode = val ? 'deactivate' : 'activate';
                          setDragMode(mode);
                          toggleStep(rowIdx, colIdx, mode); // Toggle immediately on mousedown
                        }}
                        onMouseEnter={e => {
                          if (isMouseDown && dragMode) {
                            toggleStep(rowIdx, colIdx, dragMode);
                          }
                        }}
                        onMouseUp={e => {
                          setIsMouseDown(false);
                          setDragMode(null);
                          // If mouseup happens on the same cell as mousedown, treat as click
                          if (!dragMode) {
                            toggleStep(rowIdx, colIdx);
                          }
                        }}
                        onTouchStart={e => {
                          setIsMouseDown(true);
                          const mode = val ? 'deactivate' : 'activate';
                          setDragMode(mode);
                          toggleStep(rowIdx, colIdx, mode); // Toggle immediately on touchstart
                        }}
                        onTouchEnd={e => {
                          setIsMouseDown(false);
                          setDragMode(null);
                          toggleStep(rowIdx, colIdx);
                        }}
                      ></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Clear All button below the grid */}
          <div style={{ margin: '1.5rem 0 0 0', textAlign: 'center' }}>
            <button
              className="jam-clear-all-btn"
              onClick={() => setPattern(Array(instruments.length).fill().map(() => Array(steps).fill(0)))}
            >
              Clear All
            </button>
          </div>
        </div>
        {/* Right: Instruments/Upload Panel */}
        <div className="jam-studio-instruments">
          <h3>Instruments / Upload</h3>
          <div className="jam-instruments-panel">
            <div className="jam-add-inst-row">
              <select
                value={addInstrumentId}
                onChange={e => setAddInstrumentId(e.target.value)}
              >
                <option value="">Add instrument...</option>
                {ALL_INSTRUMENTS.filter(inst => !instruments.some(i => i.id === inst.id)).map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
              <button onClick={handleAddInstrument} disabled={!addInstrumentId}>Add</button>
            </div>
            <div className="jam-instruments-placeholder">
              <p style={{color:'#888'}}>Instrument selection and upload panel coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JamSession; 