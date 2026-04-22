/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, ChevronRight, CheckCircle2, Loader2, Send, CreditCard } from 'lucide-react';
import { WILAYAS } from './data/algeria-locations';

// --- Constants & Types ---

const PRODUCTS = [
  {
    id: 1,
    name: { ar: "HK collection", en: "HK collection" },
    brand: "WATCH",
    category: "Classic",
    price: 1900 ,
    image: "/silver.jpg",
  },
  {
    id: 2,
    name: { ar: "HK collection", en: "HK collection" },
    brand: "WATCH",
    category: "Luxury",
    price: 1900,
    image: "/black.jpg",
  },
  {
    id: 3,
    name: { ar: "swatch swiss", en: "swatch swiss" },
    brand: "WATCH",
    category: "Sport",
    price: 1900,
    image: "/swatch.white.jpg",
  },
  {
    id: 4,
    name: { ar: "swatch swiss", en: "swatch swiss" },
    brand: "WATCH",
    category: "Sport",
    price: 1900,
    image: "/swatch.black.jpg",
  },
  {
    id: 5,
    name: { ar: "swatch swiss", en: "swatch swiss" },
    brand: "WATCH",
    category: "Sport",
    price: 1900,
    image: "/swatch.goldb.jpg",
  },
  {
    id: 6,
    name: { ar: "swatch swiss", en: "swatch swiss" },
    brand: "WATCH",
    category: "Sport",
    price: 1900,
    image: "/swatch.gold.jpg",
  }
];

const TRANSLATIONS = {
  ar: {
    heroTitle: "الفخامة في كل ثانية",
    heroSubtitle: "مجموعة فاخرة 2026",
    discover: "اكتشف المجموعة",
    selectedCollections: "المجموعات المختارة",
    exceptionalPieces: "قطع استثنائية",
    orderNow: "اطلب الآن",
    all: "الكل",
    luxury: "فاخرة",
    sport: "رياضية",
    classic: "كلاسيكية",
    footerCopy: "جميع الحقوق محفوظة لمتجر جواهر",
    checkoutTitle: "نموذج الطلب",
    chooseProduct: "يرجى اختيار منتج أولاً",
    selectedProduct: "المنتج المختار",
    customerDetails: "تفاصيل الزبون",
    fullName: "الاسم واللقب",
    fullNamePlaceholder: "أدخل اسمك ولقبك",
    phone: "رقم الهاتف",
    phonePlaceholder: "مثال: 06XXXXXXXX",
    wilaya: "الولاية",
    selectWilaya: "اختر الولاية",
    commune: "البلدية",
    communePlaceholder: "البلدية",
    address: "العنوان الكامل",
    addressPlaceholder: "أدخل عنوان السكن بالتفصيل",
    confirmOrder: "تأكيد الطلب الآن",
    orderSuccess: "تم إرسال طلبك بنجاح!",
    orderContact: "سنتواصل معك قريباً لتأكيد تفاصيل الشحن.",
    backToStore: "العودة للمتجر",
    error: "فشل إرسال الطلب. يرجى المحاولة لاحقاً.",
    storeTag: "متجر جواهر - الجزائر"
  },
  en: {
    heroTitle: "Luxury in Every Second",
    heroSubtitle: "Luxury Selection 2026",
    discover: "Discover Collection",
    selectedCollections: "Selected Collections",
    exceptionalPieces: "Exceptional Pieces",
    orderNow: "Order Now",
    all: "All",
    luxury: "Luxury",
    sport: "Sport",
    classic: "Classic",
    footerCopy: "All rights reserved to Jawaher Store",
    checkoutTitle: "Checkout Form",
    chooseProduct: "Please choose a product first",
    selectedProduct: "Selected Product",
    customerDetails: "Customer Details",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    phone: "Phone Number",
    phonePlaceholder: "Example: 06XXXXXXXX",
    wilaya: "Wilaya",
    selectWilaya: "Select Wilaya",
    commune: "Municipality",
    communePlaceholder: "Municipality",
    address: "Full Address",
    addressPlaceholder: "Enter complete address details",
    confirmOrder: "Confirm Order Now",
    orderSuccess: "Order Sent Successfully!",
    orderContact: "We will contact you soon to confirm shipping details.",
    backToStore: "Back to Store",
    error: "Order submission failed. Please try again later.",
    storeTag: "Jawaher Store - Algeria"
  }
};

