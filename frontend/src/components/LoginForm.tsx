import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("api:8080/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.data.data.access_token);
        localStorage.setItem("refresh_token", data.data.data.refresh_token);

        // Check user role and redirect based on role
        try {
          const decodedToken = JSON.parse(
            atob(data.data.data.access_token.split(".")[1])
          );
          const role = decodedToken.role;

          toast.success("Login Successful");

          if (role === "admin") {
            navigate("/admin");
          } else {
            navigate("/products");
          }
        } catch (error) {
          console.error("Error parsing token:", error);
          navigate("/products");
        }
      } else {
        toast.error(data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error(
        "An error occurred while logging in. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4.75C12.6903 4.75 13.25 5.30964 13.25 6C13.25 6.69036 12.6903 7.25 12 7.25C11.3096 7.25 10.75 6.69036 10.75 6C10.75 5.30964 11.3096 4.75 12 4.75ZM12 16.75C12.6903 16.75 13.25 17.3096 13.25 18C13.25 18.6904 12.6903 19.25 12 19.25C11.3096 19.25 10.75 18.6904 10.75 18C10.75 17.3096 11.3096 16.75 12 16.75ZM18.1819 5.81803C18.6327 6.26882 18.6327 6.99921 18.1819 7.44999C17.7312 7.90078 17.0008 7.90078 16.55 7.44999C16.0992 6.99921 16.0992 6.26882 16.55 5.81803C17.0008 5.36724 17.7312 5.36724 18.1819 5.81803ZM5.81803 16.55C6.26882 16.0992 6.99921 16.0992 7.44999 16.55C7.90078 17.0008 7.90078 17.7312 7.44999 18.1819C6.99921 18.6327 6.26882 18.6327 5.81803 18.1819C5.36724 17.7312 5.36724 17.0008 5.81803 16.55ZM18.1819 16.55C18.6327 16.0992 18.6327 16.0992 18.1819 16.55C17.7312 17.0008 17.0008 17.0008 16.55 16.55C16.0992 16.0992 16.0992 16.0992 16.55 16.55C17.0008 17.0008 17.7312 17.0008 18.1819 16.55ZM5.81803 7.44999C6.26882 7.90078 6.99921 7.90078 7.44999 7.44999C7.90078 7.00078 7.90078 6.26882 7.44999 5.81803C6.99921 5.36724 6.26882 5.36724 5.81803 5.81803C5.36724 6.26882 5.36724 7.00078 5.81803 7.44999Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0ZM2.39747 12C2.39747 6.69669 6.69669 2.39747 12 2.39747C17.3033 2.39747 21.6025 6.69669 21.6025 12C21.6025 17.3033 17.3033 21.6025 12 21.6025C6.69669 21.6025 2.39747 17.3033 2.39747 12Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
