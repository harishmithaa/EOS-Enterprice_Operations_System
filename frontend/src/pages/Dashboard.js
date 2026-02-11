import { useEffect, useState } from 'react';
import API from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, ShoppingBag, AlertTriangle, Package } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// ... [existing imports and StatCard]

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Trend State
    const [trendData, setTrendData] = useState([]);
    const [trendLoading, setTrendLoading] = useState(false);
    const [period, setPeriod] = useState('30days');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    // Filter Options
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchTrends();
    }, [period, selectedCategory, selectedProduct]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, productsRes] = await Promise.all([
                API.get('/analytics/dashboard'),
                API.get('/products')
            ]);

            setStats(statsRes.data);

            // Extract unique categories and products for filters
            const productList = productsRes.data;
            setProducts(productList);
            const uniqueCategories = [...new Set(productList.map(p => p.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrends = async () => {
        setTrendLoading(true);
        try {
            const params = { period };
            if (selectedCategory) params.category = selectedCategory;
            if (selectedProduct) params.productId = selectedProduct;

            const { data } = await API.get('/analytics/trends', { params });
            setTrendData(data);
        } catch (error) {
            console.error('Error fetching trends:', error);
        } finally {
            setTrendLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load stats.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Sales" value={`$${stats.salesToday}`} icon={DollarSign} color="bg-blue-500" />
                <StatCard title="Monthly Profit" value={`$${stats.profitMonth}`} icon={DollarSign} color="bg-green-500" />
                <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="bg-indigo-500" />
                <StatCard title="Low Stock Items" value={stats.lowStockCount} icon={AlertTriangle} color="bg-red-500" />
            </div>

            {/* Sales Trends Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-lg font-bold text-gray-800">Sales Trends</h2>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <select
                            className="border rounded-md px-3 py-1 text-sm outline-none focus:border-emerald-500"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 3 Months</option>
                            <option value="year">Last Year</option>
                        </select>

                        <select
                            className="border rounded-md px-3 py-1 text-sm outline-none focus:border-emerald-500"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setSelectedProduct(''); // Reset product if category changes
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            className="border rounded-md px-3 py-1 text-sm outline-none focus:border-emerald-500"
                            value={selectedProduct}
                            onChange={(e) => {
                                setSelectedProduct(e.target.value);
                                setSelectedCategory(''); // Reset category if specific product selected
                            }}
                        >
                            <option value="">All Products</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="h-80 w-full">
                    {trendLoading ? (
                        <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    name="Sales Amount ($)"
                                    stroke="#0f766e"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#0f766e' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Sales (Small) - Keeping original logic or removing? 
                    User wanted detailed trends. The new chart covers the "Sales Trend (Last 7 Days)" 
                    that was there before, but better. I'll replace the old chart with the new big one above, 
                    and keep Low Stock list. 
                */}

                {/* Low Stock List */}
                <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
                    <h2 className="text-lg font-bold mb-4 text-red-600">Low Stock Alerts</h2>
                    {stats.lowStockProducts.length === 0 ? (
                        <p className="text-gray-500 text-sm">All products are well stocked.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.lowStockProducts.map(product => (
                                <div key={product._id} className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                                    <div>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">Threshold: {product.minimumStockThreshold}</p>
                                    </div>
                                    <span className="text-red-600 font-bold text-lg">{product.stockQuantity}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
