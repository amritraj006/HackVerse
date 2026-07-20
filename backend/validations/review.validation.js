const { z } = require('zod');

const createReviewSchema = z.object({
  body: z.object({
    scores: z.object({
      innovation: z.number().int().min(1).max(10),
      technicalComplexity: z.number().int().min(1).max(10),
      design: z.number().int().min(1).max(10),
      presentation: z.number().int().min(1).max(10),
    }),
    feedback: z.string().min(5, 'Feedback must be at least 5 characters'),
  }),
});

module.exports = {
  createReviewSchema,
};
