import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Timer,
  EmojiEvents,
  School,
  CalendarToday,
  PlayArrow,
  Add,
  CheckCircle,
  Schedule,
  Analytics,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';
import { analyticsService } from '../../services/analyticsService';
import { tasksService } from '../../services/studyPlansService';

// Default data structure for charts when no data is available
const defaultStudyData = [
  { name: 'Mon', hours: 0 },
  { name: 'Tue', hours: 0 },
  { name: 'Wed', hours: 0 },
  { name: 'Thu', hours: 0 },
  { name: 'Fri', hours: 0 },
  { name: 'Sat', hours: 0 },
  { name: 'Sun', hours: 0 },
];

const defaultSubjectData = [
  { name: 'No Data', value: 100, color: '#e5e7eb' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [studyData, setStudyData] = useState(defaultStudyData);
  const [subjectData, setSubjectData] = useState(defaultSubjectData);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    studyHours: 0,
    streak: 0
  });

  // Helper function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  // Load dashboard data from APIs
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's tasks
      const today = new Date().toISOString().split('T')[0];
      const tasksResponse = await tasksService.getTasks({ 
        scheduledDate: today,
        limit: 5 
      });
      const tasks = tasksResponse.data?.tasks || [];
      setTodayTasks(tasks);
      
      // Fetch upcoming events (next 7 days tasks)
      try {
        const weekTasksResponse = await tasksService.getWeekTasks();
        const weekTasks = weekTasksResponse.data?.tasks || [];
        
        // Create upcoming events from week tasks
        const events = weekTasks
          .filter(task => new Date(task.scheduledDate) > new Date())
          .slice(0, 3)
          .map(task => ({
            id: task._id,
            title: task.title,
            date: formatDate(task.scheduledDate),
            time: task.scheduledTime?.start || 'No time set',
            type: task.type || 'task'
          }));
        setUpcomingEvents(events);
      } catch (error) {
        console.log('Week tasks not available, using empty array');
        setUpcomingEvents([]);
      }
      
      // Try to fetch analytics data
      try {
        const analyticsResponse = await analyticsService.getDashboardAnalytics();
        const analytics = analyticsResponse.data || {};
        
        // Update study data if available
        if (analytics.studyData) {
          setStudyData(analytics.studyData);
        }
        
        // Update subject data if available
        if (analytics.subjectData) {
          setSubjectData(analytics.subjectData);
        }
        
        // Update stats
        setStats({
          totalTasks: analytics.totalTasks || tasks.length,
          completedTasks: analytics.completedTasks || tasks.filter(t => t.status === 'completed').length,
          studyHours: analytics.studyHours || 0,
          streak: analytics.streak || 0
        });
      } catch (error) {
        console.log('Analytics not available, using task-based stats');
        // Fallback to basic stats from tasks
        setStats({
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          studyHours: 0,
          streak: 0
        });
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    // Load dashboard data
    loadDashboardData();
  }, []);

  // Button click handlers
  const handleAddTask = () => {
    navigate('/tasks');
    toast.info('Redirecting to Tasks page to add a new task');
  };

  const handleViewCalendar = () => {
    navigate('/calendar');
    toast.info('Redirecting to Calendar view');
  };

  const handleStartTask = (taskId, taskTitle) => {
    toast.success(`Started task: ${taskTitle}`);
    // Here you would typically start a timer or update task status
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
    toast.info('Redirecting to Analytics dashboard');
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={color}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="caption" color="success.main">
                    {trend}
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar sx={{ backgroundColor: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {greeting}, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to continue your learning journey? Here's your progress overview.
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid item xs={12}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Tasks"
                value={stats.totalTasks.toString()}
                subtitle={`${todayTasks.length} due today`}
                icon={<Assignment />}
                color="primary.main"
                trend={stats.totalTasks > 0 ? `${stats.totalTasks} total` : "No tasks yet"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completed"
                value={stats.completedTasks.toString()}
                subtitle={stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion` : "0% completion"}
                icon={<CheckCircle />}
                color="success.main"
                trend={stats.completedTasks > 0 ? `${stats.completedTasks} completed` : "Start completing tasks!"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Study Hours"
                value={stats.studyHours.toString()}
                subtitle="This week"
                icon={<Timer />}
                color="info.main"
                trend={stats.studyHours > 0 ? `${stats.studyHours} hours logged` : "Start tracking time!"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Streak"
                value={stats.streak.toString()}
                subtitle="Days active"
                icon={<EmojiEvents />}
                color="warning.main"
                trend={stats.streak > 0 ? `${stats.streak} day streak!` : "Start your streak!"}
              />
            </Grid>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={3}>
        {/* Study Progress Chart */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="600">
                    Weekly Study Progress
                  </Typography>
                  <Button startIcon={<Analytics />} size="small">
                    View Details
                  </Button>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={studyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Subject Distribution */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Subject Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {subjectData.map((subject) => (
                    <Box key={subject.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: subject.color,
                          borderRadius: '50%',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {subject.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subject.value}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Today's Tasks */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="600">
                    Today's Tasks
                  </Typography>
                  <Button startIcon={<Add />} size="small" onClick={handleAddTask}>
                    Add Task
                  </Button>
                </Box>
                <List>
                  {todayTasks.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary="No tasks for today"
                        secondary="Click 'Add Task' to create your first task"
                      />
                    </ListItem>
                  ) : (
                    todayTasks.map((task, index) => (
                      <React.Fragment key={task._id}>
                        <ListItem
                          sx={{
                            px: 0,
                            '&:hover': { backgroundColor: 'action.hover' },
                            borderRadius: 1,
                          }}
                        >
                          <ListItemIcon>
                            <IconButton 
                              size="small" 
                              onClick={() => handleStartTask(task._id, task.title)}
                              color="primary"
                            >
                              <PlayArrow />
                            </IconButton>
                          </ListItemIcon>
                          <ListItemText
                            primary={task.title}
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={task.subject || 'General'}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Due: {task.scheduledTime?.start || 'No time set'}
                                </Typography>
                              </Box>
                            }
                          />
                          <Chip
                            label={task.priority || 'medium'}
                            size="small"
                            color={
                              task.priority === 'high' ? 'error' :
                              task.priority === 'medium' ? 'warning' : 'default'
                            }
                          />
                        </ListItem>
                        {index < todayTasks.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="600">
                    Upcoming Events
                  </Typography>
                  <Button startIcon={<CalendarToday />} size="small" onClick={handleViewCalendar}>
                    View Calendar
                  </Button>
                </Box>
                <List>
                  {upcomingEvents.length === 0 ? (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="No upcoming events"
                        secondary="Your upcoming tasks will appear here"
                      />
                    </ListItem>
                  ) : (
                    upcomingEvents.map((event, index) => (
                      <React.Fragment key={event.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: event.type === 'exam' ? 'error.main' :
                                  event.type === 'study' ? 'primary.main' : 'success.main',
                              }}
                            >
                              {event.type === 'exam' ? <Assignment /> :
                               event.type === 'study' ? <School /> : <Schedule />}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={event.title}
                            secondary={`${event.date} at ${event.time}`}
                          />
                        </ListItem>
                        {index < upcomingEvents.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
