import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Users } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null); // To store the total revenue
  const cards = [
    {
      title: "Products",
      icon: Package,
      description: "Manage all products in the store",
      link: "/admin/products",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      description: "View and manage customer orders",
      link: "/admin/orders",
      bgColor: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      title: "Users",
      icon: Users,
      description: "Manage user accounts and permissions",
      link: "/admin/users",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-500",
    },
  ];

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(
          "http://localhost:8080/api/v1/order/total-revenue",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data && data.totalRevenue) {
          setTotalRevenue(data.totalRevenue);
        }
      } catch (error) {
        console.error("Error fetching total revenue:", error);
      }
    };

    fetchTotalRevenue();
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {cards.map((card, index) => (
          <Link key={index} to={card.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xl font-bold">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">total Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue !== null
                  ? `฿${totalRevenue.toFixed(2)}`
                  : "Loading..."}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
