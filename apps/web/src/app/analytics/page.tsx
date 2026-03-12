'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsSocketProvider } from '@/context/AnalyticsSocketContext';
import PublicHealthDashboardRealtime from '@/components/analytics/PublicHealthDashboardRealtime';
import DoctorPerformanceDashboardRealtime from '@/components/analytics/DoctorPerformanceDashboardRealtime';
import PlatformMetricsDashboard from '@/components/analytics/PlatformMetricsDashboard';

function AnalyticsContent() {
  const [activeTab, setActiveTab] = useState('public-health');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Health Analytics Dashboard</h1>
        <p className="text-gray-600">
          Real-time insights into health trends, doctor performance, and platform metrics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="public-health">Public Health Intelligence</TabsTrigger>
          <TabsTrigger value="doctor-performance">Doctor Performance</TabsTrigger>
          <TabsTrigger value="platform-metrics">Platform Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="public-health">
          <PublicHealthDashboardRealtime />
        </TabsContent>

        <TabsContent value="doctor-performance">
          <DoctorPerformanceDashboardRealtime />
        </TabsContent>

        <TabsContent value="platform-metrics">
          <PlatformMetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AnalyticsSocketProvider>
      <AnalyticsContent />
    </AnalyticsSocketProvider>
  );
}
