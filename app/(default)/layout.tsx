"use client";
import React, { useEffect, Suspense } from "react";
import "./globals.css";

// Components
import Navbar from "@/components/default/Navbar";
import Footer from "@/components/default/Footer";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

//Suspense
import Loading from "@/components/default/Loading";
import dynamic from "next/dynamic";

//Cookie Consent
import { CookiesProvider } from "react-cookie";
const CookieConsent = dynamic(
  () => import("@/components/default/CookieConsent"),
  { ssr: false },
);

//i18n
import { withTranslation } from "react-i18next";
import { Scroll } from "@react-three/drei";
import ScrollToTop from "@/components/default/ScrollToTop";

const layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <Suspense fallback={<Loading />}>
      <CookiesProvider defaultSetOptions={{ path: "/", maxAge: 31536000 }}>
        <Navbar />
        <main className="mx-auto min-h-screen bg-base-300" id="main">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
        <CookieConsent />
      </CookiesProvider>
    </Suspense>
  );
};

export default layout;
