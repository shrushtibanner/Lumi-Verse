import "./globals.css";

export const metadata = {
  title: "LumiVerse",
  description: "A cinematic intelligence dashboard for movies and series.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
