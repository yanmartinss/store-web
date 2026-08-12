import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function TopBar() {
  return (
    <Box sx={{ bgcolor: "#08060d", color: "common.white", py: 1 }}>
      <Typography
        variant="body2"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          px: 2,
          textAlign: "center",
          fontWeight: 600,
          letterSpacing: 0.4,
          fontSize: { xs: "0.72rem", sm: "0.8rem" },
        }}
      >
        <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
          <span className="font-bold">FRETE GRÁTIS</span> para todo o Nordeste!
        </Box>
        <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
          <span className="font-bold">FRETE GRÁTIS</span> para todo o Nordeste
          nas compras acima de R$ 199,00.{" "}
          <span className="font-bold">APROVEITA!</span>
        </Box>
      </Typography>
    </Box>
  );
}
