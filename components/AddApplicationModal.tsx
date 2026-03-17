'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ApplicationFormData, Application } from '@/types/application';
import { APPLICATION_STATUSES, EMPLOYMENT_TYPES, WORK_MODES } from '@/lib/constants';

export type { ApplicationFormData };

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  serverError?: string;
  application?: Application | null;
}

export default function AddApplicationModal({ open, onClose, onSubmit, onDelete, serverError, application }: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    defaultValues: {
      company: '',
      position: '',
      location: '',
      status: 'Applied',
      dateApplied: new Date().toISOString().split('T')[0],
      employmentType: 'Full Time',
      workMode: 'Not Specified',
      notes: '',
    },
  });

  const [isDeleting, setIsDeleting] = useState(false);

  // Prefill the form when opening in edit mode, clear it when opening in add mode
  useEffect(() => {
    if (!open) return;
    if (application) {
      reset({
        company: application.company,
        position: application.position,
        location: application.location,
        status: application.status,
        dateApplied: new Date(application.dateApplied).toISOString().split('T')[0],
        employmentType: application.employmentType,
        workMode: application.workMode,
        notes: application.notes || '',
      });
    } else {
      reset({
        company: '',
        position: '',
        location: '',
        status: 'Applied',
        dateApplied: new Date().toISOString().split('T')[0],
        employmentType: 'Full Time',
        workMode: 'Not Specified',
        notes: '',
      });
    }
  }, [open]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: ApplicationFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (err: unknown) {
      // error is surfaced via serverError prop from parent
    }
  };

  const handleDelete = async () => {
    if (!application || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(application._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {application ? 'Edit Application' : 'Add Application'}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>
          )}
          <Grid container spacing={2}>

            {/* Company */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Company *"
                fullWidth
                {...register('company', {
                  required: 'Company is required',
                  minLength: { value: 2, message: 'At least 2 characters' },
                })}
                error={!!errors.company}
                helperText={errors.company?.message}
              />
            </Grid>

            {/* Position */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Position *"
                fullWidth
                {...register('position', {
                  required: 'Position is required',
                  minLength: { value: 2, message: 'At least 2 characters' },
                })}
                error={!!errors.position}
                helperText={errors.position?.message}
              />
            </Grid>

            {/* Location */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Location *"
                fullWidth
                {...register('location', {
                  required: 'Location is required',
                })}
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            </Grid>

            {/* Date Applied */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date Applied *"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('dateApplied', {
                  required: 'Date applied is required',
                })}
                error={!!errors.dateApplied}
                helperText={errors.dateApplied?.message}
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel id="status-label">Status *</InputLabel>
                    <Select {...field} labelId="status-label" label="Status *">
                      {APPLICATION_STATUSES.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.status?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Employment Type */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="employmentType"
                control={control}
                rules={{ required: 'Employment type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.employmentType}>
                    <InputLabel id="employment-type-label">Employment Type *</InputLabel>
                    <Select {...field} labelId="employment-type-label" label="Employment Type *">
                      {EMPLOYMENT_TYPES.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.employmentType?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Work Mode */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="workMode"
                control={control}
                rules={{ required: 'Work mode is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.workMode}>
                    <InputLabel id="work-mode-label">Work Mode</InputLabel>
                    <Select {...field} labelId="work-mode-label" label="Work Mode">
                      {WORK_MODES.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.workMode?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                {...register('notes', {
                  maxLength: { value: 500, message: 'Max 500 characters' },
                })}
                error={!!errors.notes}
                helperText={errors.notes?.message ?? 'Optional — max 500 characters'}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {application && onDelete && (
            <Tooltip title="Delete application">
              <IconButton
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                color="error"
                sx={{ mr: 'auto' }}
              >
                {isDeleting ? <CircularProgress size={22} color="error" /> : <DeleteIcon />}
              </IconButton>
            </Tooltip>
          )}
          <Button onClick={handleClose} disabled={isSubmitting || isDeleting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || isDeleting}>
            {isSubmitting ? <CircularProgress size={22} /> : application ? 'Save Changes' : 'Add Application'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
