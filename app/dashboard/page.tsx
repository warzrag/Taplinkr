"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LinkForm } from "@/components/LinkForm";
import { LinkList } from "@/components/LinkList";
import { Navigation } from "@/components/Navigation";
import { CustomLinkEditor } from "@/components/CustomLinkEditor";
import { UsageLimits } from "@/components/UsageLimits";
import Link from "next/link";
import type { LinkWithDetails, LinkCustomization } from "@/types";

// Type alias pour compatibilité
type LinkData = LinkWithDetails;

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);

  const [showMobileForm, setShowMobileForm] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      const data = await response.json();

      console.log("API Response:", {
        status: response.status,
        ok: response.ok,
        data,
      });

      // Check if response is successful and data is an array
      if (response.ok && Array.isArray(data)) {
        setLinks(data);

        // Calculate total clicks
        const total = data.reduce(
          (sum: number, link: LinkData) => sum + link.clicks,
          0
        );
        setTotalClicks(total);
      } else {
        // Handle different error cases
        if (!response.ok) {
          console.error("API Error:", response.status, data);
          if (response.status === 401) {
            console.error("Authentication error - redirecting to signin");
            router.push("/auth/signin");
            return;
          }
        } else if (data && typeof data === "object" && "error" in data) {
          console.error("API returned error:", data.error);
          if (data.error === "Non autorisé") {
            router.push("/auth/signin");
            return;
          }
        } else if (!Array.isArray(data)) {
          console.error("Expected array but got:", typeof data, data);
        }
        setLinks([]);
        setTotalClicks(0);
      }
    } catch (error) {
      console.error("Error loading links:", error);
      setLinks([]);
      setTotalClicks(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLinks();
    }
  }, [session]);

  const handleLinkCreated = (newLink: LinkData) => {
    setLinks([newLink, ...links]);
    setTotalClicks(totalClicks + (newLink.clicks || 0));
    // Close mobile form after creation
    setShowMobileForm(false);
  };

  const handleLinkDeleted = (linkId: string) => {
    const linkToDelete = links.find((link) => link.id === linkId);
    if (linkToDelete) {
      setTotalClicks(totalClicks - linkToDelete.clicks);
    }
    setLinks(links.filter((link) => link.id !== linkId));
  };

  const handleCustomizeLink = (link: LinkData) => {
    setSelectedLink(link);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedLink(null);
  };

  const handleSaveCustomization = async (customization: LinkCustomization) => {
    if (!selectedLink) return;

    try {
      const response = await fetch(`/api/links/${selectedLink.id}/customize`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customization }),
      });

      if (response.ok) {
        const updatedLink = await response.json();
        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link.id === selectedLink.id
              ? { ...link, customization: updatedLink.customization }
              : link
          )
        );
        handleCloseEditor();
      } else {
        console.error("Failed to save customization");
      }
    } catch (error) {
      console.error("Error saving customization:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Mobile-First Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {session.user?.name}! 👋
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
              Manage your protected links and track performance
            </p>
          </div>

          {/* Stats Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 transform hover:scale-105 transition-all">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                {links.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                Total Links
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 transform hover:scale-105 transition-all">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                {totalClicks}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                Total Clicks
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 transform hover:scale-105 transition-all">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                {links.length > 0 ? Math.round(totalClicks / links.length) : 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                Avg Clicks
              </div>
            </div>
            <Link
              href="/analytics"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 transform hover:scale-105 transition-all group"
            >
              <div className="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform">
                📊
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                View Analytics
              </div>
            </Link>
          </div>

          {/* Usage Limits - Mobile Optimized */}
          <div className="lg:hidden">
            <UsageLimits />
          </div>
        </div>
      </section>

      {/* Main Content - Mobile First */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Mobile Create Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileForm(!showMobileForm)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create New Link</span>
          </button>
        </div>

        {/* Mobile Form Slide-in */}
        <div
          className={`lg:hidden fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out z-40 ${
            showMobileForm ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Link
              </h3>
              <button
                onClick={() => setShowMobileForm(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <LinkForm onLinkCreated={handleLinkCreated} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Desktop Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create New Link
              </h2>
              <LinkForm onLinkCreated={handleLinkCreated} />
              <div className="mt-6">
                <UsageLimits />
              </div>
            </div>
          </div>

          {/* Links List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Your Links
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0"></div>
                </div>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No links yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your first protected link to get started
                </p>
              </div>
            ) : (
              <LinkList
                links={links}
                onLinkDeleted={handleLinkDeleted}
                onCustomize={handleCustomizeLink}
              />
            )}
          </div>
        </div>

        {/* Mobile Links List */}
        <div className="lg:hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Your Links
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0"></div>
              </div>
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                No links yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tap the button above to create your first link
              </p>
            </div>
          ) : (
            <LinkList
              links={links}
              onLinkDeleted={handleLinkDeleted}
              onCustomize={handleCustomizeLink}
            />
          )}
        </div>
      </section>

      {/* Custom Link Editor Modal */}
      {isEditorOpen && selectedLink && (
        <CustomLinkEditor
          link={selectedLink}
          onSave={handleSaveCustomization}
          onCancel={handleCloseEditor}
        />
      )}

      {/* Mobile Form Overlay */}
      {showMobileForm && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setShowMobileForm(false)}
        />
      )}
    </div>
  );
}
