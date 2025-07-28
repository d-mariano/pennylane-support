import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  MenuItem,
  Pagination,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { User } from '../api/openapi/types';
import { apiClient } from '../api/client';
import { Challenge } from '../api/openapi/types';

interface ChallengeListProps {
  onSelectChallenge?: (challengeId: string) => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({ onSelectChallenge }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
  });
  const limit = 10;

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params: {
        offset: number;
        limit: number;
        difficulty?: string;
        category?: string;
      } = { offset, limit };

      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.category) params.category = filters.category;
      
      const response = await apiClient.getChallenges(params);
      setChallenges(response.items);
      setTotalCount(response.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [page, filters.difficulty, filters.category]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.getUser();
      setUser(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleChallengeClick = (challengeId: string) => {
    if (onSelectChallenge) {
      onSelectChallenge(challengeId);
    } else {
      navigate(`/challenges/${challengeId}`);
    }
  };

  if (!user || (loading && challenges.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Coding Challenges
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Browse and solve coding challenges to improve your PennyLane skills.
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <Box>
              <TextField
                select
                fullWidth
                label="Difficulty"
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="">All Difficulties</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {challenges.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No challenges found. Try adjusting your filters.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {challenges.map((challenge) => (
                <ListItem 
                  key={challenge.challenge_id} 
                  component={Button} 
                  sx={{
                    display: 'block',
                    textAlign: 'left',
                    textTransform: 'none',
                    mb: 2,
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => handleChallengeClick(challenge.challenge_id)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box>
                      <Typography variant="h6" component="div" gutterBottom>
                        {challenge.title}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mb={1.5}>
                        <Chip 
                          label={challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)} 
                          size="small" 
                          color={getDifficultyColor(challenge.difficulty)}
                        />
                        <Chip 
                          label={challenge.category} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`${challenge.points} points`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {challenge.description.length > 180
                      ? `${challenge.description.substring(0, 180)}...`
                      : challenge.description}
                  </Typography>
                  
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={1.5}>
                    {challenge.tags?.slice(0, 5).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1,
                          }
                        }}
                      />
                    ))}
                    {challenge.tags && (challenge.tags.length > 5 && (
                      <Chip 
                        label={`+${challenge.tags.length - 5} more`}
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1,
                          }
                        }}
                      />
                    ))}
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={Math.ceil(totalCount / limit)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              sx={{ '& .MuiPagination-ul': { flexWrap: 'nowrap' } }}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

const getDifficultyColor = (difficulty: string) => {
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
};
