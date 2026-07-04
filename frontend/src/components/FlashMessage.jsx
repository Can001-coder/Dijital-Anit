import React, { useState, useEffect } from 'react';

const translateMessage = (msg) => {
  if (!msg) return '';
  const cleanMsg = msg.trim().toLowerCase();
  
  if (cleanMsg.includes('failed to fetch') || cleanMsg.includes('networkerror') || cleanMsg.includes('network error')) {
    return 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
  }
  if (cleanMsg.includes('bad credentials')) {
    return 'Kullanıcı adı veya şifre hatalı.';
  }
  if (cleanMsg.includes('token') && cleanMsg.includes('expired')) {
    return 'Oturum süreniz doldu, lütfen tekrar giriş yapın.';
  }
  if (cleanMsg.includes('unauthorized') || cleanMsg.includes('access denied')) {
    return 'Bu işlem için yetkiniz bulunmamaktadır.';
  }
  if (cleanMsg.includes('internal server error')) {
    return 'Sunucuda beklenmeyen bir hata oluştu.';
  }
  if (cleanMsg.includes('bad request')) {
    return 'Geçersiz istek gönderildi.';
  }
  
  return msg;
};

const cleanValidationOrExceptionMessage = (msg) => {
  if (!msg.includes(':')) return msg;
  if (msg.startsWith('http') || msg.startsWith('https')) return msg;
  
  const parts = msg.split(':');
  const part1 = parts[0].trim();
  const part2 = parts.slice(1).join(':').trim();
  
  const hasTurkish = (str) => /[çğıöşüÇĞİÖŞÜ]/.test(str);
  
  const isTechnical = (str) => {
    const s = str.toLowerCase();
    return s.length <= 5 || /^[a-z0-9_\-]+$/.test(s) || ['email', 'username', 'password', 'phonenumber', 'error', 'status', 'exception'].includes(s);
  };

  if (isTechnical(part1) && !isTechnical(part2)) {
    return part2;
  }
  
  if (hasTurkish(part1) && !hasTurkish(part2)) {
    return part1;
  }
  
  if (isTechnical(part1)) {
    return part2;
  }
  return part1;
};

export const showFlash = (message, category = 'success') => {
  let formattedMessage = message;
  if (typeof message === 'string' && message.length > 0) {
    // 1. Türkçe olmayan genel hata kodlarını ve durumları çevir
    formattedMessage = translateMessage(formattedMessage);

    // 2. Mesajda iki nokta (:) varsa, teknik olan kısmı ayıkla ve Türkçe olanı seç
    formattedMessage = cleanValidationOrExceptionMessage(formattedMessage);

    // 3. İlk harfi Türkçe locale duyarlı şekilde büyük yap
    formattedMessage = formattedMessage.charAt(0).toLocaleUpperCase('tr-TR') + formattedMessage.slice(1);
  }
  const event = new CustomEvent('flashMessage', { detail: { message: formattedMessage, category } });
  window.dispatchEvent(event);
};

const FlashMessage = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleFlash = (e) => {
      const id = Date.now();
      const newMessage = { id, ...e.detail };
      setMessages((prev) => [...prev, newMessage]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 5000);
    };

    window.addEventListener('flashMessage', handleFlash);
    return () => window.removeEventListener('flashMessage', handleFlash);
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="flash-messages">
      {messages.map((msg) => (
        <div key={msg.id} className={`alert alert-${msg.category}`}>
          {msg.message}
        </div>
      ))}
    </div>
  );
};

export default FlashMessage;
