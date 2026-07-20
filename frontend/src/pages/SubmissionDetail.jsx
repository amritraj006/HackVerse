import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge, Button, Loader } from '../components/common/UI';
import { Github, ExternalLink, FileText, ChevronLeft, Sliders, MessageSquare } from 'lucide-react';

const SubmissionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [submission, setSubmission] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        const resSub = await api.get(`/submissions/${id}`);
        setSubmission(resSub.data.data.submission);

        const resRev = await api.get(`/reviews/submission/${id}`);
        setReviews(resRev.data.data.reviews);
      } catch (err) {
        showToast('Failed to retrieve submission details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionDetails();
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-10 h-10" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-500">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to={`/hackathons/${submission.hackathon?._id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{submission.projectName}</h1>
          <p className="text-xs text-gray-500">
            Hackathon: <span className="font-semibold text-gray-700">{submission.hackathon?.title}</span> • Team: <span className="font-semibold text-gray-700">{submission.team?.name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Project Details & Screens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project Abstract</h3>
              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">{submission.projectDescription}</p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 font-semibold text-xs text-primary-600">
              <a href={submission.repositoryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                <Github size={16} />
                <span>Codebase Repository</span>
                <ExternalLink size={12} />
              </a>
              {submission.demoUrl && (
                <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                  <ExternalLink size={16} />
                  <span>Interactive Live Demo</span>
                </a>
              )}
              {submission.presentationPdf && (
                <a href={submission.presentationPdf} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-rose-600">
                  <FileText size={16} />
                  <span>Download Slide Deck (PDF)</span>
                </a>
              )}
            </div>
          </div>

          {/* Screenshots Gallery */}
          {submission.screenshots?.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Application Screenshots</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {submission.screenshots.map((url, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden h-40 bg-gray-50 flex items-center justify-center">
                    <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Evaluation Panel */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <Sliders className="text-amber-500" size={16} />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Judge Evaluations ({reviews.length})</h3>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No judge scorecards recorded yet.</p>
          ) : (
            <div className="space-y-6 divide-y divide-gray-100">
              {reviews.map((r, idx) => (
                <div key={r._id} className={`space-y-3 ${idx > 0 ? 'pt-4' : ''}`}>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-[10px]">
                        {r.judge?.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-700">{r.judge?.name}</span>
                    </div>
                    <Badge variant="blue">{r.totalScore.toFixed(2)}/10</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-gray-50/50 p-2.5 rounded border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Innovation:</span>
                      <span className="font-bold text-gray-700">{r.scores.innovation}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Complexity:</span>
                      <span className="font-bold text-gray-700">{r.scores.technicalComplexity}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">UI / Design:</span>
                      <span className="font-bold text-gray-700">{r.scores.design}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Presentation:</span>
                      <span className="font-bold text-gray-700">{r.scores.presentation}/10</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 items-start text-xs text-gray-600 bg-blue-50/20 p-2.5 rounded border border-blue-50">
                    <MessageSquare className="text-primary-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed italic">"{r.feedback}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
