import { useState, useEffect } from 'react';
import { 
  Building2, 
  Grid3X3, 
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
  Search,
  ChevronDown,
  Gift
} from 'lucide-react';

import Cookies from 'js-cookie';


// Daily Schedule Component (Masajist-based)
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
    giftCard: null
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
  const [showGiftCardValidation, setShowGiftCardValidation] = useState(false);
  const [validatingGiftCard, setValidatingGiftCard] = useState(false);
  const [giftCardError, setGiftCardError] = useState('');

  // Component mount olduqdan sonra client-side kodları işlət
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user data from localStorage - safe version
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

  // Token alma funksiyası
   const getToken = () => {
     return Cookies.get('authToken');
   };
 

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // User branch info - yalnız client-side
  const [userData, setUserData] = useState(null);
  const [userBranch, setUserBranch] = useState(null);

  // Get user data after mount
  useEffect(() => {
    if (!mounted) return;
    
    const data = getUserData();
    setUserData(data);
    setUserBranch(data?.branch);
  }, [mounted]);

  // Generate time slots (10:30 - 21:00, 15-minute intervals)
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

  // Fetch all initial data
  useEffect(() => {
    if (mounted && userData && userBranch) {
      fetchInitialData();
    }
  }, [mounted, userData, userBranch]);

  // Fetch appointments when date changes
  useEffect(() => {
    if (mounted && userData && userBranch && masseurs.length > 0) {
      fetchDayAppointments();
    }
  }, [selectedDate, masseurs, mounted, userData, userBranch]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      // Fetch customers, masseurs, and massage types
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

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display (DD.MM.YYYY)
  const formatDateDisplay = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Change date
  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Validate gift card
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
        
        // Auto-fill form with gift card data
        setFormData(prev => ({
          ...prev,
          giftCard: giftCard,
          massageType: giftCard.massageType._id,
          duration: giftCard.duration,
          price: 0 // Gift card means free service
        }));

        // If gift card has associated customer, select them
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

  // Search customers by phone
  const searchCustomersByPhone = async (phone) => {
    if (!phone.trim()) {
      setFoundCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    try {
      // First search by exact phone match
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/customers/search/phone/${phone}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const customer = await response.json();
        setFoundCustomers([customer]);
        setShowCustomerDropdown(true);
      } else {
        // If no exact match, search among all customers
        const filteredCustomers = customers.filter(customer => 
          customer.phone.includes(phone) || customer.name.toLowerCase().includes(phone.toLowerCase())
        );
        setFoundCustomers(filteredCustomers);
        setShowCustomerDropdown(filteredCustomers.length > 0);
      }
    } catch (error) {
      console.error('Customer search error:', error);
      // Fallback to local search
      const filteredCustomers = customers.filter(customer => 
        customer.phone.includes(phone) || customer.name.toLowerCase().includes(phone.toLowerCase())
      );
      setFoundCustomers(filteredCustomers);
      setShowCustomerDropdown(filteredCustomers.length > 0);
    }
  };

  // Handle customer selection from dropdown
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customer: customer._id }));
    setSearchPhone(customer.phone);
    setShowCustomerDropdown(false);
  };

  // Add new customer
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

  // Calculate price based on massage type and duration
  const calculatePrice = (massageTypeId, durationMinutes) => {
    const massageType = massageTypes.find(mt => mt._id === massageTypeId);
    if (!massageType) return 0;

    const duration = massageType.durations.find(d => d.minutes === parseInt(durationMinutes));
    return duration ? duration.price : 0;
  };

  // Handle massage type or duration change
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

  // Add appointment
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
      
      // Create start time from selected date and time
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

      // Appointment model-ə uyğun data
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
        
        // If using gift card, mark it as used
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

        await fetchDayAppointments(); // Refresh appointments
        resetForm();
        alert(formData.giftCard ? 'Randevu yaradıldı və hədiyyə kartı istifadə edildi!' : 'Randevu uğurla əlavə edildi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Randevu əlavə edilmədi'));
      }
    } catch (error) {
      console.error('Add appointment error:', error);
      alert('Randevu əlavə edərkən xəta baş verdi: ' + error.message);
    }
  };

  // Complete appointment with payment
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
        await fetchDayAppointments(); // Refresh appointments
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

  // Reset form
  const resetForm = () => {
    setFormData({
      customer: '',
      masseur: '',
      massageType: '',
      duration: '',
      price: 0,
      startTime: '',
      notes: '',
      giftCard: null
    });
    setSearchPhone('');
    setFoundCustomers([]);
    setSelectedCustomer(null);
    setShowCustomerDropdown(false);
    setShowAddForm(false);
    setSelectedSlot(null);
    setGiftCardNumber('');
    setGiftCardError('');
    setShowGiftCardValidation(false);
  };

  // Check if time slot is occupied for specific masseur
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

  // Open add form
  const openAddForm = (masseurId, time) => {
    setSelectedSlot({ masseurId, time });
    setFormData(prev => ({ ...prev, startTime: time, masseur: masseurId }));
    setShowAddForm(true);
  };

  // Open appointment modal
  const openAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  // Get available durations for selected massage type
  const getAvailableDurations = () => {
    if (!formData.massageType) return [];
    const massageType = massageTypes.find(mt => mt._id === formData.massageType);
    return massageType ? massageType.durations : [];
  };

  // Get payment method icon and text
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

  // Get status display
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckCircle size={14} />, text: 'Tamamlandı', color: '#059669' };
      case 'in-progress':
        return { icon: <Clock size={14} />, text: 'Davam edir', color: '#f59e0b' };
      case 'scheduled':
        return { icon: <Calendar size={14} />, text: 'Təyin edilib', color: '#3b82f6' };
      case 'cancelled':
        return { icon: <X size={14} />, text: 'Ləğv edilib', color: '#ef4444' };
      default:
        return { icon: <Clock size={14} />, text: 'Bilinmir', color: '#6b7280' };
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f8fafc'
    },
    loading: {
      fontSize: '18px',
      color: '#64748b'
    },
    errorContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f8fafc'
    },
    error: {
      fontSize: '18px',
      color: '#ef4444'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    branchInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    branchName: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    dateNavigation: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    dateBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      backgroundColor: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#475569',
      transition: 'all 0.2s'
    },
    dateTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      backgroundColor: '#667eea',
      borderRadius: '8px',
      color: 'white'
    },
    dateText: {
      fontSize: '18px',
      fontWeight: '600',
      margin: 0
    },
    masseursInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '20px',
      padding: '12px 20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      fontSize: '14px',
      color: '#64748b'
    },
    scheduleContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    scheduleGrid: {
      display: 'grid',
      gap: '1px',
      backgroundColor: '#e2e8f0'
    },
    timeColumn: {
      padding: '16px',
      backgroundColor: '#f1f5f9',
      fontWeight: '600',
      color: '#475569',
      textAlign: 'center',
      fontSize: '14px'
    },
    masseurHeader: {
      padding: '16px',
      backgroundColor: '#667eea',
      color: 'white',
      textAlign: 'center'
    },
    masseurName: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    masseurSpecialty: {
      fontSize: '12px',
      opacity: 0.9
    },
    scheduleRow: {
      display: 'contents'
    },
    timeCell: {
      padding: '12px',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    timeLabel: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#64748b'
    },
    timeSlot: {
      padding: '8px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    emptySlot: {
      opacity: 0.5,
      transition: 'opacity 0.2s'
    },
    appointmentCard: {
      width: '100%',
      fontSize: '11px'
    },
    appointmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '4px'
    },
    appointmentTime: {
      fontWeight: '600',
      color: '#0284c7',
      fontSize: '10px'
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center'
    },
    appointmentInfo: {
      textAlign: 'left'
    },
    customerName: {
      display: 'block',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '2px'
    },
    massageType: {
      display: 'block',
      color: '#64748b',
      fontSize: '10px',
      marginBottom: '4px'
    },
    appointmentFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    price: {
      fontWeight: '600',
      color: '#059669',
      fontSize: '11px'
    },
    paymentBadge: {
      display: 'flex',
      alignItems: 'center'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'hidden'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      borderBottom: '1px solid #e2e8f0'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    closeBtn: {
      padding: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalBody: {
      padding: '20px',
      maxHeight: '70vh',
      overflowY: 'auto'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    giftCardContainer: {
      position: 'relative'
    },
    validatingIndicator: {
      fontSize: '12px',
      color: '#f59e0b',
      marginTop: '4px'
    },
    errorMessage: {
      fontSize: '12px',
      color: '#ef4444',
      marginTop: '4px'
    },
    validGiftCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      backgroundColor: '#ecfdf5',
      border: '1px solid #10b981',
      borderRadius: '6px',
      marginTop: '8px'
    },
    giftCardInfo: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#059669'
    },
    giftCardBuyer: {
      fontSize: '11px',
      color: '#6b7280'
    },
    customerSearchContainer: {
      position: 'relative'
    },
    customerDropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 10,
      maxHeight: '200px',
      overflowY: 'auto'
    },
    customerOption: {
      padding: '12px',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f4f6',
      transition: 'background-color 0.2s'
    },
    customerOptionHover: {
      backgroundColor: '#f8fafc'
    },
    customerName: {
      fontWeight: '500',
      color: '#1e293b'
    },
    customerPhone: {
      fontSize: '12px',
      color: '#64748b'
    },
    selectedCustomerDisplay: {
      padding: '12px',
      backgroundColor: '#ecfdf5',
      border: '1px solid #10b981',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    selectedCustomerName: {
      fontWeight: '500',
      color: '#059669'
    },
    selectedCustomerPhone: {
      fontSize: '12px',
      color: '#6b7280'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    primaryBtn: {
      flex: 1,
      padding: '12px 20px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    secondaryBtn: {
      flex: 1,
      padding: '12px 20px',
      backgroundColor: 'transparent',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    addCustomerBtn: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '12px',
      color: '#475569',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    paymentButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    paymentBtn: {
      flex: 1,
      padding: '16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    cashBtn: {
      backgroundColor: '#059669',
      color: 'white'
    },
    cardBtn: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    terminalBtn: {
      backgroundColor: '#8b5cf6',
      color: 'white'
    },
    appointmentDetailModal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '500px',
      width: '90%'
    },
    appointmentDetail: {
      padding: '20px'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6'
    },
    detailLabel: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500'
    },
    detailValue: {
      fontSize: '14px',
      color: '#1e293b',
      fontWeight: '500',
      textAlign: 'right'
    },
    statusDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  };

  // Server-side render zamanı loading göstər
  if (!mounted) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Yüklənir...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Yüklənir...</div>
      </div>
    );
  }

  if (!userBranch) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.error}>Filial məlumatı tapılmadı</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.branchInfo}>
          <Building2 size={24} color="#667eea" />
          <h2 style={styles.branchName}>{userBranch.name} - Günlük Randevu Cədvəli</h2>
        </div>

        <div style={styles.dateNavigation}>
          <button onClick={() => changeDate(-1)} style={styles.dateBtn}>
            <ChevronLeft size={20} />
            Əvvəlki Gün
          </button>
          
          <div style={styles.dateTitle}>
            <Calendar size={24} />
            <h2 style={styles.dateText}>
              {formatDateDisplay(selectedDate)}
            </h2>
          </div>
          
          <button onClick={() => changeDate(1)} style={styles.dateBtn}>
            Növbəti Gün
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Masseurs info */}
      <div style={styles.masseursInfo}>
        <Users size={20} />
        <span>Aktiv Masajistlər: {masseurs.length} nəfər</span>
      </div>

      {/* Schedule Table */}
      <div style={styles.scheduleContainer}>
        <div style={styles.scheduleGrid} 
             style={{
               ...styles.scheduleGrid,
               gridTemplateColumns: `120px repeat(${masseurs.length}, 1fr)`
             }}>
          
          {/* Header - time column */}
          <div style={styles.timeColumn}>Saat</div>
          
          {/* Header - masseurs */}
          {masseurs.map((masseur) => (
            <div key={masseur._id} style={styles.masseurHeader}>
              <div style={styles.masseurName}>{masseur.name}</div>
              <div style={styles.masseurSpecialty}>Masajist</div>
            </div>
          ))}

          {/* Time slots */}
          {hours.map((timeSlot) => (
            <div key={timeSlot} style={styles.scheduleRow}>
              <div style={styles.timeCell}>
                <span style={styles.timeLabel}>{timeSlot}</span>
              </div>

              {masseurs.map((masseur) => {
                const appointment = isTimeSlotOccupied(masseur._id, timeSlot);
                
                return (
                  <div 
                    key={`${masseur._id}-${timeSlot}`}
                    style={{
                      ...styles.timeSlot,
                      backgroundColor: appointment ? '#e0f2fe' : '#ffffff',
                      borderColor: appointment ? '#0284c7' : '#e5e7eb'
                    }}
                    onClick={() => appointment ? openAppointmentModal(appointment) : openAddForm(masseur._id, timeSlot)}
                  >
                    {appointment ? (
                      <div style={styles.appointmentCard}>
                        <div style={styles.appointmentHeader}>
                          <span style={styles.appointmentTime}>
                            {new Date(appointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(appointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {(() => {
                              const status = getStatusDisplay(appointment.status);
                              return (
                                <span style={{ ...styles.statusBadge, color: status.color }}>
                                  {status.icon}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        <div style={styles.appointmentInfo}>
                          <span style={styles.customerName}>{appointment.customer?.name}</span>
                          <span style={styles.massageType}>{appointment.massageType?.name}</span>
                          <div style={styles.appointmentFooter}>
                            <span style={styles.price}>{appointment.price} AZN</span>
                            {appointment.paymentMethod && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {(() => {
                                  const payment = getPaymentMethodDisplay(appointment.paymentMethod);
                                  return (
                                    <span style={{ ...styles.paymentBadge, color: payment.color }}>
                                      {payment.icon}
                                    </span>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.emptySlot}>
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
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Yeni Randevu</h3>
              <button onClick={resetForm} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              {/* Gift Card Section */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Gift size={16} style={{ marginRight: '6px' }} />
                  Hədiyyə Kartı (İstəyə bağlı):
                </label>
                <div style={styles.giftCardContainer}>
                  <input
                    type="text"
                    value={giftCardNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      setGiftCardNumber(value);
                      
                      // Auto-validate after typing stops (debounce)
                      clearTimeout(window.giftCardTimeout);
                      window.giftCardTimeout = setTimeout(() => {
                        validateGiftCard(value);
                      }, 500);
                    }}
                    style={{
                      ...styles.input,
                      borderColor: formData.giftCard ? '#10b981' : (giftCardError ? '#ef4444' : '#e5e7eb')
                    }}
                    placeholder="Hədiyyə kartı nömrəsini daxil edin"
                  />
                  
                  {validatingGiftCard && (
                    <div style={styles.validatingIndicator}>Yoxlanılır...</div>
                  )}
                  
                  {giftCardError && (
                    <div style={styles.errorMessage}>{giftCardError}</div>
                  )}
                  
                  {formData.giftCard && (
                    <div style={styles.validGiftCard}>
                      <CheckCircle size={16} />
                      <div>
                        <div style={styles.giftCardInfo}>
                          Etibarlı hədiyyə kartı: {formData.giftCard.massageType.name} - {formData.giftCard.duration} dəqiqə
                        </div>
                        {formData.giftCard.purchasedBy && (
                          <div style={styles.giftCardBuyer}>
                            Alıcı: {formData.giftCard.purchasedBy.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Search */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <User size={16} style={{ marginRight: '6px' }} />
                  Müştəri:
                </label>
                
                {selectedCustomer ? (
                  <div style={styles.selectedCustomerDisplay}>
                    <div style={styles.selectedCustomerName}>{selectedCustomer.name}</div>
                    <div style={styles.selectedCustomerPhone}>{selectedCustomer.phone}</div>
                    <button 
                      onClick={() => {
                        setSelectedCustomer(null);
                        setFormData(prev => ({ ...prev, customer: '' }));
                        setSearchPhone('');
                      }}
                      style={styles.addCustomerBtn}
                    >
                      <X size={14} />
                      Dəyiş
                    </button>
                  </div>
                ) : (
                  <div style={styles.customerSearchContainer}>
                    <input
                      type="text"
                      value={searchPhone}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchPhone(value);
                        searchCustomersByPhone(value);
                      }}
                      style={styles.input}
                      placeholder="Telefon nömrəsi və ya ad ilə axtarın"
                    />
                    
                    {showCustomerDropdown && foundCustomers.length > 0 && (
                      <div style={styles.customerDropdown}>
                        {foundCustomers.map((customer) => (
                          <div
                            key={customer._id}
                            style={styles.customerOption}
                            onClick={() => selectCustomer(customer)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <div style={styles.customerName}>{customer.name}</div>
                            <div style={styles.customerPhone}>{customer.phone}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowCustomerForm(true)}
                      style={styles.addCustomerBtn}
                    >
                      <Plus size={14} />
                      Yeni Müştəri Əlavə Et
                    </button>
                  </div>
                )}
              </div>

              {/* Massage Type */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Masaj Növü:</label>
                <select
                  value={formData.massageType}
                  onChange={(e) => handleMassageTypeChange(e.target.value)}
                  style={styles.select}
                  disabled={formData.giftCard}
                >
                  <option value="">Masaj növü seçin</option>
                  {massageTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Müddət:</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  style={styles.select}
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

              {/* Price Display */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Qiymət:</label>
                <div style={{
                  ...styles.input,
                  backgroundColor: formData.giftCard ? '#ecfdf5' : '#f8fafc',
                  color: formData.giftCard ? '#059669' : '#1e293b',
                  fontWeight: '600'
                }}>
                  {formData.giftCard ? 'Hədiyyə kartı (Pulsuz)' : `${formData.price} AZN`}
                </div>
              </div>

              {/* Notes */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Qeydlər:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={styles.textarea}
                  placeholder="Əlavə qeydlər (istəyə bağlı)"
                />
              </div>

              {/* Buttons */}
              <div style={styles.buttonGroup}>
                <button onClick={addAppointment} style={styles.primaryBtn}>
                  Randevu Yarat
                </button>
                <button onClick={resetForm} style={styles.secondaryBtn}>
                  Ləğv Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Yeni Müştəri</h3>
              <button onClick={() => setShowCustomerForm(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Ad:</label>
                <input
                  type="text"
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={styles.input}
                  placeholder="Müştərinin adı"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Telefon:</label>
                <input
                  type="tel"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={styles.input}
                  placeholder="+994501234567"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Qeydlər:</label>
                <textarea
                  value={customerFormData.notes}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={styles.textarea}
                  placeholder="Müştəri haqqında əlavə məlumatlar"
                />
              </div>

              <div style={styles.buttonGroup}>
                <button onClick={addCustomer} style={styles.primaryBtn}>
                  Müştəri Əlavə Et
                </button>
                <button onClick={() => setShowCustomerForm(false)} style={styles.secondaryBtn}>
                  Ləğv Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div style={styles.modalOverlay}>
          <div style={styles.appointmentDetailModal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Randevu Təfərrüatları</h3>
              <button onClick={() => setShowAppointmentModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.appointmentDetail}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Müştəri:</span>
                <span style={styles.detailValue}>{selectedAppointment.customer?.name}</span>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Telefon:</span>
                <span style={styles.detailValue}>{selectedAppointment.customer?.phone}</span>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Masajist:</span>
                <span style={styles.detailValue}>{selectedAppointment.masseur?.name}</span>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Masaj Növü:</span>
                <span style={styles.detailValue}>{selectedAppointment.massageType?.name}</span>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Başlanğıc:</span>
                <span style={styles.detailValue}>
                  {new Date(selectedAppointment.startTime).toLocaleTimeString('az-AZ', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Bitmə:</span>
                <span style={styles.detailValue}>
                  {new Date(selectedAppointment.endTime).toLocaleTimeString('az-AZ', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Müddət:</span>
                <span style={styles.detailValue}>{selectedAppointment.duration} dəqiqə</span>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Qiymət:</span>
                <span style={styles.detailValue}>{selectedAppointment.price} AZN</span>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <div style={styles.statusDisplay}>
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
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Qeydlər:</span>
                  <span style={styles.detailValue}>{selectedAppointment.notes}</span>
                </div>
              )}

              {/* Payment buttons for scheduled appointments */}
              {selectedAppointment.status === 'scheduled' && (
                <div style={styles.paymentButtons}>
                  <button 
                    onClick={() => completeAppointment('cash')}
                    style={{ ...styles.paymentBtn, ...styles.cashBtn }}
                  >
                    <Banknote size={16} />
                    Nağd Ödə
                  </button>
                  
                  <button 
                    onClick={() => completeAppointment('card')}
                    style={{ ...styles.paymentBtn, ...styles.cardBtn }}
                  >
                    <CreditCard size={16} />
                    Kart
                  </button>
                  
                  <button 
                    onClick={() => completeAppointment('terminal')}
                    style={{ ...styles.paymentBtn, ...styles.terminalBtn }}
                  >
                    <Monitor size={16} />
                    Terminal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}