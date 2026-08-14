import type { Metadata } from "next";
import Link from "next/link";

import Nav from "@/components/nav";
import { getAdminFirestore } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogs — AI News",
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

async function getPosts(): Promise<BlogPost[]> {
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection("blogs")
      .orderBy("created_at", "desc")
      .limit(50)
      .get();

    return snap.docs.map((doc) => {
      const d = doc.data();
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
    });
  } catch (err) {
    console.error("blogs list error:", err);
    return [];
  }
}

function Description({ text }: { text: string }) {
  const clean = text.replace(/\s+/g, " ").trim();
  const snippet = clean.length > 200 ? `${clean.slice(0, 200)}…` : clean;
  return <p className="text-sm text-muted-foreground">{snippet}</p>;
}

export default async function Blogs() {
  const posts = await getPosts();

  return (
    <>
      <Nav />

      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Blogs</h1>
        <p className="mb-10 text-muted-foreground">
          The latest AI stories from our daily digest.
        </p>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No blog posts yet. They appear here as soon as the daily pipeline runs.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blogs/${post.id}`}
                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
              >
                <span className="inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {post.category}
                </span>
                <h2 className="font-semibold leading-snug group-hover:underline">
                  {post.title}
                </h2>
                <Description text={post.content} />
                <span className="mt-auto pt-2 text-xs text-muted-foreground">
                  {post.sourceName || "AI News"}
                  {post.createdAt
                    ? ` · ${new Date(post.createdAt).toLocaleDateString()}`
                    : ""}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}