// components/CheckoutForm.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { placeOrder } from '@/app/actions';
import { CartItem } from '@/types';
import Image from 'next/image';
import { getDefaultImageUrl } from '@/lib/utils';

// ── Helpers ──

function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + ' / ' + digits.slice(2);
    return digits;
}

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

function detectCardBrand(number: string): CardBrand {
    const d = number.replace(/\D/g, '');
    if (/^4/.test(d)) return 'visa';
    if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return 'mastercard';
    if (/^3[47]/.test(d)) return 'amex';
    return 'unknown';
}

const CARD_BRAND_COLORS: Record<CardBrand, string> = {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#006FCF',
    unknown: '#94a3b8',
};

function CardBrandIcon({ brand }: { brand: CardBrand }) {
    const labels: Record<CardBrand, string> = {
        visa: 'VISA',
        mastercard: 'MC',
        amex: 'AMEX',
        unknown: '••••',
    };
    return (
        <span
            className="inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wider text-white"
            style={{ background: CARD_BRAND_COLORS[brand] }}
        >
            {labels[brand]}
        </span>
    );
}

// ── Types ──

interface ShippingData {
    fullName: string;
    address: string;
    city: string;
    zip: string;
    country: string;
}

interface PaymentData {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardholderName: string;
}

type Step = 'shipping' | 'payment' | 'processing';

// ── Main Component ──

