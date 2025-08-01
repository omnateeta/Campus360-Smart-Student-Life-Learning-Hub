import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Paper,
  Divider,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  Event,
  Schedule,
  Assignment,
  Timer,
  School,
  CalendarMonth,
  ViewWeek,
  ViewDay,
  FilterList,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
} from 'date-fns';
import { tasksService } from '../../services/tasksService';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'study',
    subject: '',
    startDateTime: new Date(),
    endDateTime: new Date(),
    description: '',
    location: '',
    priority: 'medium',
    difficulty: 'medium'
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Load tasks from backend
  useEffect(() => {
    loadTasks();
  }, [currentDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksService.getAllTasks();
      
      if (response.tasks) {
        // Convert tasks to calendar events
        const calendarEvents = response.tasks.map(task => 
          tasksService.taskToCalendarEvent(task)
        );
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = async () => {
    try {
      console.log('🗓️ Creating new calendar event:', newEvent);
      
      // Validate required fields
      if (!newEvent.title.trim()) {
        toast.error('Event title is required');
        return;
      }
      
      if (!newEvent.subject.trim()) {
        toast.error('Subject is required');
        return;
      }
      
      // Validate dates
      if (!newEvent.startDateTime || !newEvent.endDateTime) {
        toast.error('Start and end times are required');
        return;
      }
      
      if (newEvent.endDateTime <= newEvent.startDateTime) {
        toast.error('End time must be after start time');
        return;
      }
      
      // Convert calendar event to task format
      const taskData = tasksService.calendarEventToTask(newEvent);
      console.log('📝 Converted task data:', taskData);
      
      // Create task via API
      const response = await tasksService.createTask(taskData);
      console.log('✅ Task creation response:', response);
      
      if (response.task) {
        // Convert back to calendar event and add to events
        const newCalendarEvent = tasksService.taskToCalendarEvent(response.task);
        console.log('📅 New calendar event:', newCalendarEvent);
        
        setEvents(prevEvents => [...prevEvents, newCalendarEvent]);
        
        toast.success('Event created successfully!');
        setCreateEventOpen(false);
        
        // Reset form
        setNewEvent({
          title: '',
          type: 'study',
          subject: '',
          startDateTime: new Date(),
          endDateTime: new Date(),
          description: '',
          location: '',
          priority: 'medium',
          difficulty: 'medium'
        });
      } else {
        console.error('❌ No task returned in response');
        toast.error('Failed to create event - no task returned');
      }
    } catch (error) {
      console.error('❌ Error creating event:', error);
      console.error('❌ Error details:', error.response?.data);
      
      // Show specific validation errors if available
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(e => e.msg).join(', ');
        toast.error(`Validation errors: ${validationErrors}`);
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to create event. Please try again.');
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await tasksService.deleteTask(eventId);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully!');
      setEventDetailsOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent({
      ...event,
      startDateTime: new Date(`${format(event.date, 'yyyy-MM-dd')}T${event.startTime}`),
      endDateTime: new Date(`${format(event.date, 'yyyy-MM-dd')}T${event.endTime}`)
    });
    setEditEventOpen(true);
    setEventDetailsOpen(false);
  };

  const handleUpdateEvent = async () => {
    try {
      // Convert calendar event to task format
      const taskData = tasksService.calendarEventToTask(editingEvent);
      
      // Update task via API
      const response = await tasksService.updateTask(editingEvent.id, taskData);
      
      if (response.task) {
        // Convert back to calendar event and update events
        const updatedCalendarEvent = tasksService.taskToCalendarEvent(response.task);
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === editingEvent.id ? updatedCalendarEvent : event
          )
        );
        
        toast.success('Event updated successfully!');
        setEditEventOpen(false);
        setEditingEvent(null);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'study': return <School />;
      case 'class': return <Event />;
      case 'assignment': return <Assignment />;
      case 'exam': return <Schedule />;
      case 'meeting': return <Timer />;
      default: return <Event />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'study': return '#3b82f6';
      case 'class': return '#10b981';
      case 'assignment': return '#f59e0b';
      case 'exam': return '#ef4444';
      case 'meeting': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayEvents = getEventsForDate(day);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isCurrentDay = isToday(day);
      const dayNumber = format(day, 'd');

      days.push(
        <motion.div
          key={day.toString()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Paper
            elevation={isCurrentDay ? 2 : 0}
            sx={{
              minHeight: 120,
              p: 1,
              cursor: 'pointer',
              border: isCurrentDay ? '2px solid' : '1px solid',
              borderColor: isCurrentDay ? 'primary.main' : 'divider',
              backgroundColor: isCurrentMonth ? 'background.paper' : 'action.hover',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={() => setSelectedDate(day)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="body2"
                fontWeight={isCurrentDay ? 'bold' : 'normal'}
                color={isCurrentMonth ? 'text.primary' : 'text.secondary'}
              >
                {dayNumber}
              </Typography>
              {dayEvents.length > 0 && (
                <Badge badgeContent={dayEvents.length} color="primary" />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {dayEvents.slice(0, 3).map((event, index) => (
                <Chip
                  key={event.id}
                  label={event.title}
                  size="small"
                  sx={{
                    backgroundColor: event.color,
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20,
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setEventDetailsOpen(true);
                  }}
                />
              ))}
              {dayEvents.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{dayEvents.length - 3} more
                </Typography>
              )}
            </Box>
          </Paper>
        </motion.div>
      );
      day = addDays(day, 1);
    }

    return days;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDate(day);
      
      days.push(
        <Grid item xs key={day.toString()}>
          <Paper sx={{ p: 2, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              {format(day, 'EEE dd')}
              {isToday(day) && (
                <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />
              )}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dayEvents.map((event) => (
                <Card
                  key={event.id}
                  sx={{
                    borderLeft: `4px solid ${event.color}`,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2 },
                  }}
                  onClick={() => {
                    setSelectedEvent(event);
                    setEventDetailsOpen(true);
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="body2" fontWeight="600">
                      {event.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.startTime} - {event.endTime}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      );
    }

    return days;
  };

  const EventDetailsDialog = () => (
    <Dialog
      open={eventDetailsOpen}
      onClose={() => setEventDetailsOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      {selectedEvent && (
        <>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ backgroundColor: selectedEvent.color }}>
              {getEventTypeIcon(selectedEvent.type)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedEvent.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedEvent.subject}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Date & Time
                </Typography>
                <Typography variant="body2">
                  {format(new Date(selectedEvent.date), 'EEEE, MMMM dd, yyyy')}
                </Typography>
                <Typography variant="body2">
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </Typography>
              </Box>
              
              {selectedEvent.description && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {selectedEvent.description}
                  </Typography>
                </Box>
              )}
              
              {selectedEvent.location && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body2">
                    {selectedEvent.location}
                  </Typography>
                </Box>
              )}
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Type
                </Typography>
                <Chip
                  label={selectedEvent.type}
                  size="small"
                  sx={{
                    backgroundColor: selectedEvent.color,
                    color: 'white',
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEventDetailsOpen(false)}>
              Close
            </Button>
            <Button 
              variant="outlined"
              color="error"
              onClick={() => handleDeleteEvent(selectedEvent.id)}
            >
              Delete
            </Button>
            <Button 
              variant="contained"
              onClick={() => handleEditEvent(selectedEvent)}
            >
              Edit Event
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Calendar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage your study schedule
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateEventOpen(true)}
            size="large"
          >
            Add Event
          </Button>
        </Box>

        {/* Calendar Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={prevMonth}>
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h5" fontWeight="600" sx={{ minWidth: 200, textAlign: 'center' }}>
                  {format(currentDate, 'MMMM yyyy')}
                </Typography>
                <IconButton onClick={nextMonth}>
                  <ChevronRight />
                </IconButton>
                <Button
                  variant="outlined"
                  startIcon={<Today />}
                  onClick={goToToday}
                  size="small"
                >
                  Today
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={view === 'month' ? 'contained' : 'outlined'}
                  startIcon={<CalendarMonth />}
                  onClick={() => setView('month')}
                  size="small"
                >
                  Month
                </Button>
                <Button
                  variant={view === 'week' ? 'contained' : 'outlined'}
                  startIcon={<ViewWeek />}
                  onClick={() => setView('week')}
                  size="small"
                >
                  Week
                </Button>
                <Button
                  variant={view === 'day' ? 'contained' : 'outlined'}
                  startIcon={<ViewDay />}
                  onClick={() => setView('day')}
                  size="small"
                >
                  Day
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        {view === 'month' && (
          <Card>
            <CardContent>
              {/* Days of Week Header */}
              <Grid container spacing={1} sx={{ mb: 1 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Grid item xs key={day}>
                    <Typography
                      variant="subtitle2"
                      textAlign="center"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              
              {/* Calendar Days */}
              <Grid container spacing={1}>
                {renderCalendarDays().map((day, index) => (
                  <Grid item xs key={index}>
                    {day}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Week View */}
        {view === 'week' && (
          <Grid container spacing={2}>
            {renderWeekView()}
          </Grid>
        )}

        {/* Today's Events Sidebar */}
        <Card sx={{ position: 'fixed', right: 24, top: 120, width: 300, maxHeight: 400, overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Today's Events
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              {getEventsForDate(new Date()).map((event) => (
                <ListItem
                  key={event.id}
                  sx={{
                    borderLeft: `4px solid ${event.color}`,
                    mb: 1,
                    borderRadius: 1,
                    backgroundColor: 'action.hover',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedEvent(event);
                    setEventDetailsOpen(true);
                  }}
                >
                  <ListItemIcon>
                    {getEventTypeIcon(event.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={`${event.startTime} - ${event.endTime}`}
                  />
                </ListItem>
              ))}
              {getEventsForDate(new Date()).length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No events today
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add event"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setCreateEventOpen(true)}
        >
          <Add />
        </Fab>

        {/* Event Details Dialog */}
        <EventDetailsDialog />

        {/* Edit Event Dialog */}
        <Dialog
          open={editEventOpen}
          onClose={() => setEditEventOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Event</DialogTitle>
          <DialogContent>
            {editingEvent && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="Event Title"
                  fullWidth
                  variant="outlined"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select 
                    label="Event Type"
                    value={editingEvent.type}
                    onChange={(e) => setEditingEvent({...editingEvent, type: e.target.value})}
                  >
                    <MenuItem value="study">Study Session</MenuItem>
                    <MenuItem value="class">Class</MenuItem>
                    <MenuItem value="assignment">Assignment</MenuItem>
                    <MenuItem value="exam">Exam</MenuItem>
                    <MenuItem value="meeting">Meeting</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Subject"
                  fullWidth
                  variant="outlined"
                  value={editingEvent.subject}
                  onChange={(e) => setEditingEvent({...editingEvent, subject: e.target.value})}
                />
                <DateTimePicker
                  label="Start Date & Time"
                  value={editingEvent.startDateTime}
                  onChange={(newValue) => setEditingEvent({...editingEvent, startDateTime: newValue})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DateTimePicker
                  label="End Date & Time"
                  value={editingEvent.endDateTime}
                  onChange={(newValue) => setEditingEvent({...editingEvent, endDateTime: newValue})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                />
                <TextField
                  label="Location"
                  fullWidth
                  variant="outlined"
                  value={editingEvent.location || ''}
                  onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditEventOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleUpdateEvent}
              disabled={!editingEvent?.title?.trim()}
            >
              Update Event
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Event Dialog */}
        <Dialog
          open={createEventOpen}
          onClose={() => setCreateEventOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Event</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Event Title"
                fullWidth
                variant="outlined"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                required
                error={!newEvent.title.trim()}
                helperText={!newEvent.title.trim() ? 'Title is required' : ''}
              />
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select 
                  label="Event Type"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                >
                  <MenuItem value="study">Study Session</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="practice">Practice</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="assignment">Assignment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Subject"
                fullWidth
                variant="outlined"
                value={newEvent.subject}
                onChange={(e) => setNewEvent({...newEvent, subject: e.target.value})}
                required
                error={!newEvent.subject.trim()}
                helperText={!newEvent.subject.trim() ? 'Subject is required' : ''}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select 
                  label="Priority"
                  value={newEvent.priority}
                  onChange={(e) => setNewEvent({...newEvent, priority: e.target.value})}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select 
                  label="Difficulty"
                  value={newEvent.difficulty}
                  onChange={(e) => setNewEvent({...newEvent, difficulty: e.target.value})}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
              <DateTimePicker
                label="Start Date & Time"
                value={newEvent.startDateTime}
                onChange={(newValue) => setNewEvent({...newEvent, startDateTime: newValue})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DateTimePicker
                label="End Date & Time"
                value={newEvent.endDateTime}
                onChange={(newValue) => setNewEvent({...newEvent, endDateTime: newValue})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
              <TextField
                label="Location"
                fullWidth
                variant="outlined"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateEventOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleCreateEvent}
              disabled={!newEvent.title.trim() || !newEvent.subject.trim()}
            >
              Create Event
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Calendar;
