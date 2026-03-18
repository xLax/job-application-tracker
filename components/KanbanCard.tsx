'use client';

import { Box, Chip, Paper, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Application } from '@/types/application';

interface Props {
  app: Application;
  color: string;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export default function KanbanCard({ app, color, onDragStart }: Props) {
  return (
    <Paper
      draggable
      onDragStart={(e) => onDragStart(e, app._id)}
      elevation={1}
      sx={{
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        borderLeft: `4px solid ${color}`,
        cursor: 'grab',
        '&:hover': { boxShadow: 3 },
        '&:active': { cursor: 'grabbing' },
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* Top row: company + interview type chip */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5 }}>
        <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
          {app.company}
        </Typography>
        {app.stage === 'Interview' && app.interviewType && (
          <Chip label={app.interviewType} size="small" sx={{ flexShrink: 0 }} />
        )}
      </Box>

      {/* Position */}
      <Typography variant="body2" color="text.secondary" noWrap>
        {app.position}
      </Typography>

      {/* Bottom row: location + work mode */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0, overflow: 'hidden' }}>
          <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" noWrap>
            {app.location}
          </Typography>
        </Box>
        {app.workMode !== 'Not Specified' && (
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
            {app.workMode}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
