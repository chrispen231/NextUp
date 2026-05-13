'use client';

import { usePathname } from 'next/navigation';
import DashboardHeader from './DashboardHeader';
import Navbar from './Navbar';

export default function GlobalHeader() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return null; // Dashboard handles its own header
  }

  return <Navbar />;
}
