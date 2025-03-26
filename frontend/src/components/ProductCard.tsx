import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { number } from "zod";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: string;
  image: string;
  description: string;
  onAddToCart: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  quantity,
  type,
  image,
  description,
  onAddToCart,
}) => {
  const placeholderImage = "https://via.placeholder.com/200x200?text=Snack";

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group">
      <Link to={`/product/${id}`} className="block relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={image || placeholderImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
          }}
        />
        {quantity < 5 && quantity > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Only {quantity} left!
          </span>
        )}
      </Link>
      
      <div className="p-4">
        
        
        <Link to={`/product/${id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{type}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-gray-900">฿{price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;