import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import api from "../services/api";
import type { Product, ProductsResponse } from "../types/product";
import ProductCard from "../components/Home/ProductCard";
import ProductCardSkeleton from "../components/Home/ProductCardSkeleton";

type OrderBy = "views" | "selling" | "price";

const SORT_OPTIONS: { value: OrderBy; label: string }[] = [
  { value: "views", label: "Mais vistos" },
  { value: "selling", label: "Mais vendidos" },
  { value: "price", label: "Menor preço" },
];

const GRID = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(3, 1fr)",
  },
  gap: 2,
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [orderBy, setOrderBy] = useState<OrderBy>("views");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ProductsResponse>("/products", {
        params: {
          ...(q ? { search: q } : {}),
          orderBy,
          page,
        },
      })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data.products);
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Não foi possível carregar os resultados.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, orderBy, page]);

  const totalPages =
    total !== undefined ? Math.max(1, Math.ceil(total / 9)) : 1;

  const handleSortSelect = (value: OrderBy) => {
    setOrderBy(value);
    setPage(1);
    setSortAnchor(null);
  };

  const handlePageChange = (_event: unknown, value: number) => {
    setLoading(true);
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const count = total ?? products.length;

  return (
    <Box
      component="main"
      sx={{ bgcolor: "background.default", minHeight: "100svh" }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: 15,
          }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Home
            </Typography>
          </Link>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {" > "}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            Busca
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 1,
            mt: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: 24,
                color: "text.primary",
                lineHeight: 1,
              }}
            >
              {count}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: 16, color: "text.secondary" }}
            >
              {q
                ? `${count === 1 ? "resultado" : "resultados"} para \u201c${q}\u201d`
                : count === 1
                  ? "produto"
                  : "produtos"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Ordenar por
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={orderBy}
                onChange={(event) =>
                  handleSortSelect(event.target.value as OrderBy)
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            gap: 1,
            mb: 2,
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={(event) => setSortAnchor(event.currentTarget)}
            startIcon={
              <Box
                component="img"
                src="/assets/ui/arrow-up-down-line.png"
                alt="Ordenar"
                sx={{ width: 20, height: 20 }}
              />
            }
            sx={{ flex: 1 }}
          >
            Ordenar
          </Button>
        </Box>

        <Menu
          anchorEl={sortAnchor}
          open={Boolean(sortAnchor)}
          onClose={() => setSortAnchor(null)}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              selected={orderBy === option.value}
              onClick={() => handleSortSelect(option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>

        <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: 24,
                color: "text.primary",
                lineHeight: 1,
              }}
            >
              {count}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: 16, color: "text.secondary" }}
            >
              {q
                ? `${count === 1 ? "resultado" : "resultados"} para \u201c${q}\u201d`
                : count === 1
                  ? "produto"
                  : "produtos"}
            </Typography>
          </Box>
        </Box>

        {loading && (
          <Box sx={GRID}>
            {Array.from({ length: 9 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ py: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && count === 0 && (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            {q
              ? `Nenhum resultado para \u201c${q}\u201d.`
              : "Nenhum produto cadastrado."}
          </Typography>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <Box sx={GRID}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Box>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
