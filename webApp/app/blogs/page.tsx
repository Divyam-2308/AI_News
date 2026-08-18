import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/nav";
import { SkyMeshBG } from "@/components/sky-mesh-bg";
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

/**
 * Proxy images through weserv.nl for remote URLs,
 * and through Cloudinary if CLOUDINARY_CLOUD_NAME is configured.
 */
function proxiedImage(image: string, w: number, h?: number): string {
  if (!image) return "";
  if (image.startsWith("/images/") || image.startsWith("/")) return image;

  // Try Cloudinary first if configured
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && (image.startsWith("http://") || image.startsWith("https://"))) {
    const transforms = [`w_${w}`, `c_fill`, `q_auto`, `f_auto`];
    if (h) transforms.push(`h_${h}`);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms.join(",")}/${encodeURIComponent(image)}`;
  }

  // Fallback to weserv.nl proxy
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
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mb-6">
        <svg className="w-9 h-9 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2zM12 12v4m0-8v.01" />
        </svg>
      </div>
      <h3 className="font-[family-name:var(--font-questrial)] text-[24px] text-neutral-700 mb-2">
        No articles yet
      </h3>
      <p className="font-[family-name:var(--font-questrial)] text-[16px] text-neutral-400 max-w-sm">
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
    <div className="relative min-h-screen text-[#000000] flex flex-col justify-between overflow-x-hidden selection:bg-neutral-900 selection:text-white pb-16">
      {/* Background */}
      <SkyMeshBG />

      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <main className="flex-1 max-w-[1737px] w-full mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-16">

        {fetchError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-[family-name:var(--font-questrial)] text-[18px] text-red-600">
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
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-[family-name:var(--font-questrial)] text-[32px] md:text-[43.5px] font-normal text-[#000000]">
                    Discover Latest News
                  </h2>
                  <div className="w-[36px] h-[36px] md:w-[45px] md:h-[45px] rounded-full bg-black flex items-center justify-center text-white">
                    <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {latestPosts.map((post) => (
                    <div
                      key={post.id}
                      className="group relative bg-[#ffffff] rounded-[30px] md:rounded-[36px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-white/60 p-4 md:p-5"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative w-full aspect-[591/353] rounded-[22px] md:rounded-[26px] overflow-hidden bg-neutral-100">
                          {post.image ? (
                            <Image
                              src={proxiedImage(post.image, 800, 500)}
                              alt={post.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
                              <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Category Badge */}
                        {post.category && (
                          <span className="mt-3 inline-block px-3 py-1 text-[12px] font-[family-name:var(--font-questrial)] bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                            {post.category}
                          </span>
                        )}

                        {/* Title & Description */}
                        <div className="mt-3 space-y-2">
                          <h3 className="font-[family-name:var(--font-questrial)] text-[20px] md:text-[24px] lg:text-[26px] font-normal text-[#000000] leading-tight line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="font-[family-name:var(--font-questrial)] text-[14px] md:text-[15px] text-[#727272] line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                      </div>

                      {/* Source & View Button */}
                      <div className="mt-5 flex items-center justify-between">
                        {post.sourceName && (
                          <span className="font-[family-name:var(--font-questrial)] text-[13px] text-neutral-400 truncate max-w-[100px]">
                            {post.sourceName}
                          </span>
                        )}
                        <Link
                          href={`/blogs/${post.id}`}
                          className="ml-auto h-[42px] md:h-[46px] px-5 bg-[#000000] hover:bg-neutral-800 text-[#ffffff] font-[family-name:var(--font-questrial)] text-[16px] md:text-[20px] font-normal rounded-[30.5px] inline-flex items-center gap-2 transition-transform active:scale-95 shadow-md"
                        >
                          <span>View</span>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 2: All News (remaining posts) */}
            {morePosts.length > 0 && (
              <section className="w-full">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-[family-name:var(--font-questrial)] text-[32px] md:text-[43.5px] font-normal text-[#000000]">
                    All News
                  </h2>
                  <div className="w-[36px] h-[36px] md:w-[45px] md:h-[45px] rounded-full bg-black flex items-center justify-center text-white">
                    <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                  {morePosts.map((post) => (
                    <div
                      key={post.id}
                      className="group relative bg-[#ffffff] rounded-[18px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3 border border-white/60"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative w-full aspect-[257/176] rounded-[12px] overflow-hidden bg-neutral-100">
                          {post.image ? (
                            <Image
                              src={proxiedImage(post.image, 400, 300)}
                              alt={post.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
                              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="mt-3 font-[family-name:var(--font-questrial)] text-[14px] md:text-[16px] font-normal text-[#000000] leading-snug line-clamp-2">
                          {post.title}
                        </h4>
                      </div>

                      {/* View Button */}
                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/blogs/${post.id}`}
                          className="h-[34px] px-4 bg-[#000000] hover:bg-neutral-800 text-[#ffffff] font-[family-name:var(--font-questrial)] text-[14px] font-normal rounded-[30.5px] inline-flex items-center gap-1.5 transition-transform active:scale-95 shadow"
                        >
                          <span>View</span>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1737px] mx-auto px-6 md:px-12 pt-8 flex items-center justify-between text-xs md:text-sm text-neutral-800 font-[family-name:var(--font-questrial)]">
        <span>&copy; 2026 AI-News. All rights reserved.</span>
        <span>Curated with automated multi-agent intelligence.</span>
      </footer>
    </div>
  );
}