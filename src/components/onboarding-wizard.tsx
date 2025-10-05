"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Sparkles, Briefcase, Users, TrendingUp, ArrowRight, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface OnboardingWizardProps {
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const totalSteps = 3

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const handleAddService = () => {
    onComplete()
    router.push("/services")
  }

  const handleViewMarketplace = () => {
    onComplete()
    router.push("/marketplace")
  }

  const progress = (step / totalSteps) * 100

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip for now
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              Welcome to <span className="gradient-text">Weka!</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Let's get you set up in 60 seconds. You're 3 simple steps away from your first customer.
            </p>

            <div className="grid gap-4 mb-8 text-left">
              <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Add Your Services</p>
                  <p className="text-sm text-muted-foreground">Tell customers what you offer</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Browse Customer Requests</p>
                  <p className="text-sm text-muted-foreground">See who needs your services RIGHT NOW</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Start Earning</p>
                  <p className="text-sm text-muted-foreground">Contact customers and close deals</p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={handleNext}
            >
              Let's Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Add First Service */}
        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              What Services Do You Offer?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Add at least one service so customers can find you. You can add more later.
            </p>

            <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  💡 Quick Tip
                </Badge>
              </div>
              <p className="text-sm text-left">
                <strong>Be specific!</strong> Instead of "Cleaning," try "3-Bedroom House Cleaning" or "Office Deep Cleaning." 
                Specific services get 3x more customers.
              </p>
            </Card>

            <div className="grid gap-3 mb-8">
              <p className="text-sm text-muted-foreground text-left">Popular services in your area:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "House Cleaning",
                  "Plumbing Repairs",
                  "Hair Braiding",
                  "Phone Repairs",
                  "Catering Services",
                  "Electrical Work"
                ].map((service) => (
                  <div key={service} className="text-sm bg-muted/30 p-3 rounded-lg text-left">
                    {service}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleNext}
              >
                I'll Do This Later
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={handleAddService}
              >
                Add My First Service
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: View Marketplace */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              See Who Needs Your Services
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              150+ customers are looking for service providers RIGHT NOW. Browse requests and contact them instantly.
            </p>

            <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Live Request
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-left">Need House Cleaning Today</h3>
              <p className="text-sm text-muted-foreground mb-3 text-left">
                Looking for reliable mama fua for 3-bedroom house in Kilimani. Weekly service needed.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nairobi</span>
                <span className="font-bold text-primary">KSh 2,500</span>
              </div>
            </Card>

            <div className="bg-muted/30 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="font-medium">Average Response Time: 15 minutes</p>
              </div>
              <p className="text-sm text-muted-foreground">
                The faster you respond, the more likely you are to win the job!
              </p>
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={handleViewMarketplace}
            >
              Browse Customer Requests <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}