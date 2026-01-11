import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Plus, Edit, Trash2, Save, X, Download, RefreshCw, CreditCard, Banknote, Monitor, Building2, Spade } from 'lucide-react';

// BlackJack Oyunu Komponenti
function BlackjackGame({ onClose }) {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState('betting');
  const [message, setMessage] = useState('Yeni oyun başladı!');
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [dealerRevealed, setDealerRevealed] = useState(false);

  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const createDeck = () => {
    const newDeck = [];
    for (let i = 0; i < 6; i++) {
      suits.forEach(suit => {
        values.forEach(value => {
          newDeck.push({ suit, value });
        });
      });
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const getCardValue = (card) => {
    if (card.value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value);
  };

  const calculateScore = (hand) => {
    let score = 0;
    let aces = 0;

    hand.forEach(card => {
      const value = getCardValue(card);
      score += value;
      if (card.value === 'A') aces += 1;
    });

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const startNewGame = () => {
    const newDeck = createDeck();
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setPlayerScore(calculateScore(playerCards));
    setDealerScore(calculateScore([dealerCards[0]]));
    setGameStatus('playing');
    setMessage('Oyun başladı! Kart çək və ya dayan.');
    setDealerRevealed(false);

    if (calculateScore(playerCards) === 21) {
      setMessage('🎉 BLACKJACK! Qazandınız!');
      setGameStatus('finished');
      setWins(wins + 1);
      setDealerRevealed(true);
    }
  };

  const hit = () => {
    if (gameStatus !== 'playing') return;

    const newCard = deck.pop();
    const newPlayerHand = [...playerHand, newCard];
    const newScore = calculateScore(newPlayerHand);

    setPlayerHand(newPlayerHand);
    setPlayerScore(newScore);
    setDeck([...deck]);

    if (newScore > 21) {
      setMessage('💥 Məğlub oldunuz! 21-dən çox oldu.');
      setGameStatus('finished');
      setLosses(losses + 1);
      setDealerRevealed(true);
    } else if (newScore === 21) {
      dealerTurn(newPlayerHand);
    }
  };

  const stand = () => {
    if (gameStatus !== 'playing') return;
    dealerTurn(playerHand);
  };

  const dealerTurn = (finalPlayerHand) => {
    setGameStatus('dealer');
    setDealerRevealed(true);
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    let dealerCurrentScore = calculateScore(currentDealerHand);

    setTimeout(() => {
      const dealerPlay = () => {
        dealerCurrentScore = calculateScore(currentDealerHand);

        if (dealerCurrentScore < 17) {
          setTimeout(() => {
            const newCard = currentDeck.pop();
            currentDealerHand = [...currentDealerHand, newCard];
            setDealerHand(currentDealerHand);
            setDeck([...currentDeck]);
            dealerPlay();
          }, 800);
        } else {
          finishGame(finalPlayerHand, currentDealerHand);
        }
      };

      dealerPlay();
    }, 500);
  };

  const finishGame = (finalPlayerHand, finalDealerHand) => {
    const playerFinalScore = calculateScore(finalPlayerHand);
    const dealerFinalScore = calculateScore(finalDealerHand);

    setPlayerScore(playerFinalScore);
    setDealerScore(dealerFinalScore);

    if (dealerFinalScore > 21) {
      setMessage('oynaya bilirsenmis');
      setWins(wins + 1);
    } else if (playerFinalScore > dealerFinalScore) {
      setMessage('canavarsanmiski');
      setWins(wins + 1);
    } else if (playerFinalScore < dealerFinalScore) {
      setMessage('uduzdunsa kofemi hazirla');
      setLosses(losses + 1);
    } else {
      setMessage('🤝 Bərabərə! Heç kim qazanmadı.');
    }

    setGameStatus('finished');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const getCardColor = (suit) => {
    return suit === '♥' || suit === '♦' ? '#ef4444' : '#000000';
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Spade size={32} color="#fbbf24" />
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#fbbf24', margin: 0 }}>BlackJack 21</h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: '#1e293b', padding: '12px 20px', borderRadius: '8px', border: '2px solid #10b981' }}>
            <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>Qələbələr: {wins}</span>
          </div>
          <div style={{ background: '#1e293b', padding: '12px 20px', borderRadius: '8px', border: '2px solid #ef4444' }}>
            <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Məğlubiyyətlər: {losses}</span>
          </div>
          <button onClick={onClose} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Hesabata Qayıt
          </button>
        </div>
      </div>

      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '30px', marginBottom: '20px', border: '2px solid #334155' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: gameStatus === 'finished' ? '#fbbf24' : '#94a3b8', margin: '0 0 10px 0' }}>
            {message}
          </h2>
        </div>

        {/* Diler Əli */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#94a3b8', margin: 0 }}>Diler</h3>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fbbf24' }}>
              {dealerRevealed ? dealerScore : '?'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {dealerHand.map((card, index) => (
              <div key={index} style={{
                width: '100px',
                height: '140px',
                background: (index === 1 && !dealerRevealed) ? '#334155' : 'white',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                border: '2px solid #475569',
                position: 'relative'
              }}>
                {index === 1 && !dealerRevealed ? (
                  <div style={{ fontSize: '48px', color: '#64748b' }}>🂠</div>
                ) : (
                  <>
                    <div style={{ fontSize: '36px', color: getCardColor(card.suit), fontWeight: '700' }}>
                      {card.value}
                    </div>
                    <div style={{ fontSize: '32px', color: getCardColor(card.suit) }}>
                      {card.suit}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Oyunçu Əli */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#94a3b8', margin: 0 }}>Siz</h3>
            <div style={{ fontSize: '24px', fontWeight: '700', color: playerScore > 21 ? '#ef4444' : '#10b981' }}>
              {playerScore}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {playerHand.map((card, index) => (
              <div key={index} style={{
                width: '100px',
                height: '140px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                border: '2px solid #475569'
              }}>
                <div style={{ fontSize: '36px', color: getCardColor(card.suit), fontWeight: '700' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '32px', color: getCardColor(card.suit) }}>
                  {card.suit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Oyun Düymələri */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {gameStatus === 'playing' && (
          <>
            <button onClick={hit} style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
              transition: 'transform 0.1s'
            }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
              KART ÇƏK
            </button>
            <button onClick={stand} style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)',
              transition: 'transform 0.1s'
            }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
              DAYAN
            </button>
          </>
        )}
        {gameStatus === 'finished' && (
          <button onClick={startNewGame} style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 48px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)',
            transition: 'transform 0.1s'
          }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            YENİ OYUN
          </button>
        )}
        {gameStatus === 'dealer' && (
          <div style={{
            background: '#1e293b',
            color: '#fbbf24',
            border: '2px solid #fbbf24',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '700'
          }}>
            Diler oynayır...
          </div>
        )}
      </div>

      {/* Oyun Qaydaları */}
      <div style={{ marginTop: '40px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h3 style={{ color: '#fbbf24', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>📜 Oyun Qaydaları:</h3>
        <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Məqsəd: 21 xala çatmaq və ya ona yaxın olmaq (keçmədən)</li>
          <li>As: 1 və ya 11 xal (avtomatik seçilir)</li>
          <li>Şah, Valet, Qız: 10 xal</li>
          <li>Digər kartlar: Üzərindəki rəqəm qədər xal</li>
          <li>AI 17-yə çatana qədər kart çəkməlidir</li>
          <li>21-dən çox xal toplayanda məğlub olursunuz</li>
        </ul>
      </div>
    </div>
  );
}

export default function Hesabat() {
  const [activeTab, setActiveTab] = useState('gelir');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBlackjack, setShowBlackjack] = useState(false);
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

  const getToken = () => {
    try {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(c => c.trim().startsWith('authToken='));
      return authCookie ? authCookie.split('=')[1] : null;
    } catch {
      return null;
    }
  };

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

        // Filter out cards with broken/null references
        const validCards = cards.filter(card => {
          // Check if essential populated fields exist
          const hasValidMassageType = card.massageType || (card.massages && card.massages.length > 0);
          const hasValidCustomer = card.purchasedBy;
          const hasValidPrice = (card.originalPrice != null && card.originalPrice > 0) || (card.totalValue != null && card.totalValue > 0);

          return hasValidMassageType && hasValidCustomer && hasValidPrice;
        });

        setGiftCards(validCards.map(card => {
          // Handle both old and new format
          const price = card.originalPrice || card.totalValue || 0;
          const massageInfo = card.massageType
            ? `${card.massageType.name} (${card.duration}dəq)`
            : card.massages && card.massages.length > 0
              ? `${card.massages.length} masaj`
              : 'N/A';

          return {
            id: card._id,
            tarix: card.purchaseDate,
            mebleg: price,
            odenisUsulu: card.paymentMethod || 'cash',
            izzahat: `Hədiyyə Kartı - ${massageInfo} - ${card.purchasedBy?.name || 'N/A'}`,
            customer: card.purchasedBy,
            massageType: card.massageType,
            duration: card.duration,
            cardNumber: card.cardNumber,
            isGiftCard: true
          };
        }));
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
      const amount = card.mebleg || 0; // Null-safety check
      if (card.odenisUsulu === 'cash') stats.cash += amount;
      if (card.odenisUsulu === 'card') stats.card += amount;
      if (card.odenisUsulu === 'terminal') stats.terminal += amount;
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

      if (gelir.tips && gelir.tips.amount > 0 && gelir.tips.paymentMethods) {
        const tipPM = gelir.tips.paymentMethods;
        stats.cash += tipPM.cash || 0;
        stats.card += tipPM.card || 0;
        stats.terminal += tipPM.terminal || 0;
      }

    });

    return stats;
  };


  const calculateTotalTips = () => {
    let totalTips = 0;
    gelirler.forEach(gelir => {
      if (gelir.tips && gelir.tips.amount > 0) {
        totalTips += gelir.tips.amount;
      }
    });

    return totalTips;
  };

  const calculateTipsStats = () => {
    const stats = { cash: 0, card: 0, terminal: 0 };

    gelirler.forEach(gelir => {
      if (gelir.tips && gelir.tips.amount > 0 && gelir.tips.paymentMethods) {
        const tipPM = gelir.tips.paymentMethods;
        stats.cash += tipPM.cash || 0;
        stats.card += tipPM.card || 0;
        stats.terminal += tipPM.terminal || 0;
      }
    });

    return stats;
  };


  const calculateTotalRevenue = () => {
    let total = 0;
    total += behler.reduce((sum, beh) => sum + beh.mebleg, 0);
    // Null-safety check for gift card amounts
    total += giftCards.reduce((sum, card) => sum + (card.mebleg || 0), 0);
    const tips = calculateTotalTips();
    total += tips;
    gelirler.forEach(gelir => {
      if (gelir.isMixed) {
        total += (gelir.cash || 0) + (gelir.card || 0) + (gelir.terminal || 0);
      } else {
        total += gelir.amount || 0;
      }
    });

    return total;
  };



  const calculateTotalExpenses = () => {
    return xercler.reduce((sum, xerc) => sum + xerc.mebleg, 0);
  };

  const calculateNetProfit = () => {
    return calculateTotalRevenue() - calculateTotalExpenses();
  };

  const openAddModal = () => {
    setModalType('add');
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: selectedDate
    });
    setShowModal(true);
  };

  const openEditModal = (item, type) => {
    setModalType('edit');
    setEditingItem(item);
    setEditingType(type);

    if (type === 'xerc') {
      setFormData({
        amount: item.mebleg.toString(),
        description: item.izzahat,
        category: item.category,
        date: item.tarix.split('T')[0]
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setEditingType('');
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: selectedDate
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      await addExpense();
    } else {
      await editExpense();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `${(amount || 0).toFixed(2)} ₼`;
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tarix,Növ,Açıqlama,Məbləğ,Ödəniş Üsulu\n";

    behler.forEach(beh => {
      csvContent += `${formatDate(beh.tarix)},BEH,${beh.izzahat},${beh.mebleg},${beh.odenisUsulu}\n`;
    });

    giftCards.forEach(card => {
      csvContent += `${formatDate(card.tarix)},Hədiyyə Kartı,${card.izzahat},${card.mebleg},${card.odenisUsulu}\n`;
    });

    gelirler.forEach(gelir => {
      const amount = gelir.isMixed ? gelir.total : gelir.amount;
      const paymentMethod = gelir.isMixed ? 'qarışıq' : gelir.paymentMethod;
      csvContent += `${formatDate(gelir.tarix)},TAM,${gelir.izzahat},${amount},${paymentMethod}\n`;
    });

    xercler.forEach(xerc => {
      csvContent += `${formatDate(xerc.tarix)},XƏRC,${xerc.izzahat},${xerc.mebleg},-\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hesabat_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showBlackjack) {
    return <BlackjackGame onClose={() => setShowBlackjack(false)} />;
  }

  const paymentStats = calculatePaymentStats();
  const totalRevenue = calculateTotalRevenue();
  const totalExpenses = calculateTotalExpenses();
  const netProfit = calculateNetProfit();
  const totalTips = calculateTotalTips();
  const tipsStats = calculateTipsStats();

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Maliyyə Hesabatı</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {userData?.username === "leman" && (<button onClick={() => setShowBlackjack(true)} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>

              el vurma
            </button>)}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', color: '#475569' }}
            />
            <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={18} />
              Yenilə
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e0e7ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
          <Building2 size={20} color="#4f46e5" />
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#4f46e5' }}>İşçi : {userData?.name || 'Novruzlu Jala'}</span>
        </div>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0' }}>{userData?.branch.name}</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="#16a34a" />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Ümumi Gəlir</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>{formatCurrency(totalRevenue)}</p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            {gelirler.length} ödəniş + {behler.length} BEH + {giftCards.length} kart
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={24} color="#dc2626" />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Günlük Xərc</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>{formatCurrency(totalExpenses)}</p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{xercler.length} xərc</p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} color="#2563eb" />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Xalis Gəlir</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>{formatCurrency(netProfit)}</p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Mənfəət</p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} color="#f59e0b" />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 8px 0' }}>Ümumi Bəxşiş</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>{formatCurrency(totalTips)}</p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Bəxşişlər</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Ödəniş Üsullarına görə:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <Banknote size={24} color="#16a34a" />
            <div>
              <p style={{ fontSize: '12px', color: '#15803d', margin: 0, fontWeight: '500' }}>Nağd</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#15803d', margin: 0 }}>{formatCurrency(paymentStats.cash)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <CreditCard size={24} color="#2563eb" />
            <div>
              <p style={{ fontSize: '12px', color: '#1e40af', margin: 0, fontWeight: '500' }}>Bank Kartı</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af', margin: 0 }}>{formatCurrency(paymentStats.card)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
            <Monitor size={24} color="#7c3aed" />
            <div>
              <p style={{ fontSize: '12px', color: '#6d28d9', margin: 0, fontWeight: '500' }}>Terminal</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#6d28d9', margin: 0 }}>{formatCurrency(paymentStats.terminal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Breakdown */}
      {totalTips > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Bəxşişlər (Ödəniş Üsullarına görə):</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <Banknote size={24} color="#f59e0b" />
              <div>
                <p style={{ fontSize: '12px', color: '#b45309', margin: 0, fontWeight: '500' }}>Nağd Bəxşiş</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#b45309', margin: 0 }}>{formatCurrency(tipsStats.cash)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <CreditCard size={24} color="#f59e0b" />
              <div>
                <p style={{ fontSize: '12px', color: '#b45309', margin: 0, fontWeight: '500' }}>Kart Bəxşiş</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#b45309', margin: 0 }}>{formatCurrency(tipsStats.card)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <Monitor size={24} color="#f59e0b" />
              <div>
                <p style={{ fontSize: '12px', color: '#b45309', margin: 0, fontWeight: '500' }}>Terminal Bəxşiş</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#b45309', margin: 0 }}>{formatCurrency(tipsStats.terminal)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('gelir')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'gelir' ? '#3b82f6' : 'transparent',
              color: activeTab === 'gelir' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={18} />
            Gəlirlər ({gelirler.length + behler.length + giftCards.length})
          </button>
          <button
            onClick={() => setActiveTab('xerc')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'xerc' ? '#3b82f6' : 'transparent',
              color: activeTab === 'xerc' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingDown size={18} />
            Xərclər ({xercler.length})
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
        <button onClick={exportToExcel} style={{ background: '#64748b', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} />
          İxrac Et
        </button>
        {activeTab === 'xerc' && (
          <button onClick={openAddModal} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Gəlir Əlavə Et
          </button>
        )}
      </div>

      {/* Content Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Tarix</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Növ</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Açıqlama</th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Məbləğ</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Ödəniş</th>
              {activeTab === 'xerc' && (
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Əməliyyat</th>
              )}
            </tr>
          </thead>
          <tbody>
            {activeTab === 'gelir' && (
              <>
                {behler.map(beh => (
                  <tr key={beh.id} style={{ borderBottom: '1px solid #e2e8f0', background: '#fef3c7' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b' }}>{formatDate(beh.tarix)}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>BEH</span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{beh.izzahat}</td>
                    <td style={{ padding: '16px', fontSize: '16px', fontWeight: '700', color: '#f59e0b', textAlign: 'right' }}>{formatCurrency(beh.mebleg)}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>
                        {beh.odenisUsulu === 'cash' && <><Banknote size={16} /> Nağd</>}
                        {beh.odenisUsulu === 'card' && <><CreditCard size={16} /> Bank Kartı</>}
                        {beh.odenisUsulu === 'terminal' && <><Monitor size={16} /> Terminal</>}
                      </span>
                    </td>
                  </tr>
                ))}
                {giftCards.map(card => (
                  <tr key={card.id} style={{ borderBottom: '1px solid #e2e8f0', background: '#fce7f3' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b' }}>{formatDate(card.tarix)}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: '#ec4899', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>KART</span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{card.izzahat}</td>
                    <td style={{ padding: '16px', fontSize: '16px', fontWeight: '700', color: '#ec4899', textAlign: 'right' }}>{formatCurrency(card.mebleg)}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>
                        {card.odenisUsulu === 'cash' && <><Banknote size={16} /> Nağd</>}
                        {card.odenisUsulu === 'card' && <><CreditCard size={16} /> Bank Kartı</>}
                        {card.odenisUsulu === 'terminal' && <><Monitor size={16} /> Terminal</>}
                      </span>
                    </td>
                  </tr>
                ))}
                {gelirler.map(gelir => (
                  <tr key={gelir.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b' }}>{formatDate(gelir.tarix)}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>TAM</span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{gelir.izzahat}</td>
                    <td style={{ padding: '16px', fontSize: '16px', fontWeight: '700', color: '#10b981', textAlign: 'right' }}>
                      {gelir.isMixed ? formatCurrency(gelir.total) : formatCurrency(gelir.amount)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {gelir.isMixed ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                          {gelir.cash > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#475569' }}>
                              <Banknote size={14} /> {formatCurrency(gelir.cash)}
                            </span>
                          )}
                          {gelir.card > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#475569' }}>
                              <CreditCard size={14} /> {formatCurrency(gelir.card)}
                            </span>
                          )}
                          {gelir.terminal > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#475569' }}>
                              <Monitor size={14} /> {formatCurrency(gelir.terminal)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>
                          {gelir.paymentMethod === 'cash' && <><Banknote size={16} /> Nağd</>}
                          {gelir.paymentMethod === 'card' && <><CreditCard size={16} /> Bank Kartı</>}
                          {gelir.paymentMethod === 'terminal' && <><Monitor size={16} /> Terminal</>}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </>
            )}
            {activeTab === 'xerc' && xercler.map(xerc => (
              <tr key={xerc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b' }}>{formatDate(xerc.tarix)}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>XƏRC</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>{xerc.izzahat}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{xerc.category}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '16px', fontWeight: '700', color: '#ef4444', textAlign: 'right' }}>{formatCurrency(xerc.mebleg)}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>-</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button onClick={() => openEditModal(xerc, 'xerc')} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteExpense(xerc.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activeTab === 'gelir' && (gelirler.length + behler.length + giftCards.length) === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '16px', margin: 0 }}>Bu tarixdə gəlir qeydləri tapılmadı</p>
          </div>
        )}
        {activeTab === 'xerc' && xercler.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '16px', margin: 0 }}>Bu tarixdə xərc qeydləri tapılmadı</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {modalType === 'add' ? 'Yeni Xərc' : 'Xərci Redaktə Et'}
              </h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Məbləğ</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="0.00"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Kateqoriya</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                >
                  <option value="">Seçin...</option>
                  {xercKateqoriyalari.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div><div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>İzahat</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', minHeight: '100px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  placeholder="Xərc haqqında qeyd..."
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Tarix</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={18} />
                  {loading ? 'Saxlanılır...' : 'Saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RefreshCw size={24} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '16px', color: '#1e293b', fontWeight: '600' }}>Yüklənir...</span>
          </div>
        </div>
      )}
    </div>);
}