import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-8 shadow-sm fixed top-0 right-0 left-64 z-40">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">{user?.email || 'User'}</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                </div>

                <div className="h-8 w-px bg-gray-200"></div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
