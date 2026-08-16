import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import api from "../services/api";
import { getErrorMessage } from "../utils/get-error-message";
import { useCartStore } from "../store/cart";
import type { Product } from "../types/product";
import ShippingCalculator, {
  type ShippingSelection,
} from "../components/ShippingCalculator";

interface CartProduct extends Product {
  quantity: number;
  size?: string;
}

interface Address {
  id: number;
  zipcode: string;
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  complement: string | null;
}

export default function Cart() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const [shipping, setShipping] = useState<ShippingSelection | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CartProduct | null>(null);

  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    city: "",
    state: "",
    country: "",
    complement: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await api.get<{ error: string | null; addresses: Address[] }>(
        "/user/addresses",
      );
      setAuthenticated(true);
      setAddresses(res.data.addresses);
      if (res.data.addresses.length === 0) setShowNewAddressForm(true);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setAuthenticated(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (selectedAddressId === null && addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  const handleSaveAddress = async () => {
    if (!shipping?.zipcode) {
      setSnackbarMessage("Calculate shipping by entering the ZIP code.");
      return;
    }
    setSavingAddress(true);
    try {
      const res = await api.post<{ error: string | null; address: Address }>(
        "/user/addresses",
        { zipcode: shipping.zipcode, ...newAddress },
      );
      if (res.data.error) {
        setSnackbarMessage(res.data.error);
        return;
      }
      setAddresses((prev) => [...prev, res.data.address]);
      setSelectedAddressId(res.data.address.id);
      setShowNewAddressForm(false);
      setNewAddress({
        street: "",
        number: "",
        city: "",
        state: "",
        country: "",
        complement: "",
      });
    } catch (err) {
      setSnackbarMessage(
        getErrorMessage(err, "It was not possible to save the address."),
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setSnackbarMessage("Select a delivery address.");
      return;
    }
    setCheckingOut(true);
    try {
      const res = await api.post<{ error: string | null; url: string }>(
        "/cart/finish",
        { addressId: selectedAddressId, cart: items },
      );
      if (res.data.error) {
        setSnackbarMessage(res.data.error);
        return;
      }
      window.location.href = res.data.url;
    } catch (err) {
      setSnackbarMessage(
        getErrorMessage(err, "The purchase could not be completed."),
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const fetchProducts = useCallback(async () => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const ids = items.map((item) => item.productId);
      const res = await api.post<{ error: string | null; products: Product[] }>(
        "/cart/mount",
        { ids },
      );
      if (!res.data.error) {
        // /cart/mount returns one product per id, in the same order the
        // ids were sent, so zip by index rather than matching on productId
        // — matching on productId alone breaks when the same product was
        // added in two different sizes (both share the same productId).
        const merged = res.data.products.map((p, index) => {
          const cartItem = items[index];
          return {
            ...p,
            quantity: cartItem?.quantity ?? 1,
            size: cartItem?.size,
          };
        });
        setProducts(merged);
      }
    } catch (err) {
      setSnackbarMessage(
        getErrorMessage(err, "Erro ao carregar produtos do carrinho."),
      );
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const handleRemove = (productId: number, size: string | undefined) => {
    removeItem(productId, size);
    setProducts((prev) =>
      prev.filter((p) => !(p.id === productId && p.size === size)),
    );
  };

  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    handleRemove(removeTarget.id, removeTarget.size);
    setRemoveTarget(null);
  };

  const handleUpdateQuantity = (product: CartProduct, newQty: number) => {
    if (newQty < 1) {
      setRemoveTarget(product);
      return;
    }
    updateQuantity(product.id, product.size, newQty);
  };

  const total = subtotal + (shipping?.cost ?? 0);

  if (items.length === 0 && !loading) {
    return (
      <Box
        component="main"
        sx={{ bgcolor: "background.default", minHeight: "100svh" }}
      >
        <Container
          maxWidth="lg"
          sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}
        >
          <ShoppingCartOutlinedIcon
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Seu carrinho está vazio
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Adicione produtos ao carrinho para continuar comprando.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "#1640c7" } }}
          >
            Ver produtos
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{ bgcolor: "background.default", minHeight: "100svh" }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ShoppingCartOutlinedIcon sx={{ color: "text.secondary" }} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Sua sacola de compras
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({items.length} {items.length === 1 ? "item" : "itens"})
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
            alignItems: "start",
          }}
        >
          {/* Product list */}
          <Box>
            {/* Table header - desktop only */}
            <Box
              sx={{
                display: { xs: "none", md: "grid" },
                gridTemplateColumns: "1fr 160px 110px 40px",
                alignItems: "center",
                px: 2,
                py: 1,
                mb: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                Produto
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  textAlign: "center",
                }}
              >
                Quantidade
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  textAlign: "right",
                }}
              >
                Preço
              </Typography>
              <Box />
            </Box>

            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      mb: 1,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Skeleton
                      variant="rounded"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 1,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" sx={{ width: "60%" }} />
                      <Skeleton variant="text" sx={{ width: "40%" }} />
                    </Box>
                    <Skeleton variant="text" sx={{ width: 60 }} />
                  </Box>
                ))
              : products.map((product) => (
                  <Box
                    key={`${product.id}-${product.size}`}
                    sx={{
                      display: { xs: "flex", md: "grid" },
                      gridTemplateColumns: {
                        md: "1fr 160px 110px 40px",
                      },
                      alignItems: "center",
                      gap: { xs: 1.5, md: 2 },
                      p: { xs: 1.5, md: 2 },
                      mb: 1,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1.5, md: 2 },
                        minWidth: 0,
                        flex: { xs: 1, md: "initial" },
                      }}
                    >
                      <Box
                        component="img"
                        src={product.image ?? undefined}
                        alt={product.label}
                        sx={{
                          width: 64,
                          height: 64,
                          objectFit: "contain",
                          borderRadius: 1,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, lineHeight: 1.3 }}
                        >
                          {product.label}
                        </Typography>
                        {product.size && (
                          <Typography variant="caption" color="text.secondary">
                            - {product.size}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          COD: {product.id}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: { md: "center" },
                        width: { md: "100%" },
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(product, product.quantity - 1)
                        }
                        aria-label={
                          product.quantity <= 1
                            ? "Remover produto"
                            : "Diminuir quantidade"
                        }
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          width: 32,
                          height: 32,
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body2"
                        sx={{
                          minWidth: 24,
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {String(product.quantity).padStart(2, "0")}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(product, product.quantity + 1)
                        }
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          width: 32,
                          height: 32,
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "brand.main",
                        minWidth: 80,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {formatPrice(product.price * product.quantity)}
                    </Typography>

                    <IconButton
                      size="small"
                      onClick={() => setRemoveTarget(product)}
                      aria-label="Remover produto"
                      sx={{
                        color: "text.secondary",
                        flexShrink: 0,
                        justifySelf: { md: "center" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
          </Box>

          <Box>
            <Box
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: { xs: 2, md: 3 },
              }}
            >
              <ShippingCalculator onChange={setShipping} />

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Endereço de entrega
              </Typography>

              {authenticated && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {addresses.map((address) => {
                    const selected = selectedAddressId === address.id;
                    return (
                      <Box
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1.5,
                          border: 1,
                          borderColor: selected ? "primary.main" : "divider",
                          borderRadius: 1,
                          cursor: "pointer",
                          bgcolor: selected
                            ? "rgba(29,79,243,0.04)"
                            : "transparent",
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {address.street}, {address.number}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {address.city} - {address.state}, CEP{" "}
                            {address.zipcode}
                          </Typography>
                        </Box>
                        {selected && (
                          <CheckCircleIcon color="primary" fontSize="small" />
                        )}
                      </Box>
                    );
                  })}

                  {!showNewAddressForm && (
                    <Button
                      variant="text"
                      onClick={() => setShowNewAddressForm(true)}
                      sx={{ alignSelf: "flex-start", textTransform: "none" }}
                    >
                      + Adicionar novo endereço
                    </Button>
                  )}

                  {showNewAddressForm && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        p: 1.5,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <TextField
                        label="CEP"
                        size="small"
                        value={shipping?.zipcode ?? ""}
                        disabled
                        helperText={
                          !shipping
                            ? "Calcule o frete acima para preencher o CEP"
                            : undefined
                        }
                      />
                      <TextField
                        label="Rua"
                        size="small"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            street: e.target.value,
                          }))
                        }
                      />
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <TextField
                          label="Número"
                          size="small"
                          value={newAddress.number}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              number: e.target.value,
                            }))
                          }
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Complemento"
                          size="small"
                          value={newAddress.complement}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              complement: e.target.value,
                            }))
                          }
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <TextField
                          label="Cidade"
                          size="small"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Estado"
                          size="small"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      <TextField
                        label="País"
                        size="small"
                        value={newAddress.country}
                        onChange={(e) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            country: e.target.value,
                          }))
                        }
                      />
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        {addresses.length > 0 && (
                          <Button
                            onClick={() => setShowNewAddressForm(false)}
                            sx={{ textTransform: "none" }}
                          >
                            Cancelar
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          onClick={handleSaveAddress}
                          disabled={savingAddress || !shipping?.zipcode}
                          sx={{
                            bgcolor: "brand.main",
                            "&:hover": { bgcolor: "#1640c7" },
                            textTransform: "none",
                          }}
                        >
                          Salvar endereço
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatPrice(subtotal)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Frete
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {shipping
                    ? shipping.method === "pickup"
                      ? "Grátis"
                      : formatPrice(shipping.cost)
                    : "--"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: "brand.main", fontSize: 20 }}
                >
                  {formatPrice(total)}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2, textAlign: "center" }}
              >
                Forma de pagamento via Pix
              </Typography>

              {authenticated === false ? (
                <Button
                  component={Link}
                  to="/login"
                  state={{ from: "/cart" }}
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.5,
                    bgcolor: "brand.main",
                    "&:hover": { bgcolor: "#1640c7" },
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  Faça login para concluir a compra
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={checkingOut || !selectedAddressId}
                  sx={{
                    py: 1.5,
                    bgcolor: "brand.main",
                    "&:hover": { bgcolor: "#1640c7" },
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  Continuar
                </Button>
              )}

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography
                  component={Link}
                  to="/"
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textDecoration: "underline",
                    "&:hover": { color: "brand.main" },
                  }}
                >
                  Comprar outros produtos
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={2000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <Dialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
      >
        <DialogTitle>Remover produto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover{" "}
            <strong>{removeTarget?.label}</strong> do carrinho?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(null)}>Cancelar</Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
