"use client";

import Script from "next/script";

import { ACUITY_SCHEDULE_EMBED_SRC } from "@/lib/acuity";

type AcuityScheduleEmbedProps = {
  /** Scheduler iframe URL (validated on the server via resolveAcuityIframeSrc). */
  src?: string;
};

export function AcuityScheduleEmbed({ src = ACUITY_SCHEDULE_EMBED_SRC }: AcuityScheduleEmbedProps) {
  return (
    <>
      <iframe
        src={src}
        title="Schedule Appointment"
        width="100%"
        height={800}
        className="min-h-[50vh] w-full border-0 md:min-h-[800px]"
        allow="payment"
      />
      <Script src="https://embed.acuityscheduling.com/js/embed.js" strategy="afterInteractive" />
    </>
  );
}
