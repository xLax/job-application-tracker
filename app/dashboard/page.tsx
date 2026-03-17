'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/lib/authStore';
import Navbar from '@/components/Navbar';
import ApplicationsTable from '@/components/ApplicationsTable';
import AddApplicationModal from '@/components/AddApplicationModal';
import type { ApplicationFormData, Application } from '@/types/application';

const PIE_COLORS = ['#1976d2', '#ed6c02', '#d32f2f', '#2e7d32', '#7b1fa2'];

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h3" fontWeight="bold" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { isLoggedIn, setLoggedIn, setEmail } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
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

    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) setApplications(data.applications);
      })
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedApp(null);
    setSubmitError('');
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

  const inProgress = applications.filter((a) => a.status !== 'Applied' && a.status !== 'Rejected');
  const applied = applications.filter((a) => a.status === 'Applied');
  const rejected = applications.filter((a) => a.status === 'Rejected');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentApps = applications.filter(
    (a) => new Date(a.createdAt) >= sevenDaysAgo
  );

  const pieData = [
    { name: 'In Progress', value: inProgress.length },
    { name: 'Applied', value: applied.length },
    { name: 'Rejected', value: rejected.length },
  ].filter((d) => d.value > 0);

  return (
    <>
      <Navbar />

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Dashboard
          </Typography>

          {/* Stats Cards */}
          <Grid container spacing={2} mb={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Total Applications" value={applications.length} color="text.primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="In Progress" value={inProgress.length} color="#1976d2" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Applied" value={applied.length} color="#ed6c02" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Rejected" value={rejected.length} color="#d32f2f" />
            </Grid>
          </Grid>

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <Card variant="outlined" sx={{ mb: 4, p: 2 }}>
              <Typography variant="h6" fontWeight="medium" mb={1}>
                Status Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${((percent || 0) * 100).toFixed(1)}%)`
                    }
                    labelLine={true}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Recent 7 Days */}
          <ApplicationsTable
            title="Added in the Past 7 Days"
            applications={recentApps}
            loading={loadingApps}
            emptyMessage="No applications added in the past 7 days."
            onRowClick={(app) => { setSelectedApp(app); setModalOpen(true); }}
          />
        </Box>
      </Container>

      <AddApplicationModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleEditApplication}
        onDelete={handleDeleteApplication}
        serverError={submitError}
        application={selectedApp}
      />
    </>
  );
}
