import { createBrowserRouter } from "react-router";
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ShoppingCartPage from "./pages/ShoppingCartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SignInPage from "./pages/SignInPage";
import AdminPage from "./pages/AdminPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ProductListingPage,
  },
  {
    path: "/product/:id",
    Component: ProductDetailPage,
  },
  {
    path: "/cart",
    Component: ShoppingCartPage,
  },
  {
    path: "/orders",
    Component: OrderHistoryPage,
  },
  {
    path: "/checkout",
    Component: CheckoutPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signin",
    Component: SignInPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    path: "/admin/orders",
    Component: AdminOrdersPage,
  },
  {
    path: "/admin/products",
    Component: AdminProductsPage,
  },
]);
