import "./globals.css";
import { AppProvider } from "../context/AppProvider";
import AdminLayout from "../components/AdminLayout";

export const metadata = {
  title: "Turapp - Viajes a Cali",
  description: "Plataforma de transporte y reservas premium",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <AdminLayout>
            {children}
          </AdminLayout>
        </AppProvider>
      </body>
    </html>
  );
}
