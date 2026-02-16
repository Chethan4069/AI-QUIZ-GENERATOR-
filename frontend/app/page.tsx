"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ... other imports

export default function Home() {
  const router = useRouter();

  // --- NEW: REDIRECT TO DASHBOARD ---
  // This hook runs when the component loads.
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  // We can return a loading state while the redirect happens.
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading your dashboard...</p>
    </div>
  );
}
