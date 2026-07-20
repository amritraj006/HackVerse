import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Select, Loader, EmptyState, Badge } from '../components/common/UI';
import { ClipboardCheck } from 'lucide-react';

const OrganizerRegistrations = () => {
  const { showToast } = useToast();

  const [hackathons, setHackathons] = useState([]);
  const [selectedHack, setSelectedHack] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 1. Fetch organizer's hackathons on load
  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      try {
        const res = await api.get('/hackathons/organizer');
        const list = res.data.data.hackathons;
        setHackathons(list);
        if (list.length > 0) {
          setSelectedHack(list[0]._id);
        }
      } catch (err) {
        showToast('Failed to load hosted events list', 'error');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchOrganizerEvents();
  }, [showToast]);

  // 2. Fetch registrations when selected hackathon changes
  useEffect(() => {
    if (!selectedHack) return;

    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/registrations/hackathon/${selectedHack}`);
        setRegistrations(res.data.data.registrations);
      } catch (err) {
        showToast('Failed to load registrations for selected event', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [selectedHack, showToast]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-10 h-10" />
      </div>
    );
  }

  const hackOptions = hackathons.map((h) => ({
    value: h._id,
    label: h.title,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manage Event Registrations</h1>
        <p className="text-xs text-gray-500">Monitor attendee rosters and team allocations</p>
      </div>

      {hackathons.length === 0 ? (
        <EmptyState
          title="No Hosted Hackathons"
          description="You must create a hackathon event before you can manage registrations."
          icon={<ClipboardCheck size={32} />}
        />
      ) : (
        <div className="space-y-6">
          <div className="max-w-xs bg-white border border-gray-200 p-4 rounded shadow-subtle">
            <Select
              label="Select Hackathon Event"
              id="eventSelect"
              options={hackOptions}
              value={selectedHack}
              onChange={(e) => setSelectedHack(e.target.value)}
              placeholder={null}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="w-8 h-8" />
            </div>
          ) : registrations.length === 0 ? (
            <EmptyState
              title="No Registrants Yet"
              description="No participants have registered for this hackathon yet."
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Participant Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email Address</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Team Affiliation</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Developer Skills</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {registrations.map((reg) => (
                      <tr key={reg._id}>
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {reg.user?.name}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{reg.user?.email}</td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          {reg.team ? (
                            <Badge variant="blue">{reg.team.name}</Badge>
                          ) : (
                            <span className="text-gray-400 italic">No team formed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                          {reg.user?.skills?.join(', ') || <span className="text-gray-300 italic">No skills entered</span>}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-gray-400">
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizerRegistrations;
