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
  ListItemSecondaryAction,
  Fab,
  Paper,
  Divider,
  Menu,
  InputAdornment,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Sort,
  MoreVert,
  Edit,
  Delete,
  Share,
  Download,
  Upload,
  Bookmark,
  BookmarkBorder,
  Folder,
  Description,
  Link,
  Image,
  PictureAsPdf,
  VideoLibrary,
  AudioFile,
  ExpandMore,
  Star,
  StarBorder,
  School,
  Assignment,
  Quiz,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { notesService } from '../../services/notesService';
import { toast } from 'react-toastify';

// Mock resources data
const mockResources = [
  {
    id: 1,
    title: 'Calculus Textbook PDF',
    type: 'pdf',
    url: 'https://example.com/calculus.pdf',
    subject: 'Mathematics',
    tags: ['textbook', 'reference'],
    size: '15.2 MB',
    addedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 2,
    title: 'Physics Lecture Video',
    type: 'video',
    url: 'https://youtube.com/watch?v=example',
    subject: 'Physics',
    tags: ['lecture', 'video'],
    duration: '45:30',
    addedAt: new Date(Date.now() - 172800000),
  },
  {
    id: 3,
    title: 'Chemistry Reference Website',
    type: 'link',
    url: 'https://chemguide.co.uk',
    subject: 'Chemistry',
    tags: ['reference', 'website'],
    addedAt: new Date(Date.now() - 259200000),
  },
];

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [resources, setResources] = useState(mockResources);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [editNoteOpen, setEditNoteOpen] = useState(false);
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [resourceAnchorEl, setResourceAnchorEl] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [filters, setFilters] = useState({
    subject: 'all',
    category: 'all',
    bookmarked: false,
    starred: false,
  });
  const [sortBy, setSortBy] = useState('updatedAt');

  // New note form state
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    subject: '',
    tags: [],
    category: 'notes',
    color: '#3b82f6',
  });

  // New resource form state
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'link',
    url: '',
    subject: '',
    tags: [],
  });

  const handleMenuOpen = (event, note) => {
    setAnchorEl(event.currentTarget);
    setSelectedNote(note);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNote(null);
  };

  // Resource menu handlers
  const handleResourceMenuOpen = (event, resource) => {
    setResourceAnchorEl(event.currentTarget);
    setSelectedResource(resource);
  };

  const handleResourceMenuClose = () => {
    setResourceAnchorEl(null);
    setSelectedResource(null);
  };

  const handleDeleteResource = (resourceId) => {
    setResources(prevResources => 
      prevResources.filter(resource => resource.id !== resourceId)
    );
    handleResourceMenuClose();
  };

  const handleShareResource = (resource) => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: `Check out this resource: ${resource.title}`,
        url: resource.url
      });
    } else {
      navigator.clipboard.writeText(resource.url);
      // You could add a toast notification here
      console.log('Resource URL copied to clipboard');
    }
    handleResourceMenuClose();
  };

  const handleBookmark = async (noteId) => {
    try {
      const note = notes.find(n => n._id === noteId);
      const updatedNote = await notesService.updateNote(noteId, {
        ...note,
        isBookmarked: !note.isBookmarked
      });
      
      setNotes(prev => prev.map(n => 
        n._id === noteId ? { ...n, isBookmarked: !n.isBookmarked } : n
      ));
      
      toast.success(updatedNote.isBookmarked ? 'Note bookmarked' : 'Bookmark removed');
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleStar = async (noteId) => {
    try {
      const note = notes.find(n => n._id === noteId);
      const updatedNote = await notesService.updateNote(noteId, {
        ...note,
        isStarred: !note.isStarred
      });
      
      setNotes(prev => prev.map(n => 
        n._id === noteId ? { ...n, isStarred: !n.isStarred } : n
      ));
      
      toast.success(updatedNote.isStarred ? 'Note starred' : 'Star removed');
    } catch (error) {
      console.error('Error updating star:', error);
      toast.error('Failed to update star');
    }
  };

  const handleEditNote = (note) => {
    setEditingNote({
      title: note.title,
      content: note.content,
      subject: note.subject,
      tags: note.tags || [],
      category: note.category,
      color: note.color,
    });
    setSelectedNote(note);
    setEditNoteOpen(true);
  };

  const handleUpdateNote = async () => {
    try {
      if (!editingNote.title.trim()) {
        toast.error('Please enter a note title');
        return;
      }

      const updatedNote = await notesService.updateNote(selectedNote._id, {
        ...editingNote,
        tags: editingNote.tags.filter(tag => tag.trim() !== ''),
      });

      setNotes(prev => prev.map(n => 
        n._id === selectedNote._id ? { ...n, ...updatedNote } : n
      ));
      
      setEditNoteOpen(false);
      setSelectedNote(null);
      setEditingNote({ title: '', content: '', subject: '', tags: [], category: 'notes', color: '#3b82f6' });
      toast.success('Note updated successfully!');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesService.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleShareNote = (note) => {
    const shareText = `${note.title}\n\n${note.content}`;
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Note copied to clipboard');
    }
    handleMenuClose();
  };

  const handleExportNote = async (note) => {
    try {
      const blob = await notesService.exportNote(note._id, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${note.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Note exported successfully');
    } catch (error) {
      console.error('Error exporting note:', error);
      toast.error('Failed to export note');
    }
    handleMenuClose();
  };

  const handleCreateNote = async () => {
    try {
      if (!newNote.title.trim()) {
        toast.error('Please enter a note title');
        return;
      }

      const noteData = {
        ...newNote,
        tags: newNote.tags.filter(tag => tag.trim() !== ''),
        isBookmarked: false,
        isStarred: false,
      };

      const createdNote = await notesService.createNote(noteData);
      setNotes(prev => [createdNote, ...prev]);
      
      setCreateNoteOpen(false);
      setNewNote({ title: '', content: '', subject: '', tags: [], category: 'notes', color: '#3b82f6' });
      toast.success('Note created successfully!');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleAddResource = () => {
    const resource = {
      id: Date.now(),
      ...newResource,
      tags: newResource.tags.filter(tag => tag.trim()),
      addedAt: new Date(),
    };
    setResources(prev => [resource, ...prev]);
    setNewResource({
      title: '',
      type: 'link',
      url: '',
      subject: '',
      tags: [],
    });
    setAddResourceOpen(false);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf': return <PictureAsPdf />;
      case 'video': return <VideoLibrary />;
      case 'audio': return <AudioFile />;
      case 'image': return <Image />;
      case 'link': return <Link />;
      default: return <Description />;
    }
  };

  const getResourceColor = (type) => {
    switch (type) {
      case 'pdf': return '#ef4444';
      case 'video': return '#8b5cf6';
      case 'audio': return '#10b981';
      case 'image': return '#f59e0b';
      case 'link': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'notes': return <Description />;
      case 'template': return <Assignment />;
      case 'summary': return <School />;
      case 'quiz': return <Quiz />;
      default: return <Description />;
    }
  };

  const filteredNotes = notes.filter(note => {
    if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !note.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.subject !== 'all' && note.subject !== filters.subject) return false;
    if (filters.category !== 'all' && note.category !== filters.category) return false;
    if (filters.bookmarked && !note.isBookmarked) return false;
    if (filters.starred && !note.isStarred) return false;
    return true;
  });

  const filteredResources = resources.filter(resource => {
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.subject !== 'all' && resource.subject !== filters.subject) return false;
    return true;
  });

  const NoteCard = ({ note }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          borderLeft: `4px solid ${note.color}`,
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ backgroundColor: note.color, mr: 2, width: 32, height: 32 }}>
                  {getCategoryIcon(note.category)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="600">
                    {note.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {note.subject} • Updated {format(new Date(note.updatedAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleStar(note._id)}
                    color={note.isStarred ? 'warning' : 'default'}
                  >
                    {note.isStarred ? <Star /> : <StarBorder />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleBookmark(note._id)}
                    color={note.isBookmarked ? 'primary' : 'default'}
                  >
                    {note.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, note)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {note.content}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={note.category} size="small" variant="outlined" />
                {note.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ResourceCard = ({ resource }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                backgroundColor: getResourceColor(resource.type),
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              {getResourceIcon(resource.type)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600">
                {resource.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {resource.subject} • Added {format(new Date(resource.addedAt), 'MMM dd, yyyy')}
              </Typography>
            </Box>
            <IconButton 
              size="small"
              onClick={(e) => handleResourceMenuOpen(e, resource)}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label={resource.type} size="small" variant="outlined" />
              {resource.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Link />}
              onClick={() => window.open(resource.url, '_blank')}
            >
              Open
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const notesResponse = await notesService.getNotes();
        
        // Handle different response structures
        const notesData = Array.isArray(notesResponse) 
          ? notesResponse 
          : (notesResponse.notes || notesResponse.data || []);
        
        setNotes(notesData);
        setResources([]); // Empty resources for now
      } catch (error) {
        console.error('Error loading notes:', error);
        toast.error('Failed to load notes data');
        setNotes([]);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Notes & Resources
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organize your study materials and resources
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setAddResourceOpen(true)}
          >
            Add Resource
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateNoteOpen(true)}
            size="large"
          >
            New Note
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Search notes and resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
              <FilterList />
            </IconButton>
            <IconButton onClick={(e) => setSortAnchor(e.currentTarget)}>
              <Sort />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <Tab label={`Notes (${filteredNotes.length})`} />
        <Tab label={`Resources (${filteredResources.length})`} />
        <Tab label="Bookmarked" />
        <Tab label="Starred" />
      </Tabs>

      {/* Content */}
      <TabPanel value={activeTab} index={0}>
        <AnimatePresence>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Description sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Loading notes...
              </Typography>
            </Box>
          ) : filteredNotes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Description sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notes found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first note to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateNoteOpen(true)}
              >
                Create Note
              </Button>
            </Box>
          ) : (
            filteredNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))
          )}
        </AnimatePresence>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <AnimatePresence>
          {filteredResources.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Folder sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No resources found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add your first resource to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => setAddResourceOpen(true)}
              >
                Add Resource
              </Button>
            </Box>
          ) : (
            filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))
          )}
        </AnimatePresence>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <AnimatePresence>
          {notes.filter(note => note.isBookmarked).map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </AnimatePresence>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <AnimatePresence>
          {notes.filter(note => note.isStarred).map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </AnimatePresence>
      </TabPanel>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setCreateNoteOpen(true)}
      >
        <Add />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditNote(selectedNote)}>
          <Edit sx={{ mr: 2 }} />
          Edit Note
        </MenuItem>
        <MenuItem onClick={() => handleShareNote(selectedNote)}>
          <Share sx={{ mr: 2 }} />
          Share Note
        </MenuItem>
        <MenuItem onClick={() => handleExportNote(selectedNote)}>
          <Download sx={{ mr: 2 }} />
          Export Note
        </MenuItem>
        <MenuItem onClick={() => handleDeleteNote(selectedNote._id)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 2 }} />
          Delete Note
        </MenuItem>
      </Menu>

      {/* Create Note Dialog */}
      <Dialog
        open={createNoteOpen}
        onClose={() => setCreateNoteOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Note</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Note Title"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={newNote.subject}
                onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                label="Subject"
              >
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Chemistry">Chemistry</MenuItem>
                <MenuItem value="Biology">Biology</MenuItem>
                <MenuItem value="Computer Science">Computer Science</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newNote.category}
                onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                label="Category"
              >
                <MenuItem value="notes">Notes</MenuItem>
                <MenuItem value="template">Template</MenuItem>
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              multiline
              rows={8}
              fullWidth
            />
            <TextField
              label="Tags (comma separated)"
              value={newNote.tags.join(', ')}
              onChange={(e) => setNewNote({...newNote, tags: e.target.value.split(',').map(tag => tag.trim())})}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateNoteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateNote}>
            Create Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog
        open={editNoteOpen}
        onClose={() => setEditNoteOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          {editingNote && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Note Title"
                value={editingNote.title}
                onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={editingNote.subject}
                  onChange={(e) => setEditingNote({...editingNote, subject: e.target.value})}
                  label="Subject"
                >
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                  <MenuItem value="Chemistry">Chemistry</MenuItem>
                  <MenuItem value="Biology">Biology</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({...editingNote, category: e.target.value})}
                  label="Category"
                >
                  <MenuItem value="notes">Notes</MenuItem>
                  <MenuItem value="template">Template</MenuItem>
                  <MenuItem value="summary">Summary</MenuItem>
                  <MenuItem value="quiz">Quiz</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Content"
                value={editingNote.content}
                onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                multiline
                rows={8}
                fullWidth
              />
              <TextField
                label="Tags (comma separated)"
                value={editingNote.tags.join(', ')}
                onChange={(e) => setEditingNote({...editingNote, tags: e.target.value.split(',').map(tag => tag.trim())})}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNoteOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateNote}
            disabled={!editingNote?.title?.trim()}
          >
            Update Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Resource Dialog */}
      <Dialog
        open={addResourceOpen}
        onClose={() => setAddResourceOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Resource</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Resource Title"
              value={newResource.title}
              onChange={(e) => setNewResource({...newResource, title: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newResource.type}
                onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                label="Type"
              >
                <MenuItem value="link">Website Link</MenuItem>
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
                <MenuItem value="image">Image</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="URL"
              value={newResource.url}
              onChange={(e) => setNewResource({...newResource, url: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={newResource.subject}
                onChange={(e) => setNewResource({...newResource, subject: e.target.value})}
                label="Subject"
              >
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Chemistry">Chemistry</MenuItem>
                <MenuItem value="Biology">Biology</MenuItem>
                <MenuItem value="Computer Science">Computer Science</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Tags (comma separated)"
              value={newResource.tags.join(', ')}
              onChange={(e) => setNewResource({...newResource, tags: e.target.value.split(',').map(tag => tag.trim())})}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddResourceOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddResource}>
            Add Resource
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resource Menu */}
      <Menu
        anchorEl={resourceAnchorEl}
        open={Boolean(resourceAnchorEl)}
        onClose={handleResourceMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => window.open(selectedResource?.url, '_blank')}>
          <ListItemIcon>
            <Link fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open Resource</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShareResource(selectedResource)}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigator.clipboard.writeText(selectedResource?.url)}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy URL</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteResource(selectedResource?.id)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete Resource</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Notes;
