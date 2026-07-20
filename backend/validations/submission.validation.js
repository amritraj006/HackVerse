const { z } = require('zod');

const createSubmissionSchema = z.object({
  body: z.object({
    projectName: z.string().min(2, 'Project name must be at least 2 characters'),
    projectDescription: z.string().min(10, 'Project description must be at least 10 characters'),
    repositoryUrl: z.string().url('Invalid GitHub/repository URL'),
    demoUrl: z.string().url('Invalid demo URL').or(z.literal('')).optional(),
  }),
});

module.exports = {
  createSubmissionSchema,
};
