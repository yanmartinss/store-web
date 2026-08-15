import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import api from "../services/api";
import type { Product, ProductsResponse } from "../types/product";
import ProductCard from "../components/Home/ProductCard";
import ProductCardSkeleton from "../components/Home/ProductCardSkeleton";
import Breadcrumbs from "../components/Breadcrumbs";

interface MetadataValue {
  id: string;
  label: string;
}

interface CategoryMetadataGroup {
  id: string;
  name: string;
  values: MetadataValue[];
}

interface CategoryMetadataResponse {
  error: string | null;
  category: { id: number; name: string; slug: string } | null;
  metadata: CategoryMetadataGroup[];
}

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
    md: "repeat(2, 1fr)",
    lg: "repeat(3, 1fr)",
  },
  gap: 2,
};

interface FilterGroupsProps {
  groups: CategoryMetadataGroup[];
  expandedGroups: string[];
  selectedFilters: Record<string, string[]>;
  onToggleGroup: (groupId: string) => void;
  onToggleValue: (groupId: string, valueId: string) => void;
}

function FilterGroups({
  groups,
  expandedGroups,
  selectedFilters,
  onToggleGroup,
  onToggleValue,
}: FilterGroupsProps) {
  return (
    <>
      {groups.map((group) => {
        const expanded = expandedGroups.includes(group.id);
        return (
          <Box
            key={group.id}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              pb: 1,
              mb: 1.5,
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => onToggleGroup(group.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                p: 0,
                m: 0,
                textAlign: "left",
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                {group.name}
              </Typography>
              <ExpandMoreIcon
                sx={{
                  color: "text.secondary",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </Box>

            {expanded && (
              <Box sx={{ mt: 0.5 }}>
                {group.values.map((value) => (
                  <Box
                    key={value.id}
                    component="label"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      py: 0.25,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedFilters[group.id]?.includes(value.id)}
                      onChange={() => onToggleValue(group.id, value.id)}
                      sx={{ p: 0.5 }}
                    />
                    <Typography variant="body2">{value.label}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
}

export default function Category() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();

  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [metadataGroups, setMetadataGroups] = useState<CategoryMetadataGroup[]>(
    [],
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [orderBy, setOrderBy] = useState<OrderBy>("views");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >(() => {
    const raw = searchParams.get("metadata");
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [
          key,
          value.split("|").filter(Boolean),
        ]),
      );
    } catch {
      return {};
    }
  });
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);

  const activeFilterEntries = Object.entries(selectedFilters).filter(
    ([, valueIds]) => valueIds.length > 0,
  );
  const metadataParam =
    activeFilterEntries.length > 0
      ? JSON.stringify(
          Object.fromEntries(
            activeFilterEntries.map(([groupId, valueIds]) => [
              groupId,
              valueIds.join("|"),
            ]),
          ),
        )
      : undefined;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api
        .get<CategoryMetadataResponse>(`/category/${slug}/metadata`)
        .catch(() => null),
      api
        .get<ProductsResponse>("/products", {
          params: {
            category: slug,
            orderBy,
            ...(metadataParam ? { metadata: metadataParam } : {}),
          },
        })
        .catch(() => null),
    ]).then(([categoryRes, productsRes]) => {
      if (cancelled) return;

      if (categoryRes?.data.category) {
        setCategoryName(categoryRes.data.category.name);
      }

      if (categoryRes?.data.metadata) {
        setMetadataGroups(categoryRes.data.metadata);
        setExpandedGroups(
          categoryRes.data.metadata.map((group) => group.id),
        );
      }

      if (productsRes?.data.products) {
        setProducts(productsRes.data.products);
      }

      if (!categoryRes && !productsRes) {
        setError("Não foi possível carregar os produtos.");
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, orderBy, metadataParam]);

  const title =
    categoryName ??
    (slug.charAt(0).toUpperCase() + slug.slice(1) || "Categoria");

  const handleSortSelect = (value: OrderBy) => {
    setOrderBy(value);
    setSortAnchor(null);
  };

  const handleFilterToggle = (groupId: string, valueId: string) => {
    setSelectedFilters((prev) => {
      const current = prev[groupId] ?? [];
      const next = current.includes(valueId)
        ? current.filter((id) => id !== valueId)
        : [...current, valueId];
      return { ...prev, [groupId]: next };
    });
  };

  const handleGroupToggle = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
  };

  const getProductTo = (id: number) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (metadataParam) params.set("metadata", metadataParam);
    const queryString = params.toString();
    return `/product/${id}${queryString ? `?${queryString}` : ""}`;
  };

  const renderCount = (label: string) => (
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
        {products.length}
      </Typography>
      <Typography
        component="span"
        sx={{ fontSize: 16, color: "text.secondary" }}
      >
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box
      component="main"
      sx={{ bgcolor: "background.default", minHeight: "100svh" }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: title }]} />
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
          {renderCount("Produtos encontrados")}
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
            display: "grid",
            gap: 3,
            alignItems: "start",
            gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
          }}
        >
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              position: { md: "sticky" },
              top: { md: 16 },
            }}
          >
            <FilterGroups
              groups={metadataGroups}
              expandedGroups={expandedGroups}
              selectedFilters={selectedFilters}
              onToggleGroup={handleGroupToggle}
              onToggleValue={handleFilterToggle}
            />
          </Box>

          <Box>
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                gap: 1,
                mb: 2,
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
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setFiltersOpen(true)}
                startIcon={
                  <Box
                    component="img"
                    src="/assets/ui/equalizer-2-line.png"
                    alt="Filtrar"
                    sx={{ width: 20, height: 20 }}
                  />
                }
                sx={{ flex: 1 }}
              >
                Filtrar
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
              {renderCount(products.length === 1 ? "Produto" : "Produtos")}
            </Box>

            {loading && (
              <Box sx={GRID}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </Box>
            )}

            {error && (
              <Typography color="error" sx={{ py: 2 }}>
                {error}
              </Typography>
            )}

            {!loading && !error && products.length === 0 && (
              <Typography
                color="text.secondary"
                sx={{ py: 4, textAlign: "center" }}
              >
                Nenhum produto encontrado nesta categoria.
              </Typography>
            )}

            {!loading && !error && products.length > 0 && (
              <Box sx={GRID}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    to={getProductTo(product.id)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            pb: 2,
            maxHeight: "85vh",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: "grey.400" }} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros
          </Typography>
          <IconButton
            onClick={() => setFiltersOpen(false)}
            aria-label="Fechar filtros"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <FilterGroups
            groups={metadataGroups}
            expandedGroups={expandedGroups}
            selectedFilters={selectedFilters}
            onToggleGroup={handleGroupToggle}
            onToggleValue={handleFilterToggle}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleClearFilters}
          >
            Limpar
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setFiltersOpen(false)}
          >
            Ver {products.length} {products.length === 1 ? "produto" : "produtos"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
