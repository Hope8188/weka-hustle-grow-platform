"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Smartphone } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    pin: "",
    rememberMe: false
  })

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Convert 07XX to 2547XX or 01XX to 2541XX
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1)
    }
    
    // If starts with 254, keep as is
    if (cleaned.startsWith('254')) {
      return cleaned
    }
    
    // If starts with +254, remove the +
    if (phone.startsWith('+254')) {
      return cleaned
    }
    
    // Otherwise assume it needs 254 prefix
    return '254' + cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.pin.length !== 4) {
      toast.error("PIN must be exactly 4 digits")
      return
    }
    
    setIsLoading(true)

    try {
      const formattedPhone = formatPhoneNumber(formData.phone)
      
      const { data, error } = await authClient.signIn.email({
        email: formattedPhone + "@weka.app",
        password: formData.pin,
        rememberMe: formData.rememberMe,
        callbackURL: "/dashboard"
      })

      if (error?.code) {
        toast.error("Invalid phone number or PIN. Please check and try again.")
        return
      }

      toast.success("Karibu tena! Welcome back!")
      router.push("/dashboard")
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
              <h1 className="text-3xl font-bold">Karibu!</h1>
              <p className="text-sm text-muted-foreground">Sign in with your phone</p>
            </div>
          </div>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">Enter your M-Pesa number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter 4-digit PIN"
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
              <p className="text-xs text-muted-foreground">4 digits you created during signup</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-5 w-5" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Hakuna account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create one now (takes 30 seconds)
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            🔒 Secure M-Pesa authentication • No passwords to remember
          </p>
        </div>
      </div>
    </div>
  )
}