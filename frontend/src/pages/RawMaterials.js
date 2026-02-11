import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Plus, Trash2, Edit2, AlertTriangle, Layers } from 'lucide-react';
import { toast } from 'react-toastify';

const RawMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        unit: 'kg',
        minimumStockThreshold: 10
    });

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const { data } = await API.get('/materials');
            setMaterials(data);
        } catch (error) {
            toast.error('Failed to load raw materials');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMaterial) {
                await API.put(`/materials/${editingMaterial._id}`, formData);
                toast.success('Material updated');
            } else {
                await API.post('/materials', formData);
                toast.success('Material added');
            }
            fetchMaterials();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this material?')) {
            try {
                await API.delete(`/materials/${id}`);
                toast.success('Material deleted');
                setMaterials(materials.filter(m => m._id !== id));
            } catch (error) {
                toast.error('Failed to delete material');
            }
        }
    };

    const openModal = (material = null) => {
        if (material) {
            setEditingMaterial(material);
            setFormData({
                name: material.name,
                quantity: material.quantity,
                unit: material.unit,
                minimumStockThreshold: material.minimumStockThreshold
            });
        } else {
            setEditingMaterial(null);
            setFormData({ name: '', quantity: '', unit: 'kg', minimumStockThreshold: 10 });
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Raw Materials</h1>
                    <p className="text-gray-500">Track your production inventory</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Material
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading inventory...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map(material => {
                        const isLowStock = material.quantity <= material.minimumStockThreshold;
                        const percentage = Math.min((material.quantity / (material.minimumStockThreshold * 3)) * 100, 100);

                        return (
                            <div key={material._id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                                {isLowStock && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                                        Low Stock
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openModal(material)} className="text-gray-400 hover:text-emerald-600">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(material._id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 mb-1">{material.name}</h3>

                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">{material.quantity}</span>
                                    <span className="text-sm text-gray-500">{material.unit}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                    <div
                                        className={`h-2.5 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Threshold: {material.minimumStockThreshold} {material.unit}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editingMaterial ? 'Edit Material' : 'Add Material'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input required type="number" className="w-full border rounded-lg p-2" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <select className="w-full border rounded-lg p-2" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                        <option value="kg">kg</option>
                                        <option value="liter">liter</option>
                                        <option value="pcs">pcs</option>
                                        <option value="box">box</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                                <input required type="number" className="w-full border rounded-lg p-2" value={formData.minimumStockThreshold} onChange={e => setFormData({ ...formData, minimumStockThreshold: e.target.value })} />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RawMaterials;
