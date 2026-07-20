const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(Object.values(ROLES)).optional(),
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
};
