import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Plus, Search, ShoppingCart, Minus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AnimatePage from '../components/AnimatePage';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);

    // New Order Form Data & POS State
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newOrder, setNewOrder] = useState({
        customerName: '',
        phoneNumber: '',
        address: '',
        shippingAmount: '',
    });
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchOrders();
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

    const openModal = () => {
        setCart([]);
        setNewOrder({ customerName: '', phoneNumber: '', address: '', shippingAmount: '' });
        setSearchTerm('');
        fetchProducts(); // Refresh stock before ordering
        setShowModal(true);
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

    // POS logic
    const addToCart = (product) => {
        if (product.stockQuantity <= 0) {
            toast.error('Out of stock!');
            return;
        }

        const existingItem = cart.find(item => item.productId === product._id);
        if (existingItem) {
            if (existingItem.quantity >= product.stockQuantity) {
                toast.error('Max stock reached');
                return;
            }
            setCart(cart.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product._id,
                name: product.name,
                price: product.sellingPrice,
                quantity: 1,
                subtotal: product.sellingPrice,
                maxStock: product.stockQuantity
            }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const newQuantity = item.quantity + delta;
                if (newQuantity < 1) return item;
                if (newQuantity > item.maxStock) {
                    toast.error('Max stock reached');
                    return item;
                }
                return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price };
            }
            return item;
        }));
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error("Please add at least one item to the order.");
            return;
        }

        const orderData = {
            ...newOrder,
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        };

        try {
            await API.post('/orders', orderData);
            toast.success('Order created');
            setShowModal(false);
            setCart([]);
            setNewOrder({ customerName: '', phoneNumber: '', address: '', shippingAmount: '' });
            fetchOrders();
        } catch (error) {
            toast.error('Failed to create order');
        }
    };

    const totalItemsAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const totalAmount = totalItemsAmount + (Number(newOrder.shippingAmount) || 0);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <AnimatePage>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-500">Manage customer orders and dispatch</p>
                </div>
                <button
                    onClick={openModal}
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
            {loading ? (
                <div className="text-center py-10 text-gray-400">Loading orders...</div>
            ) : (
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
                                        <p className="text-xl font-bold text-emerald-600">₹{order.totalAmount}</p>
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
                                            <span className="font-medium">₹{item.subtotal}</span>
                                        </div>
                                    ))}
                                    {order.shippingAmount > 0 && (
                                        <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-100 mt-2">
                                            <span>Shipping</span>
                                            <span className="font-medium">₹{order.shippingAmount}</span>
                                        </div>
                                    )}
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
            )}

            {/* New Order Modal with POS Interface */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                        >

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h2 className="text-xl font-bold text-gray-800">Create New Order</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                        </div>

                        {/* Modal Body: Split view */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Side: Product Selection (POS) */}
                            <div className="flex-1 flex flex-col p-6 bg-gray-50 border-r border-gray-200">
                                <div className="relative mb-4 shrink-0">
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                                        placeholder="Search products to add..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredProducts.map(product => (
                                            <div
                                                key={product._id}
                                                onClick={() => addToCart(product)}
                                                className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all ${product.stockQuantity === 0 ? 'opacity-60 grayscale cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                <div className="h-16 bg-emerald-50 rounded-md mb-2 flex items-center justify-center border border-emerald-100">
                                                    <div className="text-emerald-700 font-bold text-xl uppercase">
                                                        {product.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <h3 className="font-bold text-gray-800 text-sm truncate" title={product.name}>{product.name}</h3>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-emerald-600 font-bold text-sm">₹{product.sellingPrice}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.stockQuantity === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        {product.stockQuantity} box
                                                    </span>
                                                </div>
                                                {product.stockQuantity === 0 && <span className="block text-center text-xs text-red-500 font-medium mt-1">Out of Stock</span>}
                                            </div>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                                No products found...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Cart & Customer Info */}
                            <div className="w-96 flex flex-col bg-white">
                                <form onSubmit={handleSubmitOrder} className="flex-1 flex flex-col h-full">

                                    {/* Customer Form */}
                                    <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50 shrink-0">
                                        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">Customer Details</h3>
                                        <input
                                            required
                                            placeholder="Customer Name"
                                            className="w-full border px-3 py-2 rounded-lg text-sm shadow-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                            value={newOrder.customerName}
                                            onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })}
                                        />
                                        <input
                                            required
                                            placeholder="Phone Number"
                                            className="w-full border px-3 py-2 rounded-lg text-sm shadow-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                            value={newOrder.phoneNumber}
                                            onChange={e => setNewOrder({ ...newOrder, phoneNumber: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <textarea
                                                required
                                                placeholder="Delivery Address"
                                                className="flex-1 border px-3 py-2 rounded-lg text-sm shadow-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-10"
                                                value={newOrder.address}
                                                onChange={e => setNewOrder({ ...newOrder, address: e.target.value })}
                                            />
                                            <div className="relative w-28">
                                                <span className="absolute left-3 top-2.5 text-gray-500 text-sm">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="Shipping"
                                                    className="w-full border pl-7 pr-3 py-2 rounded-lg text-sm shadow-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 h-10"
                                                    value={newOrder.shippingAmount}
                                                    onChange={e => setNewOrder({ ...newOrder, shippingAmount: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cart Items */}
                                    <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar">
                                        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4" /> Order Items ({cart.length})
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            {cart.length === 0 ? (
                                                <div className="text-center py-10">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3">
                                                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-gray-400 text-sm">Add products from the left to build order.</p>
                                                </div>
                                            ) : (
                                                cart.map(item => (
                                                    <div key={item.productId} className="flex items-start justify-between p-3 border border-gray-100 rounded-lg shadow-sm hover:border-emerald-200 transition-colors">
                                                        <div className="flex-1 mr-3 min-w-0">
                                                            <h4 className="font-semibold text-gray-800 text-sm truncate" title={item.name}>{item.name}</h4>
                                                            <p className="text-xs text-emerald-600 font-medium mt-0.5">₹{item.price} each</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                                            <div className="flex items-center border border-gray-200 rounded-md bg-white">
                                                                <button type="button" onClick={() => updateQuantity(item.productId, -1)} className="p-1 px-1.5 hover:bg-gray-100 text-gray-500 transition-colors rounded-l-md"><Minus className="w-3 h-3" /></button>
                                                                <span className="w-6 text-center text-xs font-bold text-gray-700 select-none pb-px">{item.quantity}</span>
                                                                <button type="button" onClick={() => updateQuantity(item.productId, 1)} className="p-1 px-1.5 hover:bg-gray-100 text-gray-500 transition-colors rounded-r-md"><Plus className="w-3 h-3" /></button>
                                                            </div>
                                                            <button type="button" onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 font-medium transition-colors">
                                                                <Trash2 className="w-3 h-3" /> Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Checkout Footer */}
                                    <div className="p-4 border-t border-gray-100 bg-emerald-50 rounded-br-xl shrink-0">
                                        <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
                                            <span>Subtotal</span>
                                            <span>₹{totalItemsAmount.toFixed(2)}</span>
                                        </div>
                                        {Number(newOrder.shippingAmount) > 0 && (
                                            <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                                                <span>Shipping</span>
                                                <span>+ ₹{Number(newOrder.shippingAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end mb-4 pt-2 border-t border-emerald-100">
                                            <span className="text-gray-700 font-bold">Grand Total</span>
                                            <span className="text-3xl font-bold text-emerald-700">₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={cart.length === 0}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" /> Generate Order
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePage>
    );
};

export default Orders;
