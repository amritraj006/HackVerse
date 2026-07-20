import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Badge, Loader, EmptyState } from '../components/common/UI';
import { Users, Search } from 'lucide-react';

const AdminUsers = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await api.get('/users', { params });
      setUsers(res.data.data.users);
    } catch (err) {
      showToast('Failed to load user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const roleColors = {
    admin: 'rose',
    organizer: 'purple',
    judge: 'amber',
    participant: 'blue'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">User Directory</h1>
        <p className="text-xs text-gray-500">Search and filter all registered users in the platform database</p>
      </div>

      {/* Filter toolbar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 border border-gray-200 rounded-lg shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <Input
          label="Search Users"
          id="search"
          placeholder="Name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          label="Filter by Role"
          id="roleFilter"
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'organizer', label: 'Organizer' },
            { value: 'judge', label: 'Judge' },
            { value: 'participant', label: 'Participant' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          placeholder="All Roles"
        />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Search
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearch('');
              setRoleFilter('');
              setUsers([]);
              // We trigger fetch by setting states, or call direct
              setTimeout(() => fetchUsers(), 0);
            }}
          >
            Reset
          </Button>
        </div>
      </form>

      {/* Directory Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-10 h-10" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description="We couldn't find any users matching your query parameters in the directory."
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email Address</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Bio / Skills</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-semibold text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={roleColors[u.role] || 'gray'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                      {u.role === 'participant' && u.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.skills.map((s, i) => (
                            <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        u.bio || <span className="text-gray-300 italic">No bio</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
