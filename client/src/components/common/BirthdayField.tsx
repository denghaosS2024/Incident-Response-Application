import { setSnackbar, SnackbarType } from "@/redux/snackbarSlice";
import { TextField } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";

/**
 * A component that allows the user to select a date of birth
 * @param onChangeDob - A function that is called when the date of birth is changed
 * @returns A component that allows the user to select a date of birth
 */
export default function BirthdayField({
  onChangeDob,
}: {
  onChangeDob: (dob: Date) => void;
}) {
  const [dob, setDob] = useState<string>("");
  const dispatch = useDispatch();

  function onUpdateVal(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const selectedDate = new Date(e.target.value);
    // setDob(e.target.value)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to prevent time-zone issues
    // console.log('selectedDate', selectedDate)

    if (selectedDate > today) {
      dispatch(
        setSnackbar({
          message: "Date of Birth cannot be in the future.",
          type: SnackbarType.ERROR,
          durationMs: 1350,
        }),
      );
      return;
    }

    setDob(e.target.value);
    onChangeDob(selectedDate);
  }
  return (
    <div className="flex flex-col w-full max-w-500px my-2">
      <TextField
        label="Date of Birth"
        type="date"
        fullWidth
        value={dob}
        onChange={(e) => onUpdateVal(e)}
        InputLabelProps={{
          shrink: true, // Ensures the label stays above the input
        }}
      />
    </div>
  );
}
