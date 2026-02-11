import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    ClipboardList,
    Bell,
    Layers,
    Store
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/products', label: 'Products', icon: Package },
        { path: '/raw-materials', label: 'Raw Materials', icon: Layers },
        { path: '/sales', label: 'Sales', icon: Store },
        { path: '/orders', label: 'Orders', icon: ClipboardList },
        { path: '/notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="w-64 bg-emerald-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-wider flex items-center gap-2">
                    <Store className="w-8 h-8" />
                    EOS
                </h1>
                <p className="text-xs text-emerald-300 mt-1">Enterprise Operations</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-emerald-700 text-white shadow-md'
                                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-emerald-800">
                <div className="text-xs text-emerald-400 text-center">
                    &copy; 2026 EOS System
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
