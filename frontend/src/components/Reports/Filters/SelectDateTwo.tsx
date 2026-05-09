import flatpickr from 'flatpickr';
import { useState, useEffect } from 'react';

const DatePickerTwoReport = ({ onDateChange }: { onDateChange: (dates: string[]) => void }) => {
  useEffect(() => {
    // Init flatpickr
    flatpickr('.form-datepicker-range', {
      mode: 'range',
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'Y-m-d', 
      prevArrow:
        '<svg className="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
      nextArrow:
        '<svg className="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
      onChange: (selectedDates) => {
        const formattedDates = selectedDates.map((date) => date.toISOString().split('T')[0]);
        onDateChange(formattedDates);
      },
    });
  }, [onDateChange]);

  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
        Selecciona un rango de fechas
      </label>
      <div className="relative">
        <input
          className="form-datepicker-range w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          placeholder="yyyy-mm-dd to yyyy-mm-dd"
        />
      </div>
    </div>
  );
};

export default DatePickerTwoReport;
