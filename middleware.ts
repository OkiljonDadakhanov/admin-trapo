import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow admin registration without authentication, but redirect if already authenticated
  if (pathname === '/admin/register') {
    const adminToken = request.cookies.get('adminToken')?.value || 
                      request.headers.get('authorization')?.replace('Bearer ', '')
    
    // If already authenticated, redirect to admin dashboard
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    
    return NextResponse.next()
  }
  
  // Check if the user is trying to access admin routes (except registration)
  if (pathname.startsWith('/admin')) {
    // Check for admin token in cookies or headers
    const adminToken = request.cookies.get('adminToken')?.value || 
                      request.headers.get('authorization')?.replace('Bearer ', '')
    
    // If no admin token, redirect to login
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // If accessing login page while authenticated, redirect to admin
  if (pathname === '/login') {
    const adminToken = request.cookies.get('adminToken')?.value || 
                      request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
}
