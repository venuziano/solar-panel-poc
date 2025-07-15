// For some reason the jwt-decode library didn't work here.
function b64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/')
    while (str.length % 4) str += '='
    return atob(str)
  }
  
  function parseJwt(token) {
    try {
      const [, payload] = token.split('.')
      const json = b64urlDecode(payload)
      return JSON.parse(json)
    } catch {
      throw new Error('Invalid JWT')
    }
  }

// We can use this hook to fetch user details via the JWT token.
// It avoids unexpected behavior from manually modifying localStorage, particularly sensitive values such as the user’s role.
export function useAuth() {
  const token = localStorage.getItem('token')

  let role = null
  if (token) {
    try {
      const { role: r } = parseJwt(token)
      role = r
    } catch (err) {
      console.error('Invalid JWT:', err)
    }
  }

  const isAdmin = role === 'admin'

  return { token, role, isAdmin }
}