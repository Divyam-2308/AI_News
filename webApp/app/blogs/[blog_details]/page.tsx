import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Nav from "@/components/nav";
import { getAdminFirestore } from "@/lib/firebase";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ blog_details: string }>;
};

type BlogPost = {
  id: string;
  title: string;
  content: string;
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
      category: d.category ?? "Other",
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
  return { title: post ? `${post.title} — AI News` : "Not found — AI News" };
}

export default async function BlogDetail({ params }: Props) {
  const { blog_details } = await params;
  const post = await getPost(blog_details);

  if (!post) notFound();

  const paragraphs = post.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Nav />

      <article className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
        <Link
          href="/blogs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to blogs
        </Link>

        <span className="mt-6 inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {post.category}
        </span>

        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </p>

        <div className="mt-8 space-y-4 leading-relaxed text-foreground/90">
          {paragraphs.length > 1 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>{post.content}</p>
          )}
        </div>

        {post.sourceUrl ? (
          <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
            Source:{" "}
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-foreground"
            >
              {post.sourceName || post.sourceUrl}
            </a>
          </p>
        ) : null}
      </article>
    </>
  );
}