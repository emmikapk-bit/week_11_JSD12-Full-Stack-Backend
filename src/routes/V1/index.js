import { Router } from "express";
import { router as usersRoutes } from "./users.routes.js";
import { router as productsRouter } from "./products.routes.js";
import { router as notesRouter } from "./notes.routes.js";

export const router = Router();

router.use("/users", usersRoutes);

router.use("/products", productsRouter);

router.use("/notes", notesRouter);
