import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';

// Simple loading spinner
export const LoadingSpinner = ({ size = 40, message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
    }}
  >
    <CircularProgress size={size} sx={{ mb: 2 }} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Full page loading
export const PageLoading = ({ message = 'Loading page...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    >
      <CircularProgress size={60} />
    </motion.div>
    <Typography variant="h6" sx={{ mt: 2 }} color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Card skeleton loader
export const CardSkeleton = ({ count = 3 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} key={index}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={70} height={24} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box
        key={rowIndex}
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={colIndex === 0 ? '30%' : '20%'}
            height={20}
          />
        ))}
      </Box>
    ))}
  </Box>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <Box>
    {/* Header skeleton */}
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} />
    </Box>

    {/* Stats cards skeleton */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Skeleton variant="circular" width={56} height={56} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width="60%" height={32} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="50%" height={16} sx={{ mx: 'auto' }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Chart skeleton */}
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="70%" height={16} />
                  <Skeleton variant="text" width="50%" height={14} />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

// Chat skeleton
export const ChatSkeleton = () => (
  <Box sx={{ p: 2 }}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
          mb: 2,
        }}
      >
        {index % 2 === 0 && (
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        )}
        <Box sx={{ maxWidth: '70%' }}>
          <Skeleton
            variant="rounded"
            width={200 + Math.random() * 100}
            height={60 + Math.random() * 40}
          />
        </Box>
        {index % 2 === 1 && (
          <Skeleton variant="circular" width={40} height={40} sx={{ ml: 2 }} />
        )}
      </Box>
    ))}
  </Box>
);

export default {
  LoadingSpinner,
  PageLoading,
  CardSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  ChatSkeleton,
};
