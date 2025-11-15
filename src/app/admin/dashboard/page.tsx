"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, File as FileIcon, Mic, LogOut, Wand2, BookText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AudioRecorder from "@/components/AudioRecorder";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Transcription {
  fileName: string;
  text: string;
  type: 'uploaded' | 'recorded';
}

interface UploadHistory {
  id: number;
  filename: string;
  file_type: string;
  upload_type: string;
  status: string;
  chunks?: number;
  duration?: number;
  created_at: string;
}

interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // ✅ Authentication state
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminId, setAdminId] = useState<number | null>(null);
  
  // ✅ Use ref to prevent multiple auth checks
  const hasCheckedAuth = useRef(false);
  
  // Component state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const voiceFileRef = useRef<HTMLInputElement>(null);
  const docxFileRef = useRef<HTMLInputElement>(null);
  const [tonePrompt, setTonePrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isTranscribing, setIsTranscribing] = useState<string | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admins'>('dashboard');

  // ✅ Auth check - runs ONCE on mount
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const adminToken = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");

    if (!adminToken) {
      router.replace("/admin-login");
      return;
    }

    setAdminEmail(email || "Admin");
    setAdminId(1); // You should get this from token or API
    setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, []); // ✅ Empty dependency array

  // ✅ Fetch saved prompt - runs once after auth
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchSavedPrompt = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getPrompt`);
        const data = await response.json();
        setTonePrompt(data.prompt);
      } catch (error) {
        console.error('Error fetching saved prompt:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load saved prompt.",
        });
      }
    };

    fetchSavedPrompt();
  }, [isAuthenticated]); // ✅ Only runs when authenticated changes

  // ✅ Fetch data - runs once after auth
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUploadHistory();
    fetchAdmins();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUploadHistory();
      fetchAdmins();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]); // ✅ Only runs when authenticated changes

  const fetchUploadHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-upload-history`);
      const data = await response.json();
      setUploadHistory(data.uploads || []);
    } catch (error) {
      console.error('Error fetching upload history:', error);
    }
  };

  const fetchAdmins = async () => {
    if (!adminId) return;
    
    setIsLoadingAdmins(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/admin/list?requesting_admin_id=${adminId}`, {
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        setAdmins(data.data.admins || []);
      } else {
        console.error('Failed to fetch admins:', data.message);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin list.",
      });
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    router.replace("/admin-login");
  };

  const handleRecordedAudio = async (audioBlob: Blob) => {
    const filename = `recording_${Date.now()}.mp3`;
    try {
      const file = new File([audioBlob], filename, { 
        type: 'audio/mpeg',
        lastModified: Date.now()
      });
      setUploadedFiles(prev => [...prev, file]);
      
      const reader = new FileReader();
      
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      setIsTranscribing(filename);
      
      const response = await fetch(`${API_BASE_URL}/upload-recorded-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          filename
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process recorded audio');
      }

      const result = await response.json();
      setTranscriptions(prev => [...prev, {
        fileName: filename,
        text: `Recorded audio - ${result.details.chunks_created} chunks, Duration: ${result.details.duration}s`,
        type: 'recorded'
      }]);
      
      toast({
        title: "Success",
        description: `Recording processed: ${result.details.chunks_created} chunks created`,
      });

      // Refresh upload history
      await fetchUploadHistory();

    } catch (error) {
      console.error("Recording processing failed:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to process recording",
      });
    } finally {
      setIsTranscribing(null);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setUploadedFiles(prev => [...prev, ...files]);

      for (const file of files) {
        if (file.type.startsWith("audio/")) {
          setIsTranscribing(file.name);
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('language', 'en');

            const response = await fetch(`${API_BASE_URL}/upload-audio`, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Failed to process audio file');
            }

            const result = await response.json();
            setTranscriptions(prev => [...prev, { 
              fileName: file.name, 
              text: `Uploaded audio - ${result.details.chunks_created} chunks, Duration: ${result.details.duration}s`,
              type: 'uploaded'
            }]);
            
            toast({
              title: "Success",
              description: `${file.name} processed: ${result.details.chunks_created} chunks created`,
            });

            // Refresh upload history
            await fetchUploadHistory();

          } catch (error) {
            console.error("Audio processing failed:", error);
            toast({
              variant: "destructive",
              title: "Processing Error",
              description: `Failed to process ${file.name}`,
            });
          } finally {
            setIsTranscribing(null);
          }
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload-docx`, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Failed to process DOCX file');
            }

            const result = await response.json();
            toast({
              title: "Success",
              description: `${file.name} processed: ${result.details.chunks_created} chunks created`,
            });

            // Refresh upload history
            await fetchUploadHistory();

          } catch (error) {
            console.error("DOCX processing failed:", error);
            toast({
              variant: "destructive",
              title: "Processing Error",
              description: `Failed to process ${file.name}`,
            });
          }
        }
      }
    }
  };

  const handleSaveTone = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chngPrompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: tonePrompt }),
      });
      
      if (!response.ok) throw new Error('Failed to save prompt');
      
      toast({
        title: "Success",
        description: "AI tone prompt has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save tone prompt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save the new tone prompt.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUpload = async (uploadId: number) => {
    if (!uploadId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid upload ID",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/delete-upload/${uploadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete upload');

      setUploadHistory(prev => prev.filter(upload => upload.id !== uploadId));
      
      toast({
        title: "Success",
        description: "Upload record deleted from database.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete upload record",
      });
    }
  };

  const handleToggleAdminStatus = async (targetAdminId: number) => {
    if (!adminId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Admin ID not found",
      });
      return;
    }

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/admin/toggle-status?requesting_admin_id=${adminId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ admin_id: targetAdminId }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          title: "Success",
          description: data.message,
        });
        await fetchAdmins();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to toggle admin status",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle admin status",
      });
    }
  };

  // ✅ Loading state
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-12 w-1/2" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // ✅ Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b p-4 bg-card">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold font-headline">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{adminEmail}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <div className="flex gap-2 mb-8 border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'admins' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Manage Admins
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-6 w-6" />
                  AI Tone & Personality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tone-prompt" className="text-base">System Prompt</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Define the AI's personality and rules. This prompt guides every response.
                  </p>
                  <Textarea
                    id="tone-prompt"
                    placeholder="e.g., You are a helpful and friendly assistant. Always respond in a positive tone."
                    value={tonePrompt}
                    onChange={(e) => setTonePrompt(e.target.value)}
                    className="min-h-[150px] text-base"
                  />
                </div>
                <Button onClick={handleSaveTone} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Tone"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-6 w-6" />
                  Upload Knowledge to AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <AudioRecorder onRecordingComplete={handleRecordedAudio} />
                    <Button 
                      size="lg" 
                      onClick={() => voiceFileRef.current?.click()} 
                      disabled={!!isTranscribing}
                      className="w-full"
                    >
                      <Mic className="mr-2 h-5 w-5" />
                      {isTranscribing ? `Transcribing...` : 'Upload Voice File (MP3/WAV)'}
                    </Button>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => docxFileRef.current?.click()} 
                    variant="secondary" 
                    className="bg-accent text-accent-foreground hover:bg-accent/90 w-full"
                  >
                    <FileIcon className="mr-2 h-5 w-5" />
                    Upload DOCX File
                  </Button>
                  <input 
                    type="file" 
                    ref={voiceFileRef} 
                    onChange={handleFileChange} 
                    accept=".mp3,.wav" 
                    className="hidden" 
                    multiple
                  />
                  <input 
                    type="file" 
                    ref={docxFileRef} 
                    onChange={handleFileChange} 
                    accept=".docx" 
                    className="hidden" 
                    multiple
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Uploaded Files</h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedFiles.length > 0 ? (
                          uploadedFiles.map((file, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{file.name}</TableCell>
                              <TableCell>{file.type}</TableCell>
                              <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                              <TableCell>
                                {isTranscribing === file.name ? (
                                  <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                    <span>Transcribing...</span>
                                  </div>
                                ) : transcriptions.some(t => t.fileName === file.name) ? (
                                  <span className="text-green-600">
                                    {transcriptions.find(t => t.fileName === file.name)?.type === 'recorded' 
                                      ? 'Recorded & Processed' 
                                      : 'Transcribed'}
                                  </span>
                                ) : (
                                  <span>Uploaded</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                              No files uploaded yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-6 w-6" />
                  Recent Uploads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadHistory.length > 0 ? (
                        uploadHistory.map((upload) => (
                          <TableRow key={upload.id}>
                            <TableCell className="font-medium">{upload.filename}</TableCell>
                            <TableCell>{upload.file_type.toUpperCase()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                upload.status === 'success' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {upload.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {upload.chunks && `${upload.chunks} chunks`}
                              {upload.duration && `, ${upload.duration.toFixed(1)}s`}
                            </TableCell>
                            <TableCell>
                              {new Date(upload.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUpload(upload.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                            No upload history available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {transcriptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookText className="h-6 w-6" />
                    Transcriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transcriptions.map((t, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">{t.fileName}</h4>
                      <p className="whitespace-pre-wrap text-sm">{t.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'admins' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Manage Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAdmins ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.length > 0 ? (
                        admins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.username}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {admin.role}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                admin.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {admin.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(admin.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {admin.last_login 
                                ? new Date(admin.last_login).toLocaleString()
                                : 'Never'}
                            </TableCell>
                            <TableCell>
                              {admin.role !== 'super_admin' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleAdminStatus(admin.id)}
                                  className={
                                    admin.is_active 
                                      ? 'text-red-500 hover:text-red-700 hover:bg-red-50' 
                                      : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                                  }
                                >
                                  {admin.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                            No admins found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}