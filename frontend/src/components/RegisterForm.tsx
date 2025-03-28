import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone,
  KeyRound,
} from "lucide-react";

interface FormData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone_number: string;
}

const RegisterForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone_number: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 5) {
      newErrors.username = "Username must be at least 5 characters";
    }

    // First name validation
    if (!formData.first_name) {
      newErrors.first_name = "First name is required";
    }

    // Last name validation
    if (!formData.last_name) {
      newErrors.last_name = "Last name is required";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    // Phone number validation
    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must contain only digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Form validation failed",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast({
        title: "Registration successful!",
        description: "Your account has been created successfully.",
        variant: "default",
      });

      // Redirect to login page or dashboard after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-md animate-fade-up"
    >
      {/* Username */}
      <div className="space-y-1">
        <label
          htmlFor="username"
          className="form-label flex items-center gap-1.5"
        >
          <User size={14} className="text-primary" />
          Username
        </label>
        <div className="form-input-wrapper rounded-xl transition-all hover:border-primary/50 focus-within:shadow-md">
          <input
            id="username"
            name="username"
            type="text"
            className="form-input"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
            autoComplete="username"
          />
        </div>
        {errors.username && (
          <p className="text-destructive text-sm flex items-center gap-1 mt-1">
            <AlertCircle size={14} /> {errors.username}
          </p>
        )}
      </div>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label
            htmlFor="first_name"
            className="form-label flex items-center gap-1.5"
          >
            <User size={14} className="text-primary" />
            First Name
          </label>
          <div className="form-input-wrapper rounded-xl transition-all hover:border-primary/50 focus-within:shadow-md">
            <input
              id="first_name"
              name="first_name"
              type="text"
              className="form-input"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleInputChange}
              autoComplete="given-name"
            />
          </div>
          {errors.first_name && (
            <p className="text-destructive text-sm flex items-center gap-1 mt-1">
              <AlertCircle size={14} /> {errors.first_name}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="last_name"
            className="form-label flex items-center gap-1.5"
          >
            <User size={14} className="text-primary" />
            Last Name
          </label>
          <div className="form-input-wrapper rounded-xl transition-all hover:border-primary/50 focus-within:shadow-md">
            <input
              id="last_name"
              name="last_name"
              type="text"
              className="form-input"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleInputChange}
              autoComplete="family-name"
            />
          </div>
          {errors.last_name && (
            <p className="text-destructive text-sm flex items-center gap-1 mt-1">
              <AlertCircle size={14} /> {errors.last_name}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="form-label flex items-center gap-1.5">
          <Mail size={14} className="text-primary" />
          Email
        </label>
        <div className="form-input-wrapper rounded-xl transition-all hover:border-primary/50 focus-within:shadow-md">
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="text-destructive text-sm flex items-center gap-1 mt-1">
            <AlertCircle size={14} /> {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label
          htmlFor="password"
          className="form-label flex items-center gap-1.5"
        >
          <KeyRound size={14} className="text-primary" />
          Password
        </label>
        <div className="form-input-wrapper group rounded-xl transition-all hover:border-primary/50 focus-within:shadow-md">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="form-input pr-10"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 text-muted-foreground hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-destructive text-sm flex items-center gap-1 mt-1">
            <AlertCircle size={14} /> {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label
          htmlFor="confirm_password"
          className="form-label flex items-center gap-1.5"
        >
          <KeyRound size={14} className="text-primary" />
          Confirm Password
        </label>
        <div className="form-input-wrapper group rounded-xl transition-all hover:border-primary/50 focus-within:shadow-md">
          <input
            id="confirm_password"
            name="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            className="form-input pr-10"
            placeholder="Confirm your password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute right-3 text-muted-foreground hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="text-destructive text-sm flex items-center gap-1 mt-1">
            <AlertCircle size={14} /> {errors.confirm_password}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-1">
        <label
          htmlFor="phone_number"
          className="form-label flex items-center gap-1.5"
        >
          <Phone size={14} className="text-primary" />
          Phone Number
        </label>
        <div className="form-input-wrapper rounded-xl transition-all hover:border-primary/50 focus-within:shadow-md">
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            className="form-input"
            placeholder="Enter your phone number"
            value={formData.phone_number}
            onChange={handleInputChange}
            autoComplete="tel"
          />
        </div>
        {errors.phone_number && (
          <p className="text-destructive text-sm flex items-center gap-1 mt-1">
            <AlertCircle size={14} /> {errors.phone_number}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 font-medium tracking-wide rounded-xl shadow-md hover:shadow-lg transition-all"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Login Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account?</span>{" "}
        <a
          href="/login"
          className="text-primary font-medium hover:underline transition-colors"
        >
          Sign in
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;
