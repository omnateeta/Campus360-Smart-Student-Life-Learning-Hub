import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  MoreVert,
  School,
  CalendarToday,
  Timer,
  TrendingUp,
  Edit,
  Delete,
  Visibility,
  AutoAwesome,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { studyPlansService } from '../../services/studyPlansService';
import { toast } from 'react-toastify';

// Mock data for study plans
const mockStudyPlans = [
  {
    id: 1,
    title: 'Advanced Mathematics',
    subject: 'Mathematics',
    description: 'Comprehensive study plan for calculus and linear algebra',
    examDate: new Date('2024-03-15'),
    totalHours: 120,
    dailyHours: 4,
    progress: 65,
    status: 'active',
    difficulty: 'hard',
    aiGenerated: true,
    syllabus: [
      { topic: 'Differential Calculus', completed: true },
      { topic: 'Integral Calculus', completed: true },
      { topic: 'Linear Algebra', completed: false },
      { topic: 'Differential Equations', completed: false },
    ],
  },
  {
    id: 2,
    title: 'Physics Fundamentals',
    subject: 'Physics',
    description: 'Complete physics preparation for entrance exams',
    examDate: new Date('2024-04-20'),
    totalHours: 80,
    dailyHours: 3,
    progress: 40,
    status: 'active',
    difficulty: 'medium',
    aiGenerated: false,
    syllabus: [
      { topic: 'Mechanics', completed: true },
      { topic: 'Thermodynamics', completed: false },
      { topic: 'Electromagnetism', completed: false },
      { topic: 'Optics', completed: false },
    ],
  },
  {
    id: 3,
    title: 'Organic Chemistry',
    subject: 'Chemistry',
    description: 'Detailed study of organic compounds and reactions',
    examDate: new Date('2024-02-28'),
    totalHours: 60,
    dailyHours: 2,
    progress: 90,
    status: 'completed',
    difficulty: 'medium',
    aiGenerated: true,
    syllabus: [
      { topic: 'Hydrocarbons', completed: true },
      { topic: 'Alcohols and Ethers', completed: true },
      { topic: 'Carbonyl Compounds', completed: true },
      { topic: 'Biomolecules', completed: true },
    ],
  },
];

const StudyPlans = () => {
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Fetch study plans from API
  const fetchStudyPlans = async () => {
    try {
      setLoading(true);
      const response = await studyPlansService.getStudyPlans();
      setStudyPlans(response.studyPlans || []);
    } catch (error) {
      console.error('Error fetching study plans:', error);
      toast.error('Failed to load study plans');
      setStudyPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Load study plans on component mount
  useEffect(() => {
    fetchStudyPlans();
  }, []);

  const handleMenuOpen = (event, plan) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlan(null);
  };

  const handleView = () => {
    navigate(`/study-plans/${selectedPlan._id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    // Navigate to edit page
    console.log('Edit plan:', selectedPlan.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await studyPlansService.deleteStudyPlan(selectedPlan._id);
      toast.success('Study plan deleted successfully');
      // Refresh the study plans list
      await fetchStudyPlans();
    } catch (error) {
      console.error('Error deleting study plan:', error);
      toast.error('Failed to delete study plan');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDaysRemaining = (examDate) => {
    const days = differenceInDays(new Date(examDate), new Date());
    return Math.max(0, days);
  };

  const filteredPlans = studyPlans.filter(plan => {
    if (filterStatus === 'all') return true;
    return plan.status === filterStatus;
  });

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const StudyPlanCard = ({ plan }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3,
          }
        }}
        onClick={() => navigate(`/study-plans/${plan._id}`)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight="600" sx={{ flex: 1 }}>
                  {plan.title}
                </Typography>
                {plan.aiGenerated && (
                  <AutoAwesome sx={{ color: 'primary.main', ml: 1 }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {plan.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={plan.subject} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  label={plan.status} 
                  size="small" 
                  color={getStatusColor(plan.status)}
                />
                <Chip 
                  label={plan.difficulty} 
                  size="small" 
                  sx={{ 
                    backgroundColor: getDifficultyColor(plan.difficulty),
                    color: 'white'
                  }}
                />
              </Box>
            </Box>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, plan);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {plan.progress?.percentageComplete || 0}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={plan.progress?.percentageComplete || 0} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Stats */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <CalendarToday sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">
                  {getDaysRemaining(plan.examDate)} days left
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Timer sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">
                  {plan.totalHours}h total
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <School sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">
                  {plan.syllabus ? `${plan.syllabus.filter(s => s.completed).length}/${plan.syllabus.length}` : '0/0'} topics
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Exam Date */}
          <Box sx={{ mt: 2, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Exam Date: {format(new Date(plan.examDate), 'MMM dd, yyyy')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Study Plans
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your AI-powered study plans and track your progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/study-plans/create')}
          size="large"
        >
          Create Plan
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Study Plans Grid */}
      {filteredPlans.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No study plans found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first AI-powered study plan to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/study-plans/create')}
          >
            Create Your First Plan
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPlans.map((plan) => (
            <Grid item xs={12} md={6} lg={4} key={plan._id}>
              <StudyPlanCard plan={plan} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => navigate('/study-plans/create')}
      >
        <Add />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 2 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 2 }} />
          Edit Plan
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 2 }} />
          Delete Plan
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Study Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedPlan?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyPlans;
