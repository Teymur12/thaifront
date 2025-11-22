import { useState, useEffect } from 'react';
import { 
  Building2, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Save,
  X,
  Calendar,
  User,
  Users,
  CreditCard,
  Banknote,
  Monitor,
  CheckCircle,
  Clock,
  Gift,
  DollarSign,
  MoreVertical,
  Ban,
  Unlock,
  Upload,
  Image,
  Trash2,
  Eye
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
    advancePayment: { amount: 0, paymentMethod: '' }
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

  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [validatingGiftCard, setValidatingGiftCard] = useState(false);
  const [giftCardError, setGiftCardError] = useState('');

  const [showAdvancePayment, setShowAdvancePayment] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceMethod, setAdvanceMethod] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

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

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptModalAppointment, setReceiptModalAppointment] = useState(null);
  const [uploadingReceiptForAppointment, setUploadingReceiptForAppointment] = useState(false);
  const [receiptModalFile, setReceiptModalFile] = useState(null);
  const [receiptModalPreview, setReceiptModalPreview] = useState(null);

  const [showReceiptViewModal, setShowReceiptViewModal] = useState(false);
  const [receiptViewUrl, setReceiptViewUrl] = useState(null);

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

    while (hour < 24 || (hour === 24 && minute === 0)) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      minute += 15;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
    }
    return slots;
  };

  const hours = generateTimeSlots();

  const filterActiveMasseurs = (allMasseurs) => {
    const currentDate = new Date(selectedDate);
    currentDate.setHours(0, 0, 0, 0);
    
    return allMasseurs.filter(masseur => {
      if (!masseur.blockedDates || masseur.blockedDates.length === 0) {
        return true;
      }
      
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

  useEffect(() => {
    if (mounted && userData && userBranch) {
      fetchInitialData();
    }
  }, [mounted, userData, userBranch]);

  useEffect(() => {
    if (mounted && userData && userBranch) {
      fetchMasseursForDate();
    }
  }, [selectedDate, mounted, userData, userBranch]);

  useEffect(() => {
    if (mounted && userData && userBranch && (masseurs.length >= 0 || blockedMasseursForToday.length >= 0)) {
      fetchDayAppointments();
    }
  }, [selectedDate, masseurs, blockedMasseursForToday, mounted, userData, userBranch]);

  const fetchMasseursForDate = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/masseurs/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const masseursData = await response.json();
        setAllMasseurs(masseursData);
        const activeMasseurs = filterActiveMasseurs(masseursData);
        setMasseurs(activeMasseurs);
        
        const blocked = masseursData.filter(m => checkIfMasseurBlocked(m));
        setBlockedMasseursForToday(blocked);
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
        const activeMasseurs = filterActiveMasseurs(masseursData);
        setMasseurs(activeMasseurs);
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

  const blockMasseurForDate = async () => {
    if (!selectedMasseurForBlock) return;

    try {
      const token = getToken();
      const dateString = formatDateForAPI(selectedDate);
      
      const response = await fetch(`${API_BASE}/receptionist/masseurs/${selectedMasseurForBlock._id}/block/${dateString}/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: blockReason || 'İstirahət günü' })
      });

      if (response.ok) {
        alert('Masajist uğurla bloklandı!');
        setShowBlockModal(false);
        setSelectedMasseurForBlock(null);
        setBlockReason('');
        await fetchMasseursForDate();
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Masajist bloklanmadı'));
      }
    } catch (error) {
      console.error('Block masseur error:', error);
      alert('Masajist bloklanarkən xəta baş verdi');
    }
  };

  const unblockMasseurForDate = async (masseur) => {
    if (!confirm(`${masseur.name} üçün bu günün blokunun götürülməsini təsdiqləyirsiniz?`)) return;

    try {
      const token = getToken();
      const dateString = formatDateForAPI(selectedDate);
      
      const response = await fetch(`${API_BASE}/receptionist/masseurs/${masseur._id}/unblock/${dateString}/${token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Blok uğurla götürüldü!');
        await fetchMasseursForDate();
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Blok götürülmədi'));
      }
    } catch (error) {
      console.error('Unblock masseur error:', error);
      alert('Blok götürülməsində xəta baş verdi');
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const selectDateFromCalendar = (day) => {
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

  const changeCalendarMonth = (direction) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCalendarDate(newDate);
  };

  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const weekDays = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'];

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

  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Zəhmət olmasa yalnız şəkil faylı seçin!');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Faylın ölçüsü 5MB-dan çox ola bilməz!');
        return;
      }

      setReceiptFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReceiptModalFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Zəhmət olmasa yalnız şəkil faylı seçin!');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Faylın ölçüsü 5MB-dan çox ola bilməz!');
        return;
      }

      setReceiptModalFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptModalPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadReceiptForAppointment = async () => {
    if (!receiptModalAppointment || !receiptModalFile) {
      alert('Zəhmət olmasa şəkil seçin!');
      return;
    }

    setUploadingReceiptForAppointment(true);

    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('receiptImage', receiptModalFile);

      const response = await fetch(`${API_BASE}/receptionist/appointments/${receiptModalAppointment._id}/upload-receipt/${token}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert('Qəbzi uğurla yükləndi!');
        setShowReceiptModal(false);
        setReceiptModalFile(null);
        setReceiptModalPreview(null);
        setReceiptModalAppointment(null);
        await fetchDayAppointments();
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Qəbzi yüklənmədi'));
      }
    } catch (error) {
      console.error('Upload receipt error:', error);
      alert('Qəbzi yüklərkən xəta baş verdi');
    } finally {
      setUploadingReceiptForAppointment(false);
    }
  };

  const deleteReceiptForAppointment = async (appointmentId) => {
    if (!confirm('Qəbzini silmək istədiyinizdən əminsiniz?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/appointments/${appointmentId}/receipt/${token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Qəbzi uğurla silindi!');
        await fetchDayAppointments();
        setShowReceiptModal(false);
        setReceiptModalAppointment(null);
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Qəbzi silinmədi'));
      }
    } catch (error) {
      console.error('Delete receipt error:', error);
      alert('Qəbzi silinərkən xəta baş verdi');
    }
  };

  const viewReceipt = async (appointmentId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/appointments/${appointmentId}/receipt/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReceiptViewUrl(data.receiptUrl);
        setShowReceiptViewModal(true);
      } else {
        alert('Qəbzi tapılmadı');
      }
    } catch (error) {
      console.error('View receipt error:', error);
      alert('Qəbzi açılarkən xəta baş verdi');
    }
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

      let finalPrice = formData.price;
      let discountInfo = null;

      const SPECIAL_BRANCH_ID = '68d2693d8b8c7e6256a90bc8';
      if (userBranch._id === SPECIAL_BRANCH_ID) {
        const dayOfWeek = startTime.getDay();
        let discountPercent = 0;
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          discountPercent = 10;
        } else {
          discountPercent = 25;
        }
        
        const originalPrice = formData.price;
        const discountAmount = (originalPrice * discountPercent) / 100;
        const priceAfterDiscount = originalPrice - discountAmount;
        
        if (discountPercent === 10) {
          finalPrice = Math.round(priceAfterDiscount);
        } else if (discountPercent === 25) {
          finalPrice = Math.ceil(priceAfterDiscount);
        }
        
        discountInfo = {
          percent: discountPercent,
          amount: originalPrice - finalPrice,
          originalPrice: originalPrice,
          reason: dayOfWeek === 0 || dayOfWeek === 6 ? 'Həftə sonu endirimi' : 'Həftə içi endirimi'
        };
      }

      const appointmentData = {
        customer: formData.customer,
        masseur: formData.masseur,
        branch: userBranch._id,
        massageType: formData.massageType,
        duration: parseInt(formData.duration),
        price: finalPrice,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'scheduled',
        notes: formData.notes || '',
        createdBy: userData.id
      };

      if (discountInfo) {
        appointmentData.discount = discountInfo;
      }

      if (showAdvancePayment && advanceAmount && advanceMethod) {
        appointmentData.advancePayment = {
          amount: parseFloat(advanceAmount),
          paymentMethod: advanceMethod
        };
      }

      const formDataToSend = new FormData();
      formDataToSend.append('body', JSON.stringify(appointmentData));
      
      if (receiptFile && showAdvancePayment && advanceAmount) {
        formDataToSend.append('receiptImage', receiptFile);
      }

      const response = await fetch(`${API_BASE}/receptionist/appointments/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
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
        
        let successMessage = 'Randevu uğurla əlavə edildi!';
        
        if (discountInfo) {
          successMessage += `\n\n📊 Qiymət Məlumatı:`;
          successMessage += `\n• Orijinal qiymət: ${discountInfo.originalPrice} AZN`;
          successMessage += `\n• Endirim (${discountInfo.percent}%): -${discountInfo.amount.toFixed(2)} AZN`;
          successMessage += `\n• Yekun qiymət: ${finalPrice.toFixed(2)} AZN`;
          successMessage += `\n• Səbəb: ${discountInfo.reason}`;
        }
        
        if (showAdvancePayment && advanceAmount) {
          successMessage += `\n\n💰 BEH: ${advanceAmount} AZN qeydə alındı`;
          if (receiptFile) {
            successMessage += `\n📸 Qəbzi şəkli yükləndi`;
          }
        }
        
        alert(successMessage);
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

    setLoading(true); 
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
        const result = await response.json();
        
        await fetchDayAppointments();
        setShowAppointmentModal(false);
        
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

      const response = await fetch(`${API_BASE}/receptionist/appointments/${selectedAppointment._id}`, {
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
    setReceiptFile(null);
    setReceiptPreview(null);
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

  const openAddForm = (masseurId, time, isBlocked = false) => {
    if (isBlocked) {
      alert('Bu masajist bu gün üçün bloklanıb. Randevu əlavə edilə bilməz.');
      return;
    }
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
    return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Yüklənir...</div>
      </div>
    );
  }

  if (!userBranch) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: '#ef4444'}}>Filial məlumatı tapılmadı</div>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <button onClick={() => changeDate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
            Əvvəlki
          </button>
          
          <div 
            onClick={() => setShowCalendar(!showCalendar)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: '#667eea', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
          >
            <Calendar size={24} />
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{formatDateDisplay(selectedDate)}</h2>
          </div>

          {showCalendar && (
            <>
              <div 
                onClick={() => setShowCalendar(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999
                }}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                zIndex: 1000,
                padding: '20px',
                minWidth: '320px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); changeCalendarMonth(-1); }}
                    style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={calendarDate.getMonth()}
                      onChange={(e) => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(parseInt(e.target.value));
                        setCalendarDate(newDate);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>{month}</option>
                      ))}
                    </select>

                    <select
                      value={calendarDate.getFullYear()}
                      onChange={(e) => {
                        const newDate = new Date(calendarDate);
                        newDate.setFullYear(parseInt(e.target.value));
                        setCalendarDate(newDate);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); changeCalendarMonth(1); }}
                    style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  {weekDays.map(day => (
                    <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', padding: '8px 0' }}>
                      {day}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {Array.from({ length: getDaysInMonth(calendarDate).startingDayOfWeek === 0 ? 6 : getDaysInMonth(calendarDate).startingDayOfWeek - 1 }).map((_, idx) => (
                    <div key={`empty-${idx}`} style={{ padding: '8px' }}></div>
                  ))}
                  
                  {Array.from({ length: getDaysInMonth(calendarDate).daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const isToday = new Date().toDateString() === new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toDateString();
                    const isSelected = selectedDate.toDateString() === new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toDateString();
                    
                    return (
                      <button
                        key={day}
                        onClick={(e) => { e.stopPropagation(); selectDateFromCalendar(day); }}
                        style={{
                          padding: '8px',
                          border: 'none',
                          backgroundColor: isSelected ? '#667eea' : (isToday ? '#eff6ff' : 'transparent'),
                          color: isSelected ? 'white' : (isToday ? '#3b82f6' : '#1e293b'),
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: isSelected || isToday ? '600' : '400',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = isToday ? '#eff6ff' : 'transparent';
                          }
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(new Date());
                      setCalendarDate(new Date());
                      setShowCalendar(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      color: '#667eea'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    Bu gün
                  </button>
                </div>
              </div>
            </>
          )}
          
          <button onClick={() => changeDate(1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>
            Növbəti
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Masseurs Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Users size={20} />
        <span>Aktiv Masajistlər: {masseurs.length} nəfər</span>
        {blockedMasseursForToday.length > 0 && (
          <>
            <span style={{ marginLeft: '16px', color: '#9ca3af' }}>•</span>
            <Ban size={20} color="#9ca3af" />
            <span style={{ color: '#64748b' }}>Bloklanan: {blockedMasseursForToday.length} nəfər</span>
          </>
        )}
      </div>

      {/* Schedule Grid */}
      {masseurs.length === 0 && blockedMasseursForToday.length === 0 ? (
        <div style={{ padding: '40px 20px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
          <Clock size={32} style={{ margin: '0 auto 12px', color: '#f59e0b' }} />
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
            Bu tarixdə heç bir masajist yoxdur
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${masseurs.length + blockedMasseursForToday.length}, 1fr)`, gap: '1px', backgroundColor: '#e2e8f0' }}>
            
            <div style={{ padding: '16px', backgroundColor: '#f1f5f9', fontWeight: '600', color: '#475569', textAlign: 'center', position: 'sticky', left: 0, zIndex: 10 }}>Saat</div>
            
            {masseurs.map((masseur) => (
              <div key={masseur._id} style={{ padding: '16px', backgroundColor: '#667eea', color: 'white', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{masseur.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Masajist</div>
                
                <button
                  onClick={() => setShowMasseurMenu(showMasseurMenu === masseur._id ? null : masseur._id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '6px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white'
                  }}
                >
                  <MoreVertical size={16} />
                </button>

                {showMasseurMenu === masseur._id && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: '8px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 100,
                    minWidth: '180px',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedMasseurForBlock(masseur);
                        setShowBlockModal(true);
                        setShowMasseurMenu(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        backgroundColor: 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#ef4444',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <Ban size={16} />
                      Bu günü blokla
                    </button>
                  </div>
                )}
              </div>
            ))}

            {blockedMasseursForToday.map((masseur) => {
              const blockInfo = masseur.blockedDates.find(blocked => {
                const bd = new Date(blocked.date);
                bd.setHours(0, 0, 0, 0);
                const current = new Date(selectedDate);
                current.setHours(0, 0, 0, 0);
                return bd.getTime() === current.getTime();
              });

              return (
                <div key={masseur._id} style={{ padding: '16px', backgroundColor: '#9ca3af', color: 'white', textAlign: 'center', position: 'relative' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{masseur.name}</div>
                  <div style={{ fontSize: '11px', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Ban size={12} />
                    Bloklanıb
                  </div>
                  {blockInfo?.reason && (
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{blockInfo.reason}</div>
                  )}
                  
                  <button
                    onClick={() => unblockMasseurForDate(masseur)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '6px 8px',
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'white',
                      fontSize: '11px',
                      gap: '4px'
                    }}
                    title="Bloku götür"
                  >
                    <Unlock size={14} />
                    Aç
                  </button>
                </div>
              );
            })}

            {hours.map((timeSlot) => (
              <div key={timeSlot} style={{ display: 'contents' }}>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'sticky', left: 0, zIndex: 10 }}>
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
                      onClick={() => appointment ? openAppointmentModal(appointment) : openAddForm(masseur._id, timeSlot, false)}
                    >
                    {appointment ? (
  <div style={{ width: '100%', fontSize: '11px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
      <span style={{ fontWeight: '600', color: '#0284c7', fontSize: '10px' }}>
        {new Date(appointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
        {new Date(appointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {appointment.notes && (
          <div 
            title={appointment.notes}
            style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: '#f59e0b',
              cursor: 'help'
            }}
          />
        )}
        <span style={{ color: getStatusDisplay(appointment.status).color }}>
          {getStatusDisplay(appointment.status).icon}
        </span>
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
            <span style={{ color: getPaymentMethodDisplay(appointment.paymentMethod).color }}>
              {getPaymentMethodDisplay(appointment.paymentMethod).icon}
            </span>
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

                {blockedMasseursForToday.map((masseur) => (
                  <div 
                    key={`${masseur._id}-${timeSlot}-blocked`}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      cursor: 'not-allowed',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.5
                    }}
                    onClick={() => alert('Bu masajist bu gün üçün bloklanıb')}
                  >
                    <Ban size={16} color="#9ca3af" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Appointment Modal with Receipt Upload */}
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

              {/* Customer Section */}
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
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                        {foundCustomers.map((customer) => (
                          <div
                            key={customer._id}
                            style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                            onClick={() => selectCustomer(customer)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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

              {/* Advance Payment Section */}
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

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Ödəniş üsulu:</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['cash', 'card', 'terminal'].map(method => {
                            const colors = { cash: '#059669', card: '#3b82f6', terminal: '#8b5cf6' };
                            const bgColors = { cash: '#ecfdf5', card: '#eff6ff', terminal: '#f5f3ff' };
                            const icons = { cash: <Banknote size={16} />, card: <CreditCard size={16} />, terminal: <Monitor size={16} /> };
                            const labels = { cash: 'Nağd', card: 'Kart', terminal: 'Terminal' };
                            return (
                              <button
                                key={method}
                                onClick={() => setAdvanceMethod(method)}
                                style={{
                                  flex: 1,
                                  padding: '10px',
                                  border: '2px solid',
                                  borderColor: advanceMethod === method ? colors[method] : '#e5e7eb',
                                  backgroundColor: advanceMethod === method ? bgColors[method] : 'white',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  color: advanceMethod === method ? colors[method] : '#64748b'
                                }}
                              >
                                {icons[method]}
                                <span style={{ marginLeft: '4px' }}>{labels[method]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Receipt Upload */}
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                          <Image size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          BEH Qəbzisinin Şəkli (İstəyə bağlı):
                        </label>
                        <div style={{
                          border: '2px dashed #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#667eea';
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptFileChange}
                            style={{ display: 'none' }}
                            id="receipt-upload-add"
                          />
                          <label htmlFor="receipt-upload-add" style={{ cursor: 'pointer', display: 'block' }}>
                            <Upload size={20} style={{ margin: '0 auto 8px', color: '#667eea' }} />
                            <div style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Şəkil seçin</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>PNG, JPG (Max 5MB)</div>
                          </label>
                        </div>

                        {receiptPreview && (
                          <div style={{ marginTop: '8px', position: 'relative' }}>
                            <img src={receiptPreview} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px' }} />
                            <button
                              onClick={() => {
                                setReceiptFile(null);
                                setReceiptPreview(null);
                              }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                padding: '4px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
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

              {/* Action Buttons */}
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

      {/* Appointment Details Modal with Receipt Management */}
      {showAppointmentModal && selectedAppointment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, backgroundColor: 'white' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Randevu Təfərrüatları</h3>
              <button onClick={() => setShowAppointmentModal(false)} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Müştəri:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{selectedAppointment.customer?.name}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Telefon:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{selectedAppointment.customer?.phone}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Masajist:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{selectedAppointment.masseur?.name}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Masaj Növü:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{selectedAppointment.massageType?.name}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Başlanğıc:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                  {new Date(selectedAppointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Bitmə:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                  {new Date(selectedAppointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Müddət:</span>
                <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{selectedAppointment.duration} dəqiqə</span>
              </div>
              
              {selectedAppointment.advancePayment?.amount > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>BEH (Ödənilib):</span>
                    <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>
                      {selectedAppointment.advancePayment.amount} AZN ({getPaymentMethodDisplay(selectedAppointment.advancePayment.paymentMethod).text})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Qalan məbləğ:</span>
                    <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>
                      {selectedAppointment.price - selectedAppointment.advancePayment.amount} AZN
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Ümumi qiymət:</span>
                    <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{selectedAppointment.price} AZN</span>
                  </div>
                  
                  {selectedAppointment.advancePayment?.receiptImage?.url && (
                    <div style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>BEH Qəbzisi:</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => viewReceipt(selectedAppointment._id)}
                            style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={14} />
                            Bax
                          </button>
                          {selectedAppointment.status === 'scheduled' && (
                            <button
                              onClick={() => deleteReceiptForAppointment(selectedAppointment._id)}
                              style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Trash2 size={14} />
                              Sil
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Yükləndi: {new Date(selectedAppointment.advancePayment.receiptImage.uploadedAt).toLocaleDateString('az-AZ')}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Qiymət:</span>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{selectedAppointment.price} AZN</span>
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
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{selectedAppointment.notes}</span>
                </div>
              )}

              {selectedAppointment.status === 'scheduled' && (
                <>
                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setShowAppointmentModal(false);
                        openEditModal(selectedAppointment);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
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
                    
                    {selectedAppointment.advancePayment?.amount > 0 && !selectedAppointment.advancePayment?.receiptImage?.url && (
                      <button
                        onClick={() => {
                          setReceiptModalAppointment(selectedAppointment);
                          setShowReceiptModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#f59e0b',
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
                        <Upload size={16} />
                        Qəbzi Yüklə
                      </button>
                    )}
                  </div>

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

                  <button
                    onClick={deleteAppointment}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#fef2f2',
                      color: '#ef4444',
                      border: '1px solid #fecaca',
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
                    <Trash2 size={16} />
                    Randevunu Sil
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Upload Modal */}
      {showReceiptModal && receiptModalAppointment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>BEH Qəbzisini Yüklə</h3>
              <button onClick={() => {
                setShowReceiptModal(false);
                setReceiptModalFile(null);
                setReceiptModalPreview(null);
                setReceiptModalAppointment(null);
              }} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ 
                marginBottom: '16px',
                border: '2px dashed #e5e7eb',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptModalFileChange}
                  style={{ display: 'none' }}
                  id="receipt-upload-modal"
                />
                <label htmlFor="receipt-upload-modal" style={{ cursor: 'pointer', display: 'block' }}>
                  <Upload size={32} style={{ margin: '0 auto 12px', color: '#667eea' }} />
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Şəkil seçin</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>PNG, JPG (Max 5MB)</div>
                </label>
              </div>

            {receiptModalPreview && (
  <div style={{ marginBottom: '16px', position: 'relative' }}>
    <img src={receiptModalPreview} alt="Receipt Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
    <button
      onClick={() => {
        setReceiptModalFile(null);
        setReceiptModalPreview(null);
      }}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        padding: '8px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <X size={16} />
    </button>
  </div>
)}

              <button
                onClick={uploadReceiptForAppointment}
                disabled={!receiptModalFile || uploadingReceiptForAppointment}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: receiptModalFile && !uploadingReceiptForAppointment ? '#667eea' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: receiptModalFile && !uploadingReceiptForAppointment ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {uploadingReceiptForAppointment ? (
                  <>
                    <Clock size={18} />
                    Yüklənir...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Qəbzini Yüklə
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt View Modal */}
      {showReceiptViewModal && receiptViewUrl && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => {
            setShowReceiptViewModal(false);
            setReceiptViewUrl(null);
          }}
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              maxWidth: '800px', 
              maxHeight: '90vh',
              width: '100%',
              overflow: 'hidden',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 20px', 
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: 'white'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Qəbz Şəkli</h3>
              <button 
                onClick={() => {
                  setShowReceiptViewModal(false);
                  setReceiptViewUrl(null);
                }} 
                style={{ 
                  padding: '8px', 
                  border: 'none', 
                  backgroundColor: 'transparent', 
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ 
              padding: '20px', 
              maxHeight: 'calc(90vh - 80px)', 
              overflowY: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <img 
                src={receiptViewUrl} 
                alt="Receipt" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
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
              {/* Customer Section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  <User size={16} style={{ marginRight: '6px' }} />
                  Müştəri:
                </label>
                
                {selectedCustomer ? (
                  <div style={{ padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '500', color: '#059669' }}>{selectedCustomer.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedCustomer.phone}</div>
                  </div>
                ) : null}
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Başlanğıc Vaxtı:</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Price Display */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Qiymət:</label>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', color: '#1e293b', fontWeight: '600', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  {formData.price} AZN
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

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={updateAppointment} style={{ flex: 1, padding: '12px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Save size={16} />
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

      {/* Add Customer Modal */}
      {showCustomerForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Yeni Müştəri</h3>
              <button onClick={() => setShowCustomerForm(false)} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Ad:</label>
                <input
                  type="text"
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="Müştəri adı"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Telefon:</label>
                <input
                  type="text"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="Telefon nömrəsi"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Qeydlər:</label>
                <textarea
                  value={customerFormData.notes}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Əlavə qeydlər"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={addCustomer} style={{ flex: 1, padding: '12px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  Əlavə Et
                </button>
                <button onClick={() => setShowCustomerForm(false)} style={{ flex: 1, padding: '12px 20px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  Ləğv Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Masseur Modal */}
      {showBlockModal && selectedMasseurForBlock && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Masajisti Blokla</h3>
              <button onClick={() => {
                setShowBlockModal(false);
                setSelectedMasseurForBlock(null);
                setBlockReason('');
              }} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b', marginBottom: '4px' }}>
                  {selectedMasseurForBlock.name}
                </div>
                <div style={{ fontSize: '13px', color: '#dc2626' }}>
                  {formatDateDisplay(selectedDate)} tarixində bloklanacaq
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Səbəb (İstəyə bağlı):</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="Məsələn: İstirahət günü, xəstəlik və s."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={blockMasseurForDate} 
                  style={{ 
                    flex: 1, 
                    padding: '12px 20px', 
                    backgroundColor: '#ef4444', 
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
                  <Ban size={16} />
                  Blokla
                </button>
                <button 
                  onClick={() => {
                    setShowBlockModal(false);
                    setSelectedMasseurForBlock(null);
                    setBlockReason('');
                  }} 
                  style={{ 
                    flex: 1, 
                    padding: '12px 20px', 
                    backgroundColor: 'transparent', 
                    color: '#64748b', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    cursor: 'pointer' 
                  }}
                >
                  Ləğv Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>Randevu Tamamlandı!</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {completedCustomerName} üçün WhatsApp bildirişi göndərmək istəyirsiniz?
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  window.open(whatsappLink, '_blank');
                  setShowWhatsAppModal(false);
                  setWhatsappLink('');
                  setCompletedCustomerName('');
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                WhatsApp Göndər
              </button>
              <button
                onClick={() => {
                  setShowWhatsAppModal(false);
                  setWhatsappLink('');
                  setCompletedCustomerName('');
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Keç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}