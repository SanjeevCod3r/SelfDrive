import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { getDb } from '@/lib/mongo'
import { signToken, verifyToken, hashPassword, checkPassword, getUserFromRequest } from '@/lib/auth'
import { uploadDataUri, isCloudinaryConfigured } from '@/lib/cloudinary'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const ok = (data, status = 200) => NextResponse.json(data, { status })
const err = (message, status = 400) => NextResponse.json({ error: message }, { status })

// --- Helpers ---
async function requireAuth(req) {
  const u = getUserFromRequest(req)
  if (!u) return null
  const db = await getDb()
  
  // Try finding by 'id' (uuid string) or '_id'
  let user = await db.collection('users').findOne({ id: u.userId })
  
  if (!user && u.userId?.length === 24) {
    try {
      const { ObjectId } = require('mongodb')
      user = await db.collection('users').findOne({ _id: new ObjectId(u.userId) })
    } catch (e) {}
  }

  // Final fallback: Try finding by email (since it's also in the token)
  if (!user && u.email) {
    user = await db.collection('users').findOne({ email: u.email })
  }
  
  if (user && !user.id) user.id = user._id.toString()
  return user
}

async function requireAdmin(req) {
  // First check admin_token cookie (set by the admin login page)
  let adminToken = req.cookies?.get?.('admin_token')?.value
  if (!adminToken) {
    const cookieHeader = req.headers.get('cookie') || ''
    const match = cookieHeader.match(/admin_token=([^;]+)/)
    if (match) adminToken = match[1]
  }
  if (!adminToken) {
    const auth = req.headers.get('authorization') || ''
    if (auth.startsWith('Bearer ')) adminToken = auth.slice(7).trim()
  }
  if (adminToken) {
    const decoded = verifyToken(adminToken)
    if (decoded && decoded.isAdmin) {
      const db = await getDb()
      const user = await db.collection('users').findOne({ email: decoded.email })
      if (user && (user.isAdmin || user.role === 'admin')) {
        if (!user.id) user.id = user._id.toString()
        return user
      }
    }
  }
  // Fallback: check regular auth token
  const user = await requireAuth(req)
  if (!user || (!user.isAdmin && user.role !== 'admin')) return null
  return user
}

function calcRentalDays(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
}

async function ensureSeed() {
  const db = await getDb()
  // Seed admin
  const adminExists = await db.collection('users').findOne({ email: 'admin@kasika.com' })
  if (!adminExists) {
    const hashed = await hashPassword('admin123')
    await db.collection('users').insertOne({
      id: uuidv4(),
      name: 'Kashi Ka Admin',
      email: 'admin@kasika.com',
      password: hashed,
      phone: '9000000000',
      isAdmin: true,
      role: 'admin',
      isPremium: true,
      points: 500,
      subscription: null,
      createdAt: new Date(),
    })
  }
  // Remove the original demo/seed cars so only cars added from the admin
  // panel are ever shown. Matched by their unique stock-photo URLs, so this
  // never deletes anything an admin uploads. Idempotent.
  const SEED_CAR_IMAGES = [
    'https://images.pexels.com/photos/12463311/pexels-photo-12463311.jpeg',
    'https://images.unsplash.com/photo-1616932321030-16411c3a6489',
    'https://images.pexels.com/photos/19076555/pexels-photo-19076555.jpeg',
    'https://images.unsplash.com/photo-1592853625597-7d17be820d0c',
    'https://images.unsplash.com/photo-1504366130991-154787072d46',
    'https://images.pexels.com/photos/10969159/pexels-photo-10969159.jpeg',
    'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg',
  ]
  await db.collection('cars').deleteMany({ image: { $in: SEED_CAR_IMAGES } })
  // Remove the original demo/seed subscription packages so only packages
  // added from the admin panel are shown. Admin-created packages get a uuid
  // id, so deleting these fixed ids never touches real ones. Idempotent.
  await db.collection('packages').deleteMany({ id: { $in: ['monthly', 'yearly'] } })
  // No blog seeding - blogs will be created via admin panel
}

// Run seeding once at module load
ensureSeed().catch(e => console.error('Seed error:', e))

