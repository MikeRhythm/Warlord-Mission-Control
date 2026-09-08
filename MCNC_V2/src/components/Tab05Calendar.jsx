import React, { useState } from 'react';
import './Tab05Calendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Tab05Calendar({ ws }) {
    // ZERO-STATE INIT
    const [alwaysRunning, setAlwaysRunning] = useState([]);
    const [scheduledTasks, setScheduledTasks] = useState([]);

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
                        <span className="running-pill" style={{ fontStyle: 'italic', opacity: 0.5 }}>ZERO-STATE // NO ACTIVE POLLING</span>
                    ) : (
                        alwaysRunning.map(task => (
                            <span key={task.id} className="running-pill">{task.name} &bull; {task.frequency}</span>
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