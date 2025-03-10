/**
 * Main Router
 *
 * This file serves as the entry point for all API routes.
 * It aggregates all the sub-routers for different resources (users, login, channels)
 * and mounts them on the main router.
 */

import { Router } from 'express';

import channel from "./channel";
import incident from "./incident";
import login from "./login";
import map from "./map";
import user from "./user";

// This router does not exist in this codebase
import airQuality from "./airQuality";
import carRouter from "./car";
import cityRouter from "./city";
import personnelRouter from "./personnel";
import profileRouter from "./profile";
import truckRouter from "./truck";
import wildfireAreaRouter from "./WildfireArea";


export default Router()
  .use("/users", user)
  .use("/login", login)
  .use("/channels", channel)
  .use("/incidents", incident)
  .use("/map", map)
  .use("/airQuality", airQuality)
  .use("/cars", carRouter)
  .use("/trucks", truckRouter)
  .use("/cities", cityRouter)
  .use("/personnel", personnelRouter) 
  .use("/profiles", profileRouter)
  .use("/wildfire", wildfireAreaRouter);
