import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  TextField,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';

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
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'conversations'>('conversations');

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

  const handleSubmitPost = async (e: React.FormEvent, conversationId: string | null = null) => {
    e.preventDefault();
    if (!newPostContent.trim() || !challenge) return;

    try {
      setIsSubmitting(true);

      if (!conversationId) {
        const newConversation = await apiClient.createConversation({
          topic: `Discussion for ${challenge.title}`,
          category: challenge.category,
          challenge_id: id,
        });
        
        await apiClient.createPost(newConversation.id.toString(), {
          content: newPostContent,
        });
        await fetchData();
      } else {
        // Add to first conversation (or a selected one in a more complex UI)
        await apiClient.createPost(conversationId, {
          content: newPostContent,
        });
        await fetchData();
      }
      
      setNewPostContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit post');
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
        <Box display="flex" borderBottom={1} borderColor="divider" mb={2}>
          {/* <Button 
            onClick={() => setActiveTab('details')}
            sx={{
              mr: 1,
              borderBottom: activeTab === 'details' ? '2px solid' : 'none',
              borderColor: 'primary.main',
              borderRadius: 0,
            }}
          >
            Challenge Details
          </Button> */}
          <Button 
            onClick={() => setActiveTab('conversations')}
            sx={{
              borderBottom: activeTab === 'conversations' ? '2px solid' : 'none',
              borderColor: 'primary.main',
              borderRadius: 0,
            }}
          >
            Discussions ({conversations.reduce((acc, conv) => acc + conv.posts.length, 0)})
          </Button>
        </Box>

        {activeTab === 'conversations' && (
          <Box mt={2}>
            {conversations.length > 0 ? (
              conversations.map(conversation => (
                <Box key={conversation.id} mb={4}>
                  <Typography variant="h6" gutterBottom>
                    {conversation.topic}
                    <Chip 
                      label={conversation.status} 
                      size="small" 
                      sx={{ ml: 1, textTransform: 'capitalize' }}
                      color={conversation.status === 'OPEN' ? 'success' : 'default'}
                    />
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    {conversation.posts.map((post) => (
                      <Box key={post.id} mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', mr: 1 }}>
                            {post.user.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2" component="span">
                            {post.user}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {new Date(post.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ pl: 4 }}>{post.content}</Typography>
                        <Divider sx={{ my: 1 }} />
                      </Box>
                    ))}

                    <form onSubmit={(e) => handleSubmitPost(e, conversation.id.toString())}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder="Add to the discussion..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        disabled={isSubmitting}
                        sx={{ mb: 1 }}
                      />
                      <Box display="flex" justifyContent="flex-end">
                        <Button 
                          type="submit" 
                          variant="contained" 
                          disabled={!newPostContent.trim() || isSubmitting}
                        >
                          {isSubmitting ? 'Posting...' : 'Post'}
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                </Box>
              ))
            ) : (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No discussions yet. Start a new one!
                </Typography>
                <form onSubmit={handleSubmitPost}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Start a new discussion..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={isSubmitting}
                    sx={{ mb: 2 }}
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={!newPostContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : 'Start Discussion'}
                  </Button>
                </form>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'error';
    default:
      return 'default';
  }
}
