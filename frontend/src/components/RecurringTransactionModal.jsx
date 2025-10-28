import React, { useState, useEffect } from 'react';

const RecurringTransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  expenseCategories = [],
  incomeCategories = [],
}) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    amount: '',
    isIncome: false,
    frequency: 'monthly',
    startDate: '',
  });

  // Get categories based on income/expense type
  const currentCategories = form.isIncome ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (transaction) {
      setForm({
        name: transaction.name,
        category: transaction.category,
        amount: transaction.amount,
        isIncome: transaction.isIncome,
        frequency: transaction.frequency,
        startDate: transaction.startDate?.slice(0, 10),
      });
    } else {
      setForm({
        name: '',
        category: expenseCategories[0] || '',
        amount: '',
        isIncome: false,
        frequency: 'monthly',
        startDate: '',
      });
    }
  }, [transaction, expenseCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, transaction?._id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {transaction
            ? 'Edit Recurring Transaction'
            : 'Add Recurring Transaction'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">Select Category</option>
            {currentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">
              Next Due Date will be calculated automatically based on this start
              date and frequency.
            </p>
          </div>

          <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isIncome}
              onChange={(e) => {
                const isIncome = e.target.checked;
                const newCategories = isIncome ? incomeCategories : expenseCategories;
                // If current category exists in new category list, keep it; otherwise use first category
                const newCategory = newCategories.includes(form.category) 
                  ? form.category 
                  : (newCategories.length > 0 ? newCategories[0] : '');
                setForm({ 
                  ...form, 
                  isIncome,
                  category: newCategory
                });
              }}
              className="dark:bg-gray-700"
            />
            <span>Income</span>
          </label>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {transaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringTransactionModal;
