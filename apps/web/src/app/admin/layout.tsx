'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, FileText, MessageSquare, Flag, Activity, ScrollText, LogOut, BarChart3, Trophy } from 'lucide-react';
import '@/styles/glassmorphic-analytics.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        alert('Access denied. Admin only.');
        router.push('/');
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/login');
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="ambient-orb-bottom" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
                 style={{ borderColor: '#669ae3', borderTopColor: 'transparent' }}></div>
            <p style={{ color: '#8899b4' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Shield },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/doctor-performance', label: 'Doctor Performance', icon: Trophy },
    { href: '/admin/posts', label: 'Posts', icon: FileText },
    { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
    { href: '/admin/reports', label: 'Reports', icon: Flag },
    { href: '/admin/moderation', label: 'Moderation', icon: Activity },
    { href: '/admin/health-challenges', label: 'Health Challenges', icon: Trophy },
    { href: '/admin/backup', label: 'Backup', icon: Activity },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  ];

  return (
    <div className="dashboard-page min-h-screen">
      {/* Ambient Orbs */}
      <div className="ambient-orb-bottom" />
      
      {/* Top Navigation Bar - Glassmorphic */}
      <header className="admin-header sticky top-0 z-50">
        <div className="max-w-full px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="admin-logo-badge">
                <Shield className="w-5 h-5" style={{ color: '#669ae3' }} />
              </div>
              <div>
                <h1 className="admin-title">Admin Panel</h1>
                <p className="admin-subtitle">MedThread Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex dashboard-content">
        {/* Sidebar Navigation - Glassmorphic */}
        <aside className="admin-sidebar">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="admin-nav-icon">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative z-1">
          {children}
        </main>
      </div>
    </div>
  );
}
