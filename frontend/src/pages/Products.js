import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Plus, Search, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import AnimatePage from '../components/AnimatePage';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        sellingPrice: '',
        costPrice: '',
        stockQuantity: '',
        minimumStockThreshold: 10,
        image: null
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingProduct) {
                await API.put(`/products/${editingProduct._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully');
            } else {
                await API.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product added successfully');
            }
            fetchProducts();
            closeModal();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await API.delete(`/products/${id}`);
                toast.success('Product deleted');
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                description: product.description || '',
                sellingPrice: product.sellingPrice,
                costPrice: product.costPrice,
                stockQuantity: product.stockQuantity,
                minimumStockThreshold: product.minimumStockThreshold,
                image: null
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                description: '',
                sellingPrice: '',
                costPrice: '',
                stockQuantity: '',
                minimumStockThreshold: 10,
                image: null
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePage>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-gray-500">Manage your inventory</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                        <Search className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full outline-none text-gray-700 placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">Low Stock Items</p>
                    <p className="text-2xl font-bold text-red-600">
                        {products.filter(p => p.stockQuantity <= p.minimumStockThreshold).length}
                    </p>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="text-center py-10">Loading products...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-48 bg-gray-100 relative">
                                {product.imageUrl ? (
                                    <img
                                        src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${product.imageUrl}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                                    {product.category}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-emerald-600 font-bold">₹{product.sellingPrice}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${product.stockQuantity === 0 ? 'bg-red-100 text-red-700' :
                                        product.stockQuantity <= product.minimumStockThreshold ? 'bg-orange-100 text-orange-700' :
                                            'bg-emerald-50 text-emerald-700'
                                        }`}>
                                        Stock: {product.stockQuantity}
                                    </span>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-gray-50">
                                    <button
                                        onClick={() => openModal(product)}
                                        className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="flex-1 py-2 text-sm text-red-500 hover:bg-red-50 rounded flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
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
                            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input required name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded-lg p-2" rows="3" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                                    <input required type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                                    <input required type="number" name="costPrice" value={formData.costPrice} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                                    <input required type="number" name="minimumStockThreshold" value={formData.minimumStockThreshold} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                    />
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">
                                        {formData.image ? formData.image.name : 'Click to upload image'}
                                    </p>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors">
                                {editingProduct ? 'Update Product' : 'Save Product'}
                            </button>
                        </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePage>
    );
};

export default Products;
