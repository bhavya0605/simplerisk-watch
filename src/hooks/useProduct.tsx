import { createContext, useContext, useState, ReactNode } from "react";
import type { Product } from "@/lib/api";

interface ProductContextType {
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
}

const ProductContext = createContext<ProductContextType>({
  selectedProduct: null,
  setSelectedProduct: () => {},
});

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <ProductContext.Provider value={{ selectedProduct, setSelectedProduct }}>
      {children}
    </ProductContext.Provider>
  );
};
