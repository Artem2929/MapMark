/**
 * Cursor-based pagination utilities
 */

class PaginationUtils {
  /**
   * Create cursor from date
   */
  static createCursor(date) {
    return date ? date.toISOString() : null
  }

  /**
   * Parse cursor to date
   */
  static parseCursor(cursor) {
    if (!cursor) return null
    
    try {
      return new Date(cursor)
    } catch (error) {
      throw new Error('Невірний формат cursor')
    }
  }

  /**
   * Build pagination query for MongoDB
   */
  static buildQuery(baseQuery, cursor, sortField = 'createdAt', sortOrder = -1) {
    const query = { ...baseQuery }
    
    if (cursor) {
      const cursorDate = this.parseCursor(cursor)
      const operator = sortOrder === -1 ? '$lt' : '$gt'
      query[sortField] = { [operator]: cursorDate }
    }
    
    return query
  }

  /**
   * Process paginated results
   */
  static processResults(results, limit) {
    const hasMore = results.length > limit
    
    if (hasMore) {
      results.pop() // Remove extra item
    }
    
    const nextCursor = results.length > 0 
      ? this.createCursor(results[results.length - 1].createdAt)
      : null
    
    return {
      data: results,
      hasMore,
      nextCursor
    }
  }

  /**
   * Validate limit parameter
   */
  static validateLimit(limit, maxLimit = 100) {
    const parsedLimit = parseInt(limit)
    
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return 20 // Default limit
    }
    
    return Math.min(parsedLimit, maxLimit)
  }
}

module.exports = PaginationUtils