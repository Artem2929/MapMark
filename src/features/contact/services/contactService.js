import { csrfService } from '../../../shared/api/csrfService'

export const contactService = {
  async sendMessage(data) {
    const response = await csrfService.makeSecureRequest('/api/v1/contact/send', {
      method: 'POST',
      body: data
    })
    return response.data
  }
}