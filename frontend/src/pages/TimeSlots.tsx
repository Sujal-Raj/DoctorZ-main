import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import api from "../Services/mainApi";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

type SelectionType = "single" | "multiple" | "month";

interface WorkingHours {
  start: string;
  end: string;
}

interface Slot {
  time: string;
  isActive: boolean;
}

interface SavedSlot {
  _id: string;
  date: string;
  slots: Slot[];
}

interface CreateSlotResponse {
  success: boolean;
  createdDates: string[];
  alreadyExistDates: string[];
  message: string;
}

const TimeSlots: React.FC = () => {
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { drId } = useParams();
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const [step, setStep] = useState<number>(1);
  const [selectionType, setSelectionType] = useState<SelectionType | "">("");
  const [selectedSingleDate, setSelectedSingleDate] = useState<
    Date | undefined
  >(undefined);
  const [selectedMultipleDates, setSelectedMultipleDates] = useState<Date[]>(
    []
  );
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: "",
    end: "",
  });

  const [savedSlots, setSavedSlots] = useState<SavedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const doctorId = drId;

  // Fetch saved slots
  const fetchSavedSlots = async () => {
    if (!doctorId) return;
    try {
      const res = await api.get<SavedSlot[]>(
        `/api/availability/getTimeSlots/${doctorId}`
      );
      setSavedSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSavedSlots();
  }, [doctorId]);

  const handleSelectionType = (type: SelectionType) => {
    setSelectionType(type);
    setStep(2);
    setSelectedSingleDate(undefined);
    setSelectedMultipleDates([]);
  };

  // Remove the date being edited from disabledDates
  const disabledDatesForCalendar = selectedSingleDate
    ? savedSlots
        .map((s) => new Date(s.date))
        .filter((d) => d.toDateString() !== selectedSingleDate.toDateString())
    : savedSlots.map((s) => new Date(s.date));

  const handleMonthSelect = (selected: Date[] | undefined) => {
    if (!selected) return;

    const firstDate = selected[0];
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    const today = new Date();

    const dates: Date[] = [];
    const d = new Date(year, month, 1);

    while (d.getMonth() === month) {
      if (
        d >= today &&
        !disabledDatesForCalendar.some(
          (dd) => dd.toDateString() === d.toDateString()
        )
      ) {
        dates.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }

    setSelectedMultipleDates(dates);
  };

  const handleSave = async () => {
    const dates =
      selectionType === "single"
        ? selectedSingleDate
          ? [selectedSingleDate.toLocaleDateString("en-CA")]
          : []
        : selectedMultipleDates.map((d) => d.toLocaleDateString("en-CA"));

    if (!dates.length) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Please select at least one date",
      });
      return;
    }
    if (!workingHours.start || !workingHours.end) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Please enter working hours",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingSlotId && selectedSingleDate) {
        // --- EDITING EXISTING SLOT ---
        const payload = {
          doctorId,
          date: selectedSingleDate.toLocaleDateString("en-CA"),
          workingHours,
        };

        const res = await api.put("/api/availability/editTimeSlot", payload);
        // Swal.fire({
        //   icon: "success",
        //   title: "Success",
        //   text: res.data.message,
        // });

        setEditingSlotId(null); // reset editing state
      } else {
        // --- CREATING NEW SLOTS ---
        const payload = { doctorId, dates, workingHours };
        const res = await api.post<CreateSlotResponse>(
          "/api/availability/createTimeSlot",
          payload
        );
        const data = res.data;

        if (data.createdDates.length > 0) {
          Swal.fire({
            icon: "success",
            title: "Slots Created",
            html: `Slots created for: <strong>${data.createdDates.join(
              ", "
            )}</strong>`,
          });
        }

        if (data.alreadyExistDates.length > 0) {
          Swal.fire({
            icon: "info",
            title: "Already Exist",
            html: `Slots already exist for: <strong>${data.alreadyExistDates.join(
              ", "
            )}</strong>`,
          });
        }
      }

      // Reset form
      setStep(1);
      setSelectionType("");
      setSelectedSingleDate(undefined);
      setSelectedMultipleDates([]);
      setWorkingHours({ start: "", end: "" });

      fetchSavedSlots(); // refresh calendar & slots
    } catch (err: unknown) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSlots = (slotItem: SavedSlot) => {
    setEditingSlotId(slotItem._id);

    setStep(2);
    setSelectionType("single");
    const slotDate = new Date(slotItem.date);
    setSelectedSingleDate(slotDate);
    setCurrentMonth(slotDate); // Set calendar to the month of the selected date

    // Load working hour range
    setWorkingHours({
      start: slotItem.slots[0]?.time || "",
      end: slotItem.slots[slotItem.slots.length - 1]?.time || "",
    });
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const toggleSlot = async (
    slotId: string,
    time: string,
    isActive: boolean
  ) => {
    try {
      await api.patch(`/api/availability/updateSlot/${slotId}`, {
        time,
        isActive,
      });
      fetchSavedSlots();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Availability Management
        </h1>
        <p className="text-gray-600">
          Manage your appointment slots and working hours
        </p>
      </div>

      {/* Step 1 - Selection Type */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-blue-600 font-bold">1</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Select Availability Type
            </h2>
            <p className="text-gray-500">
              Choose how you want to set your availability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <button
              className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-300 text-left"
              onClick={() => handleSelectionType("single")}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Single Day</h3>

              <p className="text-sm text-gray-500">
                Set availability for a specific date
              </p>
            </button>

            <button
              className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-300 text-left"
              onClick={() => handleSelectionType("multiple")}
            >
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Multiple Days
              </h3>
              <p className="text-sm text-gray-500">
                Select multiple specific dates
              </p>
            </button>

            <button
              className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all duration-300 text-left"
              onClick={() => handleSelectionType("month")}
            >
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Full Month</h3>
              <p className="text-sm text-gray-500">
                Set availability for entire month
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - Date Selection */}
      <div ref={step2Ref}>
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectionType("");
                    setEditingSlotId(null);
                  }}
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Select Dates & Hours
                  </h2>
                </div>
              </div>
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {selectionType === "single" && "Single Day"}
                {selectionType === "multiple" && "Multiple Days"}
                {selectionType === "month" && "Full Month"}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                  Date Selection
                </h3>
                <div className="flex justify-center">
                  {selectionType === "single" && (
                    <DayPicker
                      mode="single"
                      month={currentMonth} // <-- control displayed month
                      onMonthChange={setCurrentMonth} // <-- allow user to change month
                      selected={selectedSingleDate}
                      onSelect={setSelectedSingleDate}
                      modifiersClassNames={{
                        selected:
                          "bg-blue-600 text-white rounded-full font-semibold",
                        today: "border border-blue-200 bg-blue-50",
                      }}
                      showOutsideDays
                      modifiers={{
                        highlighted: selectedSingleDate
                          ? [selectedSingleDate]
                          : [],
                      }}
                      modifiersStyles={{
                        highlighted: {
                          backgroundColor: "#416FE3",
                          color: "white",
                          borderRadius: "6px",
                        },
                      }}
                      disabled={[
                        { before: new Date() },
                        ...disabledDatesForCalendar,
                      ]}
                      className="border-0"
                    />
                  )}
                  {selectionType === "multiple" && (
                    <DayPicker
                      mode="multiple"
                      selected={selectedMultipleDates}
                      onSelect={(dates) =>
                        setSelectedMultipleDates(dates || [])
                      }
                      modifiersClassNames={{
                        selected:
                          "bg-green-600 text-white rounded-full font-semibold",
                        today: "border border-green-200 bg-green-50",
                      }}
                      showOutsideDays
                      // disabled={[{ before: new Date() }, ...disabledDates]}
                      disabled={[
                        { before: new Date() },
                        ...disabledDatesForCalendar,
                      ]}
                      className="border-0"
                    />
                  )}
                  {selectionType === "month" && (
                    <DayPicker
                      mode="multiple"
                      selected={selectedMultipleDates}
                      onSelect={handleMonthSelect}
                      captionLayout="dropdown"
                      // disabled={[{ before: new Date() }, ...disabledDates]}
                      disabled={[
                        { before: new Date() },
                        ...disabledDatesForCalendar,
                      ]}
                      modifiersClassNames={{
                        selected:
                          "bg-purple-600 text-white rounded-full font-semibold",
                        today: "border border-purple-200 bg-purple-50",
                      }}
                      className="border-0"
                    />
                  )}
                </div>
              </div>

              {/* Working Hours Section */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-700 mb-4">
                    Working Hours
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={workingHours.start}
                        onChange={(e) =>
                          setWorkingHours({
                            ...workingHours,
                            start: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={workingHours.end}
                        onChange={(e) =>
                          setWorkingHours({
                            ...workingHours,
                            end: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Selected Dates Preview */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Selected Dates
                  </h3>
                  <div className="max-h-32 overflow-y-auto">
                    {selectionType === "single" && selectedSingleDate ? (
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                        {selectedSingleDate.toDateString()}
                      </div>
                    ) : selectionType !== "single" &&
                      selectedMultipleDates.length > 0 ? (
                      <div className="space-y-1">
                        {selectedMultipleDates
                          .slice(0, 5)
                          .map((date, index) => (
                            <div
                              key={index}
                              className="text-sm text-gray-600 bg-white p-2 rounded border"
                            >
                              {date.toDateString()}
                            </div>
                          ))}
                        {selectedMultipleDates.length > 5 && (
                          <div className="text-sm text-gray-500 text-center">
                            +{selectedMultipleDates.length - 5} more dates
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 text-center py-2">
                        No dates selected
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Slots...
                    </>
                  ) : (
                    "Save Availability"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Saved Slots */}
      {savedSlots.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Managed Availability
            </h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {savedSlots.length} date{savedSlots.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSlots.map((slotItem) => (
              <div
                key={slotItem._id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    {new Date(slotItem.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      slotItem.slots.filter((s) => s.isActive).length > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {slotItem.slots.filter((s) => s.isActive).length} active
                  </span>

                  {/* Edit button */}
                  <button
                    onClick={() => {
                      handleEditSlots(slotItem);
                    }}
                    className="text-gray-600 px-2 py-1  bg-blue-300 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-400 hover:text-white "
                  >
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {slotItem.slots.map((s) => (
                    <button
                      key={s.time}
                      className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        s.isActive
                          ? "bg-green-500 hover:bg-green-600 text-white shadow-sm"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                      onClick={() =>
                        toggleSlot(slotItem._id, s.time, !s.isActive)
                      }
                    >
                      {formatTime(s.time)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;
