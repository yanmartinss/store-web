import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: 15,
        flexWrap: "wrap",
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const content = (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: isLast ? "text.primary" : "text.secondary",
            }}
          >
            {item.label}
          </Typography>
        );

        return (
          <Box
            key={`${item.label}-${index}`}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {item.to && !isLast ? (
              <Link
                to={item.to}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {content}
              </Link>
            ) : (
              content
            )}
            {!isLast && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {" > "}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
