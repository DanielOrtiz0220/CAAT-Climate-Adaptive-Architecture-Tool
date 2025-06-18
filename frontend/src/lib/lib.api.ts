/**
 * API configuration utility for handling backend URL with fallback
 */

const PRODUCTION_URL = 'https://caat-climate-adaptive-architecture-tool-production.up.railway.app'
const LOCALHOST_URL = 'http://localhost:8080'

/**
 * Get the backend URL with production as primary and localhost as fallback
 */
export const getBackendUrl = (): string => {
  // If explicitly set via environment variable, use that
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL
  }
  
  // Default to production URL
  return PRODUCTION_URL
}

/**
 * Get the fallback URL for when primary fails
 */
export const getFallbackUrl = (): string => {
  return LOCALHOST_URL
}

/**
 * Make a fetch request with automatic fallback to localhost
 */
export const fetchWithFallback = async (
  endpoint: string,
  options: RequestInit = {},
  timeout: number = 5000
): Promise<Response> => {
  const primaryUrl = getBackendUrl()
  const fallbackUrl = getFallbackUrl()
  
  // Try primary URL first
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(`${primaryUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      return response
    }
    
    // If response is not ok, throw to trigger fallback
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  } catch (error) {
    console.warn(`Primary backend (${primaryUrl}) failed:`, error)
    
    // Try fallback URL
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(`${fallbackUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.info(`Using fallback backend: ${fallbackUrl}`)
        return response
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (fallbackError) {
      console.error(`Both primary and fallback backends failed:`, {
        primary: error,
        fallback: fallbackError
      })
      throw fallbackError
    }
  }
}

/**
 * Check backend health with fallback
 */
export const checkBackendHealth = async (): Promise<{ 
  connected: boolean; 
  url: string; 
  usingFallback: boolean 
}> => {
  const primaryUrl = getBackendUrl()
  const fallbackUrl = getFallbackUrl()
  
  // Try primary first
  try {
    const response = await fetch(`${primaryUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    
    if (response.ok) {
      return { connected: true, url: primaryUrl, usingFallback: false }
    }
  } catch (error) {
    console.warn(`Primary backend health check failed:`, error)
  }
  
  // Try fallback
  try {
    const response = await fetch(`${fallbackUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    
    if (response.ok) {
      return { connected: true, url: fallbackUrl, usingFallback: true }
    }
  } catch (error) {
    console.warn(`Fallback backend health check failed:`, error)
  }
  
  return { connected: false, url: '', usingFallback: false }
}