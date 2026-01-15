import { Header } from "@/components/layout/header";
import { BackgroundPaths } from "@/components/layout/background-paths";
import { MantleWalletProvider } from "@/components/providers/mantle-wallet-provider";
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
      <MantleWalletProvider>
        <ChatProvider>
          <BackgroundPaths />
          <div className="flex flex-col h-screen overflow-hidden">
            {/* Header - full width at top */}
            <Header />
            {/* Content area - flex row with main content and chat */}
            <div className="flex flex-1 overflow-hidden min-h-0 pt-20">
              {/* Main content area - shrinks when chat opens */}
              <main className="flex-1 overflow-auto transition-all duration-300 min-h-0">
                {children}
              </main>
              {/* Chat panel - stays fixed, doesn't scroll */}
              <ChatbotPanel />
            </div>
          </div>
          <ChatToggleButton />
        </ChatProvider>
      </MantleWalletProvider>
    </ThemeProvider>
  );
}
