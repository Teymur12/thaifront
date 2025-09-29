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
  Download,
  RefreshCw,
  CreditCard,
  Banknote,
  Monitor,
  Building2,
  Users,
  AlertCircle
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function Hesabat() {
  const [activeTab, setActiveTab] = useState('gelir');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [gelirler, setGelirler] = useState([]);
  const [behler, setBehler] = useState([]); // BEH gəlirləri
  const [xercler, setXercler] = useState([]);
  const [randevular, setRandevular] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getUserData = () => {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('LocalStorage error:', error);
      return null;
    }
  };

  const getToken = () => {
    return Cookies.get('authToken');
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://thaiback.onrender.com/api';

  useEffect(() => {
    if (!mounted) return;
    const data = getUserData();
    setUserData(data);
  }, [mounted]);

  useEffect(() => {
    if (mounted && userData) {
      fetchAllData();
    }
  }, [selectedDate, mounted, userData]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAppointments(),
        fetchAdvancePayments(),
        fetchExpenses(),
        fetchTodayAppointments()
      ]);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tamamlanmış randevular - tam və ya qalan ödənişlər
  const fetchAppointments = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/appointments/${selectedDate}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const appointments = await response.json();
        const completedAppointments = appointments.filter(apt => apt.status === 'completed');
        
        setGelirler(completedAppointments.map(apt => {
          // Əgər beh varsa və qalan ödəniş varsa
          const hasAdvance = apt.advancePayment?.amount > 0;
          const remainingAmount = hasAdvance && apt.remainingPayment?.amount 
            ? apt.remainingPayment.amount 
            : (hasAdvance ? 0 : apt.price);
          
          const paymentMethod = hasAdvance && apt.remainingPayment?.paymentMethod
            ? apt.remainingPayment.paymentMethod
            : apt.paymentMethod;

          return {
            id: apt._id,
            tarix: apt.startTime,
            mebleg: remainingAmount,
            odenisUsulu: paymentMethod,
            izzahat: `${apt.massageType?.name} - ${apt.customer?.name}`,
            customer: apt.customer,
            masseur: apt.masseur,
            massageType: apt.massageType,
            hasAdvance: hasAdvance,
            advanceAmount: apt.advancePayment?.amount || 0,
            totalPrice: apt.price
          };
        }));
      }
    } catch (error) {
      console.error('Appointments fetch error:', error);
    }
  };

  // BEH gəlirləri - bugün verilmiş behləri çək
  const fetchAdvancePayments = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/receptionist/advance-payments/date/${selectedDate}/${token}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const appointments = await response.json();
      
      setBehler(appointments.map(apt => ({
        id: apt._id,
        tarix: apt.advancePayment.paidAt,
        mebleg: apt.advancePayment.amount,
        odenisUsulu: apt.advancePayment.paymentMethod,
        izzahat: `BEH - ${apt.massageType?.name} - ${apt.customer?.name}`,
        customer: apt.customer,
        masseur: apt.masseur,
        massageType: apt.massageType,
        appointmentDate: apt.startTime,
        totalPrice: apt.price,
        isBeh: true
      })));
    }
  } catch (error) {
    console.error('Advance payments fetch error:', error);
  }
};

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

  // Statistikalar - BEH daxil
  const totalGelir = gelirler.reduce((sum, item) => sum + item.mebleg, 0);
  const totalBeh = behler.reduce((sum, item) => sum + item.mebleg, 0);
  const totalXerc = xercler.reduce((sum, item) => sum + item.mebleg, 0);
  const totalRevenue = totalGelir + totalBeh; // Ümumi gəlir
  const netGelir = totalRevenue - totalXerc;

  const todayCompleted = randevular.filter(r => r.status === 'completed').length;
  const todayScheduled = randevular.filter(r => r.status === 'scheduled').length;

  // Ödəniş üsullarına görə statistika (gəlir + beh)
  const paymentStats = [...gelirler, ...behler].reduce((acc, gelir) => {
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
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAdd = (type) => {
    if (type === 'gelir') {
      alert('Gəlirlər avtomatik olaraq randevulardan yaranır.');
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
      alert('Gəlir qeydləri redaktə edilə bilməz.');
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
      alert('Gəlir qeydləri silinə bilməz.');
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
    if (typeof window === 'undefined') return;
    
    const data = activeTab === 'gelir' ? [...gelirler, ...behler] : xercler;
    const csvContent = [
      ['Tarix', 'Məbləğ', 'Növ', 'İzahat', activeTab === 'gelir' ? 'Ödəniş' : 'Kateqoriya'].join(','),
      ...data.map(item => [
        formatTarix(item.tarix),
        item.mebleg,
        item.isBeh ? 'BEH' : 'Ödəniş',
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

  if (!mounted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Yüklənir...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: '#ef4444' }}>İstifadəçi məlumatları tapılmadı</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Building2 size={24} color="#667eea" />
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>Maliyyə Hesabatı</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{userData.branch?.name || 'Filial'}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Calendar size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '14px', color: '#374151' }}
            />
          </div>
          <button onClick={fetchAllData} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }} disabled={loading}>
            <RefreshCw size={16} />
            Yenilə
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Ümumi Gəlir</h3>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>{formatMebleg(totalRevenue)}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              {gelirler.length} ödəniş + {behler.length} BEH
            </p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} color="#f59e0b" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>BEH Gəlirləri</h3>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', margin: '0 0 4px 0' }}>{formatMebleg(totalBeh)}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{behler.length} qabaqcadan ödəniş</p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={24} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Günlük Xərc</h3>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>{formatMebleg(totalXerc)}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{xercler.length} xərc</p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: netGelir >= 0 ? '#ecfdf5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} color={netGelir >= 0 ? "#10b981" : "#ef4444"} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Xalis Gəlir</h3>
            <p style={{ fontSize: '28px', fontWeight: '700', color: netGelir >= 0 ? "#10b981" : "#ef4444", margin: '0 0 4px 0' }}>{formatMebleg(netGelir)}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{netGelir >= 0 ? 'Mənfəət' : 'Zərər'}</p>
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      {Object.keys(paymentStats).length > 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>Ödəniş Üsullarına görə:</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {Object.entries(paymentStats).map(([method, amount]) => (
              <div key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                {getPaymentIcon(method)}
                <span>{getPaymentLabel(method)}: {formatMebleg(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('gelir')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              border: 'none',
              background: activeTab === 'gelir' ? '#667eea' : 'transparent',
              color: activeTab === 'gelir' ? 'white' : '#64748b',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <TrendingUp size={18} />
            Gəlirlər ({gelirler.length + behler.length})
          </button>
          <button
            onClick={() => setActiveTab('xerc')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              border: 'none',
              background: activeTab === 'xerc' ? '#667eea' : 'transparent',
              color: activeTab === 'xerc' ? 'white' : '#64748b',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <TrendingDown size={18} />
            Xərclər ({xercler.length})
          </button>
          
          <div style={{ marginLeft: 'auto', padding: '12px 20px', display: 'flex', gap: '12px' }}>
            <button onClick={exportData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
              <Download size={16} />
              İxrac Et
            </button>
            <button onClick={() => handleAdd(activeTab)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              <Plus size={18} />
              {activeTab === 'gelir' ? 'Gəlir' : 'Xərc'} Əlavə Et
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <RefreshCw size={24} />
              <span style={{ marginLeft: '12px' }}>Yüklənir...</span>
            </div>
          )}

          {activeTab === 'gelir' ? (
            <div>
              {gelirler.length === 0 && behler.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                  <TrendingUp size={48} />
                  <h3>Gəlir tapılmadı</h3>
                  <p>Seçilmiş tarixdə gəlir yoxdur</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Növ</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Müştəri</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Xidmət</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Məbləğ</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Ödəniş</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* BEH gəlirləri */}
                    {behler.map((beh) => (
                      <tr key={`beh-${beh.id}`} style={{ borderBottom: '1px solid #f3f4f6', background: '#fef3c7' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>{formatTarix(beh.tarix)}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <span style={{ background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>BEH</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{beh.customer?.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{beh.customer?.phone}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <div>
                            <div>{beh.massageType?.name}</div>
                            <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>
                              Randevu: {new Date(beh.appointmentDate).toLocaleDateString('az-AZ')}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <span style={{ color: '#f59e0b', fontWeight: '600' }}>{formatMebleg(beh.mebleg)}</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getPaymentIcon(beh.odenisUsulu)}
                            <span>{getPaymentLabel(beh.odenisUsulu)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Normal gəlirlər */}
                    {gelirler.map((gelir) => (
                      <tr key={gelir.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>{formatTarix(gelir.tarix)}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          {gelir.hasAdvance ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>QALAN</span>
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>BEH: {formatMebleg(gelir.advanceAmount)}</span>
                            </div>
                          ) : (
                            <span style={{ background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>TAM</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{gelir.customer?.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{gelir.customer?.phone}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <div>
                            <div>{gelir.massageType?.name}</div>
                            {gelir.hasAdvance && (
                              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                Ümumi: {formatMebleg(gelir.totalPrice)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <span style={{ color: '#10b981', fontWeight: '600' }}>{formatMebleg(gelir.mebleg)}</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getPaymentIcon(gelir.odenisUsulu)}
                            <span>{getPaymentLabel(gelir.odenisUsulu)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }} colSpan="4"><strong>Toplam Gəlir:</strong></td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                        <strong style={{ color: '#10b981', fontSize: '16px' }}>{formatMebleg(totalRevenue)}</strong>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          ) : (
            <div>
              {xercler.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                  <TrendingDown size={48} />
                  <h3>Xərc tapılmadı</h3>
                  <p>Seçilmiş tarixdə xərc yoxdur</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Tarix</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Məbləğ</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Kateqoriya</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>İzahat</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Yaradıb</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {xercler.map((xerc) => (
                      <tr key={xerc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>{formatTarix(xerc.tarix)}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <span style={{ color: '#ef4444', fontWeight: '600' }}>{formatMebleg(xerc.mebleg)}</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{xerc.category}</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>{xerc.izzahat}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>{xerc.createdBy?.name || 'Sistem'}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(xerc, 'xerc')}
                              style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Redaktə et"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(xerc.id, 'xerc')}
                              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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
                    <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}><strong>Toplam Xərc:</strong></td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                        <strong style={{ color: '#ef4444', fontSize: '16px' }}>{formatMebleg(totalXerc)}</strong>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }} colSpan="4"></td>
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {modalType === 'add' ? 'Yeni ' : 'Redaktə et: '}
                {editingType === 'gelir' ? 'Gəlir' : 'Xərc'}
              </h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Tarix:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Məbləğ (₼):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="Məbləği daxil edin"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Kateqoriya:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
                >
                  {xercKateqoriyalari.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>İzahat:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  placeholder="Xərcin təfərrüatını daxil edin"
                  rows="3"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button onClick={closeModal} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }} disabled={loading}>
                Ləğv et
              </button>
              <button onClick={handleSave} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loading}>
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