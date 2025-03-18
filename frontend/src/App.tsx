import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

import Index from '@/pages/Index';
import Login from '@/pages/login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Order';
import Admin from '@/pages/Admin';
import AdminProducts from '@/pages/AdminProduct';
import AdminOrders from '@/pages/AdminOrder';
import AdminUsers from '@/pages/AdminUser';

// Create a client
const queryClient = new QueryClient();

// Get user role from token
const getUserRole = () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken.role;
  } catch (error) {
    console.error("Token parsing error:", error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
};

// Protected route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole) {
    const role = getUserRole();
    if (role !== requiredRole) {
      return <Navigate to="/notfound" replace />;
    }
  }
  
  return children;
};

// Protected admin route component
const ProtectedAdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <main>
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <Admin />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedAdminRoute>
                  <AdminProducts />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedAdminRoute>
                  <AdminOrders />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedAdminRoute>
                  <AdminUsers />
                </ProtectedAdminRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;