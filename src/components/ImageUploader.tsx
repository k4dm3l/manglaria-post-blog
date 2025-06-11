import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';

interface ImageUploaderProps {
  onImageUploaded: (url: string, publicId: string) => void;
  initialImage?: string;
  folder?: string;
}

export default function ImageUploader({ 
  onImageUploaded, 
  initialImage,
  folder
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Create a temporary URL for the file
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Upload to our API endpoint
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: base64,
            folder
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const result = await response.json();
        setPreview(result.url);
        onImageUploaded(result.url, result.public_id || '');
      };
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onImageUploaded, folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loading size="md" variant="dots" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : isDragActive ? (
          <p>Drop the image here...</p>
        ) : (
          <div className="space-y-2">
            <p>Drag and drop an image here, or click to select</p>
            <p className="text-sm text-muted-foreground">
              Supports: PNG, JPG, JPEG, GIF, WEBP (max 5MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {preview && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              setPreview(null);
              onImageUploaded('', '');
            }}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
} 