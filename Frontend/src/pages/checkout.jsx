import React, { useState, useMemo } from 'react';
import { useCart } from '../hooks/useCart';

const CartItem = ({ item, onRemove }) => {
    return (
        <div className="flex items-center justify-between" style={{ gap: 'calc(1 * var(--unit))' }}>
            <div className="flex items-center" style={{ gap: 'calc(1 * var(--unit))' }}>
                <img
                    className="bg-gray-100 rounded-lg"
                    src={`${item.icon}`}
                    alt={`${item.name} icon`}
                    style={{imageRendering:'pixelated', padding: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-xl)'}}
                />
                <div>
                    <p className="font-semibold text-gray-800" style={{ fontSize: 'var(--text-base)' }}>{item.title} Set</p>
                    <p className="text-gray-500" style={{ fontSize: 'var(--text-sm)' }}>₹{item.price.toFixed(2)}</p>
                </div>
            </div>
            <button onClick={() => onRemove(item._id)} className="remove-btn text-red-500 hover:text-red-700 font-medium" style={{ fontSize: 'var(--text-sm)' }}>
                Remove
            </button>
        </div>
    );
}

const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ padding: 'calc(1 * var(--unit))' }}>
            <div className="bg-white rounded-2xl shadow-2xl text-center max-w-sm mx-auto" style={{ padding: 'calc(2 * var(--unit))' }}>
                <div className="mx-auto flex items-center justify-center rounded-full bg-green-100" style={{ height: 'calc(3 * var(--unit))', width: 'calc(3 * var(--unit))', marginBottom: 'calc(1 * var(--unit))' }}>
                    <svg className="text-green-600" style={{ height: 'calc(1.5 * var(--unit))', width: 'calc(1.5 * var(--unit))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="font-bold text-gray-900" style={{ fontSize: 'var(--text-lg)' }}>Payment Successful!</h3>
                <div style={{ marginTop: 'calc(0.5 * var(--unit))', paddingLeft: 'calc(1.75 * var(--unit))', paddingRight: 'calc(1.75 * var(--unit))', paddingTop: 'calc(0.75 * var(--unit))', paddingBottom: 'calc(0.75 * var(--unit))' }}>
                    <p className="text-gray-500" style={{ fontSize: 'var(--text-sm)' }}>Your animation packs have been added to your account. Thank you for your purchase!</p>
                </div>
                <div style={{ marginTop: 'calc(1 * var(--unit))' }}>
                    <button onClick={onClose} className="w-full bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-transform hover:scale-105" style={{ padding: 'calc(0.5 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-base)' }}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    const { cart, removeFromCart } = useCart();
    const [cartItems, setCartItems] = useState(cart);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cardInfo, setCardInfo] = useState({
        name: '',
        number: '',
        expiry: '',
        cvc: ''
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        let formattedValue = value;

        if (id === 'number') {
            formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
        }

        setCardInfo(prev => ({ ...prev, [id]: formattedValue }));
    };

    const handleRemoveItem = (itemId) => {
        removeFromCart(itemId)
        setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Processing payment with:", cardInfo);
        setIsModalOpen(true);
    };

    const { subtotal, taxes, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + item.price, 0);
        const taxRate = 0.18;
        const tax = sub * taxRate;
        const tot = sub + tax;
        return { subtotal: sub, taxes: tax, total: tot };
    }, [cart]);

    return (
        (cart &&
            <div className="bg-gray-50 font-sans h-9/10">
                <div className="container mx-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 h-full" style={{ gap: 'calc(3 * var(--unit))', padding: 'calc(1 * var(--unit))' }}>
                        <div className="bg-white rounded-2xl shadow-lg h-full" style={{ padding: 'calc(1.5 * var(--unit))' }}>
                            <h1 className="font-bold text-gray-800" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'calc(1.5 * var(--unit))' }}>Payment Details</h1>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(1.5 * var(--unit))' }}>
                                    <div>
                                        <label htmlFor="name" className="block font-medium text-gray-700" style={{ fontSize: 'var(--text-sm)', marginBottom: 'calc(0.25 * var(--unit))' }}>Cardholder Name</label>
                                        <input type="text" id="name" value={cardInfo.name} onChange={handleInputChange} placeholder="Will add a payment feature soon 😊" className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300" style={{ padding: 'calc(0.75 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-base)' }} required />
                                    </div>
                                    <div>
                                        <label htmlFor="number" className="block font-medium text-gray-700" style={{ fontSize: 'var(--text-sm)', marginBottom: 'calc(0.25 * var(--unit))' }}>Card Information</label>
                                        <div className="relative">
                                            <input type="text" id="number" value={cardInfo.number} onChange={handleInputChange} placeholder="Enjoy Free Now!!" className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300" style={{ paddingLeft: 'calc(3 * var(--unit))', paddingRight: 'calc(1 * var(--unit))', paddingTop: 'calc(0.75 * var(--unit))', paddingBottom: 'calc(0.75 * var(--unit))', fontSize: 'var(--text-base)' }} required />
                                            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: 'calc(0.75 * var(--unit))' }}>
                                                <svg className="text-gray-400" style={{ width: 'calc(1.5 * var(--unit))', height: 'calc(1.5 * var(--unit))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2" style={{ gap: 'calc(1.5 * var(--unit))' }}>
                                        <div>
                                            <label htmlFor="expiry" className="block font-medium text-gray-700" style={{ fontSize: 'var(--text-sm)', marginBottom: 'calc(0.25 * var(--unit))' }}>Expiry Date</label>
                                            <input type="text" id="expiry" value={cardInfo.expiry} onChange={handleInputChange} placeholder="MM / YY" className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300" style={{ padding: 'calc(0.75 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-base)' }} required />
                                        </div>
                                        <div>
                                            <label htmlFor="cvc" className="block font-medium text-gray-700" style={{ fontSize: 'var(--text-sm)', marginBottom: 'calc(0.25 * var(--unit))' }}>CVC</label>
                                            <input type="text" id="cvc" value={cardInfo.cvc} onChange={handleInputChange} placeholder="123" className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300" style={{ padding: 'calc(0.75 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-base)' }} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-transform hover:scale-105" style={{ padding: 'calc(1 * var(--unit))', fontSize: 'var(--text-base)' }}>
                                        Pay Now
                                    </button>
                                </div>
                            </form>
                            <div className="text-center" style={{ marginTop: 'calc(2 * var(--unit))' }}>
                                <div className="flex items-center justify-center text-gray-500" style={{ gap: 'calc(0.5 * var(--unit))' }}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.002L2.5 5.051A10.003 10.003 0 0010 4.008a10.003 10.003 0 007.5 1.043l.334-.049A11.954 11.954 0 0110 1.944zM10 18c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd"></path></svg>
                                    <span style={{ fontSize: 'var(--text-sm)' }}>Secure SSL Encrypted Payment</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg lg:order-first" style={{ padding: 'calc(1.5 * var(--unit))' }}>
                            <h2 className="font-bold text-gray-800" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'calc(1.5 * var(--unit))' }}>Order Summary</h2>
                            <div className="max-h-64 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(1 * var(--unit))', paddingRight: 'calc(0.5 * var(--unit))' }}>
                                {cart.length > 0 ? (
                                    cart.map(item => (
                                        <CartItem key={item._id} item={item} onRemove={handleRemoveItem} />
                                    ))
                                ) : (
                                    <p className="text-gray-500" style={{ fontSize: 'var(--text-base)' }}>Your cart is empty.</p>
                                )}
                            </div>
                            <div className="border-t border-gray-200 text-gray-700" style={{ marginTop: 'calc(1.5 * var(--unit))', paddingTop: 'calc(1.5 * var(--unit))', display: 'flex', flexDirection: 'column', gap: 'calc(0.75 * var(--unit))' }}>
                                <div className="flex justify-between">
                                    <span style={{ fontSize: 'var(--text-base)' }}>Subtotal</span>
                                    <span className="font-medium" style={{ fontSize: 'var(--text-base)' }}>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ fontSize: 'var(--text-base)' }}>Taxes (18% GST)</span>
                                    <span className="font-medium" style={{ fontSize: 'var(--text-base)' }}>₹{taxes.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900" style={{ fontSize: 'var(--text-xl)' }}>
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <SuccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        )
    );
};

export default CheckoutPage;
