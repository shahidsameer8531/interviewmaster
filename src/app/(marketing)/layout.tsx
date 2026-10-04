import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot/ChatBot";
import { AuthModal } from "@/features/auth/components/AuthModal";

/**
 * Marketing chrome: fixed header, footer and chatbot. Every public page
 * folder sits inside this route group, so URLs are unchanged.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <AuthModal />
      <main className="pt-[72px]">{children}</main>
      <ChatBot />
      <Footer />
    </>
  );
}
