import React, { useState, useEffect } from 'react';

// Warlord Canonical Matrix defaults
const SYSTEM_PROFILES = {
  QUANT_TRADING: {
    label: '01 // RHYTHM TRADING',
    baseHeat: 0.00,
    subAspects: {
      'Indicator Logic (MQL5)': 0.00,
      'Volatility Scan Triage': 0.05,
      'Trade Execution Signal': 0.00
    }
  },
  MCNC_ARCHITECTURE: {
    label: '02 // BASE 1 ARCHITECTURE',
    baseHeat: 0.10,
    subAspects: {
      'Backend Route Scaffolding': 0.00,
      'React DOM Wiring': 0.05,
      'Multi-Agent Choreography': 0.20
    }
  },
  MADOTHI_FUND: {
    label: '03 // CHIEF MADOTHI FUND',
    baseHeat: 0.70,
    subAspects: {
      'Donor Pitch Narrative': 0.75,
      'Email Campaign Draft': 0.65,
      'HTML / Dark Earth Assets': 0.00
    }
  }
};

export default function ProjectThermostat() {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('WARLORD_THERMOSTAT_PROFILES');
    return saved ? JSON.parse(saved) : SYSTEM_PROFILES;
  });

  const [activeProject, setActiveProject] = useState(() => {
    return localStorage.getItem('WARLORD_PROJECT') || 'QUANT_TRADING';
  });

  const currentProjConfig = profiles[activeProject] || profiles['QUANT_TRADING'];
  const aspectKeys = Object.keys(currentProjConfig.subAspects);

  const [activeAspect, setActiveAspect] = useState(() => {
    return localStorage.getItem('WARLORD_ACTIVE_ASPECT') || aspectKeys[0];
  });

  // Keep sub-aspect synchronized when project switches
  useEffect(() => {
    if (!currentProjConfig.subAspects[activeAspect]) {
      setActiveAspect(Object.keys(currentProjConfig.subAspects)[0]);
    }
  }, [activeProject]);

  // Push thermal values down the runtime pipe
  useEffect(() => {
    const macroVal = currentProjConfig.baseHeat;
    const microVal = currentProjConfig.subAspects[activeAspect] ?? macroVal;

    localStorage.setItem('WARLORD_PROJECT', activeProject);
    localStorage.setItem('WARLORD_ACTIVE_ASPECT', activeAspect);
    localStorage.setItem('WARLORD_MACRO_HEAT', macroVal.toFixed(2));
    localStorage.setItem('WARLORD_MICRO_HEAT', microVal.toFixed(2));
    localStorage.setItem('WARLORD_THERMOSTAT_PROFILES', JSON.stringify(profiles));
  }, [activeProject, activeAspect, profiles]);

  const handleMacroSlide = (val) => {
    const heat = parseFloat(val);
    setProfiles(prev => ({
      ...prev,
      [activeProject]: {
        ...prev[activeProject],
        baseHeat: heat
      }
    }));
  };

  const handleMicroSlide = (val) => {
    const heat = parseFloat(val);
    setProfiles(prev => ({
      ...prev,
      [activeProject]: {
        ...prev[activeProject],
        subAspects: {
          ...prev[activeProject].subAspects,
          [activeAspect]: heat
        }
      }
    }));
  };

  const macroHeat = currentProjConfig.baseHeat;
  const microHeat = currentProjConfig.subAspects[activeAspect] ?? macroHeat;

  // Heat color coding: Cold Green -> Gold Core -> Ruby Warning
  const getThermalColor = (h) => (h > 0.45 ? '#ff3344' : h > 0.15 ? '#f0b90b' : '#00ffc4');

  return (
    <div style={{
      background: '#0a0c0f',
      border: '1px solid #1f242d',
      borderLeft: '3px solid #f0b90b',
      padding: '4px 12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '16px',
      fontFamily: 'Consolas, monospace',
      fontSize: '11px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      {/* 1. PROJECT CANONICAL REGISTRY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={{ fontSize: '8px', letterSpacing: '1px', color: '#555', textTransform: 'uppercase' }}>PROJECT MATRIX</span>
        <select
          value={activeProject}
          onChange={(e) => setActiveProject(e.target.value)}
          style={{
            background: '#12151c',
            color: '#f0b90b',
            border: '1px solid #28303d',
            padding: '2px 6px',
            fontSize: '11px',
            fontWeight: 'bold',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {Object.keys(profiles).map(k => (
            <option key={k} value={k}>{profiles[k].label || k}</option>
          ))}
        </select>
      </div>

      {/* 2. MACRO PROJECT SCROLLBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '8px', color: '#555', letterSpacing: '1px' }}>MACRO BASE</span>
          <span style={{ color: getThermalColor(macroHeat), fontWeight: 'bold' }}>{macroHeat.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={macroHeat}
          onChange={(e) => handleMacroSlide(e.target.value)}
          style={{
            accentColor: getThermalColor(macroHeat),
            cursor: 'ew-resize',
            height: '4px'
          }}
        />
      </div>

      <div style={{ width: '1px', height: '22px', background: '#1f242d' }} />

      {/* 3. TACTICAL SUB-ASPECT SELECTOR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={{ fontSize: '8px', letterSpacing: '1px', color: '#555', textTransform: 'uppercase' }}>SUB-ASPECT</span>
        <select
          value={activeAspect}
          onChange={(e) => setActiveAspect(e.target.value)}
          style={{
            background: '#12151c',
            color: '#00ffc4',
            border: '1px solid #28303d',
            padding: '2px 6px',
            fontSize: '11px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {aspectKeys.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {/* 4. MICRO OVERRIDE SCROLLBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '8px', color: '#555', letterSpacing: '1px' }}>MICRO HEAT</span>
          <span style={{ color: getThermalColor(microHeat), fontWeight: 'bold' }}>{microHeat.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={microHeat}
          onChange={(e) => handleMicroSlide(e.target.value)}
          style={{
            accentColor: getThermalColor(microHeat),
            cursor: 'ew-resize',
            height: '4px'
          }}
        />
      </div>
    </div>
  );
}
