import React from "react";
import LoginForm from "@/components/LoginForm";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/snack_login_page_test.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl m-4">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            Nom Naa Shop
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link 
            to="/register" 
            className="font-semibold text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
