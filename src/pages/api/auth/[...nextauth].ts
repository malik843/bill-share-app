import { NextApiRequest, NextApiResponse } from 'next'
import { handlers } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // A hacky bridge for Auth.js v5 in Pages Router when only handlers are exported
  if (req.method === 'GET') {
    return (handlers.GET as any)(req, res)
  }
  if (req.method === 'POST') {
    return (handlers.POST as any)(req, res)
  }
  return res.status(405).end()
}
