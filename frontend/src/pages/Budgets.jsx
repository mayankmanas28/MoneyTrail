import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import useCurrency from "../hooks/useCurrency";
import BudgetModal from "../components/BudgetModal";
import EmptyState from "../components/EmptyState";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsRes, categoriesRes, transactionsRes] = await Promise.all([
        api.get("/budgets"),
        api.get("/transactions/categories/expense"),
        api.get("/transactions"),
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error("Failed to fetch budgets or transactions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenBudgetModal = (budget = null) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) await api.put(`/budgets/${id}`, formData);
      else await api.post("/budgets", formData);
      fetchData();
      handleCloseBudgetModal();
    } catch (error) {
      console.error("Failed to save budget", error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await api.delete(`/budgets/${id}`);
        fetchData();
      } catch (error) {
        console.error("Failed to delete budget", error);
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        <div className="flex gap-4">
          <button
            onClick={() => handleOpenBudgetModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Budget
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : budgets.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto hover:shadow-lg transition-all duration-300">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {budgets.map((b) => {
                // Use backend-calculated spent and remaining values
                const spent = b.spent || 0;
                const remaining = b.remaining !== undefined ? b.remaining : (b.amount - spent);
                const percent = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100).toFixed(1) : 0;

                return (
                  <tr key={b._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {b.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">{`${b.month}/${b.year}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: currency.code,
                      }).format(b.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 dark:text-red-400 font-semibold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: currency.code,
                      }).format(spent)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-semibold ${
                        remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: currency.code,
                      }).format(remaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-1/3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            percent < 80
                              ? "bg-green-500"
                              : percent < 100
                              ? "bg-yellow-500"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{percent}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenBudgetModal(b)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
          <EmptyState message="No budgets found" />
        </div>
      )}

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={handleCloseBudgetModal}
        onSubmit={handleFormSubmit}
        budget={editingBudget}
        categories={categories}
      />
    </>
  );
};

export default Budgets;
