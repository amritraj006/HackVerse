import { useState, useRef } from 'react';
import { Button } from './Button';
import { Upload, Camera, Check, AlertCircle } from 'lucide-react';
import { userService } from '../services/userService';

export const AvatarUpload = ({ currentAvatar, userName, onAvatarUpdated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    setError('');
    setSuccess('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await userService.uploadAvatar(selectedFile);
      setSuccess('Avatar uploaded successfully!');
      setSelectedFile(null);
      if (onAvatarUpdated && res.data) {
        onAvatarUpdated(res.data.avatar, res.data.user);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload avatar image');
    } finally {
      setIsUploading(false);
    }
  };

  const activeAvatar = previewUrl || currentAvatar;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar Circle Preview */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white shadow-xs overflow-hidden flex items-center justify-center text-xl font-bold text-slate-600">
            {activeAvatar ? (
              <img
                src={activeAvatar.startsWith('http') || activeAvatar.startsWith('blob:') ? activeAvatar : `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${activeAvatar}`}
                alt={userName || 'User avatar'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span>{userName ? userName.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
            title="Choose new avatar image"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upload Action Details */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div>
            <h4 className="text-xs font-semibold text-slate-800">Profile Image</h4>
            <p className="text-[11px] text-slate-500">
              JPEG, PNG, GIF or WEBP up to 5MB. Square aspect ratio recommended.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" /> Select Image
            </Button>

            {selectedFile && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Uploading...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Save Avatar
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};
