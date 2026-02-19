import './globals.css'

export const metadata = {
  title: 'Theralys - Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  )
}
