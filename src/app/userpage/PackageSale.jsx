'use client';

import { useState, useEffect } from 'react';
import { Search, Gift, Smartphone, CreditCard, Banknote, User, CheckCircle, Clock, Plus, X, Calendar, ArrowUpRight } from 'lucide-react';
import Cookies from 'js-cookie';

const styles = {
    container: {
        padding: '30px',
        maxWidth: '1200px',
        backgroundColor: '#fff',
        minHeight: '100vh'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#111827',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    addButton: {
        backgroundColor: '#7c3aed',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)'
    },
    tableContainer: {
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px'
    },
    th: {
        backgroundColor: '#f9fafb',
        padding: '16px',
        textAlign: 'left',
        color: '#6b7280',
        fontWeight: '600',
        borderBottom: '1px solid #e5e7eb'
    },
    td: {
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        color: '#1f2937'
    },
    statusBadge: (active) => ({
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: active ? '#dcfce7' : '#f3f4f6',
        color: active ? '#166534' : '#6b7280'
    }),
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '0'
    },
    modalHeader: {
        padding: '24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    modalBody: {
        padding: '24px'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#6b7280'
    },

    // Form Styles
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' },
    searchResults: { marginTop: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white' },
    searchResultItem: { padding: '12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    selectedCustomer: { padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: 'white' },
    priceBox: { padding: '20px', backgroundColor: '#f5f3ff', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', border: '1px solid #ddd6fe' },
    priceValue: { fontSize: '32px', fontWeight: '700', color: '#7c3aed' },
    submitButton: { width: '100%', padding: '14px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};

export default function PackageSale() {
    const [packages, setPackages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [token, setToken] = useState('');

    // Form State
    const [searchPhone, setSearchPhone] = useState('');
    const [customers, setCustomers] = useState([]);
    const [foundCustomers, setFoundCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [massageTypes, setMassageTypes] = useState([]);
    const [durations, setDurations] = useState([]);
    const [formData, setFormData] = useState({
        massageType: '',
        duration: '',
        paymentMethod: 'cash',
        price: 0
    });

    const API_BASE = 'https://thaiback.onrender.com/api';

    useEffect(() => {
        const t = Cookies.get('authToken');
        if (t) {
            setToken(t);
            fetchPackages(t);
            fetchCustomers(t);
            fetchMassageTypes(t);
        }
    }, []);

    const fetchPackages = async (t) => {
        try {
            const response = await fetch(`${API_BASE}/packages/all/${t}`);
            if (response.ok) {
                const data = await response.json();
                setPackages(data);
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const fetchCustomers = async (t) => {
        try {
            const response = await fetch(`${API_BASE}/receptionist/customers/${t}`);
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchMassageTypes = async (t) => {
        try {
            const response = await fetch(`${API_BASE}/receptionist/massage-types/${t}`);
            if (response.ok) {
                const data = await response.json();
                setMassageTypes(data);
            }
        } catch (error) {
            console.error('Error fetching massage types:', error);
        }
    };

    // Customer search
    useEffect(() => {
        const searchCustomer = () => {
            if (!searchPhone.trim()) {
                setFoundCustomers([]);
                return;
            }

            const term = searchPhone.toLowerCase();
            const filtered = customers.filter(c =>
                c.phone.includes(term) ||
                c.name.toLowerCase().includes(term)
            );

            setFoundCustomers(filtered);
        };

        const debounce = setTimeout(searchCustomer, 300);
        return () => clearTimeout(debounce);
    }, [searchPhone, customers]);

    const calculatePrice = (typeId, durationVal) => {
        if (!typeId || !durationVal) return 0;
        const type = massageTypes.find(m => m._id === typeId);
        if (!type) return 0;
        const durOption = type.durations.find(d => d.minutes === parseInt(durationVal));
        if (!durOption) return 0;

        return (durOption.price * 10) * 0.90; // 10% discount
    };

    useEffect(() => {
        const price = calculatePrice(formData.massageType, formData.duration);
        setFormData(prev => ({ ...prev, price }));
    }, [formData.massageType, formData.duration]);

    const handleMassageTypeChange = (e) => {
        const typeId = e.target.value;
        const type = massageTypes.find(m => m._id === typeId);

        setFormData(prev => ({
            ...prev,
            massageType: typeId,
            duration: ''
        }));

        if (type) {
            setDurations(type.durations || []);
        } else {
            setDurations([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCustomer || !formData.massageType || !formData.duration) {
            alert('Bütün xanaları doldurun');
            return;
        }

        try {
            const payload = {
                customerId: selectedCustomer._id,
                massageTypeId: formData.massageType,
                duration: formData.duration,
                paymentMethod: formData.paymentMethod,
                notes: 'Paket Satışı Səhifəsi Modalı'
            };

            const response = await fetch(`${API_BASE}/packages/create/${token}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Paket uğurla satıldı!');
                setShowModal(false);
                fetchPackages(token); // Refresh list

                // Reset form
                setSelectedCustomer(null);
                setSearchPhone('');
                setFormData({
                    massageType: '',
                    duration: '',
                    paymentMethod: 'cash',
                    price: 0
                });
            } else {
                const err = await response.json();
                alert('Xəta: ' + (err.message || 'Satış uğursuz oldu'));
            }
        } catch (error) {
            console.error('Sale error:', error);
            alert('Sistem xətası');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('az-AZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <Gift size={32} color="#7c3aed" />
                    Satılan Paketlər
                </h1>
                <button onClick={() => setShowModal(true)} style={styles.addButton}>
                    <Plus size={20} />
                    Yeni Paket Satışı
                </button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Tarix</th>
                            <th style={styles.th}>Müştəri</th>
                            <th style={styles.th}>Filial</th>
                            <th style={styles.th}>Paket</th>
                            <th style={styles.th}>Müddət</th>
                            <th style={styles.th}>Gediş Qalıq</th>
                            <th style={styles.th}>Qiymət</th>
                            <th style={styles.th}>Ödəniş</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                    Heç bir paket tapılmadı
                                </td>
                            </tr>
                        ) : (
                            packages.map(pkg => (
                                <tr key={pkg._id}>
                                    <td style={styles.td}>{formatDate(pkg.createdAt)}</td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: '500' }}>{pkg.customer?.name}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{pkg.customer?.phone}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ fontSize: '13px', color: '#4b5563' }}>{pkg.branch?.name || '---'}</div>
                                    </td>
                                    <td style={styles.td}>{pkg.massageType?.name}</td>
                                    <td style={styles.td}>{pkg.duration} dəq</td>
                                    <td style={styles.td}>
                                        <span style={{ fontWeight: '600', color: '#7c3aed' }}>{pkg.remainingVisits}</span> / 10
                                    </td>
                                    <td style={{ ...styles.td, fontWeight: '700', color: '#16a34a' }}>
                                        {pkg.price} AZN
                                    </td>
                                    <td style={styles.td}>
                                        {pkg.paymentMethod === 'cash' ? 'Nağd' : pkg.paymentMethod === 'card' ? 'Kart' : 'Terminal'}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.statusBadge(pkg.isActive)}>
                                            {pkg.isActive ? 'Aktiv' : 'Bitib'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>Yeni Paket Satışı</h2>
                            <button onClick={() => setShowModal(false)} style={styles.closeButton}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            {!selectedCustomer ? (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Müştəri Axtar (Ad və ya Telefon)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="Ad və ya nömrə..."
                                            value={searchPhone}
                                            onChange={(e) => setSearchPhone(e.target.value)}
                                            style={{ ...styles.input, paddingLeft: '40px' }}
                                        />
                                        <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                                    </div>
                                    {foundCustomers.length > 0 && (
                                        <div style={styles.searchResults}>
                                            {foundCustomers.map(cust => (
                                                <div
                                                    key={cust._id}
                                                    style={styles.searchResultItem}
                                                    onClick={() => {
                                                        setSelectedCustomer(cust);
                                                        setFoundCustomers([]);
                                                        setSearchPhone('');
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{cust.name}</div>
                                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{cust.phone}</div>
                                                    </div>
                                                    <User size={18} color="#6b7280" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={styles.selectedCustomer}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontWeight: 'bold' }}>
                                            {selectedCustomer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#166534' }}>{selectedCustomer.name}</div>
                                            <div style={{ fontSize: '13px', color: '#15803d' }}>{selectedCustomer.phone}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fab1a0', cursor: 'pointer' }}>Dəyişdir</button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={styles.label}>Masaj Növü</label>
                                        <select style={styles.select} value={formData.massageType} onChange={handleMassageTypeChange}>
                                            <option value="">Seçin...</option>
                                            {massageTypes.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={styles.label}>Müddət</label>
                                        <select style={styles.select} value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} disabled={!formData.massageType}>
                                            <option value="">Seçin...</option>
                                            {durations.map(d => <option key={d._id} value={d.minutes}>{d.minutes} dəq - {d.price} AZN</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Ödəniş Üsulu</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {['cash', 'card', 'terminal'].map(method => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${formData.paymentMethod === method ? '#7c3aed' : '#e5e7eb'}`,
                                                    backgroundColor: formData.paymentMethod === method ? '#f5f3ff' : 'white',
                                                    color: formData.paymentMethod === method ? '#7c3aed' : '#6b7280',
                                                    cursor: 'pointer',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                                                }}
                                            >
                                                {method === 'cash' && <Banknote size={20} />}
                                                {method === 'card' && <CreditCard size={20} />}
                                                {method === 'terminal' && <Smartphone size={20} />}
                                                <span style={{ fontSize: '13px', fontWeight: '500' }}>{method === 'cash' ? 'Nağd' : method === 'card' ? 'Kart' : 'Terminal'}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.price > 0 && (
                                    <div style={styles.priceBox}>
                                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Yekun Qiymət (10 gediş)</div>
                                        <div style={styles.priceValue}>{formData.price} AZN</div>
                                        <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            <CheckCircle size={14} /> 10% Endirim tətbiq edildi
                                        </div>
                                    </div>
                                )}

                                <button type="submit" style={styles.submitButton}>
                                    <Gift size={20} />
                                    Paketi Sat
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
