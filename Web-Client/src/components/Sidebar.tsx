'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

// Iconos minimalistas
const DashboardIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
)

const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
)

const FolderIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
)

const MessageIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
)

const MapIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
)

const GlobeIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
)

const UserIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
)

// Elementos de navegación
const navigationItems = [
    { name: 'Dashboard', href: '/', icon: DashboardIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartIcon },
    { name: 'Projects', href: '/projects', icon: FolderIcon },
    { name: 'Messages', href: '/messages', icon: MessageIcon },
    { name: 'Maps', href: '/maps', icon: MapIcon },
    { name: 'Web', href: '/web', icon: GlobeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
]

interface SidebarProps {
    children: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar fijo */}
            <div className="fixed left-0 top-0 h-full w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6 z-10">

                <div className="mb-8 flex flex-col items-center px-3">
                    {/* Logo */}
                    <div className="relative w-full h-16">
                        <Image
                            src="/logo.png"
                            alt="UrbanTracker Logo"
                            fill
                            className="object-contain"
                        />
                    </div>

                    <span className="mt-3 text-xs font-bold text-gray-900 text-center">
                        UrbanTracker
                    </span>
                </div>


                {/* Navegación */}
                <nav className="w-full mt-8 flex flex-col items-center">
                    <ul className="space-y-2">
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`
              w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200
              ${isActive
                                                ? 'border border-black bg-black text-white'
                                                : 'text-black hover:bg-gray-100'
                                            }
            `}
                                        title={item.name}
                                    >
                                        <item.icon />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>



            </div>

            {/* Contenido principal */}
            <div className="ml-20">
                {children}
            </div>
        </div>
    )
}