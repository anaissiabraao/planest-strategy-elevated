import { useState } from "react";
import { MessageCircle } from "lucide-react";
import WhatsAppFormModal from "./WhatsAppFormModal";
import { useAutoCollapse } from "@/hooks/useAutoCollapse";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const { expanded, expand, collapseNow } = useAutoCollapse(4000, 4000);

  return (
    <>
      <button
        onClick={() => {
          if (typeof (window as any).gtag_report_conversion === "function") {
            (window as any).gtag_report_conversion();
          }
          collapseNow();
          setOpen(true);
        }}
        onMouseEnter={expand}
        onTouchStart={expand}
        onFocus={expand}
        aria-label="Falar com atendente no WhatsApp"
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        className={`fixed right-5 z-50 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300 ${
          expanded ? "w-14 h-14 opacity-100" : "w-10 h-10 opacity-60 hover:opacity-100"
        }`}
      >
        <MessageCircle size={expanded ? 26 : 18} className="transition-all duration-300" />
      </button>
      <WhatsAppFormModal open={open} onOpenChange={setOpen} />
    </>
  );
}
