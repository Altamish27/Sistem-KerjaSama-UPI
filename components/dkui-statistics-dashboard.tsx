'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  FileText,
  Globe,
  MapPin,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data kerja sama
const cooperationData = [
  {
    id: 1,
    title: 'Kerja Sama Penelitian IoT dan Smart City',
    partner: 'PT. Teknologi Maju',
    type: 'Nasional',
    category: 'Penelitian',
    faculty: 'Fakultas Teknik',
    startDate: '2024-01-15',
    endDate: '2027-01-15',
    status: 'Aktif',
    progress: 35
  },
  {
    id: 2,
    title: 'Program Magang Mahasiswa',
    partner: 'Google Asia Pacific',
    type: 'Internasional',
    category: 'Pendidikan',
    faculty: 'Fakultas Ilmu Komputer',
    startDate: '2023-06-01',
    endDate: '2026-06-01',
    status: 'Aktif',
    progress: 78
  },
  {
    id: 3,
    title: 'Riset Bersama Energi Terbarukan',
    partner: 'MIT Energy Initiative',
    type: 'Internasional',
    category: 'Penelitian',
    faculty: 'Fakultas Teknik',
    startDate: '2024-03-20',
    endDate: '2029-03-20',
    status: 'Aktif',
    progress: 22
  },
  {
    id: 4,
    title: 'Pengembangan Kurikulum Digital',
    partner: 'Microsoft Indonesia',
    type: 'Nasional',
    category: 'Pendidikan',
    faculty: 'Fakultas Ilmu Komputer',
    startDate: '2023-09-01',
    endDate: '2025-09-01',
    status: 'Aktif',
    progress: 92
  },
  {
    id: 5,
    title: 'Studi Kebijakan Kesehatan Publik',
    partner: 'WHO Indonesia',
    type: 'Internasional',
    category: 'Penelitian',
    faculty: 'Fakultas Kesehatan Masyarakat',
    startDate: '2024-02-10',
    endDate: '2026-02-10',
    status: 'Aktif',
    progress: 45
  },
  {
    id: 6,
    title: 'Program Pertukaran Dosen',
    partner: 'Universitas Gadjah Mada',
    type: 'Nasional',
    category: 'Pendidikan',
    faculty: 'Fakultas Ekonomi',
    startDate: '2023-08-15',
    endDate: '2025-08-15',
    status: 'Aktif',
    progress: 88
  },
  {
    id: 7,
    title: 'Kolaborasi Riset AI dan Machine Learning',
    partner: 'Stanford University',
    type: 'Internasional',
    category: 'Penelitian',
    faculty: 'Fakultas Ilmu Komputer',
    startDate: '2024-01-01',
    endDate: '2028-01-01',
    status: 'Aktif',
    progress: 28
  },
  {
    id: 8,
    title: 'Pengembangan Startup Ecosystem',
    partner: 'Telkom Indonesia',
    type: 'Nasional',
    category: 'Pengabdian Masyarakat',
    faculty: 'Fakultas Ekonomi',
    startDate: '2023-11-01',
    endDate: '2025-11-01',
    status: 'Aktif',
    progress: 65
  },
  {
    id: 9,
    title: 'Riset Material Sciences',
    partner: 'RIKEN Institute Japan',
    type: 'Internasional',
    category: 'Penelitian',
    faculty: 'Fakultas MIPA',
    startDate: '2024-04-01',
    endDate: '2027-04-01',
    status: 'Aktif',
    progress: 18
  },
  {
    id: 10,
    title: 'Program Beasiswa Unggulan',
    partner: 'Bank Mandiri',
    type: 'Nasional',
    category: 'Pendidikan',
    faculty: 'Semua Fakultas',
    startDate: '2023-07-01',
    endDate: '2026-07-01',
    status: 'Aktif',
    progress: 72
  },
  {
    id: 11,
    title: 'Kajian Hukum dan Kebijakan Digital',
    partner: 'Harvard Law School',
    type: 'Internasional',
    category: 'Penelitian',
    faculty: 'Fakultas Hukum',
    startDate: '2024-05-15',
    endDate: '2026-05-15',
    status: 'Aktif',
    progress: 12
  },
  {
    id: 12,
    title: 'Inkubator Bisnis Teknologi',
    partner: 'Tokopedia',
    type: 'Nasional',
    category: 'Pengabdian Masyarakat',
    faculty: 'Fakultas Ekonomi',
    startDate: '2023-10-01',
    endDate: '2025-04-01',
    status: 'Aktif',
    progress: 95
  }
];

