const submissionService = require('../services/submission.service');
const APIResponse = require('../utils/apiResponse');

const createOrUpdateSubmission = async (req, res, next) => {
  try {
    const { hackathonId, projectName, projectDescription, repositoryUrl, demoUrl } = req.body;
    
    let presentationPdf = undefined;
    if (req.files && req.files['presentationPdf']) {
      presentationPdf = `/uploads/${req.files['presentationPdf'][0].filename}`;
    }

    let screenshots = undefined;
    if (req.files && req.files['screenshots']) {
      screenshots = req.files['screenshots'].map(file => `/uploads/${file.filename}`);
    }

    const submission = await submissionService.createOrUpdateSubmission(req.user._id, {
      hackathonId,
      projectName,
      projectDescription,
      repositoryUrl,
      demoUrl,
      presentationPdf,
      screenshots,
    });

    res.status(200).json(new APIResponse(200, { submission }, 'Project submitted successfully'));
  } catch (error) {
    next(error);
  }
};

const getSubmissionDetails = async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmissionDetails(req.params.id);
    res.status(200).json(new APIResponse(200, { submission }, 'Submission details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getTeamSubmission = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const submission = await submissionService.getTeamSubmission(teamId);
    res.status(200).json(new APIResponse(200, { submission }, 'Team submission retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getHackathonSubmissions = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const submissions = await submissionService.getHackathonSubmissions(hackathonId);
    res.status(200).json(new APIResponse(200, { submissions }, 'Hackathon submissions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateSubmission,
  getSubmissionDetails,
  getTeamSubmission,
  getHackathonSubmissions,
};
