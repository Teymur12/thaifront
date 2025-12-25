import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('authToken')?.value;
  const url = request.nextUrl.clone();
  const currentPath = url.pathname;

  // Login səhifələri
  const loginRoutes = ['/adminlogin', '/userlogin'];
  
  // Əgər login səhifələrindəsə, heç bir yoxlama etmə
  if (loginRoutes.includes(currentPath)) {
    // Token varsa və düzgün role-u varsa, müvafiq səhifəyə yönləndir
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role;
        const tokenExp = payload.exp;

        // Token müddəti bitməmişsə
        if (Date.now() < tokenExp * 1000) {
          if (currentPath === '/adminlogin' && userRole === 'admin') {
            url.pathname = '/';
            return NextResponse.redirect(url);
          }
          if (currentPath === '/userlogin' && (userRole === 'user' || userRole === 'receptionist')) {
            url.pathname = '/userpage';
            return NextResponse.redirect(url);
          }
        }
      } catch (error) {
        // Token xətalıdırsa, cookie-ni sil
        const response = NextResponse.next();
        response.cookies.delete('authToken');
        return response;
      }
    }
    return NextResponse.next();
  }

  // Ana səhifə (/) - yalnız admin üçün
  if (currentPath === '/') {
    if (!token) {
      url.pathname = '/adminlogin';
      return NextResponse.redirect(url);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;
      const tokenExp = payload.exp;

      // Token müddəti bitmişmi?
      if (Date.now() >= tokenExp * 1000) {
        const response = NextResponse.redirect(new URL('/adminlogin', request.url));
        response.cookies.delete('authToken');
        return response;
      }

      // Admin deyilsə, admin login-ə göndər
      if (userRole !== 'admin') {
        url.pathname = '/adminlogin';
        return NextResponse.redirect(url);
      }

    } catch (error) {
      // Token decode error
      const response = NextResponse.redirect(new URL('/adminlogin', request.url));
      response.cookies.delete('authToken');
      return response;
    }
  }

  // User page - yalnız user və receptionist üçün
  if (currentPath === '/userpage') {
    if (!token) {
      url.pathname = '/userlogin';
      return NextResponse.redirect(url);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;
      const tokenExp = payload.exp;

      // Token müddəti bitmişmi?
      if (Date.now() >= tokenExp * 1000) {
        const response = NextResponse.redirect(new URL('/userlogin', request.url));
        response.cookies.delete('authToken');
        return response;
      }

      // User və ya receptionist deyilsə, user login-ə göndər
      if (userRole !== 'user' && userRole !== 'receptionist') {
        url.pathname = '/userlogin';
        return NextResponse.redirect(url);
      }

    } catch (error) {
      // Token decode error
      const response = NextResponse.redirect(new URL('/userlogin', request.url));
      response.cookies.delete('authToken');
      return response;
    }
  }

  return NextResponse.next();
}

// Middleware yalnız bu path-larda işləyəcək
export const config = {
  matcher: [
    '/',
    '/userpage', 
    '/adminlogin',
    '/userlogin'
  ],
}