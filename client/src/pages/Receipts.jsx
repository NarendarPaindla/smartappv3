import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, X } from 'lucide-react';

const Receipts = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                // Fetch all transactions and filter client-side or add a query param
                // For simplicity, fetching recent 50
                const { data } = await api.get('/transactions?limit=50');
                const withReceipts = data.filter(t => t.receiptImageUrl);
                setTransactions(withReceipts);
            } catch (error) {
                console.error('Error fetching receipts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReceipts();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Receipt Gallery</h2>

            {loading ? (
                <div className="text-center py-8">Loading receipts...</div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-500">No receipts found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {transactions.map((t) => (
                        <div key={t._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                            <div
                                className="h-48 bg-gray-100 relative cursor-pointer overflow-hidden"
                                onClick={() => setSelectedImage(`http://localhost:5000/${t.receiptImageUrl}`)}
                            >
                                {/* Note: In production, use a proper image service or static file serving */}
                                <img
                                    src={`http://localhost:5000/${t.receiptImageUrl}`}
                                    alt="Receipt"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found'; }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <ExternalLink className="text-white w-8 h-8" />
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-medium text-gray-900">{t.category}</p>
                                <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                                <p className="text-sm font-bold text-red-600 mt-1">{user.defaultCurrency} {t.amount}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img src={selectedImage} alt="Full Receipt" className="w-full h-full object-contain rounded-lg" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Receipts;
