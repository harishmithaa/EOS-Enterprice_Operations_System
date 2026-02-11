import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Bell, Check, AlertTriangle, Info, ShoppingBag } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LOW_STOCK': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'SALE': return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
            case 'ORDER': return <Bell className="w-5 h-5 text-blue-500" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                    <p className="text-gray-500">Stay updated with your business alerts</p>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.map(notification => (
                    <div
                        key={notification._id}
                        className={`p-4 rounded-lg flex items-start gap-4 transition-all ${notification.isRead ? 'bg-white border border-gray-100' : 'bg-blue-50 border border-blue-100 shadow-sm'
                            }`}
                    >
                        <div className="mt-1">
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                            </p>
                        </div>
                        {!notification.isRead && (
                            <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                            >
                                <Check className="w-4 h-4" /> Mark Read
                            </button>
                        )}
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        No notifications yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
