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
  Chip,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { Application } from '@/types/application';
import { STAGES } from '@/lib/constants';

type SortField = 'company' | 'dateApplied';
type SortDir = 'asc' | 'desc';

const SORTABLE: Record<string, SortField> = {
  Company: 'company',
  'Date Applied': 'dateApplied',
};

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField | null; sortDir: SortDir }) {
  if (sortField !== field) {
    return <UnfoldMoreIcon fontSize="small" sx={{ opacity: 0.4, verticalAlign: 'middle', ml: 0.5 }} />;
  }
  return sortDir === 'asc'
    ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
    : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />;
}

const COLUMNS = ['Company', 'Position', 'Location', 'Stage', 'Date Applied', 'Employment Type', 'Work Mode', 'Notes'];

interface Props {
  title: string;
  applications: Application[];
  loading: boolean;
  emptyMessage?: string;
  onRowClick?: (app: Application) => void;
  rowsPerPage?: number;
  statusFilter?: boolean;
}

export default function ApplicationsTable({ title, applications, loading, emptyMessage = 'No applications here yet.', onRowClick, rowsPerPage = 5, statusFilter = false }: Props) {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      // third click — clear sort
      setSortField(null);
      setSortDir('asc');
    }
    setPage(0);
  };

  // Statuses that actually exist in the current data set
  const presentStages = STAGES.filter((s) =>
    applications.some((a) => a.stage === s)
  );

  // Reset page and clear status filter when the data set changes
  useEffect(() => {
    setPage(0);
    setActiveStatus(null);
  }, [applications.length]);

  const statusFiltered = activeStatus
    ? applications.filter((a) => a.stage === activeStatus)
    : applications;

  const sorted = sortField
    ? [...statusFiltered].sort((a, b) => {
        const mul = sortDir === 'asc' ? 1 : -1;
        if (sortField === 'company') {
          return mul * a.company.localeCompare(b.company);
        }
        return mul * (new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime());
      })
    : statusFiltered;

  const needsPagination = !loading && sorted.length > rowsPerPage;
  const visibleRows = needsPagination
    ? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sorted;

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
            ({loading ? '…' : activeStatus ? `${statusFiltered.length} of ${applications.length}` : applications.length})
          </Typography>
        </Typography>
      </Box>

      {statusFilter && !loading && presentStages.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="All"
            size="small"
            onClick={() => { setActiveStatus(null); setPage(0); }}
            color={activeStatus === null ? 'primary' : 'default'}
            variant={activeStatus === null ? 'filled' : 'outlined'}
          />
          {presentStages.map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              onClick={() => { setActiveStatus(activeStatus === s ? null : s); setPage(0); }}
              color={activeStatus === s ? 'primary' : 'default'}
              variant={activeStatus === s ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      )}

      <Collapse in={open} unmountOnExit>
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                {COLUMNS.map((col) => {
                  const field = SORTABLE[col];
                  return field ? (
                    <TableCell
                      key={col}
                      onClick={() => handleSort(field)}
                      sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                    >
                      {col}
                      <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
                    </TableCell>
                  ) : (
                    <TableCell key={col} sx={{ color: 'white', fontWeight: 'bold' }}>
                      {col}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : statusFiltered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 1, color: 'text.secondary' }}>
                    <Typography variant="body2">
                      {activeStatus ? `No applications with status "${activeStatus}".` : emptyMessage}
                    </Typography>
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
                    <TableCell>{app.stage === 'Interview' && app.interviewType ? `Interview (${app.interviewType})` : app.stage}</TableCell>
                    <TableCell>{new Date(app.dateApplied).toLocaleDateString('en-GB')}</TableCell>
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
            count={statusFiltered.length}
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

