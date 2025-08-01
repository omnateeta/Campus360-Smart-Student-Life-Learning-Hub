import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { tasksService } from '../../services/studyPlansService';

const TasksDebug = () => {
  const { user, token } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication status
    const tokenFromStorage = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user');
    
    setDebugInfo({
      authContextUser: user,
      authContextToken: token,
      localStorageToken: tokenFromStorage,
      localStorageUser: userFromStorage ? JSON.parse(userFromStorage) : null,
      isAuthenticated: !!tokenFromStorage && !!user
    });
  }, [user, token]);

  const testTasksAPI = async () => {
    try {
      setError(null);
      console.log('Testing tasks API...');
      
      const response = await tasksService.getTasks();
      console.log('Tasks API Response:', response);
      setApiResponse(response);
    } catch (err) {
      console.error('Tasks API Error:', err);
      setError(err.message);
    }
  };

  const createTestTask = async () => {
    try {
      setError(null);
      console.log('Creating test task...');
      
      const testTask = {
        title: 'Debug Test Task',
        description: 'This is a test task created for debugging',
        subject: 'Testing',
        topic: 'API Debug',
        type: 'assignment',
        priority: 'medium',
        difficulty: 'easy',
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 30,
        scheduledTime: {
          start: '10:00',
          end: '10:30'
        }
      };
      
      const response = await tasksService.createTask(testTask);
      console.log('Create Task Response:', response);
      setApiResponse(response);
      
      // Refetch tasks after creation
      setTimeout(() => testTasksAPI(), 500);
    } catch (err) {
      console.error('Create Task Error:', err);
      setError(err.message);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Tasks Debug Panel
      </Typography>
      
      {/* Authentication Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Authentication Status</Typography>
          <Typography variant="body2">
            <strong>Auth Context User:</strong> {debugInfo.authContextUser ? 'Present' : 'Missing'}
          </Typography>
          <Typography variant="body2">
            <strong>Auth Context Token:</strong> {debugInfo.authContextToken ? 'Present' : 'Missing'}
          </Typography>
          <Typography variant="body2">
            <strong>LocalStorage Token:</strong> {debugInfo.localStorageToken ? 'Present' : 'Missing'}
          </Typography>
          <Typography variant="body2">
            <strong>LocalStorage User:</strong> {debugInfo.localStorageUser ? 'Present' : 'Missing'}
          </Typography>
          <Typography variant="body2">
            <strong>Is Authenticated:</strong> {debugInfo.isAuthenticated ? 'Yes' : 'No'}
          </Typography>
          
          {debugInfo.localStorageUser && (
            <Typography variant="body2">
              <strong>User Email:</strong> {debugInfo.localStorageUser.email}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>API Testing</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" onClick={testTasksAPI}>
              Test Get Tasks
            </Button>
            <Button variant="contained" color="secondary" onClick={createTestTask}>
              Create Test Task
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Error:</strong> {error}
            </Alert>
          )}
          
          {apiResponse && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>API Response:</Typography>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TasksDebug;
