
import React from "react";
import RegisterForm from "@/components/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 lg:px-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3 text-center animate-fade-up">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Create your account
            </h1>
            <p className="text-muted-foreground text-balance">
              Enter your information below to create your account.
            </p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
      
      {/* Right side - Background/Image */}
      <div className="hidden md:block flex-1 bg-gradient-to-br from-primary/90 to-primary/30"> 
      <img
          src="snack_login_page1.png"
          alt="Snack Banner"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Register;
