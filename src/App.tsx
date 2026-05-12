import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Privacidade from "./pages/Privacidade.tsx";
import ParaQuem from "./pages/ParaQuem.tsx";
import NotFound from "./pages/NotFound.tsx";
import OpenSaasRedirect from "./pages/OpenSaasRedirect.tsx";
import AIChatWidget from "./components/AIChatWidget.tsx";
import CookieConsent from "./components/CookieConsent.tsx";

const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const BlogCategory = lazy(() => import("./pages/BlogCategory.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.tsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const PostsList = lazy(() => import("./pages/admin/PostsList.tsx"));
const PostEditor = lazy(() => import("./pages/admin/PostEditor.tsx"));
const Categories = lazy(() => import("./pages/admin/Categories.tsx"));
const Tags = lazy(() => import("./pages/admin/Tags.tsx"));
const Media = lazy(() => import("./pages/admin/Media.tsx"));
const Settings = lazy(() => import("./pages/admin/Settings.tsx"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/abrir-sistema" element={<OpenSaasRedirect />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/para-quem" element={<ParaQuem />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/categoria/:slug" element={<BlogCategory />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="posts" element={<PostsList />} />
                  <Route path="posts/novo" element={<PostEditor />} />
                  <Route path="posts/:id/editar" element={<PostEditor />} />
                  <Route path="categorias" element={<Categories />} />
                  <Route path="tags" element={<Tags />} />
                  <Route path="midia" element={<Media />} />
                  <Route path="configuracoes" element={<Settings />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <AIChatWidget />
            <CookieConsent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
