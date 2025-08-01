import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  PlayArrow,
  CheckCircle,
  Schedule,
  TrendingUp,
  AutoAwesome,
  Assignment,
  CalendarToday,
  Timer,
  School,
  Warning,
  Info,
  Lightbulb,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { studyPlansService } from '../../services/studyPlansService';
import { toast } from 'react-toastify';

// Mock data for detailed study plan
const mockStudyPlan = {
  id: 1,
  title: 'Advanced Mathematics',
  subject: 'Mathematics',
  description: 'Comprehensive study plan for calculus and linear algebra preparation',
  examDate: new Date('2024-03-15'),
  totalHours: 120,
  dailyHours: 4,
  difficulty: 'hard',
  status: 'active',
  progress: 65,
  aiGenerated: true,
  createdAt: new Date('2024-01-15'),
  
  syllabus: [
    {
      topic: 'Differential Calculus',
      subtopics: ['Limits', 'Derivatives', 'Applications of Derivatives'],
      estimatedHours: 30,
      difficulty: 'medium',
      priority: 8,
      completed: true,
      completedAt: new Date('2024-02-01'),
    },
    {
      topic: 'Integral Calculus',
      subtopics: ['Integration Techniques', 'Definite Integrals', 'Applications'],
      estimatedHours: 35,
      difficulty: 'hard',
      priority: 9,
      completed: true,
      completedAt: new Date('2024-02-15'),
    },
    {
      topic: 'Linear Algebra',
      subtopics: ['Matrices', 'Determinants', 'Vector Spaces', 'Eigenvalues'],
      estimatedHours: 30,
      difficulty: 'hard',
      priority: 7,
      completed: false,
    },
    {
      topic: 'Differential Equations',
      subtopics: ['First Order', 'Second Order', 'Systems of Equations'],
      estimatedHours: 25,
      difficulty: 'hard',
      priority: 6,
      completed: false,
    },
  ],

  weeklyGoals: [
    {
      weekNumber: 1,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-21'),
      targetHours: 28,
      actualHours: 30,
      completed: true,
      topics: ['Differential Calculus'],
    },
    {
      weekNumber: 2,
      startDate: new Date('2024-01-22'),
      endDate: new Date('2024-01-28'),
      targetHours: 28,
      actualHours: 26,
      completed: true,
      topics: ['Differential Calculus', 'Integral Calculus'],
    },
    {
      weekNumber: 3,
      startDate: new Date('2024-01-29'),
      endDate: new Date('2024-02-04'),
      targetHours: 28,
      actualHours: 15,
      completed: false,
      topics: ['Integral Calculus'],
    },
  ],

  milestones: [
    {
      title: '25% Complete',
      targetDate: new Date('2024-02-01'),
      targetPercentage: 25,
      completed: true,
      completedAt: new Date('2024-01-30'),
    },
    {
      title: '50% Complete',
      targetDate: new Date('2024-02-15'),
      targetPercentage: 50,
      completed: true,
      completedAt: new Date('2024-02-14'),
    },
    {
      title: '75% Complete',
      targetDate: new Date('2024-03-01'),
      targetPercentage: 75,
      completed: false,
    },
  ],

  aiInsights: [
    {
      type: 'warning',
      message: 'You\'re slightly behind schedule. Consider increasing daily study time.',
      priority: 'high',
      createdAt: new Date('2024-02-10'),
    },
    {
      type: 'recommendation',
      message: 'Focus on Linear Algebra fundamentals before moving to advanced topics.',
      priority: 'medium',
      createdAt: new Date('2024-02-08'),
    },
    {
      type: 'tip',
      message: 'Practice problems are crucial for Differential Equations mastery.',
      priority: 'low',
      createdAt: new Date('2024-02-05'),
    },
  ],
};

const mockProgressData = [
  { week: 'Week 1', planned: 28, actual: 30 },
  { week: 'Week 2', planned: 28, actual: 26 },
  { week: 'Week 3', planned: 28, actual: 15 },
  { week: 'Week 4', planned: 28, actual: 0 },
];

const StudyPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch study plan data from API
  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        setLoading(true);
        const response = await studyPlansService.getStudyPlan(id);
        setStudyPlan(response.studyPlan);
        setError(null);
      } catch (error) {
        console.error('Error fetching study plan:', error);
        setError('Failed to load study plan');
        toast.error('Failed to load study plan');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudyPlan();
    }
  }, [id]);

  const handleTopicToggle = (topicIndex) => {
    const updatedSyllabus = [...studyPlan.syllabus];
    updatedSyllabus[topicIndex] = {
      ...updatedSyllabus[topicIndex],
      completed: !updatedSyllabus[topicIndex].completed,
      completedAt: !updatedSyllabus[topicIndex].completed ? new Date() : null,
    };
    
    setStudyPlan(prev => ({
      ...prev,
      syllabus: updatedSyllabus,
    }));
  };

  const getDaysRemaining = () => {
    return Math.max(0, differenceInDays(new Date(studyPlan.examDate), new Date()));
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return <Warning />;
      case 'recommendation': return <Lightbulb />;
      case 'tip': return <Info />;
      default: return <Info />;
    }
  };

  const getInsightSeverity = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'recommendation': return 'info';
      case 'tip': return 'success';
      default: return 'info';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (error || !studyPlan) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'Study plan not found'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/study-plans')}
          startIcon={<ArrowBack />}
        >
          Back to Study Plans
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/study-plans')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mr: 2 }}>
              {studyPlan.title}
            </Typography>
            {studyPlan.aiGenerated && (
              <Chip
                icon={<AutoAwesome />}
                label="AI Generated"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="body1" color="text.secondary">
            {studyPlan.description}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => navigate(`/study-plans/edit/${studyPlan._id}`)}
        >
          Edit Plan
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ backgroundColor: 'primary.main', mx: 'auto', mb: 1 }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {studyPlan.progress?.percentageComplete || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ backgroundColor: 'warning.main', mx: 'auto', mb: 1 }}>
                <CalendarToday />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {getDaysRemaining()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days Left
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ backgroundColor: 'success.main', mx: 'auto', mb: 1 }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {studyPlan.syllabus.filter(s => s.completed).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Topics Done
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ backgroundColor: 'info.main', mx: 'auto', mb: 1 }}>
                <Timer />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {studyPlan.totalHours}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Syllabus" />
            <Tab label="Progress" />
            <Tab label="Milestones" />
            <Tab label="AI Insights" />
          </Tabs>
        </Box>

        {/* Syllabus Tab */}
        <TabPanel value={activeTab} index={0}>
          <List>
            {studyPlan.syllabus.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 2,
                    backgroundColor: topic.completed ? 'success.light' : 'background.paper',
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={topic.completed}
                      onChange={() => handleTopicToggle(index)}
                      color="success"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            textDecoration: topic.completed ? 'line-through' : 'none',
                            opacity: topic.completed ? 0.7 : 1,
                          }}
                        >
                          {topic.topic}
                        </Typography>
                        <Chip
                          label={topic.difficulty}
                          size="small"
                          color={
                            topic.difficulty === 'easy' ? 'success' :
                            topic.difficulty === 'medium' ? 'warning' : 'error'
                          }
                        />
                        <Chip
                          label={`${topic.estimatedHours}h`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Subtopics: {topic.subtopics.join(', ')}
                        </Typography>
                        {topic.completed && topic.completedAt && (
                          <Typography variant="caption" color="success.main">
                            Completed on {format(new Date(topic.completedAt), 'MMM dd, yyyy')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <IconButton color="primary">
                    <PlayArrow />
                  </IconButton>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </TabPanel>

        {/* Progress Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Weekly Progress Tracking
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Planned Hours"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                name="Actual Hours"
              />
            </LineChart>
          </ResponsiveContainer>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Goals
            </Typography>
            {studyPlan.weeklyGoals && studyPlan.weeklyGoals.length > 0 ? studyPlan.weeklyGoals.map((week, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="600">
                      Week {week.weekNumber}
                    </Typography>
                    <Chip
                      label={week.completed ? 'Completed' : 'In Progress'}
                      color={week.completed ? 'success' : 'primary'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {format(new Date(week.startDate), 'MMM dd')} - {format(new Date(week.endDate), 'MMM dd')}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Progress: {week.actualHours}h / {week.targetHours}h
                      </Typography>
                      <Typography variant="body2">
                        {Math.round((week.actualHours / week.targetHours) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((week.actualHours / week.targetHours) * 100, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Topics: {week.topics && week.topics.length > 0 ? week.topics.join(', ') : 'No topics assigned'}
                  </Typography>
                </CardContent>
              </Card>
            )) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No weekly goals available yet.
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Milestones Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Study Milestones
          </Typography>
          {studyPlan.milestones && studyPlan.milestones.length > 0 ? studyPlan.milestones.map((milestone, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: milestone.completed ? 'success.main' : 'grey.300',
                      mr: 2,
                    }}
                  >
                    {milestone.completed ? <CheckCircle /> : <Schedule />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600">
                      {milestone.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target: {format(new Date(milestone.targetDate), 'MMM dd, yyyy')}
                    </Typography>
                    {milestone.completed && milestone.completedAt && (
                      <Typography variant="body2" color="success.main">
                        Completed: {format(new Date(milestone.completedAt), 'MMM dd, yyyy')}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={`${milestone.targetPercentage}%`}
                    color={milestone.completed ? 'success' : 'default'}
                  />
                </Box>
              </CardContent>
            </Card>
          )) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No milestones available yet.
            </Typography>
          )}
        </TabPanel>

        {/* AI Insights Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            AI-Powered Insights
          </Typography>
          {studyPlan.aiInsights && studyPlan.aiInsights.length > 0 ? studyPlan.aiInsights.map((insight, index) => (
            <Alert
              key={index}
              severity={getInsightSeverity(insight.type)}
              icon={getInsightIcon(insight.type)}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="body1" fontWeight="500">
                  {insight.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(insight.createdAt), 'MMM dd, yyyy')} • Priority: {insight.priority}
                </Typography>
              </Box>
            </Alert>
          )) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No AI insights available yet.
            </Typography>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};

export default StudyPlanDetail;
