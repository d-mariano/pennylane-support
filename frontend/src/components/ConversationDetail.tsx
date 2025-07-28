import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';

import { apiClient } from '../api/client';
import { Conversation, User } from '../api/openapi/types';

export const ConversationDetail: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const [conversationData, userData] = await Promise.all([
        apiClient.getConversation(conversationId),
        apiClient.getUser()
      ]);
      
      setConversation(conversationData);
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !conversationId || !conversation) return;
    
    try {
      setSubmitting(true);
      const post = await apiClient.createPost(conversationId, {
        content: newPost,
      });

      setConversation({
        ...conversation,
        posts: [...conversation.posts, post],
        updated_at: new Date().toISOString(),
      });
      
      setNewPost('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || (loading && !conversation)) {
    return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box my={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!conversation) {
    return <Alert severity="warning">Conversation not found</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          color="inherit"
          href="/conversations"
          onClick={(e) => {
            e.preventDefault();
            navigate('/conversations');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ArrowBack sx={{ mr: 0.5 }} fontSize="small" />
          Back to Conversations
        </Link>
        <Typography color="text.primary">{conversation.topic || 'Conversation'}</Typography>
      </Breadcrumbs>

      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {conversation.topic}
        </Typography>
        <Chip
          label={conversation.status}
          color={conversation.status === 'OPEN' ? 'success' : conversation.status === 'CLOSED' ? 'default' : 'warning'}
          size="small"
          sx={{ ml: 2, textTransform: 'capitalize' }}
        />
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto', mb: 2, p: 1 }}>
          {conversation.posts.map((post) => (
            <Box key={post.id} sx={{ mb: 3, display: 'flex', flexDirection: 'row' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                  {post.user?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ ml: 1, mr: 1, maxWidth: '80%' }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                      {post.user}
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                        {format(new Date(post.timestamp), 'MMM d, yyyy h:mm a')}
                      </Typography>
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>
          ))}

          <form onSubmit={handleSubmitPost}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Type your message..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              disabled={submitting}
              sx={{ mb: 1 }}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!newPost.trim() || submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
              >
                {submitting ? 'Sending...' : 'Send'}
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConversationDetail;
