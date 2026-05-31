import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

const ImageUploader = ({ onImageSelected }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Call parent handler (this would usually upload to Supabase storage)
    onImageSelected(file);

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreview(null);
    onImageSelected(null);
  };

  return (
    <div className="w-full">
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-40 bg-slate-50 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-100 hover:border-primary-400 transition-colors group">
          <div className="flex flex-col items-center justify-center pt-5 text-slate-500 group-hover:text-primary-600 transition-colors pb-6">
            <UploadCloud className="w-10 h-10 mb-3" />
            <p className="mb-2 text-sm font-semibold">
              <span className="text-primary-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 flex items-center justify-center">
          <img src={preview} alt="Upload preview" className="object-contain h-full w-full" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
               type="button" 
               onClick={removeImage}
               className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transform scale-90 group-hover:scale-100 transition-all font-medium text-sm flex items-center gap-1"
             >
               <X className="w-4 h-4" /> Remove
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
