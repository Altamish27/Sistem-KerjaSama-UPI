"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowLeft, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SubmitProposalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    partnerName: "",
    address: "",
    contactPerson: "",
    contactPosition: "",
    phone: "",
    companyEmail: "",
    title: "",
    purpose: "",
    cooperationType: "",
    scope: "",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadedFile(files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitted(false);

    if (!formData.partnerName || !formData.address || !formData.contactPerson || !formData.phone || !formData.companyEmail || !formData.title || !formData.purpose || !formData.cooperationType || !formData.scope) {
      setError("Mohon lengkapi semua field wajib bertanda *");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("partnerName", formData.partnerName);
      payload.append("address", formData.address);
      payload.append("contactPerson", formData.contactPerson);
      payload.append("contactPosition", formData.contactPosition);
      payload.append("phone", formData.phone);
      payload.append("companyEmail", formData.companyEmail);
      payload.append("title", formData.title);
      payload.append("purpose", formData.purpose);
      payload.append("cooperationType", formData.cooperationType);
      payload.append("scope", formData.scope);

      if (uploadedFile) {
        payload.append("file", uploadedFile);
      }

      const res = await fetch("/api/public-proposal", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Terjadi kesalahan saat mengirim pengajuan");
      }

      setIsSubmitted(true);
      // Optional: reset form setelah sukses
      setFormData({
        partnerName: "",
        address: "",
        contactPerson: "",
        contactPosition: "",
        phone: "",
        companyEmail: "",
        title: "",
        purpose: "",
        cooperationType: "",
        scope: "",
      });
      setUploadedFile(null);
    } catch (err: any) {
      console.error("Submit proposal error", err);
      setError(err.message || "Terjadi kesalahan saat mengirim pengajuan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#e10000] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <span className="hidden sm:inline-flex items-center text-xs font-semibold uppercase text-[#e10000] bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
            Form Pengajuan
          </span>
        </div>

        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-200 bg-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e10000] to-[#b00000] flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Form Pengajuan Kemitraan
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm mt-1.5">
                  Isi identitas mitra dan ringkasan rencana kerja sama. Tim DKUI akan menindaklanjuti melalui kontak yang Anda cantumkan.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-4">
                <div className="pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    A. Identitas Mitra
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Data dasar organisasi/perusahaan mitra sebagai pihak pengaju kerja sama.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="partnerName" className="text-slate-900 font-medium">
                      Nama Mitra / Organisasi *
                    </Label>
                    <Input
                      id="partnerName"
                      placeholder="Contoh: PT. Teknologi Maju Indonesia"
                      value={formData.partnerName}
                      onChange={(e) => handleChange("partnerName", e.target.value)}
                      className="border-gray-300 focus:border-[#e10000] focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-slate-900 font-medium">
                      Nama Contact Person (CP) *
                    </Label>
                    <Input
                      id="contactPerson"
                      placeholder="Nama lengkap CP"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange("contactPerson", e.target.value)}
                      className="border-gray-300 focus:border-[#e10000] focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPosition" className="text-slate-900 font-medium">
                      Jabatan CP
                    </Label>
                    <Input
                      id="contactPosition"
                      placeholder="Contoh: Head of Partnership"
                      value={formData.contactPosition}
                      onChange={(e) => handleChange("contactPosition", e.target.value)}
                      className="border-gray-300 focus:border-[#e10000] focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-900 font-medium">
                      No. HP / Kontak *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Contoh: +62 812-3456-7890"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="border-gray-300 focus:border-[#e10000] focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr,1.5fr] gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-900 font-medium">
                      Alamat Lengkap *
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Tulis alamat lengkap kantor / institusi mitra"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      rows={3}
                      className="border-gray-300 focus:border-[#e10000] focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail" className="text-slate-900 font-medium">
                      Email Perusahaan *
                    </Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="nama@perusahaan.co.id"
                      value={formData.companyEmail}
                      onChange={(e) => handleChange("companyEmail", e.target.value)}
                      className="border-gray-300 focus:border-[#e10000] focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    B. Informasi Pengajuan Kerja Sama
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Ringkasan rencana kerja sama yang diajukan, termasuk jenis dan ruang lingkupnya.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-900 font-medium">
                    Judul Pengajuan *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Kerja Sama Penelitian IoT dan Smart City"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-slate-900 font-medium">
                    Tujuan Kerja Sama *
                  </Label>
                  <Textarea
                    id="purpose"
                    placeholder="Jelaskan secara singkat tujuan utama dari kerja sama yang diajukan"
                    value={formData.purpose}
                    onChange={(e) => handleChange("purpose", e.target.value)}
                    rows={4}
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="cooperationType" className="text-slate-900 font-medium">
                      Jenis Kerja Sama *
                    </Label>
                    <Select
                      value={formData.cooperationType}
                      onValueChange={(value) => handleChange("cooperationType", value)}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#e10000] focus:ring-2 focus:ring-red-100">
                        <SelectValue placeholder="Pilih jenis kerja sama" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-lg">
                        <SelectItem value="penelitian">Penelitian</SelectItem>
                        <SelectItem value="pendidikan">Pendidikan / Pengajaran</SelectItem>
                        <SelectItem value="pengabdian">Pengabdian kepada Masyarakat</SelectItem>
                        <SelectItem value="magang">Magang / PKL / Praktik</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scope" className="text-slate-900 font-medium">
                      Ruang Lingkup Kerja Sama *
                    </Label>
                    <Select value={formData.scope} onValueChange={(value) => handleChange("scope", value)}>
                      <SelectTrigger className="border-gray-300 focus:border-[#e10000] focus:ring-2 focus:ring-red-100">
                        <SelectValue placeholder="Pilih ruang lingkup" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-lg">
                        <SelectItem value="universitas">Universitas</SelectItem>
                        <SelectItem value="fakultas">Fakultas</SelectItem>
                        <SelectItem value="prodi">Prodi / Unit Kerja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Dokumen Pengajuan (opsional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-gray-500" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-gray-900">Upload dokumen konsep/proposal</p>
                          <p className="text-xs text-gray-600">Format PDF/DOC/PPT/XLS, maks. 10MB</p>
                          {uploadedFile && (
                            <p className="text-xs text-[#e10000] font-semibold mt-1">
                              ✓ {uploadedFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <input
                          id="proposalFile"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-100"
                          onClick={() => document.getElementById("proposalFile")?.click()}
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-900 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {isSubmitted && !error && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-900 text-sm">
                    Terima kasih, pengajuan awal Anda sudah tercatat di sistem demo. Tim DKUI akan menghubungi melalui email/telepon setelah sistem backend terhubung penuh.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 max-w-md leading-relaxed">
                  Dengan mengirimkan form ini, Anda menyetujui bahwa data kontak akan digunakan untuk proses tindak lanjut kerja sama oleh UPI.
                </p>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#e10000] hover:bg-[#b00000] text-white font-semibold px-8 py-3 shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
