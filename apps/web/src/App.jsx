import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, Link, useLocation, Outlet, Navigate } from "react-router-dom";
import CartProvider from "./context/CartProvider";
import { Header, Footer, EmptyState, LoadingSkeleton } from "./components/Marketplace";
import { useMarketplace } from "./platform/useMarketplace";
import DemoControls from "./platform/DemoControls";
import CustomerOrders from "./pages/Orders";
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
      <EmptyState error title={store ? "Store not found" : "This page wandered off."} message="Let’s get you back to discovering something good.">
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
    document.title = pathname.startsWith("/admin") ? "Platform Admin · Demo | Matjari" : pathname.startsWith("/seller") ? "Merchant Workspace | Matjari" : pathname === "/" ? "Matjari — Many Stores. One Marketplace." : `${pathname.startsWith("/cart") ? "Your Bag" : pathname.startsWith("/stores") ? "Independent Stores" : "Discover Products"} | Matjari`;
  }, [pathname]);
  return null;
}
function CustomerLayout() {
  return <><Header /><main id="main"><Outlet /></main><Footer /></>;
}
export default function App() {
  return <BrowserRouter>
      <PlatformProvider><CartProvider>
        <ScrollToTop /><DemoControls />
        <a className="skip-link" href="#main">
          Skip to content
        </a>

          <Suspense fallback={<LoadingSkeleton />}>
            <Routes>
              <Route path="/admin" element={<AdminLayout />}><Route index element={<Navigate to="dashboard" replace />} />{["dashboard", "tenants", "stores", "analytics", "monitoring"].map(page => <Route key={page} path={page} element={<AdminPage key={page} page={page} />} />)}<Route path="*" element={<NotFound />} /></Route>
              <Route path="/seller" element={<SellerProvider><SellerLayout /></SellerProvider>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="stores" element={<SellerStores />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/stores/:slug" element={<Storefront />} />
              <Route path="/products" element={<Catalog />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/orders" element={<CustomerOrders />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>

      </CartProvider></PlatformProvider>
    </BrowserRouter>;
}
