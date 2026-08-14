import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/lib/firebase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { name?: string; email?: string } = {};
  try {
    body = (await req.json()) as { name?: string; email?: string };
  } catch {
    // ignore malformed body
  }

  const cleanName = (body.name ?? "").trim();
  const cleanEmail = (body.email ?? "").trim().toLowerCase();

  if (!cleanName) {
    return NextResponse.json(
      { ok: false, message: "Please enter your name." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const db = getAdminFirestore();
    const users = db.collection("users");

    const existing = await users.where("email", "==", cleanEmail).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({
        ok: false,
        alreadySubscribed: true,
        message: "You're already subscribed!",
      });
    }

    const docId =
      cleanEmail.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "user";

    await users.doc(docId).set({
      name: cleanName,
      email: cleanEmail,
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Subscribed! You'll get the AI digest in your inbox every morning.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("subscribe error:", err);
    return NextResponse.json(
      { ok: false, message: "Something went wrong on our end. Please try again." },
      { status: 500 }
    );
  }
}