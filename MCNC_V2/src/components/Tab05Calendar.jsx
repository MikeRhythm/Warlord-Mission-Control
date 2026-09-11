import React, { useState, useEffect } from 'react';
import './Tab05Calendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// DEFAULT BASE 1 DAEMON SCHEDULE CONFIGURATION
const DEFAULT_ALWAYS_RUNNING = [
  { id: 'cron-registry', name: 'LLM Model Registry Sync', frequency: 'Every 6 Hours' },
  { id: 'cron-radar', name: 'AI Intel Radar (Tess Gate)', frequency: 'Daily @ 06:00' }
];

const DEFAULT_SCHEDULED_TASKS = [
  { id: 't1-reg', day: 'Mon', title: 'LLM Registry Sync', time: '00:00 / 06:00 / 12:00 / 18:00', theme: 'gold' },
  { id: 't1-rad', day: 'Mon', title: 'AI Intel Radar (Tess)', time: '06:00 SAST', theme: 'blue' },

  { id: 't2-reg', day: 'Tue', title: 'LLM Registry Sync', time: '00:00 / 06:00 / 12:00 / 18:00', theme: 'gold' },
  { id: 't2-rad', day: 'Tue', title: 'AI Intel Radar (Tess)', time: '06:00 SAST', theme: 'blue' },

  { id: 't3-reg', day: 'Wed', title: 'LLM Registry Sync', time: '00:00 / 06:00 / 12:00 / 18:00', theme: 'gold' },
  { id: 't3-rad', day: 'Wed', title: 'AI Intel Radar (Tess)', time: '06:00 SAST', theme: 'blue' },

  { id: 't4-reg', day: 'Thu', title: 'LLM Registry Sync', time: '00:00 / 06:00 / 12:00 / 18:00', theme: 'gold' },
  { id: 't4-rad', day: 'Thu', title: 'AI Intel Radar (Tess)', time: '06:00 SAST', theme: 'blue' },

  { id: 't5-reg', day: 'Fri', title: 'LLM Registry Sync', time: '00:00 / 06:00 / 12:00 / 18:00', theme: 'gold' },
  { id: 't5-rad', day: 'Fri', title: 'AI Intel Radar (Tess)', time: '06:00 SAST', theme: 'blue' },

  { id: 't6-reg', day: 'Sat', title: 'LLM Registry Sync', time: '00:00 / 06:00 / 12:00 / 18:00', theme: 'gold' },
  { id: 't6-rad', day: 'Sat', title: 'AI Intel Radar (Tess)', time: '06:00 SAST', theme: 'blue' },

  { id: 't7-reg', day: 'Sun', title: 'LLM Registry Sync', time: '00:00 / 06:00 / 12:00 / 18:00', theme: 'gold' },
  { id: 't7-rad', day: 'Sun', title: 'AI Intel Radar (Tess)', time: '06:00 SAST', theme: 'blue' }
];

export default function Tab05Calendar({ ws }) {
  const [alwaysRunning, setAlwaysRunning] = useState(DEFAULT_ALWAYS_RUNNING);
  const [scheduledTasks, setScheduledTasks] = useState(DEFAULT_SCHEDULED_TASKS);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'SCHEDULE_UPDATE') {
          if (payload.alwaysRunning) setAlwaysRunning(payload.alwaysRunning);
          if (payload.scheduledTasks) setScheduledTasks(payload.scheduledTasks);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket schedule message:', err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  const getTasksForDay = (day) => scheduledTasks.filter(t => t.day === day);

  return (
    <div className="view-section tab-05-container">
      {/* HEADER AREA */}
      <div className="calendar-header">
        <div className="calendar-title-group">
          <h2>Scheduled Tasks</h2>
          <p>Base 1 pipeline automated routines &amp; cron logic</p>
        </div>

        <div className="always-running-container">
          <span className="always-running-label">⚡ Always Running</span>
          {alwaysRunning.length === 0 ? (
            <span className="running-pill" style={{ fontStyle: 'italic', opacity: 0.5 }}>
              ZERO-STATE // NO ACTIVE POLLING
            </span>
          ) : (
            alwaysRunning.map(task => (
              <span key={task.id} className="running-pill">
                {task.name} &bull; {task.frequency}
              </span>
            ))
          )}
        </div>
      </div>

      {/* 7-DAY CALENDAR GRID */}
      <div className="calendar-week-grid">
        {WEEKDAYS.map(day => {
          const dayTasks = getTasksForDay(day);

          return (
            <div key={day} className="calendar-day-col">
              <div className="day-header">{day}</div>

              {dayTasks.length === 0 ? (
                <div className="zero-state-col">EMPTY</div>
              ) : (
                dayTasks.map(task => (
                  <div key={task.id} className={`routine-card theme-${task.theme || 'slate'}`}>
                    <span className="routine-title">{task.title}</span>
                    <span className="routine-time">{task.time}</span>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}