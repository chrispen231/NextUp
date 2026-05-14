'use client';

import { useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Camera, Loader2, Upload } from 'lucide-react';

interface ImageUploadProps {
  userId: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  isCover?: boolean;
}

export default function ImageUpload({ userId, onUpload, currentUrl, isCover = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${isCover ? 'cover' : 'avatar'}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('nextup-media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('nextup-media')
        .getPublicUrl(fileName);

      onUpload(publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative group ${isCover ? 'w-full h-64' : 'w-24 h-24'}`}>
      <div className={`bg-white rounded-3xl flex items-center justify-center text-blue-600 border-4 border-white shadow-lg overflow-hidden relative ${isCover ? 'w-full h-full' : 'w-24 h-24'}`}>
        {currentUrl ? (
          <img src={currentUrl} alt="Upload" className="w-full h-full object-cover" />
        ) : (
          <Upload className="opacity-50" />
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
      
      <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
        <Camera size={32} />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={uploadImage}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
