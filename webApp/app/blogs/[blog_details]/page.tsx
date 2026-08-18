import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsDetailView from "@/components/news-detail-view";
import { getAdminFirestore } from "@/lib/firebase";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ blog_details: string }>;
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

// Curated fallbacks matching Figma content
const fallbackArticles: Record<string, BlogPost> = {
  "figma-1": {
    id: "figma-1",
    title: "Google Deepmind Exposed - Dangerous AI being built",
    content: `Months before moving away from his role as CEO of Google DeepMind, Demis Hassabis held discussions with Trump administration officials and leaders of other AI labs about forming a new independent industry safety body.

According to a report by Wall Street Journal, people familiar to the matter revealed that Hassabis has been advancing the idea of an organization that would codify safety guardrails and best practices for developing artificial general intelligence (AGI). He has likened the proposed entity to the International Atomic Energy Agency, a nongovernmental watchdog for nuclear energy.

The initiative aims to establish unified safety benchmarks across frontier labs before autonomous systems reach human parity across multi-step planning and scientific synthesis.`,
    image: "/images/figma_assets/d683e2816dea32774681db86100fec3a4a51ee27.png",
    category: "Safety & Ethics",
    sourceName: "Wall Street Journal",
    sourceUrl: "https://www.wsj.com",
    createdAt: new Date().toISOString(),
  },
  "figma-2": {
    id: "figma-2",
    title: "Amazon is using Twitch to train generative AI",
    content: `Amazon is leveraging streams from its Twitch video gaming platform to build large-scale multimodal models capable of real-time commentary, strategy synthesis, and interactive video understanding.

Researchers note that unscripted live broadcasts provide rich grounding for temporal context, dynamic dialogue, and user sentiment analysis, opening up new frontiers for autonomous AI agents.`,
    image: "/images/figma_assets/2056fcc51fe7fa7fe4c2b9a7c36a43924f796a32.png",
    category: "Industry",
    sourceName: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    createdAt: new Date().toISOString(),
  },
  "figma-3": {
    id: "figma-3",
    title: "OpenAI announces next-gen reasoning model",
    content: `OpenAI has unveiled its latest reasoning benchmarks, exhibiting breakthroughs in mathematics, software development, and formal verification.

The breakthrough demonstrates that test-time compute scaling laws offer exponential gains in problem-solving reliability.`,
    image: "/images/figma_assets/c6838b2ec0768bf02d77754d8236bb3c0ebd6fbd.png",
    category: "Models",
    sourceName: "The Verge",
    sourceUrl: "https://theverge.com",
    createdAt: new Date().toISOString(),
  },
  "figma-4": {
    id: "figma-4",
    title: "Breakthrough in Autonomous Agent Collaboration",
    content: `A coalition of AI researchers published findings detailing self-organizing multi-agent systems that autonomously decompose, execute, and verify complex engineering workflows with zero human intervention.`,
    image: "/images/figma_assets/f491b83a34bbf60a3de65deccbff35d250ba0df3.png",
    category: "Research",
    sourceName: "MIT Tech Review",
    sourceUrl: "https://technologyreview.com",
    createdAt: new Date().toISOString(),
  },
};

async function getPost(id: string): Promise<BlogPost | null> {
  // 1. Check fallback dictionary first
  if (fallbackArticles[id]) {
    return fallbackArticles[id];
  }

  // 2. Check Firestore
  try {
    const db = getAdminFirestore();
    const doc = await db.collection("blogs").doc(id).get();
    if (!doc.exists) {
      // If not found in firestore, fallback to default article for smooth preview
      return fallbackArticles["figma-1"];
    }

    const d = doc.data()!;
    const sources = Array.isArray(d.sources) && d.sources[0] ? d.sources[0] : {};
    const [sourceName, sourceUrl] = Object.entries(sources)[0] ?? ["", ""];

    return {
      id: doc.id,
      title: d.title ?? "Untitled",
      content: d.content ?? "",
      image: d.image ?? "/images/figma_assets/d683e2816dea32774681db86100fec3a4a51ee27.png",
      category: d.category ?? "AI News",
      sourceName: String(sourceName),
      sourceUrl: String(sourceUrl),
      createdAt: d.created_at?.toDate
        ? d.created_at.toDate().toISOString()
        : null,
    };
  } catch (err) {
    console.error("blog detail error:", err);
    return fallbackArticles["figma-1"];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blog_details } = await params;
  const post = await getPost(blog_details);
  return { title: post ? `${post.title} — AI-News` : "News Details — AI-News" };
}

export default async function BlogDetailPage({ params }: Props) {
  const { blog_details } = await params;
  const post = await getPost(blog_details);

  if (!post) notFound();

  return <NewsDetailView post={post} />;
}