import { Header } from "@/components/layout/header";
import { BackgroundPaths } from "@/components/layout/background-paths";
import { AvalancheWalletProvider } from "@/components/providers/avalanche-wallet-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ChatProvider } from "@/components/providers/chat-provider";
import { ChatbotPanel, ChatToggleButton } from "@/components/ui/chatbot-panel";

export const dynamic = 'force-dynamic';

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AvalancheWalletProvider>
        <ChatProvider>
          <BackgroundPaths />
          <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <main className="flex-1 overflow-y-auto transition-all duration-300">
                {children}
              </main>
              <ChatbotPanel />
            </div>
          </div>
          <ChatToggleButton />
        </ChatProvider>
      </AvalancheWalletProvider>
    </ThemeProvider>
  );
}
