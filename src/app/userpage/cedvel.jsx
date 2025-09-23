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
  ChevronDown
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
    notes: ''
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
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // User branch info
  const userData = getUserData();
  const userBranch = userData?.branch;

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
    if (userData && userBranch) {
      fetchInitialData();
    }
  }, []);

  // Fetch appointments when date changes
  useEffect(() => {
    if (userData && userBranch && masseurs.length > 0) {
      fetchDayAppointments();
    }
  }, [selectedDate, masseurs]);

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
      if (massageTypeId && prev.duration) {
        newFormData.price = calculatePrice(massageTypeId, prev.duration);
      }
      return newFormData;
    });
  };

  const handleDurationChange = (duration) => {
    setFormData(prev => {
      const newFormData = { ...prev, duration: duration };
      if (prev.massageType && duration) {
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

    if (!userData?.branch?._id) {
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
        branch: userData.branch._id,
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
        await fetchDayAppointments(); // Refresh appointments
        resetForm();
        alert('Randevu uğurla əlavə edildi!');
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
      notes: ''
    });
    setSearchPhone('');
    setFoundCustomers([]);
    setSelectedCustomer(null);
    setShowCustomerDropdown(false);
    setShowAddForm(false);
    setSelectedSlot(null);
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
              {/* Customer Search with Dropdown */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Müştəri Axtarışı (Telefon və ya Ad):</label>
                <div style={styles.searchContainer}>
                  <div style={styles.searchRow}>
                    <input
                      type="text"
                      value={searchPhone}
                      onChange={(e) => {
                        setSearchPhone(e.target.value);
                        searchCustomersByPhone(e.target.value);
                      }}
                      style={styles.input}
                      placeholder="+994501234567 və ya müştəri adı"
                    />
                    <Search size={16} color="#6b7280" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>

                  {/* Customer Dropdown */}
                  {showCustomerDropdown && foundCustomers.length > 0 && (
                    <div style={styles.dropdown}>
                      {foundCustomers.map(customer => (
                        <div
                          key={customer._id}
                          style={styles.dropdownItem}
                          onClick={() => selectCustomer(customer)}
                        >
                          <div style={styles.dropdownItemInfo}>
                            <span style={styles.dropdownItemName}>{customer.name}</span>
                            <span style={styles.dropdownItemPhone}>{customer.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Customer Display */}
                  {selectedCustomer && (
                    <div style={styles.selectedCustomer}>
                      <User size={16} />
                      <span>{selectedCustomer.name} - {selectedCustomer.phone}</span>
                    </div>
                  )}

                  {/* Add New Customer Button */}
                  {searchPhone && foundCustomers.length === 0 && showCustomerDropdown === false && (
                    <button 
                      onClick={() => {
                        setCustomerFormData(prev => ({ ...prev, phone: searchPhone }));
                        setShowCustomerForm(true);
                      }} 
                      style={styles.addCustomerBtn}
                    >
                      <Plus size={16} />
                      Yeni müştəri əlavə et
                    </button>
                  )}
                </div>
              </div>

              {/* Selected Masseur (Read-only) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Masajist:</label>
                <input
                  type="text"
                  value={masseurs.find(m => m._id === formData.masseur)?.name || ''}
                  readOnly
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Masaj Növü:</label>
                  <select
                    value={formData.massageType}
                    onChange={(e) => handleMassageTypeChange(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Masaj növü seçin</option>
                    {massageTypes.map(type => (
                      <option key={type._id} value={type._id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Başlama Vaxtı:</label>
                  <input
                    type="text"
                    value={selectedSlot?.time || ''}
                    readOnly
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Müddət:</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Müddət seçin</option>
                    {getAvailableDurations().map(duration => (
                      <option key={duration.minutes} value={duration.minutes}>
                        {duration.minutes} dəqiqə - {duration.price} AZN
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Qiymət:</label>
                  <input
                    type="number"
                    value={formData.price}
                    readOnly
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Qeydlər:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={styles.textarea}
                  rows={3}
                  placeholder="Əlavə qeydlər (istəyə bağlı)"
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={addAppointment} style={styles.saveButton}>
                <Save size={16} />
                Saxla
              </button>
              <button onClick={resetForm} style={styles.cancelButton}>
                <X size={16} />
                Ləğv Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Randevu Təfərrüatları</h3>
              <button onClick={() => setShowAppointmentModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.appointmentDetails}>
                <div style={styles.detailRow}>
                  <User size={20} />
                  <div>
                    <strong>Müştəri:</strong> {selectedAppointment.customer?.name}
                    <br />
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Telefon: {selectedAppointment.customer?.phone}</span>
                  </div>
                </div>

                <div style={styles.detailRow}>
                  <Calendar size={20} />
                  <div>
                    <strong>Tarix və Vaxt:</strong> {formatDateDisplay(selectedDate)}
                    <br />
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      {new Date(selectedAppointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(selectedAppointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div style={styles.detailRow}>
                  <Users size={20} />
                  <div>
                    <strong>Masajist:</strong> {selectedAppointment.masseur?.name}
                  </div>
                </div>

                <div style={styles.detailRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span><strong>Masaj Növü:</strong> {selectedAppointment.massageType?.name}</span>
                    <span style={{ color: '#6b7280' }}>({selectedAppointment.duration} dəqiqə)</span>
                  </div>
                </div>

                <div style={styles.detailRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span><strong>Qiymət:</strong> {selectedAppointment.price} AZN</span>
                    {(() => {
                      const status = getStatusDisplay(selectedAppointment.status);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: status.color }}>
                          {status.icon}
                          <span>{status.text}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {selectedAppointment.paymentMethod && (
                  <div style={styles.detailRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>Ödəniş:</strong>
                      {(() => {
                        const payment = getPaymentMethodDisplay(selectedAppointment.paymentMethod);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: payment.color }}>
                            {payment.icon}
                            <span>{payment.text}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div style={styles.detailRow}>
                    <strong>Qeydlər:</strong>
                    <div style={{ marginTop: '4px', padding: '8px', background: '#f8fafc', borderRadius: '6px', fontSize: '14px' }}>
                      {selectedAppointment.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Options (if not completed) */}
              {selectedAppointment.status !== 'completed' && (
                <div style={styles.paymentSection}>
                  <h4 style={{ margin: '20px 0 12px 0', color: '#374151' }}>Ödəniş Üsulu Seçin:</h4>
                  <div style={styles.paymentButtons}>
                    <button 
                      onClick={() => completeAppointment('cash')} 
                      style={styles.paymentButton}
                    >
                      <Banknote size={20} />
                      Nağd Ödəniş
                    </button>
                    <button 
                      onClick={() => completeAppointment('card')} 
                      style={{...styles.paymentButton, background: '#3b82f6'}}
                    >
                      <CreditCard size={20} />
                      Kart ilə Ödəniş
                    </button>
                    <button 
                      onClick={() => completeAppointment('terminal')} 
                      style={{...styles.paymentButton, background: '#8b5cf6'}}
                    >
                      <Monitor size={20} />
                      Terminal
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowAppointmentModal(false)} style={styles.cancelButton}>
                <X size={16} />
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
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
                <label style={styles.label}>Ad və Soyad:</label>
                <input
                  type="text"
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={styles.input}
                  placeholder="Müştəri adını daxil edin"
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
                  rows={3}
                  placeholder="Əlavə məlumatlar (istəyə bağlı)"
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={addCustomer} style={styles.saveButton}>
                <Save size={16} />
                Saxla
              </button>
              <button onClick={() => setShowCustomerForm(false)} style={styles.cancelButton}>
                <X size={16} />
                Ləğv Et
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
    padding: '20px',
    background: '#f8fafc',
    minHeight: '100vh'
  },

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },

  loading: {
    fontSize: '18px',
    color: '#6b7280'
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
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  branchInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'white',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
    justifyContent: 'space-between',
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  dateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  dateTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#1e293b'
  },

  dateText: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0
  },

  masseursInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#e0f2fe',
    color: '#0284c7',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },

  scheduleContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'auto'
  },

  scheduleGrid: {
    display: 'grid',
    minWidth: '1200px'
  },

  timeColumn: {
    background: '#f8fafc',
    padding: '12px',
    fontWeight: '600',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151'
  },

  masseurHeader: {
    background: '#f8fafc',
    padding: '12px',
    textAlign: 'center',
    borderRight: '1px solid #e5e7eb',
    borderBottom: '2px solid #e5e7eb'
  },

  masseurName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px'
  },

  masseurSpecialty: {
    fontSize: '12px',
    color: '#6b7280'
  },

  scheduleRow: {
    display: 'contents'
  },

  timeCell: {
    background: '#f8fafc',
    padding: '8px',
    borderRight: '1px solid #e5e7eb',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60px'
  },

  timeLabel: {
    fontSize: '12px',
    color: '#374151'
  },

  timeSlot: {
    borderRight: '1px solid #e5e7eb',
    borderBottom: '1px solid #f3f4f6',
    minHeight: '60px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative'
  },

  emptySlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    opacity: 0.5,
    transition: 'opacity 0.2s ease'
  },

  appointmentCard: {
    width: '100%',
    height: '100%',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },

  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },

  appointmentTime: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#0284c7'
  },

  statusBadge: {
    display: 'flex',
    alignItems: 'center'
  },

  appointmentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  customerName: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  massageType: {
    fontSize: '9px',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  appointmentFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  price: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#059669'
  },

  paymentBadge: {
    display: 'flex',
    alignItems: 'center'
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },

  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '600px',
    maxHeight: '80vh',
    overflow: 'auto'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb'
  },

  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },

  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280'
  },

  modalBody: {
    padding: '20px'
  },

  formGroup: {
    marginBottom: '16px'
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },

  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },

  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease'
  },

  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: 'white',
    transition: 'border-color 0.2s ease'
  },

  searchContainer: {
    position: 'relative'
  },

  searchRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '2px solid #e5e7eb',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000
  },

  dropdownItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s ease'
  },

  dropdownItemInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  dropdownItemName: {
    fontWeight: '500',
    color: '#374151'
  },

  dropdownItemPhone: {
    fontSize: '14px',
    color: '#6b7280'
  },

  selectedCustomer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    padding: '8px 12px',
    background: '#dcfce7',
    borderRadius: '6px',
    color: '#166534',
    fontSize: '14px'
  },

  addCustomerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px'
  },

  appointmentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px'
  },

  paymentSection: {
    marginTop: '24px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '8px'
  },

  paymentButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },

  paymentButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px'
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #e5e7eb'
  },

  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },

  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};