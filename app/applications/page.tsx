'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuthStore } from '@/lib/authStore';
import Navbar from '@/components/Navbar';
import AddApplicationModal from '@/components/AddApplicationModal';
import ApplicationsTable from '@/components/ApplicationsTable';
import type { ApplicationFormData, Application } from '@/types/application';

export default function ApplicationsPage() {
  const { isLoggedIn, setLoggedIn, setEmail } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();
  const filtered = term
    ? applications.filter(
        (a) =>
          a.company.toLowerCase().includes(term) ||
          a.position.toLowerCase().includes(term) ||
          (a.notes ?? '').toLowerCase().includes(term)
      )
    : applications;

  const closeModal = () => {
    setModalOpen(false);
    setSelectedApp(null);
    setSubmitError('');
  };

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
    closeModal();
  };

  const handleEditApplication = async (data: ApplicationFormData) => {
    if (!selectedApp) return;
    setSubmitError('');
    const res = await fetch(`/api/applications/${selectedApp._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      const message = result.errors
        ? Object.values(result.errors).join(', ')
        : result.error || 'Failed to update application';
      throw new Error(message);
    }

    setApplications((prev) =>
      prev.map((a) => (a._id === selectedApp._id ? result.application : a))
    );
    closeModal();
  };

  const handleDeleteApplication = async (id: string) => {
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Failed to delete application');
    }
    setApplications((prev) => prev.filter((a) => a._id !== id));
    closeModal();
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search by company, position or notes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 320 }}
                slotProps={{
                  input: {
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch('')} edge="end">
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
              Add Application
            </Button>
            </Box>
          </Box>

          <ApplicationsTable
            title="Applications in Progress"
            applications={filtered.filter((a) => a.status !== 'Applied' && a.status !== 'Rejected')}
            loading={loadingApps}
            emptyMessage="No applications currently in progress."
            onRowClick={(app) => { setSelectedApp(app); setModalOpen(true); }}
            statusFilter
          />

          <ApplicationsTable
            title="Applied Applications"
            applications={filtered.filter((a) => a.status === 'Applied')}
            loading={loadingApps}
            emptyMessage="No pending applications."
            onRowClick={(app) => { setSelectedApp(app); setModalOpen(true); }}
          />

          <ApplicationsTable
            title="Rejected Applications"
            applications={filtered.filter((a) => a.status === 'Rejected')}
            loading={loadingApps}
            emptyMessage="No rejected applications."
            onRowClick={(app) => { setSelectedApp(app); setModalOpen(true); }}
          />
        </Box>
      </Container>

      <AddApplicationModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={selectedApp ? handleEditApplication : handleAddApplication}
        onDelete={handleDeleteApplication}
        serverError={submitError}
        application={selectedApp}
      />
    </>
  );
}
