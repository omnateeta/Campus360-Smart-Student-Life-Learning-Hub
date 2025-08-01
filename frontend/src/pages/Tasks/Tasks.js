import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { tasksService } from '../../services/studyPlansService';
import { useApi, useMutation } from '../../hooks/useApi';

const Tasks = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    subject: 'all',
  });
  const [showDebug, setShowDebug] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    type: 'assignment',
    priority: 'medium',
    difficulty: 'easy',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: {
      start: '09:00',
      end: '10:00'
    },
    estimatedDuration: 60
  });

  // API hooks for data fetching and mutations
  const { data: tasksData, loading, error, refetch } = useApi(() => 
    tasksService.getTasks(filters), [filters]
  );
  const { mutate: createTask, loading: creating } = useMutation(tasksService.createTask);

  // Extract tasks from API response
  const tasks = tasksData?.tasks || [];
  
  // Authentication debugging (FIRST PRIORITY)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('🔥 === AUTHENTICATION STATUS ===');
    console.log('🎫 Token exists:', !!token);
    console.log('🎫 Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
    console.log('👤 User logged in:', !!user);
    console.log('👤 User data:', user ? JSON.parse(user) : 'NO USER DATA');
    console.log('🔥 ===============================');
  }, []);
  
  // Debug logging (always enabled for debugging task display issue)
  useEffect(() => {
    console.log('🔍 === TASKS DEBUG INFO ===');
    console.log('📊 Raw API Response:', tasksData);
    console.log('📋 Extracted tasks:', tasks);
    console.log('🔢 Tasks length:', tasks.length);
    console.log('🔍 Current filters:', filters);
    console.log('⏳ Loading state:', loading);
    console.log('❌ Error state:', error);
    console.log('🐛 Show debug:', showDebug);
    
    // Check if tasksData has the expected structure
    if (tasksData) {
      console.log('📁 tasksData structure:');
      console.log('  - tasksData.tasks:', tasksData.tasks);
      console.log('  - tasksData.tasks length:', tasksData.tasks?.length);
      console.log('  - tasksData.total:', tasksData.total);
      console.log('  - tasksData.totalPages:', tasksData.totalPages);
      console.log('  - tasksData.currentPage:', tasksData.currentPage);
    } else {
      console.log('❌ tasksData is null/undefined');
    }
    
    if (tasks.length > 0) {
      console.log('📝 Sample task structure:', tasks[0]);
      console.log('📋 All task details:', tasks.map(t => ({
        id: t._id,
        title: t.title,
        scheduledDate: t.scheduledDate,
        status: t.status,
        subject: t.subject,
        createdAt: t.createdAt,
        user: t.user
      })));
    } else {
      console.log('📭 No tasks found in array');
    }
    console.log('🔍 ========================');
  }, [tasksData, tasks, filters, loading, error, showDebug]);

  const createTestTask = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== CREATE TEST TASK CLICKED ===');
    console.log('Button clicked, starting task creation...');
    
    try {
      const testTask = {
        title: 'Test Task - ' + new Date().toLocaleTimeString(),
        description: 'This is a test task created for debugging',
        subject: 'Testing',
        topic: 'API Debug',
        type: 'assignment',
        priority: 'medium',
        difficulty: 'easy',
        scheduledDate: new Date().toISOString(),
        scheduledTime: {
          start: '10:00',
          end: '10:30'
        },
        estimatedDuration: 30
      };
      
      console.log('Task data prepared:', testTask);
      console.log('Calling createTask mutation...');
      
      const result = await createTask(testTask);
      console.log('✅ Task creation successful!');
      console.log('Task creation result:', result);
      
      // Always show success message in debug mode
      toast.success('✅ Test task created successfully!');
      
      // Force refetch of tasks
      console.log('Triggering refetch in 500ms...');
      setTimeout(async () => {
        try {
          console.log('Refetching tasks...');
          const refetchResult = await refetch();
          console.log('✅ Refetch successful!');
          console.log('Refetch result:', refetchResult);
          console.log('Tasks after refetch:', refetchResult?.data?.tasks?.length || 0);
          
          if (refetchResult?.data?.tasks?.length > 0) {
            console.log('✅ Tasks found after refetch:', refetchResult.data.tasks.length);
          } else {
            console.log('⚠️ No tasks found after refetch');
          }
        } catch (refetchError) {
          console.error('❌ Refetch error:', refetchError);
          toast.error('Failed to refresh task list');
        }
      }, 500);
      
    } catch (err) {
      console.error('❌ CREATE TASK ERROR:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Always show error message
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create task';
      toast.error(`❌ ${errorMessage}`);
      
      // Additional debugging info
      if (err.response?.status === 401) {
        console.error('❌ Authentication error - user might not be logged in');
        toast.error('Authentication required. Please log in.');
      } else if (err.response?.status === 403) {
        console.error('❌ Permission error - user might not have access');
        toast.error('Permission denied. Check your access rights.');
      } else if (err.response?.status >= 500) {
        console.error('❌ Server error - backend might be down');
        toast.error('Server error. Please try again later.');
      }
    }
    
    console.log('=== CREATE TEST TASK COMPLETED ===');
  };

  // Handle opening create task modal
  const handleCreateTask = () => {
    setCreateModalOpen(true);
  };

  // Handle closing create task modal
  const handleCloseModal = () => {
    setCreateModalOpen(false);
    // Reset form
    setNewTask({
      title: '',
      description: '',
      subject: '',
      topic: '',
      type: 'assignment',
      priority: 'medium',
      difficulty: 'easy',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: {
        start: '09:00',
        end: '10:00'
      },
      estimatedDuration: 60
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewTask(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewTask(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmitTask = async () => {
    try {
      console.log('📝 Creating new task with form data:', newTask);
      
      // Validate required fields
      if (!newTask.title.trim()) {
        toast.error('Task title is required');
        return;
      }
      if (!newTask.subject.trim()) {
        toast.error('Subject is required');
        return;
      }
      if (!newTask.topic.trim()) {
        toast.error('Topic is required');
        return;
      }
      
      // Prepare task data with proper formatting
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        subject: newTask.subject.trim(),
        topic: newTask.topic.trim(),
        type: newTask.type,
        priority: newTask.priority,
        difficulty: newTask.difficulty,
        scheduledDate: new Date(newTask.scheduledDate).toISOString(),
        scheduledTime: {
          start: newTask.scheduledTime.start,
          end: newTask.scheduledTime.end
        },
        estimatedDuration: Number(newTask.estimatedDuration)
      };
      
      console.log('📤 Sending task data to backend:', taskData);
      
      const result = await createTask(taskData);
      console.log('✅ Task created successfully:', result);
      
      toast.success('✅ Task created successfully!');
      handleCloseModal();
      
      // Refetch tasks
      setTimeout(async () => {
        try {
          await refetch();
          console.log('✅ Tasks refreshed after creation');
        } catch (refetchError) {
          console.error('❌ Refetch error:', refetchError);
        }
      }, 500);
      
    } catch (err) {
      console.error('❌ Create task error:', err);
      console.error('❌ Error details:', err.response?.data);
      
      // Show specific validation errors if available
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors.map(e => e.msg).join(', ');
        toast.error(`❌ Validation errors: ${validationErrors}`);
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create task';
        toast.error(`❌ ${errorMessage}`);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Tasks
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your study tasks and assignments.
      </Typography>

      {/* Main Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTask}
          size="large"
        >
          Create New Task
        </Button>
        
        <Button
          variant="outlined"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDebug(!showDebug);
          }}
          size="small"
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </Button>
      </Box>

      {/* Debug Info - Only show when enabled */}
      {showDebug && (
        <Card sx={{ mb: 3, bgcolor: 'info.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Debug Information</Typography>
            <Typography variant="body2">
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}<br/>
              <strong>Error:</strong> {error || 'None'}<br/>
              <strong>Tasks Found:</strong> {tasks.length}<br/>
              <strong>API Response:</strong> {tasksData ? 'Present' : 'Missing'}<br/>
              <strong>Debug Mode:</strong> {showDebug ? 'Enabled' : 'Disabled'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Create Test Task Button - Only show in debug mode */}
      {showDebug && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={createTestTask}
            disabled={creating}
            size="large"
          >
            {creating ? 'Creating...' : 'Create Test Task'}
          </Button>
        </Box>
      )}

      {/* Tasks Display */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading tasks: {error}
        </Alert>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            Tasks ({tasks.length})
          </Typography>
          
          {tasks.length === 0 ? (
            <Alert severity="info">
              No tasks found. Click "Create Test Task" to create one!
            </Alert>
          ) : (
            <Box>
              {tasks.map((task) => (
                <Card key={task._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subject: {task.subject} | Status: {task.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled: {new Date(task.scheduledDate).toLocaleDateString()}
                    </Typography>
                    {task.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {task.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}
      
      {/* Task Creation Modal */}
      <Dialog 
        open={createModalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={newTask.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>
            
            {/* Subject and Topic */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Subject"
                value={newTask.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Topic"
                value={newTask.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
              />
            </Grid>
            
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newTask.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            
            {/* Type, Priority, Difficulty */}
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTask.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="assignment">Assignment</MenuItem>
                  <MenuItem value="quiz">Quiz</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="reading">Reading</MenuItem>
                  <MenuItem value="practice">Practice</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={newTask.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  label="Difficulty"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Scheduled Date */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scheduled Date"
                type="date"
                value={newTask.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Scheduled Time */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={newTask.scheduledTime.start}
                onChange={(e) => handleInputChange('scheduledTime.start', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={newTask.scheduledTime.end}
                onChange={(e) => handleInputChange('scheduledTime.end', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Estimated Duration */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
                type="number"
                value={newTask.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 0)}
                inputProps={{ min: 1, max: 480 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button 
            onClick={handleSubmitTask} 
            variant="contained"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
