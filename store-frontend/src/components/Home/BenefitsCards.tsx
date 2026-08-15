import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { styled } from "@mui/material/styles";

const BENEFITS = [
  {
    icon: <LocalShippingIcon sx={{ fontSize: 40, color: "brand.main" }} />,
    title: "Frete Grátis",
    subtitle: "Para todo o Nordeste.",
  },
  {
    icon: <LocalOfferIcon sx={{ fontSize: 40, color: "brand.main" }} />,
    title: "Muitas ofertas",
    subtitle: "Ofertas imbatíveis.",
  },
  {
    icon: <SwapHorizIcon sx={{ fontSize: 40, color: "brand.main" }} />,
    title: "Troca fácil",
    subtitle: "No período de 30 dias.",
  },
];

const Card = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "8px 12px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  flex: "1 1 250px",
  maxHeight: "110px",
  minWidth: 0,
  [theme.breakpoints.up("sm")]: {
    gap: 16,
    padding: 24,
  },
}));

export default function BenefitsCards() {
  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 3,
        "@media (min-width:768px)": {
          flexDirection: "row",
        },
      }}
    >
      {BENEFITS.map((benefit) => (
        <Card key={benefit.title}>
          {benefit.icon}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {benefit.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              {benefit.subtitle}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
