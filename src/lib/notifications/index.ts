/**
 * Notifications Service - Unified Export
 * SMS, WhatsApp, and OTP functionality via Africa's Talking
 */

// Re-export from africas-talking.ts
export {
  sendSMS,
  generateOTP,
  sendOTP,
  formatKenyanPhoneNumber,
  isValidKenyanPhoneNumber
} from './africas-talking'

// Re-export from sms.ts
export {
  sendSMS as sendSMSDetailed,
  generateOTP as generateOTPCode,
  sendOTP as sendOTPMessage,
  notifyServiceMatchSMS,
  notifyPaymentSMS,
  saveOTP,
  verifyOTP
} from './sms'

// Re-export from whatsapp.ts
export {
  sendWhatsAppMessage,
  notifyServiceMatch,
  notifyPaymentConfirmation,
  sendReactivationReminder
} from './whatsapp'

/**
 * Unified notification service
 * Automatically chooses best channel (WhatsApp > SMS)
 */
export const notificationService = {
  // OTP functions
  sendOTP: async (phoneNumber: string): Promise<{ success: boolean; otp?: string; error?: string }> => {
    const { sendOTP } = await import('./sms')
    return sendOTP(phoneNumber)
  },
  
  verifyOTP: (phoneNumber: string, otp: string): boolean => {
    const { verifyOTP } = require('./sms')
    return verifyOTP(phoneNumber, otp)
  },
  
  // Service match notifications (for providers)
  notifyServiceMatch: async (phoneNumber: string, customerName: string, serviceCategory: string, location: string) => {
    const { notifyServiceMatch } = await import('./whatsapp')
    const { notifyServiceMatchSMS } = await import('./sms')
    
    // Try WhatsApp first, fallback to SMS
    if (process.env.WHATSAPP_API_KEY) {
      const result = await notifyServiceMatch(phoneNumber, customerName, serviceCategory, location)
      if (result.success) return result
    }
    
    // Fallback to SMS
    return await notifyServiceMatchSMS(phoneNumber, customerName, serviceCategory)
  },

  // Customer confirmation (for customers who post requests)
  notifyCustomerRequestReceived: async (phoneNumber: string, serviceCategory: string) => {
    const { sendSMS } = await import('./sms')
    
    const message = `Your service request for ${serviceCategory} has been received! Service providers in your area will contact you soon. Thank you for using Weka!`
    
    return sendSMS({
      to: phoneNumber,
      message
    })
  },
  
  // Payment notifications
  notifyPayment: async (phoneNumber: string, amount: number, mpesaReceipt: string) => {
    const { notifyPaymentConfirmation } = await import('./whatsapp')
    const { notifyPaymentSMS } = await import('./sms')
    
    // Try WhatsApp first, fallback to SMS
    if (process.env.WHATSAPP_API_KEY) {
      const result = await notifyPaymentConfirmation(phoneNumber, amount, mpesaReceipt)
      if (result.success) return result
    }
    
    // Fallback to SMS
    return await notifyPaymentSMS(phoneNumber, amount, mpesaReceipt)
  }
}