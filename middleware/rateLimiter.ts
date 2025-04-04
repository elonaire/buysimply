import { rateLimit } from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes).
  standardHeaders: 'draft-8',
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})
