import { Button } from "@mui/material";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const hours = Array.from({ length: 24 / 3 }, (_, i) => i * 3);

export default function NurseShiftSelector() {
  const [selectedDays, setSelectedDays] = useState<boolean[]>(
    Array(7).fill(false),
  );

  const [selectedHours, setSelectedHours] = useState<boolean[]>(
    Array(hours.length).fill(false),
  );

  //TODO: Fetch the shifts from the database

  //TODO: Write a onClickHandler for the continue button
  const onClickContinue = () => {
    alert("Continue button clicked. Still working on it.");
  };

  return (
    <>
      <div className="flex flex-col w-full h-full p-3 max-w-screen-md mx-auto">
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
                variant={selectedDays[index] ? "contained" : "outlined"}
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
                  const newSelectedDays = [...selectedDays];
                  newSelectedDays[index] = !newSelectedDays[index];
                  setSelectedDays(newSelectedDays);
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
                    {(hour + 3).toString().padStart(2, "0")}:00
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Button
          className="min-h-16"
          sx={{ borderRadius: 10 }}
          variant="contained"
          color="primary"
          onClick={onClickContinue}
        >
          Continue
        </Button>
      </div>
    </>
  );
}
