import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Save, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Budgets = () => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [budget, setBudget] = useState({
        overallBudgetAmount: 0,
        perCategoryBudgets: [],
    });
    const [actualSpending, setActualSpending] = useState({ total: 0, categories: {} });
    const [loading, setLoading] = useState(true);

    const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Salary', 'Others'];
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [newCategory, setNewCategory] = useState('');

    const fetchBudgetAndSpending = async () => {
        setLoading(true);
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();

            // Fetch Budget
            const { data: budgetData } = await api.get(`/budgets?month=${month}&year=${year}`);
            let currentBudget = { overallBudgetAmount: 0, perCategoryBudgets: [] };

            if (budgetData) {
                // Auto-calculate overall budget from categories
                const totalBudget = budgetData.perCategoryBudgets.reduce((acc, curr) => acc + curr.amount, 0);
                currentBudget = { ...budgetData, overallBudgetAmount: totalBudget };
                setBudget(currentBudget);
            } else {
                setBudget(currentBudget);
            }

            // Merge categories
            const budgetCategories = currentBudget.perCategoryBudgets.map(b => b.category);
            // Use DEFAULT_CATEGORIES instead of current state 'categories' to avoid keeping stale deleted custom categories
            const uniqueCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...budgetCategories]));
            setCategories(uniqueCategories);

            // Fetch Spending (Summary)
            const { data: summaryData } = await api.get(`/summary/monthly?month=${month}&year=${year}`);

            const categoryMap = {};
            summaryData.categoryBreakdown.forEach(item => {
                categoryMap[item.name] = item.value;
            });

            setActualSpending({
                total: summaryData.totalExpense,
                categories: categoryMap,
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgetAndSpending();
    }, [selectedDate]);

    const handleSaveBudget = async () => {
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            await api.post('/budgets', {
                month,
                year,
                overallBudgetAmount: budget.overallBudgetAmount,
                perCategoryBudgets: budget.perCategoryBudgets,
            });
            addToast('Budget saved successfully!', 'success');
            fetchBudgetAndSpending();
        } catch (error) {
            console.error('Error saving budget:', error);
            addToast('Failed to save budget', 'error');
        }
    };

    const updateCategoryBudget = (category, amount) => {
        const existing = budget.perCategoryBudgets.find(b => b.category === category);
        let newBudgets = [...budget.perCategoryBudgets];

        if (existing) {
            newBudgets = newBudgets.map(b => b.category === category ? { ...b, amount: Number(amount) } : b);
        } else {
            newBudgets.push({ category, amount: Number(amount) });
        }

        // Auto-calculate overall budget
        const totalBudget = newBudgets.reduce((acc, curr) => acc + curr.amount, 0);

        setBudget({
            ...budget,
            perCategoryBudgets: newBudgets,
            overallBudgetAmount: totalBudget
        });
    };

    const deleteCategoryBudget = async (category) => {
        if (window.confirm(`Are you sure you want to delete the budget for ${category}?`)) {
            const newBudgets = budget.perCategoryBudgets.filter(b => b.category !== category);

            // If it's a custom category, remove it from the categories list as well
            if (!DEFAULT_CATEGORIES.includes(category)) {
                setCategories(categories.filter(c => c !== category));
            }

            // Auto-calculate overall budget
            const totalBudget = newBudgets.reduce((acc, curr) => acc + curr.amount, 0);

            const updatedBudget = {
                ...budget,
                perCategoryBudgets: newBudgets,
                overallBudgetAmount: totalBudget
            };

            setBudget(updatedBudget);

            // Auto-save changes
            try {
                const month = selectedDate.getMonth() + 1;
                const year = selectedDate.getFullYear();
                await api.post('/budgets', {
                    month,
                    year,
                    overallBudgetAmount: updatedBudget.overallBudgetAmount,
                    perCategoryBudgets: updatedBudget.perCategoryBudgets,
                });
                addToast('Budget deleted successfully', 'success');
            } catch (error) {
                console.error('Error saving budget deletion:', error);
                addToast('Failed to save changes', 'error');
            }
        }
    };

    const addCustomCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
        }
    };

    const getCategoryBudgetAmount = (category) => {
        return budget.perCategoryBudgets.find(b => b.category === category)?.amount || 0;
    };

    const getProgressColor = (spent, limit) => {
        if (limit === 0) return 'bg-gray-200';
        const percentage = (spent / limit) * 100;
        if (percentage > 100) return 'bg-red-500';
        if (percentage > 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
                <input
                    type="month"
                    value={selectedDate.toISOString().slice(0, 7)}
                    onChange={(e) => setSelectedDate(new Date(e.target.value + '-01'))}
                    className="p-2 border border-gray-300 rounded-lg"
                />
            </div>

            {/* Overall Budget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Overall Monthly Budget</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Limit:</span>
                        <input
                            type="number"
                            value={budget.overallBudgetAmount}
                            readOnly
                            className="w-32 p-1 border border-gray-300 rounded text-right bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-indigo-100">
                                Progress
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-primary">
                                {user.defaultCurrency} {actualSpending.total} / {budget.overallBudgetAmount}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div
                            style={{ width: `${Math.min((actualSpending.total / (budget.overallBudgetAmount || 1)) * 100, 100)}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getProgressColor(actualSpending.total, budget.overallBudgetAmount)}`}
                        ></div>
                    </div>
                    {actualSpending.total > budget.overallBudgetAmount && budget.overallBudgetAmount > 0 && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Over budget!
                        </p>
                    )}
                </div>
            </div>

            {/* Add Custom Category */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Add Custom Category</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New Category Name"
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                    />
                    <button
                        onClick={addCustomCategory}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Category Budgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map(category => {
                    const limit = getCategoryBudgetAmount(category);
                    const spent = actualSpending.categories[category] || 0;

                    return (
                        <div key={category} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">{category}</h4>
                                <input
                                    type="number"
                                    placeholder="Set Budget"
                                    value={limit || ''}
                                    onChange={(e) => updateCategoryBudget(category, e.target.value)}
                                    className="w-24 p-1 border border-gray-300 rounded text-right text-sm"
                                />
                                <button
                                    onClick={() => deleteCategoryBudget(category)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Budget"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-600">
                                        {user.defaultCurrency} {spent} spent
                                    </span>
                                    <span className="text-xs font-semibold text-gray-600">
                                        {Math.round((spent / (limit || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                                    <div
                                        style={{ width: `${Math.min((spent / (limit || 1)) * 100, 100)}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getProgressColor(spent, limit)}`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-8 right-8">
                <button
                    onClick={handleSaveBudget}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                >
                    <Save className="w-5 h-5" />
                    Save Budgets
                </button>
            </div>
        </div>
    );
};

export default Budgets;
