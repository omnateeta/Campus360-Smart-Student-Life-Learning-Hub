import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Divider,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Notifications,
  Assignment,
  EmojiEvents,
  Timer,
  School,
  Close,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'task',
    title: 'Task Due Soon',
    message: 'Mathematics homework is due in 2 hours',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    icon: <Assignment />,
    color: '#f59e0b',
  },
  {
    id: 2,
    type: 'achievement',
    title: 'New Badge Earned!',
    message: 'You earned the "Week Warrior" badge for 7-day streak',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    icon: <EmojiEvents />,
    color: '#10b981',
  },
  {
    id: 3,
    type: 'timer',
    title: 'Pomodoro Complete',
    message: 'Great job! You completed a 25-minute study session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    icon: <Timer />,
    color: '#3b82f6',
  },
  {
    id: 4,
    type: 'study-plan',
    title: 'Study Plan Updated',
    message: 'AI has optimized your Physics study plan based on your progress',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    icon: <School />,
    color: '#8b5cf6',
  },
];

const NotificationCenter = ({ anchorEl, open, onClose, onUnreadCountChange }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Update parent component with unread count whenever it changes
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'task':
        navigate('/tasks');
        toast.info('Redirecting to Tasks');
        break;
      case 'achievement':
        navigate('/profile');
        toast.info('Redirecting to Profile');
        break;
      case 'timer':
        navigate('/timer');
        toast.info('Redirecting to Timer');
        break;
      case 'study-plan':
        navigate('/study-plans');
        toast.info('Redirecting to Study Plans');
        break;
      default:
        toast.info('Notification viewed');
    }
    
    onClose();
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    toast.info('Redirecting to All Notifications');
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: {
          width: 380,
          maxHeight: 500,
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600">
            Notifications
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} unread notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Notifications List */}
      <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Notifications sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <ListItem
              key={notification.id}
              button
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                borderLeft: `4px solid ${notification.color}`,
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    backgroundColor: notification.color,
                    width: 40,
                    height: 40,
                  }}
                >
                  {notification.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={notification.read ? 400 : 600}
                      sx={{ flex: 1 }}
                    >
                      {notification.title}
                    </Typography>
                    {!notification.read && (
                      <Badge
                        variant="dot"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))
        )}
      </List>

      {notifications.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button fullWidth variant="text" size="small" onClick={handleViewAllNotifications}>
              View All Notifications
            </Button>
          </Box>
        </>
      )}
    </Menu>
  );
};

export default NotificationCenter;
