
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import {
  MapIcon,
  BookmarkIcon,
  CurrencyDollarIcon,
  FireIcon,
  CheckIcon,
  LockClosedIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  LightBulbIcon,
  SunIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './App.css';

const iconMapping = {
  leaf: SunIcon,
  book: BookOpenIcon,
  'figure.walk': UserIcon,
  'book.fill': BookOpenIcon,
  calendar: CalendarIcon,
  tree: ArrowPathIcon,
  lightbulb: LightBulbIcon,
};

const configuration = {
  lightBlue: 'rgb(219, 234, 254)',
  mediumBlue: 'rgb(191, 219, 254)',
  accentColor: 'rgb(30, 58, 138)',
  grayColor: 'rgb(100, 100, 100)',
  darkBlue: 'rgb(23, 37, 84)',
  taskPool: [
    ['Morning Meditation', '5 min', 'leaf'],
    ['Journal Reflection', '10 min', 'book'],
    ['Quick Workout', '15 min', 'figure.walk'],
    ['Read a Chapter', '20 min', 'book.fill'],
    ['Plan Tomorrow', '10 min', 'calendar'],
    ['Mindful Walk', '15 min', 'tree'],
    ['Learn Something New', '20 min', 'lightbulb'],
  ],
  currentDay: 15,
  preCompletedDays: 3,
};

function App({ username = 'User', onChangeUsername }) {
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(configuration.currentDay);
  const [isTasksExpanded, setIsTasksExpanded] = useState(true);
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [animatingTaskIndex, setAnimatingTaskIndex] = useState(null);
  const scrollRef = useRef(null);

  const totalDays = configuration.currentDay + 10;


  const currentStreak = () => {
    let streak = 0;
    for (let dayNum = Math.min(configuration.currentDay, totalDays); dayNum >= 1; dayNum--) {
      const day = days.find((d) => d.dayNumber === dayNum);
      if (day && day.activities.every((t) => t.completed)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const longestStreak = () => {
    let longest = 0,
      current = 0;
    for (let dayNum = 1; dayNum <= Math.min(configuration.currentDay, totalDays); dayNum++) {
      const day = days.find((d) => d.dayNumber === dayNum);
      if (day && day.activities.every((t) => t.completed)) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    return longest;
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = () => {
    return format(new Date(), 'MMMM d, yyyy');
  };

  const updateTaskLocks = (day) => {
    const updatedTasks = [...day.activities];
    for (let i = 0; i < updatedTasks.length; i++) {
      updatedTasks[i].locked = i !== 0 && !updatedTasks[i - 1].completed;
      if (i !== 0 && updatedTasks[i - 1].completed && !updatedTasks[i].locked) {
        setAnimatingTaskIndex(i);
        setTimeout(() => setAnimatingTaskIndex(null), 500);
      }
    }
    return updatedTasks;
  };

  const toggleTask = (dayNumber, taskId) => {
    const dayIndex = days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;
    const day = { ...days[dayIndex] };
    const taskIndex = day.activities.findIndex((t) => t.id === taskId);
    if (taskIndex === -1 || day.activities[taskIndex].locked) return;

    const lastCompletedIndex = day.activities.reduce((last, t, i) => (t.completed ? i : last), -1);
    if (!day.activities[taskIndex].completed || taskIndex === lastCompletedIndex) {
      day.activities[taskIndex].completed = !day.activities[taskIndex].completed;
      day.activities = updateTaskLocks(day);
      const newDays = [...days];
      newDays[dayIndex] = day;
      setDays(newDays);
      setIsTasksExpanded(!day.activities.every((t) => t.completed));
    }
  };

  const getFocusText = (day) => {
    const weekday = (day - 1) % 7;
    switch (weekday) {
      case 0:
        return 'Kickstart the week with clear priorities and a structured plan.';
      case 1:
        return 'Deep dive into a challenging task to build momentum.';
      case 2:
        return 'Reflect on progress and adjust goals for the week.';
      case 3:
        return 'Strengthen connections through meaningful interactions.';
      case 4:
        return 'Complete key tasks and prepare for a restful weekend.';
      case 5:
        return 'Explore a new skill or hobby to spark creativity.';
      case 6:
        return 'Rest, recharge, and plan for the upcoming week.';
      default:
        return 'Stay consistent today!';
    }
  };

  const initializeDays = () => {
    const tempDays = [];
    for (let day = 1; day <= totalDays; day++) {
      const taskCount = Math.floor(Math.random() * 3) + 3;
      const shuffledTasks = configuration.taskPool.sort(() => Math.random() - 0.5).slice(0, taskCount);
      const tasks = shuffledTasks.map((task, index) => ({
        id: uuidv4(),
        title: task[0],
        duration: task[1],
        iconName: task[2],
        completed: day <= configuration.preCompletedDays,
        locked: index !== 0 && day > configuration.preCompletedDays,
      }));
      tempDays.push({
        id: uuidv4(),
        dayNumber: day,
        activities: tasks,
        focus: getFocusText(day),
      });
    }
    setDays(tempDays.map((day) => ({ ...day, activities: updateTaskLocks(day) })));
  };

  useEffect(() => {
    if (!days.length) {
      initializeDays();
    }
    setSelectedDay(Math.min(configuration.currentDay, totalDays));
    if (scrollRef.current) {
      const currentDayElement = scrollRef.current.querySelector(`#day-${configuration.currentDay}`);
      if (currentDayElement) {
        currentDayElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [days.length]);

  return (
    <div className="app-container" style={{ backgroundColor: configuration.lightBlue }}>
      {days.length === 0 ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="main-container">
          <div className="header">
            <div className="icon-row">
              <div className="icon-group">
                <MapIcon className="icon" style={{ color: configuration.accentColor, width: '24px', height: '24px' }} />
                <BookmarkIcon className="icon" style={{ color: configuration.accentColor, width: '24px', height: '24px' }} />
              </div>
              <CurrencyDollarIcon className="icon" style={{ color: configuration.accentColor, width: '24px', height: '24px' }} />
            </div>
            <div className="date" style={{ color: configuration.grayColor }}>
              {formattedDate()}
            </div>
            <h1 className="greeting">{`${greeting()}, ${username}`}</h1>
            {onChangeUsername && (
              <button
                onClick={onChangeUsername}
                className="text-sm text-blue-600 underline mt-2"
              >
                Change Username
              </button>
            )}
          </div>

          <div className="streak-button-container">
            <button
              onClick={() => setShowStreakDetails(true)}
              className="streak-button"
              style={{ backgroundColor: configuration.darkBlue }}
            >
              <div>Streak</div>
              <div className="streak-info">{`Current: ${currentStreak()} | Longest: ${longestStreak()}`}</div>
            </button>
          </div>

          {showStreakDetails && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-title">Your Streaks</h2>
                <p>Current Streak: {currentStreak()} days</p>
                <p>Longest Streak: {longestStreak()} days</p>
                {days
                  .filter((d) => d.activities.every((t) => t.completed))
                  .map((day) => (
                    <div key={day.id} className="streak-item">
                      <div>
                        <span>Day {day.dayNumber}</span>
                        <FireIcon className="flame-icon" style={{ width: '20px', height: '20px' }} />
                      </div>
                      <span className="completed">Completed</span>
                    </div>
                  ))}
                <button
                  onClick={() => setShowStreakDetails(false)}
                  className="modal-close-button"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="day-selector-container" style={{ backgroundColor: configuration.mediumBlue }}>
            <div className="day-scroll" ref={scrollRef}>
              <div className="day-list">
                {days
                  .filter((d) => d.dayNumber <= totalDays)
                  .map((day) => (
                    <div
                      key={day.id}
                      id={`day-${day.dayNumber}`}
                      onClick={() =>
                        day.dayNumber <= configuration.currentDay && setSelectedDay(day.dayNumber)
                      }
                      className={`day-item ${day.dayNumber === selectedDay ? 'selected' : ''} ${
                        day.dayNumber > configuration.currentDay ? 'disabled' : ''
                      }`}
                      style={{
                        backgroundColor:
                          day.dayNumber === selectedDay
                            ? configuration.accentColor
                            : 'rgba(128, 128, 128, 0.1)',
                        width: day.dayNumber === configuration.currentDay ? '64px' : '48px',
                        height: day.dayNumber === configuration.currentDay ? '64px' : '48px',
                      }}
                    >
                      {day.activities.every((t) => t.completed) && (
                        <FireIcon className="flame-icon" style={{ width: '20px', height: '20px' }} />
                      )}
                      <span className="day-label">
                        {day.dayNumber === configuration.currentDay ? 'Today' : 'Day'}
                      </span>
                      <span
                        className={`day-number ${
                          day.dayNumber === configuration.currentDay ? 'current' : ''
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {days.find((d) => d.dayNumber === selectedDay) && (
              <div>
                <div className="focus-card">
                  <div className="focus-label" style={{ color: configuration.grayColor }}>
                    Focus of Today
                  </div>
                  <div>{days.find((d) => d.dayNumber === selectedDay).focus}</div>
                </div>

                <div className="tasks-card">
                  <button
                    onClick={() => setIsTasksExpanded(!isTasksExpanded)}
                    className="tasks-header"
                  >
                    <div>
                      <span className="tasks-label" style={{ color: configuration.grayColor }}>
                        Daily Tasks
                      </span>
                      {!isTasksExpanded &&
                        days.find((d) => d.dayNumber === selectedDay).activities.every((t) => t.completed) && (
                          <span className="tasks-completed">Yeah, Great Job!</span>
                        )}
                    </div>
                    {isTasksExpanded ? (
                      <ChevronUpIcon style={{ color: configuration.grayColor, width: '20px', height: '20px' }} />
                    ) : (
                      <ChevronDownIcon style={{ color: configuration.grayColor, width: '20px', height: '20px' }} />
                    )}
                  </button>
                  {isTasksExpanded && (
                    <div>
                      {days.find((d) => d.dayNumber === selectedDay).activities.every((t) => t.completed) && (
                        <div className="tasks-completed">Yeah, Great Job!</div>
                      )}
                      {days
                        .find((d) => d.dayNumber === selectedDay)
                        .activities.map((task, index) => {
                          const TaskIcon = iconMapping[task.iconName] || UserIcon;
                          return (
                            <div key={task.id}>
                              <div
                                onClick={() => toggleTask(selectedDay, task.id)}
                                className={`task-item ${task.locked ? 'locked' : ''}`}
                                style={{ backgroundColor: 'white' }}
                              >
                                <div className="task-status">
                                  {task.completed ? (
                                    <CheckIcon className="checkmark" style={{ width: '20px', height: '20px' }} />
                                  ) : task.locked ? (
                                    <LockClosedIcon
                                      className="lock"
                                      style={{ color: configuration.grayColor, width: '20px', height: '20px' }}
                                    />
                                  ) : (
                                    <div className="task-indicator">
                                      <div
                                        className={`indicator-dot ${
                                          animatingTaskIndex === index ? 'animate-pulse' : ''
                                        }`}
                                        style={{ backgroundColor: configuration.accentColor }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                                <TaskIcon
                                  className="task-icon"
                                  style={{ color: configuration.grayColor, width: '20px', height: '20px' }}
                                />
                                <div className="task-details">
                                  <div
                                    style={{ color: task.locked ? configuration.grayColor : 'black' }}
                                  >
                                    {task.title}
                                  </div>
                                  <div className="task-duration" style={{ color: configuration.grayColor }}>
                                    {task.duration}
                                  </div>
                                </div>
                              </div>
                              {index < days.find((d) => d.dayNumber === selectedDay).activities.length - 1 && (() => {
                                const selected = days.find((d) => d.dayNumber === selectedDay);
                                const nextTask = selected.activities[index + 1];
                                const shouldShowConnector = task.completed && nextTask.completed;

                                return shouldShowConnector ? (
                                  <div className="task-connector">
                                    <div
                                      className="connector-line"
                                      style={{
                                        backgroundColor: configuration.accentColor,
                                      }}
                                    ></div>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;