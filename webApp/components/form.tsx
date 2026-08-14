"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NewsletterFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Status = "idle" | "submitting" | "success" | "error";

export default function NewsletterForm({ open, onOpenChange }: NewsletterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json()) as {
        message?: string;
      };
      setMessage(data.message ?? "Something went wrong. Please try again.");
      setStatus(res.ok ? "success" : "error");
    } catch {
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const done = status === "success";

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      // Reset the form each time the dialog is closed
      setTimeout(() => {
        setName("");
        setEmail("");
        setStatus("idle");
        setMessage("");
      }, 150);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{done ? "You're in! 🎉" : "Join the AI newsletter"}</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={status === "submitting"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "submitting"}
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-destructive" role="alert">
                {message}
              </p>
            )}

            <DialogFooter className="sm:justify-start">
              <Button
                type="submit"
                className="w-full"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Subscribing…" : "Subscribe"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}