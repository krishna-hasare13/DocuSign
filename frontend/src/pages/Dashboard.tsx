// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/axiosClient'; 
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  LogOut,
  File,
  Clock,
  CheckCircle2,
  Share2,
  Trash2,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const Dashboard = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.get('/documents');
      setDocuments(response.data.documents);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are supported');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file); 

    try {
      await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/documents/${deleteDocId}`);
      toast.success('Document deleted');
      setDocuments(documents.filter(doc => doc.id !== deleteDocId));
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setDeleteDocId(null);
    }
  };

  const handleShare = async (docId: string) => {
    try {
      const response = await apiClient.post(`/documents/${docId}/share`);
      const shareUrl = `${window.location.origin}/share/${response.data.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const handleDownload = async (fileUrl: string, originalName: string) => {
    const toastId = toast.loading('Downloading document...');
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Signed_${originalName}`; 
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Download complete!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download document', { id: toastId });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const stats = {
    total: documents.length,
    signed: documents.filter(d => d.status === 'signed').length,
    pending: documents.filter(d => d.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-slate-50 noise-bg">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* LOGO CLICK REDIRECT */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/dashboard')}
          >
            <FileText className="h-8 w-8 text-blue-900 transition-transform group-hover:scale-105" />
            <span className="text-2xl font-semibold tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors">
              DocSigner
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:inline-block font-medium">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button
              data-testid="logout-btn"
              onClick={logout}
              variant="outline"
              size="sm"
              className="font-medium"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline-block">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8" data-testid="dashboard">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="p-6">
              <CardDescription className="text-xs uppercase tracking-widest font-semibold">Total Documents</CardDescription>
              <CardTitle className="text-3xl font-semibold tracking-tight">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="p-6">
              <CardDescription className="text-xs uppercase tracking-widest font-semibold">Signed</CardDescription>
              <CardTitle className="text-3xl font-semibold tracking-tight text-green-600">{stats.signed}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="p-6">
              <CardDescription className="text-xs uppercase tracking-widest font-semibold">Pending</CardDescription>
              <CardTitle className="text-3xl font-semibold tracking-tight text-amber-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Documents List */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Your Documents</CardTitle>
              <CardDescription>Manage and sign your documents</CardDescription>
            </div>
            
            <div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
                className="bg-blue-900 hover:bg-blue-800 font-medium tracking-wide"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <File className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No documents yet</p>
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-blue-900 hover:bg-blue-800 font-medium tracking-wide"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    data-testid={`document-item-${doc.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-md hover:shadow-md transition-all duration-200 gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      <File className="h-10 w-10 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate" title={doc.original_hash}>
                          {doc.original_hash}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(doc.status)}
                            <span className="text-sm text-slate-600 capitalize">{doc.status}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:self-center self-end">
                      <Button
                        data-testid={`view-btn-${doc.id}`}
                        onClick={() => navigate(`/sign/${doc.id}`)}
                        variant="outline"
                        size="sm"
                        className="font-medium"
                      >
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline-block">View</span>
                      </Button>
                      <Button
                        data-testid={`share-btn-${doc.id}`}
                        onClick={() => handleShare(doc.id)}
                        variant="outline"
                        size="sm"
                        className="font-medium"
                      >
                        <Share2 className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline-block">Share</span>
                      </Button>
                      
                      {doc.status === 'signed' && (
                        <Button
                          data-testid={`download-btn-${doc.id}`}
                          onClick={() => handleDownload(doc.file_url, doc.original_hash)}
                          variant="outline"
                          size="sm"
                          className="font-medium text-green-700 hover:text-green-800 hover:bg-green-50"
                        >
                          <Download className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline-block">Download</span>
                        </Button>
                      )}

                      <Button
                        data-testid={`delete-btn-${doc.id}`}
                        onClick={() => setDeleteDocId(doc.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document and all its signatures.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;