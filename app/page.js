"use client";
import { useState } from "react";

export default function Home() {
  const daysConventionOptions = ["30/360", "Actual/360", "Actual/365"];

  const daysConventionMap = {
    "30/360": "30A/360",
    "Actual/360": "A/360",
    "Actual/365": "A/365F",
  };

  const [form, setForm] = useState({
    principal: "",
    rate: "",
    term: "",
    start_date: "",
    payment_amount: 0,
    annual_payments: 12,
    interest_only_period: 0,
    days_convention: daysConventionOptions[0],
  });

  const [schedule, setSchedule] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      compounding_method: daysConventionMap[form.days_convention],
    };

    const res = await fetch(
      "https://emi-calculator-dlu0.onrender.com/calculate-loan",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    setSchedule(data.schedule);
  };

  const formatDate = (val) => {
    if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
      const dateObj = new Date(val);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return val;
  };

  const tableColumns = [
    "date",
    "loan_balance_amount",
    "principal_amount",
    "interest_amount",
    "payment_amount",
  ];

  const columnLabels = {
    date: "Payment Date",
    loan_balance_amount: "Opening Balance",
    principal_amount: "Principal",
    interest_amount: "Interest",
    payment_amount: "EMI",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          EMI Calculator
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-6">
          {/* Days Convention */}
          <div className="flex flex-col flex-1 min-w-[140px]">
            <label
              htmlFor="days_convention"
              className="text-gray-700 font-medium mb-1"
            >
              Days Convention
            </label>
            <select
              id="days_convention"
              name="days_convention"
              value={form.days_convention}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-gray-700"
            >
              {daysConventionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Other input fields */}
          {Object.keys(form).map(
            (key) =>
              !["days_convention", "payment_amount", "interest_only_period"].includes(
                key
              ) && (
                <div key={key} className="flex flex-col flex-1 min-w-[140px]">
                  <label
                    htmlFor={key}
                    className="text-gray-700 font-medium mb-1"
                  >
                    {key
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  <input
                    id={key}
                    type={
                      key === "start_date"
                        ? "date"
                        : ["principal", "rate", "term", "annual_payments"].includes(
                            key
                          )
                        ? "number"
                        : "text"
                    }
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-gray-700"
                  />
                </div>
              )
          )}

          {/* Submit button */}
          <div className="flex flex-col justify-end min-w-[140px]">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold"
            >
              Calculate
            </button>
          </div>
        </form>

        {/* EMI Schedule Table */}
        {schedule.length > 0 && (
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-300 w-full text-sm rounded-lg shadow">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
                <tr>
                  {tableColumns.map((col) => (
                    <th
                      key={col}
                      className="border border-gray-300 p-2 text-left text-gray-800"
                    >
                      {columnLabels[col]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {tableColumns.map((col, j) => (
                      <td
                        key={j}
                        className="border border-gray-300 p-2 text-gray-700"
                      >
                        {col === "date" ? formatDate(row[col]) : row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
