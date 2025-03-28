
import { ProductSuggestion } from "@/types/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface ProductCardProps {
  product: ProductSuggestion;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="product-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.title}</CardTitle>
          <span className="font-bold text-lg text-secondary">{product.price}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="mb-3 text-foreground/80">
          {product.description}
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          {product.categories.map((category, idx) => (
            <Badge key={idx} variant="outline" className="bg-accent/50 hover:bg-accent">
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
