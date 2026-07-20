const { z } = require('zod');

const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Team name must be at least 2 characters'),
    hackathon: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Hackathon ID format'),
    logo: z.string().optional().or(z.literal('')),
  }),
});

const joinTeamSchema = z.object({
  body: z.object({
    inviteCode: z.string().min(1, 'Invite code is required'),
  }),
});

module.exports = {
  createTeamSchema,
  joinTeamSchema,
};
