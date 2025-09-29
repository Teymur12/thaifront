import { useState, useEffect } from 'react';
import { 
  Building2, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  User,
  Phone,
  Users,
  CreditCard,
  Banknote,
  Monitor,
  CheckCircle,
  Clock,
  Gift,
  DollarSign
} from 'lucide-react';

import Cookies from 'js-cookie';

export default function Cedvel() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [masseurs, setMasseurs] = useState([]);
  const [massageTypes, setMassageTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [formData, setFormData] = useState({
    customer: '',
    masseur: '',
    massageType: '',
    duration: '',
    price: 0,
    startTime: '',
    notes: '',
    giftCard: null,
    advancePayment: {
      amount: 0,
      paymentMethod: ''
    }
  });

  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    phone: '',
    notes: ''
  });

  const [searchPhone, setSearchPhone] = useState('');
  const [foundCustomers, setFoundCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Gift Card states
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [validatingGiftCard, setValidatingGiftCard] = useState(false);
  const [giftCardError, setGiftCardError] = useState('');

  // Advance payment states
  const [showAdvancePayment, setShowAdvancePayment] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceMethod, setAdvanceMethod] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const [userData, setUserData] = useState(null);
  const [userBranch, setUserBranch] = useState(null);

  useEffect(() => {
    if (!mounted) return;
    const data = getUserData();
    setUserData(data);
    setUserBranch(data?.branch);
  }, [mounted]);

  const generateTimeSlots = () => {
    const slots = [];
    let hour = 10;
    let minute = 30;

    while (hour < 21 || (hour === 21 && minute === 0)) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      minute += 15;
      if (minute >= 60) {
        minute = minute % 60;
        hour += 1;
      }
    }
    return slots;
  };

  const hours = generateTimeSlots();

  useEffect(() => {
    if (mounted && userData && userBranch) {
      fetchInitialData();
    }
  }, [mounted, userData, userBranch]);

  useEffect(() => {
    if (mounted && userData && userBranch && masseurs.length > 0) {
      fetchDayAppointments();
    }
  }, [selectedDate, masseurs, mounted, userData, userBranch]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      const [customersRes, masseursRes, massageTypesRes] = await Promise.all([
        fetch(`${API_BASE}/receptionist/customers/${token}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/receptionist/masseurs/${token}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/receptionist/massage-types/${token}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (masseursRes.ok) {
        const masseursData = await masseursRes.json();
        setMasseurs(masseursData);
      }

      if (massageTypesRes.ok) {
        const massageTypesData = await massageTypesRes.json();
        setMassageTypes(massageTypesData);
      }

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

      if (response.ok) {
        const appointmentsData = await response.json();
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Fetch appointments error:', error);
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

  const validateGiftCard = async (cardNumber) => {
    if (!cardNumber.trim()) {
      setGiftCardError('');
      setFormData(prev => ({ ...prev, giftCard: null }));
      return;
    }

    setValidatingGiftCard(true);
    setGiftCardError('');

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/gift-cards/validate/${cardNumber}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const giftCard = data.giftCard;
        
        setFormData(prev => ({
          ...prev,
          giftCard: giftCard,
          massageType: giftCard.massageType._id,
          duration: giftCard.duration,
          price: 0
        }));

        if (giftCard.purchasedBy) {
          setSelectedCustomer(giftCard.purchasedBy);
          setSearchPhone(giftCard.purchasedBy.phone);
          setFormData(prev => ({ ...prev, customer: giftCard.purchasedBy._id }));
        }

        setGiftCardError('');
      } else {
        setGiftCardError(data.message || 'Hədiyyə kartı tapılmadı');
        setFormData(prev => ({ ...prev, giftCard: null }));
      }
    } catch (error) {
      console.error('Gift card validation error:', error);
      setGiftCardError('Hədiyyə kartı yoxlanılarkən xəta baş verdi');
      setFormData(prev => ({ ...prev, giftCard: null }));
    } finally {
      setValidatingGiftCard(false);
    }
  };

  const searchCustomersByPhone = async (phone) => {
    if (!phone.trim()) {
      setFoundCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/customers/${token}/search/phone/${phone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const customer = await response.json();
        setFoundCustomers([customer]);
        setShowCustomerDropdown(true);
      } else {
        const filteredCustomers = customers.filter(customer => 
          customer.phone.includes(phone) || customer.name.toLowerCase().includes(phone.toLowerCase())
        );
        setFoundCustomers(filteredCustomers);
        setShowCustomerDropdown(filteredCustomers.length > 0);
      }
    } catch (error) {
      console.error('Customer search error:', error);
      const filteredCustomers = customers.filter(customer => 
        customer.phone.includes(phone) || customer.name.toLowerCase().includes(phone.toLowerCase())
      );
      setFoundCustomers(filteredCustomers);
      setShowCustomerDropdown(filteredCustomers.length > 0);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customer: customer._id }));
    setSearchPhone(customer.phone);
    setShowCustomerDropdown(false);
  };

  const addCustomer = async () => {
    if (!customerFormData.name.trim() || !customerFormData.phone.trim()) {
      alert('Ad və telefon nömrəsi mütləqdir!');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/customers/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerFormData)
      });

      if (response.ok) {
        const newCustomer = await response.json();
        setCustomers(prev => [...prev, newCustomer]);
        setSelectedCustomer(newCustomer);
        setFormData(prev => ({ ...prev, customer: newCustomer._id }));
        setSearchPhone(newCustomer.phone);
        setShowCustomerForm(false);
        setCustomerFormData({ name: '', phone: '', notes: '' });
        alert('Müştəri uğurla əlavə edildi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Müştəri əlavə edilmədi'));
      }
    } catch (error) {
      console.error('Add customer error:', error);
      alert('Müştəri əlavə edərkən xəta baş verdi');
    }
  };

  const calculatePrice = (massageTypeId, durationMinutes) => {
    const massageType = massageTypes.find(mt => mt._id === massageTypeId);
    if (!massageType) return 0;

    const duration = massageType.durations.find(d => d.minutes === parseInt(durationMinutes));
    return duration ? duration.price : 0;
  };

  const handleMassageTypeChange = (massageTypeId) => {
    setFormData(prev => {
      const newFormData = { ...prev, massageType: massageTypeId };
      if (massageTypeId && prev.duration && !prev.giftCard) {
        newFormData.price = calculatePrice(massageTypeId, prev.duration);
      }
      return newFormData;
    });
  };

  const handleDurationChange = (duration) => {
    setFormData(prev => {
      const newFormData = { ...prev, duration: duration };
      if (prev.massageType && duration && !prev.giftCard) {
        newFormData.price = calculatePrice(prev.massageType, duration);
      }
      return newFormData;
    });
  };

  const addAppointment = async () => {
    if (!formData.customer || !formData.masseur || !formData.massageType || !formData.duration) {
      alert('Zəhmət olmasa bütün sahələri doldurun!');
      return;
    }

    if (!userBranch?._id) {
      alert('Filial məlumatı tapılmadı!');
      return;
    }

    try {
      const token = getToken();
      const [hour, minute] = selectedSlot.time.split(':');
      
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
      
      if (isNaN(startTime.getTime())) {
        alert('Başlanğıc vaxtı səhvdir!');
        return;
      }
      
      const endTime = new Date(startTime.getTime() + (parseInt(formData.duration) * 60000));
      
      if (isNaN(endTime.getTime())) {
        alert('Bitmə vaxtı hesablanmadı!');
        return;
      }

      const appointmentData = {
        customer: formData.customer,
        masseur: formData.masseur,
        branch: userBranch._id,
        massageType: formData.massageType,
        duration: parseInt(formData.duration),
        price: formData.price,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'scheduled',
        notes: formData.notes || '',
        createdBy: userData.id
      };

      // Beh əlavə et
      if (showAdvancePayment && advanceAmount && advanceMethod) {
        appointmentData.advancePayment = {
          amount: parseFloat(advanceAmount),
          paymentMethod: advanceMethod
        };
      }

      const response = await fetch(`${API_BASE}/receptionist/appointments/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const newAppointment = await response.json();
        
        if (formData.giftCard) {
          try {
            await fetch(`${API_BASE}/gift-cards/use/${formData.giftCard.cardNumber}/${token}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                appointmentId: newAppointment._id,
                usedBy: formData.customer
              })
            });
          } catch (giftCardError) {
            console.error('Gift card usage error:', giftCardError);
            alert('Randevu yaradıldı, ancaq hədiyyə kartı qeyd edilmədi');
          }
        }

        await fetchDayAppointments();
        resetForm();
        alert(showAdvancePayment && advanceAmount ? 
          `Randevu yaradıldı və ${advanceAmount} AZN beh qeydə alındı!` : 
          'Randevu uğurla əlavə edildi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Randevu əlavə edilmədi'));
      }
    } catch (error) {
      console.error('Add appointment error:', error);
      alert('Randevu əlavə edərkən xəta baş verdi: ' + error.message);
    }
  };

  const completeAppointment = async (paymentMethod) => {
    if (!selectedAppointment) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/appointments/${selectedAppointment._id}/complete/${token}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMethod })
      });

      if (response.ok) {
        await fetchDayAppointments();
        setShowAppointmentModal(false);
        setSelectedAppointment(null);
        alert('Randevu tamamlandı və ödəniş qeydə alındı!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Randevu tamamlanmadı'));
      }
    } catch (error) {
      console.error('Complete appointment error:', error);
      alert('Randevu tamamlanarkən xəta baş verdi');
    }
  };

  // Edit appointment
  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      customer: appointment.customer._id,
      masseur: appointment.masseur._id,
      massageType: appointment.massageType._id,
      duration: appointment.duration.toString(),
      price: appointment.price,
      startTime: new Date(appointment.startTime).toTimeString().slice(0, 5),
      notes: appointment.notes || '',
      giftCard: null,
      advancePayment: appointment.advancePayment || { amount: 0, paymentMethod: '' }
    });
    setSelectedCustomer(appointment.customer);
    setSearchPhone(appointment.customer.phone);
    setShowEditModal(true);
  };

  const updateAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const token = getToken();
      const [hour, minute] = formData.startTime.split(':');
      
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
      const endTime = new Date(startTime.getTime() + (parseInt(formData.duration) * 60000));

      const updateData = {
        customer: formData.customer,
        masseur: formData.masseur,
        massageType: formData.massageType,
        duration: parseInt(formData.duration),
        price: formData.price,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: formData.notes
      };

      const response = await fetch(`${API_BASE}/receptionist/appointments/${selectedAppointment._id}/${token}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await fetchDayAppointments();
        setShowEditModal(false);
        resetForm();
        alert('Randevu uğurla yeniləndi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Randevu yenilənmədi'));
      }
    } catch (error) {
      console.error('Update appointment error:', error);
      alert('Randevu yenilərkən xəta baş verdi');
    }
  };

  const deleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (!confirm('Randevunu silmək istədiyinizdən əminsiniz?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/appointments/${selectedAppointment._id}/${token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchDayAppointments();
        setShowAppointmentModal(false);
        setSelectedAppointment(null);
        alert('Randevu uğurla silindi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Randevu silinmədi'));
      }
    } catch (error) {
      console.error('Delete appointment error:', error);
      alert('Randevu silinərkən xəta baş verdi');
    }
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      masseur: '',
      massageType: '',
      duration: '',
      price: 0,
      startTime: '',
      notes: '',
      giftCard: null,
      advancePayment: { amount: 0, paymentMethod: '' }
    });
    setSearchPhone('');
    setFoundCustomers([]);
    setSelectedCustomer(null);
    setShowCustomerDropdown(false);
    setShowAddForm(false);
    setShowEditModal(false);
    setSelectedSlot(null);
    setGiftCardNumber('');
    setGiftCardError('');
    setShowAdvancePayment(false);
    setAdvanceAmount('');
    setAdvanceMethod('');
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

  const openAddForm = (masseurId, time) => {
    setSelectedSlot({ masseurId, time });
    setFormData(prev => ({ ...prev, startTime: time, masseur: masseurId }));
    setShowAddForm(true);
  };

  const openAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const getAvailableDurations = () => {
    if (!formData.massageType) return [];
    const massageType = massageTypes.find(mt => mt._id === formData.massageType);
    return massageType ? massageType.durations : [];
  };

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'cash':
        return { icon: <Banknote size={16} />, text: 'Nağd', color: '#059669' };
      case 'card':
        return { icon: <CreditCard size={16} />, text: 'Kart', color: '#3b82f6' };
      case 'terminal':
        return { icon: <Monitor size={16} />, text: 'Terminal', color: '#8b5cf6' };
      default:
        return { icon: <Clock size={16} />, text: 'Gözləyir', color: '#f59e0b' };
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckCircle size={14} />, text: 'Tamamlandı', color: '#059669' };
      case 'scheduled':
        return { icon: <Calendar size={14} />, text: 'Təyin edilib', color: '#3b82f6' };
      case 'cancelled':
        return { icon: <X size={14} />, text: 'Ləğv edilib', color: '#ef4444' };
      default:
        return { icon: <Clock size={14} />, text: 'Bilinmir', color: '#6b7280' };
    }
  };

  if (!mounted || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Yüklənir...</div>
      </div>
    );
  }

  if (!userBranch) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: '#ef4444' }}>Filial məlumatı tapılmadı</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '20px', fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building2 size={24} color="#667eea" />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{userBranch.name} - Günlük Cədvəl</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => changeDate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
            Əvvəlki
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: '#667eea', borderRadius: '8px', color: 'white' }}>
            <Calendar size={24} />
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{formatDateDisplay(selectedDate)}</h2>
          </div>
          
          <button onClick={() => changeDate(1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>
            Növbəti
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Masseurs info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Users size={20} />
        <span>Aktiv Masajistlər: {masseurs.length} nəfər</span>
      </div>

      {/* Schedule Grid */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${masseurs.length}, 1fr)`, gap: '1px', backgroundColor: '#e2e8f0' }}>
          
          <div style={{ padding: '16px', backgroundColor: '#f1f5f9', fontWeight: '600', color: '#475569', textAlign: 'center' }}>Saat</div>
          
          {masseurs.map((masseur) => (
            <div key={masseur._id} style={{ padding: '16px', backgroundColor: '#667eea', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{masseur.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Masajist</div>
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
                    style={{
                      padding: '8px',
                      backgroundColor: appointment ? '#e0f2fe' : '#ffffff',
                      border: '1px solid',
                      borderColor: appointment ? '#0284c7' : '#e5e7eb',
                      cursor: 'pointer',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => appointment ? openAppointmentModal(appointment) : openAddForm(masseur._id, timeSlot)}
                  >
                    {appointment ? (
                      <div style={{ width: '100%', fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: '#0284c7', fontSize: '10px' }}>
                            {new Date(appointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(appointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {(() => {
                              const status = getStatusDisplay(appointment.status);
                              return <span style={{ color: status.color }}>{status.icon}</span>;
                            })()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ display: 'block', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>{appointment.customer?.name}</span>
                          <span style={{ display: 'block', color: '#64748b', fontSize: '10px', marginBottom: '4px' }}>{appointment.massageType?.name}</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: '#059669', fontSize: '11px' }}>
                              {appointment.advancePayment?.amount > 0 ? (
                                `${appointment.advancePayment.amount} AZN (BEH)`
                              ) : (
                                `${appointment.price} AZN`
                              )}
                            </span>
                            {appointment.paymentMethod && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {(() => {
                                  const payment = getPaymentMethodDisplay(appointment.paymentMethod);
                                  return <span style={{ color: payment.color }}>{payment.icon}</span>;
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ opacity: 0.5 }}>
                        <Plus size={16} color="#9ca3af" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Yeni Randevu</h3>
              <button onClick={resetForm} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Gift Card Section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  <Gift size={16} style={{ marginRight: '6px' }} />
                  Hədiyyə Kartı (İstəyə bağlı):
                </label>
                <div>
                  <input
                    type="text"
                    value={giftCardNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      setGiftCardNumber(value);
                      clearTimeout(window.giftCardTimeout);
                      window.giftCardTimeout = setTimeout(() => validateGiftCard(value), 500);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid',
                      borderColor: formData.giftCard ? '#10b981' : (giftCardError ? '#ef4444' : '#e5e7eb'),
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Hədiyyə kartı nömrəsi"
                  />
                  
                  {validatingGiftCard && <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>Yoxlanılır...</div>}
                  {giftCardError && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{giftCardError}</div>}
                  
                  {formData.giftCard && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px', marginTop: '8px' }}>
                      <CheckCircle size={16} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#059669' }}>
                          Etibarlı: {formData.giftCard.massageType.name} - {formData.giftCard.duration} dəqiqə
                        </div>
                        {formData.giftCard.purchasedBy && (
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Alıcı: {formData.giftCard.purchasedBy.name}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Search */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  <User size={16} style={{ marginRight: '6px' }} />
                  Müştəri:
                </label>
                
                {selectedCustomer ? (
                  <div style={{ padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '500', color: '#059669' }}>{selectedCustomer.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedCustomer.phone}</div>
                    <button 
                      onClick={() => {
                        setSelectedCustomer(null);
                        setFormData(prev => ({ ...prev, customer: '' }));
                        setSearchPhone('');
                      }}
                      style={{ width: '100%', marginTop: '8px', padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <X size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Dəyiş
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={searchPhone}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchPhone(value);
                        searchCustomersByPhone(value);
                      }}
                      style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                      placeholder="Telefon və ya ad ilə axtar"
                    />
                    
                    {showCustomerDropdown && foundCustomers.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                        {foundCustomers.map((customer) => (
                          <div
                            key={customer._id}
                            style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                            onClick={() => selectCustomer(customer)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ fontWeight: '500', color: '#1e293b' }}>{customer.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{customer.phone}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowCustomerForm(true)}
                      style={{ width: '100%', marginTop: '8px', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <Plus size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Yeni Müştəri
                    </button>
                  </div>
                )}
              </div>

              {/* Massage Type */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Masaj Növü:</label>
                <select
                  value={formData.massageType}
                  onChange={(e) => handleMassageTypeChange(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}
                  disabled={formData.giftCard}
                >
                  <option value="">Masaj növü seçin</option>
                  {massageTypes.map((type) => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Müddət:</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}
                  disabled={formData.giftCard}
                >
                  <option value="">Müddət seçin</option>
                  {getAvailableDurations().map((duration) => (
                    <option key={duration.minutes} value={duration.minutes}>
                      {duration.minutes} dəqiqə - {duration.price} AZN
                    </option>
                  ))}
                </select>
              </div>

              {/* Advance Payment Toggle */}
              {!formData.giftCard && formData.price > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showAdvancePayment}
                      onChange={(e) => setShowAdvancePayment(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      <DollarSign size={16} style={{ display: 'inline', marginRight: '4px' }} />
                      BEH (Qabaqcadan ödəniş)
                    </span>
                  </label>

                  {showAdvancePayment && (
                    <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>BEH məbləği:</label>
                        <input
                          type="number"
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(e.target.value)}
                          max={formData.price}
                          style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                          placeholder={`Maksimum: ${formData.price} AZN`}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Ödəniş üsulu:</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setAdvanceMethod('cash')}
                            style={{
                              flex: 1,
                              padding: '10px',
                              border: '2px solid',
                              borderColor: advanceMethod === 'cash' ? '#059669' : '#e5e7eb',
                              backgroundColor: advanceMethod === 'cash' ? '#ecfdf5' : 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: advanceMethod === 'cash' ? '#059669' : '#64748b'
                            }}
                          >
                            <Banknote size={16} style={{ display: 'inline', marginRight: '4px' }} />
                            Nağd
                          </button>
                          <button
                            onClick={() => setAdvanceMethod('card')}
                            style={{
                              flex: 1,
                              padding: '10px',
                              border: '2px solid',
                              borderColor: advanceMethod === 'card' ? '#3b82f6' : '#e5e7eb',
                              backgroundColor: advanceMethod === 'card' ? '#eff6ff' : 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: advanceMethod === 'card' ? '#3b82f6' : '#64748b'
                            }}
                          >
                            <CreditCard size={16} style={{ display: 'inline', marginRight: '4px' }} />
                            Kart
                          </button>
                          <button
                            onClick={() => setAdvanceMethod('terminal')}
                            style={{
                              flex: 1,
                              padding: '10px',
                              border: '2px solid',
                              borderColor: advanceMethod === 'terminal' ? '#8b5cf6' : '#e5e7eb',
                              backgroundColor: advanceMethod === 'terminal' ? '#f5f3ff' : 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: advanceMethod === 'terminal' ? '#8b5cf6' : '#64748b'
                            }}
                          >
                            <Monitor size={16} style={{ display: 'inline', marginRight: '4px' }} />
                            Terminal
                          </button>
                        </div>
                      </div>

                      {advanceAmount > 0 && (
                        <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
                          Qalan məbləğ: {(formData.price - parseFloat(advanceAmount || 0)).toFixed(2)} AZN
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Price Display */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Qiymət:</label>
                <div style={{
                  padding: '12px',
                  backgroundColor: formData.giftCard ? '#ecfdf5' : '#f8fafc',
                  color: formData.giftCard ? '#059669' : '#1e293b',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  {formData.giftCard ? 'Hədiyyə kartı (Pulsuz)' : `${formData.price} AZN`}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Qeydlər:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Əlavə qeydlər"
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={addAppointment} style={{ flex: 1, padding: '12px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  Randevu Yarat
                </button>
                <button onClick={resetForm} style={{ flex: 1, padding: '12px 20px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  Ləğv Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Randevunu Redaktə Et</h3>
              <button onClick={resetForm} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Customer Display */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Müştəri:</label>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '500', color: '#1e293b' }}>{selectedCustomer?.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedCustomer?.phone}</div>
                </div>
              </div>

              {/* Massage Type */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Masaj Növü:</label>
                <select
                  value={formData.massageType}
                  onChange={(e) => handleMassageTypeChange(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}
                >
                  <option value="">Masaj növü seçin</option>
                  {massageTypes.map((type) => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Müddət:</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}
                >
                  <option value="">Müddət seçin</option>
                  {getAvailableDurations().map((duration) => (
                    <option key={duration.minutes} value={duration.minutes}>
                      {duration.minutes} dəqiqə - {duration.price} AZN
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Başlanğıc vaxtı:</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Masseur */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Masajist:</label>
                <select
                  value={formData.masseur}
                  onChange={(e) => setFormData(prev => ({ ...prev, masseur: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}
                >
                  <option value="">Masajist seçin</option>
                  {masseurs.map((masseur) => (
                    <option key={masseur._id} value={masseur._id}>{masseur.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Qeydlər:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Əlavə qeydlər"
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={updateAppointment} style={{ flex: 1, padding: '12px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  <Save size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Yadda Saxla
                </button>
                <button onClick={resetForm} style={{ flex: 1, padding: '12px 20px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  Ləğv Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Yeni Müştəri</h3>
              <button onClick={() => setShowCustomerForm(false)} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Ad:</label>
                <input
                  type="text"
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder="Müştəri adı"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Telefon:</label>
                <input
                  type="tel"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder="+994501234567"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Qeydlər:</label>
                <textarea
                  value={customerFormData.notes}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', minHeight: '60px', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Əlavə qeydlər"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={addCustomer} style={{ flex: 1, padding: '12px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                  Müştəri Əlavə Et
                </button>
                <button onClick={() => setShowCustomerForm(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                  Ləğv Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Randevu Təfərrüatları</h3>
              <button onClick={() => setShowAppointmentModal(false)} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Müştəri:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>{selectedAppointment.customer?.name}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Telefon:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>{selectedAppointment.customer?.phone}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Masajist:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>{selectedAppointment.masseur?.name}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Masaj Növü:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>{selectedAppointment.massageType?.name}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Başlanğıc:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>
                  {new Date(selectedAppointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Bitmə:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>
                  {new Date(selectedAppointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Müddət:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>{selectedAppointment.duration} dəqiqə</span>
              </div>
              
              {selectedAppointment.advancePayment?.amount > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>BEH (Ödənilib):</span>
                    <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600', textAlign: 'right' }}>
                      {selectedAppointment.advancePayment.amount} AZN ({getPaymentMethodDisplay(selectedAppointment.advancePayment.paymentMethod).text})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Qalan məbləğ:</span>
                    <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600', textAlign: 'right' }}>
                      {selectedAppointment.price - selectedAppointment.advancePayment.amount} AZN
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Ümumi qiymət:</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600', textAlign: 'right' }}>{selectedAppointment.price} AZN</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Qiymət:</span>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>{selectedAppointment.price} AZN</span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Status:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {(() => {
                    const status = getStatusDisplay(selectedAppointment.status);
                    return (
                      <span style={{ color: status.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {status.icon}
                        {status.text}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Qeydlər:</span>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>{selectedAppointment.notes}</span>
                </div>
              )}

              {/* Action buttons */}
              {selectedAppointment.status === 'scheduled' && (
                <>
                  {/* Edit button */}
                  <button
                    onClick={() => {
                      setShowAppointmentModal(false);
                      openEditModal(selectedAppointment);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginTop: '16px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Edit size={16} />
                    Redaktə Et
                  </button>

                  {/* Payment buttons */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px', textAlign: 'center' }}>
                      {selectedAppointment.advancePayment?.amount > 0 ? 'Qalan məbləği ödə:' : 'Ödəniş et:'}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => completeAppointment('cash')}
                        style={{ flex: 1, padding: '16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Banknote size={16} />
                        Nağd
                      </button>
                      
                      <button 
                        onClick={() => completeAppointment('card')}
                        style={{ flex: 1, padding: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <CreditCard size={16} />
                        Kart
                      </button>
                      
                      <button 
                        onClick={() => completeAppointment('terminal')}
                        style={{ flex: 1, padding: '16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Monitor size={16} />
                        Terminal
                      </button>
                    </div>
                  </div>

                  {/* Delete button */}
                 
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}