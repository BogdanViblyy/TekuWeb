// app/actions.ts
// Barrel re-export for backward compatibility.
// All action implementations are in app/actions/ directory.

export { getSession, register, login, logout } from './actions/auth';
export { getCart, addToCart, updateItemQuantity, removeFromCart } from './actions/cart';
export { placeOrder } from './actions/order';
export { loadMoreProducts } from './actions/products';
export { getWishlist, toggleWishlistItem } from './actions/wishlist';