const { z } = require('zod');

const isoDateString = z.string().min(1).refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

const createHackathonSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    requirements: z.string().optional().or(z.literal('')),
    startDate: isoDateString,
    endDate: isoDateString,
    registrationDeadline: isoDateString,
    mode: z.enum(['online', 'in-person']),
    location: z.string().optional().or(z.literal('')),
    theme: z.string().min(2, 'Theme is required'),
    // coerce handles both string "2" and number 2 from HTML forms
    minTeamSize: z.coerce.number().int().min(1).default(1),
    maxTeamSize: z.coerce.number().int().min(1).default(4),
    judges: z.array(z.string()).optional(),
    bannerImage: z.string().optional().or(z.literal('')),
  }).refine((data) => {
    const reg = new Date(data.registrationDeadline);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return reg < start && start < end;
  }, {
    message: 'Registration deadline must be before start date, and start date must be before end date.',
    path: ['startDate'],
  }),
});

const updateHackathonSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    requirements: z.string().optional().or(z.literal('')),
    startDate: isoDateString.optional(),
    endDate: isoDateString.optional(),
    registrationDeadline: isoDateString.optional(),
    mode: z.enum(['online', 'in-person']).optional(),
    location: z.string().optional().or(z.literal('')),
    theme: z.string().min(2).optional(),
    minTeamSize: z.coerce.number().int().min(1).optional(),
    maxTeamSize: z.coerce.number().int().min(1).optional(),
    judges: z.array(z.string()).optional(),
    bannerImage: z.string().optional().or(z.literal('')),
  }),
});

module.exports = {
  createHackathonSchema,
  updateHackathonSchema,
};

