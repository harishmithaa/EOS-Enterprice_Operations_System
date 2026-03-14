import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Check, ClipboardList, Package, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AnimatePage from '../components/AnimatePage';

const StepCard = ({ title, icon: Icon, completed, active, onClick }) => (
    <div
        onClick={onClick}
        className={`p-6 border rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4 ${active
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                : completed
                    ? 'border-gray-200 bg-gray-50 opacity-60' // Dim completed
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
            }`}
    >
        <div className={`p-3 rounded-full ${active ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
            <h3 className={`font-bold ${active ? 'text-emerald-900' : 'text-gray-700'}`}>{title}</h3>
            <p className="text-sm text-gray-500">{completed ? 'Completed' : 'Click to setup'}</p>
        </div>
        {completed && <Check className="w-5 h-5 text-emerald-600" />}
    </div>
);

const Onboarding = () => {
    const { updateUser } = useAuth(); // Need to implement updateUser in Context if not there, or just API call directly
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0: Select, 1: Product, 2: Material
    const [loading, setLoading] = useState(false);

    // Simple state for demo input
    const [product, setProduct] = useState({ name: '', price: '', stock: '' });
    const [material, setMaterial] = useState({ name: '', quantity: '', unit: 'kg' });

    const handleSkip = async () => {
        setLoading(true);
        try {
            await API.put('/auth/profile', { isOnboarded: true });
            // Update local user state
            const user = JSON.parse(localStorage.getItem('user'));
            user.isOnboarded = true;
            localStorage.setItem('user', JSON.stringify(user));
            // Force reload or use context update
            window.location.href = '/dashboard';
        } catch (error) {
            console.error(error);
            toast.error('Failed to complete setup');
            setLoading(false);
        }
    };

    const saveProduct = async () => {
        if (!product.name || !product.price) return;
        try {
            await API.post('/products', {
                name: product.name,
                sellingPrice: Number(product.price),
                costPrice: Number(product.price) * 0.7, // auto estimate
                stockQuantity: Number(product.stock),
                category: 'General'
            });
            toast.success('Product added!');
            setProduct({ name: '', price: '', stock: '' });
            setStep(0);
        } catch (error) {
            toast.error('Failed to add product');
        }
    };

    const saveMaterial = async () => {
        if (!material.name) return;
        try {
            await API.post('/materials', {
                name: material.name,
                quantity: Number(material.quantity),
                unit: material.unit
            });
            toast.success('Material added!');
            setMaterial({ name: '', quantity: '', unit: 'kg' });
            setStep(0);
        } catch (error) {
            toast.error('Failed to add material');
        }
    };

    return (
        <AnimatePage className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to EOS</h1>
                    <p className="text-gray-600">Let's get your business set up in a few simple steps.</p>
                </div>

                {step === 0 && (
                    <div className="grid gap-4 mb-8">
                        <StepCard
                            title="Add Initial Product"
                            icon={Package}
                            active={false}
                            onClick={() => setStep(1)}
                        />
                        <StepCard
                            title="Add Raw Material"
                            icon={ClipboardList}
                            active={false}
                            onClick={() => setStep(2)}
                        />
                    </div>
                )}

                {step === 1 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200 fade-in">
                        <h3 className="font-bold text-lg mb-4">Add a Product</h3>
                        <div className="space-y-4">
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Product Name"
                                value={product.name}
                                onChange={e => setProduct({ ...product, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    className="w-full border p-2 rounded"
                                    type="number"
                                    placeholder="Selling Price"
                                    value={product.price}
                                    onChange={e => setProduct({ ...product, price: e.target.value })}
                                />
                                <input
                                    className="w-full border p-2 rounded"
                                    type="number"
                                    placeholder="Initial Stock"
                                    value={product.stock}
                                    onChange={e => setProduct({ ...product, stock: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={saveProduct} className="bg-emerald-600 text-white px-4 py-2 rounded flex-1">Save</button>
                                <button onClick={() => setStep(0)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200 fade-in">
                        <h3 className="font-bold text-lg mb-4">Add Raw Material</h3>
                        <div className="space-y-4">
                            <input
                                className="w-full border p-2 rounded"
                                placeholder="Material Name"
                                value={material.name}
                                onChange={e => setMaterial({ ...material, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    className="w-full border p-2 rounded"
                                    type="number"
                                    placeholder="Quantity"
                                    value={material.quantity}
                                    onChange={e => setMaterial({ ...material, quantity: e.target.value })}
                                />
                                <select
                                    className="w-full border p-2 rounded"
                                    value={material.unit}
                                    onChange={e => setMaterial({ ...material, unit: e.target.value })}
                                >
                                    <option value="kg">kg</option>
                                    <option value="liter">liter</option>
                                    <option value="pcs">pcs</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={saveMaterial} className="bg-emerald-600 text-white px-4 py-2 rounded flex-1">Save</button>
                                <button onClick={() => setStep(0)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={handleSkip}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Continue to Dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </AnimatePage>
    );
};

export default Onboarding;
