"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, File, X } from 'lucide-react';
import { useLanguage } from '@/app/language-context';
import { getSupabaseClient } from '@/lib/supabase';

interface FileUploadProps {
  onFileUploaded?: (url: string, filename: string) => void;
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const { translate } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveUploadedFile = async (url: string) => {
    try {
      // Extract file path from URL
      const path = url.split('/').pop();
      if (!path) return;
      
      // Remove from Supabase storage
      const { error } = await supabase.storage.from('aidata').remove([path]);
      if (error) throw error;
      
      // Update state
      setUploadedFiles(prev => prev.filter(f => f.url !== url));
      toast.success(translate('تم حذف الملف بنجاح', 'File deleted successfully'));
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error(translate('حدث خطأ أثناء حذف الملف', 'Error deleting file'));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(translate('الرجاء اختيار ملف أولاً', 'Please select a file first'));
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('aidata')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('aidata')
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;
      
      // Add to uploaded files list
      setUploadedFiles(prev => [...prev, { url: fileUrl, name: file.name }]);
      
      // Reset file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Callback for parent component
      if (onFileUploaded) {
        onFileUploaded(fileUrl, file.name);
      }

      toast.success(translate('تم رفع الملف بنجاح', 'File uploaded successfully'));
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(translate('حدث خطأ أثناء رفع الملف', 'Error uploading file'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {translate('رفع ملف للذكاء الاصطناعي', 'Upload file for AI')}
        </label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="flex-1"
          />
          {file && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            variant="secondary"
          >
            {uploading ? (
              <div className="flex items-center gap-1">
                <span className="animate-spin">⏳</span>
                {translate('جارٍ الرفع...', 'Uploading...')}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                {translate('رفع', 'Upload')}
              </div>
            )}
          </Button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">
            {translate('الملفات المرفوعة', 'Uploaded Files')}
          </h3>
          <ul className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <li 
                key={index} 
                className="flex items-center justify-between p-2 bg-accent/20 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm truncate max-w-[200px]">
                    {uploadedFile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveUploadedFile(uploadedFile.url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 