export default function CheckoutForm({ cartItems }: { cartItems: CartItem[] }) {
    const t = useTranslations('checkout');

    const [step, setStep] = useState<Step>('shipping');
    const [processingState, setProcessingState] = useState<'loading' | 'success'>('loading');

    // Shipping form
    const [shipping, setShipping] = useState<ShippingData>({
        fullName: '', address: '', city: '', zip: '', country: '',
    });
    const [shippingErrors, setShippingErrors] = useState<Partial<ShippingData>>({});

    // Payment form
    const [payment, setPayment] = useState<PaymentData>({
        cardNumber: '', expiry: '', cvv: '', cardholderName: '',
    });
    const [paymentErrors, setPaymentErrors] = useState<Partial<Record<keyof PaymentData, string>>>({});

    // ── Computed ──

    const totalPrice = useMemo(() =>
        cartItems.reduce((sum, item) => {
            const price = item.priceAtPurchase - (item.discountOnUnit || 0);
            return sum + price * item.quantity;
        }, 0),
        [cartItems]
    );

    const totalItems = useMemo(() =>
        cartItems.reduce((sum, item) => sum + item.quantity, 0),
        [cartItems]
    );

    const cardBrand = useMemo(() => detectCardBrand(payment.cardNumber), [payment.cardNumber]);

    // ── Validation ──

    const validateShipping = useCallback((): boolean => {
        const errs: Partial<ShippingData> = {};
        if (!shipping.fullName.trim()) errs.fullName = t('fieldRequired');
        if (!shipping.address.trim()) errs.address = t('fieldRequired');
        if (!shipping.city.trim()) errs.city = t('fieldRequired');
        if (!shipping.zip.trim()) errs.zip = t('fieldRequired');
        if (!shipping.country.trim()) errs.country = t('fieldRequired');
        setShippingErrors(errs);
        return Object.keys(errs).length === 0;
    }, [shipping, t]);

    const validatePayment = useCallback((): boolean => {
        const errs: Partial<Record<keyof PaymentData, string>> = {};
        const digits = payment.cardNumber.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 16) errs.cardNumber = t('invalidCard');
        const expiryDigits = payment.expiry.replace(/\D/g, '');
        if (expiryDigits.length !== 4) {
            errs.expiry = t('invalidExpiry');
        } else {
            const month = parseInt(expiryDigits.slice(0, 2), 10);
            if (month < 1 || month > 12) errs.expiry = t('invalidExpiry');
        }
        const cvvDigits = payment.cvv.replace(/\D/g, '');
        if (cvvDigits.length < 3 || cvvDigits.length > 4) errs.cvv = t('invalidCvv');
        if (!payment.cardholderName.trim()) errs.cardholderName = t('fieldRequired');
        setPaymentErrors(errs);
        return Object.keys(errs).length === 0;
    }, [payment, t]);

    // ── Handlers ──

    const handleShippingContinue = () => {
        if (validateShipping()) setStep('payment');
    };

    const handlePay = async () => {
        if (!validatePayment()) return;
        setStep('processing');
        setProcessingState('loading');

        // Simulate payment processing delay
        await new Promise((r) => setTimeout(r, 2500));

        const result = await placeOrder();
        if (result.success) {
            setProcessingState('success');
            await new Promise((r) => setTimeout(r, 1800));
            window.location.href = '/profile/orders';
        } else {
            // On failure, go back to payment step
            setStep('payment');
            setPaymentErrors({ cardNumber: result.message });
        }
    };

    // ── Steps indicator ──

    const steps: { key: Step | 'confirm'; label: string }[] = [
        { key: 'shipping', label: t('stepShipping') },
        { key: 'payment', label: t('stepPayment') },
        { key: 'confirm', label: t('stepConfirm') },
    ];
    const stepIndex = step === 'shipping' ? 0 : step === 'payment' ? 1 : 2;

    // ── Animation variants ──

    const pageVariants = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
        exit: { opacity: 0, x: -30, transition: { duration: 0.25, ease: 'easeIn' } },
    };

    // ── Render helpers ──

    function renderInput(
        label: string,
        placeholder: string,
        value: string,
        onChange: (v: string) => void,
        error?: string,
        id?: string,
        type: string = 'text',
        maxLength?: number,
        rightAdornment?: React.ReactNode,
    ) {
        return (
            <div className="space-y-1">
                <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {label}
                </label>
                <div className="relative">
                    <input
                        id={id}
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className={`checkout-input w-full rounded-lg border bg-white/60 px-4 py-3 text-sm outline-none placeholder:text-gray-300 ${
                            error ? 'border-red-400' : 'border-gray-200'
                        }`}
                    />
                    {rightAdornment && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {rightAdornment}
                        </div>
                    )}
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }

    // ── Order Summary Sidebar ──

    function renderOrderSummary() {
        return (
            <div className="checkout-card rounded-2xl p-6 space-y-4 lg:sticky lg:top-28">
                <h3 className="text-lg font-bold tracking-tight">{t('orderSummary')}</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                    {cartItems.map((item) => (
                        <div key={item.orderProductId} className="flex items-center gap-3">
                            <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                    src={item.imageURL || getDefaultImageUrl(item.productCategoryName)}
                                    alt={item.productName}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.productName}</p>
                                <p className="text-xs text-gray-400">
                                    {item.colorName} · {item.sizeName} · ×{item.quantity}
                                </p>
                            </div>
                            <p className="text-sm font-semibold tabular-nums">
                                ${((item.priceAtPurchase - (item.discountOnUnit || 0)) * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                        <span>{t('subtotal')} ({totalItems} {t('items')})</span>
                        <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>{t('shipping')}</span>
                        <span className="text-emerald-600 font-medium">{t('shippingFree')}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                        <span>{t('total')}</span>
                        <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        );
    }

    // ── Processing Overlay ──

    function renderProcessingOverlay() {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="checkout-overlay fixed inset-0 z-50 flex items-center justify-center"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="text-center space-y-6"
                >
                    {processingState === 'loading' ? (
                        <>
                            <div className="mx-auto w-16 h-16 rounded-full border-4 border-white/20 border-t-white checkout-spinner" />
                            <div>
                                <p className="text-white text-xl font-semibold">{t('processing')}</p>
                                <p className="text-white/60 text-sm mt-1">{t('doNotClose')}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="checkout-success-circle mx-auto w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                                    <path
                                        className="checkout-success-check"
                                        d="M12 20l6 6 10-12"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white text-xl font-semibold">{t('paymentSuccessful')}</p>
                                <p className="text-white/60 text-sm mt-1">{t('redirecting')}</p>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        );
    }

    // ── Main Render ──

    return (
        <div className="min-h-screen pt-[calc(var(--header-total-height)+2rem)] pb-16 px-4"
             style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 50%, #e8e8e8 100%)' }}>

            <div className="container mx-auto max-w-6xl">
                {/* Title */}
                <h1 className="text-3xl font-bold tracking-tight mb-8">{t('title')}</h1>

                {/* Step Indicators */}
                <div className="flex items-center gap-1 mb-10 max-w-md">
                    {steps.map((s, i) => (
                        <div key={s.key} className="flex items-center flex-1">
                            <div className="flex items-center gap-2 flex-1">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                        i <= stepIndex
                                            ? 'bg-black text-white shadow-lg shadow-black/20'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {i < stepIndex ? '✓' : i + 1}
                                </div>
                                <span
                                    className={`text-sm font-medium transition-colors duration-300 ${
                                        i <= stepIndex ? 'text-black' : 'text-gray-400'
                                    }`}
                                >
                                    {s.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`h-px flex-1 mx-2 transition-colors duration-500 ${
                                    i < stepIndex ? 'bg-black' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {/* ── SHIPPING STEP ── */}
                            {step === 'shipping' && (
                                <motion.div key="shipping" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                                    <div className="checkout-card rounded-2xl p-8 space-y-6">
                                        <h2 className="text-xl font-bold tracking-tight">{t('shippingAddress')}</h2>
                                        {renderInput(t('fullName'), t('fullNamePlaceholder'), shipping.fullName,
                                            (v) => setShipping({ ...shipping, fullName: v }), shippingErrors.fullName, 'checkout-fullname')}
                                        {renderInput(t('addressLine'), t('addressPlaceholder'), shipping.address,
                                            (v) => setShipping({ ...shipping, address: v }), shippingErrors.address, 'checkout-address')}
                                        <div className="grid grid-cols-2 gap-4">
                                            {renderInput(t('city'), t('cityPlaceholder'), shipping.city,
                                                (v) => setShipping({ ...shipping, city: v }), shippingErrors.city, 'checkout-city')}
                                            {renderInput(t('zipCode'), t('zipPlaceholder'), shipping.zip,
                                                (v) => setShipping({ ...shipping, zip: v }), shippingErrors.zip, 'checkout-zip')}
                                        </div>
                                        {renderInput(t('country'), t('countryPlaceholder'), shipping.country,
                                            (v) => setShipping({ ...shipping, country: v }), shippingErrors.country, 'checkout-country')}
                                        <button
                                            id="checkout-continue-btn"
                                            onClick={handleShippingContinue}
                                            className="w-full bg-black text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:bg-gray-900 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-black/10"
                                        >
                                            {t('continueToPayment')}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── PAYMENT STEP ── */}
                            {step === 'payment' && (
                                <motion.div key="payment" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                                    <div className="checkout-card rounded-2xl p-8 space-y-6">
                                        <h2 className="text-xl font-bold tracking-tight">{t('paymentDetails')}</h2>
                                        {renderInput(
                                            t('cardNumber'),
                                            t('cardNumberPlaceholder'),
                                            payment.cardNumber,
                                            (v) => setPayment({ ...payment, cardNumber: formatCardNumber(v) }),
                                            paymentErrors.cardNumber,
                                            'checkout-card-number',
                                            'text',
                                            19,
                                            <CardBrandIcon brand={cardBrand} />,
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            {renderInput(t('expiryDate'), t('expiryPlaceholder'), payment.expiry,
                                                (v) => setPayment({ ...payment, expiry: formatExpiry(v) }),
                                                paymentErrors.expiry, 'checkout-expiry', 'text', 7)}
                                            {renderInput(t('cvv'), t('cvvPlaceholder'), payment.cvv,
                                                (v) => setPayment({ ...payment, cvv: v.replace(/\D/g, '').slice(0, 4) }),
                                                paymentErrors.cvv, 'checkout-cvv', 'text', 4)}
                                        </div>
                                        {renderInput(t('cardholderName'), t('cardholderPlaceholder'), payment.cardholderName,
                                            (v) => setPayment({ ...payment, cardholderName: v.toUpperCase() }),
                                            paymentErrors.cardholderName, 'checkout-cardholder')}

                                        {/* Simulated card visual */}
                                        <div className="relative rounded-2xl overflow-hidden p-6 text-white h-48 select-none"
                                             style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                                            <div className="checkout-shimmer absolute inset-0 pointer-events-none" />
                                            <div className="relative z-10 flex flex-col justify-between h-full">
                                                <div className="flex items-center justify-between">
                                                    <div className="w-10 h-7 rounded bg-yellow-400/80" />
                                                    <CardBrandIcon brand={cardBrand} />
                                                </div>
                                                <div>
                                                    <p className="text-lg tracking-[0.25em] font-mono">
                                                        {payment.cardNumber || '•••• •••• •••• ••••'}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between items-end text-xs">
                                                    <div>
                                                        <p className="text-white/50 uppercase text-[10px]">{t('cardholderName')}</p>
                                                        <p className="font-medium tracking-wide">{payment.cardholderName || '••••••'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white/50 uppercase text-[10px]">{t('expiryDate')}</p>
                                                        <p className="font-medium">{payment.expiry || '•• / ••'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                id="checkout-back-btn"
                                                onClick={() => setStep('shipping')}
                                                className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all duration-200"
                                            >
                                                {t('backToShipping')}
                                            </button>
                                            <button
                                                id="checkout-pay-btn"
                                                onClick={handlePay}
                                                className="flex-[2] bg-black text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:bg-gray-900 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-black/10"
                                            >
                                                {t('payNow')} — ${totalPrice.toFixed(2)}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        {renderOrderSummary()}
                    </div>
                </div>
            </div>

            {/* Processing Overlay */}
            <AnimatePresence>
                {step === 'processing' && renderProcessingOverlay()}
            </AnimatePresence>
        </div>
    );
}
