
import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="relative h-48 bg-gray-100 overflow-hidden">
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
      </div>
      
      <div className="p-4">
        <span className="inline-block px-2 py-1 text-xs font-semibold text-primary-800 bg-primary-100 rounded-full mb-2">
          {type}
        </span>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{name}</h3>
        
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-gray-900">฿{price.toFixed(2)}</span>
          <div className="flex items-center">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  fill={i < 4 ? "#FFC107" : "none"}
                  stroke={i < 4 ? "#FFC107" : "#9CA3AF"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">4.0</span>
          </div>
        </div>
        
        <Button
          className="w-full mt-3 flex items-center justify-center gap-2"
          onClick={() => onAddToCart(id)}
          disabled={quantity === 0}
        >
          {quantity === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
