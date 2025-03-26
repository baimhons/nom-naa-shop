import React from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { Button } from "../components/ui/button";
import { ShoppingCart } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8080/api/v1/user/login', {
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.token);
      
        const isAdmin = data.user.UserType === 'admin' || data.user.Role === 'admin';
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/products');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 lg:px-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3 text-center animate-fade-up">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-balance">
              Log in to your account to shopping snack in nom naa shop.
            </p>
          </div>
          
          <LoginForm />
          
          <div className="space-y-4 text-center mt-3">
            <div className="text-sm mb-5">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </div>
            
            <Link to="/products">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingCart size={16} />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Right side - Background/Image */}
      <div className="hidden md:block flex-1 bg-gradient-to-br from-primary/90 to-primary/30">
      <img
          src="/snack_login_page_test.jpg"
          alt="Snack Banner"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;


