import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import Icons from '../components/Icons';
import api from '../api';
import PageSkeleton from '../components/PageSkeleton';
import { fetchWithCache } from '../lib/requestCache';
import { getApiErrorMessage } from '../lib/apiError';

export default function Services() {
  const { settings, t, labels } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState({ enabled: false, cartEnabled: false, provider: 'mercadopago' });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchWithCache('services:list', async () => {
        const response = await api.get('/services');
        return response.data;
      }, 60000),
      fetchWithCache('payments:config', async () => {
        const response = await api.get('/payments/config');
        return response.data;
      }, 30000),
    ]).then(([servicesData, paymentsData]) => {
      if (!mounted) return;
      setServices(servicesData);
      setPaymentConfig(paymentsData);
    }).catch((err) => {
      if (!mounted) return;
      setError(getApiErrorMessage(err, 'Não foi possível carregar os serviços agora.'));
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const getIcon = (icon) => {
    const map = { scissors: Icons.Scissors, package: Icons.Package, eye: Icons.Eye };
    const Ic = map[icon] || Icons.Scissors;
    return <Ic size={28} className="text-[#f5b800]" />;
  };

  const canUseCartCheckout = paymentConfig.enabled && paymentConfig.cartEnabled;
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0),
    [cart]
  );

  const addToCart = (service) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === service.id);
      if (exists) {
        return prev.map((item) => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: service.id, name: service.name, price: service.price, quantity: 1 }];
    });
  };

  const updateCartQty = (serviceId, delta) => {
    setCart((prev) => prev
      .map((item) => item.id === serviceId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
      .filter((item) => item.quantity > 0));
  };

  const handleCartCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!cart.length || checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const { data } = await api.post('/payments/cart-checkout', { items: cart });
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('Checkout indisponível no momento');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao iniciar checkout do carrinho.'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className={`p-4 md:p-12 min-h-screen ${settings.theme === 'dark' ? 'bg-[#0d0d0d]' : 'bg-[#f5f5f7]'}`}>
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-1 bg-[var(--gold)] rounded-full" />
          <span className="text-[var(--gold)] font-black tracking-[0.3em] text-xs uppercase">{t('Catálogo', 'Catalog')}</span>
        </div>
        <h1 className={`page-title text-5xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{`${t('Nossos', 'Our')} ${labels.services}`}</h1>
        <p className={`text-sm mt-4 font-bold tracking-widest ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{t(`EXPERIÊNCIA PREMIUM DE ${labels.industry.toUpperCase()}`, `PREMIUM ${labels.industry.toUpperCase()} EXPERIENCE`)}</p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
          <Icons.AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          {loading ? (
            <PageSkeleton cards={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {services.map(s => (
                <div key={s.id} className="service-card p-8 group cursor-pointer" onClick={() => setSelected(s)}>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center group-hover:bg-[var(--gold)] group-hover:text-black transition-all duration-500 shadow-xl shadow-[var(--gold)]/5">
                      {getIcon(s.icon)}
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black tracking-[0.2em] ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>INVESTIMENTO</p>
                      <p className={`font-display font-black text-3xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>R$ {parseFloat(s.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <h3 className={`font-display font-black text-2xl mb-2 tracking-tighter group-hover:text-[var(--gold)] transition-colors ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{s.name.toUpperCase()}</h3>
                  {s.description && <p className={`text-sm mb-6 leading-relaxed font-medium ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#4b5563]'}`}>{s.description}</p>}
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--border)] group-hover:border-[var(--gold)]/30 transition-colors">
                    <div className={`flex items-center gap-2 text-xs font-bold ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>
                      <Icons.Clock size={14} className="text-[var(--gold)]" /> {s.duration} MIN
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(s);
                        }}
                        className={`px-3 py-2 rounded-lg border text-[10px] font-black tracking-widest uppercase transition-all ${
                          canUseCartCheckout
                            ? 'border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10'
                            : 'border-[var(--border)] text-[var(--text-secondary)] opacity-40 cursor-not-allowed'
                        }`}
                        disabled={!canUseCartCheckout}
                      >
                        {t('ADICIONAR', 'ADD')}
                      </button>
                      <button className="text-[var(--gold)] text-xs font-black tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                        {t('DETALHES', 'DETAILS')} <Icons.ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-4">
          <div className="card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black text-2xl text-[var(--text-primary)] tracking-tight uppercase">
                {t('CARRINHO', 'CART')}
              </h3>
              <span className="text-[var(--gold)] text-xs font-black tracking-widest">
                {cart.length} {t('ITENS', 'ITEMS')}
              </span>
            </div>
            {canUseCartCheckout ? (
              <p className="text-[var(--text-secondary)] text-xs mb-6">
                {paymentConfig.provider === 'stripe' ? 'Stripe' : 'Mercado Pago'} {t('habilitado no painel admin', 'enabled in admin panel')}
              </p>
            ) : (
              <p className="text-[var(--text-secondary)] text-xs mb-6">
                {t('Checkout por carrinho desativado no painel admin', 'Cart checkout disabled in admin panel')}
              </p>
            )}
            {!cart.length ? (
              <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] text-center text-[var(--text-secondary)] text-sm">
                {t(`Selecione ${labels.services} para montar seu carrinho.`, `Select ${labels.services} to build your cart.`)}
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-[var(--text-primary)] text-sm font-bold">{item.name}</p>
                      <p className="text-[var(--gold)] text-sm font-black">R$ {parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="w-7 h-7 rounded-lg border border-[var(--border)]" onClick={() => updateCartQty(item.id, -1)}>-</button>
                        <span className="text-xs font-black">{item.quantity}</span>
                        <button className="w-7 h-7 rounded-lg border border-[var(--border)]" onClick={() => updateCartQty(item.id, 1)}>+</button>
                      </div>
                      <p className="text-[var(--text-secondary)] text-xs">
                        R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[var(--text-secondary)] text-xs font-bold uppercase">{t('Total', 'Total')}</p>
                <p className="text-[var(--gold)] font-display font-black text-2xl">R$ {cartTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={handleCartCheckout}
                disabled={!cart.length || !canUseCartCheckout || checkoutLoading}
                className="btn-gold w-full py-4 text-sm font-black disabled:opacity-50"
              >
                {checkoutLoading ? t('CARREGANDO CHECKOUT...', 'LOADING CHECKOUT...') : t('PAGAR CARRINHO AGORA', 'PAY CART NOW')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay p-4" onClick={() => setSelected(null)}>
          <div className="modal max-w-lg w-full p-0 overflow-hidden shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="relative h-32 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <Icons.Scissors size={150} className="absolute -right-10 -top-10 rotate-12 text-black" />
              </div>
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl relative z-10">
                {getIcon(selected.icon)}
              </div>
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-all">
                <Icons.X size={20} />
              </button>
            </div>
            
            <div className="p-10">
              <div className="mb-8">
                <h3 className={`font-display font-black text-3xl mb-3 tracking-tighter ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{selected.name.toUpperCase()}</h3>
                <p className={`text-base leading-relaxed font-medium ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#4b5563]'}`}>
                  {selected.description || t(`Atendimento profissional de ${labels.industry} com qualidade premium.`, `Professional ${labels.industry} service with premium quality.`)}
                </p>
              </div>

              <div className="flex gap-6 mb-10">
                <div className="flex-1 p-6 rounded-2xl bg-[var(--gold)]/5 border-2 border-[var(--gold)]/20 text-center group hover:bg-[var(--gold)]/10 transition-colors">
                  <p className={`text-[10px] font-black tracking-[0.2em] mb-2 ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{t('INVESTIMENTO', 'INVESTMENT')}</p>
                  <p className="font-display font-black text-3xl text-[var(--gold)]">R$ {parseFloat(selected.price).toFixed(2)}</p>
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-[var(--bg-main)] border-2 border-[var(--border)] text-center group hover:border-[var(--gold)]/30 transition-colors">
                  <p className={`text-[10px] font-black tracking-[0.2em] mb-2 ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{t('TEMPO', 'TIME')}</p>
                  <p className={`font-display font-black text-3xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{selected.duration} MIN</p>
                </div>
              </div>

              <button onClick={() => { setSelected(null); navigate(`/booking?service=${selected.id}`); }}
                className="btn-gold w-full py-5 text-sm font-black shadow-2xl shadow-[var(--gold)]/20 hover:shadow-[var(--gold)]/40 transform hover:-translate-y-1">
                {t(`AGENDAR ESTE ${labels.service}`.toUpperCase(), `BOOK THIS ${labels.service}`.toUpperCase())}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
