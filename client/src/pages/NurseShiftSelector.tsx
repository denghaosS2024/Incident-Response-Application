import { setSnackbar, SnackbarType } from "@/redux/snackbarSlice";
import { Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import request from "../utils/request";
const kSlotSpan = 3;

const hours = Array.from({ length: 24 / kSlotSpan }, (_, i) => i * kSlotSpan);

/**
 * Fetch the active hours for a nurse
 * @returns The active hours for a nurse
 */
async function fetchActiveHours() {
  const userId = localStorage.getItem("uid") ?? "";

  const response = await request(`/api/nurse-shifts/active?nurseId=${userId}`);

  console.log(response);
  return response;
}

/**
 * Update the active hours for a nurse
 * @param days - Array of day numbers (0–6)
 * @param hours - Array of hour numbers (0–23)
 * @returns True if the active hours were updated successfully, false otherwise (Usually a 400 error)
 */
async function updateActiveHours(days: number[], hours: number[]) {
  const userId = localStorage.getItem("uid") ?? "";

  const payload = {
    nurseId: userId,
    days,
    hours,
  };

  console.log(payload);

  const response = await request(`/api/nurse-shifts/active`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // if (!response.ok) {
  //   throw new Error(
  //     "Failed to update active hours, response: " + JSON.stringify(response),
  //   );
  // }

  return response.ok;
}

/**
 * Convert the response from the server to a mask for the days and hours
 * @param startHours - Array of start hours
 * @param days - Array of day numbers
 * @returns The mask for the days and hours
 */
function responseToMask(startHours: number[], days: number[]) {
  const newSelectedDayMask = Array(7).fill(false);

  for (const day of days) {
    newSelectedDayMask[day] = true;
  }

  const newSelectedHours = Array(hours.length).fill(false);

  // Because shifts in server is one hour increments and yet we have 3 hour slots here
  for (const hour of startHours) {
    if (hour % kSlotSpan === 0) {
      console.log(hour / kSlotSpan);
      newSelectedHours[hour] = true;
    }
  }

  return {
    days: newSelectedDayMask,
    hours: newSelectedHours,
  };
}

/**
 * Parse the selected time with mask
 * @param hours - Array of hours
 * @param days - Array of day mask
 * @returns The parsed time
 */
export function parseSelectedTimeWithMask(
  selectedHours: boolean[],
  dayMask: boolean[],
) {
  const hours = new Set<number>();

  for (let i = 0; i < selectedHours.length; i++) {
    if (selectedHours[i]) {
      for (let j = 0; j < kSlotSpan; j++) {
        hours.add(i + j);
      }
    }
  }

  console.log("Hours:", hours);

  const days = [];

  for (let i = 0; i < dayMask.length; i++) {
    if (dayMask[i]) {
      days.push(i);
    }
  }

  return {
    hours,
    days,
  };
}

export default function NurseShiftSelector() {
  const dispatch = useDispatch();

  const [selectedDayMask, setSelectedDayMask] = useState<boolean[]>(
    Array(7).fill(false),
  );

  const [selectedHours, setSelectedHours] = useState<boolean[]>(
    Array(hours.length).fill(false),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveHours().then((response) => {
      const newDays = response.days as number[];
      const newHours = response.startHours as number[];

      const converted = responseToMask(newHours, newDays);

      setSelectedDayMask(converted.days);
      setSelectedHours(converted.hours);
      setIsLoading(false);
    });
  }, []);

  //TODO: Fetch the shifts from the database

  /**
   * Update the active hours for the nurse
   */
  const onClickContinue = async () => {
    setIsUpdating(true);

    const { hours, days } = parseSelectedTimeWithMask(
      selectedHours,
      selectedDayMask,
    );

    const isClear = days.length === 0 || hours.size === 0;

    await updateActiveHours(days, Array.from(hours));

    if (isClear) {
      dispatch(
        setSnackbar({
          message: "Nurse shift cleared! You do not have any shifts now.",
          type: SnackbarType.GOOD,
          durationMs: 3000,
        }),
      );
    } else {
      dispatch(
        setSnackbar({
          message: "Nurse shift updated!",
          type: SnackbarType.GOOD,
          durationMs: 3000,
        }),
      );
    }

    setIsUpdating(false);

    navigate("/shifts");
  };

  return (
    <>
      {!isLoading ? (
        <div className="flex flex-col w-full h-full p-3 max-w-screen-md mx-auto items-center justify-center">
          <p className="text-sm text-gray-500 p-2 rounded-lg bg-gray-100">
            NOTE: If either days in a week or slots are empty, hitting continue
            will remove all shifts you have.
          </p>

          <div className="flex flex-col flex-wrap w-full grow-2">
            {/* Day of week selector */}
            <div className="flex flex-wrap gap-2 mb-6 items-center justify-center w-full wrap-content">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day, index) => (
                <Button
                  type="button"
                  variant={selectedDayMask[index] ? "contained" : "outlined"}
                  key={uuidv4()}
                  sx={{
                    borderRadius: 4,
                  }}
                  // className={`px-4 py-2 rounded-lg ${
                  //   selectedDays[index]
                  //     ? "bg-blue-500 text-white"
                  //     : "bg-blue-100 hover:bg-blue-200 focus:bg-blue-500 focus:text-white"
                  // }`}
                  onClick={() => {
                    const newSelectedDays = [...selectedDayMask];
                    newSelectedDays[index] = !newSelectedDays[index];
                    setSelectedDayMask(newSelectedDays);
                  }}
                >
                  {day.substring(0, 3)}
                </Button>
              ))}
            </div>

            <div className="flex flex-col flex-wrap gap-2 mb-6 items-center justify-center w-full wrap-content">
              {hours.map((hour) => (
                <Button
                  key={uuidv4()}
                  className="w-full items-center justify-center"
                  variant={selectedHours[hour] ? "contained" : "outlined"}
                  onClick={() => {
                    const newSelectedHours = [...selectedHours];
                    newSelectedHours[hour] = !newSelectedHours[hour];
                    setSelectedHours(newSelectedHours);
                  }}
                  sx={{
                    borderRadius: 4,
                    textTransform: "none",
                  }}
                >
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <p className="text-center text-lg">
                      {" "}
                      {hour.toString().padStart(2, "0")}:00 -{" "}
                      {(hour + kSlotSpan).toString().padStart(2, "0")}:00
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="min-h-16 w-full"
            sx={{ borderRadius: 10, textTransform: "none" }}
            variant="contained"
            color="primary"
            onClick={onClickContinue}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <div className="flex flex-row items-center justify-center gap-2 h-full">
                <CircularProgress size={24} />
                <p className="text-lg text-center my-0">Updating...</p>
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full p-3 max-w-screen-md mx-auto items-center justify-center gap-10">
          <CircularProgress size={48} variant="indeterminate" />
          <p className="text-xl">Loading...</p>
        </div>
      )}
    </>
  );
}
