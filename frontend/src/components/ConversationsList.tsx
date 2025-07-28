import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, ChatBubbleOutline } from '@mui/icons-material';
import { format } from 'date-fns';
import { apiClient } from '../api/client';
import { Conversation } from '../api/openapi/types';

export const ConversationsList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserConversations({});
      setConversations(response.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations]);

  const filteredConversations = conversations.filter(conversation => 
    conversation.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && conversations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Conversations
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {filteredConversations.length === 0 ? (
        <Box textAlign="center" py={4}>
          <ChatBubbleOutline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No matching conversations found' : 'No conversations yet'}
          </Typography>
          {!searchTerm && (
            <Typography variant="body1" color="text.secondary" mt={1}>
              Start a conversation from any challenge page
            </Typography>
          )}
        </Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            {filteredConversations.map((conversation, index) => (
              <React.Fragment key={conversation.id}>
                <ListItem
                  component={Link}
                  to={`/conversations/${conversation.id}`}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {conversation.topic?.charAt(0).toUpperCase() || 'C'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" noWrap sx={{ flex: 1, mr: 1 }}>
                          {conversation.topic || 'Untitled Conversation'}
                        </Typography>
                        <Chip 
                          label={conversation.status?.toLowerCase()} 
                          size="small" 
                          color={conversation.status === 'OPEN' ? 'success' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{
                            display: 'inline-block',
                            maxWidth: '80%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {conversation.category && (
                            <Chip 
                              label={conversation.category} 
                              size="small" 
                              variant="outlined"
                              sx={{ mr: 1, height: 20 }}
                            />
                          )}
                          {conversation.updated_at && (
                            <Typography component="span" variant="caption" color="text.secondary">
                              {format(new Date(conversation.updated_at), 'MMM d, yyyy h:mm a')}
                            </Typography>
                          )}
                        </Typography>
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < filteredConversations.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ConversationsList;