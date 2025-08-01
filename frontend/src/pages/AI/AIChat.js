import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Clear,
  Psychology,
  School,
  Assignment,
  Timer,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/aiService';
import { toast } from 'react-toastify';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI study assistant. I can help you with study planning, answering questions, creating schedules, and more. How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Call real AI API
      const response = await aiService.chat(currentInput);
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Add error message to chat
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };



  const quickActions = [
    { label: 'Create Study Plan', icon: <Assignment />, action: () => setInputValue('Help me create a study plan') },
    { label: 'Study Tips', icon: <Psychology />, action: () => setInputValue('Give me some study tips') },
    { label: 'Schedule Help', icon: <Timer />, action: () => setInputValue('Help me with my study schedule') },
    { label: 'Subject Help', icon: <School />, action: () => setInputValue('I need help with a specific subject') },
  ];

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hi! I'm your AI study assistant. I can help you with study planning, answering questions, creating schedules, and more. How can I assist you today?",
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h6">AI Study Assistant</Typography>
              <Typography variant="body2" color="text.secondary">
                Your personal AI tutor
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<Clear />}
            onClick={clearChat}
            variant="outlined"
            size="small"
          >
            Clear Chat
          </Button>
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quickActions.map((action, index) => (
              <Chip
                key={index}
                icon={action.icon}
                label={action.label}
                onClick={action.action}
                clickable
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Messages */}
      <Paper 
        elevation={1} 
        sx={{ 
          flex: 1, 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          mb: 2
        }}
      >
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <List sx={{ width: '100%' }}>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem
                    sx={{
                      display: 'flex',
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        maxWidth: '70%',
                        flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: message.type === 'user' ? 'secondary.main' : 'primary.main',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {message.type === 'user' ? <Person /> : <SmartToy />}
                      </Avatar>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100',
                          color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                        }}
                      >
                        <Typography variant="body2">{message.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            opacity: 0.7,
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <ListItem sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <SmartToy />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">AI is thinking...</Typography>
                    </Box>
                  </Paper>
                </Box>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>
      </Paper>

      {/* Input */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask me anything about studying..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            multiline
            maxRows={3}
            disabled={isLoading}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            sx={{ alignSelf: 'flex-end' }}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default AIChat;
