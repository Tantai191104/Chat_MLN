import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={`chat-layout ${inter.className}`} lang="vi">
            {children}
        </div>
    )
}
