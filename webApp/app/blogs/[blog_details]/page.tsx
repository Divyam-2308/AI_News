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

async function getPost(id: string): Promise<BlogPost | null> {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection("blogs").doc(id).get();

    if (!doc.exists) return null;

    const d = doc.data()!;
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
  } catch (err) {
    console.error("blog detail error:", err);
    return null;
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