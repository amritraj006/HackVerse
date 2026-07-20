import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Badge, Loader, Modal, EmptyState } from '../components/common/UI';
import { CheckCircle2, AlertCircle, FileText, Github, ExternalLink, Sliders } from 'lucide-react';

const JudgeReviews = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubId = searchParams.get('subId');

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Evaluation Modal states
  const [selectedSub, setSelectedSub] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Scoring states (1-10)
  const [innovation, setInnovation] = useState(5);
  const [technicalComplexity, setTechnicalComplexity] = useState(5);
  const [design, setDesign] = useState(5);
  const [presentation, setPresentation] = useState(5);
  const [feedback, setFeedback] = useState('');

  const fetchReviewsStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
      
      // If activeSubId is in query, trigger review modal immediately
      if (activeSubId && res.data.data) {
        const subItem = res.data.data.pendingSubmissions.find(
          (p) => p.submission._id === activeSubId
        ) || res.data.data.completedSubmissions.find(
          (c) => c.submission._id === activeSubId
        );
        if (subItem) {
          handleOpenReviewModal(subItem.submission, subItem.review);
        }
      }
    } catch (err) {
      showToast('Failed to retrieve judge submissions queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsStats();
  }, [activeSubId, showToast]);

  const handleOpenReviewModal = (submission, existingReview = null) => {
    setSelectedSub(submission);
    if (existingReview) {
      setInnovation(existingReview.scores.innovation);
      setTechnicalComplexity(existingReview.scores.technicalComplexity);
      setDesign(existingReview.scores.design);
      setPresentation(existingReview.scores.presentation);
      setFeedback(existingReview.feedback);
    } else {
      setInnovation(5);
      setTechnicalComplexity(5);
      setDesign(5);
      setPresentation(5);
      setFeedback('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSub(null);
    setSearchParams({}); // Clear query parameters
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!feedback || feedback.length < 5) {
      showToast('Please provide feedback comments (min 5 chars)', 'error');
      return;
    }

    setModalLoading(true);
    try {
      await api.post(`/reviews/submission/${selectedSub._id}`, {
        scores: {
          innovation: parseInt(innovation),
          technicalComplexity: parseInt(technicalComplexity),
          design: parseInt(design),
          presentation: parseInt(presentation),
        },
        feedback,
      });

      showToast('Evaluation review submitted successfully!', 'success');
      handleCloseModal();
      fetchReviewsStats();
    } catch (err) {
      showToast(err.message || 'Failed to submit review evaluation', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Assigned Evaluations</h1>
        <p className="text-xs text-gray-500">Assess project deliverables and provide feedback ratings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Queue */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-subtle p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <AlertCircle className="text-rose-500" size={18} />
            <h3 className="text-sm font-bold text-gray-800">Pending Evaluation Queue</h3>
          </div>
          {stats?.pendingSubmissions?.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No pending submissions. All clean!</p>
          ) : (
            <div className="space-y-3">
              {stats.pendingSubmissions.map(({ submission }) => (
                <div key={submission._id} className="border border-gray-150 p-4 rounded hover:border-primary-300 transition-colors flex justify-between items-center bg-gray-50/20 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-800">{submission.projectName}</h4>
                    <p className="text-gray-400 mt-1">{submission.hackathon?.title} • Team: {submission.team?.name}</p>
                  </div>
                  <Button onClick={() => handleOpenReviewModal(submission)} size="sm">
                    Evaluate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Reviews */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-subtle p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <h3 className="text-sm font-bold text-gray-800">Completed Ratings</h3>
          </div>
          {stats?.completedSubmissions?.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">You haven't graded any projects yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.completedSubmissions.map(({ submission, review }) => (
                <div key={submission._id} className="border border-gray-150 p-4 rounded flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-gray-800">{submission.projectName}</h4>
                    <p className="text-gray-400 mt-0.5">Score: <span className="text-primary-600 font-bold">{review.totalScore.toFixed(2)}/10</span></p>
                    <p className="text-[10px] text-gray-400 italic line-clamp-1 mt-1">"{review.feedback}"</p>
                  </div>
                  <Button onClick={() => handleOpenReviewModal(submission, review)} size="sm" variant="secondary">
                    Revise
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EVALUATION CONSOLE MODAL */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Project Evaluation Console" size="lg">
        {selectedSub && (
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Project Info Block */}
            <div className="border border-gray-100 p-4 rounded bg-gray-50/50 space-y-2 text-xs">
              <h4 className="font-bold text-sm text-gray-800">{selectedSub.projectName}</h4>
              <p className="text-gray-600 leading-relaxed">{selectedSub.projectDescription}</p>
              
              <div className="flex flex-wrap gap-4 pt-2 font-medium text-primary-600">
                <a href={selectedSub.repositoryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                  <Github size={14} />
                  <span>Code Repository</span>
                  <ExternalLink size={10} />
                </a>
                {selectedSub.demoUrl && (
                  <a href={selectedSub.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                    <ExternalLink size={14} />
                    <span>Live Prototype</span>
                  </a>
                )}
                {selectedSub.presentationPdf && (
                  <a href={selectedSub.presentationPdf} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-rose-600">
                    <FileText size={14} />
                    <span>Slide Deck</span>
                  </a>
                )}
              </div>
            </div>

            {/* Grading Sliders */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Sliders size={14} />
                <span>Criteria Scores (1-10)</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="innovation" className="font-semibold text-gray-700">Innovation / Originality</label>
                    <span className="font-bold text-primary-600">{innovation}/10</span>
                  </div>
                  <input
                    id="innovation"
                    type="range"
                    min="1"
                    max="10"
                    value={innovation}
                    onChange={(e) => setInnovation(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="tech" className="font-semibold text-gray-700">Technical Complexity</label>
                    <span className="font-bold text-primary-600">{technicalComplexity}/10</span>
                  </div>
                  <input
                    id="tech"
                    type="range"
                    min="1"
                    max="10"
                    value={technicalComplexity}
                    onChange={(e) => setTechnicalComplexity(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="design" className="font-semibold text-gray-700">UI / UX Design</label>
                    <span className="font-bold text-primary-600">{design}/10</span>
                  </div>
                  <input
                    id="design"
                    type="range"
                    min="1"
                    max="10"
                    value={design}
                    onChange={(e) => setDesign(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="presentation" className="font-semibold text-gray-700">Presentation / Deck</label>
                    <span className="font-bold text-primary-600">{presentation}/10</span>
                  </div>
                  <input
                    id="presentation"
                    type="range"
                    min="1"
                    max="10"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              </div>
            </div>

            {/* Comments Feedback */}
            <div>
              <label htmlFor="feedback" className="block text-xs font-semibold text-gray-600 mb-1">
                Evaluation Comments & Feedback <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="feedback"
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="block w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 shadow-subtle placeholder-gray-400"
                placeholder="What did the team build well? What could be improved?"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button onClick={handleCloseModal} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={modalLoading}>
                Submit Evaluation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default JudgeReviews;
