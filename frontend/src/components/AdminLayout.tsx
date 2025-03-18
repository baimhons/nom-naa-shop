import React, { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Home, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                            'mr-3 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="mt-auto border-t border-gray-200 p-4">
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="w-full py-4 bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          </header>
          <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;