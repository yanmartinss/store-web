export interface Product {
  id: number;
  label: string;
  price: number;
  image: string | null;
}

export interface ProductMetadataItem {
  group: string;
  valueId: string;
  label: string;
}

export interface ProductDetail {
  id: number;
  label: string;
  price: number;
  description: string | null;
  images: string[];
  metadata: ProductMetadataItem[];
  availableSizes: string[];
}

export interface ProductsResponse {
  error: string | null;
  products: Product[];
  total?: number;
}

export interface ProductDetailResponse {
  error: string | null;
  product: ProductDetail | null;
  category: { id: number; name: string; slug: string } | null;
}
