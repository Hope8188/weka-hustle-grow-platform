"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, DollarSign, Briefcase, ArrowRight, CheckCircle2, Clock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const CATEGORIES = [
  "Cleaning", "Repairs", "Beauty", "Construction", "Transport", 
  "Plumbing", "Electrical", "Painting", "Catering", "Photography",
  "IT Services", "Tutoring", "Other"
]

const LOCATIONS = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Malindi", "Kitale", "Machakos", "Meru", "Other"
]

export default function PostRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    budget: "",
    contactPhone: "",
    contactName: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category || 
        !formData.location || !formData.contactPhone || !formData.contactName) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          contact_phone: formData.contactPhone,
          contact_name: formData.contactName,
          status: "open"
        })
      })

      if (response.ok) {
        toast.success("Request posted! Service providers will contact you soon.")
        setTimeout(() => router.push("/"), 2000)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to post request")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => router.push("/")} className="flex items-center gap-2">
              <span className="text-2xl font-bold gradient-text">Weka</span>
            </button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            🇰🇪 Free Service Request
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Get <span className="gradient-text">5+ Quotes</span> in Minutes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Tell us what you need. Verified service providers will contact you directly via WhatsApp or phone.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>5,247 Active Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              <span>Average Response: 15 mins</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-secondary" />
              <span>100% Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold mb-2 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  What service do you need? *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., House Cleaning for 3-bedroom apartment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold mb-2">
                  Describe your needs in detail *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us more about what you need. Be specific about timing, location details, any special requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2 min-h-32"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  More details = better matches
                </p>
              </div>

              {/* Category & Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-base font-semibold mb-2">
                    Category *
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-base font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Location *
                  </Label>
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div>
                <Label htmlFor="budget" className="text-base font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-secondary" />
                  Your Budget (Optional)
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    KSh
                  </span>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="pl-12"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Leave blank if you want to negotiate
                </p>
              </div>

              {/* Contact Info */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-bold mb-4">Your Contact Information</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contactName" className="text-base font-semibold mb-2">
                      Your Name *
                    </Label>
                    <Input
                      id="contactName"
                      placeholder="e.g., John Kamau"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone" className="text-base font-semibold mb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      Phone Number *
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="e.g., 0712 345 678"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-3 bg-muted/30 p-3 rounded-lg">
                  📱 Service providers will contact you directly via WhatsApp or phone. We never share your details with third parties.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post My Request"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                By posting, you agree to receive calls/messages from service providers
              </p>
            </form>
          </Card>

          {/* How It Works */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-bold mb-2">Post Your Request</h3>
              <p className="text-sm text-muted-foreground">
                Fill the form above with your service needs
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="font-bold mb-2">Get Multiple Quotes</h3>
              <p className="text-sm text-muted-foreground">
                Verified providers contact you within 15 minutes
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-secondary">3</span>
              </div>
              <h3 className="font-bold mb-2">Choose & Hire</h3>
              <p className="text-sm text-muted-foreground">
                Compare prices and pick the best provider
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}