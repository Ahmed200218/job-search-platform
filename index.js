import express from "express";
import http from "http";
import bootstrap from "./src/app.controller.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { setupSocket } from "./socket.js";

const app = express();


app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));


bootstrap(app, express);


const server = http.createServer(app);
const io = setupSocket(server);


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server is running on port", port);
});

export { io };

