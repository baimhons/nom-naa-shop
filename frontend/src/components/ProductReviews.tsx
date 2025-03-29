import React, { useState } from "react";
import { User, Calendar, Star, MessageSquare, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Review {
  ID: string;
  CreateAt: string;
  UserID: string;
  Rating: number;
  Comment: string;
  User: {
    ID: string;
    Username: string;
    Email: string;
  };
}

interface ProductReviewsProps {
  reviews: Review[];
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  reviews,
  productId,
}) => {
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [sortOption, setSortOption] = useState("newest");

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.CreateAt).getTime() - new Date(a.CreateAt).getTime();
    } else if (sortOption === "oldest") {
      return new Date(a.CreateAt).getTime() - new Date(b.CreateAt).getTime();
    } else if (sortOption === "highest") {
      return b.Rating - a.Rating;
    } else {
      return a.Rating - b.Rating;
    }
  });

  const handleSubmitReview = async () => {
    if (!newReview.trim()) {
      toast({
        title: "Review cannot be empty",
        description: "Please write your review before submitting",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://206.189.153.4:8080/api/v1/snack/review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            snack_id: productId,
            rating: rating,
            comment: newReview,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      toast({
        title: "Review submitted",
        description: "Your review has been successfully submitted",
      });

      setNewReview("");
      setRating(5);
      window.location.reload(); // refresh reviews
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit review";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-10 mt-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Product Reviews ({reviews.length})
        </h3>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 rounded-md py-1 px-3 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {sortedReviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h4 className="text-lg font-medium text-gray-900">No Reviews Yet</h4>
          <p className="text-gray-500 mt-1">
            Be the first to review this product
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review.ID} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.User.Username ||
                        review.User.Email ||
                        "Anonymous User"}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(review.CreateAt)}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      fill={i < review.Rating ? "#FFC107" : "none"}
                      stroke={i < review.Rating ? "#FFC107" : "#9CA3AF"}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-gray-700">{review.Comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* ---- Add Review Form ---- */}
      <div className="bg-gray-100 p-6 rounded-lg mt-8">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PencilLine className="h-5 w-5" /> Write a Review
        </h4>
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="h-6 w-6 cursor-pointer transition-all"
              fill={index < (hoveredStar || rating) ? "#FFC107" : "none"}
              stroke={index < (hoveredStar || rating) ? "#FFC107" : "#9CA3AF"}
              onMouseEnter={() => setHoveredStar(index + 1)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(index + 1)}
            />
          ))}
        </div>
        <Textarea
          placeholder="Share your thoughts about this product..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          className="mb-4"
        />
        <Button
          onClick={handleSubmitReview}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
};

export default ProductReviews;
