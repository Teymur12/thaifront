import { useState, useEffect } from 'react';
import { Building2, ChevronLeft, ChevronRight, Plus, Edit, Save, X, Calendar, User, Users, CreditCard, Banknote, Monitor, CheckCircle, Clock, Gift, DollarSign, MoreVertical, Ban, Unlock } from 'lucide-react';
import Cookies from 'js-cookie';

export default function CompleteAppointment() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [masseurs, setMasseurs] = useState([]);
  const [massageTypes, setMassageTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ customer: '', masseur: '', massageType: '', duration: '', price: 0, startTime: '', notes: '', giftCard: null, advancePayment: { amount: 0, paymentMethod: '' } });
  const [customerFormData, setCustomerFormData] = useState({ name: '', phone: '', notes: '' });
  const [searchPhone, setSearchPhone] = useState('');
  const [foundCustomers, setFoundCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [validatingGiftCard, setValidatingGiftCard] = useState(false);
  const [giftCardError, setGiftCardError] = useState('');
  const [showAdvancePayment, setShowAdvancePayment] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceMethod, setAdvanceMethod] = useState('');
  const [userData, setUserData] = useState(null);
  const [userBranch, setUserBranch] = useState(null);
  const [showMasseurMenu, setShowMasseurMenu] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedMasseurForBlock, setSelectedMasseurForBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [allMasseurs, setAllMasseurs] = useState([]);
  const [blockedMasseursForToday, setBlockedMasseursForToday] = useState([]);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [completedCustomerName, setCompletedCustomerName] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('single');
  const [singlePaymentMethod, setSinglePaymentMethod] = useState('');
  const [mixedPayments, setMixedPayments] = useState({ cash: '', card: '', terminal: '' });
  const [tipMode, setTipMode] = useState(false);
  const [tips, setTips] = useState({ cash: '', card: '', terminal: '' });

  const API_BASE = 'https://thaiback.onrender.com/api';

  useEffect(() => { setMounted(true); }, []);

  const getUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  };



  const getToken = () => Cookies.get('authToken');

  useEffect(() => {
    if (!mounted) return;
    const data = getUserData();
    setUserData(data);
    setUserBranch(data?.branch);
  }, [mounted]);

  useEffect(() => {
    if (mounted && userData && userBranch) fetchInitialData();
  }, [mounted, userData, userBranch]);

  useEffect(() => {
    if (mounted && userData && userBranch) fetchMasseursForDate();
  }, [selectedDate, mounted, userData, userBranch]);

  useEffect(() => {
    if (mounted && userData && userBranch) fetchDayAppointments();
  }, [selectedDate, masseurs, blockedMasseursForToday, mounted, userData, userBranch]);

  const generateTimeSlots = () => {
    const slots = [];
    let hour = 10, minute = 30;
    while (hour < 24 || (hour === 24 && minute === 0)) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      minute += 15;
      if (minute >= 60) { minute = 0; hour += 1; }
    }
    return slots;
  };

  const hours = generateTimeSlots();

  const filterActiveMasseurs = (allMasseurs) => {
    const currentDate = new Date(selectedDate);
    currentDate.setHours(0, 0, 0, 0);
    return allMasseurs.filter(masseur => {
      if (!masseur.blockedDates || masseur.blockedDates.length === 0) return true;
      const isBlocked = masseur.blockedDates.some(blocked => {
        const blockedDate = new Date(blocked.date);
        blockedDate.setHours(0, 0, 0, 0);
        return blockedDate.getTime() === currentDate.getTime();
      });
      return !isBlocked;
    });
  };

  const checkIfMasseurBlocked = (masseur) => {
    if (!masseur.blockedDates || masseur.blockedDates.length === 0) return false;
    const currentDate = new Date(selectedDate);
    currentDate.setHours(0, 0, 0, 0);
    return masseur.blockedDates.some(blocked => {
      const blockedDate = new Date(blocked.date);
      blockedDate.setHours(0, 0, 0, 0);
      return blockedDate.getTime() === currentDate.getTime();
    });
  };

  const fetchMasseursForDate = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/masseurs/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const masseursData = await response.json();
        setAllMasseurs(masseursData);
        setMasseurs(filterActiveMasseurs(masseursData));
        setBlockedMasseursForToday(masseursData.filter(m => checkIfMasseurBlocked(m)));
      }
    } catch (error) {
      console.error('Fetch masseurs error:', error);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const [customersRes, masseursRes, massageTypesRes] = await Promise.all([
        fetch(`${API_BASE}/receptionist/customers/${token}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/receptionist/masseurs/${token}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/receptionist/massage-types/${token}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (customersRes.ok) setCustomers(await customersRes.json());
      if (masseursRes.ok) setMasseurs(filterActiveMasseurs(await masseursRes.json()));
      if (massageTypesRes.ok) setMassageTypes(await massageTypesRes.json());
    } catch (error) {
      console.error('Initial data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayAppointments = async () => {
    try {
      const token = getToken();
      const dateString = formatDateForAPI(selectedDate);
      const response = await fetch(`${API_BASE}/receptionist/appointments/${dateString}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setAppointments(await response.json());
    } catch (error) {
      console.error('Fetch appointments error:', error);
    }
  };

  const completeAppointment = async () => {
    if (!selectedAppointment) return;
    setLoading(true);
    try {
      const token = getToken();
      const paymentData = {};
      
      if (paymentMode === 'mixed') {
        const totalMixed = parseFloat(mixedPayments.cash || 0) + parseFloat(mixedPayments.card || 0) + parseFloat(mixedPayments.terminal || 0);
        const expectedAmount = selectedAppointment.advancePayment?.amount > 0 ? selectedAppointment.price - selectedAppointment.advancePayment.amount : selectedAppointment.price;
        
        if (Math.abs(totalMixed - expectedAmount) > 0.01) {
          alert(`Ödəniş məbləği düzgün deyil! Ödənilməli: ${expectedAmount} AZN, Daxil edilən: ${totalMixed} AZN`);
          setLoading(false);
          return;
        }
        
        paymentData.payments = { cash: parseFloat(mixedPayments.cash || 0), card: parseFloat(mixedPayments.card || 0), terminal: parseFloat(mixedPayments.terminal || 0) };
        paymentData.paymentType = 'mixed';
      } else {
        paymentData.paymentMethod = singlePaymentMethod;
        paymentData.paymentType = singlePaymentMethod;
      }
      
      if (tipMode) {
        const totalTips = parseFloat(tips.cash || 0) + parseFloat(tips.card || 0) + parseFloat(tips.terminal || 0);
        if (totalTips > 0) {
          paymentData.tips = { cash: parseFloat(tips.cash || 0), card: parseFloat(tips.card || 0), terminal: parseFloat(tips.terminal || 0) };
        }
      }
      
      const response = await fetch(`${API_BASE}/receptionist/appointments/${selectedAppointment._id}/complete/${token}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const result = await response.json();
        await fetchDayAppointments();
        setShowPaymentModal(false);
        setShowAppointmentModal(false);
        setPaymentMode('single');
        setSinglePaymentMethod('');
        setMixedPayments({ cash: '', card: '', terminal: '' });
        setTipMode(false);
        setTips({ cash: '', card: '', terminal: '' });
        
        if (result.whatsappLink) {
          setWhatsappLink(result.whatsappLink);
          setCompletedCustomerName(selectedAppointment.customer?.name || 'Müştəri');
          setShowWhatsAppModal(true);
        } else {
          alert('Randevu tamamlandı və ödəniş qeydə alındı!');
        }
        setSelectedAppointment(null);
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Randevu tamamlanmadı'));
      }
    } catch (error) {
      console.error('Complete appointment error:', error);
      alert('Randevu tamamlanarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const isTimeSlotOccupied = (masseurId, time) => {
    const [hour, minute] = time.split(':');
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
    return appointments.find(appointment => {
      const appointmentStart = new Date(appointment.startTime);
      const appointmentEnd = new Date(appointment.endTime);
      const sameMasseur = appointment.masseur?._id === masseurId || appointment.masseur === masseurId;
      return sameMasseur && slotDateTime >= appointmentStart && slotDateTime < appointmentEnd;
    });
  };

  const openAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const getPaymentMethodDisplay = (method) => {
    const displays = {
      cash: { icon: <Banknote size={16} />, text: 'Nağd', color: '#059669' },
      card: { icon: <CreditCard size={16} />, text: 'Kart', color: '#3b82f6' },
      terminal: { icon: <Monitor size={16} />, text: 'Terminal', color: '#8b5cf6' }
    };
    return displays[method] || { icon: <Clock size={16} />, text: 'Gözləyir', color: '#f59e0b' };
  };

  const getStatusDisplay = (status) => {
    const displays = {
      completed: { icon: <CheckCircle size={14} />, text: 'Tamamlandı', color: '#059669' },
      scheduled: { icon: <Calendar size={14} />, text: 'Təyin edilib', color: '#3b82f6' },
      cancelled: { icon: <X size={14} />, text: 'Ləğv edilib', color: '#ef4444' }
    };
    return displays[status] || { icon: <Clock size={14} />, text: 'Bilinmir', color: '#6b7280' };
  };

  if (!mounted || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div>Yüklənir...</div></div>;
  }

  if (!userBranch) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div style={{ color: '#ef4444'}}>Filial məlumatı tapılmadı</div></div>;
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '20px', fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building2 size={24} color="#667eea" />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{userBranch.name} - Günlük Cədvəl</h2>
          <h2>İşçi : {userData.name}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => changeDate(-1)} style={{ padding: '12px 16px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ padding: '12px 20px', backgroundColor: '#667eea', borderRadius: '8px', color: 'white' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{formatDateDisplay(selectedDate)}</h2>
          </div>
          <button onClick={() => changeDate(1)} style={{ padding: '12px 16px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${masseurs.length}, 1fr)`, gap: '1px', backgroundColor: '#e2e8f0' }}>
          <div style={{ padding: '16px', backgroundColor: '#f1f5f9', fontWeight: '600', color: '#475569', textAlign: 'center' }}>Saat</div>
          {masseurs.map((masseur) => (
            <div key={masseur._id} style={{ padding: '16px', backgroundColor: '#667eea', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>{masseur.name}</div>
            </div>
          ))}
          {hours.map((timeSlot) => (
            <div key={timeSlot} style={{ display: 'contents' }}>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>{timeSlot}</span>
              </div>
              {masseurs.map((masseur) => {
                const appointment = isTimeSlotOccupied(masseur._id, timeSlot);
                return (
                  <div 
                    key={`${masseur._id}-${timeSlot}`}
                    style={{ padding: '8px', backgroundColor: appointment ? '#e0f2fe' : '#ffffff', border: '1px solid #e5e7eb', cursor: 'pointer', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => appointment && openAppointmentModal(appointment)}
                  >
                    {appointment ? (
                      <div style={{ width: '100%', fontSize: '11px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{appointment.customer?.name}</div>
                        <div style={{ color: '#64748b', fontSize: '10px' }}>{appointment.massageType?.name}</div>
                        <div style={{ fontWeight: '600', color: '#059669', fontSize: '11px' }}>{appointment.price} AZN</div>
                      </div>
                    ) : (
                      <Plus size={16} color="#9ca3af" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Randevu Təfərrüatları</h3>
              <button onClick={() => setShowAppointmentModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '12px' }}><strong>Müştəri:</strong> {selectedAppointment.customer?.name}</div>
              <div style={{ marginBottom: '12px' }}><strong>Telefon:</strong> {selectedAppointment.customer?.phone}</div>
              <div style={{ marginBottom: '12px' }}><strong>Masajist:</strong> {selectedAppointment.masseur?.name}</div>
              <div style={{ marginBottom: '12px' }}><strong>Masaj Növü:</strong> {selectedAppointment.massageType?.name}</div>
              <div style={{ marginBottom: '12px' }}><strong>Qiymət:</strong> {selectedAppointment.price} AZN</div>
              {selectedAppointment.status === 'scheduled' && (
                <button
                  onClick={() => {
                    setShowAppointmentModal(false);
                    setShowPaymentModal(true);
                  }}
                  style={{ width: '100%', padding: '16px', marginTop: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
                >
                  <CheckCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
                  Ödəniş Et və Tamamla
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedAppointment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflow: 'hidden' }}>
            <div style={{ padding: '24px', backgroundColor: '#10b981', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '600', color: 'white', margin: 0 }}>Ödəniş</h3>
                <button onClick={() => { setShowPaymentModal(false); setPaymentMode('single'); setSinglePaymentMethod(''); setMixedPayments({ cash: '', card: '', terminal: '' }); setTipMode(false); setTips({ cash: '', card: '', terminal: '' }); }} style={{ padding: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
              </div>
            </div>
            
            <div style={{ padding: '24px', maxHeight: 'calc(90vh - 100px)', overflowY: 'auto' }}>
              <div style={{ padding: '20px', backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                {selectedAppointment.advancePayment?.amount > 0 ? (
                  <>
                    <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>BEH Ödənilib: <span style={{ fontWeight: '600' }}>{selectedAppointment.advancePayment.amount} AZN</span></div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>Qalan: {(selectedAppointment.price - selectedAppointment.advancePayment.amount).toFixed(2)} AZN</div>
                  </>
                ) : (
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>Ödənilməli: {selectedAppointment.price} AZN</div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Ödəniş növü:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button onClick={() => setPaymentMode('single')} style={{ padding: '14px', border: '2px solid', borderColor: paymentMode === 'single' ? '#10b981' : '#e5e7eb', backgroundColor: paymentMode === 'single' ? '#ecfdf5' : 'white', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: paymentMode === 'single' ? '#059669' : '#64748b' }}>Tək Üsul</button>
                  <button onClick={() => setPaymentMode('mixed')} style={{ padding: '14px', border: '2px solid', borderColor: paymentMode === 'mixed' ? '#10b981' : '#e5e7eb', backgroundColor: paymentMode === 'mixed' ? '#ecfdf5' : 'white', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: paymentMode === 'mixed' ? '#059669' : '#64748b' }}>Qarışıq Ödəniş</button>
                </div>
              </div>

              {paymentMode === 'single' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Ödəniş üsulu:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {['cash', 'card', 'terminal'].map(method => {
                      const config = { cash: { icon: <Banknote size={20} />, label: 'Nağd', color: '#059669', bg: '#ecfdf5' }, card: { icon: <CreditCard size={20} />, label: 'Kart', color: '#3b82f6', bg: '#eff6ff' }, terminal: { icon: <Monitor size={20} />, label: 'Terminal', color: '#8b5cf6', bg: '#f5f3ff' } };
                      return (
                        <button key={method} onClick={() => setSinglePaymentMethod(method)} style={{ padding: '16px 12px', border: '2px solid', borderColor: singlePaymentMethod === method ? config[method].color : '#e5e7eb', backgroundColor: singlePaymentMethod === method ? config[method].bg : 'white', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{ color: singlePaymentMethod === method ? config[method].color : '#64748b' }}>{config[method].icon}</div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: singlePaymentMethod === method ? config[method].color : '#64748b' }}>{config[method].label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {paymentMode === 'mixed' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Hər üsul üzrə məbləğ:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['cash', 'card', 'terminal'].map(method => {
                      const config = { cash: { icon: <Banknote size={18} />, label: 'Nağd', color: '#059669' }, card: { icon: <CreditCard size={18} />, label: 'Kart', color: '#3b82f6' }, terminal: { icon: <Monitor size={18} />, label: 'Terminal', color: '#8b5cf6' } };
                      return (
                        <div key={method} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px', color: config[method].color, fontWeight: '600', fontSize: '14px' }}>{config[method].icon}{config[method].label}:</div>
                          <input type="number" value={mixedPayments[method]} onChange={(e) => setMixedPayments(prev => ({ ...prev, [method]: e.target.value }))} placeholder="0.00" step="0.01" min="0" style={{ flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', fontWeight: '600' }} />
                          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>AZN</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>CƏM:</span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{(parseFloat(mixedPayments.cash || 0) + parseFloat(mixedPayments.card || 0) + parseFloat(mixedPayments.terminal || 0)).toFixed(2)} AZN</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '2px solid #fbbf24' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: tipMode ? '16px' : '0' }}>
                  <input type="checkbox" checked={tipMode} onChange={(e) => setTipMode(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                    <Gift size={18} style={{ display: 'inline', marginRight: '6px' }} />
                    Bahşiş əlavə et
                  </span>
                </label>

                {tipMode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['cash', 'card', 'terminal'].map(method => {
                      const config = { cash: { icon: <Banknote size={16} />, label: 'Nağd' }, card: { icon: <CreditCard size={16} />, label: 'Kart' }, terminal: { icon: <Monitor size={16} />, label: 'Terminal' } };
                      return (
                        <div key={method} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '100px', color: '#92400e', fontWeight: '600', fontSize: '13px' }}>{config[method].icon}{config[method].label}:</div>
                          <input type="number" value={tips[method]} onChange={(e) => setTips(prev => ({ ...prev, [method]: e.target.value }))} placeholder="0.00" step="0.01" min="0" style={{ flex: 1, padding: '10px', border: '2px solid #fbbf24', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: 'white' }} />
                          <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '500' }}>AZN</span>
                        </div>
                      );
                    })}
                    {(parseFloat(tips.cash || 0) + parseFloat(tips.card || 0) + parseFloat(tips.terminal || 0)) > 0 && (
                      <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #fbbf24' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>Ümumi Bahşiş:</span>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#b45309' }}>{(parseFloat(tips.cash || 0) + parseFloat(tips.card || 0) + parseFloat(tips.terminal || 0)).toFixed(2)} AZN</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => completeAppointment()} disabled={paymentMode === 'single' && !singlePaymentMethod} style={{ width: '100%', padding: '16px', backgroundColor: (paymentMode === 'single' && !singlePaymentMethod) ? '#cbd5e1' : '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: (paymentMode === 'single' && !singlePaymentMethod) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: (paymentMode === 'single' && !singlePaymentMethod) ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)' }}>
                <CheckCircle size={20} />
                Ödənişi Tamamla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '450px', width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '24px', backgroundColor: '#10b981', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>Ödəniş Tamamlandı!</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>Randevu uğurla yekunlaşdırıldı</p>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px', fontWeight: '500' }}>Müştəriyə təşəkkür mesajı göndərmək istəyirsiniz?</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#15803d' }}>{completedCustomerName}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => { window.open(whatsappLink, '_blank'); setShowWhatsAppModal(false); setWhatsappLink(''); setCompletedCustomerName(''); }} style={{ width: '100%', padding: '14px 20px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp-dan mesaj göndər
                </button>
                <button onClick={() => { setShowWhatsAppModal(false); setWhatsappLink(''); setCompletedCustomerName(''); }} style={{ width: '100%', padding: '14px 20px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>Xeyr, ehtiyac yoxdur</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}