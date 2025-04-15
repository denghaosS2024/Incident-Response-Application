/**
 * Main Router
 *
 * This file serves as the entry point for all API routes.
 * It aggregates all the sub-routers for different resources (users, login, channels)
 * and mounts them on the main router.
 */

import { Router } from "express";

import channel from "./channel";
import HospitalRouter from "./hospital";
import incident from "./incident";
import login from "./login";
import logout from "./logout";
import map from "./map";
import missingPersonRouter from "./missingPerson";
import user from "./user";

// This router does not exist in this codebase
import airQuality from "./airQuality";
import alertQueueRouter from "./alertQueue";
import carRouter from "./car";
import cityRouter from "./city";
import dashboard from "./dashboard";
import HospitalResourceRouter from "./hospitalResource";
import incidentReportRouter from "./incidentReport";
import patientRouter from "./patients";
import personnelRouter from "./personnel";
import profileRouter from "./profile";
import taskRouter from "./sartask";
import truckRouter from "./truck";
import wildfireAreaRouter from "./WildfireArea";

export default Router()
  .use("/users", user)
  .use("/login", login)
  .use("/logout", logout)
  .use("/channels", channel)
  .use("/incidents", incident)
  .use("/map", map)
  .use("/airQuality", airQuality)
  .use("/cars", carRouter)
  .use("/trucks", truckRouter)
  .use("/cities", cityRouter)
  .use("/personnel", personnelRouter)
  .use("/profiles", profileRouter)
  .use("/wildfire", wildfireAreaRouter)
  .use("/hospital", HospitalRouter)
  .use("/patients", patientRouter)
  .use("/users", user)
  .use("/login", login)
  .use("/channels", channel)
  .use("/incidents", incident)
  .use("/incidentReports", incidentReportRouter)
  .use("/map", map)
  .use("/airQuality", airQuality)
  .use("/cars", carRouter)
  .use("/trucks", truckRouter)
  .use("/cities", cityRouter)
  .use("/personnel", personnelRouter)
  .use("/profiles", profileRouter)
  .use("/wildfire", wildfireAreaRouter)
  .use("/hospital", HospitalRouter)
  .use("/charts", dashboard)
  .use("/missingPerson", missingPersonRouter)

  .use("/sartasks", taskRouter)
  .use("/sartasksdone", taskRouter)
  .use(",sartasksstatistics", taskRouter)
  .use("/alertQueue", alertQueueRouter)
  .use("/hospital-resource", HospitalResourceRouter);
