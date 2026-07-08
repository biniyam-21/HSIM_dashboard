"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=320&h=320&fit=crop&crop=faces";

export default function PatientPhotoUploader() {
  const [photo, setPhoto] = useState(DEFAULT_PHOTO);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Release the previous object URL whenever the photo changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (photo.startsWith("blob:")) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  const openPicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-green-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Patient photo" className="w-full h-full object-cover" />
        </div>

        {/* Sits right on the circle's boundary — half overlapping the photo, half outside it */}
        <button
          type="button"
          aria-label="Change photo"
          onClick={openPicker}
          className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Camera size={17} strokeWidth={2} className="text-teal-700" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center">JPG, PNG or WebP. Max size 2MB.</p>

      <button
        type="button"
        onClick={openPicker}
        className="w-full flex items-center justify-center gap-2 h-10 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Upload size={15} strokeWidth={2} />
        Upload Photo
      </button>
    </div>
  );
}
