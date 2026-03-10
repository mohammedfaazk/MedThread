'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, BookOpen, PenSquare } from 'lucide-react';
import Dock, { DockItemData } from './enhancements/Dock';
import { CreatePostModal } from './CreatePostModal';
import { useJWTAuth } from '@/context/JWTAuthContext';

export function MobileNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isDoctorVerified, isDoctorPending } = useJWTAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check if user is a doctor (verified or unverified)
  const isDoctor = role === 'DOCTOR' || role === 'VERIFIED_DOCTOR' || isDoctorVerified || isDoctorPending;

  const dockItems: DockItemData[] = [
    {
      icon: <Home size={24} />,
      label: 'Home',
      onClick: () => router.push('/'),
      className: pathname === '/' ? 'bg-cyan-100/80 border-cyan-300' : ''
    },
    {
      icon: <Users size={24} />,
      label: 'Communities',
      onClick: () => router.push('/communities'),
      className: pathname === '/communities' ? 'bg-cyan-100/80 border-cyan-300' : ''
    },
    {
      icon: <BookOpen size={24} />,
      label: 'Library',
      onClick: () => router.push('/library'),
      className: pathname === '/library' ? 'bg-cyan-100/80 border-cyan-300' : ''
    },
    {
      icon: <PenSquare size={24} />,
      label: 'Create Post',
      onClick: () => {
        // Doctors open modal, patients navigate to /create
        if (isDoctor) {
          setIsCreateModalOpen(true);
        } else {
          router.push('/create');
        }
      },
      className: ''
    }
  ];

  return (
    <>
      {/* Mobile Dock Navigation - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <Dock
          items={dockItems}
          panelHeight={70}
          baseItemSize={48}
          magnification={72}
          distance={150}
        />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
