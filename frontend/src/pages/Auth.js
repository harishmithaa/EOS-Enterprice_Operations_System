import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Set initial mode based on URL
    useEffect(() => {
        if (location.pathname === '/register') {
            setIsLogin(false);
        } else {
            setIsLogin(true);
        }
    }, [location.pathname]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Manually handle loading state for UI feedback

        try {
            let res;
            if (isLogin) {
                res = await login(email, password);
            } else {
                res = await register(email, password);
            }

            if (res.success) {
                // AuthContext handles the redirect based on onboarding status
                // We just need to stop loading
            } else {
                setError(res.message);
                toast.error(res.message);
            }
            // Error handled in else block
        } catch (err) {
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        navigate(isLogin ? '/register' : '/login');
    };

    return (
        <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4 text-emerald-600">
                            <Store className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">EOS</h1>
                        <p className="text-gray-500">Enterprise Operations System</p>
                    </div>

                    <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => !isLogin && toggleMode()}
                        >
                            Login
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => isLogin && toggleMode()}
                        >
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        &copy; 2026 Enterprise Operations System. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
