import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

export const metadata = {
  title: "Aperture Fitness",
  description: "Plan your strength training, log every set, and track your progress with Aperture Fitness.",
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
