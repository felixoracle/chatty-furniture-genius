
import { ProductSuggestion } from "@/types/chat";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, ThumbsUp } from "lucide-react";

interface ProductSuggestionsProps {
  products: ProductSuggestion[];
  onRequestNewSuggestions: () => void;
}

const ProductSuggestions = ({ products, onRequestNewSuggestions }: ProductSuggestionsProps) => {
  if (!products.length) return null;

  return (
    <div className="p-4 border border-border rounded-lg bg-card/50 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Sugerencias de Muebles</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onRequestNewSuggestions}
          >
            <RefreshCw size={14} />
            <span>Explorar nuevas ideas</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductSuggestions;
