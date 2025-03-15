import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { Button } from "../components/ui/button";
import { ShoppingCart } from "lucide-react";

const Login = () => {
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
              Log in to your account to continue your journey with us.
            </p>
          </div>
          
          <LoginForm />
          
          <div className="text-center mt-8">
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
        <div className="h-full w-full flex items-center justify-center p-12">
          <div className="max-w-md text-white space-y-8 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium w-fit">
                Welcome Back
              </span>
              <h2 className="text-4xl font-bold tracking-tight">
                Continue your journey
              </h2>
              <p className="text-white/90 text-lg">
                Sign in to access your personalized dashboard and continue where you left off.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 transform transition-all hover:scale-105 hover:bg-white/25">
                <div className="font-semibold mb-2 text-lg">Welcome Back!</div>
                <p className="text-sm text-white/80">We've missed you. Sign in to continue your journey with us and explore all the new features and updates we've added since your last visit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


