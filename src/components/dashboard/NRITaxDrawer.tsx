import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NRITaxCard } from "@/components/dashboard/NRITaxCard";

/**
 * Opens the NRI tax calculator (Section 6 residency + RNOR window + NRE/NRO
 * + tax savings) as a full-screen dialog instead of taking a dashboard tab.
 *
 * Rationale: the calculator is powerful but only interesting to a subset of
 * users at a specific moment ("I'm thinking about returning to India"). It
 * doesn't belong in the top-level nav — it belongs behind a button.
 */
export function NRITaxDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Calculator className="h-4 w-4" />
          Open NRI tax calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-3">
          <DialogTitle>NRI tax calculator</DialogTitle>
          <DialogDescription>
            Four interactive tools in one — Section 6 residency, RNOR window, NRE vs NRO, and
            tax-savings estimate.
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 py-4">
          <NRITaxCard />
        </div>
      </DialogContent>
    </Dialog>
  );
}
