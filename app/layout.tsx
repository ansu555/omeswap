import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { BackgroundPaths } from "@/components/layout/background-paths";
import { MantleWalletProvider } from "@/components/providers/mantle-wallet-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ChatProvider } from "@/components/providers/chat-provider";
import { ChatbotPanel, ChatToggleButton } from "@/components/ui/chatbot-panel";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omeswap",
  description: "Omeswap Application",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
          </MantleWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
