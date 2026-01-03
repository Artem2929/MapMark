const mapUserToResponse = (user, stats = {}) => {
  const baseUser = {
    id: user.id,
    _id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    country: user.country,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    birthDate: user.birthDate,
    position: user.position,
    visibility: user.visibility,
    isOnline: user.isOnline,
    lastActivity: user.lastActivity,
    createdAt: user.createdAt
  }

  return {
    ...baseUser,
    ...stats
  }
}

const mapUsersToResponse = (users) => {
  return users.map(user => mapUserToResponse(user))
}

module.exports = {
  mapUserToResponse,
  mapUsersToResponse
}
