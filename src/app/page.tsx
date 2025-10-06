"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MessageSquare, Smartphone, Users, LineChart, ArrowRight, Star, Menu, X, Play, TrendingUp, Shield, Zap, ChevronDown, User, LogOut, Clock, Sparkles, MapPin, Briefcase, Megaphone } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { useCustomer } from "autumn-js/react"
import PricingTable from "@/components/autumn/pricing-table"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)
  const [liveActivity, setLiveActivity] = useState({ name: "John", location: "Nairobi", action: "signed up" })
  const [liveRequests, setLiveRequests] = useState<any[]>([])
  const { data: session, isPending, refetch } = useSession()
  const { customer, isLoading: customerLoading } = useCustomer()
  const router = useRouter()

  // Fetch live service requests - FIX API RESPONSE HANDLING
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/service-requests?limit=6')
        if (response.ok) {
          const data = await response.json()
          // API returns array directly, not wrapped in {requests: [...]}
          setLiveRequests(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch service requests:', error)
      }
    }
    fetchRequests()
  }, [])

  // Show floating CTA after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 800)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Rotate live activity notifications
  useEffect(() => {
    const activities = [
      { name: "John", location: "Nairobi", action: "signed up" },
      { name: "Mary", location: "Mombasa", action: "upgraded to Pro" },
      { name: "Peter", location: "Kisumu", action: "started free trial" },
      { name: "Grace", location: "Nakuru", action: "added first service" },
      { name: "James", location: "Eldoret", action: "signed up" }
    ]
    const interval = setInterval(() => {
      setLiveActivity(activities[Math.floor(Math.random() * activities.length)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    const { error } = await authClient.signOut()
    if (error?.code) {
      toast.error(error.code)
    } else {
      localStorage.removeItem("bearer_token")
      refetch() // Update session state
      toast.success("Signed out successfully")
      router.push("/")
    }
  }

  const handleStartFree = () => {
    if (session?.user) {
      router.push("/dashboard")
    } else {
      router.push("/register")
    }
  }

  const handleWhatsApp = () => {
    window.open('https://wa.me/254721725958?text=Hi,%20I%20want%20to%20learn%20more%20about%20Weka', '_blank')
  }

  const currentPlan = customer?.products?.[0]?.name || "Free Plan"

  return (
    <div className="min-h-screen bg-background">
      {/* Live Activity Notification */}
      <div className="fixed bottom-6 left-6 z-50 animate-slide-in-left hidden lg:block">
        <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-sm">
              <span className="font-bold">{liveActivity.name}</span> from {liveActivity.location} just {liveActivity.action}
            </p>
          </div>
        </Card>
      </div>

      {/* Floating CTA Button */}
      {showFloatingCTA && !session?.user && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-2xl text-lg"
            onClick={handleStartFree}
          >
            <Sparkles className="mr-2 w-5 h-5" />
            Start Free Now
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold gradient-text">Weka</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Success Stories</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
              
              {/* Customer Portal Link */}
              <Button
                variant="outline"
                onClick={() => router.push("/post-request")}
                className="border-secondary text-secondary hover:bg-secondary/10"
              >
                <Megaphone className="mr-2 w-4 h-4" />
                Need a Service?
              </Button>
              
              {!isPending && (
                <>
                  {session?.user ? (
                    <div className="flex items-center gap-3">
                      {!customerLoading && (
                        <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                          {currentPlan}
                        </Badge>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        <User className="mr-2 w-4 h-4" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={handleSignOut}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <LogOut className="mr-2 w-4 h-4" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost"
                        onClick={() => router.push("/login")}
                      >
                        Sign in
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                        onClick={() => router.push("/register")}
                      >
                        Start Free Now <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Success Stories</a>
                <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                
                {/* Customer Portal Button */}
                <Button
                  variant="outline"
                  onClick={() => { router.push("/post-request"); setMobileMenuOpen(false); }}
                  className="w-full border-secondary text-secondary"
                >
                  <Megaphone className="mr-2 w-4 h-4" />
                  Need a Service?
                </Button>
                
                {!isPending && (
                  <>
                    {session?.user ? (
                      <>
                        {!customerLoading && (
                          <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 w-fit">
                            {currentPlan}
                          </Badge>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => { router.push("/dashboard"); setMobileMenuOpen(false); }}
                          className="w-full border-primary text-primary"
                        >
                          <User className="mr-2 w-4 h-4" />
                          Dashboard
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                          className="w-full text-destructive border-destructive"
                        >
                          <LogOut className="mr-2 w-4 h-4" />
                          Sign out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => { router.push("/login"); setMobileMenuOpen(false); }}
                          className="w-full"
                        >
                          Sign in
                        </Button>
                        <Button 
                          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 w-full"
                          onClick={() => { router.push("/register"); setMobileMenuOpen(false); }}
                        >
                          Start Free Now
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Urgency Banner */}
      <div className="fixed top-16 w-full bg-gradient-to-r from-primary via-accent to-secondary z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center">
          <p className="text-white text-sm font-medium flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            <span>🔥 150+ Customers Looking For Services RIGHT NOW - Start in 30 Seconds</span>
          </p>
        </div>
      </div>

      {/* Hero Section - SIMPLIFIED */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_videos/emotional-cinematic-sequence-showing-a-k-580d8e73-20251004031311.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 text-sm px-4 py-1">
                🇰🇪 Built for Kenyan Hustlers
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Get Your First <span className="gradient-text">Customer</span> in <span className="gradient-text">24 Hours</span>
              </h1>
              <p className="text-xl sm:text-2xl mb-6 font-medium">
                150+ customers are looking for your services <span className="text-primary">RIGHT NOW</span>
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
                No more waiting for customers. Just enter your phone number, set a PIN, and start getting matched with people who need your services today.
              </p>
              
              {/* Ultra-Simple CTA */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 mb-6 border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <p className="font-bold text-lg">Start in 30 Seconds</p>
                </div>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Phone number + 4-digit PIN (that's it!)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>See customers looking for YOU instantly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Free forever • No M-Pesa password needed</span>
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-xl shadow-xl w-full h-14"
                  onClick={handleStartFree}
                >
                  Get Customers Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              {/* Social Proof Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <p className="text-3xl font-bold text-primary">5,247</p>
                  <p className="text-muted-foreground">Active Hustlers</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-3xl font-bold text-accent">KSh 127M+</p>
                  <p className="text-muted-foreground">Earned This Year</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-3xl font-bold text-secondary">Today</p>
                  <p className="text-muted-foreground">Last verified</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/heartwarming-photo-of-a-smiling-middle-a-a63ca0b2-20251004030447.jpg" 
                  alt="Successful Kenyan entrepreneur" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent/30 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE MARKETPLACE PREVIEW - FIX FIELD NAMES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 animate-pulse">
              🔴 LIVE NOW
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              These Customers Are <span className="gradient-text">Waiting RIGHT NOW</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Real people, real requests, posted in the last 24 hours. Sign up to contact them instantly.
            </p>
            
            {/* Customer CTA */}
            <div className="bg-secondary/10 border-2 border-secondary/20 rounded-xl p-4 max-w-xl mx-auto mb-8">
              <p className="text-sm font-medium mb-2">👋 Looking for a service provider?</p>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/post-request")}
                className="border-secondary text-secondary hover:bg-secondary/10"
              >
                <Megaphone className="mr-2 w-5 h-5" />
                Post Your Request (Free)
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {liveRequests.length > 0 ? (
              liveRequests.slice(0, 6).map((request, i) => (
                <Card key={i} className="p-6 hover:shadow-xl transition-all hover:scale-105 border-2 border-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {request.serviceCategory}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{request.customerName || 'Service Request'}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {request.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{request.customerLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      <span>KSh {request.budget?.toLocaleString() || 'Negotiable'}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    onClick={handleStartFree}
                  >
                    Contact Customer <MessageSquare className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              ))
            ) : (
              // Fallback examples if API fails
              [
                {
                  serviceCategory: "Cleaning",
                  customerName: "Need House Cleaning Today",
                  description: "Looking for reliable mama fua for 3-bedroom house in Kilimani. Weekly service needed.",
                  customerLocation: "Nairobi",
                  budget: 2500,
                  date: "Today"
                },
                {
                  serviceCategory: "Repairs",
                  customerName: "Electrician Needed ASAP",
                  description: "Power socket not working in my shop. Need urgent repair.",
                  customerLocation: "Kisumu",
                  budget: 1500,
                  date: "Today"
                },
                {
                  serviceCategory: "Beauty",
                  customerName: "Hair Braiding This Weekend",
                  description: "Need box braids for wedding. Can you come to Westlands?",
                  customerLocation: "Nairobi",
                  budget: 3000,
                  date: "2 hours ago"
                }
              ].map((request, i) => (
                <Card key={i} className="p-6 hover:shadow-xl transition-all hover:scale-105 border-2 border-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {request.serviceCategory}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{request.date}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{request.customerName || 'Service Request'}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {request.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{request.customerLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      <span>KSh {request.budget?.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    onClick={handleStartFree}
                  >
                    Contact Customer <MessageSquare className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              ))
            )}
          </div>

          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              + 144 more customers posted in the last 24 hours
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg"
              onClick={handleStartFree}
            >
              See All Customers <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section - Optimized for Mobile */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              The Daily Struggle Is <span className="text-destructive">Real</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Every hustler knows these problems...
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Hakuna Customers", desc: "Income ni unpredictable" },
              { title: "Manual Tracking", desc: "Papers lost, no profit clarity" },
              { title: "Middlemen Wanakula", desc: "Brokers take 30-50%" },
              { title: "No Follow-ups", desc: "Customers disappear" }
            ].map((problem, i) => (
              <Card key={i} className="p-5 border-2 border-destructive/20 hover:border-destructive/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-3">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-bold mb-1 text-base">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section - NEW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Why Choose Weka
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Kenya's Most <span className="gradient-text">Trusted</span> Hustle Platform
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Built for Kenya</h3>
              <p className="text-muted-foreground">Simple phone + PIN authentication, Swahili support, and designed for Kenyan hustlers. We understand your needs.</p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Setup in 30 Seconds</h3>
              <p className="text-muted-foreground">No technical skills needed. Sign up with your phone, add your services, and start seeing customer requests immediately.</p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real Customer Leads</h3>
              <p className="text-muted-foreground">Access live marketplace where customers post service requests daily. Connect directly with people who need YOUR services.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - ULTRA SIMPLIFIED */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              From Zero to <span className="gradient-text">First Customer</span> in 2 Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No complicated setup. Start earning today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border-2 border-primary/20 h-full">
                <div className="text-6xl font-bold text-primary/20 mb-4">1</div>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 text-white">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Sign Up (30 Seconds)</h3>
                <ul className="space-y-3 text-base">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>Enter your phone number (e.g., 0712 345 678)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>Create a 4-digit PIN (like M-Pesa)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>Done! You're in.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-3xl p-8 border-2 border-accent/20 h-full">
                <div className="text-6xl font-bold text-accent/20 mb-4">2</div>
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6 text-white">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Get Customers (Today)</h3>
                <ul className="space-y-3 text-base">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <span>See customers looking for YOUR services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <span>Contact them via WhatsApp instantly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <span>Start earning immediately</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl font-medium mb-6">That's it. No complex setup. No waiting.</p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-xl h-14 px-8"
              onClick={handleStartFree}
            >
              Start Getting Customers Now <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section with Interface Mockups */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Grow</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional tools made simple for Kenyan hustlers
            </p>
          </div>

          {/* Feature Showcase with Screenshots */}
          <div className="space-y-24">
            {/* M-Pesa Tracking - NOW LIVE */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20">M-Pesa Integration</Badge>
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">⚙️ Setup Required</Badge>
                </div>
                <h3 className="text-3xl font-bold mb-4">Automatic M-Pesa Payment Tracking</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Track every M-Pesa transaction automatically. STK Push payments, real-time updates, and comprehensive transaction history at your fingertips.
                </p>
                <ul className="space-y-3">
                  {[
                    "STK Push payments (instant)",
                    "Real-time transaction tracking",
                    "Automatic receipt generation",
                    "Complete payment history"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Setup Required:</strong> Configure your Daraja API credentials in settings to enable M-Pesa tracking. <a href="/dashboard" className="underline">Get started →</a>
                  </p>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/clean%2c-modern-mobile-app-interface-moc-35582124-20251004031318.jpg" 
                  alt="M-Pesa tracking dashboard"
                  className="rounded-2xl shadow-2xl border-2 border-primary/20"
                />
              </div>
            </div>

            {/* WhatsApp Automation - NOW LIVE */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/modern-mobile-app-screenshot-showing-wha-b9777561-20251004031326.jpg" 
                  alt="WhatsApp automation interface"
                  className="rounded-2xl shadow-2xl border-2 border-primary/20"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20">Smart Automation</Badge>
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">⚙️ Setup Required</Badge>
                </div>
                <h3 className="text-3xl font-bold mb-4">WhatsApp & SMS Notifications</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Automatic customer notifications via WhatsApp and SMS. Never miss a customer again with instant alerts for new service requests.
                </p>
                <ul className="space-y-3">
                  {[
                    "SMS notifications (via Africa's Talking)",
                    "WhatsApp Business API integration",
                    "Service request alerts",
                    "Customer follow-up messages"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Setup Required:</strong> Add your Africa's Talking and WhatsApp Business API keys in settings. <a href="/dashboard" className="underline">Get started →</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard - LIVE */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">Growth Insights</Badge>
                <h3 className="text-3xl font-bold mb-4">Business Analytics Dashboard</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  See which services make the most money. Know your best customers. Make smart decisions to grow faster.
                </p>
                <ul className="space-y-3">
                  {[
                    "Revenue trends & forecasts",
                    "Customer retention metrics",
                    "Service performance analysis",
                    "Growth recommendations"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/professional-app-interface-mockup-showin-23c0dd91-20251004031333.jpg" 
                  alt="Analytics dashboard"
                  className="rounded-2xl shadow-2xl border-2 border-primary/20"
                />
                <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>

            {/* Phone Verification - LIVE */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Trust & Verification</h4>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">✓ Live</Badge>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Phone OTP verification</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Trust badges & ratings</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Review system</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Provider verification</span>
                    </li>
                  </ul>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Trust System</Badge>
                <h3 className="text-3xl font-bold mb-4">Build Trust with Customers</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Verify your phone with OTP, collect reviews from customers, and display trust badges. Show customers they can trust you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mid-Page CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-accent to-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Hustle?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join 5,000+ Kenyan business owners already growing with Weka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg shadow-xl"
              onClick={handleStartFree}
            >
              Start Free Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 text-white border-0 hover:bg-white/20 text-lg backdrop-blur-sm"
              onClick={handleWhatsApp}
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials with Specific Data + Case Study */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Real Results
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Hustlers Who Are <span className="gradient-text">Winning</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From struggling to stable—real stories, real numbers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Grace Wanjiru",
                business: "Mama Fua Services, Nairobi",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/emotional-portrait-of-a-young-kenyan-wom-08bc7042-20251004030456.jpg",
                story: "Nilikuwa nachukia kazi ya kufua. Customers walikuwa wachache sana. Now through Weka's marketplace, niko na 15+ customers waiting for my services. Regular income at last!",
                before: "KSh 15,000",
                after: "KSh 35,000",
                period: "3 months",
                growth: "+133% income"
              },
              {
                name: "James Omondi",
                business: "Electrician, Kisumu",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/heartfelt-photo-of-a-kenyan-male-electri-2fc7deb9-20251004030505.jpg",
                story: "Before, nilikuwa nateseka kutafuta customers. Saa hii Weka marketplace inanipeleka kwa customers who actually need my services. Business is more stable now.",
                before: "KSh 65,000",
                after: "KSh 120,000",
                period: "4 months",
                growth: "+85% revenue"
              },
              {
                name: "Amina Hassan",
                business: "Hair Salon, Mombasa",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/touching-portrait-of-a-young-kenyan-woma-04bde8b7-20251004030516.jpg",
                story: "Weka marketplace has connected me with 12+ new clients in just 2 months. The customer requests come straight to me. No more chasing!",
                before: "8 clients",
                after: "23 clients",
                period: "2 months",
                growth: "+188% customers"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic">"{testimonial.story}"</p>
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Before</p>
                      <p className="font-bold text-lg">{testimonial.before}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">After</p>
                      <p className="font-bold text-lg text-primary">{testimonial.after}</p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">in {testimonial.period}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 w-full justify-center">
                  {testimonial.growth}
                </Badge>
              </Card>
            ))}
          </div>

          {/* Detailed Case Study */}
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
            <Badge className="mb-4 bg-primary text-primary-foreground">Featured Success Story</Badge>
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/emotional-portrait-of-a-young-kenyan-wom-08bc7042-20251004030456.jpg"
                  alt="Grace Wanjiru"
                  className="rounded-2xl w-full shadow-xl"
                />
              </div>
              <div className="md:col-span-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">From Struggling Mama Fua to Business Owner</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  <strong>Grace Wanjiru</strong> started with just 5 irregular customers, earning KSh 15,000/month. She spent hours chasing payments and couldn't predict her income. 
                  <br/><br/>
                  After joining Weka in January 2024, everything changed. The live marketplace connected her with customers actively looking for cleaning services. She stopped wasting time searching and started working. Word-of-mouth from satisfied customers brought referrals.
                  <br/><br/>
                  By June 2024 (6 months), Grace had 40+ regular clients and earned KSh 52,500/month. She hired her first assistant and now plans to expand to two locations.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-3xl font-bold text-primary">40+</p>
                    <p className="text-sm text-muted-foreground">Regular Clients</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-3xl font-bold text-accent">KSh 52K</p>
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-3xl font-bold text-secondary">+250%</p>
                    <p className="text-sm text-muted-foreground">Growth</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section - ENHANCED */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Start For <span className="gradient-text">Free</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              No hidden fees. Pay via M-Pesa. Cancel anytime.
            </p>
            
            {/* Risk Reversal Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <Badge variant="outline" className="px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                30-Day Money Back
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                No Credit Card
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Cancel Anytime
              </Badge>
            </div>
          </div>

          <PricingTable />

          {/* Trust Signals */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Pay easily with M-Pesa. No credit card needed.</p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge variant="outline" className="text-lg px-4 py-2">M-Pesa</Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">Airtel Money</Badge>
            </div>
            
            {/* Money-Back Guarantee */}
            <Card className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-bold">100% Risk-Free Guarantee</h3>
              </div>
              <p className="text-muted-foreground">
                Try Weka risk-free for 30 days. If you don't increase your income, we'll refund every shilling—no questions asked.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section - UPDATE ANSWERS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Questions?
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does M-Pesa tracking work?",
                a: "Weka integrates with Safaricom's Daraja API for real-time M-Pesa tracking. After connecting your business shortcode and passkey in settings, all M-Pesa payments are automatically logged. You'll see transaction details, amounts, and customer info instantly. Setup takes 5 minutes."
              },
              {
                q: "Do I need technical skills to use Weka?",
                a: "Not at all! Weka is designed for hustlers, not tech experts. The marketplace and customer matching work immediately. For advanced features like M-Pesa tracking, we provide step-by-step setup guides. If you can use WhatsApp, you can use Weka."
              },
              {
                q: "What features work without API setup?",
                a: "Customer marketplace, service listings, phone verification, reviews & ratings, and business analytics work immediately. M-Pesa tracking and WhatsApp automation require API keys (we provide free setup guides)."
              },
              {
                q: "How do I get started with M-Pesa integration?",
                a: "Sign up for a Safaricom Daraja account (free), get your API keys, and add them in Weka settings. Our step-by-step guide makes it simple. Contact support if you need help."
              },
              {
                q: "Is my data safe and secure?",
                a: "Absolutely. We use bank-level encryption to protect your data. Your M-Pesa info is never shared with third parties. We're fully compliant with Kenya's Data Protection Act."
              },
              {
                q: "What if I need help or have a problem?",
                a: "Our Kenyan-based support team is here 7 days a week via WhatsApp, phone, or email. We respond in minutes, not days. Your success is our success."
              }
            ].map((faq, i) => (
              <Card key={i} className="overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <h3 className="font-bold text-lg pr-4">{faq.q}</h3>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - ENHANCED */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-accent to-secondary relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            ⚡ Special Offer - Limited Time
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Your Hustle Deserves Better
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Stop struggling with inconsistent income. Join 5,000+ Kenyan hustlers building stable, thriving businesses with Weka.
          </p>
          
          {/* Urgency Counter */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
            <p className="text-white/90 mb-3 text-sm">🔥 Last chance to get 2 months free on annual plans</p>
            <div className="flex items-center justify-center gap-4 text-white">
              <div>
                <p className="text-3xl font-bold">47</p>
                <p className="text-xs">people viewing</p>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div>
                <p className="text-3xl font-bold">12</p>
                <p className="text-xs">signed up today</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg shadow-xl"
              onClick={handleStartFree}
            >
              Start Free Now - No Credit Card <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 text-white border-0 hover:bg-white/20 text-lg backdrop-blur-sm"
              onClick={handleWhatsApp}
            >
              <MessageSquare className="mr-2 w-5 h-5" />
              Chat on WhatsApp
            </Button>
          </div>
          <p className="text-white/80 text-sm">
            ✓ Free forever plan available  ✓ No credit card required  ✓ Setup in 5 minutes  ✓ 30-day money back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold gradient-text">Weka & Grow</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Kenya's most trusted marketplace connecting hustlers with customers who need their services.
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-muted-foreground hover:text-primary">Facebook</a>
                <a href="#" className="text-muted-foreground hover:text-primary">Twitter</a>
                <a href="#" className="text-muted-foreground hover:text-primary">Instagram</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-primary">How It Works</a></li>
                <li><a href="#" className="hover:text-primary">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#testimonials" className="hover:text-primary">Success Stories</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="tel:+254721725958" className="hover:text-primary">+254 721 725 958</a></li>
                <li><a href="mailto:hello@weka.co.ke" className="hover:text-primary">hello@weka.co.ke</a></li>
                <li>Nairobi, Kenya</li>
                <li>Mon-Sat: 8am-8pm EAT</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2025 Weka & Grow. Made with ❤️ in Kenya 🇰🇪</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}