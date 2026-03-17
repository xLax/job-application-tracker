'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useAuthStore } from '@/lib/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, email, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Job Application Tracker
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{email}</Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Welcome to Your Dashboard
          </Typography>

          <Box
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              This is your dashboard. Here you'll be able to:
            </Typography>
            <Typography component="ul" variant="body2" sx={{ pl: 2 }}>
              <li>Track your job applications</li>
              <li>Manage application status</li>
              <li>Keep notes on positions</li>
              <li>Monitor follow-ups</li>
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
}
