import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasConsentCookie, setConsent } from "@/lib/cookies";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so it doesn't appear instantly
    const timer = setTimeout(() => {
      if (!hasConsentCookie()) {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleReject = () => {
    setConsent(false);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card shadow-2xl p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    🍪 Usamos cookies
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Utilizamos cookies para melhorar sua experiência, lembrar suas preferências 
                    e personalizar o atendimento. Ao aceitar, você concorda com nossa{" "}
                    <Link to="/privacidade" className="text-primary underline underline-offset-2 hover:text-primary/80">
                      Política de Privacidade
                    </Link>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  className="flex-1 md:flex-none text-xs md:text-sm"
                >
                  Recusar
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1 md:flex-none text-xs md:text-sm bg-primary hover:bg-primary/90"
                >
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  Aceitar cookies
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
