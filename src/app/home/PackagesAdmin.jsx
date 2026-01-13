'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Gift, User, Phone, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import Cookies from 'js-cookie';

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    mainContainer: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '20px 16px'
    },
    header: {
        marginBottom: '24px'
    },
    headerTop: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        wordBreak: 'break-word'
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '14px'
    },
    filtersSection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginBottom: '20px'
    },
    filtersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '4px'
    },
    searchContainer: {
        position: 'relative'
    },
    searchInput: {
        paddingLeft: '36px',
        paddingRight: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '13px',
        boxSizing: 'border-box'
    },
    searchIcon: {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af'
    },
    select: {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '8px 10px',
        fontSize: '13px',
        backgroundColor: 'white'
    },
    tableSection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
    },
    tableContainer: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '900px'
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: '500',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    tableRow: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        transition: 'background-color 0.2s ease'
    },
    tableCell: {
        padding: '14px 16px',
        fontSize: '13px'
    },
    statusBadge: {
        padding: '4px 8px',
        fontSize: '11px',
        borderRadius: '9999px',
        fontWeight: '500',
        whiteSpace: 'nowrap'
    },
    statusBadgeActive: {
        backgroundColor: '#dcfce7',
        color: '#166534'
    },
    statusBadgeUsed: {
        backgroundColor: '#fee2e2',
        color: '#991b1b'
    },
    actionButton: {
        padding: '4px',
        color: '#dc2626',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    },
    loading: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    loadingContent: {
        textAlign: 'center'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '2px solid #e5e7eb',
        borderTopColor: '#7c3aed',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto'
    },
    loadingText: {
        marginTop: '12px',
        color: '#6b7280',
        fontSize: '14px'
    }
};

const PackagesAdmin = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const getToken = () => {
        return Cookies.get('authToken');
    };

    const fetchPackages = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(`https://thaiback.onrender.com/api/packages/all/${token}`);
            const data = await response.json();

            if (response.ok) {
                setPackages(data);
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const deletePackage = async (pkgId) => {
        if (!confirm('Bu paketi silmək istədiyinizə əminsiniz?')) {
            return;
        }

        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(`https://thaiback.onrender.com/api/packages/${pkgId}/${token}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Paket uğurla silindi');
                fetchPackages();
            } else {
                alert(data.message || 'Xəta baş verdi');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Xəta baş verdi');
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchPackages();
        }
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('az-AZ');
    };

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch =
            pkg.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.customer?.phone?.includes(searchQuery);

        const matchesStatus = selectedStatus === '' ? true :
            selectedStatus === 'active' ? pkg.active : !pkg.active;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.loadingContent}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Yüklənir...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .table-row:hover {
          background-color: #f9fafb;
        }
        .action-button:hover {
          background-color: #fef2f2;
        }
      `}</style>

            <div style={styles.mainContainer}>
                <div style={styles.header}>
                    <div style={styles.headerTop}>
                        <div>
                            <h1 style={styles.title}>
                                <Gift size={28} color="#7c3aed" />
                                Paketlərin İdarəsi
                            </h1>
                            <p style={styles.subtitle}>Bütün 10 gedişlik paketləri idarə edin</p>
                        </div>
                    </div>
                </div>

                <div style={styles.filtersSection}>
                    <div style={styles.filtersGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Axtarış
                            </label>
                            <div style={styles.searchContainer}>
                                <Search size={16} style={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Müştəri adı və ya nömrəsi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={styles.searchInput}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={styles.select}
                            >
                                <option value="">Bütün paketlər</option>
                                <option value="active">Aktiv</option>
                                <option value="inactive">Bitmiş / Deaktiv</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={styles.tableSection}>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead style={styles.tableHeader}>
                                <tr>
                                    <th style={styles.tableHeaderCell}>Müştəri</th>
                                    <th style={styles.tableHeaderCell}>Telefon</th>
                                    <th style={styles.tableHeaderCell}>Masaj Növü</th>
                                    <th style={styles.tableHeaderCell}>Moddə</th>
                                    <th style={styles.tableHeaderCell}>Gedişlər (Qalan/Cəmi)</th>
                                    <th style={styles.tableHeaderCell}>Qiymət</th>
                                    <th style={styles.tableHeaderCell}>Status</th>
                                    <th style={styles.tableHeaderCell}>Tarix</th>
                                    <th style={styles.tableHeaderCell}>Filial</th>
                                    <th style={styles.tableHeaderCell}>Əməliyyatlar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPackages.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                            Heç bir paket tapılmadı
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPackages.map((pkg) => (
                                        <tr key={pkg._id} style={styles.tableRow} className="table-row">
                                            <td style={styles.tableCell}>
                                                <div style={{ fontWeight: '500', color: '#111827' }}>{pkg.customer?.name}</div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={{ color: '#6b7280' }}>{pkg.customer?.phone}</div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <div style={{ fontWeight: '500', color: '#111827' }}>{pkg.massageType?.name}</div>
                                            </td>
                                            <td style={styles.tableCell}>
                                                {pkg.duration} dəq
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{ fontWeight: '600', color: pkg.remainingVisits > 0 ? '#16a34a' : '#dc2626' }}>
                                                    {pkg.remainingVisits}
                                                </span>
                                                <span style={{ color: '#6b7280' }}> / {pkg.totalVisits}</span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                {pkg.price} AZN
                                            </td>
                                            <td style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    ...(pkg.active ? styles.statusBadgeActive : styles.statusBadgeUsed)
                                                }}>
                                                    {pkg.active ? 'Aktiv' : 'Bitmiş'}
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                {formatDate(pkg.createdAt)}
                                            </td>
                                            <td style={styles.tableCell}>
                                                {pkg.branch?.name}
                                            </td>
                                            <td style={styles.tableCell}>
                                                <button
                                                    onClick={() => deletePackage(pkg._id)}
                                                    style={styles.actionButton}
                                                    className="action-button"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackagesAdmin;
