"use client"

import { Star, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TrustScoreProps {
  score: number // 0-100
  reviews?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export const TrustScore = ({ 
  score, 
  reviews, 
  size = "md", 
  showLabel = true,
  className 
}: TrustScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 75) return "Very Good"
    if (score >= 60) return "Good"
    return "Fair"
  }

  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  }

  const starSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex flex-col items-center">
        <div className={cn("font-bold", sizeClasses[size], getScoreColor(score))}>
          {score}
        </div>
        {showLabel && (
          <div className="text-xs text-muted-foreground">{getScoreLabel(score)}</div>
        )}
      </div>
      
      {reviews !== undefined && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Star className={cn(starSizeClasses[size], "fill-primary text-primary")} />
          <span className="text-sm">({reviews} reviews)</span>
        </div>
      )}
    </div>
  )
}

interface RatingStarsProps {
  rating: number // 0-5
  totalReviews?: number
  size?: "sm" | "md" | "lg"
  showNumber?: boolean
  className?: string
}

export const RatingStars = ({ 
  rating, 
  totalReviews, 
  size = "md", 
  showNumber = true,
  className 
}: RatingStarsProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < Math.floor(rating)
                ? "fill-primary text-primary"
                : i < rating
                ? "fill-primary/50 text-primary"
                : "fill-none text-muted-foreground"
            )}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      )}
      {totalReviews !== undefined && (
        <span className="text-sm text-muted-foreground">({totalReviews})</span>
      )}
    </div>
  )
}

interface TrustIndicatorProps {
  score: number
  trend?: "up" | "down" | "stable"
  className?: string
}

export const TrustIndicator = ({ score, trend, className }: TrustIndicatorProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 75) return "bg-blue-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-24 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("absolute left-0 top-0 h-full transition-all", getScoreColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium">{score}/100</span>
      {trend && trend !== "stable" && (
        <Badge variant="outline" className={cn(
          "text-xs",
          trend === "up" ? "text-green-600 border-green-500/20" : "text-red-600 border-red-500/20"
        )}>
          <TrendingUp className={cn("h-3 w-3 mr-1", trend === "down" && "rotate-180")} />
          {trend === "up" ? "Rising" : "Falling"}
        </Badge>
      )}
    </div>
  )
}