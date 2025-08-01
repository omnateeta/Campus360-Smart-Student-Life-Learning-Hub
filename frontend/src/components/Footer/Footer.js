import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  IconButton,
} from '@mui/material';
import {
  LinkedIn,
  Email,
  Copyright,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f8fafc',
        borderTop: '1px solid',
        borderColor: '#e2e8f0',
        py: 3,
        mt: 'auto',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Developer Info */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="body2" color="text.secondary">
                Developed by{' '}
                <Typography
                  component="span"
                  variant="body2"
                  fontWeight="600"
                  color="primary.main"
                >
                  Omnateeta V U
                </Typography>
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontStyle: 'italic',
                  display: 'block',
                  mt: 0.5,
                  color: '#64748b'
                }}
              >
                Computer Science and Engineering Student
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                component="a"
                href="mailto:omnateeta3@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: '#64748b',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Email fontSize="small" />
              </IconButton>
              
              <IconButton
                size="small"
                component="a"
                href="https://linkedin.com/in/omnateeta-v-unnimath-0b815b338"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: '#64748b',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Copyright */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Copyright fontSize="small" sx={{ color: '#94a3b8' }} />
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {currentYear} AI Study Planner. All rights reserved.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

        {/* Additional Info */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            AI Study Planner - Intelligent Study Management System
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
