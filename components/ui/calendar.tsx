import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Props = React.ComponentProps<typeof DayPicker>;

export function Calendar(props: Props) {
  return <DayPicker {...props} />;
}

