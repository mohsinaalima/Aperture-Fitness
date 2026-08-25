import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

export const metadata = {
  title: "Aperture Fitness",
  description: "Precision strength training instrument",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
