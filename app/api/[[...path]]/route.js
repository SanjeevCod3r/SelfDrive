import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { getDb } from '@/lib/mongo'
import { signToken, hashPassword, checkPassword, getUserFromRequest } from '@/lib/auth'

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
  const user = await db.collection('users').findOne({ id: u.userId })
  return user
}

async function requireAdmin(req) {
  const user = await requireAuth(req)
  if (!user || !user.isAdmin) return null
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
      isPremium: true,
      rewardPoints: 0,
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
        createdAt: new Date(),
      },
    ]
    await db.collection('cars').insertMany(cars)
  }
  // Seed coupons
  const couponCount = await db.collection('coupons').countDocuments()
  if (couponCount === 0) {
    await db.collection('coupons').insertMany([
      { id: uuidv4(), code: 'WELCOME10', discountType: 'percent', discount: 10, minAmount: 0, maxDiscount: 1500, active: true, createdAt: new Date() },
      { id: uuidv4(), code: 'FLAT500', discountType: 'flat', discount: 500, minAmount: 2000, maxDiscount: 500, active: true, createdAt: new Date() },
      { id: uuidv4(), code: 'KASIKA20', discountType: 'percent', discount: 20, minAmount: 5000, maxDiscount: 3000, active: true, createdAt: new Date() },
    ])
  }
  // Seed blogs
  const blogCount = await db.collection('blogs').countDocuments()
  if (blogCount === 0) {
    await db.collection('blogs').insertMany([
      {
        id: uuidv4(),
        slug: 'top-5-road-trips-from-mumbai',
        title: 'Top 5 Self-Drive Road Trips from Mumbai',
        excerpt: 'From the Konkan coast to the Sahyadri hills, here are the best routes for your next self-drive adventure.',
        content: 'Mumbai is a gateway to some of India\u2019s most scenic drives. Whether you crave coastal breezes or misty mountains, your perfect road trip starts here.\\n\\n1. Mumbai to Lonavala \u2014 90 km of pure highway joy\\n2. Mumbai to Goa via Konkan \u2014 600 km of coastal paradise\\n3. Mumbai to Mahabaleshwar \u2014 strawberries and viewpoints\\n4. Mumbai to Tarkarli \u2014 white sand beaches\\n5. Mumbai to Bhandardara \u2014 lakes and waterfalls\\n\\nBook a Kasika car and hit the road today!',
        coverImage: 'https://images.unsplash.com/photo-1541807360746-039080941306',
        author: 'Kasika Team',
        published: true,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'why-self-drive-is-better',
        title: 'Why Self-Drive Beats Cab Rentals',
        excerpt: 'Freedom, privacy, and adventure \u2014 here is why self-drive rentals are the future of travel in India.',
        content: 'Self-drive rentals give you complete freedom over your itinerary, no awkward small talk with drivers, and the joy of the open road. With Kasika, you get premium vehicles, transparent pricing, and reward points on every trip.',
        coverImage: 'https://images.pexels.com/photos/12463311/pexels-photo-12463311.jpeg',
        author: 'Kasika Team',
        published: true,
        createdAt: new Date(),
      },
    ])
  }
}

// Run seeding once at module load
ensureSeed().catch(e => console.error('Seed error:', e))

