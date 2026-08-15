import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";

const BANNERS = [
  "/assets/banners/banner-1.png",
  "/assets/banners/banner-2.png",
  "/assets/banners/banner-3.png",
  "/assets/banners/banner-4.png",
];

const Dot = styled("button")(({ theme }) => ({
  position: "relative",
  width: 8,
  height: 8,
  padding: 0,
  border: "none",
  borderRadius: "50%",
  backgroundColor: theme.palette.divider,
  cursor: "pointer",
  transition: "background-color 0.3s",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: -8,
    borderRadius: "50%",
  },
  "&.is-selected": {
    backgroundColor: theme.palette.brand.main,
  },
}));

export default function BannerCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setSelected(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 0.4,
        bgcolor: "background.paper",
      }}
    >
      {!loaded && (
        <Skeleton
          variant="rounded"
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: 0.4,
            bgcolor: "grey.400",
          }}
        />
      )}
      <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
        <Box sx={{ display: "flex" }}>
          {BANNERS.map((src) => (
            <Box key={src} sx={{ flex: "0 0 100%", minWidth: 0 }}>
              <Box
                component="img"
                src={src}
                alt=""
                draggable={false}
                onLoad={() => setLoaded(true)}
                sx={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "1216 / 408",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: 12,
          left: 12,
          display: "flex",
          gap: 1,
        }}
      >
        {BANNERS.map((src, index) => (
          <Dot
            key={src}
            aria-label={`Banner ${index + 1}`}
            className={selected === index ? "is-selected" : undefined}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </Box>
    </Box>
  );
}
