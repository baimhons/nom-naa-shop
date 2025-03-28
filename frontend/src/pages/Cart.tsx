import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Trash,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CartItem {
  ID: string;
  SnackID: string;
  Quantity: number;
  Snack: {
    ID: string;
    Name: string;
    Price: number;
    Quantity: number;
    Type: string;
    Image: string;
    Description: string;
  };
}

interface Cart {
  ID: string;
  Items: CartItem[];
  Status: string;
}

const Cart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to view your cart",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/v1/cart/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          toast({
            title: "Session Expired",
            description: "Your login session has expired. Please log in again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }

      const data = await response.json();
      console.log("Cart data:", data);
      if (data && data.data) {
        setCart(data.data);
      } else {
        throw new Error("Invalid cart data structure");
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to fetch cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (
    itemId: string,
    snackId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setUpdatingItemId(itemId);
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to update your cart",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/v1/cart/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: itemId,
          snack_id: snackId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          toast({
            title: "Session Expired",
            description: "Your login session has expired. Please log in again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        throw new Error("Failed to update item quantity");
      }

      await fetchCart();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setDeletingItemId(itemId);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to remove items",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/cart/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await fetchCart();

      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.Items) return 0;
    return cart.Items.reduce((total, item) => {
      return total + item.Snack.Price * item.Quantity;
    }, 0);
  };

  const getSnackImage = (snack: CartItem["Snack"]) => {
    return `http://localhost:8080/api/v1/snack/image/${snack.ID}`;
  };

  const confirmCheckout = async () => {
    if (!cart || cart.Items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add items before checking out.",
        variant: "destructive",
      });
      return;
    }

    if (isCheckingOut) return;

    setIsCheckingOut(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to checkout",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      navigate("/orders", {
        state: {
          fromCart: true,
          cartId: cart.ID,
        },
      });
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.Items || cart.Items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-1">
                Your cart is empty
              </h2>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added any snacks to your cart yet.
              </p>
              <Link to="/products">
                <Button className="mt-2">Browse Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/products"
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Shopping Cart
                </h1>
                <span className="text-gray-500">
                  {cart.Items.length}{" "}
                  {cart.Items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {cart.Items.map((item) => (
                <div key={item.ID} className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="col-span-2 flex items-center space-x-4">
                      <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={getSnackImage(item.Snack)}
                          alt={item.Snack.Name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.png";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.Snack.Name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.Snack.Type}
                        </p>
                        {item.Snack.Quantity <= 10 ? (
                          <span className="text-sm text-red-400">
                            {item.Snack.Quantity} item
                            {item.Snack.Quantity > 1 ? "s" : ""} left!
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500"></span>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="md:hidden font-medium text-gray-500 mr-2">
                        Price:
                      </span>
                      ฿{item.Snack.Price.toFixed(2)}
                    </div>

                    <div className="text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() =>
                              updateItemQuantity(
                                item.ID,
                                item.SnackID,
                                item.Quantity - 1
                              )
                            }
                            disabled={
                              updatingItemId === item.ID || item.Quantity <= 1
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.Snack.Quantity}
                            value={item.Quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              const newQuantity = Math.min(
                                Math.max(value, 1),
                                item.Snack.Quantity
                              );
                              updateItemQuantity(
                                item.ID,
                                item.SnackID,
                                newQuantity
                              );
                            }}
                            className="w-16 text-center px-2 py-1 border-none focus:outline-none"
                          />
                          <button
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() =>
                              updateItemQuantity(
                                item.ID,
                                item.SnackID,
                                item.Quantity + 1
                              )
                            }
                            disabled={
                              updatingItemId === item.ID ||
                              item.Quantity >= item.Snack.Quantity
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="md:hidden font-medium text-gray-500 mr-2">
                        Subtotal:
                      </span>
                      <span className="font-medium">
                        ฿{(item.Snack.Price * item.Quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator className="mt-6" />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => removeItem(item.ID)}
                      className="flex items-center text-sm text-red-500 hover:text-red-700"
                      disabled={deletingItemId === item.ID}
                    >
                      {deletingItemId === item.ID ? (
                        <span className="flex items-center">
                          <span className="animate-spin h-3 w-3 border-b-2 border-red-500 rounded-full mr-1"></span>
                          Removing...
                        </span>
                      ) : (
                        <>
                          <Trash className="h-3 w-3 mr-1" />
                          Remove
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ฿{calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>฿{calculateSubtotal().toFixed(2)}</span>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" disabled={isCheckingOut}>
                    {isCheckingOut ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to place this order for ฿
                      {calculateSubtotal().toFixed(2)}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmCheckout}
                      disabled={isCheckingOut}
                      className="cursor-not-allowed:opacity-50"
                    >
                      {isCheckingOut ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        "Confirm Order"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
