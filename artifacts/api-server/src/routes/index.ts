import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import repositoriesRouter from "./repositories";
import deploymentsRouter from "./deployments";
import servicesRouter from "./services";
import subscriptionsRouter from "./subscriptions";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import cloudAccountsRouter from "./cloudAccounts";
import githubRouter from "./github";
import chatRouter from "./chat";
import replitRouter from "./replit";
import importRouter from "./import";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/repositories", repositoriesRouter);
router.use("/deployments", deploymentsRouter);
router.use("/services", servicesRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/cloud-accounts", cloudAccountsRouter);
router.use("/github", githubRouter);
router.use("/chat", chatRouter);
router.use("/replit", replitRouter);
router.use("/import", importRouter);

export default router;
