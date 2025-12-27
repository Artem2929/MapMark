import { apiClient } from '../../../shared/api/client.js'

export const contactService = {
  async sendMessage(data) {
    if (!data?.name || !data?.email || !data?.message) {
      throw new Error('Всі поля обов\'язкові')
    }
    
    return apiClient.secureRequest('/contact/send', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}