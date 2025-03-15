import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Search, Filter, ShoppingCart, Star, Package, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";

interface Snack {
  ID: string;
  Name: string;
  Price: number;
  Quantity: number;
  Type: string;
  Image: string;
  Description: string;
}

interface CartItem {
  ID: string;
  SnackID: string;
  Quantity: number;
  Snack: Snack;
}

interface Cart {
  ID: string;
  Items: CartItem[];
  Status: string;
}

interface User {
  Email: string;
  ID: string;
  Name: string;
}

interface ApiResponse {
  data: Snack[];
  total_count: number;
  has_more: boolean;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<Map<string, number>>(new Map());
  const [addingToCartIds, setAddingToCartIds] = useState<string[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingCart, setLoadingCart] = useState(false);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isCheckingNextPage, setIsCheckingNextPage] = useState(false);
  const navigate = useNavigate();

  // Get values directly from URL params
  const page = parseInt(searchParams.get("page") || "0");
  const selectedType = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    fetchSnacks();
    checkAuthStatus();
  }, [searchParams]); // Only depend on searchParams

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    
    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:8080/api/v1/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else {
          // Token is invalid or expired
          setIsLoggedIn(false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8080/api/v1/users/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
        setUser(null);
        setCart(null);
        setCartItems(new Map());
        
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        });
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const checkNextPage = async (currentPage: number) => {
    try {
      let nextPageUrl = `http://127.0.0.1:8080/api/v1/snack?page=${currentPage + 1}&page_size=${pageSize}&sort=${sort}&order=${order}`;
      
      if (selectedType) {
        nextPageUrl += `&type=${encodeURIComponent(selectedType)}`;
      }

      if (search) {
        nextPageUrl += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(nextPageUrl);
      
      if (!response.ok) {
        return false;
      }
      
      const data: ApiResponse = await response.json();
      return data.data && Array.isArray(data.data) && data.data.length > 0;
    } catch (err) {
      return false;
    }
  };

  const fetchAllTypes = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/v1/snack/types');
      if (!response.ok) {
        throw new Error('Failed to fetch snack types');
      }
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setTypes(data.data);
      }
    } catch (err) {
      console.error('Error fetching snack types:', err);
    }
  };

  useEffect(() => {
    fetchAllTypes();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (searchTerm) {
      newSearchParams.set("search", searchTerm);
    } else {
      newSearchParams.delete("search");
    }
    
    // Reset to first page when searching
    newSearchParams.set("page", "0");
    setSearchParams(newSearchParams);
  };

  // Add new function for handling search submit
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (searchInput.trim()) {
      newSearchParams.set("search", searchInput.trim());
      newSearchParams.set("page", "0"); // Reset to first page when searching
      setSearchParams(newSearchParams);
      console.log("Debug - Sending search:", searchInput.trim()); // Add debug log
    } else {
      newSearchParams.delete("search");
      newSearchParams.set("page", "0");
      setSearchParams(newSearchParams);
    }
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const fetchSnacks = async () => {
    setLoading(true);
    setError("");
    setIsCheckingNextPage(true);
    try {
      let apiUrl = `http://127.0.0.1:8080/api/v1/snack?page=${page}&page_size=${pageSize}&sort=${sort}&order=${order}`;
      
      if (selectedType) {
        apiUrl += `&type=${encodeURIComponent(selectedType)}`;
      }

      if (search) {
        console.log("Debug - Adding search to URL:", search);
        apiUrl += `&search=${encodeURIComponent(search)}`;
      }
      
      console.log("Debug - Final API URL:", apiUrl);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate limit reached",
            description: "Please wait a moment before trying again",
            variant: "destructive",
          });
          await new Promise(resolve => setTimeout(resolve, 5000));
          return fetchSnacks();
        }
        throw new Error(`Error fetching snacks: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setSnacks(data.data);
        setTotalCount(data.total_count || data.data.length);
        const totalPages = Math.ceil((data.total_count || data.data.length) / pageSize);
        setTotalPages(totalPages);
        
        // Check if current page is the last page or if there are no more items
        const isLastPage = page >= totalPages - 1;
        const hasNextPage = !isLastPage && await checkNextPage(page);
        setHasMore(hasNextPage);
      } else {
        setSnacks([]);
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to fetch snacks. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch snacks. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsCheckingNextPage(false);
    }
  };

  const fetchCart = async () => {
    setLoadingCart(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        // If no token, we don't show an error as the user might be browsing without logging in
        setLoadingCart(false);
        return;
      }
      
      const response = await fetch("http://127.0.0.1:8080/api/v1/cart/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, clear tokens and update login state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsLoggedIn(false);
          setUser(null);
          return;
        }
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCart(data.data);
      
      const newCartItems = new Map<string, number>();
      data.data.Items?.forEach((item: CartItem) => {
        newCartItems.set(item.SnackID, item.Quantity);
      });
      setCartItems(newCartItems);
    } catch (err) {
      // We don't show cart errors to users who are just browsing
      console.error("Cart fetch error:", err);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isLoggedIn]);

  const handleTypeChange = (type: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (type) {
      newSearchParams.set("type", type);
    } else {
      newSearchParams.delete("type");
    }
    newSearchParams.set("page", "0");
    setSearchParams(newSearchParams);
  };

  const updateSearchParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    setSearchParams(newSearchParams);
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://127.0.0.1:8080/api/v1/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.data);
    }
  };

  const handleNextPage = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", (page + 1).toString());
    setSearchParams(newSearchParams);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", (page - 1).toString());
      setSearchParams(newSearchParams);
    }
  };

  const handleAddToCart = async (snackId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to add items to your cart",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      setAddingToCartIds(prev => [...prev, snackId]);
      
      const response = await fetch("http://127.0.0.1:8080/api/v1/cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: 1,
          snack_id: snackId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add item to cart");
      }

      await fetchCart();
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAddingToCartIds(prev => prev.filter(id => id !== snackId));
    }
  };

  const getSnackImage = (snack: Snack) => {
    // First try to use the Image URL if it exists and is a full URL
    if (snack.Image && typeof snack.Image === 'string' && snack.Image.startsWith('http')) {
      return snack.Image;
    }

    // If Image is a base64 string, use it directly
    if (snack.Image && typeof snack.Image === 'string' && snack.Image.startsWith('data:image')) {
      return snack.Image;
    }

    // Then try the API endpoint for byte array images
    try {
      return `http://127.0.0.1:8080/api/v1/snack/image/${encodeURIComponent(snack.ID)}`;
    } catch (error) {
      console.error('Error getting snack image:', error);
      return '/placeholder.png';
    }
  };

  const fallbackImageUrl = "/placeholder.png";

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes(fallbackImageUrl)) {
      console.error('Image failed to load:', img.src);
      img.src = fallbackImageUrl;
      img.classList.add('image-fallback');
    }
  };

  const generateRandomRating = () => {
    return (Math.floor(Math.random() * 5) + 3.5) / 2;
  };

  const handleViewCart = () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You need to be logged in to view your cart",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // If token exists, navigate to cart
    navigate('/cart');
  };

  const handleSortChange = (value: string) => {
    const [newSort, newOrder] = value.split('-');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("sort", newSort);
    newSearchParams.set("order", newOrder);
    setSearchParams(newSearchParams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="bg-white shadow-sm py-3 px-4 sm:px-6 lg:px-8 mb-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">Nom Naa Shop</Link>
          <div className="flex items-center gap-4">
            {isLoggedIn && user ? (
              <>
                <Link to="/cart" className="flex items-center gap-1">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">
                    {Array.from(cartItems.values()).reduce((sum, qty) => sum + qty, 0) || 0}
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <User className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium mr-2">{user.Name || user.Email}</span>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-1"
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin h-4 w-4 border-b-2 border-current rounded-full"></span>
                        Logging out...
                      </span>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Logout
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/login')}
                className="flex items-center gap-1"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-yellow-100 py-16 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Delicious Snacks</span>
              <span className="block text-primary">For Every Craving</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover our wide selection of tasty treats, from crispy chips to sweet delights
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative rounded-md shadow-sm w-full max-w-xs mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input block w-full pl-10 py-3 text-base rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="ค้นหาชื่อขนม..."
                    value={searchInput}
                    onChange={handleSearchInputChange}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-primary mr-2" />
              {loadingCart ? (
                <span className="font-medium">Loading cart...</span>
              ) : (
                <span className="font-medium">
                  {Array.from(cartItems.values()).reduce((sum, qty) => sum + qty, 0)} items in cart
                </span>
              )}
            </div>
            {search && (
              <div className="text-sm text-gray-500">
                ผลการค้นหา: "{search}"
              </div>
            )}
          </div>
          <Button 
            onClick={handleViewCart}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            View Cart
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Snack Type</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="all-types"
                        name="type"
                        type="radio"
                        checked={selectedType === ""}
                        onChange={() => handleTypeChange("")}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <label htmlFor="all-types" className="ml-2 text-sm text-gray-700">
                        All Types
                      </label>
                    </div>
                    
                    {types.map(type => (
                      <div key={type} className="flex items-center">
                        <input
                          id={`type-${type}`}
                          name="type"
                          type="radio"
                          checked={selectedType === type}
                          onChange={() => handleTypeChange(type)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Sort By</h3>
                  <select
                    value={`${sort}-${order}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-md"></div>
                    <div className="h-6 bg-gray-200 rounded mt-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <Button 
                  onClick={fetchSnacks} 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : snacks.length === 0 ? (
              <div className="text-center py-10">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No snacks found</h3>
                <p className="mt-1 text-gray-500">
                  Try changing your filters or check back later for new items.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {snacks.map((snack) => (
                    <ProductCard
                      key={snack.ID}
                      id={snack.ID}
                      name={snack.Name}
                      price={snack.Price}
                      quantity={snack.Quantity}
                      type={snack.Type}
                      image={getSnackImage(snack)}
                      description={snack.Description}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevPage} 
                    disabled={page === 0}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleNextPage} 
                    disabled={!hasMore || isCheckingNextPage || snacks.length < pageSize}
                    className="flex items-center gap-1"
                  >
                    {isCheckingNextPage ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-b-2 border-current rounded-full"></span>
                        Checking...
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
