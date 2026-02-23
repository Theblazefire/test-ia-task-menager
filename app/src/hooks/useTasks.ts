import { useState, useEffect, useRef } from 'react';
import type { Task, TaskStatus } from '@/types/task';
import { playAlarmSound } from '@/types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use ref to track running timers without causing re-renders of the interval
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Timer effect - countdown for all running timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        const updateTimers = (tasks: Task[]): Task[] => {
          return tasks.map(task => {
            if (task.isTimerRunning && task.timerRemaining > 0) {
              const newRemaining = task.timerRemaining - 1;
              // Se il timer è scaduto, suona l'allarme
              if (newRemaining === 0) {
                playAlarmSound();
                return {
                  ...task,
                  timerRemaining: 0,
                  isTimerRunning: false,
                  subtasks: updateTimers(task.subtasks),
                };
              }
              return {
                ...task,
                timerRemaining: newRemaining,
                subtasks: updateTimers(task.subtasks),
              };
            }
            return { ...task, subtasks: updateTimers(task.subtasks) };
          });
        };
        return updateTimers(prevTasks);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createTask = (parentId: string | null = null): Task => {
    const newTask: Task = {
      id: generateId(),
      title: 'Nuovo Task',
      description: '',
      status: 'not-started',
      dueDate: new Date().toISOString().split('T')[0],
      timerDuration: 300, // 5 minuti di default
      timerRemaining: 300,
      isTimerRunning: false,
      subtasks: [],
      createdAt: Date.now(),
    };

    if (parentId === null) {
      setTasks(prev => [...prev, newTask]);
    } else {
      setTasks(prev => addSubtaskRecursive(prev, parentId, newTask));
    }

    return newTask;
  };

  const addSubtaskRecursive = (tasks: Task[], parentId: string, newTask: Task): Task[] => {
    return tasks.map(task => {
      if (task.id === parentId) {
        return { ...task, subtasks: [...task.subtasks, newTask] };
      }
      return { ...task, subtasks: addSubtaskRecursive(task.subtasks, parentId, newTask) };
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => updateTaskRecursive(prev, taskId, updates));
  };

  const updateTaskRecursive = (tasks: Task[], taskId: string, updates: Partial<Task>): Task[] => {
    return tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      return { ...task, subtasks: updateTaskRecursive(task.subtasks, taskId, updates) };
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => deleteTaskRecursive(prev, taskId));
  };

  const deleteTaskRecursive = (tasks: Task[], taskId: string): Task[] => {
    return tasks.filter(task => task.id !== taskId).map(task => ({
      ...task,
      subtasks: deleteTaskRecursive(task.subtasks, taskId),
    }));
  };

  const toggleTimer = (taskId: string) => {
    setTasks(prev => toggleTimerRecursive(prev, taskId));
  };

  const toggleTimerRecursive = (tasks: Task[], taskId: string): Task[] => {
    return tasks.map(task => {
      if (task.id === taskId) {
        // Se il timer è a zero, resetta prima di avviare
        if (task.timerRemaining === 0) {
          return { ...task, timerRemaining: task.timerDuration, isTimerRunning: true };
        }
        return { ...task, isTimerRunning: !task.isTimerRunning };
      }
      return { ...task, subtasks: toggleTimerRecursive(task.subtasks, taskId) };
    });
  };

  const resetTimer = (taskId: string) => {
    setTasks(prev => updateTaskRecursive(prev, taskId, { 
      timerRemaining: prev.find(t => t.id === taskId)?.timerDuration || 300, 
      isTimerRunning: false 
    }));
  };

  const setTimerDuration = (taskId: string, duration: number) => {
    setTasks(prev => updateTaskRecursive(prev, taskId, { 
      timerDuration: duration,
      timerRemaining: duration,
      isTimerRunning: false
    }));
  };

  const changeStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => updateTaskRecursive(prev, taskId, { status }));
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter tasks based on search query
  const filterTasks = (tasks: Task[]): Task[] => {
    if (!searchQuery.trim()) return tasks;
    
    const query = searchQuery.toLowerCase();
    
    const filterRecursive = (task: Task): Task | null => {
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description.toLowerCase().includes(query);
      
      // Filter subtasks
      const filteredSubtasks = task.subtasks
        .map(filterRecursive)
        .filter((t): t is Task => t !== null);
      
      // Include if matches or has matching subtasks
      if (matchesTitle || matchesDescription || filteredSubtasks.length > 0) {
        return { ...task, subtasks: filteredSubtasks };
      }
      
      return null;
    };
    
    return tasks.map(filterRecursive).filter((t): t is Task => t !== null);
  };

  const filteredTasks = filterTasks(tasks);

  return {
    tasks,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    createTask,
    updateTask,
    deleteTask,
    toggleTimer,
    resetTimer,
    setTimerDuration,
    changeStatus,
    formatTime,
  };
}
