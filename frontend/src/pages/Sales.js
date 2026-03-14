import { useState, useEffect } from 'react';
import API from '../utils/api';
import { History } from 'lucide-react';
import { toast } from 'react-toastify';
import AnimatePage from '../components/AnimatePage';

const Sales = () => {
    const [salesHistory, setSalesHistory] = useState([]);
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchSalesHistory = async () => {
            setHistoryLoading(true);
            try {
                const { data } = await API.get(`/sales?date=${historyDate}`);
                setSalesHistory(data);
            } catch (error) {
                toast.error('Failed to load sales history');
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchSalesHistory();
    }, [historyDate]);

    return (
        <AnimatePage className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
                    <p className="text-gray-500">View and track your completed sales</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <History className="w-5 h-5" /> Sales Transactions
                    </h2>
                    <input
                        type="date"
                        value={historyDate}
                        onChange={(e) => setHistoryDate(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {historyLoading ? (
                        <div className="text-center py-10 text-gray-400">Loading history...</div>
                    ) : salesHistory.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">No sales found for this date.</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Items</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-right">Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {salesHistory.map(sale => (
                                    <tr key={sale._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-gray-600">
                                            {new Date(sale.saleDate).toLocaleTimeString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {sale.items.map((item, idx) => (
                                                <span key={idx} className="block text-gray-700">
                                                    {item.productId?.name || 'Unknown'} <span className="text-gray-400">x{item.quantity}</span>
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                            ₹{sale.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-500">
                                            ₹{sale.totalProfit.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AnimatePage>
    );
};

export default Sales;
