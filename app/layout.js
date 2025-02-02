import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./utils/Header";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
