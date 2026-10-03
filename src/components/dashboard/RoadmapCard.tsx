import { CheckCircle2, ListChecks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoadmapStep } from "@/types";

interface Props {
  steps: RoadmapStep[];
}

export function RoadmapCard({ steps }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          Your action roadmap
        </CardTitle>
        <CardDescription>
          A prioritised, country-appropriate checklist. Work top-down.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {steps.map((step) => (
            <li
              key={step.priority}
              className="group flex gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent/40"
            >
              <div className="flex-none">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {step.priority}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                {step.reference && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    {step.reference}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
