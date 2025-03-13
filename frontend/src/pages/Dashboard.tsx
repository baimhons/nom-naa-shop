
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const Dashboard = () => {
  // Default dashboard component with link to products
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="w-full bg-white shadow-sm py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link to="/products">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingCart size={16} />
                Browse Products
              </Button>
            </Link>
            <Button 
              variant="destructive"
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard!</h2>
            <p className="text-gray-600 mb-6">
              This is where you'll find your account information and orders.
            </p>
            
            <div className="mt-4">
              <Link to="/products">
                <Button className="flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Browse Our Snacks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
