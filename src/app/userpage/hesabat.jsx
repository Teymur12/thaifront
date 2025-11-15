import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Plus, Edit, Trash2, Save, X, Download, RefreshCw, CreditCard, Banknote, Monitor, Building2, AlertCircle } from 'lucide-react';
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
  const [behler, setBehler] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [xercler, setXercler] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const xercKateqoriyalari = ['Maaş və Əmək haqqı', 'Məhsul və Avadanlıq', 'Kommunal xərclər', 'Təmizlik məhsulları', 'Təmir və bərpa', 'Reklam və marketinq', 'Digər xərclər'];

  const getUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  };

  const getToken = () => Cookies.get('authToken');
  const API_BASE = 'https://thaiback.onrender.com/api';

  useEffect(() => {
    if (!mounted) return;
    setUserData(getUserData());
  }, [mounted]);

  useEffect(() => {
    if (mounted && userData) fetchAllData();
  }, [selectedDate, mounted, userData]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAppointments(), fetchAdvancePayments(), fetchGiftCards(), fetchExpenses()]);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

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
          const hasAdvance = apt.advancePayment?.amount > 0;
          
          let paymentDetails = {};
          
          if (apt.paymentType === 'mixed' && apt.remainingPayment) {
            paymentDetails = {
              isMixed: true,
              cash: apt.remainingPayment.cash || 0,
              card: apt.remainingPayment.card || 0,
              terminal: apt.remainingPayment.terminal || 0,
              total: (apt.remainingPayment.cash || 0) + (apt.remainingPayment.card || 0) + (apt.remainingPayment.terminal || 0)
            };
          } else {
            const remainingAmount = hasAdvance 
              ? (apt.price - apt.advancePayment.amount) 
              : apt.price;
            
            const paymentMethod = hasAdvance && apt.remainingPayment?.paymentMethod
              ? apt.remainingPayment.paymentMethod
              : apt.paymentMethod;
            
            paymentDetails = {
              isMixed: false,
              paymentMethod: paymentMethod,
              amount: remainingAmount
            };
          }

          return {
            id: apt._id,
            tarix: apt.startTime,
            ...paymentDetails,
            izzahat: `${apt.massageType?.name} - ${apt.customer?.name}`,
            customer: apt.customer,
            masseur: apt.masseur,
            massageType: apt.massageType,
            hasAdvance: hasAdvance,
            advanceAmount: apt.advancePayment?.amount || 0,
            totalPrice: apt.price,
            tips: apt.tips || null
          };
        }));
      }
    } catch (error) {
      console.error('Appointments fetch error:', error);
    }
  };

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

  const fetchGiftCards = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/gift-cards/date/${selectedDate}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const cards = await response.json();
        setGiftCards(cards.map(card => ({
          id: card._id,
          tarix: card.purchaseDate,
          mebleg: card.originalPrice,
          odenisUsulu: card.paymentMethod || 'cash',
          izzahat: `Hədiyyə Kartı - ${card.massageType?.name} (${card.duration}dəq) - ${card.purchasedBy?.name}`,
          customer: card.purchasedBy,
          massageType: card.massageType,
          duration: card.duration,
          cardNumber: card.cardNumber,
          isGiftCard: true
        })));
      }
    } catch (error) {
      console.error('Gift cards fetch error:', error);
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

  const calculatePaymentStats = () => {
    const stats = { cash: 0, card: 0, terminal: 0 };
    
    behler.forEach(beh => {
      if (beh.odenisUsulu === 'cash') stats.cash += beh.mebleg;
      if (beh.odenisUsulu === 'card') stats.card += beh.mebleg;
      if (beh.odenisUsulu === 'terminal') stats.terminal += beh.mebleg;
    });
    
    giftCards.forEach(card => {
      if (card.odenisUsulu === 'cash') stats.cash += card.mebleg;
      if (card.odenisUsulu === 'card') stats.card += card.mebleg;
      if (card.odenisUsulu === 'terminal') stats.terminal += card.mebleg;
    });
    
    gelirler.forEach(gelir => {
      if (gelir.isMixed) {
        stats.cash += gelir.cash || 0;
        stats.card += gelir.card || 0;
        stats.terminal += gelir.terminal || 0;
      } else {
        const amount = gelir.amount || 0;
        if (gelir.paymentMethod === 'cash') stats.cash += amount;
        if (gelir.paymentMethod === 'card') stats.card += amount;
        if (gelir.paymentMethod === 'terminal') stats.terminal += amount;
      }
    });
    
    return stats;
  };

  const calculateTotalRevenue = () => {
    let total = 0;
    total += behler.reduce((sum, beh) => sum + beh.mebleg, 0);
    total += giftCards.reduce((sum, card) => sum + card.mebleg, 0);
    
    gelirler.forEach(gelir => {
      if (gelir.isMixed) {
        total += (gelir.cash || 0) + (gelir.card || 0) + (gelir.terminal || 0);
      } else {
        total += gelir.amount || 0;
      }
    });
    
    return total;
  };

  const calculateTotalTips = () => {
    let totalTips = 0;
    gelirler.forEach(gelir => {
      if (gelir.tips && gelir.tips.amount) {
        totalTips += gelir.tips.amount;
      }
    });
    return totalTips;
  };

  const paymentStats = calculatePaymentStats();
  const totalRevenue = calculateTotalRevenue();
  const totalBeh = behler.reduce((sum, beh) => sum + beh.mebleg, 0);
  const totalGiftCards = giftCards.reduce((sum, card) => sum + card.mebleg, 0);
  const totalXerc = xercler.reduce((sum, xerc) => sum + xerc.mebleg, 0);
  const netGelir = totalRevenue - totalXerc;
  const totalTips = calculateTotalTips();

  const formatMebleg = (mebleg) => `${mebleg?.toFixed(2) || '0.00'} ₼`;
  
  const formatTarix = (tarix) => {
    return new Date(tarix).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentIcon = (method) => {
    const icons = {
      cash: <Banknote size={16} />,
      card: <CreditCard size={16} />,
      terminal: <Monitor size={16} />
    };
    return icons[method] || <DollarSign size={16} />;
  };

  const getPaymentLabel = (method) => {
    const labels = { cash: 'Nağd', card: 'Bank Kartı', terminal: 'Terminal' };
    return labels[method] || method;
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

  const exportData = () => {
    if (typeof window === 'undefined') return;
    
    const allGelirler = [...gelirler, ...behler, ...giftCards];
    const ctcTotal = paymentStats.card;
    const negdTotal = paymentStats.cash;
    const cardTotal = paymentStats.terminal;
    const umumiGiris = totalRevenue;
    const umumiKart = ctcTotal + cardTotal;
    const qaliqNegd = negdTotal - totalXerc;

    let wordContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Hesabat</title>
<style>
  @page { size: A4; margin: 1cm 1.5cm; }
  body { font-family: Calibri, Arial; font-size: 9pt; margin: 0; padding: 0; }
  .header { text-align: center; margin-bottom: 10px; }
  .header h2 { margin: 0; font-size: 14pt; }
  table { width: 100%; border-collapse: collapse; margin: 5px 0; }
  td, th { border: 1px solid black; padding: 3px 4px; font-size: 8pt; }
  th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
  .gift-card-row { background-color: #dbeafe; }
  .mixed-payment { background-color: #fef3c7; }
  .signatures { margin-top: 15px; }
  .signatures p { margin: 5px 0; font-size: 8pt; }
</style>
</head>
<body>
  <div class="header">
    <h2>${userData?.branch?.name || 'Filial'} - Tarix: ${new Date(selectedDate).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</h2>
  </div>

  <table style="width: 100%; margin-bottom: 8px;">
    <tr>
      <td style="width: 50%; border: none;">
        <b>Ümumi giriş:</b> ${umumiGiris.toFixed(0)}<br>
        <b>Nəğd pul:</b> ${negdTotal.toFixed(0)}<br>
        <b>Xərclər:</b> ${totalXerc.toFixed(0)}<br>
        <b>Qalıq nəğd:</b> ${qaliqNegd.toFixed(0)}
      </td>
      <td style="width: 50%; border: none;">
        <b>Ümumi kart:</b> ${umumiKart.toFixed(0)}<br>
        <b>Terminal:</b> ${cardTotal.toFixed(0)}<br>
        <b>Kart to kart:</b> ${ctcTotal.toFixed(0)}<br>
        ${totalTips > 0 ? `<b>Bahşiş:</b> ${totalTips.toFixed(0)}` : ''}
      </td>
    </tr>
  </table>

  <table>
    <thead>
      <tr>
        <th style="width: 8%;">Saat</th>
        <th style="width: 44%;">Xidmət</th>
        <th style="width: 10%;">ctc</th>
        <th style="width: 10%;">negd</th>
        <th style="width: 10%;">card</th>
        <th style="width: 10%;">ÜMUMİ</th>
      </tr>
    </thead>
    <tbody>`;

    allGelirler.sort((a, b) => new Date(a.tarix) - new Date(b.tarix)).forEach(gelir => {
      const time = new Date(gelir.tarix).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
      let service = '';
      let ctc = '';
      let negd = '';
      let card = '';
      let umumi = '';
      
      if (gelir.isGiftCard) {
        service = `Hədiyyə Kartı - ${gelir.massageType?.name || 'Xidmət'} (${gelir.duration}dəq)`;
        if (gelir.odenisUsulu === 'card') ctc = gelir.mebleg.toFixed(0);
        if (gelir.odenisUsulu === 'cash') negd = gelir.mebleg.toFixed(0);
        if (gelir.odenisUsulu === 'terminal') card = gelir.mebleg.toFixed(0);
        umumi = gelir.mebleg.toFixed(0);
      } else if (gelir.isBeh) {
        service = `BEH - ${gelir.massageType?.name || 'Xidmət'}`;
        if (gelir.odenisUsulu === 'card') ctc = gelir.mebleg.toFixed(0);
        if (gelir.odenisUsulu === 'cash') negd = gelir.mebleg.toFixed(0);
        if (gelir.odenisUsulu === 'terminal') card = gelir.mebleg.toFixed(0);
        umumi = gelir.mebleg.toFixed(0);
      } else if (gelir.isMixed) {
        service = `${gelir.massageType?.name || 'Xidmət'} (Qarışıq)`;
        ctc = gelir.card > 0 ? gelir.card.toFixed(0) : '';
        negd = gelir.cash > 0 ? gelir.cash.toFixed(0) : '';
        card = gelir.terminal > 0 ? gelir.terminal.toFixed(0) : '';
        umumi = gelir.total.toFixed(0);
      } else {
        service = `${gelir.massageType?.name || 'Xidmət'}`;
        if (gelir.paymentMethod === 'card') ctc = gelir.amount.toFixed(0);
        if (gelir.paymentMethod === 'cash') negd = gelir.amount.toFixed(0);
        if (gelir.paymentMethod === 'terminal') card = gelir.amount.toFixed(0);
        umumi = gelir.amount.toFixed(0);
      }
      
      wordContent += `
      <tr${gelir.isGiftCard ? ' class="gift-card-row"' : (gelir.isMixed ? ' class="mixed-payment"' : '')}>
        <td style="text-align: center;">${time}</td>
        <td>${service}</td>
        <td style="text-align: right;">${ctc}</td>
        <td style="text-align: right;">${negd}</td>
        <td style="text-align: right;">${card}</td>
        <td style="text-align: right;">${umumi}</td>
      </tr>`;
    });

    if (xercler.length > 0) {
      wordContent += `
        <tr style="background: #fff3cd;">
          <td colspan="6" style="text-align: center; font-weight: bold; padding: 8px;">XƏRCLƏR</td>
        </tr>`;
      xercler.forEach(xerc => {
        wordContent += `
        <tr style="background: #fff3cd;">
          <td style="text-align: center;">${new Date(xerc.tarix).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${xerc.category} - ${xerc.izzahat}</td>
          <td style="text-align: right;"></td>
          <td style="text-align: right;">${xerc.mebleg.toFixed(0)}</td>
          <td style="text-align: right;"></td>
          <td style="text-align: right;">${xerc.mebleg.toFixed(0)}</td>
        </tr>`;
      });
    }

    wordContent += `
      <tr style="background-color: #f0f0f0; font-weight: bold;">
        <td colspan="2" style="text-align: right; padding-right: 10px;">TOPLAM:</td>
        <td style="text-align: right;">${ctcTotal.toFixed(0)}</td>
        <td style="text-align: right;">${negdTotal.toFixed(0)}</td>
        <td style="text-align: right;">${cardTotal.toFixed(0)}</td>
        <td style="text-align: right;">${umumiGiris.toFixed(0)}</td>
      </tr>
    </tbody>
  </table>

  <div class="signatures">
    <p><b>Təhvil verdi:</b> _________________________________ <b>İmza:</b> _______</p>
    <p><b>Təhvil aldı:</b> _________________________________ <b>İmza:</b> _______</p>
  </div>
</body>
</html>`;

    const blob = new Blob(['\ufeff', wordContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hesabat-${selectedDate}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!mounted || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div>Yüklənir...</div></div>;
  }

  if (!userData) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div style={{ color: '#ef4444' }}>İstifadəçi məlumatları tapılmadı</div></div>;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', background: '#f8fafc', minHeight: '100vh' }}>
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
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '14px', color: '#374151' }} />
          </div>
          <button onClick={fetchAllData} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}>
            <RefreshCw size={16} />
            Yenilə
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Ümumi Gəlir</h3>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>{formatMebleg(totalRevenue)}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{gelirler.length} ödəniş + {behler.length} BEH + {giftCards.length} kart</p>
          </div>
        </div>

        {totalTips > 0 && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Ümumi Bahşiş</h3>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6', margin: '0 0 4px 0' }}>{formatMebleg(totalTips)}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Əlavə gəlir</p>
            </div>
          </div>
        )}

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

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>Ödəniş Üsullarına görə:</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#059669' }}>
            <Banknote size={16} />
            <span>Nağd: {formatMebleg(paymentStats.cash)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#3b82f6' }}>
            <CreditCard size={16} />
            <span>Bank Kartı: {formatMebleg(paymentStats.card)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f3ff', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#8b5cf6' }}>
            <Monitor size={16} />
            <span>Terminal: {formatMebleg(paymentStats.terminal)}</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('gelir')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px', border: 'none', background: activeTab === 'gelir' ? '#667eea' : 'transparent', color: activeTab === 'gelir' ? 'white' : '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            <TrendingUp size={18} />
            Gəlirlər ({gelirler.length + behler.length + giftCards.length})
          </button>
          <button onClick={() => setActiveTab('xerc')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px', border: 'none', background: activeTab === 'xerc' ? '#667eea' : 'transparent', color: activeTab === 'xerc' ? 'white' : '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
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
          {activeTab === 'gelir' ? (
            <div>
              {gelirler.length === 0 && behler.length === 0 && giftCards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                  <TrendingUp size={48} style={{ margin: '0 auto 16px' }} />
                  <h3>Gəlir tapılmadı</h3>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Tarix</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Növ</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>İzahat</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Məbləğ</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Ödəniş</th>
                    </tr>
                  </thead>
                  <tbody>
                    {behler.map(beh => (
                      <tr key={`beh-${beh.id}`} style={{ borderBottom: '1px solid #f3f4f6', background: '#fef3c7' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>{formatTarix(beh.tarix)}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>BEH</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>{beh.izzahat}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>{formatMebleg(beh.mebleg)}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getPaymentIcon(beh.odenisUsulu)}
                            <span>{getPaymentLabel(beh.odenisUsulu)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {giftCards.map(card => (
                      <tr key={`gift-${card.id}`} style={{ borderBottom: '1px solid #f3f4f6', background: '#dbeafe' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>{formatTarix(card.tarix)}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>HƏDİYYƏ</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>{card.izzahat}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#3b82f6', fontWeight: '600' }}>{formatMebleg(card.mebleg)}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getPaymentIcon(card.odenisUsulu)}
                            <span>{getPaymentLabel(card.odenisUsulu)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {gelirler.map(gelir => (
                      <tr key={gelir.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>{formatTarix(gelir.tarix)}</td>
                        <td style={{ padding: '16px 20px' }}>
                          {gelir.hasAdvance ? (
                            <span style={{ background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>QALAN</span>
                          ) : (
                            <span style={{ background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>TAM</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                          <div>
                            <div>{gelir.izzahat}</div>
                            {gelir.tips && gelir.tips.amount > 0 && (
                              <div style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '4px', fontWeight: '600' }}>
                                + Bahşiş: {formatMebleg(gelir.tips.amount)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                          {gelir.isMixed ? (
                            <div>
                              <div style={{ color: '#10b981', fontWeight: '600' }}>{formatMebleg(gelir.total)}</div>
                              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Qarışıq ödəniş</div>
                            </div>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: '600' }}>{formatMebleg(gelir.amount)}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                          {gelir.isMixed ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {gelir.cash > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                  <Banknote size={14} />
                                  <span>Nağd: {formatMebleg(gelir.cash)}</span>
                                </div>
                              )}
                              {gelir.card > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                  <CreditCard size={14} />
                                  <span>Kart: {formatMebleg(gelir.card)}</span>
                                </div>
                              )}
                              {gelir.terminal > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                  <Monitor size={14} />
                                  <span>Terminal: {formatMebleg(gelir.terminal)}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {getPaymentIcon(gelir.paymentMethod)}
                              <span>{getPaymentLabel(gelir.paymentMethod)}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                      <td colSpan="3" style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>Toplam Gəlir:</td>
                      <td style={{ padding: '16px 20px', fontSize: '16px', color: '#10b981', fontWeight: '700' }}>{formatMebleg(totalRevenue)}</td>
                      <td></td>
                    </tr>
                    {totalTips > 0 && (
                      <tr style={{ background: '#f9fafb' }}>
                        <td colSpan="3" style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>Ümumi Bahşiş:</td>
                        <td style={{ padding: '16px 20px', fontSize: '16px', color: '#8b5cf6', fontWeight: '700' }}>+ {formatMebleg(totalTips)}</td>
                        <td></td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              )}
            </div>
          ) : (
            <div>
              {xercler.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                  <TrendingDown size={48} style={{ margin: '0 auto 16px' }} />
                  <h3>Xərc tapılmadı</h3>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Tarix</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Məbləğ</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Kateqoriya</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>İzahat</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {xercler.map(xerc => (
                      <tr key={xerc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>{formatTarix(xerc.tarix)}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>{formatMebleg(xerc.mebleg)}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                          <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{xerc.category}</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>{xerc.izzahat}</td>
                        <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEdit(xerc, 'xerc')} style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Redaktə et">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(xerc.id, 'xerc')} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Sil">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>Toplam Xərc:</td>
                      <td style={{ padding: '16px 20px', fontSize: '16px', color: '#ef4444', fontWeight: '700' }}>{formatMebleg(totalXerc)}</td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

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
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Məbləğ (₼):</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Məbləği daxil edin" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Kateqoriya:</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}>
                  {xercKateqoriyalari.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>İzahat:</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Xərcin təfərrüatını daxil edin" rows="3" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button onClick={closeModal} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }} disabled={loading}>Ləğv et</button>
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