interface Product {
  id: number;
  name: { ar: string; en: string };
  brand: string;
  category: string;
  price: number;
  image: string;
}

// --- Components ---

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: ''
  });

  const t = TRANSLATIONS[lang];

  const totalAmount = selectedProduct?.price || 0;

  const filteredProducts = activeFilter === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeFilter);

  // Submit Order to Google Sheets
  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setOrderStatus('loading');

    // IMPORTANT: Point this to your Google Apps Script Web App URL
    const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxzsYEY9sG1vF-faUm8DNgfXA5sbDiJutAJqhKOIJBejWRhalO8se7hhKQarPhbMAW6/exec";

    try {
      const orderData = {
        customerName: formData.fullName,
        phone: formData.phone,
        wilaya: formData.wilaya,
        commune: formData.commune,
        address: formData.address,
        items: [`${selectedProduct.name[lang]} (1)`],
        brand: item.brand,
        totalPrice: totalAmount,
        timestamp: new Date().toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US')
      };

      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      setOrderStatus('success');
      setSelectedProduct(null);
      setFormData({ fullName: '', phone: '', wilaya: '', commune: '', address: '' });
      
    } catch (error) {
      console.error("Order submission failed:", error);
      setOrderStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="glass-nav py-5 px-6 sm:px-12 flex justify-between items-center text-white">
        <h1 className="font-display text-2xl font-bold tracking-[0.2em] uppercase">JAWAHER</h1>
        <div className="flex items-center gap-6">
          <div className="text-gold text-[10px] font-bold tracking-[3px] uppercase hidden md:block">{t.storeTag}</div>
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="text-[10px] font-bold border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/5 transition-colors uppercase tracking-[2px] text-white/70 hover:text-white font-sans"
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-bg/80 to-bg" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 px-6"
        >
          <p className="text-gold uppercase tracking-[6px] text-xs font-bold mb-4">{t.heroSubtitle}</p>
          <h2 className="font-display text-5xl md:text-8xl font-bold text-white mb-8 leading-tight">
            {lang === 'ar' ? <>الفخامة في<br />كل ثانية</> : <>Luxury In<br />Every Second</>}
          </h2>
          <a href="#collection" className="btn-primary">{t.discover}</a>
        </motion.div>
      </header>

      {/* Product Collection */}
      <section id="collection" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-gold uppercase tracking-[4px] text-[10px] font-bold mb-2">{t.selectedCollections}</p>
          <h3 className="font-display text-4xl font-bold">{t.exceptionalPieces}</h3>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Luxury', 'Sport', 'Classic'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border DA {
                activeFilter === filter 
                ? 'border-gold text-gold bg-gold/10' 
                : 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
              }`}
            >
              {filter === 'All' ? t.all : filter === 'Luxury' ? t.luxury : filter === 'Sport' ? t.sport : t.classic}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-white">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="product-card"
              >
                <div className="aspect-[4/5] overflow-hidden bg-white/5 relative group">
                  <img 
                    src={product.image} 
                    alt={product.name[lang]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className={`p-8 DA{lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="text-gold text-[10px] font-bold tracking-widest uppercase mb-2">{product.brand}</p>
                  <h4 className="font-display text-xl font-bold text-white mb-6 uppercase tracking-tight">{product.name[lang]}</h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-white whitespace-nowrap">DA{product.price.toLocaleString()}</span>
                    </div>
                    
                    <button 
                      onClick={() => { setSelectedProduct(product); setIsCheckoutOpen(true); }}
                      className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-3.5"
                    >
                      <CreditCard className="w-4 h-4" /> {t.orderNow}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-white/5 text-center px-6">
        <h2 className="font-display text-white font-bold tracking-[0.2em] mb-6 uppercase">JAWAHER</h2>
        <p className="text-white/40 text-xs tracking-wider uppercase">© 2026 {t.footerCopy}</p>
      </footer>

      {/* Checkout Sidebar/Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !orderStatus.includes('loading') && setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 ${lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} h-full w-full max-w-md bg-card-bg z-[101] shadow-2xl border-white/10 flex flex-col p-8 overflow-y-auto text-white`}
            >
              <div className="flex justify-between items-center mb-10">
                <h4 className="font-display text-2xl font-bold tracking-tight">{t.checkoutTitle}</h4>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full"
                >
                  <X className="w-6 h-6 text-white/50 hover:text-white" />
                </button>
              </div>

              {orderStatus === 'success' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <h5 className="text-2xl font-bold">{t.orderSuccess}</h5>
                  <p className="text-white/60 text-sm leading-relaxed">{t.orderContact}</p>
                  <button 
                    onClick={() => { setIsCheckoutOpen(false); setOrderStatus('idle'); }}
                    className="btn-primary w-full mt-6"
                  >
                    {t.backToStore}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
                  {!selectedProduct ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                      <ShoppingBag className="w-16 h-16 mb-4" />
                      <p>{t.chooseProduct}</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-12 border-b border-white/5 pb-8">
                        <p className="text-gold text-[10px] font-bold tracking-widest uppercase mb-4 opacity-60">{t.selectedProduct}</p>
                        <div className="flex gap-4">
                          <div className="w-24 h-28 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                            <img src={selectedProduct.image} className="w-full h-full object-cover" />
                          </div>
                          <div className={`flex-1 flex flex-col justify-center ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                            <h6 className="font-bold text-lg mb-1 uppercase tracking-tight">{selectedProduct.name[lang]}</h6>
                            <p className="text-white/40 text-sm mb-2 uppercase tracking-widest font-bold text-[10px]">{selectedProduct.brand}  </p>
                            <p className="text-gold font-bold text-xl">{selectedProduct.price.toLocaleString()}  DA </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <form onSubmit={handleSubmitOrder} className="space-y-4">
                          <p className="text-xs font-bold text-gold uppercase tracking-widest mb-4 opacity-80">{t.customerDetails}</p>
                          
                          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                            <label className={`block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold ${lang === 'ar' ? 'mr-0.5' : 'ml-0.5'}`}>{t.fullName}</label>
                            <input 
                              required
                              type="text" 
                              placeholder={t.fullNamePlaceholder}
                              className="input-field mb-0 text-white"
                              value={formData.fullName}
                              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            />
                          </div>

                          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                            <label className={`block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold ${lang === 'ar' ? 'mr-0.5' : 'ml-0.5'}`}>{t.phone}</label>
                            <input 
                              required
                              type="tel" 
                              placeholder={t.phonePlaceholder}
                              className="input-field mb-0 text-white"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                              <label className={`block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold ${lang === 'ar' ? 'mr-0.5' : 'ml-0.5'}`}>{t.wilaya}</label>
                              <select 
                                required
                                className="input-field mb-0 appearance-none bg-card-bg cursor-pointer text-white"
                                value={formData.wilaya}
                                onChange={(e) => setFormData({...formData, wilaya: e.target.value})}
                              >
                                <option value="" disabled>{t.selectWilaya}</option>
                                {WILAYAS.map(w => (
                                  <option key={w} value={w} className="bg-card-bg text-sm">
                                    {lang === 'ar' ? w : w.split(' - ')[1].replace(/[()]/g, '') + ' (' + w.split(' - ')[0] + ')'}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                              <label className={`block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold ${lang === 'ar' ? 'mr-0.5' : 'ml-0.5'}`}>{t.commune}</label>
                              <input 
                                required
                                type="text" 
                                placeholder={t.communePlaceholder}
                                className="input-field mb-0 text-white"
                                value={formData.commune}
                                onChange={(e) => setFormData({...formData, commune: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                            <label className={`block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold ${lang === 'ar' ? 'mr-0.5' : 'ml-0.5'}`}>{t.address}</label>
                            <textarea 
                              required
                              placeholder={t.addressPlaceholder}
                              className="input-field min-h-[80px] py-3 mb-0 text-white"
                              value={formData.address}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                            ></textarea>
                          </div>

                          <button 
                            disabled={orderStatus === 'loading'}
                            type="submit" 
                            className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 py-4 mt-4"
                          >
                            {orderStatus === 'loading' ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
                            {t.confirmOrder}
                          </button>
                          
                          {orderStatus === 'error' && (
                            <p className="text-red-400 text-center text-xs mt-4">{t.error}</p>
                          )}
                        </form>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
