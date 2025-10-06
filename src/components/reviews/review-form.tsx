"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ReviewFormProps {
  providerId?: string
  serviceId?: number
  onSuccess?: () => void
  variant?: "provider" | "service"
}

export const ReviewForm = ({ 
  providerId, 
  serviceId,
  onSuccess,
  variant = "provider"
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      toast.error("Please sign in to leave a review")
      router.push("/login")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("bearer_token")
      
      let endpoint = ""
      let body: any = {}

      if (variant === "provider" && providerId) {
        endpoint = "/api/reviews"
        body = {
          provider_user_id: providerId,
          rating,
          comment: comment.trim(),
        }
      } else if (variant === "service" && serviceId) {
        endpoint = "/api/reviews-system"
        
        if (!title.trim() || title.trim().length < 5) {
          toast.error("Title must be at least 5 characters")
          setLoading(false)
          return
        }
        
        body = {
          service_id: serviceId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          verified_purchase: false
        }
      } else {
        toast.error("Invalid review configuration")
        setLoading(false)
        return
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast.success("Review submitted successfully!")
        
        // Reset form
        setRating(0)
        setTitle("")
        setComment("")
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const data = await response.json()
        if (data.code === "DUPLICATE_REVIEW") {
          toast.error("You have already reviewed this")
        } else if (data.code === "SELF_REVIEW_NOT_ALLOWED") {
          toast.error("You cannot review yourself")
        } else {
          toast.error(data.error || "Failed to submit review")
        }
      }
    } catch (error) {
      console.error("Review submission error:", error)
      toast.error("Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Sign in to leave a review</p>
          <Button onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <Label className="mb-2 block">Your Rating *</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 5 && "Excellent!"}
              {rating === 4 && "Very Good"}
              {rating === 3 && "Good"}
              {rating === 2 && "Fair"}
              {rating === 1 && "Poor"}
            </p>
          )}
        </div>

        {/* Title (only for service reviews) */}
        {variant === "service" && (
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Sum up your experience in a few words"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/100 characters
            </p>
          </div>
        )}

        {/* Comment */}
        <div>
          <Label htmlFor="comment">Your Review *</Label>
          <Textarea
            id="comment"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            required
            minLength={10}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum 10 characters ({comment.length}/10)
          </p>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading || rating === 0 || comment.trim().length < 10}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Card>
  )
}