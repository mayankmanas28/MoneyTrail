import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import RecurringTransactionModal from "../components/RecurringTransactionModal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import useCurrency from "../hooks/useCurrency";

const RecurringTransactions = () => {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  const { currency } = useCurrency();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recurringRes, expenseCategoriesRes, incomeCategoriesRes] = await Promise.all([
        api.get("/recurring"),
        api.get("/transactions/categories/expense"),
        api.get("/transactions/categories/income"),
      ]);
      setRecurring(recurringRes.data || []);
      setExpenseCategories(expenseCategoriesRes.data || []);
      setIncomeCategories(incomeCategoriesRes.data || []);
    } catch (err) {
      console.error("Failed to fetch recurring transactions", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) {
        await api.put(`/recurring/${id}`, formData);
      } else {
        await api.post("/recurring/create", formData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save recurring transaction", err);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this recurring transaction?"
      )
    ) {
      try {
        await api.delete(`/recurring/${id}`);
        fetchData();
      } catch (err) {
        console.error("Failed to delete recurring transaction", err);
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Recurring Transactions
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Recurring
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
          {recurring.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Next Due
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recurring.map((r) => (
                  <tr key={r._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{r.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {r.category}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-semibold ${
                        r.isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {r.isIncome ? "+" : "-"}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: currency.code,
                      }).format(r.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {r.isIncome ? "Income" : "Expense"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {r.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(r)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <EmptyState message="No recurring transactions" />
            </div>
          )}
        </div>
      )}

      <RecurringTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />
    </>
  );
};

export default RecurringTransactions;
