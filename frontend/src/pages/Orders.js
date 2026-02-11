import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Package, Truck, CheckCircle, Clock, XCircle, Plus, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);

    // New Order Form Data
    const [products, setProducts] = useState([]);
    const [newOrder, setNewOrder] = useState({
        customerName: '',
        phoneNumber: '',
        address: '',
        items: [] // { productId, quantity }
    });
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedQty, setSelectedQty] = useState(1);

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders');
            setOrders(data);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products');
            setProducts(data);
        } catch (error) {
            // silent fail
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;
        const product = products.find(p => p._id === selectedProduct);
        setNewOrder({
            ...newOrder,
            items: [...newOrder.items, { productId: selectedProduct, quantity: Number(selectedQty), name: product.name, price: product.sellingPrice }]
        });
        setSelectedProduct('');
        setSelectedQty(1);
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        try {
            await API.post('/orders', newOrder);
            toast.success('Order created');
            setShowModal(false);
            setNewOrder({ customerName: '', phoneNumber: '', address: '', items: [] });
            fetchOrders();
        } catch (error) {
            toast.error('Failed to create order');
        }
    };

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Packed': return 'bg-blue-100 text-blue-700';
            case 'Out for Delivery': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-500">Manage customer orders</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    New Order
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', 'Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map(order => (
                    <div key={order._id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-mono text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800">{order.customerName}</h3>
                                <p className="text-sm text-gray-500">{order.phoneNumber} • {new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right mr-4">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-emerald-600">${order.totalAmount}</p>
                                </div>

                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                    <select
                                        className="border rounded-md px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={order.status}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Packed">Packed</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Mark Delivered</option>
                                        <option value="Cancelled">Cancel</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Order Items</p>
                            <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span>{item.productId?.name || 'Unknown Product'} <span className="text-gray-400">x{item.quantity}</span></span>
                                        <span className="font-medium">${item.subtotal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        No orders found.
                    </div>
                )}
            </div>

            {/* New Order Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Order</h2>
                        <form onSubmit={handleSubmitOrder} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="Customer Name" className="border p-2 rounded" value={newOrder.customerName} onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })} />
                                <input required placeholder="Phone Number" className="border p-2 rounded" value={newOrder.phoneNumber} onChange={e => setNewOrder({ ...newOrder, phoneNumber: e.target.value })} />
                            </div>
                            <input required placeholder="Address" className="border p-2 rounded w-full" value={newOrder.address} onChange={e => setNewOrder({ ...newOrder, address: e.target.value })} />

                            <div className="border-t pt-4">
                                <p className="font-bold mb-2">Add Items</p>
                                <div className="flex gap-2 mb-4">
                                    <select className="flex-1 border p-2 rounded" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                                        <option value="">Select Product...</option>
                                        {products.map(p => <option key={p._id} value={p._id}>{p.name} (${p.sellingPrice})</option>)}
                                    </select>
                                    <input type="number" className="w-20 border p-2 rounded" value={selectedQty} onChange={e => setSelectedQty(e.target.value)} min="1" />
                                    <button type="button" onClick={handleAddItem} className="bg-emerald-600 text-white px-4 rounded">Add</button>
                                </div>
                                <div className="bg-gray-50 p-4 rounded space-y-2">
                                    {newOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>{item.name} x {item.quantity}</span>
                                        </div>
                                    ))}
                                    {newOrder.items.length === 0 && <p className="text-gray-400 text-sm">No items added yet.</p>}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Create Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
