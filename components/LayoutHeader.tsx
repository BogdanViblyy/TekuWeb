// components/LayoutHeader.tsx
'use client';

import Header from './Header';
import { useAuth } from '@/context/AuthContext';
import { useIntro } from '@/context/IntroContext';
import { usePathname } from '@/i18n/navigation';

export default function LayoutHeader() {
    const { user } = useAuth();
    const { isIntroFinished } = useIntro();
    const pathname = usePathname();

    // On the home page, the Header visibility is tied to the intro animation.
    // On all other pages, the intro is always considered "finished" so the logo shows immediately.
    const isHome = pathname === '/';
    const effectiveIntroFinished = isHome ? isIntroFinished : true;

    return <Header user={user} isIntroFinished={effectiveIntroFinished} />;
}
