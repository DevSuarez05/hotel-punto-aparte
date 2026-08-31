import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hotelpuntoaparte.com"),
  title: {
    default: "Hotel Punto Aparte | Hospedaje Elegante y Confort en Quibdó, Chocó",
    template: "%s | Hotel Punto Aparte Quibdó",
  },
  description:
    "Descubre la mejor experiencia de hospedaje en Quibdó, Chocó. Hotel Punto Aparte ofrece habitaciones confortables, atención personalizada, elegancia y excelente ubicación en el Chocó.",
  keywords: [
    "Hotel Punto Aparte",
    "Hotel en Quibdó",
    "Hospedaje Quibdó Chocó",
    "Hoteles en Chocó",
    "Hotel ejecutivo Quibdó",
    "Alojamiento en Quibdó",
    "Turismo en Quibdó Chocó",
    "Reserva hotel Quibdó",
    "Mejores hoteles Quibdó",
    "Hotel confort Quibdó",
  ],
  authors: [{ name: "Hotel Punto Aparte" }],
  creator: "Hotel Punto Aparte",
  publisher: "Hotel Punto Aparte",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://hotelpuntoaparte.com",
  },
  openGraph: {
    title: "Hotel Punto Aparte | Hospedaje Elegante y Confort en Quibdó, Chocó",
    description:
      "Tu punto de descanso exclusivo en Quibdó. Disfruta de una hospitalidad superior, habitaciones confortables y un ambiente distinguido en la capital del Chocó.",
    url: "https://hotelpuntoaparte.com",
    siteName: "Hotel Punto Aparte",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hotel Punto Aparte en Quibdó, Chocó",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel Punto Aparte | Hospedaje Elegante en Quibdó, Chocó",
    description:
      "Experiencia de hospedaje distinguida, habitaciones ejecutivas y servicio premium en Quibdó, Chocó.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: "Hotel Punto Aparte",
  description:
    "Hospedaje elegante y confortable ubicado en Quibdó, Chocó, Colombia.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Quibdó",
    addressRegion: "Chocó",
    addressCountry: "CO",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "5.6947",
    longitude: "-76.6611",
  },
  url: "https://hotelpuntoaparte.com",
  telephone: "+573018940859",
  priceRange: "$$",
  starRating: {
    "@type": "Rating",
    ratingValue: "4.8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} dark h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-dark-bg text-neutral-light font-sans selection:bg-gold-500/30 selection:text-neutral-light relative">
        <CartProvider>
          <Navbar />
          {children}
          <WhatsAppButton />
          <CartDrawer />
          <CheckoutModal />
          <Toaster position="bottom-right" theme="dark" richColors />
        </CartProvider>
      </body>
    </html>
  );
}




