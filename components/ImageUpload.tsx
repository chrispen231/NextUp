'use client';

import { useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Camera, Loader2, Upload } from 'lucide-react';

interface ImageUploadProps {
  userId: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
}

export default function ImageUpload({ userId, onUpload, currentUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('nextup-media') // Ensure this bucket exists in Supabase
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('nextup-media')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-white shadow-lg overflow-hidden relative">
        {currentUrl ? (
          <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="opacity-50">?</span>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
      
      <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
        <Camera size={20} />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
