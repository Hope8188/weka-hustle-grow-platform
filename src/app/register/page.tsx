"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Smartphone, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pin: "",
    confirmPin: ""
  })

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1)
    }
    
    if (cleaned.startsWith('254')) {
      return cleaned
    }
    
    if (phone.startsWith('+254')) {
      return cleaned
    }
    
    return '254' + cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.pin.length !== 4) {
      toast.error("PIN must be exactly 4 digits")
      return
    }

    if (formData.pin !== formData.confirmPin) {
      toast.error("PINs do not match")
      return
    }

    const formattedPhone = formatPhoneNumber(formData.phone)
    
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      toast.error("Please enter a valid Kenyan phone number")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await authClient.signUp.email({
        email: formattedPhone + "@weka.app",
        name: formData.name,
        password: formData.pin
      })

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "This phone number is already registered. Please sign in instead."
        }
        toast.error(errorMap[error.code] || "Registration failed. Please try again.")
        return
      }

      toast.success("Account created! Signing you in...")
      
      // Auto sign in after registration
      const { error: signInError } = await authClient.signIn.email({
        email: formattedPhone + "@weka.app",
        password: formData.pin
      })

      if (!signInError) {
        router.push("/dashboard")
      } else {
        router.push("/login?registered=true")
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Start in 30 Seconds</h1>
              <p className="text-sm text-muted-foreground">Just phone number + PIN</p>
            </div>
          </div>
        </div>

        <Card className="p-8">
          {/* Quick benefits */}
          <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium mb-2">You'll get instant access to:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Customer marketplace</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>M-Pesa tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Free forever plan</span>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Grace Wanjiru"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (M-Pesa)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  +254
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="712 345 678"
                  className="pl-16"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">This will be used for M-Pesa payments</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">Create 4-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                maxLength={4}
                pattern="[0-9]{4}"
                inputMode="numeric"
                autoComplete="off"
                value={formData.pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, pin: value })
                }}
                required
                disabled={isLoading}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">Easy to remember, just 4 numbers</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                placeholder="••••"
                maxLength={4}
                pattern="[0-9]{4}"
                inputMode="numeric"
                autoComplete="off"
                value={formData.confirmPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, confirmPin: value })
                }}
                required
                disabled={isLoading}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Create Account & Start
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            🔒 No credit card • No email verification • Start immediately
          </p>
        </div>
      </div>
    </div>
  )
}