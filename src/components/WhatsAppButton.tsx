import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5547999507669?text=Olá! Gostaria de saber mais sobre o Planest.";

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com atendente no WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:shadow-xl transition-all duration-300"
    >
      <MessageCircle size={28} />
    </a>
  );
}
