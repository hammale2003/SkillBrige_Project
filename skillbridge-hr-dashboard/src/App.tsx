import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Evaluation from "./pages/Evaluation";
import TestSession from "./pages/TestSession";
import NotFound from "./pages/NotFound";
import LoadingPopup from "@/components/ui/LoadingPopup";
import { useSkillBridgeStore } from "@/store/useSkillBridgeStore";

const queryClient = new QueryClient();

function AppInner() {
  const loadingPopup = useSkillBridgeStore((s) => s.loadingPopup);
  return (
    <>
      <Sonner position="bottom-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/test-session" element={<TestSession />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <LoadingPopup phase={loadingPopup} />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
