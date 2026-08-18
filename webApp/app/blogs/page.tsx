import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/nav";
import { getAdminFirestore } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News — AI-News",
  description: "Discover latest AI news, industry breakthroughs, and comprehensive research summaries.",
};

type BlogPost = {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  createdAt: string | null;
};

const DEFAULT_FALLBACK_IMAGE = "/images/figma_assets/d683e2816dea32774681db86100fec3a4a51ee27.png";

function proxiedImage(image: string, w: number, h?: number): string {
  if (!image) return DEFAULT_FALLBACK_IMAGE;
  if (image.startsWith("/images/") || image.startsWith("/")) return image;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && (image.startsWith("http://") || image.startsWith("https://"))) {
    const transforms = [`w_${w}`, `c_fill`, `q_auto`, `f_auto`];
    if (h) transforms.push(`h_${h}`);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms.join(",")}/${encodeURIComponent(image)}`;
  }

  const params = [`url=${encodeURIComponent(image)}`, `w=${w}`, "fit=cover", "q=80"];
  if (h) params.push(`h=${h}`);
  return `https://images.weserv.nl/?${params.join("&")}`;
}

async function getPosts(): Promise<BlogPost[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("blogs")
    .orderBy("created_at", "desc")
    .limit(50)
    .get();

  if (snap.empty) return [];

  return snap.docs.map((doc) => {
    const d = doc.data();
    const sources = Array.isArray(d.sources) && d.sources[0] ? d.sources[0] : {};
    const [sourceName, sourceUrl] = Object.entries(sources)[0] ?? ["", ""];

    return {
      id: doc.id,
      title: d.title ?? "Untitled",
      content: d.content ?? "",
      image: d.image ?? "",
      category: d.category ?? "AI News",
      sourceName: String(sourceName),
      sourceUrl: String(sourceUrl),
      createdAt: d.created_at?.toDate
        ? d.created_at.toDate().toISOString()
        : null,
    };
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white/20 backdrop-blur-md rounded-[24px] border border-white/30 p-8 my-8">
      <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2zM12 12v4m0-8v.01" />
        </svg>
      </div>
      <h3 className="font-[family-name:var(--font-questrial)] text-[22px] text-white mb-2 font-normal">
        No articles yet
      </h3>
      <p className="font-[family-name:var(--font-questrial)] text-[15px] text-white/80 max-w-sm">
        The daily digest hasn&apos;t run yet. Check back soon for the latest AI news.
      </p>
    </div>
  );
}

export default async function NewsPage() {
  let allPosts: BlogPost[] = [];
  let fetchError = false;

  try {
    allPosts = await getPosts();
  } catch (err) {
    console.error("blogs list error:", err);
    fetchError = true;
  }

  const latestPosts = allPosts.slice(0, 4);
  const morePosts = allPosts.slice(4);

  return (
    /* Outer white border frame — consistent with Home page */
    <div className="w-screen min-h-screen bg-white flex items-center justify-center p-[6px] sm:p-[8px] md:p-[10px] selection:bg-neutral-900 selection:text-white">
      {/* Inner Blue Card — consistent background with Home page */}
      <div
        className="relative w-full min-h-[calc(100vh-20px)] rounded-[16px] sm:rounded-[20px] md:rounded-[24px] overflow-hidden flex flex-col justify-between bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/BG.png')" }}
      >
        {/* Navigation Wrapper */}
        <div className="relative z-20 w-full px-3 sm:px-5 md:px-8 pt-3 sm:pt-4 md:pt-5 shrink-0">
          <Nav />
        </div>

        {/* Main Content Area */}
        <main className="relative z-10 flex-1 max-w-[1737px] w-full mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-12">

          {fetchError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/20 backdrop-blur-md rounded-[24px] p-8">
              <p className="font-[family-name:var(--font-questrial)] text-[18px] text-white font-medium">
                Failed to load articles. Please try again later.
              </p>
            </div>
          ) : allPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Section 1: Discover Latest News (Top 4) */}
              {latestPosts.length > 0 && (
                <section className="w-full">
                  <div className="flex items-center gap-3.5 mb-6">
                    <h2 className="font-[family-name:var(--font-questrial)] text-[28px] md:text-[38px] lg:text-[42px] font-normal text-white">
                      Discover Latest News
                    </h2>
                    <div className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full bg-white text-black flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 md:w-5 md:h-5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {latestPosts.map((post) => {
                      const imgUrl = post.image ? proxiedImage(post.image, 800, 500) : DEFAULT_FALLBACK_IMAGE;
                      return (
                        <div
                          key={post.id}
                          className="group relative bg-[#ffffff] rounded-[26px] md:rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-white/60 p-4 md:p-5"
                        >
                          <div>
                            {/* Thumbnail */}
                            <div className="relative w-full aspect-[591/353] rounded-[20px] md:rounded-[24px] overflow-hidden bg-neutral-100">
                              <Image
                                src={imgUrl}
                                alt={post.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized={imgUrl.startsWith("/images/")}
                              />
                            </div>

                            {/* Category Badge */}
                            {post.category && (
                              <span className="mt-3 inline-block px-3 py-1 text-[12px] font-[family-name:var(--font-questrial)] bg-sky-50 text-sky-700 rounded-full border border-sky-100">
                                {post.category}
                              </span>
                            )}

                            {/* Title & Description */}
                            <div className="mt-3 space-y-2">
                              <h3 className="font-[family-name:var(--font-questrial)] text-[19px] md:text-[22px] font-normal text-[#000000] leading-snug line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="font-[family-name:var(--font-questrial)] text-[13px] md:text-[14px] text-[#666666] line-clamp-2 leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                          </div>

                          {/* Source & View Button */}
                          <div className="mt-5 flex items-center justify-between">
                            {post.sourceName && (
                              <span className="font-[family-name:var(--font-questrial)] text-[12px] text-neutral-400 truncate max-w-[100px]">
                                {post.sourceName}
                              </span>
                            )}
                            <Link
                              href={`/blogs/${post.id}`}
                              className="ml-auto h-[38px] md:h-[42px] px-5 bg-[#000000] hover:bg-neutral-800 text-[#ffffff] font-[family-name:var(--font-questrial)] text-[15px] md:text-[18px] font-normal rounded-[100px] inline-flex items-center gap-2 transition-transform active:scale-95 shadow-md"
                            >
                              <span>View</span>
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Section 2: All News (remaining posts) */}
              {morePosts.length > 0 && (
                <section className="w-full">
                  <div className="flex items-center gap-3.5 mb-6">
                    <h2 className="font-[family-name:var(--font-questrial)] text-[28px] md:text-[38px] lg:text-[42px] font-normal text-white">
                      All News
                    </h2>
                    <div className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full bg-white text-black flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 md:w-5 md:h-5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {morePosts.map((post) => {
                      const imgUrl = post.image ? proxiedImage(post.image, 400, 300) : DEFAULT_FALLBACK_IMAGE;
                      return (
                        <div
                          key={post.id}
                          className="group relative bg-[#ffffff] rounded-[20px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3 border border-white/60"
                        >
                          <div>
                            {/* Thumbnail */}
                            <div className="relative w-full aspect-[257/176] rounded-[14px] overflow-hidden bg-neutral-100">
                              <Image
                                src={imgUrl}
                                alt={post.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized={imgUrl.startsWith("/images/")}
                              />
                            </div>

                            {/* Title */}
                            <h4 className="mt-3 font-[family-name:var(--font-questrial)] text-[14px] md:text-[15px] font-normal text-[#000000] leading-snug line-clamp-2">
                              {post.title}
                            </h4>
                          </div>

                          {/* View Button */}
                          <div className="mt-3 flex justify-end">
                            <Link
                              href={`/blogs/${post.id}`}
                              className="h-[32px] px-4 bg-[#000000] hover:bg-neutral-800 text-[#ffffff] font-[family-name:var(--font-questrial)] text-[13px] font-normal rounded-[100px] inline-flex items-center gap-1.5 transition-transform active:scale-95 shadow"
                            >
                              <span>View</span>
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full max-w-[1737px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between text-xs md:text-sm text-white/80 font-[family-name:var(--font-questrial)]">
          <span>&copy; 2026 AI-News. All rights reserved.</span>
          <span>Curated with automated multi-agent intelligence.</span>
        </footer>
      </div>
    </div>
  );
}