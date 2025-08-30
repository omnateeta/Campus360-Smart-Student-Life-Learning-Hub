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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

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
    <Box 
      component="div"
      sx={{ 
        width: drawerWidth,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        overflowY: 'auto',
        backgroundColor: '#1e293b',
        color: 'rgba(255, 255, 255, 0.9)',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b',
          color: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          position: 'relative',
        },
      }}
    >
      {/* Logo and Title */}
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <School sx={{ 
          fontSize: 48,
          color: 'white',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          p: 1,
          mx: 'auto',
          display: 'block',
          width: 'fit-content',
          mb: 1
        }} />
        <Typography variant="h6" color="white" fontWeight="bold">
          Campus360
        </Typography>
        <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
          Smart Student Life & Learning Hub
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

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
            icon={<EmojiEvents />}
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
      <List sx={{ py: 1, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem 
              key={item.text} 
              disablePadding
              sx={{ 
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderRadius: 1,
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  py: 1.1,
                  px: 2,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 38,
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    '& svg': {
                      fontSize: '1.25rem',
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.3px',
                    lineHeight: 1.3,
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.2s ease-in-out',
                  }}
                  sx={{ my: 0 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
