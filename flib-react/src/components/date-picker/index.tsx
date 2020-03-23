import * as React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export interface CustomDatePickerProps extends React.ComponentProps<any> {
  onChange: () => void;
}

export const CustomDatePicker: React.FunctionComponent<CustomDatePickerProps> = (props: CustomDatePickerProps): JSX.Element => {
  return <div>
    <DatePicker
      onChange={props.onChange}
      selected={new Date()}
    />
  </div>
};

export default CustomDatePicker;
