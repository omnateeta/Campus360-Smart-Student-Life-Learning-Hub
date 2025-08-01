import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  CircularProgress,
  Divider,
  Paper,
  Slider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Settings,
  Timer as TimerIcon,
  Coffee,
  School,
  TrendingUp,
  History,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Add,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';

const Timer = () => {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState('work'); // work, shortBreak, longBreak
  const [sessionCount, setSessionCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  
  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartWork: false,
    soundEnabled: true,
    notifications: true,
  });

  // UI states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Mock tasks for selection
  const mockTasks = [
    { id: 1, title: 'Complete Calculus Assignment', subject: 'Mathematics' },
    { id: 2, title: 'Physics Lab Report', subject: 'Physics' },
    { id: 3, title: 'Review Organic Chemistry', subject: 'Chemistry' },
    { id: 4, title: 'Biology Practice Questions', subject: 'Biology' },
  ];

  // Mock session history
  const [sessionHistory, setSessionHistory] = useState([
    {
      id: 1,
      type: 'work',
      duration: 25,
      completedAt: new Date(Date.now() - 3600000),
      task: 'Complete Calculus Assignment',
    },
    {
      id: 2,
      type: 'shortBreak',
      duration: 5,
      completedAt: new Date(Date.now() - 2400000),
      task: null,
    },
    {
      id: 3,
      type: 'work',
      duration: 25,
      completedAt: new Date(Date.now() - 1800000),
      task: 'Physics Lab Report',
    },
  ]);

  const socket = useSocket();

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, timeLeft]);

  // Session management
  const handleSessionComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Play completion sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play();
    }

    // Add to session history
    const newSession = {
      id: Date.now(),
      type: currentSession,
      duration: getCurrentSessionDuration(),
      completedAt: new Date(),
      task: selectedTask?.title || null,
    };
    setSessionHistory(prev => [newSession, ...prev]);

    // Socket event for session completion
    if (socket) {
      socket.emit('timer_session_complete', newSession);
    }

    // Auto-start next session based on settings
    if (currentSession === 'work') {
      setSessionCount(prev => prev + 1);
      setTotalSessions(prev => prev + 1);
      
      const nextSession = (sessionCount + 1) % settings.longBreakInterval === 0 
        ? 'longBreak' 
        : 'shortBreak';
      
      setCurrentSession(nextSession);
      setTimeLeft(getSessionDuration(nextSession) * 60);
      
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    } else {
      setCurrentSession('work');
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.autoStartWork) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }
  };

  const getCurrentSessionDuration = () => {
    switch (currentSession) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
      default: return settings.workDuration;
    }
  };

  const getSessionDuration = (session) => {
    switch (session) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
      default: return settings.workDuration;
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(getCurrentSessionDuration() * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(getCurrentSessionDuration() * 60);
  };

  const switchSession = (session) => {
    setCurrentSession(session);
    setTimeLeft(getSessionDuration(session) * 60);
    setIsRunning(false);
    setIsPaused(false);
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const progress = ((getCurrentSessionDuration() * 60 - timeLeft) / (getCurrentSessionDuration() * 60)) * 100;

  const getSessionColor = (session) => {
    switch (session) {
      case 'work': return '#ef4444';
      case 'shortBreak': return '#10b981';
      case 'longBreak': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSessionIcon = (session) => {
    switch (session) {
      case 'work': return <School />;
      case 'shortBreak': return <Coffee />;
      case 'longBreak': return <Coffee />;
      default: return <TimerIcon />;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Pomodoro Timer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay focused with the Pomodoro Technique
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => setTaskDialogOpen(true)}>
            <Add />
          </IconButton>
          <IconButton onClick={() => setSettingsOpen(true)}>
            <Settings />
          </IconButton>
          <IconButton onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Timer */}
        <Grid item xs={12} md={8}>
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <CardContent>
              {/* Session Selector */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
                {['work', 'shortBreak', 'longBreak'].map((session) => (
                  <Button
                    key={session}
                    variant={currentSession === session ? 'contained' : 'outlined'}
                    onClick={() => switchSession(session)}
                    startIcon={getSessionIcon(session)}
                    sx={{
                      backgroundColor: currentSession === session ? getSessionColor(session) : 'transparent',
                      borderColor: getSessionColor(session),
                      color: currentSession === session ? 'white' : getSessionColor(session),
                      '&:hover': {
                        backgroundColor: getSessionColor(session),
                        color: 'white',
                      },
                    }}
                  >
                    {session === 'work' ? 'Work' : session === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </Button>
                ))}
              </Box>

              {/* Current Task */}
              {selectedTask && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Current Task
                  </Typography>
                  <Chip
                    label={selectedTask.title}
                    color="primary"
                    sx={{ fontSize: '1rem', py: 2, px: 1 }}
                  />
                </Box>
              )}

              {/* Timer Display */}
              <motion.div
                animate={{ scale: isRunning && !isPaused ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 1, repeat: isRunning && !isPaused ? Infinity : 0 }}
              >
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                  <CircularProgress
                    variant="determinate"
                    value={progress}
                    size={300}
                    thickness={4}
                    sx={{
                      color: getSessionColor(currentSession),
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h1" fontWeight="bold" sx={{ fontSize: '4rem' }}>
                      {formatTime(timeLeft)}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {currentSession === 'work' ? 'Focus Time' : 'Break Time'}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* Timer Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                {!isRunning ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={startTimer}
                    sx={{
                      backgroundColor: getSessionColor(currentSession),
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                    }}
                  >
                    Start
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={isPaused ? <PlayArrow /> : <Pause />}
                    onClick={isPaused ? startTimer : pauseTimer}
                    sx={{
                      backgroundColor: getSessionColor(currentSession),
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                    }}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Stop />}
                  onClick={stopTimer}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Stop
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Refresh />}
                  onClick={resetTimer}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Reset
                </Button>
              </Box>

              {/* Session Progress */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Session Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getSessionColor(currentSession),
                    },
                  }}
                />
              </Box>

              {/* Session Stats */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color={getSessionColor('work')}>
                    {totalSessions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sessions
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {sessionCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Sessions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Session History */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1 }} />
                Recent Sessions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {sessionHistory.slice(0, 5).map((session) => (
                  <ListItem key={session.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          backgroundColor: getSessionColor(session.type),
                          width: 32,
                          height: 32,
                        }}
                      >
                        {getSessionIcon(session.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={session.task || `${session.type} session`}
                      secondary={`${session.duration}min • ${new Date(session.completedAt).toLocaleTimeString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Daily Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1 }} />
                Today's Stats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Focus Time</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {sessionHistory.filter(s => s.type === 'work').length * 25}min
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Break Time</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {sessionHistory.filter(s => s.type !== 'work').reduce((acc, s) => acc + s.duration, 0)}min
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Completed Sessions</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {sessionHistory.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Selection Dialog */}
      <Dialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Task</DialogTitle>
        <DialogContent>
          <List>
            {mockTasks.map((task) => (
              <ListItem
                key={task.id}
                button
                onClick={() => {
                  setSelectedTask(task);
                  setTaskDialogOpen(false);
                }}
                selected={selectedTask?.id === task.id}
              >
                <ListItemText
                  primary={task.title}
                  secondary={task.subject}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            setSelectedTask(null);
            setTaskDialogOpen(false);
          }}>
            Clear Selection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Timer Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box>
              <Typography gutterBottom>Work Duration (minutes)</Typography>
              <Slider
                value={settings.workDuration}
                onChange={(e, value) => setSettings({...settings, workDuration: value})}
                min={1}
                max={60}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box>
              <Typography gutterBottom>Short Break Duration (minutes)</Typography>
              <Slider
                value={settings.shortBreakDuration}
                onChange={(e, value) => setSettings({...settings, shortBreakDuration: value})}
                min={1}
                max={30}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box>
              <Typography gutterBottom>Long Break Duration (minutes)</Typography>
              <Slider
                value={settings.longBreakDuration}
                onChange={(e, value) => setSettings({...settings, longBreakDuration: value})}
                min={1}
                max={60}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>
    </Box>
  );
};

export default Timer;
