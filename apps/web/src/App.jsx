import { usePlatform } from './platform/context';
import { RequireRole, GuestOnly } from './auth/Routes';
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, Link, useLocation, Outlet, Navigate } from "react-router-dom";
import CartProvider from "./context/CartProvider";
import { Header, Footer, EmptyState, LoadingSkeleton } from "./components/Marketplace";
import { useMarketplace } from "./platform/useMarketplace";
import DemoControls from "./platform/DemoControls";
import { Auth, Account, Checkout, Confirmation, Orders as CustomerOrders, OrderDetails as CustomerOrderDetails } from "./customer/Pages";
import { getStoreBySlug } from "./services/catalog";
import "./App.css";
import PlatformProvider from "./platform/Provider";
const AdminLayout = lazy(() => import("./admin/Layout"));
const AdminPage = lazy(() => import("./admin/Pages"));
import SellerProvider from "./seller/Provider";
import SellerLayout from "./seller/UI";
const Dashboard = lazy(() => import("./seller/Dashboard"));
const SellerStores = lazy(() => import("./seller/Management").then(m => ({
  default: m.Stores
})));
const SellerProducts = lazy(() => import("./seller/Management").then(m => ({
  default: m.Products
})));
const Inventory = lazy(() => import("./seller/Management").then(m => ({
  default: m.Inventory
})));
const SellerOrders = lazy(() => import("./seller/Orders").then(m => ({
  default: m.Orders
})));
const OrderDetails = lazy(() => import("./seller/Orders").then(m => ({
  default: m.OrderDetails
})));
const Home = lazy(() => import("./pages/Home"));
const Stores = lazy(() => import("./pages/Stores"));
const Catalog = lazy(() => import("./pages/Catalog"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
function Storefront() {
  const { stores } = useMarketplace();
  const {
      slug
    } = useParams(),
    store = getStoreBySlug(slug, stores);
  return store ? <Catalog key={slug} store={store} /> : <NotFound store />;
}
function NotFound({
  store = false
}) {
  return <div className="container page">
      <EmptyState error title={store ? "Store not found" : "404 · Page not found"} message="Let’s get you back to discovering something good.">
        <Link className="button" to={store ? "/stores" : "/"}>
          {store ? "Explore stores" : "Back to home"}
        </Link>
      </EmptyState>
    </div>;
}
function ScrollToTop() {
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => { const heading = document.querySelector("h1"); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); } }, 100);
    document.title = pathname.startsWith("/admin") ? "Platform Admin · Demo | Matjari" : pathname.startsWith("/seller") ? "Merchant Workspace | Matjari" : pathname === "/" ? "Matjari — Many Stores. One Marketplace." : `${pathname.startsWith("/cart") ? "Your Bag" : pathname.startsWith("/stores") ? "Independent Stores" : "Discover Products"} | Matjari`;
    return () => clearTimeout(timer);
  }, [pathname]);
  return null;
}
function CustomerLayout() {
  return <><Header /><main id="main"><Outlet /></main><Footer /></>;
}
function SessionCart({ children }) {
  const { data } = usePlatform();
  return <CartProvider key={data.session?.userId || 'guest'}>{children}</CartProvider>;
}
export default function App() {
  return <BrowserRouter>
      <PlatformProvider><SessionCart>
        <ScrollToTop /><DemoControls />
        <a className="skip-link" href="#main">
          Skip to content
        </a>

          <Suspense fallback={<LoadingSkeleton />}>
            <Routes>
              <Route element={<RequireRole role="admin" />}><Route path="/admin" element={<AdminLayout />}><Route index element={<Navigate to="dashboard" replace />} />{["dashboard", "tenants", "stores", "analytics", "monitoring"].map(page => <Route key={page} path={page} element={<AdminPage key={page} page={page} />} />)}<Route path="*" element={<NotFound />} /></Route>
              </Route><Route element={<RequireRole role="seller" />}><Route path="/seller" element={<SellerProvider><SellerLayout /></SellerProvider>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="stores" element={<SellerStores />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              </Route><Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/stores/:slug" element={<Storefront />} />
              <Route path="/products" element={<Catalog />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
              <Route element={<GuestOnly />}><Route path="/login" element={<Auth key="login" />} />
              <Route path="/register" element={<Auth key="register" register />} />
              </Route><Route element={<RequireRole role="customer" />}><Route path="/account" element={<Account />} />
              <Route path="/account/orders" element={<CustomerOrders />} />
              <Route path="/account/orders/:id" element={<CustomerOrderDetails />} /><Route path="/account/*" element={<NotFound />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/confirmation/:reference" element={<Confirmation />} />
              <Route path="/cart" element={<Cart />} />
              </Route><Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>

      </SessionCart></PlatformProvider>
    </BrowserRouter>;
}
