import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
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
  Paper,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Schedule,
  Assignment,
  CheckCircle,
  Timer,
  School,
  CalendarToday,
  BarChart,
  PieChart,
  Timeline,
  Download,
  Share,
  Refresh,
  Star,
  EmojiEvents,
  Whatshot,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { analyticsService } from '../../services/analyticsService';
import { toast } from 'react-toastify';
import { CircularProgress } from '@mui/material';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [studyTimeData, setStudyTimeData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard analytics
      const dashboardResponse = await analyticsService.getDashboardAnalytics();
      setDashboardData(dashboardResponse.analytics);
      
      // Fetch study time analytics
      const studyTimeResponse = await analyticsService.getStudyTimeAnalytics(timeRange);
      setStudyTimeData(studyTimeResponse.timeAnalytics);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state
  if (error || !dashboardData) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="400px" justifyContent="center">
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'No analytics data available'}
        </Typography>
        <Button onClick={fetchAnalyticsData} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  // Calculate summary stats from real data
  const totalStudyHours = studyTimeData ? (studyTimeData.totalStudyTime / 60) : 0; // Convert minutes to hours
  const totalSessions = studyTimeData ? studyTimeData.totalSessions : 0;
  const averageSessionLength = studyTimeData ? studyTimeData.averageSessionTime : 0; // already in minutes
  const currentStreak = dashboardData.overview.currentStreak || 0;
  
  // Transform daily activity data for charts
  const chartData = dashboardData.dailyActivity.map(day => ({
    date: format(new Date(day.date), 'MMM dd'),
    hours: (day.studyTime / 60), // Convert minutes to hours
    sessions: day.tasksCompleted
  }));
  
  // Transform subject data for charts
  const subjectData = dashboardData.subjectProgress.map((subject, index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
    return {
      name: subject._id,
      hours: (subject.totalTime / 60), // Convert minutes to hours
      sessions: subject.taskCount,
      completion: Math.round((subject.taskCount / (dashboardData.overview.totalTasks || 1)) * 100),
      color: colors[index % colors.length]
    };
  });
  
  // Mock productivity data (this would need a separate endpoint)
  const productivityData = [
    { time: '06:00', productivity: 65, focus: 70 },
    { time: '08:00', productivity: 85, focus: 90 },
    { time: '10:00', productivity: 95, focus: 95 },
    { time: '12:00', productivity: 75, focus: 80 },
    { time: '14:00', productivity: 80, focus: 85 },
    { time: '16:00', productivity: 90, focus: 88 },
    { time: '18:00', productivity: 70, focus: 75 },
    { time: '20:00', productivity: 60, focus: 65 },
    { time: '22:00', productivity: 45, focus: 50 },
  ];
  
  // Mock goals data (this would need a separate endpoint)
  const goalsData = [
    {
      id: 1,
      title: 'Complete Active Study Plans',
      progress: dashboardData.overview.completedStudyPlans,
      target: dashboardData.overview.activeStudyPlans + dashboardData.overview.completedStudyPlans,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'on-track',
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ahead': return 'success';
      case 'on-track': return 'info';
      case 'behind': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color={color}>
                {value}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
            <Avatar sx={{ backgroundColor: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              {trend > 0 ? (
                <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
              ) : (
                <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
              )}
              <Typography
                variant="body2"
                color={trend > 0 ? 'success.main' : 'error.main'}
              >
                {Math.abs(trend)}% from last week
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your study progress and performance insights
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAnalyticsData}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Study Hours"
            value={`${totalStudyHours.toFixed(1)}h`}
            subtitle="This week"
            icon={<Schedule />}
            color="primary.main"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Study Sessions"
            value={totalSessions}
            subtitle="Completed sessions"
            icon={<Timer />}
            color="success.main"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Session"
            value={`${averageSessionLength.toFixed(0)}min`}
            subtitle="Session length"
            icon={<BarChart />}
            color="warning.main"
            trend={-3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current Streak"
            value={`${currentStreak} days`}
            subtitle="Study streak"
            icon={<Whatshot />}
            color="error.main"
            trend={15}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Study Time" />
          <Tab label="Subject Analysis" />
          <Tab label="Productivity" />
          <Tab label="Goals & Progress" />
        </Tabs>
      </Card>

      {/* Study Time Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Study Hours
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM dd')} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => format(new Date(date), 'EEEE, MMM dd')}
                      formatter={(value) => [`${value}h`, 'Study Hours']}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weekly Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Hours</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {totalStudyHours.toFixed(1)}h
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Daily Average</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {(totalStudyHours / 7).toFixed(1)}h
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Best Day</Typography>
                    <Typography variant="body2" fontWeight="600">
                      5.1h (Thu)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Sessions</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {totalSessions}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Subject Analysis Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Study Time by Subject
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="hours"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}h`, 'Study Hours']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subject Performance
                </Typography>
                <List>
                  {subjectData.map((subject) => (
                    <ListItem key={subject.name} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ backgroundColor: subject.color, width: 32, height: 32 }}>
                          <School />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" fontWeight="600">
                              {subject.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {subject.hours}h • {subject.sessions} sessions
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <LinearProgress
                              variant="determinate"
                              value={subject.completion}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: subject.color,
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {subject.completion}% complete
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Productivity Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Productivity by Time of Day
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="productivity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="focus"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Peak Performance Hours
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Most Productive</Typography>
                    <Chip label="10:00 AM" color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Best Focus</Typography>
                    <Chip label="10:00 AM" color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Least Productive</Typography>
                    <Chip label="10:00 PM" color="error" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Study Habits
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Average Session</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {averageSessionLength.toFixed(0)} minutes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Break Frequency</Typography>
                    <Typography variant="body2" fontWeight="600">
                      Every 25 minutes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Preferred Time</Typography>
                    <Typography variant="body2" fontWeight="600">
                      Morning (8-12 PM)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Goals & Progress Tab */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Goals
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Goal</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Deadline</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {goalsData.map((goal) => (
                        <TableRow key={goal.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {goal.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={goal.progress}
                                sx={{ flex: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="body2">
                                {goal.progress}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(goal.deadline, 'MMM dd, yyyy')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={goal.status}
                              color={getStatusColor(goal.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Analytics;
