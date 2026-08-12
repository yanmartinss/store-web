import type { RequestHandler } from "express";
import { getAllBanners } from "../services/banner.service.js";
import { getAbsoluteImgUrl } from "../utils/get-absolute-img-url.js";

export const getBanners: RequestHandler = async (req, res) => {
  const banners = await getAllBanners();
  const bannersWithAbsoluteUrl = banners.map((banner) => ({
    ...banner,
    img: getAbsoluteImgUrl(banner.img),
  }));

  res.json({ error: null, banners: bannersWithAbsoluteUrl });
};
