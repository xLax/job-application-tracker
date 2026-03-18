'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import NextLink from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { email, logout } = useAuthStore();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Applications', href: '/applications' },
    { label: 'Pipeline', href: '/pipeline' },
  ];

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 4 }}>
          Job Application Tracker
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {navLinks.map(({ label, href }) => (
            <Button
              key={href}
              color="inherit"
              component={NextLink}
              href={href}
              sx={{
                fontWeight: pathname === href ? 'bold' : 'normal',
                borderBottom: pathname === href ? '2px solid white' : '2px solid transparent',
                borderRadius: 0,
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">{email}</Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
