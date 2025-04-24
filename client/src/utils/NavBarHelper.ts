export default class NavBarHelper {
  // Add "/organization" here to display "Organization"
  static readonly pageTitles: Record<string, string> = {
    "/messages": "Messages",
    "/contacts": "Contacts",
    "/groups": "Groups",
    "/reach911": "911 Call",
    "/incidents": "Incidents",
    "/patients/first-responder": "Patients",
    "/patients/nurse": "Patients",
    "/patient-visit": "Patient Visit",
    "/organization": "Organization",
    "/organization/view": "Organization",
    "/map": "Map",
    "/register-hospital": "Hospital",
    "/hospitals": "Hospitals",
    "/resources": "Resources",
    "/find-hospital": "Find Hospital",
    "/dashboard": "Dashboard",
    "/sar-incident": "SAR Incident",
    "/defaulttruckinventory": "Default Truck Inventory",
    "/defaulttruckadditem": "Add Truck Item",
    "/funding-center": "Funding Center",
    "/directorchatroom": "Chat with Directory",
    "/funding-information": "Funding Information",
    "/spending-history": "Spending History",
    "/exercise-library": "Exercise Library",
    "/past-appointment": "Past Appointments",
    "/nurse-appointment-info": "Appointment Information",
    "/appointment-scheduler": "Appointment Scheduler",
    "/shifts": "Shifts Management",
    "/chief-funding-history": "Funding History",
    "/missing-person/directory": "Missing Persons Directory",
    "/missing-person/register": "Missing Person Report",
    "/first-aid-assistance": "First Aid Assistance",
    "/ai-chat": "First Aid Assistance",
  };

  static readonly roleTitles: Record<string, string> = {
    Citizen: "IR Citizen",
    Dispatch: "IR Dispatch",
    Police: "IR Police",
    Fire: "IR Fire",
    Nurse: "IR Nurse",
    "City Director": "IR City Director",
    "Police Chief": "IR Police Chief",
    "Fire Chief": "IR Fire Chief",
  };

  static getPageTitle(
    pathname: string,
    role: string,
    keyName: string | null,
    hospitalName?: string,
  ) {
    let title = NavBarHelper.pageTitles[pathname] || "Incident Response";

    // If user is Fire or Police and path is /reach911, override title to "Incidents"
    if (pathname.startsWith("/directorchatroom/")) {
      title = "Chat with Directory";
    }

    if (pathname.startsWith("/truck-inventory/")) {
      const truckName = pathname.split("/")[2];
      title = `Truck ${truckName} Inventory`;
    }

    if (
      pathname.startsWith("/register-hospital/") &&
      pathname.endsWith("/requests")
    ) {
      title = "Manage Hospital Requests";
    } else if (pathname.startsWith("/register-hospital/")) {
      title = "Hospital";
    }

    if (
      pathname === "/reach911" &&
      (role === "Fire" || role === "Police" || role === "Dispatch")
    ) {
      title = "Incidents";
    }
    if (pathname === "/incidents/report") {
      title = "Incident Report";
    }

    if (pathname.startsWith("/sar-task")) {
      title = "SAR Task";
    }

    if (pathname.startsWith("/messages/") && keyName) {
      title = `${keyName} Messages`;
    }
    if (pathname.startsWith("/profile")) {
      title = "Profile";
    }

    if (pathname.startsWith("/map")) {
      title = "Map";
    }

    if (pathname.startsWith("/groups/")) {
      title = "Group";
    }

    if (pathname === "/") {
      title = NavBarHelper.roleTitles[role] || "IR Citizen";
    }

    if (pathname.startsWith("/missing-person/report/")) {
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get("name");
      title = name
        ? `${name} Missing Report Overview`
        : "Missing Report Overview";
    }

    if (pathname.startsWith("/missing-person/followUp/")) {
      title = keyName
        ? `${keyName} Follow-Up Information`
        : "Follow-Up Information";
    }

    if (
      pathname.startsWith("/missing-person/manage/") ||
      pathname.startsWith("/missing-person/update/")
    ) {
      title = "Missing Person Report";
    }

    if (pathname === "/register-hospital/resources/directory") {
      title = "Hospital Resources";
    }

    if (
      pathname.startsWith("/hospital") &&
      (pathname.endsWith("/resource/add") || pathname.endsWith("/update"))
    ) {
      title = "Hospital Resource";
    }
    if (pathname.startsWith("/hospital") && pathname.endsWith("/resources")) {
      title = hospitalName ? `${hospitalName} Resources` : "Hospital Resources";
    }

    if (pathname.startsWith("/hospital-resource/directory")) {
      title = "Hospital Resource";
    }

    if (
      pathname.startsWith("/hospital") &&
      pathname.endsWith("/resource-request/directory")
    ) {
      title = hospitalName
        ? `${hospitalName} Resource Requests`
        : "Hospital Resource Requests";
    }

    if (pathname.startsWith("/hospital-resource-request")) {
      title = hospitalName
        ? `${hospitalName} Resource Requests`
        : "Hospital Resource Requests";
    }

    // override for Medical Report page
    if (pathname.startsWith("/patients/report") && keyName) {
      title = `${keyName} Medical Report`;
    }

    // override for Patient Visit Detail page
    if (pathname.startsWith("/patients/visit/view") && keyName) {
      title = `${keyName} Patient Visit`;
    }

    if (pathname.startsWith("/funding-information/")) {
      title = "Funding Information";
    }

    if (pathname.startsWith("/spending-history/")) {
      title = "Spending History";
    }

    if (pathname === "/exercise-library" && role === "Nurse") {
      title = "Exercise Library";
    }

    if (pathname.startsWith("/chief-funding-history/")) {
      title = "Funding History";
    }

    if (pathname.startsWith("/shifts")) {
      title = "Nurse Shifts";
    }

    if (pathname.startsWith("/shifts/mine")) {
      title = "Nurse Shift Selector";
    }
    if (pathname === "/patients/plan") {
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get("name");
      title = name ? `${name}'s Medical Plan` : "Medical Plan";
    }
    if (pathname.startsWith("/patients/plan/view")) {
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get("name");
      title = name ? `${name}'s Medical Plan` : "Medical Plan";
    }

    if (pathname.startsWith("/your-appointment")) {
      title = "Your Appointment";
    }

    return title;
  }
}

export interface IPageHook {
  onSelect: () => void;
  name: string;
}
