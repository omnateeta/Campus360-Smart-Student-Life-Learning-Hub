import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  Add,
  Remove,
  CalendarToday,
  Timer,
  School,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';
import { addDays, differenceInDays } from 'date-fns';
import { studyPlansService } from '../../services/studyPlansService';
import { toast } from 'react-toastify';

const steps = ['Basic Information', 'Study Details', 'AI Generation', 'Review & Create'];

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'History', 'Geography', 'Computer Science', 'Economics', 'Psychology'
];

const difficulties = [
  { value: 'easy', label: 'Easy', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', color: '#ef4444' },
];

const CreateStudyPlan = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    examDate: addDays(new Date(), 30),
    totalHours: 40,
    dailyHours: 2,
    difficulty: 'medium',
    topics: [''],
    useAI: true,
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...formData.topics];
    newTopics[index] = value;
    setFormData(prev => ({
      ...prev,
      topics: newTopics
    }));
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  const removeTopic = (index) => {
    if (formData.topics.length > 1) {
      const newTopics = formData.topics.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        topics: newTopics
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.subject) newErrors.subject = 'Subject is required';
        if (!formData.examDate) newErrors.examDate = 'Exam date is required';
        break;
      case 1:
        if (formData.totalHours < 1) newErrors.totalHours = 'Total hours must be at least 1';
        if (formData.dailyHours < 0.5) newErrors.dailyHours = 'Daily hours must be at least 0.5';
        if (formData.topics.filter(t => t.trim()).length === 0) {
          newErrors.topics = 'At least one topic is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;

    if (activeStep === 1 && formData.useAI) {
      // Generate AI plan
      await generateAIPlan();
    }
    
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const generateAIPlan = async () => {
    setAiGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const daysUntilExam = differenceInDays(new Date(formData.examDate), new Date());
      const validTopics = formData.topics.filter(t => t.trim());
      
      const mockGeneratedPlan = {
        syllabus: validTopics.map((topic, index) => ({
          topic: topic.trim(),
          subtopics: [`${topic} Basics`, `${topic} Advanced`, `${topic} Practice`],
          estimatedHours: Math.floor(formData.totalHours / validTopics.length),
          difficulty: formData.difficulty,
          priority: Math.floor(Math.random() * 10) + 1,
        })),
        weeklyGoals: Array.from({ length: Math.ceil(daysUntilExam / 7) }, (_, i) => ({
          weekNumber: i + 1,
          startDate: addDays(new Date(), i * 7),
          endDate: addDays(new Date(), (i + 1) * 7 - 1),
          targetHours: formData.dailyHours * 7,
          topics: validTopics.slice(0, 2).map(topic => ({
            topic: topic,
            hours: Math.floor(formData.dailyHours * 7 / 2),
            completed: false
          })),
          actualHours: 0,
          completed: false
        })),
        milestones: [
          {
            title: '25% Complete',
            targetDate: addDays(new Date(), Math.floor(daysUntilExam * 0.25)),
            targetPercentage: 25,
          },
          {
            title: '50% Complete',
            targetDate: addDays(new Date(), Math.floor(daysUntilExam * 0.5)),
            targetPercentage: 50,
          },
          {
            title: '75% Complete',
            targetDate: addDays(new Date(), Math.floor(daysUntilExam * 0.75)),
            targetPercentage: 75,
          },
        ],
        aiInsights: [
          {
            type: 'recommendation',
            message: 'Focus on fundamentals in the first two weeks',
            priority: 'high',
          },
          {
            type: 'tip',
            message: 'Schedule regular review sessions to reinforce learning',
            priority: 'medium',
          },
        ],
      };
      
      setGeneratedPlan(mockGeneratedPlan);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare data for API
      const validTopics = formData.topics.filter(topic => topic.trim() !== '');
      
      // Convert topics to syllabus format expected by backend
      const syllabus = validTopics.map((topic, index) => ({
        topic: topic.trim(),
        subtopics: [],
        estimatedHours: Math.ceil(formData.totalHours / validTopics.length),
        difficulty: formData.difficulty,
        priority: 5,
        completed: false
      }));

      const planData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        subject: formData.subject,
        examDate: formData.examDate instanceof Date ? formData.examDate.toISOString() : formData.examDate,
        totalHours: Number(formData.totalHours),
        dailyHours: Number(formData.dailyHours),
        difficulty: formData.difficulty,
        syllabus: syllabus,
        aiGenerated: formData.useAI,
        status: 'active'
      };

      // If AI plan was generated, include it (override syllabus)
      if (generatedPlan && generatedPlan.syllabus) {
        planData.syllabus = generatedPlan.syllabus;
        
        // Skip weeklyGoals for now to avoid validation issues
        // TODO: Fix weeklyGoals structure later
        
        // Only include aiInsights if properly structured
        if (generatedPlan.insights && Array.isArray(generatedPlan.insights)) {
          planData.aiInsights = generatedPlan.insights;
        }
      }

      // Debug: Log the data being sent
      console.log('Creating study plan with data:', planData);
      console.log('Auth token exists:', !!localStorage.getItem('token'));
      
      // Save to backend
      const response = await studyPlansService.createStudyPlan(planData);
      
      console.log('Study plan created successfully:', response);
      toast.success('Study plan created successfully!');
      
      // Navigate to the new study plan or back to list
      navigate('/study-plans');
    } catch (error) {
      console.error('Failed to create study plan - Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Show more specific error message if available
      const errorMessage = error.message || 'Failed to create study plan. Please try again.';
      toast.error(errorMessage);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        toast.error('Please log in again to create study plans.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Study Plan Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="e.g., Advanced Mathematics Preparation"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={3}
                placeholder="Brief description of your study goals..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.subject}>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subject}
                  label="Subject"
                  onChange={(e) => handleChange('subject', e.target.value)}
                >
                  {subjects.map(subject => (
                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Exam Date"
                  value={formData.examDate}
                  onChange={(date) => handleChange('examDate', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.examDate}
                      helperText={errors.examDate}
                    />
                  )}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Study Hours"
                type="number"
                value={formData.totalHours}
                onChange={(e) => handleChange('totalHours', parseInt(e.target.value) || 0)}
                error={!!errors.totalHours}
                helperText={errors.totalHours}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Daily Study Hours"
                type="number"
                value={formData.dailyHours}
                onChange={(e) => handleChange('dailyHours', parseFloat(e.target.value) || 0)}
                error={!!errors.dailyHours}
                helperText={errors.dailyHours}
                InputProps={{ inputProps: { min: 0.5, step: 0.5 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={formData.difficulty}
                  label="Difficulty Level"
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                >
                  {difficulties.map(diff => (
                    <MenuItem key={diff.value} value={diff.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: diff.color,
                            borderRadius: '50%',
                            mr: 1,
                          }}
                        />
                        {diff.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Topics to Cover
              </Typography>
              {formData.topics.map((topic, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Topic ${index + 1}`}
                    value={topic}
                    onChange={(e) => handleTopicChange(index, e.target.value)}
                    placeholder="e.g., Calculus, Algebra"
                  />
                  <IconButton
                    onClick={() => removeTopic(index)}
                    disabled={formData.topics.length === 1}
                    sx={{ ml: 1 }}
                  >
                    <Remove />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={addTopic}
                variant="outlined"
                size="small"
              >
                Add Topic
              </Button>
              {errors.topics && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {errors.topics}
                </Typography>
              )}
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {aiGenerating ? (
              <Box>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  AI is generating your personalized study plan...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This may take a few moments. Please wait.
                </Typography>
              </Box>
            ) : generatedPlan ? (
              <Box>
                <AutoAwesome sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Your AI-Powered Study Plan is Ready!
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  AI has analyzed your requirements and created an optimized study plan.
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Generated {generatedPlan.syllabus.length} topics, {generatedPlan.weeklyGoals.length} weekly goals, 
                  and {generatedPlan.milestones.length} milestones
                </Alert>
              </Box>
            ) : (
              <Box>
                <School sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Manual Study Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You've chosen to create a manual study plan. You can customize it after creation.
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Study Plan
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Basic Information
                    </Typography>
                    <Typography variant="body1" fontWeight="600">{formData.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{formData.subject}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Exam: {formData.examDate?.toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Study Details
                    </Typography>
                    <Typography variant="body2">
                      Total Hours: {formData.totalHours}h
                    </Typography>
                    <Typography variant="body2">
                      Daily Hours: {formData.dailyHours}h
                    </Typography>
                    <Typography variant="body2">
                      Difficulty: {formData.difficulty}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Topics
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.topics.filter(t => t.trim()).map((topic, index) => (
                        <Chip key={index} label={topic} variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/study-plans')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Create Study Plan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Let AI help you create a personalized study plan
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <School />}
            >
              {loading ? 'Creating...' : 'Create Study Plan'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={aiGenerating}
            >
              {activeStep === 1 && formData.useAI ? 'Generate with AI' : 'Next'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateStudyPlan;
