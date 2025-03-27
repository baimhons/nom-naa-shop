import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Search } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schema for the product form
const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  quantity: z.coerce.number().int().positive({ message: "Quantity must be a positive integer" }),
  type: z.string().min(2, { message: "Type must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  image: z.instanceof(File).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// API functions
const fetchProducts = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://127.0.0.1:8080/api/v1/snack", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  
  const data = await response.json();
  return data.data;
};

const createProduct = async (formData: FormData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://127.0.0.1:8080/api/v1/snack", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to create product");
  }
  
  return response.json();
};

const updateProduct = async ({ id, formData }: { id: string; formData: FormData }) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`http://127.0.0.1:8080/api/v1/snack/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to update product");
  }
  
  return response.json();
};

const deleteProduct = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`http://127.0.0.1:8080/api/v1/snack/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
  
  return response.json();
};

const AdminProducts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      setIsDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
  
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 0,
      type: "",
      description: "",
    },
  });
  
  const handleCreateProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      price: 0,
      quantity: 0,
      type: "",
      description: "",
    });
    setIsDialogOpen(true);
  };
  
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.Name,
      price: product.Price,
      quantity: product.Quantity,
      type: product.Type,
      description: product.Description || "",
    });
    setIsDialogOpen(true);
  };
  
  
  const handleSubmit = (values: ProductFormValues) => {
    const formData = new FormData();
    
    if (editingProduct) {
      // For updates, we need to include the ID
      formData.append("id", editingProduct.ID);
    }
    
    formData.append("name", values.name);
    formData.append("price", values.price.toString());
    formData.append("quantity", values.quantity.toString());
    formData.append("type", values.type);
    formData.append("description", values.description);
    
    if (values.image) {
      formData.append("files", values.image);
    }
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.ID, formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  // Get proper image URL for a product
  const getProductImageUrl = (product: any) => {
    if (!product.ID) return "https://via.placeholder.com/50?text=No+Image";
    return `http://127.0.0.1:8080/api/v1/snack/image/${product.ID}`;
  };
  
  const filteredProducts = products.filter((product: any) =>
    product.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminLayout title="Manage Products">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateProduct}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">Loading products...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          Error loading products: {(error as Error).message}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: any) => (
                  <TableRow key={product.ID}>
                    <TableCell>
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.Name}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/50?text=No+Image";
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.Name}</TableCell>
                    <TableCell>฿{product.Price.toFixed(2)}</TableCell>
                    <TableCell>{product.Quantity}</TableCell>
                    <TableCell>{product.Type}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
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
      
      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the details of the existing product."
                : "Fill in the details for the new product."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Product type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onChange(file);
                        }}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormMessage />
                    {editingProduct?.ID && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Current image:</p>
                        <img
                          src={getProductImageUrl(editingProduct)}
                          alt="Current product"
                          className="w-24 h-24 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/100?text=No+Image";
                          }}
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;