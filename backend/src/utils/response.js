const { HTTP_STATUS } = require('../constants/httpStatus')

// Standard API response wrapper
const createResponse = (status, data = null, message = null, meta = null) => {
  const response = {
    status,
    timestamp: new Date().toISOString()
  }

  if (message) response.message = message
  if (data) response.data = data
  if (meta) response.meta = meta

  return response
}

// Success responses
const success = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK, meta = null) => {
  return res.status(statusCode).json(createResponse('success', data, message, meta))
}

const created = (res, data = null, message = 'Resource created successfully') => {
  return success(res, data, message, HTTP_STATUS.CREATED)
}

// Error responses
const error = (res, message = 'Internal server error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = createResponse('error', null, message)
  if (errors) response.errors = errors
  return res.status(statusCode).json(response)
}

const badRequest = (res, message = 'Bad request', errors = null) => {
  return error(res, message, HTTP_STATUS.BAD_REQUEST, errors)
}

const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, HTTP_STATUS.UNAUTHORIZED)
}

const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, HTTP_STATUS.FORBIDDEN)
}

const notFound = (res, message = 'Resource not found') => {
  return error(res, message, HTTP_STATUS.NOT_FOUND)
}

const conflict = (res, message = 'Resource already exists') => {
  return error(res, message, HTTP_STATUS.CONFLICT)
}

const validationError = (res, errors, message = 'Validation failed') => {
  return badRequest(res, message, errors)
}

// Pagination helper
const paginate = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit)
  const hasNext = page < totalPages
  const hasPrev = page > 1

  return {
    data,
    meta: {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages,
        hasNext,
        hasPrev
      }
    }
  }
}

module.exports = {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  paginate,
  createResponse
}