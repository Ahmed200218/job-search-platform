import connectDB from "./db/connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import adminRouter from "./modules/admin/admin.controller.js";
import companyRouter from "./modules/company/company.controller.js";
import chatRouter from "./modules/chat/chat.controller.js";
import jobRouter from "./modules/job/job.controller.js";
import { globalError } from "./utils/Errors/global-error.js";
import { notFound } from "./utils/index.js";
import { graphqlHTTP } from "express-graphql";
import { adminSchema } from "./modules/admin/admin.graphql.js";




const bootstrap = async (app, express) => {

  app.use(express.json());
  await connectDB();
  app.use("/auth", authRouter);

  app.use("/user", userRouter);

  app.use("/admin", adminRouter);

  app.use("/company", companyRouter);

  app.use("/job", jobRouter);

  app.use("/chat", chatRouter);

  app.use("/graphql", graphqlHTTP({ schema: adminSchema, graphiql: true }));

  app.all("*", notFound);


  app.use(globalError);
};
export default bootstrap