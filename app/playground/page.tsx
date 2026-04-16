'use client'; // Wajib ditulis di atas untuk halaman yang menggunakan interaktivitas (seperti event click atau hook usestate)

import { useState } from 'react';

// Nah ini cara kita import component UI yang sudah ada, konsisten, dan rapi! 
// Komponen-komponen UI kita simpan semua di components/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function PlaygroundPage() {
  // === Bagian State (Setara dengan `ref()` di Vue) ===
  const [nama, setNama] = useState(''); // State untuk menyimpan inputan user
  const [jumlahKlik, setJumlahKlik] = useState(0); // State untuk menyimpan angka

  // === Bagian Fungsi/Methods ===
  const tambahKlik = () => {
    setJumlahKlik(jumlahKlik + 1);
  };

  const resetKlik = () => {
    setJumlahKlik(0);
    setNama('');
  };

  // === Bagian Render UI (Setara dengan `<template>` di Vue) ===
  return (
    // Cara panggil Tailwind CSS
    // min-h-screen: Minimal setinggi layar penuh
    // bg-slate-50: Warna bg abu-abu yg sangat terang
    // p-8: Semua arah diberi padding 2rem
    <div className="min-h-screen bg-slate-50 p-8">
      
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Ruang Eksperimen (Playground)</h1>
          <p className="text-slate-600 mt-2">
            Halaman ini khusus untuk belajar menggunakan komponen UI yang tersedia dan konsep Dasar dari React.
            Kode sumber halamannya ada di <code className="bg-slate-200 px-2 py-0.5 rounded text-sm text-pink-600">app/playground/page.tsx</code>.
          </p>
        </div>

        {/* 1. Pengenalan Button */}
        <Card>
          <CardHeader>
            <CardTitle>1. Variasi Kombinasi Tombol (Button)</CardTitle>
            <CardDescription>Cobalah lihat perbedaan setiap tipe properti "variant" yang memperudah pengelompokannya.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {/* Pada komponen UI Button, sudah disediakan design default. Anda bisa mengganti variant */}
            <Button variant="default">Utama (Default)</Button>
            <Button variant="secondary">Sekunder (Secondary)</Button>
            <Button variant="destructive">Peringatan Berbahaya (Destructive)</Button>
            <Button variant="outline">Bergaris Bawah (Outline)</Button>
            <Button variant="ghost">Transparan (Ghost)</Button>
            <Button variant="link">Model Link</Button>
            
          </CardContent>
        </Card>

        {/* 2. Pengenalan Komponen Formulir & State React */}
        <Card>
          <CardHeader>
            <CardTitle>2. Input & Reaktivitas Data (v-model vs React State)</CardTitle>
            <CardDescription>Di React, saat kita ketik input, kita panggil dan update nilainya secara manual pakai setter function.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">Nama Anda</Label>
              {/* Event handler untuk onChange. (mirip @input di Vue) */}
              <Input 
                id="namaLengkap" 
                placeholder="Misal: Budi" 
                value={nama} 
                onChange={(e) => setNama(e.target.value)} 
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Halo, {nama ? nama : 'Tamu'}! {/* Ini namanya Ternary Operator (setara v-if v-else sederhana) */}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Pengenalan Event Klik */}
        <Card>
          <CardHeader>
            <CardTitle>3. Event onClick (mirip @click)</CardTitle>
            <CardDescription>Mencoba fungsi event dasar untuk menambah jumlah klik.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Button onClick={tambahKlik}>
                Tumbuk Saya!
              </Button>

              <Badge variant="secondary" className="text-lg px-4 py-1">
                Total Klik: {jumlahKlik}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t mt-6">
            <Button variant="ghost" onClick={resetKlik} className="w-full text-slate-500 hover:text-slate-900">
              Reset Semua State 🔄
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