// Calculate statistics
const calculateStats = () => {
  const total = cooperationData.length;
  const international = cooperationData.filter(c => c.type === 'Internasional').length;
  const national = cooperationData.filter(c => c.type === 'Nasional').length;
  
  const byFaculty = cooperationData.reduce((acc, curr) => {
    acc[curr.faculty] = (acc[curr.faculty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = cooperationData.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const active = cooperationData.filter(c => c.status === 'Aktif').length;
  const expiringSoon = cooperationData.filter(c => {
    const endDate = new Date(c.endDate);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return endDate <= sixMonthsFromNow && c.status === 'Aktif';
  }).length;

  return {
    total,
    international,
    national,
    byFaculty,
    byCategory,
    active,
    expiringSoon,
    internationalPercentage: Math.round((international / total) * 100),
    nationalPercentage: Math.round((national / total) * 100)
  };
};

const getRemainingTime = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays < 30) return `${diffDays} hari lagi`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lagi`;
  return `${Math.floor(diffDays / 365)} tahun ${Math.floor((diffDays % 365) / 30)} bulan lagi`;
};

const getDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  
  if (diffYears > 0) return `${diffYears} tahun${diffMonths > 0 ? ` ${diffMonths} bulan` : ''}`;
  return `${diffMonths} bulan`;
};

export function DKUIStatisticsDashboard() {
  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard Statistik Kerja Sama</h2>
        <p className="text-muted-foreground">
          Direktorat Kerja Sama Universitas Indonesia
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Kerja Sama
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-600">
              {stats.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>{stats.active} Aktif</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Internasional
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {stats.international}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Progress value={stats.internationalPercentage} className="h-2 flex-1" />
              <span className="text-xs font-medium">{stats.internationalPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Nasional
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-orange-600">
              {stats.national}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Progress value={stats.nationalPercentage} className="h-2 flex-1" />
              <span className="text-xs font-medium">{stats.nationalPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Berakhir &lt; 6 Bulan
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-red-600">
              {stats.expiringSoon}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Perlu perpanjangan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Faculty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Kerja Sama per Fakultas/Unit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.byFaculty)
                .sort(([, a], [, b]) => b - a)
                .map(([faculty, count]) => {
                  const percentage = Math.round((count / stats.total) * 100);
                  return (
                    <div key={faculty} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{faculty}</span>
                        <span className="text-muted-foreground">{count} kerja sama</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="text-xs font-medium w-12 text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Kategori Kerja Sama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => {
                  const percentage = Math.round((count / stats.total) * 100);
                  const colors = {
                    Penelitian: 'bg-blue-500',
                    Pendidikan: 'bg-green-500',
                    'Pengabdian Masyarakat': 'bg-purple-500'
                  };
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">{count} program</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full", colors[category as keyof typeof colors])}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-12 text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Cooperation List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daftar Kerja Sama Aktif
          </CardTitle>
          <CardDescription>
            Menampilkan {cooperationData.length} kerja sama yang sedang berjalan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {cooperationData.map((coop) => (
              <Card key={coop.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{coop.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{coop.partner}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={coop.type === 'Internasional' ? 'default' : 'secondary'}
                          className={cn(
                            coop.type === 'Internasional' && 'bg-green-600'
                          )}
                        >
                          {coop.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Fakultas:</span>
                          <p className="font-medium">{coop.faculty.replace('Fakultas ', '')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kategori:</span>
                          <p className="font-medium">{coop.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Durasi:</span>
                          <p className="font-medium">{getDuration(coop.startDate, coop.endDate)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Sisa Waktu:
                          </span>
                          <p className={cn(
                            "font-medium",
                            coop.progress > 90 && "text-red-600"
                          )}>
                            {getRemainingTime(coop.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{coop.progress}%</span>
                        </div>
                        <Progress value={coop.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(coop.startDate).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                          {' → '}
                          {new Date(coop.endDate).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
