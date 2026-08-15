import { useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import type { Product } from "../../types/product";

const CardWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  transition: "box-shadow 0.2s",
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
}));

const ImageContainer = styled(Box)({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  minHeight: 180,
});

interface ProductCardProps {
  product: Product;
  to?: string;
}

export default function ProductCard({ product, to }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const formattedPrice = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Link
      to={to ?? `/product/${product.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <CardWrapper>
      <ImageContainer>
        {!imageLoaded && (
          <Skeleton
            variant="rounded"
            sx={{
              position: "absolute",
              inset: 16,
              borderRadius: 1,
              bgcolor: "grey.400",
            }}
          />
        )}
        {product.image && (
          <Box
            component="img"
            src={product.image}
            alt={product.label}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            sx={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain" }}
          />
        )}
      </ImageContainer>
      <Box sx={{ p: 2, pt: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          {product.label}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "brand.main", fontWeight: 600 }}
        >
          {formattedPrice}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Pagamento via PIX
        </Typography>
      </Box>
      </CardWrapper>
    </Link>
  );
}
