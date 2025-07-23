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
  // Store last unsaved session
  const [lastSession, setLastSession] = useState(null);
  const titleInputRef = useRef(null);
  const [activeJamId, setActiveJamId] = useState(null); // Track the active jam
  const NEW_JAM_ID = '__new__';

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

  // Fetch user's jam sessions (refactor for reuse)
  const fetchJams = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    const res = await fetch(`${config.API_BASE_URL}/api/jam-sessions/user/${userId}`);
    if (res.ok) {
      setMyJams(await res.json());
    }
  };

  useEffect(() => {
    fetchJams();
  }, []);

  // On initial jam list load, set activeJamId to the first jam if available and user hasn't interacted
  useEffect(() => {
    if (myJams.length > 0 && activeJamId == null) {
      setActiveJamId(myJams[0].id);
    }
    // Do NOT reset activeJamId if user has already selected a track
    // eslint-disable-next-line
  }, [myJams]);

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
      const active = document.activeElement;
      if ((e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') &&
          (!titleInputRef.current || active !== titleInputRef.current)) {
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
    // Ensure pattern and instruments are in sync
    const safeInstruments = instruments && instruments.length > 0 ? instruments : [...DEFAULT_INSTRUMENTS];
    const safePattern = Array.isArray(pattern) && pattern.length === safeInstruments.length
      ? pattern
      : Array(safeInstruments.length).fill().map(() => Array(steps).fill(0));
    const normalizedPattern = safePattern.map(row =>
      Array.isArray(row) && row.length === steps ? row : Array(steps).fill(0)
    );

    // Get all backend IDs (assume those in myJams that do not have isNew or have a numeric/short id)
    const backendIds = myJams.filter(j => !j.isNew && (typeof j.id === 'number' || (typeof j.id === 'string' && j.id.length < 30))).map(j => j.id);
    const isExisting = backendIds.includes(activeJamId);

    // Check for duplicate name (other than current track)
    const duplicate = myJams.find(jam => jam.title === title && jam.id !== activeJamId);
    if (duplicate) {
      const confirmOverwrite = window.confirm('A track with that name already exists. Do you want to overwrite the old file?');
      if (!confirmOverwrite) {
        setLoading(false);
        return;
      }
      // Overwrite the old track (by ID) using PUT
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE_URL}/api/jam-sessions/${duplicate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          pattern_json: normalizedPattern,
          is_public: true,
          instruments_json: safeInstruments,
          time_signature: timeSignature.label,
          note_resolution: noteResolution.label,
          bpm
        })
      });
      setLoading(false);
      if (res.ok) {
        alert('Jam session overwritten!');
        fetchJams();
        setActiveJamId(duplicate.id);
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Failed to overwrite jam session' + (err.error ? `: ${err.error}` : ''));
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (isExisting) {
      // Update existing jam (PUT with id)
      const res = await fetch(`${config.API_BASE_URL}/api/jam-sessions/${activeJamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          pattern_json: normalizedPattern,
          is_public: true,
          instruments_json: safeInstruments,
          time_signature: timeSignature.label,
          note_resolution: noteResolution.label,
          bpm
        })
      });
      setLoading(false);
      if (res.ok) {
        alert('Jam session updated!');
        fetchJams();
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Failed to update jam session' + (err.error ? `: ${err.error}` : ''));
      }
      return;
    } else {
      // Create new jam (POST)
      const res = await fetch(`${config.API_BASE_URL}/api/jam-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          pattern_json: normalizedPattern,
          is_public: true,
          instruments_json: safeInstruments,
          time_signature: timeSignature.label,
          note_resolution: noteResolution.label,
          bpm
        })
      });
      setLoading(false);
      if (res.ok) {
        const newJam = await res.json();
        alert('Jam session saved!');
        // Replace the local-only jam in myJams with the backend jam (using returned ID)
        setMyJams(jams => jams.map(jam =>
          jam.id === activeJamId ? { ...newJam, title, isNew: false } : jam
        ));
        setActiveJamId(newJam.id);
        fetchJams();
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Failed to save jam session' + (err.error ? `: ${err.error}` : ''));
      }
      return;
    }
  };

  // Helper to normalize instruments
  function normalizeInstruments(rawInstruments) {
    if (!Array.isArray(rawInstruments) || rawInstruments.length === 0) {
      return [...DEFAULT_INSTRUMENTS];
    }
    return rawInstruments;
  }

  // Helper to normalize pattern
  function normalizePattern(rawPattern, numInstruments, numSteps) {
    if (!Array.isArray(rawPattern)) {
      return Array(numInstruments).fill().map(() => Array(numSteps).fill(0));
    }
    // Ensure each row is an array of correct length
    return Array(numInstruments).fill().map((_, i) => {
      const row = Array.isArray(rawPattern[i]) ? rawPattern[i] : [];
      if (row.length === numSteps) return row;
      if (row.length < numSteps) return [...row, ...Array(numSteps - row.length).fill(0)];
      return row.slice(0, numSteps);
    });
  }

  // Helper to set all session state at once
  const setSessionState = ({
    title,
    instruments,
    timeSignature,
    noteResolution,
    bpm,
    steps,
    pattern
  }) => {
    setTitle(title);
    setInstruments(instruments);
    setTimeSignature(timeSignature);
    setNoteResolution(noteResolution);
    setBpm(bpm);
    setSteps(steps);
    setPattern(pattern);
  };

  // Restore last unsaved session
  const handleRestoreSession = () => {
    if (!lastSession) return;
    setTitle(lastSession.title);
    setInstruments(lastSession.instruments);
    setTimeSignature(lastSession.timeSignature);
    setNoteResolution(lastSession.noteResolution);
    setBpm(lastSession.bpm);
    setSteps(lastSession.steps);
    setPattern(lastSession.pattern);
  };

  // Load a jam into the editor
  const handleLoadJam = (jam) => {
    setActiveJamId(jam.id);
    setLastSession({
      title,
      instruments,
      timeSignature,
      noteResolution,
      bpm,
      steps,
      pattern
    });
    // Use the saved values directly
    const jamTimeSig = TIME_SIGNATURES.find(ts => ts.label === jam.time_signature) || TIME_SIGNATURES[0];
    const jamNoteRes = NOTE_RESOLUTIONS.find(nr => nr.label === jam.note_resolution) || NOTE_RESOLUTIONS[1];
    const jamInstruments = Array.isArray(jam.instruments_json) && jam.instruments_json.length > 0 ? jam.instruments_json : [...DEFAULT_INSTRUMENTS];
    let jamPattern = Array.isArray(jam.pattern_json) ? jam.pattern_json : [];
    const jamSteps = jamPattern[0]?.length || (jamTimeSig.beats * jamNoteRes.stepsPerBeat);
    // If pattern is empty, fill with zeros
    if (!Array.isArray(jamPattern) || jamPattern.length === 0) {
      jamPattern = Array(jamInstruments.length).fill().map(() => Array(jamSteps).fill(0));
    }
    setSessionState({
      title: jam.title || '',
      instruments: jamInstruments,
      timeSignature: jamTimeSig,
      noteResolution: jamNoteRes,
      bpm: jam.bpm || 110,
      steps: jamSteps,
      pattern: jamPattern
    });
    console.log('DEBUG: Pattern after load:', JSON.stringify(jamPattern));
  };

  // When deleting a track, if it's not a backend ID, just remove from myJams
  const handleDeleteJam = async (jamId) => {
    const jam = myJams.find(j => j.id === jamId);
    // Get all backend IDs (assume those in myJams that do not have isNew or have a numeric/short id)
    const backendIds = myJams.filter(j => !j.isNew && (typeof j.id === 'number' || (typeof j.id === 'string' && j.id.length < 30))).map(j => j.id);
    const isBackendId = backendIds.includes(jamId);
    console.log('[Delete] jamId:', jamId, 'isBackendId:', isBackendId, 'jam:', jam, 'backendIds:', backendIds);
    if (!isBackendId) {
      setMyJams(jams => jams.filter(j => j.id !== jamId));
      if (activeJamId === jamId) setActiveJamId(null);
      console.log('[Delete] Removed local-only jam:', jamId);
      return;
    }
    if (window.confirm('Are you sure you want to delete this jam session?')) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/jam-sessions/${jamId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const text = await res.text();
        console.log('[Delete] API response:', res.status, text);
        if (res.ok) {
          alert('Jam session deleted!');
          setMyJams(jams => jams.filter(j => j.id !== jamId));
          if (activeJamId === jamId) setActiveJamId(null);
          fetchJams();
        } else {
          alert('Failed to delete jam session: ' + text);
        }
      } catch (err) {
        console.error('[Delete] API error:', err);
        alert('Failed to delete jam session: ' + err.message);
      }
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

  // Initialize lastSession with current state on mount
  useEffect(() => {
    setLastSession({
      title: '',
      instruments: [...DEFAULT_INSTRUMENTS],
      timeSignature: TIME_SIGNATURES[0],
      noteResolution: NOTE_RESOLUTIONS[1],
      bpm: 110,
      steps: TIME_SIGNATURES[0].beats * NOTE_RESOLUTIONS[1].stepsPerBeat,
      pattern: Array(DEFAULT_INSTRUMENTS.length).fill().map(() => Array(TIME_SIGNATURES[0].beats * NOTE_RESOLUTIONS[1].stepsPerBeat).fill(0))
    });
  }, []);

  // Auto-save current session when any relevant state changes
  useEffect(() => {
    if (title || pattern.some(row => row.some(cell => cell === 1))) {
      setLastSession({
        title,
        instruments,
        timeSignature,
        noteResolution,
        bpm,
        steps,
        pattern
      });
    }
  }, [title, instruments, timeSignature, noteResolution, bpm, steps, pattern]);

  const handleNewTrack = () => {
    // Create a new jam object
    const newJam = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: 'Untitled',
      pattern_json: Array(instruments.length).fill().map(() => Array(steps).fill(0)),
      instruments_json: [...instruments],
      time_signature: timeSignature.label,
      note_resolution: noteResolution.label,
      bpm,
      isNew: true
    };
    setMyJams(jams => [newJam, ...jams]);
    setActiveJamId(newJam.id);
    setSessionState({
      title: newJam.title,
      instruments: newJam.instruments_json,
      timeSignature: TIME_SIGNATURES.find(ts => ts.label === newJam.time_signature),
      noteResolution: NOTE_RESOLUTIONS.find(nr => nr.label === newJam.note_resolution),
      bpm: newJam.bpm,
      steps: steps,
      pattern: newJam.pattern_json
    });
  };

  // When editing the title, update the jam in myJams if it's the active one
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setMyJams(jams => jams.map(jam =>
      jam.id === activeJamId ? { ...jam, title: newTitle || 'Untitled' } : jam
    ));
  };

  return (
    <div className="jam-studio-container">
      {/* Jam Session Header and Description - styled like Song Recommendation */}
      <div className="jam-session-header">
        <h1 className="jam-session-title">
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
          onChange={handleTitleChange}
          placeholder="Jam Title"
          ref={titleInputRef}
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
          <button className="jam-current-session-btn" onClick={handleNewTrack}>
            <span className="jam-current-session-label">New Track</span>
          </button>
          <ul className="jam-loops-list">
            {myJams.map(jam => (
              <li key={jam.id} className={`jam-loop-item${activeJamId === jam.id ? ' active' : ''}`}>
                <span className="jam-loop-title" onClick={() => handleLoadJam(jam)}>{jam.title}</span>
                <button className="jam-delete-jam-btn" onClick={() => handleDeleteJam(jam.id)} title="Delete">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="jam-delete-icon">
                    <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 6L6 20H18L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 6L9 3H15L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </li>
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
                    {(pattern && pattern[rowIdx]) ? pattern[rowIdx].map((val, colIdx) => (
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
                    )) : null}
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