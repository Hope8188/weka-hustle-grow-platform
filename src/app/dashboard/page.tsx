"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Plus,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
  revenue: {
    total: number
    thisMonth: number
    thisWeek: number
    averageTransaction: number
  }
  customers: {
    total: number
    newThisMonth: number
  }
  transactions: {
    total: number
    thisMonth: number
  }
  services: {
    activeCount: number
  }
}

interface ServiceRequest {
  id: number
  customerName: string
  customerPhone: string
  customerLocation: string
  serviceCategory: string
  description: string
  budget: number | null
  status: string
  createdAt: string
}

export default function Dashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [matchingRequests, setMatchingRequests] = useState<ServiceRequest[]>([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    if (session?.user) {
      const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${session.user.id}`)
      if (!hasCompletedOnboarding) {
        // Small delay to let dashboard load first
        setTimeout(() => setShowOnboarding(true), 500)
      }
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login")
    }
  }, [session, isPending, router])

  // Fetch dashboard stats
  useEffect(() => {
    if (session?.user) {
      fetchStats()
      fetchMatchingRequests()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        toast.error("Failed to load dashboard stats")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Error loading stats")
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchMatchingRequests = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch("/api/service-requests/match?limit=5", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        setMatchingRequests(data.matches || [])
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleOnboardingComplete = () => {
    if (session?.user) {
      localStorage.setItem(`onboarding_completed_${session.user.id}`, "true")
      setShowOnboarding(false)
      toast.success("Welcome to Weka! Let's grow your business together 🚀")
    }
  }

  const handleOnboardingSkip = () => {
    if (session?.user) {
      localStorage.setItem(`onboarding_completed_${session.user.id}`, "true")
      setShowOnboarding(false)
    }
  }

  const handleClaimRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch(`/api/service-requests?id=${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedProviderId: session?.user?.id,
          status: "matched"
        })
      })

      if (res.ok) {
        toast.success("Service request claimed! Customer will be notified.")
        fetchMatchingRequests() // Refresh list
      } else {
        toast.error("Failed to claim request")
      }
    } catch (error) {
      console.error("Error claiming request:", error)
      toast.error("Error claiming request")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (isPending || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Weka Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {session.user.name}!</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.revenue.total || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats?.revenue.thisMonth || 0)} this month
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Customers</p>
              <Users className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold">{stats?.customers.total || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats?.customers.newThisMonth || 0} new this month
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-3xl font-bold">{stats?.transactions.total || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.transactions.thisMonth || 0} this month
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Active Services</p>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats?.services.activeCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              services listed
            </p>
          </Card>
        </div>

        {/* Matching Service Requests */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">New Customer Requests</h2>
                {matchingRequests.length > 0 && (
                  <Badge className="bg-primary text-primary-foreground">
                    {matchingRequests.length} matches
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Customers looking for services you offer
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/marketplace")}>
              View All
            </Button>
          </div>

          {loadingMatches ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Finding matches...</p>
            </div>
          ) : matchingRequests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No matching requests yet</p>
              <p className="text-sm text-muted-foreground">
                Add more services to get matched with customers
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matchingRequests.map((request) => (
                <Card key={request.id} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-primary text-primary">
                          {request.serviceCategory}
                        </Badge>
                        {request.budget && (
                          <Badge variant="outline">
                            Budget: {formatCurrency(request.budget)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold mb-1">{request.customerName}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {request.customerPhone}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {request.customerLocation}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleClaimRequest(request.id)}
                      className="shrink-0"
                    >
                      Claim Job
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/services")}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Manage Services</h3>
                <p className="text-sm text-muted-foreground">Add or edit your services</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/customers")}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">View Customers</h3>
                <p className="text-sm text-muted-foreground">Track your customer base</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/transactions")}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Transactions</h3>
                <p className="text-sm text-muted-foreground">View all M-Pesa payments</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Setup Reminder */}
        {stats?.services.activeCount === 0 && (
          <Card className="p-6 mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Get Started - Add Your First Service</h3>
                <p className="text-muted-foreground mb-4">
                  List the services you offer to start getting matched with customers. The more services you add, the more opportunities you'll get!
                </p>
                <Button onClick={() => router.push("/services")}>
                  Add Service Now
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}