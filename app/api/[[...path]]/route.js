import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { getDb } from '@/lib/mongo'
import { signToken, verifyToken, hashPassword, checkPassword, getUserFromRequest } from '@/lib/auth'

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
      name: 'Kasika Admin',
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
  // Seed cars
  const carCount = await db.collection('cars').countDocuments()
  if (carCount === 0) {
    const cars = [
      {
        id: uuidv4(),
        name: 'Mercedes C-Class Convertible',
        brand: 'Mercedes-Benz',
        type: 'Luxury',
        transmission: 'Automatic',
        fuel: 'Petrol',
        seats: 4,
        pricePerDay: 7999,
        location: 'Mumbai',
        image: 'https://images.pexels.com/photos/12463311/pexels-photo-12463311.jpeg',
        description: 'Drive in style with the elegant Mercedes C-Class Convertible. Perfect for weekend getaways.',
        features: ['GPS', 'Bluetooth', 'Sunroof', 'Premium Sound'],
        available: true,
        serviceType: 'with-driver',
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'BMW 3 Series',
        brand: 'BMW',
        type: 'Sedan',
        transmission: 'Automatic',
        fuel: 'Petrol',
        seats: 5,
        pricePerDay: 5999,
        location: 'Delhi',
        image: 'https://images.unsplash.com/photo-1616932321030-16411c3a6489',
        description: 'The ultimate driving machine. Sporty, refined, and ready for any road trip.',
        features: ['GPS', 'Cruise Control', 'Heated Seats', 'Apple CarPlay'],
        available: true,
        serviceType: 'self-drive',
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Hyundai Creta SUV',
        brand: 'Hyundai',
        type: 'SUV',
        transmission: 'Manual',
        fuel: 'Diesel',
        seats: 5,
        pricePerDay: 2499,
        location: 'Bangalore',
        image: 'https://images.pexels.com/photos/19076555/pexels-photo-19076555.jpeg',
        description: 'Spacious and reliable SUV for family trips and adventure rides.',
        features: ['GPS', 'AC', 'Bluetooth', 'Reverse Camera'],
        available: true,
        serviceType: 'self-drive',
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Maruti Swift',
        brand: 'Maruti Suzuki',
        type: 'Hatchback',
        transmission: 'Manual',
        fuel: 'Petrol',
        seats: 5,
        pricePerDay: 1499,
        location: 'Pune',
        image: 'https://images.unsplash.com/photo-1592853625597-7d17be820d0c',
        description: 'Compact, fuel-efficient hatchback. Ideal for city drives and short trips.',
        features: ['AC', 'Bluetooth', 'Power Steering'],
        available: true,
        serviceType: 'self-drive',
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Toyota Innova Crysta',
        brand: 'Toyota',
        type: 'MPV',
        transmission: 'Manual',
        fuel: 'Diesel',
        seats: 7,
        pricePerDay: 3499,
        location: 'Hyderabad',
        image: 'https://images.unsplash.com/photo-1504366130991-154787072d46',
        description: 'Spacious 7-seater for family trips. Comfortable, reliable, and powerful.',
        features: ['AC', 'GPS', 'Bluetooth', 'Captain Seats'],
        available: true,
        serviceType: 'with-driver',
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'BMW M4 Sport',
        brand: 'BMW',
        type: 'Sports',
        transmission: 'Automatic',
        fuel: 'Petrol',
        seats: 4,
        pricePerDay: 12999,
        location: 'Mumbai',
        image: 'https://images.pexels.com/photos/10969159/pexels-photo-10969159.jpeg',
        description: 'Pure adrenaline. The BMW M4 sport delivers track-level performance on open roads.',
        features: ['GPS', 'Premium Sound', 'Sport Mode', 'Heads Up Display'],
        available: true,
        serviceType: 'self-drive',
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Audi A6 Premium',
        brand: 'Audi',
        type: 'Luxury',
        transmission: 'Automatic',
        fuel: 'Petrol',
        seats: 5,
        pricePerDay: 8999,
        location: 'Mumbai',
        image: 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg',
        description: 'Luxury redefined. Experience the smooth ride and advanced technology of the Audi A6.',
        features: ['GPS', 'Sunroof', 'Matrix LED', 'Bang & Olufsen Sound'],
        available: true,
        serviceType: 'with-driver',
        createdAt: new Date(),
      },
    ]
    await db.collection('cars').insertMany(cars)
  }
  // Seed packages
  const packageCount = await db.collection('packages').countDocuments()
  if (packageCount === 0) {
    await db.collection('packages').insertMany([
      { 
        id: 'monthly', 
        name: 'Monthly Premium', 
        price: 999, 
        duration: 30, 
        features: ['5% off all bookings', 'Priority support', 'Free cancellation', 'Exclusive membership badge'],
        active: true,
        createdAt: new Date()
      },
      { 
        id: 'yearly', 
        name: 'Yearly Premium', 
        price: 9999, 
        duration: 365, 
        features: ['10% off all bookings', '2 free upgrade days', 'Priority support', 'Free cancellation', 'VIP fleet access'],
        active: true,
        createdAt: new Date()
      },
    ])
  }
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
  if (path === '/' || path === '') return ok({ ok: true, app: 'Kasika Self Drive Car' })

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
    if (path === '/admin/bookings-self') filter.bookingType = 'self-drive'
    if (path === '/admin/bookings-driver') filter.bookingType = 'with-driver'
    
    const bookings = await db.collection('bookings').find(filter).sort({ createdAt: -1 }).toArray()
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
      features: Array.isArray(body.features) ? body.features : (body.features || '').split(',').map(f => f.trim()),
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
      usePoints 
    } = body
    
    let car = await db.collection('cars').findOne({ id: carId })
    if (!car && carId?.length === 24) {
      try {
        const { ObjectId } = require('mongodb')
        car = await db.collection('cars').findOne({ _id: new ObjectId(carId) })
      } catch (e) {}
    }
    if (!car) return err('Car not found', 404)
    
    const days = calcRentalDays(startDate, endDate)
    let baseAmount = days * car.pricePerDay
    
    // Add driver surcharge for with-driver bookings
    let driverSurcharge = 0
    if (bookingType === 'with-driver') {
      driverSurcharge = days * 1000
    }
    
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

    const finalAmount = Math.max(100, totalBeforeDiscount - discount - premiumDiscount - pointsDiscount)
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: finalAmount * 100, // paise
      currency: 'INR',
      receipt: `bk_${Date.now()}`.slice(0, 40),
    })
    
    // Save pending booking
    const booking = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      carId,
      carName: car.name,
      carImage: car.image,
      startDate,
      endDate,
      days,
      baseAmount,
      driverSurcharge,
      discount,
      premiumDiscount,
      appliedCoupon,
      pointsDiscount,
      finalAmount,
      bookingType: bookingType || 'self-drive',
      driverLicense: driverLicense || null,
      ageVerified: ageVerified || false,
      pickupLocation: pickupLocation || null,
      dropLocation: dropLocation || null,
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
      summary: { baseAmount, driverSurcharge, discount, premiumDiscount, pointsDiscount, finalAmount, days, appliedCoupon },
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
