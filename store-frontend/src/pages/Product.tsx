import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import api from "../services/api";
import type {
  Product as RelatedProduct,
  ProductDetail,
  ProductDetailResponse,
  ProductsResponse,
} from "../types/product";
import Breadcrumbs from "../components/Breadcrumbs";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ProductCard from "../components/Home/ProductCard";
import ShippingCalculator from "../components/ShippingCalculator";
import { useCartStore } from "../store/cart";

const SIZES = ["P", "M", "G", "GG"];
const ORIGINAL_PRICE = 89.99;

export default function Product() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [category, setCategory] = useState<{
    id: number;
    name: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ProductDetailResponse>(`/product/${id}`)
      .then((res) => {
        if (cancelled) return;
        if (res.data.product) setProduct(res.data.product);
        if (res.data.category) setCategory(res.data.category);
        if (!res.data.product) setError("Product not found.");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Unable to load the product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ProductsResponse>(`/product/${id}/related`, { params: { limit: 4 } })
      .then((res) => {
        if (cancelled) return;
        if (!res.data.error) setRelatedProducts(res.data.products);
      })
      .catch(() => {
        if (!cancelled) setRelatedProducts([]);
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
      setSnackbarMessage("Link copiado");
    } catch {
      // clipboard unavailable
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!selectedSize) {
      setSnackbarMessage("Select a size before adding to the cart");
      return;
    }

    try {
      const res = await api.get<{ error: string | null; available: boolean }>(
        "/cart/validate-size",
        { params: { productId: product.id, size: selectedSize } },
      );
      if (!res.data.available) {
        setSnackbarMessage("Selected size unavailable");
        return;
      }
    } catch {
      setSnackbarMessage("The selected size could not be validated.");
      return;
    }

    addItem(product.id, 1, selectedSize);
    setSnackbarMessage("Product added to cart");
  };

  const mainImage = product?.images[selectedImageIndex] ?? product?.images[0];

  const thumbnailImages =
    product && product.images.length > 0
      ? product.images.length > 1
        ? product.images
        : Array.from({ length: 1 }, () => product.images[0])
      : [];

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
            <Box>
              <Box
                sx={{
                  position: "relative",
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

              {thumbnailImages.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  {thumbnailImages.map((img, index) => {
                    const selected = selectedImageIndex === index;
                    return (
                      <Box
                        key={index}
                        component="button"
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: 64,
                          height: 64,
                          p: 0.75,
                          flexShrink: 0,
                          bgcolor: "background.paper",
                          border: 1,
                          borderColor: selected ? "primary.main" : "divider",
                          borderRadius: 1,
                          cursor: "pointer",
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt={`${product.label} - miniatura ${index + 1}`}
                          sx={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
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
                  {SIZES.map((size) => {
                    const unavailable =
                      product.availableSizes.length > 0 &&
                      !product.availableSizes.includes(size);
                    return (
                      <Box
                        key={size}
                        component="button"
                        type="button"
                        disabled={unavailable}
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
                          cursor: unavailable ? "not-allowed" : "pointer",
                          opacity: unavailable ? 0.4 : 1,
                          textDecoration: unavailable ? "line-through" : "none",
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
                    );
                  })}
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
                  onClick={handleAddToCart}
                  sx={{ flex: 1 }}
                >
                  Adicionar ao carrinho
                </Button>
                <Tooltip title="Compartilhar">
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
                </Tooltip>
              </Box>

              <Divider sx={{ mt: { xs: 2, md: 3 } }} />

              <Box sx={{ mt: { xs: 2, md: 3 } }}>
                <ShippingCalculator />
              </Box>
            </Box>

            <Box
              sx={{
                gridColumn: { xs: "1", md: "1 / -1" },
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                px: 2,
                py: 5,
              }}
            >
              <Box
                onClick={() => setInfoExpanded((prev) => !prev)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: "23px" }}
                >
                  Informações do produto
                </Typography>
                <IconButton
                  aria-label={
                    infoExpanded
                      ? "Recolher informações"
                      : "Expandir informações"
                  }
                  size="small"
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    px: 2.5,
                    py: 2,
                    transform: infoExpanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              </Box>

              <Collapse in={infoExpanded}>
                <Divider sx={{ mt: { xs: 2, md: 3 } }} />

                <Typography variant="body2" sx={{ pt: 2, color: "gray" }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Phasellus interdum pulvinar mi ornare facilisis. Maecenas eget
                  risus purus. Morbi ac augue eget arcu fringilla volutpat eget
                  eget tortor. Nunc a lectus sagittis, suscipit tellus eget,
                  vulputate purus. Aliquam interdum ultricies ligula, a rutrum
                  orci elementum faucibus. Proin mattis a ligula non pulvinar.
                  Suspendisse ultrices sagittis tristique. Morbi scelerisque
                  turpis ullamcorper felis ultricies, sit amet fermentum arcu
                  maximus. Cras massa risus, dapibus in diam non, cursus
                  venenatis augue. Sed lacus orci, vehicula ut dolor ut,
                  faucibus gravida neque. Praesent justo ex, lobortis eget neque
                  non, commodo dignissim ligula. Aenean nec leo at eros rutrum
                  tempor eu nec enim. Duis rhoncus lobortis odio ac cursus.
                  Mauris nec pharetra lorem. Phasellus in lobortis sapien. Proin
                  et feugiat metus.
                </Typography>
              </Collapse>
            </Box>
          </Box>
        )}

        {!loading && !error && product && relatedProducts.length > 0 && (
          <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Você também vai gostar:
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
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
          open={Boolean(snackbarMessage)}
          autoHideDuration={2000}
          onClose={() => setSnackbarMessage(null)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </Container>
    </Box>
  );
}
