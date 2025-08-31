import React, { useState } from 'react';
import { FaPlus, FaUpload } from 'react-icons/fa';
import { accountHash } from '@/lib/env';

interface ImageUploaderProps {
  setSelectedFile: (file: File) => void;
  setClass?: string; // คลาสตกแต่งเพิ่มเติม
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // ขนาด responsive
  showImg?: string;
}

const sizeClasses = {
  xs: 'w-20 h-20 sm:w-24 sm:h-24',
  sm: 'w-28 h-28 sm:w-36 sm:h-36',
  md: 'w-40 h-40 sm:w-48 sm:h-48',
  lg: 'w-52 h-52 sm:w-64 sm:h-64',
  xl: 'w-64 h-64 sm:w-80 sm:h-80',
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  setSelectedFile,
  setClass = '',
  size = 'sm',
  showImg,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  return (
    <div className={`relative max-w-max mx-auto ${setClass}`}>
      <div className="absolute top-1 right-1 z-10">
        <input
          type="file"
          id="imgRank"
          name="imgRank"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <label
          htmlFor="imgRank"
          className="flex w-6 h-6 sm:w-8 sm:h-8 border border-green-500 bg-white rounded-full cursor-pointer shadow-md hover:bg-gray-100 transition-all"
        >
          <FaUpload className="m-auto text-xs sm:text-sm" />
        </label>
      </div>

      <div className={`relative ${sizeClasses[size]} rounded-md border-2 border-green-500 shadow-md flex items-center justify-center overflow-hidden`}>
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : showImg && !imageLoadError ? (
          <img
            src={`https://imagedelivery.net/${accountHash}/${showImg}/wsm`}
            alt="Current image"
            className="w-full h-full object-cover"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <FaPlus className="text-gray-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl" />
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
