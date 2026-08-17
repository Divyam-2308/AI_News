import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Nav from "@/components/nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { getAdminFirestore } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News — AI News",
};

function proxiedImage(image: string, w: number, h?: number): string {
  if (!image) return "";
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
        image: d.image ?? "",
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
  return <CardDescription>{snippet}</CardDescription>;
}

export default async function Blogs() {
  const posts = await getPosts();

  return (
    <>
      <Nav />

      <main className="mx-auto w-full max-w-6xl px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          News
        </h1>
        <p className="mt-3 text-muted-foreground">
          The latest AI stories from our daily digest.
        </p>

        {posts.length === 0 ? (
          <p className="mt-10 text-muted-foreground">
            No stories yet. They appear here as soon as the daily pipeline runs.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blogs/${post.id}`} className="group">
                <Card className="h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
                  {post.image ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      <Image
                        src={proxiedImage(post.image, 800, 450)}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <CardContent className="flex flex-1 flex-col gap-3 p-5">
                    <div>
                      <span className="inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {post.category}
                      </span>
                    </div>
                    <CardTitle className="text-base font-semibold leading-snug transition-colors group-hover:underline">
                      {post.title}
                    </CardTitle>
                    <Description text={post.content} />
                    <span className="mt-auto pt-2 text-xs text-muted-foreground">
                      {post.sourceName || "AI News"}
                      {post.createdAt
                        ? ` · ${new Date(post.createdAt).toLocaleDateString()}`
                        : ""}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}