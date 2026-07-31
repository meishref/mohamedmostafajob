import type { Metadata } from "next";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { AppLayout } from "@/components/layouts/app-layout";
import { AppProviders } from "@/providers/app-providers";
import { getDirection, type AppLocale } from "@/i18n/config";
import { LocaleBootstrap } from "@/components/common/locale-bootstrap";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return {
    title: {
      default: t("appName"),
      template: `%s | ${t("appName")}`,
    },
    description: t("appName"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await getMessages();
  const dir = getDirection(locale);
  const isArabic = locale.startsWith("ar");

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} min-h-screen antialiased ${
          isArabic ? "font-[family-name:var(--font-cairo)]" : "font-[family-name:var(--font-geist-sans)]"
        }`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleBootstrap />
          <AppProviders>
            <AppLayout>{children}</AppLayout>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
