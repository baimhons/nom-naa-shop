import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowLeft, Loader2, MapPin, Edit } from "lucide-react";
import AddressManager from "../components/AddressManager";
import ProfileUpdateForm from "../components/UpdateProfileFrom";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://127.0.0.1:8080/api/v1/users/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data.data.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-500">Error Loading Profile</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/products")}>Return to Products</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-6 flex items-center gap-1" 
          onClick={() => navigate("/products")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>

        <div className="mb-6 flex space-x-4">
          <Button 
            variant={activeTab === 'profile' ? "default" : "outline"}
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" /> Profile
          </Button>
          <Button 
            variant={activeTab === 'addresses' ? "default" : "outline"}
            onClick={() => setActiveTab('addresses')}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" /> Addresses
          </Button>
        </div>

        {activeTab === 'profile' ? (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-primary/10 mx-auto rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">User Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile && !isEditing && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Username</h3>
                      <p className="mt-1 text-lg font-medium">{profile.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-lg font-medium">{profile.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                      <p className="mt-1 text-lg font-medium">{profile.phone_number || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-lg font-medium">
                        {`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                      <p className="mt-1 text-sm font-mono text-gray-600 break-all">{profile.id}</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      className="w-full sm:w-auto flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" /> Edit Profile
                    </Button>
                  </div>
                </>
              )}
              {profile && isEditing && (
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Update Profile</h3>
                  <ProfileUpdateForm 
                    profile={profile} 
                    onProfileUpdate={handleProfileUpdate} 
                  />
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
            {!isEditing && (
              <CardFooter className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate("/products")}>Back to Shopping</Button>
              </CardFooter>
            )}
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <AddressManager />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;