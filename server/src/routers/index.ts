/**
 * Main Router
 *
 * This file serves as the entry point for all API routes.
 * It aggregates all the sub-routers for different resources (users, login, channels)
 * and mounts them on the main router.
 */

import { Router } from "express";

import user from "./user";
import login from "./login";
import channel from "./channel";
import incident from "./incident";
import map from "./map";
import carRouter from "./car";
import truckRouter from "./truck";
import cityRouter from "./city";
import profileRouter from "./profile";
import personnelRouter from "./personnel";  

export default Router()
  .use("/users", user)
  .use("/login", login)
  .use("/channels", channel)
  .use("/incidents", incident)
  .use("/map", map)
  .use("/cars", carRouter)
  .use("/trucks", truckRouter)
  .use("/cities", cityRouter)
  .use("/personnel", personnelRouter) 
  .use("/profiles", profileRouter);
