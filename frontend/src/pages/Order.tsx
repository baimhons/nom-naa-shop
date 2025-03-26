import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Package, ShoppingBag, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

interface Address {
  ID: string;
  CreateAt: string;
  UpdateAt: string;
  DeleteAt: string;
  ProvinceCode: number;
  ProvinceNameTH: string;
  DistrictCode: number;
  DistrictNameTH: string;
  SubDistrictCode: number;
  SubDistrictNameTH: string;
  PostalCode: number;
  AddressDetail: string;
  UserID: string;
}

interface AddressResponse {
  message: string;
  data: Address[];
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
}

type PaymentMethod = "qr code" | "bank transfer";

const Orders = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("qr code");
  const [isConfirming, setIsConfirming] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fromCart = location.state?.fromCart;

  useEffect(() => {
    if (fromCart) {
      fetchCart();
      fetchAddresses();
      fetchUserProfile();
    } else {
      navigate('/cart');
    }
  }, [fromCart, navigate]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to view your cart",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch("http://127.0.0.1:8080/api/v1/cart/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCart(data.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
      navigate("/cart");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to view addresses",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch("http://127.0.0.1:8080/api/v1/address/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data: AddressResponse = await response.json();
      console.log("Addresses response:", data);

      if (!data.data || !Array.isArray(data.data)) {
        console.error("Invalid address data format:", data);
        throw new Error("Invalid address data format");
      }

      setAddresses(data.data);
      
      if (data.data.length > 0 && !selectedAddressId) {
        console.log("Setting default address:", data.data[0]);
        setSelectedAddressId(data.data[0].ID);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      toast({
        title: "Error",
        description: "Failed to load addresses. Please try again or add a new address.",
        variant: "destructive",
      });
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const response = await fetch("http://127.0.0.1:8080/api/v1/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      if (data.data && data.data.data) {
        setUserProfile(data.data.data);
        console.log("User profile loaded:", data.data.data);
      } else {
        throw new Error("Invalid user profile data format");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const confirmOrder = async () => {
    if (!cart?.ID) {
      toast({
        title: "Error",
        description: "Invalid cart data",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAddressId) {
      toast({
        title: "Error",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const orderData = {
        address_id: selectedAddressId,
        cart_id: cart.ID,
        payment_method: selectedPaymentMethod
      };

      console.log("Sending order data:", orderData);

      const response = await fetch("http://127.0.0.1:8080/api/v1/order/confirm", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Order confirmation error:", errorData);
        throw new Error(errorData?.message || "Failed to create order");
      }

      toast({
        title: "Success",
        description: "Order placed successfully!",
      });

      navigate("/products");
    } catch (error) {
      console.error("Error confirming order:", error);
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const calculateTotal = () => {
    if (!cart?.Items) return 0;
    return cart.Items.reduce((total, item) => {
      return total + (item.Snack.Price * item.Quantity);
    }, 0);
  };

  const getSnackImage = (snack: CartItem['Snack']) => {
    return `http://127.0.0.1:8080/api/v1/snack/image/${snack.ID}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold mb-6">Order Confirmation</h1>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-500">Loading your order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.Items || cart.Items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold mb-6">Order Confirmation</h1>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Button onClick={() => navigate("/products")}>
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => navigate("/cart")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-semibold mb-6">Order Confirmation</h1>
              
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                  {userProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">
                          {userProfile.first_name && userProfile.last_name 
                            ? `${userProfile.first_name} ${userProfile.last_name}`
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{userProfile.phone_number || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{userProfile.email || "Not provided"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                      <span className="text-sm text-gray-500">Loading contact information...</span>
                    </div>
                  )}
                </div>

                {/* Delivery Address Selection */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Delivery Address</h3>
                  {addresses && addresses.length > 0 ? (
                    <div className="space-y-4">
                      <Select 
                        value={selectedAddressId} 
                        onValueChange={(value) => {
                          console.log("Selected address:", value);
                          setSelectedAddressId(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an address" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((address) => (
                            <SelectItem key={address.ID} value={address.ID}>
                              {address.AddressDetail}, {address.SubDistrictNameTH}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Show selected address details */}
                      {selectedAddressId && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {addresses.find(a => a.ID === selectedAddressId) && (
                            <div className="space-y-2">
                              <p className="font-medium">
                                {addresses.find(a => a.ID === selectedAddressId)?.AddressDetail}
                              </p>
                              <p className="text-sm text-gray-600">
                                แขวง{addresses.find(a => a.ID === selectedAddressId)?.SubDistrictNameTH}{' '}
                                เขต{addresses.find(a => a.ID === selectedAddressId)?.DistrictNameTH}{' '}
                                {addresses.find(a => a.ID === selectedAddressId)?.ProvinceNameTH}{' '}
                                {addresses.find(a => a.ID === selectedAddressId)?.PostalCode}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-2">No addresses found</p>
                      <Button variant="outline" onClick={() => navigate('/profile')}>
                        Add New Address
                      </Button>
                    </div>
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                  <RadioGroup
                    value={selectedPaymentMethod}
                    onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="qr code" id="qr-code" />
                      <Label htmlFor="qr-code" className="flex items-center">
                        QR Code Payment
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="bank transfer" id="bank-transfer" />
                      <Label htmlFor="bank-transfer" className="flex items-center">
                        Bank Transfer
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Payment Method Details */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    {selectedPaymentMethod === "qr code" && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">QR Code Payment Instructions:</p>
                        <img
                            src="qr_code_payment.jpg"
                            alt="QR Code for payment"
                            className="w-43 h-43 object-contain border p-2"
                          />
                      </div>
                    )}
                    {selectedPaymentMethod === "bank transfer" && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">Bank Transfer Details:</p>
                        <p>Bank: Kasikorn Bank</p>
                        <p>Account Name: Nom-Naa Shop</p>
                        <p>Account Number: 123-4-56789-0</p>
                        <p className="mt-2">Please include your order number in the transfer reference</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-2">
                    <span className="text-red-600 text-lg">*</span> You need to upload proof of payment in order history
                  </p>
                </div>

                {/* Order Items */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {cart.Items.map((item) => (
                        <div key={item.ID} className="flex items-center space-x-4 py-4 border-b last:border-0">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                            <img
                              src={getSnackImage(item.Snack)}
                              alt={item.Snack.Name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.png";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.Snack.Name}</h4>
                            <p className="text-sm text-gray-500">Quantity: {item.Quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">฿{(item.Snack.Price * item.Quantity).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">฿{item.Snack.Price.toFixed(2)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>฿{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>฿{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                onClick={confirmOrder}
                disabled={isConfirming || !selectedAddressId || !selectedPaymentMethod}
              >
                {isConfirming ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Place Order"
                )}
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;