'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuthStore } from '@/lib/authStore';
import Navbar from '@/components/Navbar';
import AddApplicationModal from '@/components/AddApplicationModal';
import ApplicationsTable from '@/components/ApplicationsTable';
import type { ApplicationFormData, Application } from '@/types/application';

export default function ApplicationsPage() {
  const { isLoggedIn, setLoggedIn, setEmail } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [submitError, setSubmitError] = useState('');

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

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (res.ok) setApplications(data.applications);
    } catch {
      // silently fail — tables will remain empty
    } finally {
      setLoadingApps(false);
    }
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
      const message = result.errors
        ? Object.values(result.errors).join(', ')
        : result.error || 'Failed to save application';
      throw new Error(message);
    }

    setApplications((prev) => [result.application, ...prev]);
    setModalOpen(false);
  };

  return (
    <>
      <Navbar />

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

          <ApplicationsTable
            title="Applications in Progress"
            applications={applications.filter((a) => a.status !== 'Applied' && a.status !== 'Rejected')}
            loading={loadingApps}
            emptyMessage="No applications currently in progress."
          />

          <ApplicationsTable
            title="Applied Applications"
            applications={applications.filter((a) => a.status === 'Applied')}
            loading={loadingApps}
            emptyMessage="No pending applications."
          />

          <ApplicationsTable
            title="Rejected Applications"
            applications={applications.filter((a) => a.status === 'Rejected')}
            loading={loadingApps}
            emptyMessage="No rejected applications."
          />
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
