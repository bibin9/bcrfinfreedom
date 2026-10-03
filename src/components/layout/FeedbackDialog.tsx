import { useState } from "react";
import { Check, Copy, MessageSquareHeart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/store/userStore";

const FEEDBACK_EMAIL = "bibin9@gmail.com";
const FACES = ["😣", "😕", "😐", "🙂", "😍"];

interface Props {
  /** "link" = small text link (footer); "button" = outlined button. */
  variant?: "link" | "button";
}

/**
 * Feedback form that opens the user's email app. Deliberately excludes any
 * money figures — only country, language and screen — so people feel safe
 * sending it.
 */
export function FeedbackDialog({ variant = "link" }: Props) {
  const { t, lang } = useI18n();
  const inputs = useUserStore((s) => s.inputs);
  const phase = useUserStore((s) => s.phase);
  const tab = useUserStore((s) => s.dashboardTab);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [confusing, setConfusing] = useState("");
  const [missing, setMissing] = useState("");
  const [copied, setCopied] = useState(false);

  const context = [
    `Lives in: ${inputs.country ?? "?"}`,
    inputs.retirementCountry ? `Retiring in: ${inputs.retirementCountry}` : null,
    `Language: ${lang}`,
    `Screen: ${phase === "dashboard" ? tab : phase}`,
    `Device: ${typeof window !== "undefined" && window.innerWidth < 640 ? "phone" : "computer"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const body = [
    `How easy to understand: ${rating != null ? `${rating + 1}/5 ${FACES[rating]}` : "not rated"}`,
    "",
    `What confused me:`,
    confusing.trim() || "-",
    "",
    `What's missing / what I wish it did:`,
    missing.trim() || "-",
    "",
    `(${context})`,
  ].join("\n");

  const mailto = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
    "BCR FIRE feedback",
  )}&body=${encodeURIComponent(body)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${FEEDBACK_EMAIL}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked — the email button still works */
    }
  };

  const canSend = rating != null || confusing.trim() !== "" || missing.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "button" ? (
          <Button variant="outline" size="sm" className="border-orange-500/40">
            <MessageSquareHeart className="h-4 w-4" />
            {t("feedback.open")}
          </Button>
        ) : (
          <button type="button" className="underline underline-offset-4 hover:text-foreground">
            💬 {t("feedback.open")}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>{t("feedback.title")}</DialogTitle>
          <DialogDescription>{t("feedback.intro")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-5 pb-5">
          <div>
            <p className="text-sm font-medium">{t("feedback.easyQuestion")}</p>
            <div className="mt-2 flex justify-between gap-1">
              {FACES.map((face, i) => (
                <button
                  key={face}
                  type="button"
                  onClick={() => setRating(i)}
                  aria-label={`${i + 1} of 5`}
                  aria-pressed={rating === i}
                  className={`flex-1 rounded-lg border py-2 text-2xl transition ${
                    rating === i
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  {face}
                </button>
              ))}
            </div>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("feedback.confusingQuestion")}</span>
            <textarea
              value={confusing}
              onChange={(e) => setConfusing(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
              placeholder={t("feedback.confusingPlaceholder")}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("feedback.missingQuestion")}</span>
            <textarea
              value={missing}
              onChange={(e) => setMissing(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
              placeholder={t("feedback.missingPlaceholder")}
            />
          </label>
          <p className="text-[11px] text-muted-foreground">{t("feedback.privacy")}</p>
          <div className="flex gap-2">
            <Button asChild={canSend} disabled={!canSend} className="flex-1 bg-orange-600 hover:bg-orange-700">
              {canSend ? (
                <a href={mailto} onClick={() => setTimeout(() => setOpen(false), 300)}>
                  <Send className="h-4 w-4" /> {t("feedback.send")}
                </a>
              ) : (
                <span>
                  <Send className="h-4 w-4" /> {t("feedback.send")}
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={copy} disabled={!canSend} aria-label={t("feedback.copy")}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-emerald-600">
              {t("feedback.copied")} {FEEDBACK_EMAIL}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
