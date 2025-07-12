import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')

  if (error) {
    // Handle OAuth error
    return NextResponse.redirect(`${requestUrl.origin}/dashboard?error=drive_access_denied`)
  }

  if (code && state === 'drive-access') {
    try {
      // Exchange the authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${requestUrl.origin}/auth/drive-callback`,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const tokenData = await tokenResponse.json()
      
      // Store the access token securely (you might want to store this in your database)
      // For now, we'll use sessionStorage on the client side
      
      // Redirect back to dashboard with success
      return NextResponse.redirect(`${requestUrl.origin}/dashboard?drive_connected=true`)
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return NextResponse.redirect(`${requestUrl.origin}/dashboard?error=drive_connection_failed`)
    }
  }

  // Invalid request
  return NextResponse.redirect(`${requestUrl.origin}/dashboard?error=invalid_request`)
} 