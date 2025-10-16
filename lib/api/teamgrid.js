/**
 * TeamGrid-specific API functions
 * Client-side API calls only (no direct MongoDB imports)
 */

// NOTE: MongoDB connection functions moved to server-side API routes
// getCombinedUserData and updateTeamGridLastLogin are now in server-side only

/**
 * Create TeamGrid user (Client-side call to API)
 */
export async function createTeamGridUser(userData) {
  const response = await fetch('/api/teamgrid/users/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create TeamGrid user')
  }

  return await response.json()
}
