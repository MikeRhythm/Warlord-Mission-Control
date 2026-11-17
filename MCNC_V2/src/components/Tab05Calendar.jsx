import React, { useState, useEffect } from 'react';
import './Tab05Calendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_ALWAYS_RUNNING = [
  { id: 'cron-registry', name: 'LLM Model Registry Sync', frequency: 'Every 6 Hours' },
  { id: 'cron-runway', name: 'Bounty Pool & Runway Audit', frequency: 'Daily @ 06:30 SAST' },
  { id: 'cron-radar', name: 'New Bounty Scout (Tess Gate)', frequency: 'Daily @ 07:00 SAST' },
  { id: 'cron-pacing', name: 'View Floor & Pacing Check', frequency: 'Every 12 Hours' }
];

const DEFAULT_SCHEDULED_TASKS = [];
// Generate schedule matrix dynamically
WEEKDAYS.forEach(day => {
    DEFAULT_SCHEDULED_TASKS.push({ id: `t-runway-${day}`, day, title: 'Bounty Pool & Runway Audit', time: '06:30 SAST', theme: 'purple' });
    DEFAULT_SCHEDULED_TASKS.push({ id: `t-rad-${day}`, day, title: 'New Bounty Scout (Tess)', time: '07:00 SAST', theme: 'blue' });
    DEFAULT_SCHEDULED_TASKS.push({ id: `t-reg-${day}`, day, title: 'LLM Registry Sync', time: '00:00 / 06:00 / 12:00 / 18:00', theme: 'gold' });
    DEFAULT_SCHEDULED_TASKS.push({ id: `t-pace-${day}`, day, title: 'View Floor & Pacing Check', time: '12:00 / 00:00 SAST', theme: 'emerald' });
});

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
          <span className="always-running-label">⚡ Active Cron Daemons</span>
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
          const dayTasks = getTasksForDay(day).sort((a,b) => a.time.localeCompare(b.time));

          return (
            <div key={day} className="calendar-day-col">
              <div className="day-header">{day}</div>

              {dayTasks.length === 0 ? (
                <div className="zero-state-col">EMPTY</div>
              ) : (
                dayTasks.map(task => (
                  <div key={task.id} className={`routine-card theme-${task.theme || 'slate'}`} style={{ borderLeftColor: task.theme === 'emerald' ? '#10b981' : task.theme === 'purple' ? '#a855f7' : '' }}>
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
