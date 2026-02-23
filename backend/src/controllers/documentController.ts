import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { stampSignatureOnPdf } from '../utils/pdfSigner';
import axios from 'axios';

// POST /api/documents/upload
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    // 1. Check if Multer actually caught a file
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 2. Generate a unique filename organized by user ID
    const fileName = `${userId}/${Date.now()}_${file.originalname}`;

    // 3. Upload the file buffer directly to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents') // Ensure this bucket exists in your Supabase dashboard
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (storageError) {
      console.error('Supabase Storage Error:', storageError);
      throw new Error('Failed to upload file to storage');
    }

    // 4. Get the public URL for the newly uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // 5. Save the document metadata in the Supabase database
    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert([
        {
          owner_id: userId,
          file_url: publicUrl,
          status: 'pending',
          original_hash: file.originalname, // In production, consider generating a real SHA-256 hash of the buffer here
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase DB Error:', dbError);
      throw new Error('Failed to save document record');
    }

    res.status(201).json({ message: 'Document uploaded successfully', document: dbData });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// GET /api/documents
export const getUserDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    // Fetch documents belonging to this user from the Supabase database
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase DB Error:', error);
      throw new Error('Failed to fetch from database');
    }

    res.status(200).json({ documents });
  } catch (error) {
    console.error('Fetch Documents Error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// POST /api/documents/:id/sign
export const signDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const documentId = req.params.id;
    const { signatureUrl, pageNumber, x, y } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Fetch document metadata to ensure it exists and get the original file URL
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // 2. Download original PDF and Signature Image as ArrayBuffers into memory
    const pdfResponse = await axios.get(doc.file_url, { responseType: 'arraybuffer' });
    const sigResponse = await axios.get(signatureUrl, { 
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
      });

    // 3. Stamp the PDF using our pdf-lib utility
    const signedPdfBytes = await stampSignatureOnPdf(
      pdfResponse.data,
      sigResponse.data,
      pageNumber,
      x,
      y
    );

    // 4. Upload the new Signed PDF to Supabase Storage
    const signedFileName = `signed/${doc.owner_id}/${Date.now()}_signed.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(signedFileName, signedPdfBytes, {
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      throw new Error('Failed to upload signed document to storage');
    }

    // Get the new public URL for the signed document
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(signedFileName);

    // 5. Update the Database record to reflect the new status and URL
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        status: 'signed',
        file_url: publicUrl // Point the database record to the new signed version
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Supabase DB Error:', updateError);
      throw new Error('Failed to update document status in database');
    }

    res.status(200).json({ 
      success: true, 
      message: 'Document signed successfully!', 
      url: publicUrl 
    });
  } catch (error) {
    console.error('Signing Error:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const documentId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Verify the user actually owns this document
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('owner_id', userId)
      .single();

    if (fetchError || !doc) {
      res.status(404).json({ error: 'Document not found or unauthorized' });
      return;
    }

    // 2. Delete the record from the Supabase database
    // (Note: To keep this simple, we are just deleting the DB record. 
    // In production, you would also use supabase.storage.from('documents').remove() to delete the actual files)
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('Supabase DB Delete Error:', deleteError);
      throw new Error('Failed to delete document from database');
    }

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// POST /api/documents/:id/share
export const shareDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const documentId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Verify the user owns this document
    const { data: doc, error } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('owner_id', userId)
      .single();

    if (error || !doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // 2. Return the document ID as the share token
    res.status(200).json({ share_token: doc.id });
  } catch (error) {
    console.error('Share Error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

// GET /api/documents/public/:token
export const getPublicDocument = async (req: Request<{ token: string }>, res: Response): Promise<void> => {
  try {
    const token = req.params.token;
    
    // Fetch the document details without checking owner_id
    const { data: doc, error } = await supabase
      .from('documents')
      .select('file_url, original_hash, status, created_at')
      .eq('id', token)
      .single();

    if (error || !doc) {
      res.status(404).json({ error: 'Document not found or link expired' });
      return;
    }

    res.status(200).json({ document: doc });
  } catch (error) {
    console.error('Public Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};