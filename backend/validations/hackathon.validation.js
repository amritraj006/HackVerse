const { z } = require('zod');

const createHackathonSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    requirements: z.string().optional(),
    startDate: z.string().datetime({ message: 'Invalid start date format (ISO 8601 required)' }),
    endDate: z.string().datetime({ message: 'Invalid end date format (ISO 8601 required)' }),
    registrationDeadline: z.string().datetime({ message: 'Invalid registration deadline format (ISO 8601 required)' }),
    mode: z.enum(['online', 'in-person']),
    location: z.string().optional(),
    theme: z.string().min(2, 'Theme is required'),
    minTeamSize: z.number().int().min(1).default(1),
    maxTeamSize: z.number().int().min(1).default(4),
    judges: z.array(z.string()).optional(),
  }).refine((data) => {
    const reg = new Date(data.registrationDeadline);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return reg < start && start < end;
  }, {
    message: "Registration deadline must be before start date, and start date must be before end date.",
    path: ["startDate"]
  }),
});

const updateHackathonSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    requirements: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    registrationDeadline: z.string().datetime().optional(),
    mode: z.enum(['online', 'in-person']).optional(),
    location: z.string().optional(),
    theme: z.string().min(2).optional(),
    minTeamSize: z.number().int().min(1).optional(),
    maxTeamSize: z.number().int().min(1).optional(),
    judges: z.array(z.string()).optional(),
  }),
});

module.exports = {
  createHackathonSchema,
  updateHackathonSchema,
};
