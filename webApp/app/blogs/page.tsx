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

function proxiedImage(image: string, w: number, h?: number): string {
  if (!image) return "";
  if (image.startsWith("/images/")) return image;
  const params = [`url=${encodeURIComponent(image)}`, `w=${w}`, "fit=cover", "q=80"];
  if (h) params.push(`h=${h}`);
  return `https://images.weserv.nl/?${params.join("&")}`;
}

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

// Fallback curated articles from Figma design
const fallbackLatestPosts: BlogPost[] = [
  {
    id: "figma-1",
    title: "Google Deepmind Exposed - Dangerous AI being built",
    content:
      "In a converted aircraft hangar on the shores of Lough Foyle, local workers are helping to power the Artificial Intelligence (AI) revolution ...",
    image: "/images/figma_assets/d683e2816dea32774681db86100fec3a4a51ee27.png",
    category: "Safety & Ethics",
    sourceName: "WSJ",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-2",
    title: "Amazon is using Twitch to train generative AI",
    content:
      "Amazon researchers are tapping live streaming videos to train multimodal vision-language models for real-time interactions.",
    image: "/images/figma_assets/2056fcc51fe7fa7fe4c2b9a7c36a43924f796a32.png",
    category: "Industry",
    sourceName: "TechCrunch",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-3",
    title: "OpenAI announces next-gen reasoning model",
    content:
      "New autonomous reasoning benchmark breakthroughs highlight rapid development in frontier AI architectures.",
    image: "/images/figma_assets/c6838b2ec0768bf02d77754d8236bb3c0ebd6fbd.png",
    category: "Models",
    sourceName: "The Verge",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-4",
    title: "Breakthrough in Autonomous Agent Collaboration",
    content:
      "Multi-agent networks demonstrate emergent cooperative behaviors in complex software engineering pipelines.",
    image: "/images/figma_assets/f491b83a34bbf60a3de65deccbff35d250ba0df3.png",
    category: "Research",
    sourceName: "MIT Tech Review",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
];

const fallbackAllPosts: BlogPost[] = [
  {
    id: "figma-all-1",
    title: "Amazon is using Twitch to train generative AI",
    content: "Multimodal dataset collection from interactive creator streams.",
    image: "/images/figma_assets/8cbfef910beba0eeeb2e2f69fef89e2dd403e226.png",
    category: "Industry",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-2",
    title: "Anthropic rolls out new Claude tools",
    content: "Advanced tooling integration for enterprise workflows.",
    image: "/images/figma_assets/ff1f25ff48728ffd112000008cd942144cf86038.png",
    category: "Models",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-3",
    title: "NVIDIA announces Blackwell Ultra architecture",
    content: "Next-generation GPU compute density for datacenter scale training.",
    image: "/images/figma_assets/44126cedfa76443c5b88ec7bbfad3ca2fba49826.png",
    category: "Hardware",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-4",
    title: "DeepSeek releases frontier open-weights model",
    content: "State of the art open-weight reasoning model released to developers.",
    image: "/images/figma_assets/015f4939f40fe3ff4dcdd2fbc6c4bfe8a5cbb73b.png",
    category: "Open Source",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-5",
    title: "Google unveils Gemini 2.0 Live features",
    content: "Ultra-low latency audio and vision streaming API capabilities.",
    image: "/images/figma_assets/cbd6a70253eafd93a247c4f8862f0e9df49f6c11.png",
    category: "Models",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-6",
    title: "Meta introduces Llama 4 roadmap",
    content: "Upcoming multimodal capabilities and expanded context windows.",
    image: "/images/figma_assets/ad681051ceb7216dc95d5fe073eb0c96e2f2104f.png",
    category: "Open Source",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-7",
    title: "Apple Intelligence deep integration updates",
    content: "On-device foundational model acceleration across ecosystems.",
    image: "/images/figma_assets/ab1ee74a95fe03296aba97ea328627de504801f0.png",
    category: "Consumer",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-8",
    title: "Microsoft Copilot expands Studio capabilities",
    content: "Autonomous agent builders for internal enterprise automation.",
    image: "/images/figma_assets/97b64e527a20c326d9c6e39df16a7504fbb7a87e.png",
    category: "Enterprise",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-9",
    title: "Robotics foundation models take next leap",
    content: "Cross-embodiment manipulation models demonstrate generalized grasping.",
    image: "/images/figma_assets/f94c539005c6f5e6d788a8c6dc03b605a40be3a8.png",
    category: "Robotics",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-10",
    title: "AI safety guidelines draft announced",
    content: "International consortium proposes verification standards.",
    image: "/images/figma_assets/f2192fba22730af8a8d66296117d81bcdd8ad848.png",
    category: "Policy",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-11",
    title: "Synthetic data generation breakthrough in medicine",
    content: "Privacy-preserving medical datasets accelerate diagnostic research.",
    image: "/images/figma_assets/9db0b1242fd121edb3d4a7982ca93f2b5d15fcbc.png",
    category: "Healthcare",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "figma-all-12",
    title: "Quantum AI algorithms reach computational advantage",
    content: "Hybrid quantum-classical optimization for complex molecular simulation.",
    image: "/images/figma_assets/3b3a8636be26baef6ceea73f6289b5c3ff9010bb.png",
    category: "Quantum",
    sourceName: "AI News",
    sourceUrl: "",
    createdAt: new Date().toISOString(),
  },
];

async function getPosts(): Promise<BlogPost[]> {
  try {
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
  } catch (err) {
    console.error("blogs list error:", err);
    return [];
  }
}

export default async function NewsPage() {
  const dbPosts = await getPosts();
  const latestPosts = dbPosts.length >= 4 ? dbPosts.slice(0, 4) : fallbackLatestPosts;
  const allPosts = dbPosts.length > 4 ? dbPosts.slice(4) : fallbackAllPosts;

  return (
    <div className="relative min-h-screen text-[#000000] flex flex-col justify-between overflow-x-hidden selection:bg-neutral-900 selection:text-white pb-16">
      {/* Background */}
      <SkyMeshBG />

      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <main className="flex-1 max-w-[1737px] w-full mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-16">
        {/* Section 1: Discover Latest News */}
        <section className="w-full">
          {/* Section Header */}
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

          {/* Featured Cards Horizontal Grid / Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestPosts.map((post) => (
              <div
                key={post.id}
                className="group relative bg-[#ffffff] rounded-[30px] md:rounded-[36px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-white/60 p-4 md:p-5"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[591/353] rounded-[22px] md:rounded-[26px] overflow-hidden bg-neutral-100">
                    <Image
                      src={post.image.startsWith("/images/") ? post.image : proxiedImage(post.image, 800, 500)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4 space-y-2">
                    <h3 className="font-[family-name:var(--font-questrial)] text-[22px] md:text-[26px] lg:text-[28px] font-normal text-[#000000] leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="font-[family-name:var(--font-questrial)] text-[14px] md:text-[16px] text-[#727272] line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Bottom View Button */}
                <div className="mt-6 flex justify-end">
                  <Link
                    href={`/blogs/${post.id}`}
                    className="h-[44px] md:h-[49px] px-6 bg-[#000000] hover:bg-neutral-800 text-[#ffffff] font-[family-name:var(--font-questrial)] text-[18px] md:text-[22px] font-normal rounded-[30.5px] inline-flex items-center gap-3 transition-transform active:scale-95 shadow-md"
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

        {/* Section 2: All News */}
        <section className="w-full">
          {/* Section Header */}
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

          {/* Compact Cards Grid (Figma 6 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {allPosts.map((post) => (
              <div
                key={post.id}
                className="group relative bg-[#ffffff] rounded-[18px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3 border border-white/60"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[257/176] rounded-[12px] overflow-hidden bg-neutral-100">
                    <Image
                      src={post.image.startsWith("/images/") ? post.image : proxiedImage(post.image, 400, 300)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Title */}
                  <h4 className="mt-3 font-[family-name:var(--font-questrial)] text-[16px] md:text-[18px] font-normal text-[#000000] leading-snug line-clamp-2">
                    {post.title}
                  </h4>
                </div>

                {/* View Button */}
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/blogs/${post.id}`}
                    className="h-[38px] px-4 bg-[#000000] hover:bg-neutral-800 text-[#ffffff] font-[family-name:var(--font-questrial)] text-[16px] font-normal rounded-[30.5px] inline-flex items-center gap-2 transition-transform active:scale-95 shadow"
                  >
                    <span>View</span>
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1737px] mx-auto px-6 md:px-12 pt-8 flex items-center justify-between text-xs md:text-sm text-neutral-800 font-[family-name:var(--font-questrial)]">
        <span>&copy; 2026 AI-News. All rights reserved.</span>
        <span>Curated with automated multi-agent intelligence.</span>
      </footer>
    </div>
  );
}