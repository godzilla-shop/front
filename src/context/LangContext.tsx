"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Locale, type Translations } from "@/lib/translations";

interface LangContextType {
    locale: Locale;
    t: Translations;
    setLocale: (locale: Locale) => void;
}

const LangContext = createContext<LangContextType>({
    locale: 'it',
    t: translations.it,
    setLocale: () => { },
});

export function LangProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('it');

    useEffect(() => {
        // Italian is always the default; only override if user explicitly chose Spanish
        const saved = localStorage.getItem('godzilla_locale') as Locale | null;
        if (saved && (saved === 'it' || saved === 'es')) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (l: Locale) => {
        setLocaleState(l);
        localStorage.setItem('godzilla_locale', l);
    };

    return (
        <LangContext.Provider value={{ locale, t: translations[locale], setLocale }}>
            {children}
        </LangContext.Provider>
    );
}

export const useLang = () => useContext(LangContext);
