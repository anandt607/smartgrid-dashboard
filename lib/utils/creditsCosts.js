/**
 * Credit costs for different actions across grids
 */
export const CREDIT_COSTS = {
  // BrandGrid actions
  BRANDGRID_GENERATE_LOGO: 10,
  BRANDGRID_GENERATE_PALETTE: 5,
  BRANDGRID_ANALYZE_BRAND: 15,
  BRANDGRID_EXPORT_ASSETS: 8,

  // CallGrid actions
  CALLGRID_MAKE_CALL: 5,
  CALLGRID_RECORD_CALL: 3,
  CALLGRID_TRANSCRIBE_CALL: 10,
  CALLGRID_AI_SUMMARY: 8,

  // SalesGrid actions
  SALESGRID_GENERATE_REPORT: 20,
  SALESGRID_FORECAST_ANALYSIS: 25,
  SALESGRID_EXPORT_DATA: 5,
  SALESGRID_AI_INSIGHTS: 15,

  // TeamGrid actions
  TEAMGRID_ADD_MEMBER: 2,
  TEAMGRID_SEND_INVITE: 1,
  TEAMGRID_GENERATE_PERFORMANCE: 12,
  TEAMGRID_EXPORT_TEAM_DATA: 5,

  // API actions
  API_REQUEST: 1,
  API_BATCH_REQUEST: 5,
}

/**
 * Get credit cost for an action
 * @param {string} action - Action key from CREDIT_COSTS
 * @returns {number} Credit cost
 */
export const getCreditCost = (action) => {
  return CREDIT_COSTS[action] || 0
}

/**
 * Check if user has enough credits
 * @param {number} available - Available credits
 * @param {string} action - Action to perform
 * @returns {boolean}
 */
export const hasEnoughCredits = (available, action) => {
  const cost = getCreditCost(action)
  return available >= cost
}

/**
 * Calculate credits needed for multiple actions
 * @param {Array<string>} actions - Array of action keys
 * @returns {number} Total credits needed
 */
export const calculateTotalCredits = (actions) => {
  return actions.reduce((total, action) => {
    return total + getCreditCost(action)
  }, 0)
}

/**
 * Format credits display
 * @param {number} credits
 * @returns {string}
 */
export const formatCredits = (credits) => {
  return credits.toLocaleString()
}

/**
 * Get credit usage percentage
 * @param {number} used
 * @param {number} total
 * @returns {number}
 */
export const getCreditUsagePercentage = (used, total) => {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

/**
 * Get credit status color
 * @param {number} percentage - Usage percentage
 * @returns {string} Color code
 */
export const getCreditStatusColor = (percentage) => {
  if (percentage < 50) return 'success' // Green
  if (percentage < 80) return 'warning' // Yellow
  return 'error' // Red
}

