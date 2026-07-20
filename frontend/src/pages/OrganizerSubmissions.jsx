import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Select, Loader, EmptyState, Button } from '../components/common/UI';
import { FileCode, ExternalLink } from 'lucide-react';

const OrganizerSubmissions = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [hackathons, setHackathons] = useState([]);
  const [selectedHack, setSelectedHack] = useState('');
  const [submissions, setSubmissions] = useState([]);
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

  // 2. Fetch submissions when selected hackathon changes
  useEffect(() => {
    if (!selectedHack) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/submissions/hackathon/${selectedHack}`);
        setSubmissions(res.data.data.submissions);
      } catch (err) {
        showToast('Failed to load submissions for selected event', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
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
        <h1 className="text-xl font-bold text-gray-900">Manage Project Submissions</h1>
        <p className="text-xs text-gray-500">Review team codebases, documentation, and evaluation standings</p>
      </div>

      {hackathons.length === 0 ? (
        <EmptyState
          title="No Hosted Hackathons"
          description="You must create a hackathon event before you can manage submissions."
          icon={<FileCode size={32} />}
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
          ) : submissions.length === 0 ? (
            <EmptyState
              title="No Submissions Yet"
              description="No developer teams have submitted their project deliverables yet."
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Project Title</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Competing Team</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Code Repository</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Submitter</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((sub) => (
                      <tr key={sub._id}>
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {sub.projectName}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{sub.team?.name}</td>
                        <td className="px-6 py-4 text-xs text-primary-600">
                          <a href={sub.repositoryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline font-medium">
                            <span>Repository</span>
                            <ExternalLink size={10} />
                          </a>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {sub.submittedBy?.name} ({sub.submittedBy?.email})
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button onClick={() => navigate(`/submissions/${sub._id}`)} size="sm">
                            View Ratings
                          </Button>
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

export default OrganizerSubmissions;
