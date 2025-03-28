import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  PackageIcon,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PaymentProofUpload from "./PaymentProofUpload";

interface OrderItem {
  ID: string;
  CreateAt: string;
  UpdateAt: string;
  DeleteAt: string;
  SnackID: string;
  Snack: {
    ID: string;
    CreateAt: string;
    UpdateAt: string;
    DeleteAt: string;
    Name: string;
    Price: number;
    Quantity: number;
    Type: string;
    Image?: string;
    Description: string;
  };
  Quantity: number;
  CartID: string;
}

interface Cart {
  ID: string;
  CreateAt: string;
  UpdateAt: string;
  DeleteAt: string;
  Items: OrderItem[];
  UserID: string;
  User: any;
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

interface Payment {
  ID: string;
  CreateAt: string;
  UpdateAt: string;
  DeleteAt: string;
  ImageURL: string;
  OrderID: string;
}

interface Order {
  ID: string;
  CreateAt: string;
  UpdateAt: string;
  DeleteAt: string;
  TrackingID: string;
  CartID: string;
  Cart: Cart;
  TotalPrice: number;
  Status: string;
  PaymentMethod: string;
  AddressID: string;
  Address: Address;
  Payment: Payment | null;
}

interface OrderHistoryResponse {
  message: string;
  orders: Order[];
}

// Add AuthorizedImage component
const AuthorizedImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(src, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load image");

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error("Error loading image:", err);
        setError(true);
      }
    };

    fetchImage();
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  if (error) {
    return (
      <img src="/placeholder-payment.png" alt={alt} className={className} />
    );
  }

  return imageSrc ? (
    <img src={imageSrc} alt={alt} className={className} />
  ) : (
    <div className={`${className} bg-gray-100 animate-pulse`} />
  );
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to view your order history",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("api:8080/api/v1/order/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order history");
      }

      const data: OrderHistoryResponse = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load order history";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp");
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            <PackageIcon className="h-3 w-3 mr-1" /> Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" /> Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateTotalItems = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.Quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading your order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          Error loading order history
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <PackageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No orders found</h3>
        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Order History</h2>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {orders.map((order, index) => (
          <AccordionItem
            key={order.ID}
            value={order.ID}
            className="border rounded-lg p-2"
          >
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-2 text-left">
                <div>
                  <p className="font-medium">
                    Order #{order.ID.substring(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.CreateAt)}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="hidden sm:block text-right">
                    <p className="font-medium">
                      ฿{order.TotalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {calculateTotalItems(order.Cart.Items)} items
                    </p>
                  </div>
                  <div>{getStatusBadge(order.Status)}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Shipping Address
                    </h4>
                    <p className="text-sm">
                      {order.Address.AddressDetail},{" "}
                      {order.Address.SubDistrictNameTH},{" "}
                      {order.Address.DistrictNameTH},{" "}
                      {order.Address.ProvinceNameTH}, {order.Address.PostalCode}
                    </p>
                  </div>
                  <div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        Order Details
                      </h4>
                      <p className="text-sm">
                        Payment Method: {order.PaymentMethod}
                      </p>
                      <p className="text-sm">Tracking ID: {order.TrackingID}</p>

                      {order.PaymentMethod === "qr code" ? (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">
                            Scan to Pay:
                          </h5>
                          <img
                            src="qr_code_payment.jpg"
                            alt="QR Code for payment"
                            className="w-45 h-45 object-contain border p-2"
                          />
                        </div>
                      ) : order.PaymentMethod === "bank transfer" ? (
                        <div className="mt-4 bg-gray-100 p-3 rounded">
                          <h5 className="text-sm font-semibold mb-2">
                            Bank Transfer Details:
                          </h5>
                          <p className="text-sm">Bank: Kasikorn Bank</p>
                          <p className="text-sm">Account Name: Nom-Naa Shop</p>
                          <p className="text-sm">
                            Account Number: 123-4-56789-0
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Items</h4>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.Cart.Items.map((item) => (
                          <TableRow key={item.ID}>
                            <TableCell className="font-medium">
                              <Link
                                to={`/product/${item.Snack.ID}`}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                              >
                                {item.Snack.Image && (
                                  <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden">
                                    <img
                                      src={`api:8080/api/v1/snack/image/${encodeURIComponent(
                                        item.Snack.ID
                                      )}`}
                                      alt={item.Snack.Name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <span className="hover:underline">
                                  {item.Snack.Name}
                                </span>
                              </Link>
                            </TableCell>
                            <TableCell>{item.Quantity}</TableCell>
                            <TableCell>
                              ฿{item.Snack.Price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              ฿{(item.Quantity * item.Snack.Price).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    {/* Payment proof upload area */}
                    {order.Payment ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Payment Proof</h4>
                        <div className="border rounded-md p-2 max-w-xs">
                          <AuthorizedImage
                            src={`api:8080/api/v1/payment/proof/${order.Payment.ID}`}
                            alt="Payment Proof"
                            className="max-h-40 max-w-full object-contain"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded on {formatDate(order.Payment.CreateAt)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Payment</h4>
                        {["pending", "processing"].includes(
                          order.Status.toLowerCase()
                        ) ? (
                          <PaymentProofUpload
                            orderId={order.ID}
                            onSuccess={fetchOrderHistory}
                          />
                        ) : (
                          <p className="text-sm text-gray-500">
                            No payment proof uploaded
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="flex justify-between gap-8">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">
                        ฿{order.TotalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default OrderHistory;
