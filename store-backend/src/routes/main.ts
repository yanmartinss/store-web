import { Router } from "express";
import * as bannerController from "../controllers/banner.controller.js";
import * as productController from "../controllers/product.controller.js";
import * as categoryController from "../controllers/category.controller.js";
import * as cartController from "../controllers/cart.controller.js";
import * as userController from "../controllers/user.controller.js";
import * as webhookController from "../controllers/webhook.controller.js";
import * as orderController from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rate-limit.js";

export const routes = Router();

routes.get("/ping", (req, res) => {
  res.json({ pong: true });
});
routes.get("/banners", bannerController.getBanners);
routes.get("/products", productController.getProducts);
routes.get("/product/:id", productController.getOneProduct);
routes.get("/product/:id/related", productController.getRelatedProducts);
routes.get(
  "/category/:slug/metadata",
  categoryController.getCategoryWithMetadata,
);
routes.post("/cart/mount", cartController.cartMount);
routes.get("/cart/shipping", cartController.calculateShipping);
routes.get("/cart/validate-size", cartController.validateSize);
routes.post("/user/register", authLimiter, userController.register);
routes.post("/user/login", authLimiter, userController.login);
routes.post("/user/logout", userController.logout);
routes.post("/user/addresses", authMiddleware, userController.addAddress);
routes.get("/user/addresses", authMiddleware, userController.getAddresses);
routes.post("/cart/finish", authMiddleware, cartController.finish);
routes.post("/webhook/stripe", webhookController.stripe);
routes.get("/orders/session", orderController.getOrderBySessionId);
routes.get("/orders", authMiddleware, orderController.listOrders);
routes.get("/orders/:id", authMiddleware, orderController.getOrder);
