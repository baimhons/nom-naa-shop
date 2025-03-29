import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  TruckIcon,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface OrderItem {
  ID: string;
  SnackID: string;
  Snack: {
    ID: string;
    Name: string;
    Price: number;
    Image: string;
  };
  Quantity: number;
}

interface Address {
  ID: string;
  ProvinceNameTH: string;
  DistrictNameTH: string;
  SubDistrictNameTH: string;
  PostalCode: number;
  AddressDetail: string;
}

interface Payment {
  ID: string;
  CreateAt: string;
  ImageURL: string;
}

interface Order {
  ID: string;
  CreateAt: string;
  UpdateAt: string;
  TrackingID: string;
  TotalPrice: number;
  Status: string;
  PaymentMethod: string;
  Cart: {
    ID: string;
    Items: OrderItem[];
    User: {
      ID: string;
      Username: string;
      Email: string;
      PhoneNumber: string;
      FirstName?: string;
      LastName?: string;
    };
  };
  Address: Address;
  Payment: Payment | null;
}

// Expand the pagination params interface to include sorting
interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Add response interface with pagination metadata
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API functions
const fetchOrders = async (
  params: PaginationParams
): Promise<PaginatedResponse<Order>> => {
  const token = localStorage.getItem("access_token");
  const queryParams = new URLSearchParams();

  // Fix the page parameter - backend expects 0-based index
  queryParams.append("page", (params.page - 1).toString()); // Convert from 1-based UI to 0-based API
  queryParams.append("page_size", params.limit.toString());

  // Add sorting parameters if provided
  if (params.sort) {
    queryParams.append("sort", params.sort);
  }

  if (params.order) {
    queryParams.append("order", params.order);
  }

  const url = `http://206.189.153.4:8080/api/v1/order?${queryParams}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(`Failed to fetch orders: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    data: data.data || [],
    pagination: data.pagination || {
      total: 0,
      page: 1,
      limit: 25,
      totalPages: 1,
    },
  };
};

const updateOrderStatus = async ({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://206.189.153.4:8080/api/v1/order/status", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      order_id: orderId,
      status: status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }

  return response.json();
};

