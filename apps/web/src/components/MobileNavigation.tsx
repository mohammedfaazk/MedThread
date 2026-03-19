'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, BookOpen, PenSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { DockItemData } from './enhancements/Dock';
import { useJWTAuth } from '@/context/JWTAuthContext';

const Dock = dynamic(() => import('./enhancements/Dock'), { ssr: false });
const CreatePostModal = dynamic(() => import('./CreatePostModal').then(m => ({ default: m.CreatePostModal })), { ssr: false });
const PatientCreatePostModal = dynamic(() => import('./PatientCreatePostModal').then(m => ({ default: m.PatientCreatePostModal })), { ssr: false });

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
        // Both doctors and patients open modal
        setIsCreateModalOpen(true);
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
      {role === 'PATIENT'
        ? <PatientCreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        : <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      }
    </>
  );
}
