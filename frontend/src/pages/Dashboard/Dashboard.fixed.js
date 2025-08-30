// ... [Previous imports remain the same until the return statement]

  return (
    <Box component="main" sx={{ 
      width: '100%', 
      p: 3, 
      maxWidth: '100%', 
      boxSizing: 'border-box',
      ml: { sm: '240px' },
      transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
    }}>
      <Box sx={{ 
        maxWidth: '1400px', 
        mx: 'auto', 
        width: '100%',
        position: 'relative'
      }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {greeting}, {user?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ready to continue your learning journey? Here's your progress overview.
            </Typography>
          </Box>
        </motion.div>

        {/* Stats Grid - Fixed the closing tags structure here */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Your stats cards here */}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3} sx={{ width: '100%', mx: 0 }}>
          {/* Your content sections here */}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
