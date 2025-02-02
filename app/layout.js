import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./utils/Header";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Face-Up Pai Gow Poker | PaiGowLab",
  description: "Learn to play Face-Up Pai Gow Poker for free at PaiGowLab.com!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5619143235904865"></meta>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-STCSWY7WCG" />
        <Script id="googleanalytics-init">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-STCSWY7WCG');
            
          `}
        </Script>
        <Header />
        {children}
      </body>
    </html>
  );
}
