"use client";
import { useState } from "react";

export default function Home() {
  const compoundingOptions = [
    "30A/360",
    "30U/360",
    "30E/360",
    "30E/360 ISDA",
    "A/360",
    "A/365F",
    "A/A ISDA",
    "A/A AFB",
  ];

  const [form, setForm] = useState({
    principal: "",
    rate: "",
    term: "",
    start_date: "",
    payment_amount: 0,
    annual_payments: 12,
    interest_only_period: 0,
    compounding_method: compoundingOptions[0],
  });

  const [schedule, setSchedule] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("https://emi-calculator-dlu0.onrender.com/calculate-loan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
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
    "payment_amount"
  ];

  const columnLabels = {
    date: "Payment Date",
    loan_balance_amount: "Opening Balance",
    principal_amount: "Principal",
    interest_amount: "Interest",
    payment_amount: "EMI"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">EMI Calculator</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
          {Object.keys(form).map((key) =>
            ["payment_amount", "interest_only_period"].includes(key) ? null : 
            key === "compounding_method" ? (
              <select
                key={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-gray-700"
              >
                {compoundingOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={key}
                type={
                  key === "start_date"
                    ? "date"
                    : ["principal", "rate", "term", "annual_payments"].includes(key)
                    ? "number"
                    : "text"
                }
                name={key}
                value={form[key]}
                onChange={handleChange}
                placeholder={key.replace("_", " ")}
                className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-gray-700"
              />
            )
          )}
          <button
            type="submit"
            className="col-span-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-2 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold"
          >
            Calculate
          </button>
        </form>

        {schedule.length > 0 && (
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-300 w-full text-sm rounded-lg shadow">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
                <tr>
                  {tableColumns.map((col) => (
                    <th key={col} className="border border-gray-300 p-2 text-left text-gray-800">
                      {columnLabels[col]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {tableColumns.map((col, j) => (
                      <td key={j} className="border border-gray-300 p-2 text-gray-700">
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
