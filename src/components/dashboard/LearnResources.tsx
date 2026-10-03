import { BookOpen, ExternalLink, Search as SearchIcon, Youtube } from "lucide-react";
import type { CategoryResources } from "@/data/learningResources";

interface Props {
  resources: CategoryResources;
  /** Optional heading ("Learn about small cap funds"). Hidden when omitted. */
  heading?: string;
  /** Extra readings shown first, e.g. general references. */
  extraReadings?: CategoryResources["readings"];
}

/**
 * Renders YouTube search shortcuts, educator channels, and written references
 * for a given topic. Used inside fund-type accordions and the fund search.
 *
 * Note on "most viewed" YouTube links: view counts change daily, so instead
 * of hard-coding a single video URL we send users to a YouTube search sorted
 * by view count (sp=CAMSAhAB). The top results are always the most-watched
 * on that query on the day they click.
 */
export function LearnResources({ resources, heading, extraReadings }: Props) {
  const readings = [...(extraReadings ?? []), ...resources.readings];
  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
      {heading && (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {heading}
        </p>
      )}

      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Youtube className="h-3.5 w-3.5" />
          Most viewed on YouTube
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {resources.searches.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:border-primary hover:text-primary"
              >
                <SearchIcon className="h-3 w-3" />
                {s.query}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-[10px] italic text-muted-foreground">
          Opens YouTube ranked by view count — the top results are the most-watched videos.
        </p>
      </div>

      {resources.channels.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Youtube className="h-3.5 w-3.5" />
            Trusted channels
          </p>
          <ul className="space-y-1">
            {resources.channels.map((c) => (
              <li key={c.url} className="text-xs">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium hover:text-primary"
                >
                  {c.name}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <span className="ml-1 text-muted-foreground">— {c.why}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {readings.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Study materials
          </p>
          <ul className="space-y-1">
            {readings.map((r) => (
              <li key={r.url} className="text-xs">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${typeBadge(
                      r.type,
                    )}`}
                  >
                    {typeLabel(r.type)}
                  </span>
                  <span className="font-medium">{r.title}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function typeBadge(type: "wiki" | "article" | "book" | "regulator"): string {
  switch (type) {
    case "wiki":
      return "bg-blue-500/15 text-blue-500";
    case "article":
      return "bg-emerald-500/15 text-emerald-500";
    case "book":
      return "bg-purple-500/15 text-purple-500";
    case "regulator":
      return "bg-amber-500/15 text-amber-500";
  }
}

function typeLabel(type: "wiki" | "article" | "book" | "regulator"): string {
  switch (type) {
    case "wiki":
      return "Wiki";
    case "article":
      return "Article";
    case "book":
      return "Book";
    case "regulator":
      return "Official";
  }
}
