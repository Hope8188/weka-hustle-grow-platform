import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { transactions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { mpesaService } from '@/lib/mpesa/daraja'
import { notificationService } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Parse M-Pesa callback
    const callback = mpesaService.parseCallback(body)
    
    if (!callback.success) {
      console.error('M-Pesa callback parsing failed:', callback.error)
      return NextResponse.json({ 
        ResultCode: 1,
        ResultDesc: 'Callback parsing failed' 
      })
    }

    // Update transaction in database
    const checkoutRequestId = callback.checkoutRequestId
    const status = callback.resultCode === 0 ? 'completed' : 'failed'
    const mpesaReceiptNumber = callback.mpesaReceiptNumber

    const updated = await db.update(transactions)
      .set({
        status,
        mpesaReceiptNumber,
        updatedAt: new Date().toISOString()
      })
      .where(eq(transactions.checkoutRequestId, checkoutRequestId))
      .returning()

    // Send payment notification to user if payment successful
    if (updated.length > 0 && status === 'completed' && mpesaReceiptNumber) {
      const transaction = updated[0]
      
      // Get user phone number from transaction
      if (transaction.phoneNumber) {
        try {
          await notificationService.notifyPayment(
            transaction.phoneNumber,
            transaction.amount,
            mpesaReceiptNumber
          )
        } catch (notifError) {
          console.error('Failed to send payment notification:', notifError)
          // Continue even if notification fails
        }
      }
    }

    console.log(`M-Pesa callback processed: ${checkoutRequestId} - ${status}`)

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully'
    })
  } catch (error) {
    console.error('M-Pesa callback error:', error)
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Internal server error'
    })
  }
}