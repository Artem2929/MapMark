const { createId } = require('@paralleldrive/cuid2')

/**
 * Generate unique user ID with prefix
 * Format: usr_2nF8kL9mP3xQ1wR
 */
function generateUserId() {
  return `usr_${createId()}`
}

/**
 * Generate unique username from name and country
 * Format: @artemua1
 * Ensures uniqueness by checking database
 */
async function generateUsername(name, country, User) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)
  const countryCode = country.toLowerCase()
  let counter = 1
  let username
  
  do {
    username = `@${base}${countryCode}${counter}`
    counter++
  } while (await User.exists({ username }))
  
  return username
}

module.exports = {
  generateUserId,
  generateUsername
}
