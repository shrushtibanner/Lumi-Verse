import "./globals.css";

export const metadata = {
  title: "CineScope — Movie & Series Analytics",
  description: "A cinematic intelligence dashboard for movies and series.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