// Add the AuthorizedImage component from OrderHistory
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
      <div className="text-center p-4 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-2" />
        <p>Failed to load image</p>
      </div>
    );
  }

  return imageSrc ? (
    <img src={imageSrc} alt={alt} className={className} />
  ) : (
    <div
      className={`${className} flex items-center justify-center bg-gray-100`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [viewOrderDetails, setViewOrderDetails] = useState<Order | null>(null);

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Add sorting states
  const [sortField, setSortField] = useState<string>("create_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Default to newest first

  const queryClient = useQueryClient();

  // Update the query with retry and error handling
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", currentPage, pageSize, sortField, sortOrder],
    queryFn: async () => {
      try {
        const result = await fetchOrders({
          page: currentPage,
          limit: pageSize,
          sort: sortField,
          order: sortOrder,
        });

        // Update pagination state
        setTotalOrders(result.pagination.total);
        setTotalPages(result.pagination.totalPages);

        return result.data;
      } catch (err) {
        console.error("Error fetching orders:", err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const orders = data || [];

  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated successfully");
      setIsUpdateDialogOpen(false);
      setSelectedOrder(null);
      setSelectedStatus("");
    },
    onError: (error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });

  const handleUpdateStatus = () => {
    if (!selectedOrder || !selectedStatus) {
      toast.error("Please select a valid status");
      return;
    }

    updateStatusMutation.mutate({
      orderId: selectedOrder.ID,
      status: selectedStatus,
    });
  };

  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.Status);
    setIsUpdateDialogOpen(true);
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
            <TruckIcon className="h-3 w-3 mr-1" /> Shipped
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp");
    } catch (e) {
      return dateString;
    }
  };

  const filteredOrders = orders.filter((order: Order) => {
    const orderIdMatch = order.ID.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const userNameMatch = order.Cart?.User?.Username?.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const userEmailMatch = order.Cart?.User?.Email?.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    return orderIdMatch || userNameMatch || userEmailMatch;
  });

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Function to handle sort changes
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle sort order if clicking on the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default order (desc for dates, asc for others)
      setSortField(field);
      setSortOrder(field === "CreateAt" ? "desc" : "asc");
    }

    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Helper to show sort indicators
  const getSortIndicator = (field: string) => {
    if (field !== sortField) return null;

    return sortOrder === "asc" ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  return (
    <AdminLayout title="Manage Orders">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["orders"] });
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Display loading and error states more clearly */}
      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>Error loading orders:</p>
          <pre className="mt-2 p-2 bg-red-50 rounded text-sm overflow-auto">
            {(error as Error).message}
          </pre>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["orders"] })
            }
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("ID")}
                >
                  Order ID {getSortIndicator("ID")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("CreateAt")}
                >
                  Date {getSortIndicator("CreateAt")}
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("TotalPrice")}
                >
                  Amount {getSortIndicator("TotalPrice")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("Status")}
                >
                  Status {getSortIndicator("Status")}
                </TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order: Order) => (
                  <TableRow key={order.ID}>
                    <TableCell className="font-medium">
                      {order.ID.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{formatDate(order.CreateAt)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.Cart?.User?.Username || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.Cart?.User?.Email || "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>฿{order.TotalPrice.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.Status)}</TableCell>
                    <TableCell>
                      {order.Payment ? (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />{" "}
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50">
                          <Clock className="h-3 w-3 mr-1 text-yellow-500" />{" "}
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateDialog(order)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className=""></div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog
        open={!!viewOrderDetails}
        onOpenChange={(open) => !open && setViewOrderDetails(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {viewOrderDetails && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Order #{viewOrderDetails.ID} -{" "}
                  {formatDate(viewOrderDetails.CreateAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <p>
                    Name:{" "}
                    {viewOrderDetails.Cart?.User?.FirstName &&
                    viewOrderDetails.Cart?.User?.LastName
                      ? `${viewOrderDetails.Cart.User.FirstName} ${viewOrderDetails.Cart.User.LastName}`
                      : "N/A"}
                  </p>
                  <p>Email: {viewOrderDetails.Cart?.User?.Email || "N/A"}</p>
                  <p>
                    Phone: {viewOrderDetails.Cart?.User?.PhoneNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p>
                    {viewOrderDetails.Address?.AddressDetail || "N/A"}
                    {viewOrderDetails.Address?.SubDistrictNameTH &&
                      `, ${viewOrderDetails.Address.SubDistrictNameTH}`}
                    {viewOrderDetails.Address?.DistrictNameTH &&
                      `, ${viewOrderDetails.Address.DistrictNameTH}`}
                    {viewOrderDetails.Address?.ProvinceNameTH &&
                      `, ${viewOrderDetails.Address.ProvinceNameTH}`}
                    {viewOrderDetails.Address?.PostalCode &&
                      `, ${viewOrderDetails.Address.PostalCode}`}
                  </p>
                </div>
              </div>

              <div className="py-2">
                <h4 className="font-medium mb-2">Order Items</h4>
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
                      {viewOrderDetails.Cart.Items.map((item) => (
                        <TableRow key={item.ID}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.Snack.Image ? (
                                <img
                                  src={`http://206.189.153.4:8080/api/v1/snack/image/${item.Snack.ID}`}
                                  alt={item.Snack.Name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : null}
                              <span>{item.Snack.Name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.Quantity}</TableCell>
                          <TableCell>฿{item.Snack.Price.toFixed(2)}</TableCell>
                          <TableCell>
                            ฿{(item.Quantity * item.Snack.Price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-medium"
                        >
                          Total:
                        </TableCell>
                        <TableCell className="font-bold">
                          ฿{viewOrderDetails.TotalPrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="py-2">
                <h4 className="font-medium mb-2">Payment Proof</h4>
                <div className="border rounded p-4 flex justify-center">
                  {viewOrderDetails.Payment && viewOrderDetails.Payment.ID ? (
                    <AuthorizedImage
                      src={`http://206.189.153.4:8080/api/v1/payment/proof/${viewOrderDetails.Payment.ID}`}
                      alt="Payment proof"
                      className="max-h-60 object-contain"
                    />
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2" />
                      <p>No payment proof available</p>
                    </div>
                  )}
                </div>
                {viewOrderDetails.Payment && (
                  <p className="text-sm text-gray-500 mt-1">
                    Uploaded on {formatDate(viewOrderDetails.Payment.CreateAt)}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewOrderDetails(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewOrderDetails(null);
                    openUpdateDialog(viewOrderDetails);
                  }}
                >
                  Update Status
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder?.ID.substring(0, 8)}
              ...
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending || !selectedStatus}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
