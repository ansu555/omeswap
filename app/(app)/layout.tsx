import { Header } from "@/components/layout/header";
import { BackgroundPaths } from "@/components/layout/background-paths";
import { AvalancheWalletProvider } from "@/components/providers/avalanche-wallet-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ChatProvider } from "@/components/providers/chat-provider";
import { ChatbotPanel, ChatToggleButton } from "@/components/ui/chatbot-panel";

export default function AppLayout({
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
            {/* Header - full width at top */}
            <Header />
            {/* Content area - flex row with main content and chat */}
            <div className="flex flex-1 overflow-hidden">
              {/* Main content area - shrinks when chat opens */}
              <main className="flex-1 overflow-y-auto transition-all duration-300">
                {children}
              </main>
              {/* Chat panel - stays fixed, doesn't scroll */}
              <ChatbotPanel />
            </div>
          </div>
          <ChatToggleButton />
        </ChatProvider>
      </AvalancheWalletProvider>
    </ThemeProvider>
  );
}
