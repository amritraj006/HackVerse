import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input } from '../components/common/UI';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      showToast('Name is required', 'error');
      return;
    }

    const skillsArray = skills
      ? skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    setLoading(true);
    try {
      await updateProfile({
        name,
        profileImage,
        bio,
        skills: skillsArray,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Account Profile</h1>
        <p className="text-xs text-gray-500">Update your public details and skills</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-4">
        {/* Profile Image Preview */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Avatar Preview"
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold uppercase">
              {name.charAt(0)}
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-gray-800">Avatar Icon</h4>
            <p className="text-[10px] text-gray-400">Provide an image URL below to set your avatar</p>
          </div>
        </div>

        <Input
          label="Full Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Registered Email (ReadOnly)"
          id="email"
          value={user?.email || ''}
          disabled
          className="opacity-75"
        />

        <Input
          label="Profile Image URL"
          id="profileImage"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
          placeholder="https://images.unsplash.com/... or /uploads/..."
        />

        {user?.role === 'participant' && (
          <Input
            label="Tech Skills (comma-separated)"
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, CSS, Node.js, Python"
          />
        )}

        <div>
          <label htmlFor="bio" className="block text-xs font-semibold text-gray-600 mb-1">
            About Bio
          </label>
          <textarea
            id="bio"
            rows="3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="block w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 shadow-subtle placeholder-gray-400"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            loading={loading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
