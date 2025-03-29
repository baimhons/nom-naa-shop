import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ProductReviews from "@/components/ProductReviews";

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

interface Snack {
  ID: string;
  Name: string;
  Price: number;
  Quantity: number;
  Type: string;
  Image: string;
  Description: string;
  Reviews: Review[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snack, setSnack] = useState<Snack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Update back navigation to preserve filters
  const handleBackToProducts = () => {
    navigate(-1); // This is equivalent to window.history.back()
  };

  useEffect(() => {
    const fetchSnack = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await fetch(
          `http://206.189.153.4:8080/api/v1/snack/${id}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching snack: ${response.status}`);
        }

        const data = await response.json();
        setSnack(data.data);

        // Calculate average rating
        if (data.data.Reviews && data.data.Reviews.length > 0) {
          const total = data.data.Reviews.reduce(
            (sum: number, review: Review) => sum + review.Rating,
            0
          );
          setAverageRating(
            parseFloat((total / data.data.Reviews.length).toFixed(1))
          );
        }
      } catch (err) {
        setError("Failed to fetch snack details. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to fetch snack details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSnack();
  }, [id]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && snack && newQuantity <= snack.Quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!snack) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);

    try {
      const response = await fetch("http://206.189.153.4:8080/api/v1/cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: quantity,
          snack_id: snack.ID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add item to cart");
      }

      toast({
        title: "Added to cart",
        description: `${quantity} x ${snack.Name} added to your cart`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add item to cart";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const getSnackImage = () => {
    if (!snack) return "";
    return `http://206.189.153.4:8080/api/v1/snack/image/${snack.ID}`;
  };

  const handleViewCart = () => {
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-3xl">
          <div className="animate-pulse space-y-8">
            <div className="flex gap-8">
              <div className="bg-gray-200 rounded-lg h-96 w-96"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !snack) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            {error ||
              "The product you're looking for doesn't exist or has been removed."}
          </p>
          <Link to="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToProducts}
            className="text-primary hover:text-primary-dark flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <Button
            variant="outline"
            onClick={handleViewCart}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            View Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src={getSnackImage()}
              alt={snack.Name}
              className="w-full h-auto object-cover aspect-square"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "public/lovable-uploads/93bbd02a-87dd-436e-9d2a-c053d585bed9.png";
              }}
            />
          </div>

          <div className="space-y-6">
            <Badge
              variant="outline"
              className="bg-primary-100 text-primary-800"
            >
              {snack.Type}
            </Badge>

            <h1 className="text-3xl font-bold text-gray-900">{snack.Name}</h1>

            <div className="flex items-center space-x-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5"
                    fill={i < Math.floor(averageRating) ? "#FFC107" : "none"}
                    stroke={
                      i < Math.floor(averageRating) ? "#FFC107" : "#9CA3AF"
                    }
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-gray-700">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({snack.Reviews?.length || 0} reviews)
              </span>
            </div>

            <div className="text-2xl font-bold text-gray-900">
              ฿{snack.Price.toFixed(2)}
            </div>

            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Availability:</span>
                {snack.Quantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    {snack.Quantity > 10
                      ? "In Stock"
                      : `Only ${snack.Quantity} left!`}
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>

              <p className="text-gray-600">{snack.Description}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || snack.Quantity <= 0}
                  className="h-10 w-10 rounded-r-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= snack.Quantity || snack.Quantity <= 0}
                  className="h-10 w-10 rounded-l-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleAddToCart}
                disabled={snack.Quantity === 0 || adding}
              >
                {snack.Quantity === 0 ? (
                  "Out of Stock"
                ) : adding ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-white">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({snack.Reviews?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="description"
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium mb-4">Product Description</h3>
            <p className="text-gray-600">{snack.Description}</p>
          </TabsContent>

          <TabsContent
            value="details"
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium mb-4">Product Details</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Product Name</TableCell>
                  <TableCell>{snack.Name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Type</TableCell>
                  <TableCell>{snack.Type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Price</TableCell>
                  <TableCell>฿{snack.Price.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Quantity</TableCell>
                  <TableCell>{snack.Quantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ID</TableCell>
                  <TableCell>{snack.ID}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent
            value="reviews"
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <ProductReviews
              reviews={snack.Reviews || []}
              productId={snack.ID}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