// ---- Router ----
async function handleRoute(req, method, segments) {
  const path = '/' + segments.join('/')
  console.log(`[API] ${method} ${path}`, segments)
  const db = await getDb()

  // ---- Health ----
  if (path === '/' || path === '') return ok({ ok: true, app: 'Kashi Ka Self Drive Car' })

  // ---- Auth ----
  if (path === '/auth/signup' && method === 'POST') {
    const body = await req.json()
    const { name, email, password, phone } = body
    if (!name || !email || !password) return err('Missing fields')
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() })
    if (existing) return err('Email already registered')
    const hashed = await hashPassword(password)
    const user = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone: phone || '',
      isAdmin: false,
      isPremium: false,
      points: 0,
      subscription: null,
      createdAt: new Date(),
    }
    await db.collection('users').insertOne(user)
    const token = signToken({ userId: user.id || user._id.toString(), email: user.email, isAdmin: false })
    const { password: _, ...safe } = user
    const userData = { ...safe, id: user.id || user._id.toString() }
    if (user.isAdmin) userData.role = 'admin'
    const response = ok({ token, user: userData })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  }

  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = await req.json()
    const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() })
    if (!user) return err('Invalid credentials', 401)
    const match = await checkPassword(password, user.password)
    if (!match) return err('Invalid credentials', 401)
    const token = signToken({ userId: user.id || user._id.toString(), email: user.email, isAdmin: !!user.isAdmin })
    const { password: _, ...safe } = user
    const userData = { ...safe, id: user.id || user._id.toString() }
    if (user.isAdmin) userData.role = 'admin'
    const response = ok({ token, user: userData })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  }

  // Reset password — verifies identity via registered email + phone, then sets
  // a new password. (No email service is configured, so this is the lightweight
  // verification path; swap for a token+email link flow once SMTP is added.)
  if (path === '/auth/forgot-password' && method === 'POST') {
    const { email, phone, newPassword } = await req.json()
    if (!email || !phone || !newPassword) return err('Email, registered phone and new password are required')
    if (String(newPassword).length < 6) return err('Password must be at least 6 characters')
    const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() })
    if (!user) return err('No account found with that email', 404)
    const normalize = (p) => String(p || '').replace(/\D/g, '').slice(-10)
    if (!user.phone || normalize(user.phone) !== normalize(phone)) {
      return err('Phone number does not match our records', 403)
    }
    const hashed = await hashPassword(newPassword)
    await db.collection('users').updateOne({ id: user.id || user._id.toString() }, { $set: { password: hashed } })
    return ok({ success: true })
  }

  if (path === '/auth/logout' && method === 'POST') {
    const response = ok({ success: true })
    response.cookies.set('token', '', { maxAge: 0, path: '/' })
    return response
  }

  if (path === '/auth/me' && method === 'GET') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    const { password: _, ...safe } = user
    const userData = { ...safe }
    if (user.isAdmin) userData.role = 'admin'
    return ok({ user: userData })
  }

  // Update the logged-in user's profile (name & phone)
  if (path === '/auth/me' && method === 'PUT') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    const body = await req.json()
    const updates = {}
    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim()
    if (typeof body.phone === 'string') updates.phone = body.phone.trim()
    if (Object.keys(updates).length === 0) return err('Nothing to update')
    await db.collection('users').updateOne({ id: user.id }, { $set: updates })
    const updated = await db.collection('users').findOne({ id: user.id })
    const { password: _, _id, ...safe } = updated
    const userData = { ...safe, id: updated.id || _id.toString() }
    if (updated.isAdmin) userData.role = 'admin'
    return ok({ user: userData })
  }

  // ---- ADMIN PANEL LOGIN (separate from website login) ----
  if (path === '/admin-login' && method === 'POST') {
    const { email, password } = await req.json()
    const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() })
    if (!user) return err('Invalid credentials', 401)
    if (!user.isAdmin && user.role !== 'admin') return err('Access denied. Not an admin.', 403)
    const match = await checkPassword(password, user.password)
    if (!match) return err('Invalid credentials', 401)
    const token = signToken({ userId: user.id || user._id.toString(), email: user.email, isAdmin: true, role: 'admin' })
    const { password: _, ...safe } = user
    const userData = { ...safe, id: user.id || user._id.toString(), role: 'admin' }
    const response = ok({ token, user: userData })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  }

  // ---- ADMIN PANEL LOGOUT ----
  if (path === '/admin-logout' && method === 'POST') {
    const response = ok({ success: true })
    response.cookies.set('admin_token', '', { maxAge: 0, path: '/' })
    return response
  }

  // ---- ADMIN PANEL: VERIFY SESSION ----
  if (path === '/admin-me' && method === 'GET') {
    // Check admin_token cookie (separate from user 'token' cookie)
    let adminToken = req.cookies?.get?.('admin_token')?.value
    if (!adminToken) {
      const cookieHeader = req.headers.get('cookie') || ''
      const match = cookieHeader.match(/admin_token=([^;]+)/)
      if (match) adminToken = match[1]
    }
    // Also accept Bearer token from Authorization header (for localStorage fallback)
    if (!adminToken) {
      const auth = req.headers.get('authorization') || ''
      if (auth.startsWith('Bearer ')) adminToken = auth.slice(7).trim()
    }
    if (!adminToken) return err('Not authenticated', 401)
    const decoded = verifyToken(adminToken)
    if (!decoded || !decoded.isAdmin) return err('Invalid session', 401)
    const user = await db.collection('users').findOne({ email: decoded.email })
    if (!user || (!user.isAdmin && user.role !== 'admin')) return err('Access denied', 403)
    const { password: _p, ...safe } = user
    return ok({ user: { ...safe, id: user.id || user._id.toString(), role: 'admin' } })
  }

  if (path === '/cars' && method === 'GET') {
    const serviceType = req.nextUrl.searchParams.get('serviceType')
    const filter = {}
    if (serviceType) {
      filter.$or = [{ serviceType: serviceType }, { serviceType: 'both' }]
    }
    const cars = await db.collection('cars').find(filter).sort({ createdAt: -1 }).toArray()
    return ok({ cars: cars.map(({ _id, ...c }) => ({ ...c, _id: _id.toString() })) })
  }

  // GET /api/cars/:id
  if (segments[0] === 'cars' && segments.length === 2 && method === 'GET') {
    const carId = segments[1]
    let car = await db.collection('cars').findOne({ id: carId })
    
    if (!car && carId.length === 24) {
      try {
        const { ObjectId } = require('mongodb')
        car = await db.collection('cars').findOne({ _id: new ObjectId(carId) })
      } catch (e) {}
    }
    
    if (!car) return err('Car not found', 404)
    const { _id, ...rest } = car
    return ok({ car: { ...rest, _id: _id.toString() } })
  }

  // ---- Admin: Cars ----
  if (path.startsWith('/admin/cars') && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    
    const filter = {}
    if (path === '/admin/cars-self') filter.serviceType = 'self-drive'
    if (path === '/admin/cars-driver') filter.serviceType = 'with-driver'
    
    const cars = await db.collection('cars').find(filter).sort({ createdAt: -1 }).toArray()
    return ok({ cars: cars.map(({ _id, ...c }) => ({ ...c, _id: _id.toString() })) })
  }

  if (path === '/admin/cars' && method === 'POST') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const body = await req.json()
    const car = {
      id: uuidv4(),
      ...body,
      pricePerDay: Number(body.pricePerDay) || 0,
      seats: Number(body.seats) || 4,
      createdAt: new Date(),
    }
    await db.collection('cars').insertOne(car)
    return ok({ car })
  }

  if (path.startsWith('/admin/cars/') && method === 'DELETE') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const carId = segments[2]
    await db.collection('cars').deleteOne({ id: carId })
    return ok({ success: true })
  }

  // ---- Admin: Users ----
  if (path === '/admin/users' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ users: users.map(({ password: _, _id, ...u }) => ({ ...u, _id: _id.toString() })) })
  }

  // ---- Admin: Users & Bookings ----
  if (path === '/admin/users' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ users: users.map(({ _id, password, ...u }) => ({ ...u, _id: _id.toString() })) })
  }

  if (path.startsWith('/admin/bookings') && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    
    const filter = { type: { $ne: 'subscription' } }
    // Filter by booking type — the frontend passes ?type=self-drive / ?type=with-driver
    const typeParam = req.nextUrl.searchParams.get('type')
    if (typeParam === 'self-drive' || path === '/admin/bookings-self') filter.bookingType = 'self-drive'
    if (typeParam === 'with-driver' || path === '/admin/bookings-driver') filter.bookingType = 'with-driver'

    const bookings = await db.collection('bookings').aggregate([
      { $match: filter },
      { $lookup: { from: 'users', localField: 'userId', foreignField: 'id', as: 'userDoc' } },
      // Fall back to the user's profile phone for older bookings that didn't store it
      { $addFields: { userPhone: { $ifNull: ['$userPhone', { $arrayElemAt: ['$userDoc.phone', 0] }] } } },
      { $project: { userDoc: 0 } },
      { $sort: { createdAt: -1 } },
    ]).toArray()
    return ok({ bookings: bookings.map(({ _id, ...b }) => ({ ...b, _id: _id.toString() })) })
  }

  if (segments[0] === 'admin' && segments[1] === 'cars' && segments.length === 3) {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    if (method === 'PUT') {
      const body = await req.json()
      delete body._id
      delete body.id
      await db.collection('cars').updateOne({ id: segments[2] }, { $set: body })
      const car = await db.collection('cars').findOne({ id: segments[2] })
      const { _id, ...safe } = car
      return ok({ car: safe })
    }
    if (method === 'DELETE') {
      await db.collection('cars').deleteOne({ id: segments[2] })
      return ok({ deleted: true })
    }
  }

  // ---- Coupons ----
  if (path === '/coupons' && method === 'GET') {
    const coupons = await db.collection('coupons').find({ active: true }).toArray()
    return ok({ coupons: coupons.map(({ _id, ...c }) => ({ ...c, _id: _id.toString() })) })
  }
  if (path === '/admin/coupons' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const coupons = await db.collection('coupons').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ coupons: coupons.map(({ _id, ...c }) => ({ ...c, _id: _id.toString() })) })
  }

  if (path === '/admin/coupons' && method === 'POST') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const body = await req.json()
    const coupon = {
      id: uuidv4(),
      code: (body.code || '').toUpperCase(),
      discountType: body.discountType || 'percent',
      discount: Number(body.discount) || 0,
      minAmount: Number(body.minAmount) || 0,
      maxDiscount: Number(body.maxDiscount) || 0,
      active: true,
      createdAt: new Date(),
    }
    await db.collection('coupons').insertOne(coupon)
    const { _id, ...safe } = coupon
    return ok({ coupon: safe })
  }

  if (path === '/coupons/validate' && method === 'POST') {
    const { code, amount } = await req.json()
    const coupon = await db.collection('coupons').findOne({ code: (code || '').toUpperCase(), active: true })
    if (!coupon) return err('Invalid coupon code')
    if (amount < (coupon.minAmount || 0)) return err(`Minimum order ₹${coupon.minAmount} required`)
    let discount = 0
    if (coupon.discountType === 'percent') {
      discount = Math.floor((amount * coupon.discount) / 100)
      if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount
    } else {
      discount = coupon.discount
    }
    return ok({ valid: true, discount, code: coupon.code })
  }

  // ---- Subscription Packages ----
  if (path === '/packages' && method === 'GET') {
    const packages = await db.collection('packages').find({ active: true }).sort({ price: 1 }).toArray()
    return ok({ plans: packages.map(({ _id, ...p }) => ({ ...p, _id: _id.toString() })) })
  }

  if (path === '/admin/packages' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const packages = await db.collection('packages').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ packages: packages.map(({ _id, ...p }) => ({ ...p, _id: _id.toString() })) })
  }

  if (path === '/admin/packages' && method === 'POST') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const body = await req.json()
    const pkg = {
      id: body.id || uuidv4(),
      name: body.name,
      price: Number(body.price),
      duration: Number(body.duration),
      // Split features on commas OR newlines, so admins can use either
      features: Array.isArray(body.features) ? body.features : (body.features || '').split(/[\n,]+/).map(f => f.trim()).filter(Boolean),
      active: true,
      createdAt: new Date(),
    }
    await db.collection('packages').updateOne({ id: pkg.id }, { $set: pkg }, { upsert: true })
    return ok({ package: pkg })
  }

  if (segments[0] === 'admin' && segments[1] === 'packages' && segments.length === 3 && method === 'DELETE') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    await db.collection('packages').deleteOne({ id: segments[2] })
    return ok({ success: true })
  }

  // ---- Bookings ----
  if (path === '/bookings' && method === 'GET') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    
    const bookings = await db.collection('bookings').aggregate([
      { $match: { userId: user.id } },
      {
        $lookup: {
          from: 'cars',
          localField: 'carId',
          foreignField: 'id',
          as: 'car'
        }
      },
      { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray()
    
    return ok({ bookings: bookings.map(({ _id, ...b }) => ({ ...b, _id: _id.toString() })) })
  }

  if (path === '/bookings/create-order' && method === 'POST') {
    const user = await requireAuth(req)
    if (!user) return err('Session invalid or expired. Please re-login to book.', 401)
    const body = await req.json()
    const {
      carId, startDate, endDate, couponCode,
      bookingType, driverLicense, ageVerified, pickupLocation, dropLocation,
      usePoints,
      pickupTime, returnTime, pickupMethod, deliveryAddress, panCardImage,
      months,
    } = body

    let car = await db.collection('cars').findOne({ id: carId })
    if (!car && carId?.length === 24) {
      try {
        const { ObjectId } = require('mongodb')
        car = await db.collection('cars').findOne({ _id: new ObjectId(carId) })
      } catch (e) {}
    }
    if (!car) return err('Car not found', 404)

    // Chauffeur (with-driver) bookings are billed monthly; self-drive is per-day.
    const isMonthly = bookingType === 'with-driver'
    const numMonths = isMonthly ? Math.max(1, Number(months) || 1) : 0
    // For fleet cars the stored price IS the monthly price (admin-set)
    const monthlyRate = Number(car.monthlyPrice) || Number(car.pricePerDay) || 0
    const days = isMonthly ? numMonths * 30 : calcRentalDays(startDate, endDate)
    // For monthly bookings derive the end date from the start + months
    let effectiveEndDate = endDate
    if (isMonthly && startDate) {
      const s = new Date(startDate)
      s.setDate(s.getDate() + days)
      effectiveEndDate = s.toISOString().split('T')[0]
    }
    let baseAmount = isMonthly ? numMonths * monthlyRate : days * car.pricePerDay

    // Chauffeur charges are included in the monthly rate — no separate surcharge
    let driverSurcharge = 0

    const totalBeforeDiscount = baseAmount + driverSurcharge

    let discount = 0
    let appliedCoupon = null
    if (couponCode) {
      const coupon = await db.collection('coupons').findOne({ code: couponCode.toUpperCase(), active: true })
      if (coupon && totalBeforeDiscount >= (coupon.minAmount || 0)) {
        if (coupon.discountType === 'percent') {
          discount = Math.floor((totalBeforeDiscount * coupon.discount) / 100)
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount
        } else {
          discount = coupon.discount
        }
        appliedCoupon = coupon.code
      }
    }

    // Premium discount: 5% extra for premium users
    let premiumDiscount = 0
    if (user.isPremium) {
      premiumDiscount = Math.floor((totalBeforeDiscount - discount) * 0.05)
    }

    // Reward points discount (1 point = ₹1)
    let pointsDiscount = 0
    if (usePoints && user.points > 0) {
      pointsDiscount = Math.min(user.points, totalBeforeDiscount - discount - premiumDiscount)
    }

    // Home-delivery charge (₹300) when the user opts for delivery instead of store pickup
    const deliveryCharge = pickupMethod === 'delivery' ? 300 : 0
    // Refundable security deposit — set per-car by the admin (optional)
    const securityDeposit = Number(car.securityDeposit) || 0

    // Taxable service amount (rental after discounts + delivery), then 18% GST
    const taxableAmount = Math.max(0, totalBeforeDiscount - discount - premiumDiscount - pointsDiscount) + deliveryCharge
    const gst = Math.round(taxableAmount * 0.18)

    // Final payable = taxable + GST + refundable security deposit
    const finalAmount = Math.max(100, taxableAmount + gst + securityDeposit)

    // Razorpay rejects very large amounts. Guard with a clear message instead of a 500.
    const RAZORPAY_MAX_INR = 500000 // ₹5,00,000 per transaction
    if (finalAmount > RAZORPAY_MAX_INR) {
      return err(`The total (₹${finalAmount.toLocaleString('en-IN')}) exceeds the ₹5,00,000 per-transaction limit. Please reduce the number of months.`, 400)
    }

    // Create Razorpay order
    let order
    try {
      order = await razorpay.orders.create({
        amount: finalAmount * 100, // paise
        currency: 'INR',
        receipt: `bk_${Date.now()}`.slice(0, 40),
      })
    } catch (rzpErr) {
      const desc = rzpErr?.error?.description || rzpErr?.message || 'Payment gateway error'
      return err(desc, 400)
    }
    
    // Save pending booking
    const booking = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || '',
      carId,
      carName: car.name,
      carImage: car.image,
      startDate,
      endDate: effectiveEndDate,
      days,
      months: numMonths,
      monthlyRate: isMonthly ? monthlyRate : null,
      baseAmount,
      driverSurcharge,
      discount,
      premiumDiscount,
      appliedCoupon,
      pointsDiscount,
      deliveryCharge,
      securityDeposit,
      gst,
      finalAmount,
      bookingType: bookingType || 'self-drive',
      driverLicense: driverLicense || null,
      ageVerified: ageVerified || false,
      pickupLocation: pickupLocation || null,
      dropLocation: dropLocation || null,
      pickupTime: pickupTime || null,
      returnTime: returnTime || null,
      pickupMethod: pickupMethod || 'self',
      deliveryAddress: deliveryAddress || null,
      panCardImage: panCardImage || null,
      razorpayOrderId: order.id,
      status: 'pending',
      type: 'booking',
      createdAt: new Date(),
    }
    await db.collection('bookings').insertOne(booking)

    return ok({
      orderId: order.id,
      amount: finalAmount,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      bookingId: booking.id,
      summary: { baseAmount, driverSurcharge, discount, premiumDiscount, pointsDiscount, deliveryCharge, securityDeposit, gst, finalAmount, days, months: numMonths, appliedCoupon },
    })
  }

  if (path === '/bookings/verify' && method === 'POST') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json()
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')
    if (expected !== razorpay_signature) return err('Payment verification failed', 400)
    await db.collection('bookings').updateOne(
      { id: bookingId },
      { $set: { status: 'confirmed', razorpayPaymentId: razorpay_payment_id, paidAt: new Date() } }
    )
    const booking = await db.collection('bookings').findOne({ id: bookingId })
    // Reward points earned: 10 points per ₹1000 spent
    const pointsEarned = Math.floor((booking.finalAmount || 0) / 1000) * 10
    // Count total bookings to determine premium
    const totalBookings = await db.collection('bookings').countDocuments({ userId: user.id, status: 'confirmed' })
    
    // Calculate total points adjustment
    let pointsAdjustment = pointsEarned
    if (booking.pointsDiscount > 0) {
      pointsAdjustment -= booking.pointsDiscount
    }

    const updates = { $inc: { points: pointsAdjustment } }
    if (totalBookings >= 3 && !user.isPremium) {
      updates.$set = { isPremium: true }
    }
    await db.collection('users').updateOne({ id: user.id }, updates)
    const { _id, ...safeBooking } = booking
    return ok({ success: true, booking: safeBooking, pointsEarned })
  }

  // ---- Subscriptions ----
  if (path === '/subscriptions/plans' && method === 'GET') {
    return ok({
      plans: [
        { id: 'monthly', name: 'Monthly Premium', price: 999, duration: 30, features: ['5% off all bookings', 'Priority support', 'Free cancellation'] },
        { id: 'yearly', name: 'Yearly Premium', price: 9999, duration: 365, features: ['10% off all bookings', '2 free upgrade days', 'Priority support', 'Free cancellation', 'Exclusive cars'] },
      ],
    })
  }

  if (path === '/subscriptions/create-order' && method === 'POST') {
    const user = await requireAuth(req)
    if (!user) return err('Login required', 401)
    const { planId } = await req.json()

    // Flow A: KYC must be completed before a subscription can be purchased
    const kyc = await db.collection('kyc').findOne({ userId: user.id })
    if (!kyc) return err('KYC_REQUIRED', 403)

    const plan = await db.collection('packages').findOne({ id: planId })
    if (!plan) return err('Invalid plan selected')
    
    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: 'INR',
      receipt: `sub_${Date.now()}`.slice(0, 40),
    })
    const sub = {
      id: uuidv4(),
      userId: user.id,
      userEmail: user.email,
      planId,
      planName: plan.name,
      amount: plan.price,
      duration: plan.duration,
      razorpayOrderId: order.id,
      status: 'pending',
      type: 'subscription',
      createdAt: new Date(),
    }
    await db.collection('bookings').insertOne(sub)
    return ok({
      orderId: order.id,
      amount: plan.price,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscriptionId: sub.id,
    })
  }

  if (path === '/subscriptions/verify' && method === 'POST') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscriptionId } = await req.json()
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')
    if (expected !== razorpay_signature) return err('Payment verification failed', 400)
    const sub = await db.collection('bookings').findOne({ id: subscriptionId })
    await db.collection('bookings').updateOne({ id: subscriptionId }, { $set: { status: 'confirmed', razorpayPaymentId: razorpay_payment_id, paidAt: new Date() } })
    const expiresAt = new Date(Date.now() + sub.duration * 24 * 60 * 60 * 1000)
    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { isPremium: true, subscription: { planId: sub.planId, planName: sub.planName, expiresAt, startedAt: new Date() } } }
    )
    return ok({ success: true, expiresAt })
  }

  // ---- Blogs ----
  if (path === '/blogs' && method === 'GET') {
    const blogs = await db.collection('blogs').find({ published: true }).sort({ createdAt: -1 }).toArray()
    return ok({ blogs: blogs.map(({ _id, ...b }) => ({ ...b, _id: _id.toString() })) })
  }

  if (segments[0] === 'blogs' && segments.length === 2 && method === 'GET') {
    const blog = await db.collection('blogs').findOne({ slug: segments[1] })
    if (!blog) return err('Blog not found', 404)
    const { _id, ...rest } = blog
    return ok({ blog: rest })
  }

  // ---- Admin: Blogs ----
  if (path === '/admin/blogs' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const blogs = await db.collection('blogs').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ blogs: blogs.map(({ _id, ...b }) => ({ ...b, _id: _id.toString() })) })
  }

  if (path === '/admin/blogs' && method === 'POST') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const body = await req.json()
    const slug = (body.slug || body.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const blog = {
      id: uuidv4(),
      slug,
      title: body.title,
      category: body.category || 'General',
      excerpt: body.excerpt || (body.content || '').slice(0, 150) + '...',
      content: body.content || '',
      coverImage: body.coverImage || '',
      author: admin.name,
      published: true,
      createdAt: new Date(),
    }
    await db.collection('blogs').insertOne(blog)
    const { _id, ...safe } = blog
    return ok({ blog: safe })
  }

  if (segments[0] === 'admin' && segments[1] === 'blogs' && segments.length === 3 && method === 'DELETE') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    await db.collection('blogs').deleteOne({ id: segments[2] })
    return ok({ success: true })
  }

  // ---- Contact form submissions ----
  // Public: anyone can submit the contact form
  if (path === '/contacts' && method === 'POST') {
    const body = await req.json()
    const { name, email, phone, subject, message } = body
    if (!name || !email || !message) return err('Name, email and message are required')
    const contact = {
      id: uuidv4(),
      name,
      email,
      phone: phone || '',
      subject: subject || '',
      message,
      status: 'new',
      createdAt: new Date(),
    }
    await db.collection('contacts').insertOne(contact)
    const { _id, ...safe } = contact
    return ok({ success: true, contact: safe })
  }

  // Admin: list all contact submissions
  if (path === '/admin/contacts' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const contacts = await db.collection('contacts').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ contacts: contacts.map(({ _id, ...c }) => ({ ...c, _id: _id.toString() })) })
  }

  // Admin: mark a contact as read/handled
  if (segments[0] === 'admin' && segments[1] === 'contacts' && segments.length === 3 && method === 'PUT') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const body = await req.json()
    await db.collection('contacts').updateOne({ id: segments[2] }, { $set: { status: body.status || 'read' } })
    return ok({ success: true })
  }

  // Admin: delete a contact submission
  if (segments[0] === 'admin' && segments[1] === 'contacts' && segments.length === 3 && method === 'DELETE') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    await db.collection('contacts').deleteOne({ id: segments[2] })
    return ok({ success: true })
  }

  // ---- Generic image upload (PAN card at booking, etc.) ----
  if (path === '/upload' && method === 'POST') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    if (!isCloudinaryConfigured()) {
      return err('Image uploads are not available yet — Cloudinary is not configured on the server.', 503)
    }
    const { image, folder } = await req.json()
    if (!image || !String(image).startsWith('data:')) return err('No image provided')
    const url = await uploadDataUri(image, folder || 'kashika/uploads')
    return ok({ url })
  }

  // ---- KYC (Know Your Customer) ----
  // Get the logged-in user's KYC record
  if (path === '/kyc/me' && method === 'GET') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    const kyc = await db.collection('kyc').findOne({ userId: user.id })
    if (!kyc) return ok({ kyc: null })
    const { _id, ...rest } = kyc
    return ok({ kyc: { ...rest, _id: _id.toString() } })
  }

  // Submit / update KYC. Document images come in as base64 data-URIs and are
  // pushed to Cloudinary; only the resulting URLs are stored in Mongo.
  if (path === '/kyc' && method === 'POST') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    const body = await req.json()
    const {
      fullName, phone, address,
      aadhaarNumber, panNumber, licenseNumber,
      aadhaarFront, aadhaarBack, panImage, licenseImage,
    } = body

    if (!fullName || !phone || !address) return err('Name, phone and address are required')
    if (!aadhaarNumber || !panNumber || !licenseNumber) return err('Aadhaar, PAN and Driving License numbers are required')

    if (!isCloudinaryConfigured()) {
      return err('Document uploads are not available yet — Cloudinary is not configured on the server.', 503)
    }

    // Helper: upload only if a new base64 image was provided; keep existing URL otherwise
    const existing = await db.collection('kyc').findOne({ userId: user.id })
    const maybeUpload = async (value, fallbackKey) => {
      if (value && value.startsWith('data:')) return uploadDataUri(value)
      if (value && value.startsWith('http')) return value
      return existing?.[fallbackKey] || null
    }

    const [aadhaarFrontUrl, aadhaarBackUrl, panUrl, licenseUrl] = await Promise.all([
      maybeUpload(aadhaarFront, 'aadhaarFront'),
      maybeUpload(aadhaarBack, 'aadhaarBack'),
      maybeUpload(panImage, 'panImage'),
      maybeUpload(licenseImage, 'licenseImage'),
    ])

    if (!aadhaarFrontUrl || !aadhaarBackUrl || !panUrl || !licenseUrl) {
      return err('All document images are required (Aadhaar front & back, PAN, Driving License)')
    }

    const record = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      fullName,
      phone,
      address,
      aadhaarNumber,
      panNumber,
      licenseNumber,
      aadhaarFront: aadhaarFrontUrl,
      aadhaarBack: aadhaarBackUrl,
      panImage: panUrl,
      licenseImage: licenseUrl,
      status: 'submitted',
      updatedAt: new Date(),
    }
    await db.collection('kyc').updateOne(
      { userId: user.id },
      { $set: record, $setOnInsert: { id: uuidv4(), createdAt: new Date() } },
      { upsert: true }
    )
    // Mirror the latest name/phone onto the user profile + mark KYC done
    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { name: fullName, phone, kycCompleted: true } }
    )
    return ok({ success: true })
  }

  // Admin: list all KYC submissions
  if (path === '/admin/kyc' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const records = await db.collection('kyc').find({}).sort({ updatedAt: -1 }).toArray()
    return ok({ kyc: records.map(({ _id, ...k }) => ({ ...k, _id: _id.toString() })) })
  }

  // ---- Admin: Dashboard stats (real, live numbers) ----
  if (path === '/admin/stats' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)

    const [totalUsers, totalFleet, activeBookings, newContacts] = await Promise.all([
      db.collection('users').countDocuments({}),
      db.collection('cars').countDocuments({}),
      db.collection('bookings').countDocuments({ status: 'confirmed', type: { $ne: 'subscription' } }),
      db.collection('contacts').countDocuments({ status: 'new' }),
    ])

    // Revenue for the current month (confirmed bookings + subscriptions)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const revenueAgg = await db.collection('bookings').aggregate([
      { $match: { status: 'confirmed', paidAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$finalAmount', '$amount'] } } } },
    ]).toArray()
    const revenueMTD = revenueAgg[0]?.total || 0

    // Most recent bookings for the dashboard list
    const recentBookings = await db.collection('bookings')
      .find({ type: { $ne: 'subscription' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    return ok({
      stats: { totalUsers, activeBookings, totalFleet, revenueMTD, newContacts },
      recentBookings: recentBookings.map(({ _id, ...b }) => ({ ...b, _id: _id.toString() })),
    })
  }

  return err('Route not found', 404)
}

async function dispatch(req, method, params) {
  try {
    const segments = (params?.path || []).filter(Boolean)
    return await handleRoute(req, method, segments)
  } catch (e) {
    console.error('API error:', e)
    return err(e.message || 'Server error', 500)
  }
}

export async function GET(req, { params }) { return dispatch(req, 'GET', params) }
export async function POST(req, { params }) { return dispatch(req, 'POST', params) }
export async function PUT(req, { params }) { return dispatch(req, 'PUT', params) }
export async function DELETE(req, { params }) { return dispatch(req, 'DELETE', params) }
export async function PATCH(req, { params }) { return dispatch(req, 'PATCH', params) }
