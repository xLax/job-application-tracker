'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuthStore } from '@/lib/authStore';
import AddApplicationModal from '@/components/AddApplicationModal';
import type { ApplicationFormData, Application } from '@/types/application';

const columns = ['Company', 'Position', 'Location', 'Status', 'Date Applied', 'Employment Type', 'Work Mode', 'Notes'];

export default function DashboardPage() {
  const router = useRouter();
  const { email, logout, isLoggedIn, setLoggedIn, setEmail } = useAuthStore();

  // Rehydrate Zustand store on page load/refresh from the cookie-validated session
  useEffect(() => {
    if (!isLoggedIn) {
      fetch('/api/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.email) {
            setLoggedIn(true);
            setEmail(data.email);
          }
        })
        .catch(() => {});
    }
    fetchApplications();
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [submitError, setSubmitError] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (res.ok) setApplications(data.applications);
    } catch {
      // silently fail — table will remain empty
    } finally {
      setLoadingApps(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  const handleAddApplication = async (data: ApplicationFormData) => {
    setSubmitError('');
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      const message =
        result.errors
          ? Object.values(result.errors).join(', ')
          : result.error || 'Failed to save application';
      throw new Error(message);
    }

    setApplications((prev) => [result.application, ...prev]);
    setModalOpen(false);
  };

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              My Applications
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
              Add Application
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      sx={{ color: 'white', fontWeight: 'bold' }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingApps ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>No applications yet</Typography>
                      <Typography variant="body2">
                        Click &quot;Add Application&quot; to track your first job application
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app._id} hover>
                      <TableCell>{app.company}</TableCell>
                      <TableCell>{app.position}</TableCell>
                      <TableCell>{app.location}</TableCell>
                      <TableCell>{app.status}</TableCell>
                      <TableCell>{new Date(app.dateApplied).toLocaleDateString()}</TableCell>
                      <TableCell>{app.employmentType}</TableCell>
                      <TableCell>{app.workMode}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
      <AddApplicationModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSubmitError(''); }}
        onSubmit={handleAddApplication}
        serverError={submitError}
      />
    </>
  );
}
