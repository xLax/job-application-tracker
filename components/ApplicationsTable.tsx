'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Collapse,
  IconButton,
  TablePagination,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { Application } from '@/types/application';

const COLUMNS = ['Company', 'Position', 'Location', 'Status', 'Date Applied', 'Employment Type', 'Work Mode', 'Notes'];

interface Props {
  title: string;
  applications: Application[];
  loading: boolean;
  emptyMessage?: string;
  onRowClick?: (app: Application) => void;
  rowsPerPage?: number;
}

export default function ApplicationsTable({ title, applications, loading, emptyMessage = 'No applications here yet.', onRowClick, rowsPerPage = 5 }: Props) {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(0);

  // Reset to first page whenever the data set changes (e.g. after add/delete/filter)
  useEffect(() => {
    setPage(0);
  }, [applications.length]);

  const needsPagination = !loading && applications.length > rowsPerPage;
  const visibleRows = needsPagination
    ? applications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : applications;

  return (
    <Box sx={{ mb: 5 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', mb: 1.5, cursor: 'pointer', userSelect: 'none', width: 'fit-content' }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <IconButton size="small" sx={{ mr: 0.5, p: 0 }}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          {title}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({loading ? '…' : applications.length})
          </Typography>
        </Typography>
      </Box>

      <Collapse in={open} unmountOnExit>
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                {COLUMNS.map((col) => (
                  <TableCell key={col} sx={{ color: 'white', fontWeight: 'bold' }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 1, color: 'text.secondary' }}>
                    <Typography variant="body2">{emptyMessage}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((app) => (
                  <TableRow
                    key={app._id}
                    hover
                    onClick={() => onRowClick?.(app)}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
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
        {needsPagination && (
          <TablePagination
            component="div"
            count={applications.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            onPageChange={(_, newPage) => setPage(newPage)}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        )}
      </Collapse>
    </Box>
  );
}

