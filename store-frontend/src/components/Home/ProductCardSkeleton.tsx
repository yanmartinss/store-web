import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";

const CardWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
}));

const ImageContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  minHeight: 180,
});

export default function ProductCardSkeleton() {
  return (
    <CardWrapper>
      <ImageContainer>
        <Skeleton
          variant="rounded"
          width="100%"
          height={160}
          sx={{ bgcolor: "grey.400" }}
        />
      </ImageContainer>
      <Box sx={{ p: 2, pt: 0 }}>
        <Skeleton
          variant="rounded"
          width="85%"
          height={18}
          sx={{ bgcolor: "grey.400", mb: 1 }}
        />
        <Skeleton
          variant="rounded"
          width="40%"
          height={20}
          sx={{ bgcolor: "grey.400", mb: 1 }}
        />
        <Skeleton
          variant="rounded"
          width="55%"
          height={12}
          sx={{ bgcolor: "grey.400" }}
        />
      </Box>
    </CardWrapper>
  );
}
