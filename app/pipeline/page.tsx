'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Container,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Navbar from '@/components/Navbar';
import KanbanCard from '@/components/KanbanCard';
import type { Application } from '@/types/application';
import { useAuthStore } from '@/lib/authStore';

const COLUMNS: { stage: string; label: string; color: string }[] = [
  { stage: 'Applied', label: 'Applied', color: '#1976d2' },
  { stage: 'Interview', label: 'Interview', color: '#ed6c02' },
  { stage: 'Offer', label: 'Offer', color: '#2e7d32' },
  { stage: 'Rejected', label: 'Rejected', color: '#d32f2f' },
];

export default function PipelinePage() {
  const { isLoggedIn, setLoggedIn, setEmail } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejected, setShowRejected] = useState(true);
  const [pages, setPages] = useState<Record<string, number>>({});
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const PAGE_SIZE = 5;

  const getPage = (stage: string) => pages[stage] ?? 0;
  const setPage = (stage: string, page: number) =>
    setPages((prev) => ({ ...prev, [stage]: page }));

  useEffect(() => {
    if (!isLoggedIn) {
      fetch('/api/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.email) { setLoggedIn(true); setEmail(data.email); }
        })
        .catch(() => {});
    }
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => { if (data.applications) setApplications(data.applications); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('appId', id);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const id = e.dataTransfer.getData('appId');
    const app = applications.find((a) => a._id === id);
    if (!app || app.stage === targetStage) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a._id === id ? { ...a, stage: targetStage, interviewType: targetStage === 'Interview' ? a.interviewType : '' } : a))
    );

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: app.company,
          position: app.position,
          location: app.location,
          stage: targetStage,
          interviewType: targetStage === 'Interview' ? (app.interviewType || '') : '',
          dateApplied: new Date(app.dateApplied).toISOString().split('T')[0],
          employmentType: app.employmentType,
          workMode: app.workMode,
          notes: app.notes || '',
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setApplications((prev) => prev.map((a) => (a._id === id ? result.application : a)));
      } else {
        // Revert on failure
        setApplications((prev) => prev.map((a) => (a._id === id ? app : a)));
      }
    } catch {
      setApplications((prev) => prev.map((a) => (a._id === id ? app : a)));
    }
  };

  const visibleColumns = showRejected
    ? COLUMNS
    : COLUMNS.filter((c) => c.stage !== 'Rejected');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Page header — matches dashboard/applications title style */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Pipeline
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={showRejected ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={() => setShowRejected((v) => !v)}
          >
            {showRejected ? 'Hide Rejected' : 'Show Rejected'}
          </Button>
        </Box>
      </Container>

      <Box sx={{ px: 3, flexGrow: 1, overflow: 'auto', pb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', overflowX: 'auto', pb: 2, justifyContent: 'center' }}>
            {visibleColumns.map(({ stage, label, color }) => {
              const cards = applications.filter((a) => a.stage === stage);
              const page = getPage(stage);
              const totalPages = Math.ceil(cards.length / PAGE_SIZE);
              const pageCards = cards.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
              const isOver = dragOverStage === stage;
              return (
                <Box
                  key={stage}
                  onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverStage(null);
                    }
                  }}
                  onDrop={(e) => handleDrop(e, stage)}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    outline: isOver ? `2px dashed ${color}` : '2px dashed transparent',
                    transition: 'outline 0.15s',
                    p: 0.5,
                  }}
                >
                  {/* Column header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1.5,
                      px: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {label}
                      </Typography>
                    </Box>
                    <Chip
                      label={cards.length}
                      size="small"
                      sx={{ bgcolor: color, color: 'white', fontWeight: 'bold', minWidth: 28 }}
                    />
                  </Box>

                  {/* Cards list */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pr: 0.5 }}>
                    {cards.length === 0 ? (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          color: 'text.disabled',
                          borderStyle: 'dashed',
                          bgcolor: 'transparent',
                        }}
                      >
                        <Typography variant="body2">No applications</Typography>
                      </Paper>
                    ) : (
                      pageCards.map((app) => (
                        <KanbanCard
                          key={app._id}
                          app={app}
                          color={color}
                          onDragStart={handleDragStart}
                        />
                      ))
                    )}
                  </Box>

                  {/* Pagination — only when more than one page */}
                  {totalPages > 1 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setPage(stage, page - 1)}
                        disabled={page === 0}
                      >
                        <ChevronLeftIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {page + 1} / {totalPages}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setPage(stage, page + 1)}
                        disabled={page >= totalPages - 1}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
