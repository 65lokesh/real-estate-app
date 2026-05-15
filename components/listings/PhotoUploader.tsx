"use client";

import { useState, useRef } from "react";

interface Photo {
  url: string;
  publicId: string;
}

interface Props {
  listingId: string;
  onUploadComplete?: (photos: Photo[]) => void;
}

export default function PhotoUploader({ listingId, onUploadComplete }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    await fetch(`/api/listings/${listingId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: data.url, publicId: data.publicId }),
    });

    return { url: data.url, publicId: data.publicId };
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const newPhotos: Photo[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const photo = await uploadFile(file);
        newPhotos.push(photo);
      } catch (err) {
        console.error("Upload failed for", file.name);
      }
    }

    const updated = [...photos, ...newPhotos];
    setPhotos(updated);
    onUploadComplete?.(updated);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onUploadComplete?.(updated);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="text-4xl mb-3">📸</div>
        {uploading ? (
          <p className="text-blue-600 font-medium text-sm">Uploading...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium text-sm">
              Drop photos here or click to upload
            </p>
            <p className="text-gray-400 text-xs mt-1">
              JPG, PNG up to 10MB — multiple allowed
            </p>
          </>
        )}
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden h-28">
              <img
                src={photo.url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {i === 0 && (
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}