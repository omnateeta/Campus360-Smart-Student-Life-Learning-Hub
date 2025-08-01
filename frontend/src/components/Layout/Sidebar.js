import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  CalendarToday,
  Timer,
  Notes,
  Analytics,
  School,
  Chat,
  EmojiEvents,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    text: 'Study Plans',
    icon: <School />,
    path: '/study-plans',
  },
  {
    text: 'Tasks',
    icon: <Assignment />,
    path: '/tasks',
  },
  {
    text: 'Calendar',
    icon: <CalendarToday />,
    path: '/calendar',
  },
  {
    text: 'Timer',
    icon: <Timer />,
    path: '/timer',
  },
  {
    text: 'Notes',
    icon: <Notes />,
    path: '/notes',
  },
  {
    text: 'Analytics',
    icon: <Analytics />,
    path: '/analytics',
  },
  {
    text: 'AI Chat',
    icon: <Chat />,
    path: '/ai-chat',
  },
];

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Brand */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <School sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
        <Typography variant="h6" fontWeight="bold" color="white">
          AI Study Planner
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.7)">
          Smart Learning Platform
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* User Profile Section */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
          src={user?.avatar}
          sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" color="white" fontWeight="500">
          {user?.name}
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.7)">
          {user?.email}
        </Typography>
        
        {/* Gamification Stats */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Chip
            icon={<EmojiEvents />}
            label={`Level ${user?.gamification?.level || 1}`}
            size="small"
            sx={{
              backgroundColor: '#fbbf24',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          <Chip
            icon={<TrendingUp />}
            label={`${user?.gamification?.streaks?.current || 0} days`}
            size="small"
            sx={{
              backgroundColor: '#10b981',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'rgba(59, 130, 246, 0.3)' 
                      : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.8)',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          color="rgba(255,255,255,0.8)"
          sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}
        >
          Developed by Omnateeta V U
        </Typography>
        <Typography 
          variant="caption" 
          color="rgba(255,255,255,0.6)"
          sx={{ fontStyle: 'italic', display: 'block', mb: 1, fontSize: '0.65rem' }}
        >
          Computer Science & Engineering Student
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.5)">
          © 2025 AI Study Planner
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
