import apiClient from './client'

/**
 * Consume credits for an action
 * @param {string} action - Action identifier
 * @param {number} credits - Number of credits to consume
 * @param {object} metadata - Optional metadata
 * @returns {Promise<object>}
 */
export const consumeCredits = async ({ action, credits, metadata = {} }) => {
  const { data } = await apiClient.post('/api/credits/consume', {
    action,
    credits,
    metadata
  })
  return data
}

/**
 * Get credit transaction history
 * @param {string} userId
 * @param {object} options - Pagination options
 * @returns {Promise<object>}
 */
export const getCreditTransactions = async (userId, { page = 1, limit = 20 } = {}) => {
  const { data } = await apiClient.get(`/api/credits/transactions/${userId}`, {
    params: { page, limit }
  })
  return data
}

