
import React from "react";
import { Filter } from "lucide-react";

interface ProductFilterProps {
  types: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  sort: string;
  order: string;
  onSortChange: (sort: string, order: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  types,
  selectedType,
  onTypeChange,
  sort,
  order,
  onSortChange,
}) => {
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newOrder] = event.target.value.split('-');
    onSortChange(newSort, newOrder);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 sticky top-4">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        Filters
      </h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Snack Type</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="all-types"
                name="type"
                type="radio"
                checked={selectedType === ""}
                onChange={() => onTypeChange("")}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="all-types" className="ml-2 text-sm text-gray-700">
                All Types
              </label>
            </div>
            
            {types.map(type => (
              <div key={type} className="flex items-center">
                <input
                  id={`type-${type}`}
                  name="type"
                  type="radio"
                  checked={selectedType === type}
                  onChange={() => onTypeChange(type)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Sort By</h3>
          <select
            value={`${sort}-${order}`}
            onChange={handleSortChange}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
