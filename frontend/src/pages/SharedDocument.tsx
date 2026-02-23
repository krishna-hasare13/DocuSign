// frontend/src/pages/SharedDocument.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import axios from 'axios';

// Required CSS for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SharedDocument = () => {
  const { token } = useParams();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [numPages, setNumPages] = useState<number>(1);

  useEffect(() => {
    const fetchSharedDoc = async () => {
      try {
        // We use plain axios here instead of apiClient because the user might not be logged in,
        // and we don't want our interceptor to accidentally redirect them to /login!
        const response = await axios.get(`http://localhost:5000/api/documents/public/${token}`);
        setDocument(response.data.document);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedDoc();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Document Not Found</h2>
        <p className="text-slate-500 max-w-md">This shared link may have expired or the document was deleted by the owner.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-900" />
            <span className="text-2xl font-semibold tracking-tight text-slate-900">DocSigner</span>
          </div>
          <Button 
            onClick={() => window.open(document.file_url, '_blank')}
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Document Info */}
      <div className="max-w-4xl mx-auto w-full px-6 pt-8 pb-4">
        <h1 className="text-xl font-medium text-slate-900 truncate mb-2">
          {document.original_hash || 'Shared Document'}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="capitalize px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
            {document.status}
          </span>
          <span>•</span>
          <span>Shared on {new Date(document.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 pb-12">
        <Card className="overflow-hidden shadow-lg border-slate-200 bg-white min-h-[800px] flex justify-center py-8">
          <Document 
            file={document.file_url} 
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            className="max-w-full"
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page 
                key={`page_${index + 1}`}
                pageNumber={index + 1} 
                renderTextLayer={false} 
                renderAnnotationLayer={false}
                width={700}
                className="mb-8 shadow-md border border-slate-200"
              />
            ))}
          </Document>
        </Card>
      </div>
    </div>
  );
};

export default SharedDocument;