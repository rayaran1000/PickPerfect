import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')

  if (error) {
    // Handle OAuth error
    console.error('Google Drive OAuth error:', error)
    return new Response(
      `<script>
        window.opener.postMessage({ type: 'drive-auth-error', error: '${error}' }, '*');
        window.close();
      </script>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (code && state === 'drive-access') {
    try {
      console.log('Exchanging authorization code for tokens...')
      
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
        const errorData = await tokenResponse.text()
        console.error('Token exchange failed:', errorData)
        throw new Error('Failed to exchange code for token')
      }

      const tokenData = await tokenResponse.json()
      console.log('Token exchange successful')
      
      const accessToken = tokenData.access_token
      
      // Return HTML that will store the token and close the popup
      return new Response(
        `<script>
          // Store the access token
          sessionStorage.setItem('google_drive_access_token', '${accessToken}');
          
          // Notify the parent window
          window.opener.postMessage({ 
            type: 'drive-auth-success', 
            token: '${accessToken}' 
          }, '*');
          
          // Close the popup
          window.close();
        </script>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
      
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return new Response(
        `<script>
          window.opener.postMessage({ 
            type: 'drive-auth-error', 
            error: 'Failed to connect to Google Drive' 
          }, '*');
          window.close();
        </script>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
  }

  // Invalid request
  console.error('Invalid OAuth callback request')
  return new Response(
    `<script>
      window.opener.postMessage({ 
        type: 'drive-auth-error', 
        error: 'Invalid request' 
      }, '*');
      window.close();
    </script>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
} 