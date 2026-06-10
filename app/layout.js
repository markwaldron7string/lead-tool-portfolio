import "./globals.css";

const THEME_INIT = `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`;

export const metadata = {
  title: "Lead Scraper",
  description: "Multi-country buyers agent lead scraper",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
