"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Phone, Mail, Shield, IdCard, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationStep {
  id: string
  label: string
  status: "completed" | "pending" | "failed"
  icon: any
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface VerificationStatusProps {
  steps: VerificationStep[]
  className?: string
}

export const VerificationStatus = ({ steps, className }: VerificationStatusProps) => {
  const completedSteps = steps.filter(s => s.status === "completed").length
  const totalSteps = steps.length
  const progress = (completedSteps / totalSteps) * 100

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">Verification Status</h3>
            <Badge variant="outline">
              {completedSteps}/{totalSteps} Complete
            </Badge>
          </div>
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon
            const statusIcon = {
              completed: CheckCircle2,
              pending: Clock,
              failed: XCircle
            }[step.status]
            
            const StatusIcon = statusIcon

            const statusColor = {
              completed: "text-green-600",
              pending: "text-yellow-600",
              failed: "text-red-600"
            }[step.status]

            return (
              <div
                key={step.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon className={cn("w-4 h-4", statusColor)} />
                    <span className="font-medium">{step.label}</span>
                  </div>
                  {step.description && (
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  )}
                </div>

                {step.action && step.status !== "completed" && (
                  <Button
                    size="sm"
                    variant={step.status === "failed" ? "destructive" : "outline"}
                    onClick={step.action.onClick}
                  >
                    {step.action.label}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// Pre-built verification step templates
export const defaultVerificationSteps: VerificationStep[] = [
  {
    id: "phone",
    label: "Phone Verification",
    status: "pending",
    icon: Phone,
    description: "Verify your phone number via OTP",
    action: {
      label: "Verify Now",
      onClick: () => {}
    }
  },
  {
    id: "email",
    label: "Email Verification",
    status: "pending",
    icon: Mail,
    description: "Verify your email address",
    action: {
      label: "Verify Now",
      onClick: () => {}
    }
  },
  {
    id: "id",
    label: "ID Verification",
    status: "pending",
    icon: IdCard,
    description: "Upload your Kenyan National ID or Passport",
    action: {
      label: "Upload ID",
      onClick: () => {}
    }
  },
  {
    id: "business",
    label: "Business Verification",
    status: "pending",
    icon: Briefcase,
    description: "Verify your business registration (optional)",
    action: {
      label: "Verify Business",
      onClick: () => {}
    }
  }
]

interface QuickVerificationCardProps {
  isVerified: boolean
  phoneVerified: boolean
  idVerified: boolean
  onVerifyPhone: () => void
  onVerifyId: () => void
  className?: string
}

export const QuickVerificationCard = ({
  isVerified,
  phoneVerified,
  idVerified,
  onVerifyPhone,
  onVerifyId,
  className
}: QuickVerificationCardProps) => {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-3 mb-3">
        <Shield className={cn(
          "w-8 h-8",
          isVerified ? "text-green-600" : "text-muted-foreground"
        )} />
        <div>
          <h4 className="font-bold">
            {isVerified ? "Verified Provider" : "Get Verified"}
          </h4>
          <p className="text-sm text-muted-foreground">
            {isVerified ? "You're a trusted provider" : "Build trust with customers"}
          </p>
        </div>
      </div>

      {!isVerified && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              {phoneVerified ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm">Phone Verification</span>
            </div>
            {!phoneVerified && (
              <Button size="sm" variant="ghost" onClick={onVerifyPhone}>
                Verify
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              {idVerified ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm">ID Verification</span>
            </div>
            {!idVerified && (
              <Button size="sm" variant="ghost" onClick={onVerifyId}>
                Upload
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}