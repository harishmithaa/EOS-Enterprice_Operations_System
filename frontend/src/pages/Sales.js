import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Search, ShoppingCart, Minus, Plus, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

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

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            const saleData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            await API.post('/sales', saleData);
            toast.success('Sale recorded successfully!');
            setCart([]);
            fetchProducts(); // Refresh stock
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed');
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
            {/* Left: Product List */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Search products to add..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredProducts.map(product => (
                            <div
                                key={product._id}
                                onClick={() => addToCart(product)}
                                className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all ${product.stockQuantity === 0 ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                            >
                                <div className="h-24 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                                    {/* Placeholder Img */}
                                    <div className="text-gray-400 font-bold text-2xl">
                                        {product.name.charAt(0)}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm truncate">{product.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-emerald-600 font-bold">${product.sellingPrice}</span>
                                    <span className="text-xs text-gray-500">{product.stockQuantity} left</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-full lg:w-96 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" /> Current Sale
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            Cart is empty
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                                    <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border rounded-lg">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-gray-100"><Minus className="w-4 h-4" /></button>
                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-gray-100"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="text-2xl font-bold text-emerald-600">${totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DollarSign className="w-5 h-5" /> Complete Sale
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sales;
