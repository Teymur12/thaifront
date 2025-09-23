import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CreditCard,
  Banknote,
  Monitor,
  Building2,
  Users
} from 'lucide-react';
import Cookies from 'js-cookie';


export default function Hesabat() {
  const [activeTab, setActiveTab] = useState('gelir');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Form data for modal
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Data states
  const [gelirler, setGelirler] = useState([]);
  const [xercler, setXercler] = useState([]);
  const [randevular, setRandevular] = useState([]);

  // Ödəniş üsulları və kateqoriyalar
  const odenisUsullari = [
    { value: 'cash', label: 'Nağd', icon: <Banknote size={16} /> },
    { value: 'card', label: 'Bank Kartı', icon: <CreditCard size={16} /> },
    { value: 'terminal', label: 'Terminal', icon: <Monitor size={16} /> }
  ];

  const xercKateqoriyalari = [
    'Maaş və Əmək haqqı',
    'Məhsul və Avadanlıq',
    'Kommunal xərclər',
    'Təmizlik məhsulları',
    'Təmir və bərpa',
    'Reklam və marketinq',
    'Digər xərclər'
  ];

  // Get user data from localStorage
 const getUserData = () => {
     const userData = localStorage.getItem('userData');
     return userData ? JSON.parse(userData) : null;
   };
 
   // Token alma funksiyası
   const getToken = () => {
           return Cookies.get('authToken');
     
   };
 

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://thaiback.onrender.com/api';
  const userData = getUserData();

  // Initial data fetch
  useEffect(() => {
    if (userData) {
      fetchAllData();
    }
  }, [selectedDate, dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAppointments(),
        fetchExpenses(),
        fetchTodayAppointments()
      ]);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments (gəlirlər)
  const fetchAppointments = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/appointments/${selectedDate}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const appointments = await response.json();
        const completedAppointments = appointments.filter(apt => apt.status === 'completed');
        setGelirler(completedAppointments.map(apt => ({
          id: apt._id,
          tarix: apt.startTime,
          mebleg: apt.price,
          odenisUsulu: apt.paymentMethod,
          izzahat: `${apt.massageType?.name} - ${apt.customer?.name}`,
          customer: apt.customer,
          masseur: apt.masseur,
          massageType: apt.massageType
        })));
      }
    } catch (error) {
      console.error('Appointments fetch error:', error);
    }
  };

  // Fetch expenses (xərclər)
  const fetchExpenses = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/expenses/date/${selectedDate}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const expenses = await response.json();
        setXercler(expenses.map(expense => ({
          id: expense._id,
          tarix: expense.date,
          mebleg: expense.amount,
          izzahat: expense.description,
          category: expense.category,
          createdBy: expense.createdBy
        })));
      }
    } catch (error) {
      console.error('Expenses fetch error:', error);
    }
  };

  // Fetch today's appointments for overview
  const fetchTodayAppointments = async () => {
    try {
      const token = getToken();
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE}/receptionist/appointments/${today}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const appointments = await response.json();
        setRandevular(appointments);
      }
    } catch (error) {
      console.error('Today appointments fetch error:', error);
    }
  };

  // Add expense
  const addExpense = async () => {
    if (!formData.amount || !formData.description || !formData.category) {
      alert('Bütün sahələri doldurun!');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/expenses/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: formData.category,
          date: formData.date
        })
      });

      if (response.ok) {
        await fetchExpenses();
        closeModal();
        alert('Xərc uğurla əlavə edildi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Xərc əlavə edilmədi'));
      }
    } catch (error) {
      console.error('Add expense error:', error);
      alert('Xərc əlavə edərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Edit expense
  const editExpense = async () => {
    if (!formData.amount || !formData.description || !formData.category) {
      alert('Bütün sahələri doldurun!');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/expenses/${editingItem.id}/${token}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: formData.category,
          date: formData.date
        })
      });

      if (response.ok) {
        await fetchExpenses();
        closeModal();
        alert('Xərc uğurla yeniləndi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Xərc yenilənmədi'));
      }
    } catch (error) {
      console.error('Edit expense error:', error);
      alert('Xərc yeniləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    if (!window.confirm('Bu xərc qeydini silmək istədiyinizdən əminsiniz?')) return;

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/expenses/${id}/${token}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchExpenses();
        alert('Xərc uğurla silindi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Xərc silinmədi'));
      }
    } catch (error) {
      console.error('Delete expense error:', error);
      alert('Xərc silərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Statistikalar
  const totalGelir = gelirler.reduce((sum, item) => sum + item.mebleg, 0);
  const totalXerc = xercler.reduce((sum, item) => sum + item.mebleg, 0);
  const netGelir = totalGelir - totalXerc;

  // Günlük statistikalar
  const todayCompleted = randevular.filter(r => r.status === 'completed').length;
  const todayScheduled = randevular.filter(r => r.status === 'scheduled').length;
  const todayInProgress = randevular.filter(r => r.status === 'in-progress').length;

  // Payment method statistics
  const paymentStats = gelirler.reduce((acc, gelir) => {
    const method = gelir.odenisUsulu || 'unknown';
    acc[method] = (acc[method] || 0) + gelir.mebleg;
    return acc;
  }, {});

  const formatMebleg = (mebleg) => {
    return `${mebleg?.toFixed(2) || '0.00'} ₼`;
  };

  const formatTarix = (tarix) => {
    return new Date(tarix).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleAdd = (type) => {
    if (type === 'gelir') {
      alert('Gəlirlər avtomatik olaraq randevulardan yaranır. Yeni gəlir əlavə etmək üçün randevu tamamlayın.');
      return;
    }

    setModalType('add');
    setEditingType(type);
    setFormData({
      amount: '',
      description: '',
      category: xercKateqoriyalari[0],
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    if (type === 'gelir') {
      alert('Gəlir qeydləri randevulardan yaranır və redaktə edilə bilməz.');
      return;
    }

    setModalType('edit');
    setEditingType(type);
    setEditingItem(item);
    setFormData({
      amount: item.mebleg.toString(),
      description: item.izzahat,
      category: item.category || xercKateqoriyalari[0],
      date: new Date(item.tarix).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (type === 'gelir') {
      alert('Gəlir qeydləri silinə bilməz. Randevu statusunu dəyişdirin.');
      return;
    }

    await deleteExpense(id);
  };

  const handleSave = async () => {
    if (modalType === 'add') {
      await addExpense();
    } else {
      await editExpense();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      amount: '',
      description: '',
      category: xercKateqoriyalari[0],
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getPaymentIcon = (method) => {
    const payment = odenisUsullari.find(p => p.value === method);
    return payment?.icon || <DollarSign size={16} />;
  };

  const getPaymentLabel = (method) => {
    const payment = odenisUsullari.find(p => p.value === method);
    return payment?.label || method;
  };

  const exportData = () => {
    const data = activeTab === 'gelir' ? gelirler : xercler;
    const csvContent = [
      ['ID', 'Tarix', 'Məbləğ', 'İzahat', activeTab === 'gelir' ? 'Ödəniş Üsulu' : 'Kateqoriya'].join(','),
      ...data.map(item => [
        item.id,
        formatTarix(item.tarix),
        item.mebleg,
        `"${item.izzahat}"`,
        activeTab === 'gelir' ? getPaymentLabel(item.odenisUsulu) : item.category
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-${selectedDate}.csv`;
    a.click();
  };

  if (!userData) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.error}>İstifadəçi məlumatları tapılmadı. Zəhmət olmasa yenidən daxil olun.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Building2 size={24} color="#667eea" />
          <div>
            <h1 style={styles.title}>Maliyyə Hesabatı</h1>
            <p style={styles.subtitle}>{userData.branch?.name || 'Filial'}</p>
          </div>
        </div>
        
        <div style={styles.headerRight}>
          <div style={styles.dateSelector}>
            <Calendar size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
          <button onClick={fetchAllData} style={styles.refreshButton} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Yenilə
          </button>
        </div>
      </div>

      {/* Statistik Kartları */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Günlük Gəlir</h3>
            <p style={styles.statValue}>{formatMebleg(totalGelir)}</p>
            <p style={styles.statSubtext}>{gelirler.length} ödəniş</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <TrendingDown size={24} color="#ef4444" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Günlük Xərc</h3>
            <p style={styles.statValue}>{formatMebleg(totalXerc)}</p>
            <p style={styles.statSubtext}>{xercler.length} xərc</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <DollarSign size={24} color={netGelir >= 0 ? "#10b981" : "#ef4444"} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Xalis Gəlir</h3>
            <p style={{
              ...styles.statValue,
              color: netGelir >= 0 ? "#10b981" : "#ef4444"
            }}>
              {formatMebleg(netGelir)}
            </p>
            <p style={styles.statSubtext}>
              {netGelir >= 0 ? 'Mənfəət' : 'Zərər'}
            </p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <Users size={24} color="#3b82f6" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Günlük Randevular</h3>
            <p style={styles.statValue}>{randevular.length}</p>
            <p style={styles.statSubtext}>
              {todayCompleted} tamamlandı, {todayScheduled} təyin edilib
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Stats */}
      {Object.keys(paymentStats).length > 0 && (
        <div style={styles.paymentStatsContainer}>
          <h3 style={styles.paymentStatsTitle}>Ödəniş Üsullarına görə:</h3>
          <div style={styles.paymentStats}>
            {Object.entries(paymentStats).map(([method, amount]) => (
              <div key={method} style={styles.paymentStatItem}>
                {getPaymentIcon(method)}
                <span>{getPaymentLabel(method)}: {formatMebleg(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <div style={styles.tabNav}>
          <button
            onClick={() => setActiveTab('gelir')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'gelir' ? '#667eea' : 'transparent',
              color: activeTab === 'gelir' ? 'white' : '#64748b'
            }}
          >
            <TrendingUp size={18} />
            Gəlirlər ({gelirler.length})
          </button>
          <button
            onClick={() => setActiveTab('xerc')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'xerc' ? '#667eea' : 'transparent',
              color: activeTab === 'xerc' ? 'white' : '#64748b'
            }}
          >
            <TrendingDown size={18} />
            Xərclər ({xercler.length})
          </button>
          
          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button onClick={exportData} style={styles.exportButton}>
              <Download size={16} />
              İxrac Et
            </button>
            <button onClick={() => handleAdd(activeTab)} style={styles.addButton}>
              <Plus size={18} />
              {activeTab === 'gelir' ? 'Gəlir' : 'Xərc'} Əlavə Et
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {loading && (
            <div style={styles.loadingOverlay}>
              <RefreshCw size={24} className="animate-spin" />
              <span>Yüklənir...</span>
            </div>
          )}

          {activeTab === 'gelir' ? (
            // Gəlir Cədvəli
            <div style={styles.tableContainer}>
              {gelirler.length === 0 ? (
                <div style={styles.emptyState}>
                  <TrendingUp size={48} color="#9ca3af" />
                  <h3>Gəlir tapılmadı</h3>
                  <p>Seçilmiş tarixdə tamamlanmış randevu yoxdur</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Tarix</th>
                      <th style={styles.th}>Müştəri</th>
                      <th style={styles.th}>Xidmət</th>
                      <th style={styles.th}>Məbləğ</th>
                      <th style={styles.th}>Ödəniş</th>
                      <th style={styles.th}>Masajist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gelirler.map((gelir) => (
                      <tr key={gelir.id} style={styles.tableRow}>
                        <td style={styles.td}>{formatTarix(gelir.tarix)}</td>
                        <td style={styles.td}>
                          <div>
                            <div style={styles.customerName}>{gelir.customer?.name}</div>
                            <div style={styles.customerPhone}>{gelir.customer?.phone}</div>
                          </div>
                        </td>
                        <td style={styles.td}>{gelir.massageType?.name}</td>
                        <td style={styles.td}>
                          <span style={styles.gelirMebleg}>{formatMebleg(gelir.mebleg)}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.paymentMethod}>
                            {getPaymentIcon(gelir.odenisUsulu)}
                            <span>{getPaymentLabel(gelir.odenisUsulu)}</span>
                          </div>
                        </td>
                        <td style={styles.td}>{gelir.masseur?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={styles.totalRow}>
                      <td style={styles.totalTd} colSpan="3"><strong>Toplam Gəlir:</strong></td>
                      <td style={styles.totalTd}>
                        <strong style={styles.totalGelir}>{formatMebleg(totalGelir)}</strong>
                      </td>
                      <td style={styles.totalTd} colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          ) : (
            // Xərc Cədvəli
            <div style={styles.tableContainer}>
              {xercler.length === 0 ? (
                <div style={styles.emptyState}>
                  <TrendingDown size={48} color="#9ca3af" />
                  <h3>Xərc tapılmadı</h3>
                  <p>Seçilmiş tarixdə xərc qeydi yoxdur</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Tarix</th>
                      <th style={styles.th}>Məbləğ</th>
                      <th style={styles.th}>Kateqoriya</th>
                      <th style={styles.th}>İzahat</th>
                      <th style={styles.th}>Yaradıb</th>
                      <th style={styles.th}>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {xercler.map((xerc) => (
                      <tr key={xerc.id} style={styles.tableRow}>
                        <td style={styles.td}>{formatTarix(xerc.tarix)}</td>
                        <td style={styles.td}>
                          <span style={styles.xercMebleg}>{formatMebleg(xerc.mebleg)}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.category}>{xerc.category}</span>
                        </td>
                        <td style={styles.td}>{xerc.izzahat}</td>
                        <td style={styles.td}>{xerc.createdBy?.name || 'Sistem'}</td>
                        <td style={styles.td}>
                          <div style={styles.actionButtonsCell}>
                            <button
                              onClick={() => handleEdit(xerc, 'xerc')}
                              style={styles.editButton}
                              title="Redaktə et"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(xerc.id, 'xerc')}
                              style={styles.deleteButton}
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={styles.totalRow}>
                      <td style={styles.totalTd}><strong>Toplam Xərc:</strong></td>
                      <td style={styles.totalTd}>
                        <strong style={styles.totalXerc}>{formatMebleg(totalXerc)}</strong>
                      </td>
                      <td style={styles.totalTd} colSpan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {modalType === 'add' ? 'Yeni ' : 'Redaktə et: '}
                {editingType === 'gelir' ? 'Gəlir' : 'Xərc'}
              </h3>
              <button onClick={closeModal} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tarix:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Məbləğ (₼):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={styles.input}
                  placeholder="Məbləği daxil edin"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Kateqoriya:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={styles.select}
                >
                  {xercKateqoriyalari.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>İzahat:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={styles.textarea}
                  placeholder="Xərcin təfərrüatını daxil edin"
                  rows="3"
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelButton} disabled={loading}>
                Ləğv et
              </button>
              <button onClick={handleSave} style={styles.saveButton} disabled={loading}>
                <Save size={16} />
                {loading ? 'Saxlanır...' : 'Yadda Saxla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1400px',
    background: '#f8fafc',
    minHeight: '100vh'
  },

  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },

  error: {
    fontSize: '18px',
    color: '#ef4444'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },

  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  dateSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },

  dateInput: {
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#374151'
  },

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },

  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  statContent: {
    flex: 1
  },

  statTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    margin: '0 0 8px 0'
  },

  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },

  statSubtext: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0
  },

  paymentStatsContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  },

  paymentStatsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 16px 0'
  },

  paymentStats: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },

  paymentStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },

  tabContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },

  tabNav: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
    position: 'relative',
    alignItems: 'center'
  },

  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    borderRadius: '0'
  },

  actionButtons: {
    marginLeft: 'auto',
    padding: '12px 20px',
    display: 'flex',
    gap: '12px'
  },

  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  tabContent: {
    padding: '24px',
    position: 'relative'
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    zIndex: 10
  },

  tableContainer: {
    overflowX: 'auto'
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    color: '#9ca3af'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px'
  },

  tableHeader: {
    background: '#f8fafc'
  },

  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb'
  },

  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s ease'
  },

  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#374151'
  },

  totalRow: {
    borderTop: '2px solid #e5e7eb',
    background: '#f9fafb'
  },

  totalTd: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#374151'
  },

  customerName: {
    fontWeight: '600',
    color: '#1e293b'
  },

  customerPhone: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },

  gelirMebleg: {
    color: '#10b981',
    fontWeight: '600'
  },

  xercMebleg: {
    color: '#ef4444',
    fontWeight: '600'
  },

  totalGelir: {
    color: '#10b981',
    fontSize: '16px'
  },

  totalXerc: {
    color: '#ef4444',
    fontSize: '16px'
  },

  paymentMethod: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  category: {
    background: '#e0e7ff',
    color: '#3730a3',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  },

  actionButtonsCell: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },

  editButton: {
    background: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },

  deleteButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },

  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },

  modalContent: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc'
  },

  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },

  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px'
  },

  modalBody: {
    padding: '24px',
    maxHeight: '60vh',
    overflowY: 'auto'
  },

  formGroup: {
    marginBottom: '20px'
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },

  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    background: 'white',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },

  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc'
  },

  cancelButton: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  saveButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  }
};