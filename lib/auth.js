import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

export async function hashPassword(p) {
  return await bcrypt.hash(p, 10)
}

export async function checkPassword(p, hash) {
  return await bcrypt.compare(p, hash)
}

export function getUserFromRequest(req) {
  try {
    // 1. Try Authorization Header
    const auth = req.headers.get('authorization') || ''
    const headerToken = auth.replace('Bearer ', '').trim()
    if (headerToken) {
      const decoded = verifyToken(headerToken)
      if (decoded) return decoded
    }
    
    // 2. Try Cookies (Next.js req.cookies)
    if (req.cookies && typeof req.cookies.get === 'function') {
      const cookieToken = req.cookies.get('token')?.value
      if (cookieToken) {
        const decoded = verifyToken(cookieToken)
        if (decoded) return decoded
      }
    }

    // 3. Manual Cookie Header Parsing
    const cookieHeader = req.headers.get('cookie') || ''
    if (cookieHeader) {
      const match = cookieHeader.match(/token=([^;]+)/)
      if (match) {
        const decoded = verifyToken(match[1])
        if (decoded) return decoded
      }
    }

    return null
  } catch (err) {
    console.error('getUserFromRequest error:', err)
    return null
  }
}
