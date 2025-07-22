"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackAppOpen } from '@/app/_lib/analytics';

export default function AnalyticsTracker() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (!session?.user?.id) return;

    const initializeSession = async () => {
      try {
        // Track app open and initial page view
        trackAppOpen();
        trackPageView('App Launch', pathname);
        
        // Track feature-specific page
        const feature = getFeatureFromPath(pathname);
        if (feature) {
          trackPageView(feature, pathname);
        }
      } catch (error) {
        console.error('Error initializing analytics session:', error);
      }
    };

    initializeSession();
  }, [session?.user?.id]);

  // Track page changes
  useEffect(() => {
    if (!session?.user?.id) return;

    const trackPageChange = async () => {
      try {
        const feature = getFeatureFromPath(pathname);
        if (feature) {
          trackPageView(feature, pathname);
        }
      } catch (error) {
        console.error('Error tracking page change:', error);
      }
    };

    trackPageChange();
  }, [pathname, session?.user?.id]);

  return null; // This component doesn't render anything
}

function getFeatureFromPath(pathname: string): string {
  if (pathname.includes('/tasks')) return 'tasks';
  if (pathname.includes('/calendar')) return 'calendar';
  if (pathname.includes('/notes')) return 'notes';
  if (pathname.includes('/inbox')) return 'inbox';
  if (pathname.includes('/profile')) return 'profile';
  if (pathname.includes('/webapp')) return 'dashboard';
  return 'app';
}
