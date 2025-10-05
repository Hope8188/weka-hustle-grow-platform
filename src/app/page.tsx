"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MessageSquare, Smartphone, Users, LineChart, ArrowRight, Star, Menu, X, Play, TrendingUp, Shield, Zap, ChevronDown, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const { data: session, isPending } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await authClient.signOut()
    if (error?.code) {
      toast.error(error.code)
    } else {
      localStorage.removeItem("bearer_token")
      toast.success("Signed out successfully")
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
              
              {!isPending && (
                <>
                  {session?.user ? (
                    <div className="flex items-center gap-3">
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
                
                {!isPending && (
                  <>
                    {session?.user ? (
                      <>
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

      {/* Hero Section with Video Background */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
                Turn Your <span className="gradient-text">Hustle</span> Into A <span className="gradient-text">Thriving Business</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                <strong>Kenya's #1 M-Pesa Business Tracker.</strong> Whether you're mama fua, electrician, salon owner, or food vendor—stop struggling with inconsistent customers. Automate follow-ups, track every shilling, and grow into a stable business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg shadow-xl">
                  Start Free Today <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg border-2">
                  <Play className="mr-2 w-5 h-5" /> Watch Demo
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <p className="text-3xl font-bold text-primary">5,000+</p>
                  <p className="text-muted-foreground">Active Hustlers</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-3xl font-bold text-accent">KSh 120M+</p>
                  <p className="text-muted-foreground">Tracked via M-Pesa</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-3xl font-bold text-secondary">98%</p>
                  <p className="text-muted-foreground">Satisfaction Rate</p>
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
              Kenya's Most <span className="gradient-text">Trusted</span> Hustle Software
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Built for Kenya</h3>
              <p className="text-muted-foreground">M-Pesa integration, Swahili support, and local payment methods. We understand your needs.</p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Setup in 5 Minutes</h3>
              <p className="text-muted-foreground">No technical skills needed. Add your services, connect M-Pesa, start growing immediately.</p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Proven Results</h3>
              <p className="text-muted-foreground">Average users increase income by 180% in 6 months. Real growth, real impact.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - ENHANCED */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How Weka <span className="gradient-text">Transforms</span> Your Hustle
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From setup to success in 4 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Sign Up Free", desc: "Create your account in under 2 minutes. No credit card required.", icon: <Users className="w-6 h-6" /> },
              { step: "2", title: "Add Your Services", desc: "List what you offer—cleaning, repairs, salon, food. Set your prices.", icon: <CheckCircle2 className="w-6 h-6" /> },
              { step: "3", title: "Connect M-Pesa", desc: "Link your M-Pesa. Every payment tracked automatically. No manual entry.", icon: <Smartphone className="w-6 h-6" /> },
              { step: "4", title: "Get Customers & Grow", desc: "We match you with buyers. WhatsApp follow-ups keep them coming back.", icon: <LineChart className="w-6 h-6" /> }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border-2 border-primary/20 h-full">
                  <div className="text-5xl font-bold text-primary/20 mb-2">{item.step}</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4 text-white">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
                )}
              </div>
            ))}
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
            {/* M-Pesa Tracking */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">M-Pesa Integration</Badge>
                <h3 className="text-3xl font-bold mb-4">Automatic M-Pesa Payment Tracking</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Every transaction tracked in real-time. See daily, weekly, monthly income at a glance. Know exactly where every shilling goes—no more guessing.
                </p>
                <ul className="space-y-3">
                  {[
                    "Real-time M-Pesa sync",
                    "Automatic receipt generation",
                    "Profit & expense tracking",
                    "Tax-ready reports"
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
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/clean%2c-modern-mobile-app-interface-moc-35582124-20251004031318.jpg" 
                  alt="M-Pesa tracking dashboard"
                  className="rounded-2xl shadow-2xl border-2 border-primary/20"
                />
                <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>

            {/* WhatsApp Automation */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/modern-mobile-app-screenshot-showing-wha-b9777561-20251004031326.jpg" 
                  alt="WhatsApp automation interface"
                  className="rounded-2xl shadow-2xl border-2 border-primary/20"
                />
                <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Smart Automation</Badge>
                <h3 className="text-3xl font-bold mb-4">WhatsApp Auto Follow-ups</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Never lose a customer again. Automated reminders bring repeat business without lifting a finger. Your customers stay engaged, you stay busy.
                </p>
                <ul className="space-y-3">
                  {[
                    "Scheduled customer reminders",
                    "Personalized messages",
                    "Booking confirmations",
                    "Payment reminders"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Analytics Dashboard */}
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
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg shadow-xl">
              Start Free Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-2 border-white hover:bg-white/10 text-lg">
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
                story: "Nilikuwa nachukia kazi ya kufua. Customers walikuwa wachache sana. Now niko na over 40 regular clients. WhatsApp follow-ups zimenisaidia sana!",
                before: "KSh 15,000",
                after: "KSh 52,500",
                period: "6 months",
                growth: "+250% income"
              },
              {
                name: "James Omondi",
                business: "Electrician, Kisumu",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/heartfelt-photo-of-a-kenyan-male-electri-2fc7deb9-20251004030505.jpg",
                story: "Before, nilikuwa nateseka kukumbuka kila customer alilipa ngapi. Saa hii M-Pesa tracking inanishow everything. Business iko organized.",
                before: "KSh 85,000",
                after: "KSh 180,000",
                period: "8 months",
                growth: "+112% revenue"
              },
              {
                name: "Amina Hassan",
                business: "Hair Salon, Mombasa",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6c4b9b66-a969-46df-a871-9cfcb2bc598c/generated_images/touching-portrait-of-a-young-kenyan-woma-04bde8b7-20251004030516.jpg",
                story: "Weka wamenipea 15 new clients last month. Siwezi believe! Saa hii sina stress ya kutafuta customers.",
                before: "8 clients",
                after: "53 clients",
                period: "4 months",
                growth: "+563% customers"
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
                  After joining Weka in January 2024, everything changed. M-Pesa tracking showed her exactly where money went. WhatsApp follow-ups brought back old customers—and they referred friends.
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Start For <span className="gradient-text">Free</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. Pay via M-Pesa. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "forever",
                description: "Perfect for getting started",
                features: [
                  "Up to 10 customers",
                  "Basic M-Pesa tracking",
                  "WhatsApp reminders",
                  "Mobile app access"
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Hustler Pro",
                price: "KSh 500",
                period: "per month",
                description: "For serious business owners",
                features: [
                  "Unlimited customers",
                  "Advanced M-Pesa tracking",
                  "Auto WhatsApp follow-ups",
                  "Customer matching",
                  "Growth analytics",
                  "Priority support"
                ],
                cta: "Start Growing",
                popular: true
              },
              {
                name: "Business",
                price: "KSh 1,500",
                period: "per month",
                description: "For teams and multiple locations",
                features: [
                  "Everything in Pro",
                  "Multiple staff accounts",
                  "Team management",
                  "Advanced reports",
                  "API access",
                  "Dedicated support"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, i) => (
              <Card 
                key={i} 
                className={`p-8 relative ${plan.popular ? 'border-2 border-primary shadow-2xl scale-105' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period !== "forever" && (
                      <span className="text-muted-foreground"> / {plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Pay easily with M-Pesa. No credit card needed.</p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">M-Pesa</Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">Airtel Money</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - NEW */}
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
                a: "Once you connect your M-Pesa number, all incoming payments are automatically logged in your dashboard. You'll see transaction details, customer names, amounts, and dates—all in real-time. No manual entry needed."
              },
              {
                q: "Do I need technical skills to use Weka?",
                a: "Not at all! Weka is designed for hustlers, not tech experts. Setup takes 5 minutes. If you can use WhatsApp, you can use Weka. Plus, we offer free training and 24/7 support in English and Swahili."
              },
              {
                q: "How much does it cost after the free trial?",
                a: "The Starter plan is free forever (up to 10 customers). Hustler Pro is KSh 500/month, and Business is KSh 1,500/month. Pay monthly via M-Pesa—no contracts, cancel anytime."
              },
              {
                q: "Can I use Weka if I don't have many customers yet?",
                a: "Yes! That's exactly who we built this for. Our customer matching feature connects you with new buyers looking for your services. Plus, automated follow-ups help turn one-time clients into repeat customers."
              },
              {
                q: "Is my data safe and secure?",
                a: "Absolutely. We use bank-level encryption to protect your data. Your M-Pesa info is never shared with third parties. We're fully compliant with Kenya's Data Protection Act."
              },
              {
                q: "What if I need help or have a problem?",
                a: "Our Kenyan-based support team is here 7 days a week. Reach us via WhatsApp, phone, or email. We respond in minutes, not days. Your success is our success."
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

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-accent to-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Your Hustle Deserves Better
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Stop struggling with inconsistent income. Join 5,000+ Kenyan hustlers building stable, thriving businesses with Weka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg shadow-xl">
              Start Free Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-2 border-white hover:bg-white/10 text-lg"
              onClick={() => window.open('https://wa.me/254721725958?text=Hi,%20I%20want%20to%20learn%20more%20about%20Weka', '_blank')}
            >
              <MessageSquare className="mr-2 w-5 h-5" />
              Chat on WhatsApp
            </Button>
          </div>
          <p className="text-white/80 text-sm">
            ✓ Free forever plan available  ✓ No credit card required  ✓ Setup in 5 minutes
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
                Kenya's most trusted M-Pesa business tracker helping hustlers grow into thriving businesses.
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