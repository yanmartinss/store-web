import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../services/api";
import { getErrorMessage } from "../utils/get-error-message";

export type DeliveryMethod = "delivery" | "pickup";

export interface ShippingSelection {
  method: DeliveryMethod;
  cost: number;
  days: number;
  zipcode: string;
}

interface ShippingCalculatorProps {
  onChange?: (selection: ShippingSelection | null) => void;
}

export default function ShippingCalculator({
  onChange,
}: ShippingCalculatorProps) {
  const [zipcode, setZipcode] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingResult, setShippingResult] = useState<{
    cost: number;
    days: number;
  } | null>(null);
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryMethod>("delivery");

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  useEffect(() => {
    if (!shippingResult) {
      onChange?.(null);
      return;
    }
    onChange?.({
      method: selectedDelivery,
      cost: selectedDelivery === "pickup" ? 0 : shippingResult.cost,
      days: shippingResult.days,
      zipcode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingResult, selectedDelivery]);

  const handleCalculateShipping = async () => {
    setShippingLoading(true);
    setShippingError(null);
    setShippingResult(null);
    try {
      const res = await api.get<{
        error: string | null;
        cost: number;
        days: number;
      }>("/cart/shipping", { params: { zipcode } });
      if (res.data.error) {
        setShippingError(res.data.error);
      } else {
        setShippingResult({ cost: res.data.cost, days: res.data.days });
      }
    } catch (err) {
      setShippingError(
        getErrorMessage(
          err,
          "It was not possible to calculate the shipping cost.",
        ),
      );
    } finally {
      setShippingLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        Calcular frete e prazo
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          placeholder="Digite aqui o CEP"
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiInputBase-root": { height: 56 },
          }}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={handleCalculateShipping}
          // disabled={shippingLoading || zipcode.trim().length < 4}
          sx={{
            height: 56,
            backgroundColor: "brand.main",
            color: "#fff",
          }}
        >
          Calcular
        </Button>
      </Box>

      {shippingError && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {shippingError}
        </Typography>
      )}

      {shippingResult && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {[
            {
              key: "delivery" as const,
              icon: <LocalShippingOutlinedIcon fontSize="small" />,
              title: "Entrega no endereço",
              subtitle: `Chega em até ${shippingResult.days} dia(s) útil(eis)`,
              price: formatPrice(shippingResult.cost),
            },
            {
              key: "pickup" as const,
              icon: <StorefrontOutlinedIcon fontSize="small" />,
              title: "Retirar na loja",
              subtitle: "Disponível para retirada hoje",
              price: "Grátis",
            },
          ].map((option) => {
            const selected = selectedDelivery === option.key;
            return (
              <Box
                key={option.key}
                onClick={() => setSelectedDelivery(option.key)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  border: 1,
                  borderColor: selected ? "primary.main" : "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  bgcolor: selected ? "rgba(29,79,243,0.04)" : "transparent",
                  transition: "border-color 0.15s, background-color 0.15s",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    flexShrink: 0,
                    bgcolor: selected ? "primary.main" : "grey.100",
                    color: selected ? "primary.contrastText" : "text.secondary",
                  }}
                >
                  {option.icon}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.subtitle}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color:
                      option.key === "pickup" ? "success.main" : "text.primary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.price}
                </Typography>

                {selected && (
                  <CheckCircleIcon color="primary" fontSize="small" />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
