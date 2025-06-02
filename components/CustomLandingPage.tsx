"use client";

import { useState } from "react";
import type { LinkWithDetails } from "@/types";

interface CustomLandingPageProps {
  link: LinkWithDetails;
}

export function CustomLandingPage({ link }: CustomLandingPageProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const customization = (link.customization as any) || {};

  const handleRedirect = async () => {
    if (isRedirecting) return;

    setIsRedirecting(true);

    // Enregistrer le clic
    try {
      await fetch(`/api/track-click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkId: link.id,
          userAgent: navigator.userAgent,
          referer: document.referrer,
        }),
      });
    } catch (error) {
      console.error("Error recording click:", error);
    }

    // Rediriger vers l'URL finale
    window.location.href = link.url;
  };

  const getBackgroundStyle = () => {
    if (customization.backgroundType === "color") {
      return { backgroundColor: customization.backgroundColor || "#1e293b" };
    } else if (customization.backgroundType === "gradient") {
      const gradient = customization.backgroundGradient || {
        from: "#1e293b",
        to: "#334155",
        direction: "to-br",
      };
      return {
        background: `linear-gradient(${gradient.direction}, ${gradient.from}, ${gradient.to})`,
      };
    } else if (
      customization.backgroundType === "image" &&
      customization.backgroundImage
    ) {
      return {
        backgroundImage: `url(${customization.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return {
      background: "linear-gradient(to-br, #1e293b, #334155)",
    };
  };

  const getButtonClassName = () => {
    const baseClasses =
      "w-full py-4 px-6 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none";

    switch (customization.buttonStyle) {
      case "square":
        return `${baseClasses} rounded-none`;
      case "pill":
        return `${baseClasses} rounded-full`;
      default:
        return `${baseClasses} rounded-xl`;
    }
  };

  const textColor = customization.textColor || "#ffffff";
  const buttonColor = customization.buttonColor || "#6366f1";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={getBackgroundStyle()}
    >
      {/* Overlay pour améliorer la lisibilité sur les images */}
      {customization.backgroundType === "image" && (
        <div className="absolute inset-0 bg-black/20"></div>
      )}

      <div className="w-full max-w-md relative z-10">
        {/* Header avec photo de profil */}
        <div className="text-center mb-8">
          {customization.profileImage ? (
            <div className="relative inline-block">
              <img
                src={customization.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white/30 shadow-2xl"
              />
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-t from-black/20 to-transparent mx-auto"></div>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-4 border-white/30 shadow-2xl">
              <span className="text-4xl">👤</span>
            </div>
          )}

          <h1
            className="text-3xl font-bold mb-3 text-shadow-lg"
            style={{ color: textColor }}
          >
            {link.title || "Lien personnalisé"}
          </h1>

          {customization.description && (
            <p
              className="text-lg opacity-90 leading-relaxed max-w-sm mx-auto"
              style={{ color: textColor }}
            >
              {customization.description}
            </p>
          )}
        </div>

        {/* Bouton principal */}
        <div className="mb-8">
          <button
            onClick={handleRedirect}
            disabled={isRedirecting}
            className={getButtonClassName()}
            style={{
              backgroundColor: buttonColor,
              boxShadow: `0 10px 25px ${buttonColor}30`,
            }}
          >
            {isRedirecting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Redirection en cours...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Accéder au lien</span>
                <svg
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Liens des réseaux sociaux */}
        {customization.socialLinks && customization.socialLinks.length > 0 && (
          <div className="mb-8">
            <h3
              className="text-center text-sm font-medium mb-4 opacity-80"
              style={{ color: textColor }}
            >
              Suivez-moi sur
            </h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {customization.socialLinks.map((social: any, index: number) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xl hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:border-white/50"
                  title={social.platform}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer discret */}
        <div className="text-center">
          <a
            href="https://linktracker.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-50 hover:opacity-70 transition-opacity"
            style={{ color: textColor }}
          >
            ⚡ Créé avec LinkTracker
          </a>
        </div>
      </div>

      {/* Styles additionnels pour text-shadow */}
      <style jsx>{`
        .text-shadow-lg {
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
