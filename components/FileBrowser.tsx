"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Folder, ChevronDown, ChevronRight, Download, ExternalLink, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useLanguage } from '@/app/language-context';
import { FileUpload } from './FileUpload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FileItem = {
  name: string;
  url: string;
  size: number;
  created_at: string;
  type: string;
};

export function FileBrowser() {
  const { translate } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseClient();

  // Fetch files from Supabase storage
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('aidata')
        .list();

      if (error) throw error;

      // Get public URLs for all files
      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('aidata')
            .getPublicUrl(file.name);

          // Extract file type from extension
          const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
          const fileType = getFileType(fileExt);

          return {
            name: file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            created_at: file.created_at || new Date().toISOString(),
            type: fileType
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error(translate('حدث خطأ أثناء جلب الملفات', 'Error fetching files'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchFiles();
    }
  }, [isExpanded]);

  const getFileType = (extension: string): string => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'csv', 'xlsx', 'xls', 'ppt', 'pptx'];
    const codeTypes = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (documentTypes.includes(extension)) return 'document';
    if (codeTypes.includes(extension)) return 'code';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('aidata')
        .remove([fileName]);

      if (error) throw error;

      // Update files list
      setFiles(files.filter(file => file.name !== fileName));
      toast.success(translate('تم حذف الملف بنجاح', 'File deleted successfully'));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(translate('حدث خطأ أثناء حذف الملف', 'Error deleting file'));
    }
  };

  const handleFileUploaded = () => {
    fetchFiles(); // Refresh file list after upload
  };

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center p-2 mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Folder className="h-5 w-5 mr-2" />
          <span>{translate('ملفات الذكاء الاصطناعي', 'AI Files')}</span>
        </div>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {translate('استخدم هذه الملفات كمصدر للذكاء الاصطناعي', 'Use these files as a source for AI')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onFileUploaded={handleFileUploaded} />
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : files.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">
                  {translate('الملفات المتاحة', 'Available Files')}
                </h3>
                <div className="border rounded-md divide-y">
                  {files.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 hover:bg-accent/10"
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium truncate max-w-[200px]">
                            {file.name.split('_').slice(2).join('_')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={file.url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFile(file.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {translate('لم يتم رفع أي ملفات بعد', 'No files uploaded yet')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 