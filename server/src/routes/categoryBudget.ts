import { Router } from "express";
import { getCategoryBudgets, upsertCategoryBudget, resetCategoryBudget } from "../controllers/categoryBudgetController";
import auth from "../middleware/auth";

const router = Router();

router.get("/", auth, getCategoryBudgets);
router.post("/", auth, upsertCategoryBudget);
router.put("/:category/reset", auth, resetCategoryBudget);

export default router;