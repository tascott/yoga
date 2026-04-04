"use client";

import { FormEvent, useState } from "react";

/** Trim — Web3Forms rejects keys with accidental whitespace from .env. */
const accessKey = (process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "").trim();

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessKey) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("access_key", accessKey);

    setStatus("sending");
    setErrorDetail("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { success?: boolean; message?: string };

      if (response.ok && data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorDetail(data.message || `Could not send your message. (${response.status})`);
      }
    } catch {
      setStatus("error");
      setErrorDetail("Something went wrong. Please try again.");
    }
  }

  const disabled = !accessKey || status === "sending";

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <input type="hidden" name="subject" value="New Accessible Yoga Hut enquiry" />
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      <div>
        <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          required
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
        />
      </div>
      {!accessKey ? (
        <p className="text-xs text-red-700">Missing `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` in environment settings.</p>
      ) : null}
      {status === "success" ? (
        <p className="text-sm font-medium text-emerald-800" role="status">
          Thanks — your message was sent. We&apos;ll be in touch soon.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-700" role="alert">
          {errorDetail}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={disabled}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
