
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
              Enter your information below to create your account and get started.
            </p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
      
      {/* Right side - Background/Image */}
      <div className="hidden md:block flex-1 bg-gradient-to-br from-primary/90 to-primary/30">
        <div className="h-full w-full flex items-center justify-center p-12">
          <div className="max-w-md text-white space-y-8 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium w-fit">
                Join Us Today
              </span>
              <h2 className="text-4xl font-bold tracking-tight">
                Start your journey with us
              </h2>
              <p className="text-white/90 text-lg">
                Create an account to access all features and services tailored just for you.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 transform transition-all hover:scale-105 hover:bg-white/25">
                <div className="font-semibold mb-2 text-lg">Personalized Experience</div>
                <p className="text-sm text-white/80">Enjoy content tailored to your preferences</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 transform transition-all hover:scale-105 hover:bg-white/25">
                <div className="font-semibold mb-2 text-lg">Secure Platform</div>
                <p className="text-sm text-white/80">Your data is protected with cutting-edge security</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 transform transition-all hover:scale-105 hover:bg-white/25">
                <div className="font-semibold mb-2 text-lg">Always Available</div>
                <p className="text-sm text-white/80">24/7 access to your account and services</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 transform transition-all hover:scale-105 hover:bg-white/25">
                <div className="font-semibold mb-2 text-lg">Premium Support</div>
                <p className="text-sm text-white/80">Get help whenever you need it</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
