import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { tasksService } from '../services/studyPlansService';

const AuthTest = () => {
  const { user, login } = useAuth();
  const [authStatus, setAuthStatus] = useState('');
  const [apiResult, setApiResult] = useState('');
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  useEffect(() => {
    checkAuthStatus();
  }, [user]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user');
    
    let status = 'Authentication Status:\n';
    status += `- Auth Context User: ${user ? 'Present' : 'Missing'}\n`;
    status += `- LocalStorage Token: ${token ? 'Present' : 'Missing'}\n`;
    status += `- LocalStorage User: ${userFromStorage ? 'Present' : 'Missing'}\n`;
    
    if (user) {
      status += `- User Email: ${user.email}\n`;
      status += `- User ID: ${user.id || user._id}\n`;
    }
    
    setAuthStatus(status);
  };

  const testTasksAPI = async () => {
    try {
      setError('');
      setApiResult('Testing tasks API...');
      
      const response = await tasksService.getTasks();
      setApiResult(`Success! Found ${response.tasks?.length || 0} tasks:\n${JSON.stringify(response, null, 2)}`);
    } catch (err) {
      setError(`API Error: ${err.message}`);
      setApiResult('');
    }
  };

  const createTestTask = async () => {
    try {
      setError('');
      setApiResult('Creating test task...');
      
      const testTask = {
        title: 'Test Task - ' + new Date().toLocaleTimeString(),
        description: 'This is a test task',
        subject: 'Testing',
        topic: 'API Test',
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
      setApiResult(`Task created successfully!\n${JSON.stringify(response, null, 2)}`);
      
      // Test getting tasks again
      setTimeout(testTasksAPI, 1000);
    } catch (err) {
      setError(`Create Task Error: ${err.message}`);
      setApiResult('');
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      await login(loginData);
      checkAuthStatus();
    } catch (err) {
      setError(`Login Error: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Authentication & API Test
      </Typography>
      
      {/* Authentication Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Authentication Status</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {authStatus}
          </pre>
          
          {!user && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Login</Typography>
              <TextField
                label="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleLogin}>
                Login
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* API Testing */}
      {user && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>API Testing</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button variant="contained" onClick={testTasksAPI}>
                Get Tasks
              </Button>
              <Button variant="contained" color="secondary" onClick={createTestTask}>
                Create Test Task
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {apiResult && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>API Result</Typography>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '400px',
              whiteSpace: 'pre-wrap'
            }}>
              {apiResult}
            </pre>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AuthTest;
