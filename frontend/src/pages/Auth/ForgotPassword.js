import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
} from '@mui/material';
import {
  School,
  ArrowBack,
  Email,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const { forgotPassword, loading } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await forgotPassword(email);
    if (result.success) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          py={4}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%' }}
          >
            <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center' }}>
              <CardContent sx={{ p: 4 }}>
                <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Check Your Email
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  We've sent a password reset link to <strong>{email}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Please check your email and click the link to reset your password. 
                  The link will expire in 1 hour.
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  startIcon={<ArrowBack />}
                  fullWidth
                >
                  Back to Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        py={4}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              mb: 3,
            }}
          >
            <School sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              AI Study Planner
            </Typography>
            <Typography variant="body1" opacity={0.9}>
              Reset your password
            </Typography>
          </Paper>

          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Forgot Password?
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                No worries! Enter your email address and we'll send you a link to reset your password.
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  margin="normal"
                  autoComplete="email"
                  autoFocus
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <Box textAlign="center">
                  <Button
                    component={Link}
                    to="/login"
                    startIcon={<ArrowBack />}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
