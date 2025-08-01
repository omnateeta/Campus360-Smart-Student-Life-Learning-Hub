import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Paper,
  Divider,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Send,
  Mic,
  MicOff,
  Attachment,
  MoreVert,
  SmartToy,
  Person,
  School,
  Quiz,
  Lightbulb,
  Assignment,
  Help,
  Clear,
  Refresh,
  Download,
  Share,
  BookmarkAdd,
  VolumeUp,
  VolumeOff,
  Settings,
  Add,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

// Mock chat conversations
const mockConversations = [
  {
    id: 1,
    title: 'Calculus Help',
    lastMessage: 'Can you explain derivatives?',
    timestamp: new Date(Date.now() - 3600000),
    messageCount: 12,
    subject: 'Mathematics',
  },
  {
    id: 2,
    title: 'Physics Study Plan',
    lastMessage: 'Create a study schedule for mechanics',
    timestamp: new Date(Date.now() - 7200000),
    messageCount: 8,
    subject: 'Physics',
  },
  {
    id: 3,
    title: 'Chemistry Quiz Help',
    lastMessage: 'Generate practice questions for organic chemistry',
    timestamp: new Date(Date.now() - 86400000),
    messageCount: 15,
    subject: 'Chemistry',
  },
];

// Mock chat messages
const mockMessages = [
  {
    id: 1,
    type: 'user',
    content: 'Can you help me understand derivatives in calculus?',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: 2,
    type: 'ai',
    content: 'Of course! Derivatives are a fundamental concept in calculus. A derivative represents the rate of change of a function at any given point.\n\nThe basic definition is:\nf\'(x) = lim(h→0) [f(x+h) - f(x)]/h\n\nWould you like me to explain this with a specific example?',
    timestamp: new Date(Date.now() - 1790000),
    suggestions: ['Show me an example', 'Explain the power rule', 'What about chain rule?'],
  },
  {
    id: 3,
    type: 'user',
    content: 'Yes, please show me an example with f(x) = x²',
    timestamp: new Date(Date.now() - 1200000),
  },
  {
    id: 4,
    type: 'ai',
    content: 'Great choice! Let\'s find the derivative of f(x) = x²\n\nUsing the power rule: d/dx(x^n) = nx^(n-1)\n\nFor f(x) = x²:\n- n = 2\n- f\'(x) = 2x^(2-1) = 2x\n\nSo the derivative of x² is 2x.\n\nThis means at any point x, the slope of the tangent line is 2x. For example:\n- At x = 1: slope = 2(1) = 2\n- At x = 3: slope = 2(3) = 6\n\nWould you like to try another example?',
    timestamp: new Date(Date.now() - 1190000),
    suggestions: ['Try f(x) = x³', 'Explain geometric meaning', 'Practice problems'],
  },
];

// Quick action templates
const quickActions = [
  { icon: <Quiz />, label: 'Generate Quiz', action: 'quiz' },
  { icon: <Assignment />, label: 'Study Plan', action: 'study-plan' },
  { icon: <Lightbulb />, label: 'Explain Concept', action: 'explain' },
  { icon: <Help />, label: 'Homework Help', action: 'homework' },
];

const Chat = () => {
  const [conversations, setConversations] = useState(mockConversations);
  const [currentConversation, setCurrentConversation] = useState(1);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I understand your question. Let me help you with that...',
        timestamp: new Date(),
        suggestions: ['Tell me more', 'Show examples', 'Practice problems'],
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickAction = (action) => {
    let message = '';
    switch (action) {
      case 'quiz':
        message = 'Generate a quiz for my current study topic';
        break;
      case 'study-plan':
        message = 'Create a study plan for my upcoming exams';
        break;
      case 'explain':
        message = 'Explain this concept in simple terms';
        break;
      case 'homework':
        message = 'Help me with my homework assignment';
        break;
      default:
        return;
    }
    setNewMessage(message);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Voice recognition logic would go here
  };

  const handleMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        {message.type === 'ai' && (
          <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
            <SmartToy />
          </Avatar>
        )}
        <Box sx={{ maxWidth: '70%' }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: message.type === 'user' ? 'primary.main' : 'background.paper',
              color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              position: 'relative',
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
              }}
            >
              {format(message.timestamp, 'HH:mm')}
            </Typography>
            {message.type === 'ai' && (
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 4, right: 4 }}
                onClick={(e) => handleMenuOpen(e, message)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Paper>
          
          {/* AI Suggestions */}
          {message.type === 'ai' && message.suggestions && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {message.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={() => handleSuggestionClick(suggestion)}
                />
              ))}
            </Box>
          )}
        </Box>
        {message.type === 'user' && (
          <Avatar sx={{ backgroundColor: 'secondary.main', ml: 2 }}>
            <Person />
          </Avatar>
        )}
      </Box>
    </motion.div>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 200px)' }}>
      <Grid container sx={{ height: '100%' }}>
        {/* Conversations Sidebar */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  AI Assistant
                </Typography>
                <IconButton onClick={() => setNewChatOpen(true)}>
                  <Add />
                </IconButton>
              </Box>
              
              {/* Quick Actions */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {quickActions.map((action, index) => (
                  <Chip
                    key={index}
                    icon={action.icon}
                    label={action.label}
                    size="small"
                    clickable
                    onClick={() => handleQuickAction(action.action)}
                  />
                ))}
              </Box>
            </CardContent>
            
            <Divider />
            
            {/* Conversations List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List dense>
                {conversations.map((conversation) => (
                  <ListItemButton
                    key={conversation.id}
                    selected={currentConversation === conversation.id}
                    onClick={() => setCurrentConversation(conversation.id)}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <School />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={conversation.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {conversation.lastMessage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(conversation.timestamp, 'MMM dd, HH:mm')} • {conversation.messageCount} messages
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={9}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ml: { md: 2 } }}>
            {/* Chat Header */}
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    {conversations.find(c => c.id === currentConversation)?.title || 'AI Assistant'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    AI-powered study assistant • Online
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => setVoiceEnabled(!voiceEnabled)}>
                    {voiceEnabled ? <VolumeUp /> : <VolumeOff />}
                  </IconButton>
                  <IconButton>
                    <Settings />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
            
            <Divider />

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {isTyping && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                    <SmartToy />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        AI is typing...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  ref={inputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask me anything about your studies..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleVoiceToggle} color={isListening ? 'primary' : 'default'}>
                          {isListening ? <Mic /> : <MicOff />}
                        </IconButton>
                        <IconButton>
                          <Attachment />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  endIcon={<Send />}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{ minWidth: 'auto', px: 3 }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Message Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <BookmarkAdd sx={{ mr: 2 }} />
          Save Message
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Share sx={{ mr: 2 }} />
          Share Message
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Download sx={{ mr: 2 }} />
          Export Chat
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Refresh sx={{ mr: 2 }} />
          Regenerate Response
        </MenuItem>
      </Menu>

      {/* New Chat Dialog */}
      <Dialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Start New Conversation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Conversation Title"
              fullWidth
              placeholder="e.g., Physics Homework Help"
            />
            <TextField
              label="Subject"
              fullWidth
              placeholder="e.g., Physics, Mathematics, Chemistry"
            />
            <TextField
              label="Initial Question"
              multiline
              rows={3}
              fullWidth
              placeholder="What would you like to ask the AI assistant?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatOpen(false)}>Cancel</Button>
          <Button variant="contained">Start Chat</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="new chat"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setNewChatOpen(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Chat;
