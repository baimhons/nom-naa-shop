
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const AdminUsers = () => {
  return (
    <AdminLayout title="Manage Users">
      <Card className="w-full p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl">User Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="mb-6 text-gray-600">
            This page will contain user management functionality, allowing you to view and manage user accounts, permissions, and more.
          </p>
          <div className="flex justify-center">
            <Button>
              View Users <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;