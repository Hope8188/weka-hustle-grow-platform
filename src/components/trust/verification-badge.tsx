"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  isVerified: boolean
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export const VerificationBadge = ({ 
  isVerified, 
  size = "md", 
  showText = true,
  className 
}: VerificationBadgeProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  if (!isVerified) {
    return showText ? (
      <Badge variant="outline" className={cn("text-muted-foreground border-muted-foreground/30", className)}>
        <AlertCircle className={cn(sizeClasses[size], "mr-1")} />
        <span className={textSizeClasses[size]}>Unverified</span>
      </Badge>
    ) : (
      <AlertCircle className={cn(sizeClasses[size], "text-muted-foreground", className)} />
    )
  }

  return showText ? (
    <Badge className={cn("bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20", className)}>
      <CheckCircle2 className={cn(sizeClasses[size], "mr-1")} />
      <span className={textSizeClasses[size]}>Verified</span>
    </Badge>
  ) : (
    <CheckCircle2 className={cn(sizeClasses[size], "text-green-600", className)} />
  )
}

interface TrustBadgeProps {
  level: "basic" | "verified" | "trusted" | "elite"
  size?: "sm" | "md" | "lg"
  className?: string
}

export const TrustBadge = ({ level, size = "md", className }: TrustBadgeProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  const badgeConfig = {
    basic: {
      label: "Basic",
      color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      icon: Shield
    },
    verified: {
      label: "Verified",
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      icon: CheckCircle2
    },
    trusted: {
      label: "Trusted",
      color: "bg-green-500/10 text-green-600 border-green-500/20",
      icon: Shield
    },
    elite: {
      label: "Elite",
      color: "bg-primary/10 text-primary border-primary/20",
      icon: Shield
    }
  }

  const config = badgeConfig[level]
  const Icon = config.icon

  return (
    <Badge className={cn(config.color, className)}>
      <Icon className={cn(sizeClasses[size], "mr-1")} />
      <span className={textSizeClasses[size]}>{config.label}</span>
    </Badge>
  )
}