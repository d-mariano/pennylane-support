import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  List,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { ChatBubbleOutline, Add, Close } from '@mui/icons-material';
import { format } from 'date-fns';

import { apiClient } from '../api/client';
import { Challenge, Conversation, User } from '../api/openapi/types';

export const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({ topic: '', message: '' });


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [challengeData, conversationsData] = await Promise.all([
        apiClient.getChallenge(id!), 
        apiClient.getConversations({ challenge_id: id })
      ]);
      
      setChallenge(challengeData);
      setConversations(conversationsData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData, id]);

  useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await apiClient.getUser();
          setUser(response);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load user');
        }
      };
      fetchUser();
    }, []);

  const handleOpenDialog = () => {
    setTopic('');
    setMessage('');
    setFormErrors({ topic: '', message: '' });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { topic: '', message: '' };

    if (!topic.trim()) {
      newErrors.topic = 'Please enter a topic';
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = 'Please enter a message';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleStartNewConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !validateForm()) return;

    try {
      setIsSubmitting(true);
      const newConversation = await apiClient.createConversation({
        topic: topic.trim(),
        category: challenge.category,
        challenge_id: challenge.id,
      });
      
      await apiClient.createPost(newConversation.id.toString(), {
        content: message.trim(),
      });
      
      await fetchData();
      
      setIsDialogOpen(false);
      navigate(`/conversations/${newConversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Challenges</Button>
      </Container>
    );
  }

  if (!challenge) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Challenge not found</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Challenges</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
      <Button 
        onClick={() => navigate('/')} 
        variant="outlined" 
        sx={{ mb: 2 }}
      >
        ← Back to Challenges
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h4" component="h1">
            {challenge.title}
          </Typography>
          <Chip 
            label={challenge.difficulty} 
            color={getDifficultyColor(challenge.difficulty)}
            sx={{ ml: 1 }}
          />
        </Box>

        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip label={`${challenge.points} pts`} size="small" variant="outlined" />
          <Chip label={challenge.category} size="small" variant="outlined" />
          {challenge.tags?.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Typography variant="body1" paragraph>
          {challenge.description}
        </Typography>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>Learning Objectives</Typography>
          <ul>
            {challenge.learning_objectives?.map((obj, index) => (
              <li key={index}>
                <Typography variant="body2">{obj}</Typography>
              </li>
            ))}
          </ul>
        </Box>

        <Box mt={2}>
          <Typography variant="h6" gutterBottom>Hints</Typography>
          <ul>
            {challenge.hints?.map((hint, index) => (
              <li key={index}>
                <Typography variant="body2" color="text.secondary">{hint}</Typography>
              </li>
            ))}
          </ul>
        </Box>
      </Paper>

      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" component="h2">
            Discussions ({conversations.length})
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={handleOpenDialog}
            disabled={isSubmitting}
          >
            New Discussion
          </Button>
        </Box>

        {conversations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ChatBubbleOutline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No discussions yet</Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Be the first to start a discussion about this challenge
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleOpenDialog}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Add />}
            >
              {isSubmitting ? 'Creating...' : 'Start a Discussion'}
            </Button>
          </Paper>
        ) : (
          <List sx={{ width: '100%', }}>
            {conversations.map((conversation) => (
              <React.Fragment key={conversation.id}>
                <Link to={`/conversations/${conversation.id}`}>
                <Card 
                  sx={{
                    mb: 2,
                    textDecoration: 'none',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                  elevation={1}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {conversation.user?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                    }
                    title={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {conversation.topic || 'Untitled Discussion'}
                      </Typography>
                    }
                    subheader={
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {conversation.user || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {conversation.updated_at ? format(new Date(conversation.updated_at), 'MMM d, yyyy') : ''}
                        </Typography>
                      </Box>
                    }
                    action={
                      <Chip 
                        label={conversation.status}
                        size="small"
                        color={
                          conversation.status === 'OPEN' ? 'success' : 
                          conversation.status === 'CLOSED' ? 'default' : 'warning'
                        }
                        sx={{ 
                          textTransform: 'capitalize',
                          mb: 1 
                        }}
                      />
                    }
                  />
                  <CardContent sx={{ pt: 1, pb: '16px !important' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {conversation.posts?.[0]?.content || 'No content'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0, px: 2, pb: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ChatBubbleOutline fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {conversation.posts?.length || 0} {conversation.posts?.length === 1 ? 'reply' : 'replies'}
                      </Typography>
                    </Box>
                  </CardActions>
                </Card>
                </Link>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* New Discussion Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Start a New Discussion
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleStartNewConversation}>
          <DialogContent dividers>
            <FormControl fullWidth error={!!formErrors.topic} sx={{ mb: 3 }}>
              <TextField
                autoFocus
                margin="dense"
                id="topic"
                label="Discussion Topic"
                type="text"
                fullWidth
                variant="outlined"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                error={!!formErrors.topic}
                disabled={isSubmitting}
              />
              {formErrors.topic && (
                <FormHelperText>{formErrors.topic}</FormHelperText>
              )}
            </FormControl>
            
            <FormControl fullWidth error={!!formErrors.message}>
              <TextField
                margin="dense"
                id="message"
                label="Your Message"
                type="text"
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                error={!!formErrors.message}
                disabled={isSubmitting}
              />
              {formErrors.message && (
                <FormHelperText>{formErrors.message}</FormHelperText>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              disabled={isSubmitting}
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Creating...' : 'Start Discussion'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'error';
    default:
      return 'default';
  }
};
