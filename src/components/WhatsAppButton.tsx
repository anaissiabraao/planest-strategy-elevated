import { useState } from "react";
import { MessageCircle } from "lucide-react";
import WhatsAppFormModal from "./WhatsAppFormModal";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          if (typeof (window as any).gtag_report_conversion === "function") {
            (window as any).gtag_report_conversion();
          }
          setOpen(true);
        }}
        aria-label="Falar com atendente no WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:shadow-xl transition-all duration-300"
      >
        <MessageCircle size={28} />
      </button>
      <WhatsAppFormModal open={open} onOpenChange={setOpen} />
    </>
  );
}
