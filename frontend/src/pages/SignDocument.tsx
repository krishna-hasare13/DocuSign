// frontend/src/pages/SignDocument.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, PenTool } from 'lucide-react';
import { apiClient } from '../api/axiosClient';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

// Required CSS for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the PDF.js worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- 1. The Draggable Signature Box Component ---
const DraggableSignature = ({ id, position }: { id: string, position: { x: number, y: number } }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  
  // Apply the drag transform to the base position
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: 50,
  };

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      style={style}
      className="border-2 border-dashed border-blue-600 bg-blue-100/50 text-blue-900 w-36 h-12 cursor-grab active:cursor-grabbing flex items-center justify-center rounded shadow-sm font-medium backdrop-blur-sm"
    >
      <PenTool className="w-4 h-4 mr-2" />
      Sign Here
    </div>
  );
};

// --- 2. The Main Page Component ---
const SignDocument = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [signing, setSigning] = useState(false);
  
  // Initial position for the signature box
  const [sigPosition, setSigPosition] = useState({ x: 100, y: 100 });

  useEffect(() => {
    // Fetch the specific document URL from your backend to display it
    const fetchDoc = async () => {
      try {
        const response = await apiClient.get('/documents');
        const doc = response.data.documents.find((d: any) => d.id === documentId);
        if (doc) setDocumentUrl(doc.file_url);
      } catch (error) {
        toast.error("Failed to load document");
      }
    };
    fetchDoc();
  }, [documentId]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Update coordinates when the user finishes dragging
  const handleDragEnd = (event: any) => {
    const { delta } = event;
    setSigPosition(prev => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  const handleFinalizeSignature = async () => {
    setSigning(true);
    const toastId = toast.loading('Applying digital signature...');

    try {
      // In a real app, you'd upload an actual drawn signature image here.
      // For now, we pass a dummy URL that the backend will use to stamp the PDF.
      // Replace your current payload with this one:
        const payload = {
        signatureUrl: 'https://dummyimage.com/150x50/ffffff/000000.png?text=Signed+Document', 
        pageNumber: pageNumber,
        x: sigPosition.x,      // Send raw X pixel
        y: sigPosition.y,      // Send raw Y pixel (No more 800 - y!)
        };

      await apiClient.post(`/documents/${documentId}/sign`, payload);
      
      toast.success('Document signed successfully!', { id: toastId });
      navigate('/dashboard'); // Go back to dashboard to see the green "Signed" badge!
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign document', { id: toastId });
    } finally {
      setSigning(false);
    }
  };

  if (!documentUrl) {
    return <div className="min-h-screen flex items-center justify-center">Loading Document...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col md:flex-row gap-6">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Signature Placement</h3>
            <p className="text-sm text-slate-500 mb-6">
              Drag the blue signature box onto the document where you want your signature to appear.
            </p>
            
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6">
              <Button 
                variant="outline" size="sm" 
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">Page {pageNumber} of {numPages}</span>
              <Button 
                variant="outline" size="sm" 
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button 
              onClick={handleFinalizeSignature} 
              disabled={signing}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white"
            >
              {signing ? 'Processing...' : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalize & Sign Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 bg-slate-300 rounded-xl overflow-auto p-4 flex justify-center items-start shadow-inner h-[85vh]">
        <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <div className="relative shadow-2xl bg-white">
            <Document 
              file={documentUrl} 
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-w-full"
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={false} 
                renderAnnotationLayer={false}
                width={600} // Standardizing width makes coordinate math much easier!
              />
            </Document>
            
            {/* The draggable overlay */}
            <DraggableSignature id="sig-1" position={sigPosition} />
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default SignDocument;