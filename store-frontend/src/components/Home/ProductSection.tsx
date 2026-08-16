import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import api from "../../services/api";
import type { Product, ProductsResponse } from "../../types/product";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductSectionProps {
  title: string;
  subtitle: string;
  orderBy: "views" | "selling";
  limit?: number;
}

interface FetchState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export default function ProductSection({
  title,
  subtitle,
  orderBy,
  limit = 4,
}: ProductSectionProps) {
  const [state, setState] = useState<FetchState>({
    products: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    api
      .get<ProductsResponse>("/products", { params: { orderBy, limit } })
      .then((res) => {
        if (cancelled) return;
        if (res.data.error) {
          setState({ products: [], loading: false, error: res.data.error });
        } else {
          setState({
            products: res.data.products,
            loading: false,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ products: [], loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [orderBy, limit]);

  return (
    <Box component="section" sx={{ mt: 4 }}>
      {!state.loading && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "gray" }}>
            {subtitle}
          </Typography>
        </>
      )}

      {state.loading && (
        <Box sx={{ mt: 2 }}>
          <Skeleton
            variant="rounded"
            width="40%"
            height={30}
            sx={{ bgcolor: "grey.400", mb: 1 }}
          />
          <Skeleton
            variant="rounded"
            width="60%"
            height={16}
            sx={{ bgcolor: "grey.400", mb: 2 }}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
                md: `repeat(${Math.min(limit, 4)}, 1fr)`,
              },
              gap: 2,
            }}
          >
            {Array.from({ length: limit }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </Box>
        </Box>
      )}

      {state.error && (
        <Typography color="error" sx={{ py: 2 }}>
          {state.error}
        </Typography>
      )}

      {!state.loading && !state.error && state.products.length === 0 && (
        <Box
          sx={{
            py: 4,
            px: 2,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">
            Nenhum produto disponível nesta seção no momento.
          </Typography>
        </Box>
      )}

      {!state.loading && !state.error && state.products.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
              md: `repeat(${Math.min(limit, 4)}, 1fr)`,
            },
            gap: 2,
          }}
        >
          {state.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Box>
      )}
    </Box>
  );
}
