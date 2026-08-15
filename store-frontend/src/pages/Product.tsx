import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import api from "../services/api";
import type { ProductDetail, ProductDetailResponse } from "../types/product";
import Breadcrumbs from "../components/Breadcrumbs";

const SIZES = ["P", "M", "G", "GG"];
const ORIGINAL_PRICE = 89.99;

export default function Product() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [category, setCategory] = useState<{
    id: number;
    name: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ProductDetailResponse>(`/product/${id}`)
      .then((res) => {
        if (cancelled) return;
        if (res.data.product) setProduct(res.data.product);
        if (res.data.category) setCategory(res.data.category);
        if (!res.data.product) setError("Produto não encontrado.");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Não foi possível carregar o produto.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const tech = product?.metadata.find((meta) => meta.group === "tech");

  const categorySlug = category?.slug ?? searchParams.get("category");
  const metadataParam = searchParams.get("metadata");

  const categoryQuery = metadataParam
    ? `?metadata=${encodeURIComponent(metadataParam)}`
    : "";
  const categoryTo = categorySlug ? `/${categorySlug}${categoryQuery}` : "/";
  const techTo =
    tech && categorySlug
      ? `/${categorySlug}?metadata=${encodeURIComponent(JSON.stringify({ tech: tech.valueId }))}`
      : undefined;

  const breadcrumbItems = [
    { label: "Home", to: "/" },
    ...(category ? [{ label: category.name, to: categoryTo }] : []),
    ...(tech ? [{ label: tech.label, to: techTo }] : []),
  ];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.label, url });
      } catch {
        // share cancelled by the user
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // clipboard unavailable
    }
  };

  const mainImage = product?.images[0];

  return (
    <Box
      component="main"
      sx={{ bgcolor: "background.default", minHeight: "100svh" }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {!loading && <Breadcrumbs items={breadcrumbItems} />}

        {loading && (
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rounded" sx={{ width: "100%", height: 320 }} />
            <Skeleton variant="text" sx={{ width: 200, height: 28, mt: 2 }} />
            <Skeleton variant="text" sx={{ width: "100%", height: 24 }} />
            <Skeleton
              variant="rounded"
              sx={{ width: "100%", height: 96, mt: 2 }}
            />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ py: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && product && (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              mt: 2,
              alignItems: "start",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            <Box
              sx={{
                position: { xs: "relative", md: "sticky" },
                top: { md: 16 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                minHeight: 320,
              }}
            >
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
              {mainImage && (
                <Box
                  component="img"
                  src={mainImage}
                  alt={product.label}
                  onClick={() => setDialogOpen(true)}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                    cursor: "zoom-in",
                  }}
                />
              )}
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: 13 }}
              >
                CÓD: {product.id}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                {product.label}
              </Typography>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Selecione o tamanho
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {SIZES.map((size) => (
                    <Box
                      key={size}
                      component="button"
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      sx={{
                        minWidth: 48,
                        py: 1,
                        px: 2,
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: 14,
                        textTransform: "uppercase",
                        border: 1,
                        borderRadius: 1,
                        cursor: "pointer",
                        bgcolor:
                          selectedSize === size
                            ? "primary.main"
                            : "transparent",
                        color:
                          selectedSize === size
                            ? "primary.contrastText"
                            : "text.primary",
                        borderColor:
                          selectedSize === size ? "primary.main" : "divider",
                      }}
                    >
                      {size}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  de {formatPrice(ORIGINAL_PRICE)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    por
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "brand.main",
                      fontSize: 30,
                      lineHeight: 1.2,
                    }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Pagamento via PIX
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 3,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ flex: 1 }}
                >
                  Adicionar ao carrinho
                </Button>
                <IconButton
                  aria-label="Compartilhar"
                  onClick={handleShare}
                  sx={{
                    border: 1,
                    borderColor: "primary.main",
                    borderRadius: 1,
                    color: "primary.main",
                    width: 48,
                    height: 48,
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <Box
            sx={{
              position: "relative",
              bgcolor: "background.paper",
              p: 2,
            }}
          >
            <IconButton
              onClick={() => setDialogOpen(false)}
              aria-label="Fechar imagem"
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
            {mainImage && (
              <Box
                component="img"
                src={mainImage}
                alt={product?.label}
                sx={{ width: "100%", height: "auto", display: "block" }}
              />
            )}
          </Box>
        </Dialog>

        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={() => setCopied(false)}
          message="Link copiado"
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </Container>
    </Box>
  );
}
