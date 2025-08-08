import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import NotificationList from "@/components/ui/NotificationList";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Slack Connect - Message Scheduler",
  description: "Send instant messages and schedule messages for later delivery to your Slack workspace",
  keywords: ["slack", "messaging", "scheduler", "automation"],
  authors: [{ name: "Slack Connect Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <NotificationsProvider>
          <AuthProvider>
            {children}
            <NotificationList />
          </AuthProvider>
        </NotificationsProvider>
      </body>
    </html>
  );
}