// ---- Router ----
async function handleRoute(req, method, segments) {
  const path = '/' + segments.join('/')
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
      rewardPoints: 0,
      subscription: null,
      createdAt: new Date(),
    }
    await db.collection('users').insertOne(user)
    const token = signToken({ userId: user.id, email: user.email, isAdmin: false })
    const { password: _, ...safe } = user
    return ok({ token, user: safe })
  }

  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = await req.json()
    const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() })
    if (!user) return err('Invalid credentials', 401)
    const match = await checkPassword(password, user.password)
    if (!match) return err('Invalid credentials', 401)
    const token = signToken({ userId: user.id, email: user.email, isAdmin: !!user.isAdmin })
    const { password: _, ...safe } = user
    return ok({ token, user: safe })
  }

  if (path === '/auth/me' && method === 'GET') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    const { password: _, ...safe } = user
    return ok({ user: safe })
  }

  // ---- Cars ----
  if (path === '/cars' && method === 'GET') {
    const cars = await db.collection('cars').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ cars: cars.map(({ _id, ...c }) => c) })
  }

  if (segments[0] === 'cars' && segments.length === 2 && method === 'GET') {
    const car = await db.collection('cars').findOne({ id: segments[1] })
    if (!car) return err('Car not found', 404)
    const { _id, ...rest } = car
    return ok({ car: rest })
  }

  // ---- Admin: Cars ----
  if (path === '/admin/cars' && method === 'POST') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const body = await req.json()
    const car = {
      id: uuidv4(),
      ...body,
      pricePerDay: Number(body.pricePerDay) || 0,
      seats: Number(body.seats) || 4,
      available: true,
      createdAt: new Date(),
    }
    await db.collection('cars').insertOne(car)
    const { _id, ...safe } = car
    return ok({ car: safe })
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

  if (path === '/admin/users' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ users: users.map(({ _id, password, ...u }) => u) })
  }

  if (path === '/admin/bookings' && method === 'GET') {
    const admin = await requireAdmin(req)
    if (!admin) return err('Forbidden', 403)
    const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray()
    return ok({ bookings: bookings.map(({ _id, ...b }) => b) })
  }

  // ---- Coupons ----
  if (path === '/coupons' && method === 'GET') {
    const coupons = await db.collection('coupons').find({ active: true }).toArray()
    return ok({ coupons: coupons.map(({ _id, ...c }) => c) })
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

  // ---- Bookings ----
  if (path === '/bookings/me' && method === 'GET') {
    const user = await requireAuth(req)
    if (!user) return err('Unauthorized', 401)
    const bookings = await db.collection('bookings').find({ userId: user.id }).sort({ createdAt: -1 }).toArray()
    return ok({ bookings: bookings.map(({ _id, ...b }) => b) })
  }

  if (path === '/bookings/create-order' && method === 'POST') {
    const user = await requireAuth(req)
    if (!user) return err('Login required', 401)
    const { carId, startDate, endDate, couponCode } = await req.json()
    const car = await db.collection('cars').findOne({ id: carId })
    if (!car) return err('Car not found', 404)
    const days = calcRentalDays(startDate, endDate)
    let baseAmount = days * car.pricePerDay
    let discount = 0
    let appliedCoupon = null
    if (couponCode) {
      const coupon = await db.collection('coupons').findOne({ code: couponCode.toUpperCase(), active: true })
      if (coupon && baseAmount >= (coupon.minAmount || 0)) {
        if (coupon.discountType === 'percent') {
          discount = Math.floor((baseAmount * coupon.discount) / 100)
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
      premiumDiscount = Math.floor((baseAmount - discount) * 0.05)
    }
    const finalAmount = Math.max(100, baseAmount - discount - premiumDiscount)
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
      discount,
      premiumDiscount,
      appliedCoupon,
      finalAmount,
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
      summary: { baseAmount, discount, premiumDiscount, finalAmount, days, appliedCoupon },
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
    // Mark booking as paid
    await db.collection('bookings').updateOne(
      { id: bookingId },
      { $set: { status: 'confirmed', razorpayPaymentId: razorpay_payment_id, paidAt: new Date() } }
    )
    const booking = await db.collection('bookings').findOne({ id: bookingId })
    // Reward points: 10 points per ₹1000 spent
    const points = Math.floor((booking.finalAmount || 0) / 1000) * 10
    // Count total bookings to determine premium
    const totalBookings = await db.collection('bookings').countDocuments({ userId: user.id, status: 'confirmed' })
    const updates = { $inc: { rewardPoints: points } }
    if (totalBookings >= 3 && !user.isPremium) {
      updates.$set = { isPremium: true }
    }
    await db.collection('users').updateOne({ id: user.id }, updates)
    const { _id, ...safeBooking } = booking
    return ok({ success: true, booking: safeBooking, pointsEarned: points })
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
    const plans = { monthly: { price: 999, duration: 30, name: 'Monthly Premium' }, yearly: { price: 9999, duration: 365, name: 'Yearly Premium' } }
    const plan = plans[planId]
    if (!plan) return err('Invalid plan')
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
    return ok({ blogs: blogs.map(({ _id, ...b }) => b) })
  }

  if (segments[0] === 'blogs' && segments.length === 2 && method === 'GET') {
    const blog = await db.collection('blogs').findOne({ slug: segments[1] })
    if (!blog) return err('Blog not found', 404)
    const { _id, ...rest } = blog
    return ok({ blog: rest })
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
      excerpt: body.excerpt || '',
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
