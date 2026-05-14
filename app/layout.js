import "./globals.css";
import Header from "./utils/Header";
import Script from "next/script";
import Providers from "./providers";

const siteUrl = "https://paigowlab.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Play Pai Gow Free | Face-Up Pai Gow Poker Trainer | PaiGowLab",
    template: "%s | PaiGowLab",
  },
  description:
    "Play Pai Gow free and learn Face-Up Pai Gow Poker online. Practice Pai Gow, DJ Wild Stud Poker, and Ultimate X video poker with free casino game trainers.",
  keywords: [
    "play pai gow free",
    "free pai gow poker",
    "learn face-up pai gow",
    "face-up pai gow poker trainer",
    "pai gow poker practice",
    "DJ Wild Stud Poker",
    "Ultimate X video poker",
    "free casino poker trainer",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "PaiGowLab",
    title: "Play Pai Gow Free | Face-Up Pai Gow Poker Trainer",
    description:
      "Learn to play Face-Up Pai Gow Poker for free, practice hand setting, and try DJ Wild and Ultimate X online.",
  },
  twitter: {
    card: "summary",
    title: "Play Pai Gow Free | PaiGowLab",
    description:
      "Free online Pai Gow Poker, Face-Up Pai Gow, DJ Wild, and Ultimate X practice games and guides.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5619143235904865"></meta>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "PaiGowLab",
              url: siteUrl,
              description:
                "Free online Pai Gow Poker, Face-Up Pai Gow, DJ Wild, and Ultimate X practice games and guides.",
            }),
          }}
        />
      </head>
      <body
        className="antialiased bg-gray-100 dark:bg-gray-800"
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
