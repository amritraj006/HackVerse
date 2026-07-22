import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { AvatarUpload } from '../components/AvatarUpload';
import { userService } from '../services/userService';
import { User, Mail, Sparkles, Save, Check } from 'lucide-react';

export const Profile = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [currentProfile, setCurrentProfile] = useState(() => user);
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : user?.skills || '',
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (successMsg) setSuccessMsg('');
    if (errorMsg) setErrorMsg('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await userService.updateProfile({
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills,
      });

      if (res && res.data) {
        setCurrentProfile(res.data);
        const token = localStorage.getItem('token');
        login(res.data, token);
        setSuccessMsg('Profile updated successfully!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpdated = (newAvatarUrl, updatedUser) => {
    const nextUser = updatedUser || { ...currentProfile, avatar: newAvatarUrl };
    setCurrentProfile(nextUser);
    const token = localStorage.getItem('token');
    login(nextUser, token);
  };

  const displayAvatar = currentProfile?.avatar;

  return (
    <div className="space-y-5">
      {/* Profile Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar Circle */}
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center border-2 border-white shadow-xs shrink-0 overflow-hidden">
            {displayAvatar ? (
              <img
                src={
                  displayAvatar.startsWith('http') || displayAvatar.startsWith('blob:')
                    ? displayAvatar
                    : `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${displayAvatar}`
                }
                alt={currentProfile?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span>{currentProfile?.name ? currentProfile.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-base font-bold text-slate-900">{currentProfile?.name || 'Developer User'}</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                {currentProfile?.role || 'participant'}
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentProfile?.email || 'dev@hackverse.io'}
            </p>

            <p className="text-xs text-slate-600 pt-1 max-w-xl">
              {currentProfile?.bio || 'No bio added yet. Click "Edit Profile" to customize your profile summary.'}
            </p>
          </div>
        </div>

        {/* Skills Pills */}
        {currentProfile?.skills && currentProfile.skills.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Skills:</span>
            {currentProfile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded-md border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'edit'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('avatar')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'avatar'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Avatar Image
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Account Details & Summary</span>}>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Full Name</span>
                <p className="font-semibold text-slate-800">{currentProfile?.name}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Email Address</span>
                <p className="font-semibold text-slate-800">{currentProfile?.email}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Assigned System Role</span>
                <p className="font-semibold text-indigo-600 uppercase">{currentProfile?.role}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Account Status</span>
                <p className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Active & Verified
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'edit' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Edit Profile Information</span>}>
          <div className="space-y-4">
            <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
            <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <Input
                label="Full Name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                required
              />

              <div className="space-y-1">
                <label htmlFor="bio" className="block text-xs font-semibold text-slate-700">
                  Bio / Summary
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell the community about your expertise and hackathon interests..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <Input
                label="Skills (Comma Separated)"
                id="skills"
                placeholder="React, Node.js, Python, Tailwind CSS, LLMs"
                value={formData.skills}
                onChange={handleChange}
                icon={Sparkles}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="mt-2 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving Changes...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </span>
                )}
              </Button>
            </form>
          </div>
        </Card>
      )}

      {activeTab === 'avatar' && (
        <Card header={<span className="font-semibold text-xs text-slate-800">Upload Profile Avatar</span>}>
          <AvatarUpload
            currentAvatar={currentProfile?.avatar}
            userName={currentProfile?.name}
            onAvatarUpdated={handleAvatarUpdated}
          />
        </Card>
      )}
    </div>
  );
};
