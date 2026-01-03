const userRepository = require('../repositories/userRepository')
const { AppError, catchAsync } = require('../utils/errorHandler')
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt')
const { HTTP_STATUS, ERROR_CODES } = require('../constants/httpStatus')

const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token
  
  if (req.headers.authorization) {
    token = extractTokenFromHeader(req.headers.authorization)
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.NOT_AUTHENTICATED))
  }

  // 2) Verification token
  let decoded
  try {
    decoded = await verifyToken(token)
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN))
  }

  // 3) Check if user still exists
  const currentUser = await userRepository.findByIdOrCustomId(decoded.id)
  
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.USER_NOT_FOUND))
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.PASSWORD_CHANGED))
  }

  // 5) Update last login
  currentUser.lastLogin = new Date()
  await currentUser.save({ validateBeforeSave: false })

  // Grant access to protected route
  req.user = currentUser
  next()
})

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', HTTP_STATUS.FORBIDDEN, ERROR_CODES.INSUFFICIENT_PERMISSIONS))
    }
    next()
  }
}

const optionalAuth = catchAsync(async (req, res, next) => {
  let token
  
  if (req.headers.authorization) {
    token = extractTokenFromHeader(req.headers.authorization)
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (token) {
    try {
      const decoded = await verifyToken(token)
      const currentUser = await userRepository.findByIdOrCustomId(decoded.id)
      
      if (currentUser && !currentUser.changedPasswordAfter(decoded.iat)) {
        req.user = currentUser
      }
    } catch (error) {
      // Token is invalid, but we continue without authentication
    }
  }

  next()
})

module.exports = {
  protect,
  restrictTo,
  optionalAuth
}