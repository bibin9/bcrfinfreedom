"""Build the BCR FIRE user manual as a styled PDF.

Run from the repo root:
    python scripts/build_user_manual_pdf.py

Output: BCR_FIRE_User_Manual.pdf
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ---------- Colors (FIRE theme) ----------------------------------------------
ORANGE = HexColor("#ea580c")
ORANGE_DARK = HexColor("#c2410c")
ORANGE_BG = HexColor("#fff7ed")
AMBER = HexColor("#f59e0b")
AMBER_BG = HexColor("#fffbeb")
GRAY_BORDER = HexColor("#e5e7eb")
GRAY_TEXT = HexColor("#4b5563")
GRAY_MUTED = HexColor("#6b7280")
INK = HexColor("#111827")

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

# ---------- Styles -----------------------------------------------------------
base = getSampleStyleSheet()


def style(name: str, **kw) -> ParagraphStyle:
    return ParagraphStyle(name, parent=base["Normal"], **kw)


S_TITLE = style(
    "Title",
    fontName="Helvetica-Bold",
    fontSize=26,
    leading=30,
    textColor=ORANGE,
    spaceAfter=4,
)
S_TAGLINE = style(
    "Tagline",
    fontName="Helvetica-Oblique",
    fontSize=11,
    leading=14,
    textColor=GRAY_TEXT,
    spaceAfter=12,
)
S_H1 = style(
    "H1",
    fontName="Helvetica-Bold",
    fontSize=16,
    leading=20,
    textColor=ORANGE_DARK,
    spaceBefore=14,
    spaceAfter=6,
)
S_H2 = style(
    "H2",
    fontName="Helvetica-Bold",
    fontSize=12,
    leading=15,
    textColor=INK,
    spaceBefore=8,
    spaceAfter=3,
)
S_BODY = style(
    "Body",
    fontName="Helvetica",
    fontSize=10,
    leading=14,
    textColor=INK,
    spaceAfter=6,
    alignment=TA_LEFT,
)
S_SMALL = style(
    "Small",
    fontName="Helvetica",
    fontSize=8.5,
    leading=11,
    textColor=GRAY_MUTED,
)
S_QUOTE = style(
    "Quote",
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=15,
    textColor=ORANGE_DARK,
    leftIndent=10,
    rightIndent=6,
    spaceAfter=6,
)
S_CALLOUT = style(
    "Callout",
    fontName="Helvetica",
    fontSize=9.5,
    leading=13,
    textColor=HexColor("#92400e"),
    leftIndent=8,
    rightIndent=8,
    spaceAfter=6,
)
S_STEP_TITLE = style(
    "StepTitle",
    fontName="Helvetica-Bold",
    fontSize=10.5,
    leading=14,
    textColor=INK,
)
S_STEP_BODY = style(
    "StepBody",
    fontName="Helvetica",
    fontSize=9.5,
    leading=13,
    textColor=GRAY_TEXT,
)


# ---------- Helpers ----------------------------------------------------------
def quote(text: str):
    """Orange left-bar quote block."""
    p = Paragraph(text, S_QUOTE)
    t = Table([[p]], colWidths=[PAGE_W - 2 * MARGIN])
    t.setStyle(
        TableStyle(
            [
                ("LINEBEFORE", (0, 0), (0, -1), 3, ORANGE),
                ("BACKGROUND", (0, 0), (-1, -1), ORANGE_BG),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return t


def callout(text: str):
    """Amber 'warning / disclaimer' callout."""
    p = Paragraph(text, S_CALLOUT)
    t = Table([[p]], colWidths=[PAGE_W - 2 * MARGIN])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), AMBER_BG),
                ("BOX", (0, 0), (-1, -1), 0.5, AMBER),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return t


def step(n: int, title: str, body: str):
    """Numbered step card."""
    number = Paragraph(
        f'<font color="#c2410c" size="13"><b>{n}</b></font>', S_STEP_TITLE
    )
    cell = [Paragraph(title, S_STEP_TITLE), Paragraph(body, S_STEP_BODY)]
    num_w = 28
    t = Table(
        [[number, cell]],
        colWidths=[num_w, PAGE_W - 2 * MARGIN - num_w],
    )
    t.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.5, GRAY_BORDER),
                ("BACKGROUND", (0, 0), (0, -1), ORANGE_BG),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return t


def info_table(rows: list[tuple[str, str]], col1_w: float = 110):
    """Two-column reference table (term / explanation)."""
    data = [
        [
            Paragraph(f"<b>{a}</b>", S_BODY),
            Paragraph(b, S_BODY),
        ]
        for a, b in rows
    ]
    t = Table(data, colWidths=[col1_w, PAGE_W - 2 * MARGIN - col1_w])
    t.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (0, 0), (-1, -2), 0.4, GRAY_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def tier_table(rows: list[tuple[str, str, str]]):
    """Three-col: emoji-name / multiple / plain English."""
    data = [
        [
            Paragraph("<b>Tier</b>", S_BODY),
            Paragraph("<b>Multiple</b>", S_BODY),
            Paragraph("<b>Plain English</b>", S_BODY),
        ]
    ]
    for name, mult, plain in rows:
        data.append(
            [
                Paragraph(f"<b>{name}</b>", S_BODY),
                Paragraph(mult, S_BODY),
                Paragraph(plain, S_BODY),
            ]
        )
    inner = PAGE_W - 2 * MARGIN
    t = Table(data, colWidths=[90, 80, inner - 170])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), ORANGE),
                ("TEXTCOLOR", (0, 0), (-1, 0), white),
                ("LINEBELOW", (0, 0), (-1, -2), 0.4, GRAY_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


# ---------- Page chrome ------------------------------------------------------
def draw_chrome(canvas, _doc):
    canvas.saveState()
    # Top accent bar
    canvas.setFillColor(ORANGE)
    canvas.rect(0, PAGE_H - 6 * mm, PAGE_W, 6 * mm, stroke=0, fill=1)
    # Footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY_MUTED)
    canvas.drawString(
        MARGIN,
        10 * mm,
        "BCR FIRE — Financial Independence, Retire Early · BibinCutRiver",
    )
    canvas.drawRightString(
        PAGE_W - MARGIN,
        10 * mm,
        f"Page {canvas.getPageNumber()}",
    )
    canvas.restoreState()


def draw_flame(canvas, cx: float, cy: float, scale: float, color):
    """Draw a stylised flame shape using bezier curves, centred at (cx, cy)."""
    canvas.saveState()
    canvas.setFillColor(color)
    p = canvas.beginPath()
    s = scale
    # Outline of a flame (relative to cx, cy), bottom-up
    p.moveTo(cx, cy - 12 * s)               # bottom point
    p.curveTo(cx - 9 * s, cy - 8 * s,        # left side curving up
              cx - 12 * s, cy + 2 * s,
              cx - 8 * s, cy + 8 * s)
    p.curveTo(cx - 6 * s, cy + 11 * s,
              cx - 4 * s, cy + 8 * s,
              cx - 3 * s, cy + 5 * s)
    p.curveTo(cx - 2 * s, cy + 9 * s,        # inner left dip
              cx, cy + 14 * s,
              cx + 2 * s, cy + 16 * s)
    p.curveTo(cx + 5 * s, cy + 12 * s,       # right side coming down
              cx + 10 * s, cy + 4 * s,
              cx + 6 * s, cy - 4 * s)
    p.curveTo(cx + 4 * s, cy - 8 * s,
              cx + 2 * s, cy - 10 * s,
              cx, cy - 12 * s)
    p.close()
    canvas.drawPath(p, stroke=0, fill=1)
    canvas.restoreState()


def draw_cover(canvas, _doc):
    canvas.saveState()
    # Big orange band at top
    canvas.setFillColor(ORANGE)
    canvas.rect(0, PAGE_H - 70 * mm, PAGE_W, 70 * mm, stroke=0, fill=1)
    # White circle behind the flame
    canvas.setFillColor(white)
    canvas.circle(PAGE_W / 2, PAGE_H - 35 * mm, 14 * mm, stroke=0, fill=1)
    # Vector flame in orange
    draw_flame(canvas, PAGE_W / 2, PAGE_H - 36 * mm, 1.5, ORANGE)
    # Title
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 32)
    canvas.drawCentredString(PAGE_W / 2, PAGE_H - 62 * mm, "BCR FIRE")
    # Subtitle below band
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawCentredString(PAGE_W / 2, PAGE_H - 90 * mm, "User Manual")
    canvas.setFont("Helvetica-Oblique", 11)
    canvas.setFillColor(GRAY_TEXT)
    canvas.drawCentredString(
        PAGE_W / 2,
        PAGE_H - 100 * mm,
        "Financial Independence, Retire Early — for everyone",
    )
    # Footer URL
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(ORANGE_DARK)
    canvas.drawCentredString(
        PAGE_W / 2, 20 * mm, "finfreedom-advisor.pages.dev"
    )
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY_MUTED)
    canvas.drawCentredString(
        PAGE_W / 2, 14 * mm, "by BibinCutRiver · educational use only"
    )
    canvas.restoreState()


# ---------- Document build ---------------------------------------------------
def build(out: Path) -> None:
    doc = BaseDocTemplate(
        str(out),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="BCR FIRE — User Manual",
        author="BibinCutRiver",
        subject="Financial Independence, Retire Early — user manual",
    )

    frame_cover = Frame(
        0, 0, PAGE_W, PAGE_H, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="cover"
    )
    frame_body = Frame(
        MARGIN,
        MARGIN,
        PAGE_W - 2 * MARGIN,
        PAGE_H - 2 * MARGIN - 6 * mm,
        id="body",
    )

    doc.addPageTemplates(
        [
            PageTemplate(id="cover", frames=[frame_cover], onPage=draw_cover),
            PageTemplate(id="body", frames=[frame_body], onPage=draw_chrome),
        ]
    )

    story: list = []

    # ---- Cover page (drawn by onPage; just a frame-break) -------------------
    story.append(Spacer(1, 1))
    story.append(PageBreak())

    # Switch to body template
    from reportlab.platypus import NextPageTemplate

    story.insert(0, NextPageTemplate("body"))

    # ---- Section 1 ----------------------------------------------------------
    story.append(Paragraph("What is BCR FIRE?", S_H1))
    story.append(
        Paragraph(
            "<b>BCR FIRE</b> helps you figure out one simple question: "
            "<i>when can I stop working and live off my savings?</i>",
            S_BODY,
        )
    )
    story.append(
        Paragraph(
            "It does the maths for you using your country's real numbers — "
            "inflation, investment returns, average living costs — so you "
            "see how much money you really need and how to get there.",
            S_BODY,
        )
    )
    story.append(
        callout(
            "<b>Educational only.</b> Numbers shown are estimates, not "
            "financial advice. Talk to a registered advisor before investing."
        )
    )

    # ---- Section 2 ----------------------------------------------------------
    story.append(Paragraph("What does 'FIRE' mean?", S_H1))
    story.append(
        Paragraph(
            "<b>FIRE = Financial Independence, Retire Early.</b> A global "
            "movement built on one simple rule:",
            S_BODY,
        )
    )
    story.append(
        quote(
            "When your savings are 25× your yearly spending, you can live "
            "off them for life. That's the '4% rule'."
        )
    )
    story.append(Paragraph("<b>Example, very simple:</b>", S_BODY))
    story.append(
        Paragraph(
            "• You spend <b>₹14 lakhs / year</b> on everything "
            "(rent, food, school, fuel).<br/>"
            "• 25 × ₹14 L = <b>₹3.5 crores</b>. That's your FIRE number.<br/>"
            "• Hit ₹3.5 Cr → withdraw 4% (₹14 L) every year → savings still "
            "grow on the other 96%.",
            S_BODY,
        )
    )
    story.append(
        Paragraph(
            "The app figures out <b>your</b> FIRE number based on where "
            "you live and your lifestyle, then shows you how many years it "
            "will take.",
            S_BODY,
        )
    )

    # ---- Section 3 ----------------------------------------------------------
    story.append(Paragraph("Quick start — 3 steps", S_H1))
    story.append(
        step(
            1,
            "Tell us about you",
            "Pick your country, age, and monthly income. You can change "
            "these any time by tapping <b>Edit</b> at the top of the dashboard.",
        )
    )
    story.append(Spacer(1, 4))
    story.append(
        step(
            2,
            "Set your lifestyle in Fine-tune",
            "On the right side of the dashboard pick <b>Single</b> or "
            "<b>Family of 4</b> — the app uses your country's average for "
            "that household. If you spend more (or less), type the real "
            "number in <i>'Your annual expenses'</i>.",
        )
    )
    story.append(Spacer(1, 4))
    story.append(
        step(
            3,
            "Read your FIRE plan",
            "Open the <b>Freedom</b> tab. The big orange box is your "
            "<b>FI Ratio</b> — how close you are to FIRE today. Below it "
            "are FIRE tiers, charts, and a year-by-year plan.",
        )
    )

    story.append(PageBreak())

    # ---- Section 4 ----------------------------------------------------------
    story.append(Paragraph("What each tab does", S_H1))
    story.append(
        info_table(
            [
                ("Overview", "Big picture — allocation, FIRE number, expected returns. Start here."),
                ("Life plan", "Decade-by-decade roadmap: money, health, and relationships from 18 to 90+."),
                ("Allocation", "Where your money should go: stocks, bonds, gold, real estate, crypto — with reasons."),
                ("Funds", "Real fund names you can actually buy in your country — index funds, ELSS, ETFs, sukuks, etc."),
                ("Compounding", "A chart showing what your money turns into in 10, 20, 30 years."),
                ("Freedom (FIRE)", "FIRE number, tiers (Lean / Standard / Fat / Coast), savings-rate chart, year-by-year plan."),
                ("Tracker", "Save & compare scenarios. Log corpus every quarter to see your real FI Ratio trajectory."),
                ("Paths", "Side-by-side comparison: disciplined investor vs someone who waits. Eye-opening at age 60."),
                ("Crypto", "Honest, no-hype crypto guidance for your country: rules, pitfalls, learning links."),
                ("Start", "Concrete first steps — which account to open, which fund to buy, in what order."),
                ("NRI", "Only appears if you tick NRI. Indian non-resident options: NRE/NRO/GIFT-City."),
            ],
            col1_w=95,
        )
    )

    # ---- Section 5 ----------------------------------------------------------
    story.append(Paragraph("The Fine-tune panel", S_H1))
    story.append(
        Paragraph(
            "Every slider on the right of the dashboard updates the numbers live:",
            S_BODY,
        )
    )
    story.append(
        info_table(
            [
                ("Savings rate", "What % of salary you save each month. <b>Most powerful lever</b> — doubling it roughly halves your years to FIRE."),
                ("Target freedom age", "Pick when you want to stop working. Younger = bigger SIP needed."),
                ("Household", "Single or Family of 4. Changes the country expense benchmark."),
                ("Your annual expenses", "Optional. Type your real number if you know it for best accuracy."),
                ("Current invested corpus", "What you already have invested today. Counts toward your FI Ratio."),
            ]
        )
    )

    story.append(PageBreak())

    # ---- Section 6 ----------------------------------------------------------
    story.append(Paragraph("FIRE tiers in plain English", S_H1))
    story.append(
        tier_table(
            [
                (
                    "LeanFIRE",
                    "15× spend",
                    "Frugal retirement. Smaller home, public transport, cooking at home. Cheapest exit.",
                ),
                (
                    "FIRE",
                    "25× spend",
                    "The classic. Live your current lifestyle indefinitely on 4% withdrawals.",
                ),
                (
                    "FatFIRE",
                    "33× spend",
                    "Comfortable. Travel, eat out, hobbies — all included. Uses safer 3% withdrawals.",
                ),
                (
                    "CoastFIRE",
                    "varies",
                    "Amount you need today that — even if you stop saving — compounds into the full FIRE number by retirement age.",
                ),
            ]
        )
    )

    # ---- Section 7 ----------------------------------------------------------
    story.append(Paragraph("Key numbers, explained", S_H1))
    story.append(
        info_table(
            [
                ("FI Ratio", "Current invested money ÷ today's FIRE number, as a %. Hits 100% = you're free."),
                ("FIRE number", "Total money you need to retire. Always 25× your yearly spending (inflated to the future if it's a future target)."),
                ("Required SIP", "How much you need to invest every month to hit FIRE by your target age."),
                ("Years to FIRE", "How many years until your wealth crosses your FIRE number at current savings."),
                ("Expected return", "What your portfolio earns per year on average. India ~11%, UAE ~8%, US ~8.5%."),
                ("Inflation", "How fast prices rise per year. Things cost more in 20 years — the app builds that in."),
                ("SIP", "Systematic Investment Plan. A fixed amount you invest every month, automatically. The FIRE engine."),
            ]
        )
    )

    # ---- Section 8 ----------------------------------------------------------
    story.append(Paragraph("Pro tips for accurate numbers", S_H1))
    story.append(
        Paragraph(
            "• <b>Be honest about expenses.</b> Track 3 months of spending and "
            "put the average into <i>'Your annual expenses'</i>. The FIRE number "
            "is only as good as this input.<br/>"
            "• <b>Pick the country you'll retire in</b>, not just where you live "
            "now. An NRI in UAE retiring in India should pick India for the FIRE "
            "number.<br/>"
            "• <b>Update yearly</b>, not daily. After every salary raise or big "
            "life change (marriage, kids, house).<br/>"
            "• <b>Automate the SIP on payday.</b> Money you don't see is money "
            "you don't spend. People who automate save 3× better.<br/>"
            "• <b>Don't panic-sell during dips.</b> Compounding rewards "
            "consistency. The Paths tab shows what happens to people who do.",
            S_BODY,
        )
    )

    story.append(PageBreak())

    # ---- Section 9 ----------------------------------------------------------
    story.append(Paragraph("Install on your phone", S_H1))
    story.append(
        Paragraph(
            "You can install BCR FIRE like a real app — <b>no app store needed</b>:",
            S_BODY,
        )
    )
    story.append(
        info_table(
            [
                (
                    "Android",
                    "Chrome / Edge: tap the <i>Install</i> banner at the bottom, "
                    "or menu (⋮) → <b>Install app</b> / <b>Add to Home screen</b>.",
                ),
                (
                    "iPhone",
                    "Safari: tap the <b>Share</b> button (box with up-arrow) → "
                    "<b>Add to Home Screen</b>.",
                ),
            ],
            col1_w=80,
        )
    )
    story.append(
        Paragraph(
            "Once installed: orange flame icon on your home screen, launches "
            "fullscreen, works offline. Your data stays on your device.",
            S_SMALL,
        )
    )

    # ---- Section 10 ---------------------------------------------------------
    story.append(Paragraph("Frequently asked questions", S_H1))

    faqs = [
        (
            "Is my data sent anywhere?",
            "No. Everything lives in your browser's local storage. Nothing "
            "leaves your phone. Tap <i>Start over</i> in the header to wipe it.",
        ),
        (
            "I'm an expat — save in one country, retire in another?",
            "For now, pick the country you'll <b>retire in</b> — that drives "
            "your FIRE number. Use the NRI checkbox if you're an Indian "
            "non-resident. A proper dual-country mode is on the roadmap.",
        ),
        (
            "Why does my FIRE number look so big?",
            "Inflation. ₹14 L today becomes ₹36 L in 18 years at 5.5% inflation. "
            "The app sizes your corpus for what life will actually cost <i>then</i>, "
            "not now.",
        ),
        (
            "What's a 'good' savings rate?",
            "Whatever you can sustain. Classic FIRE community targets 50%+. "
            "Most retail savers do 10–20%. Even moving from 15% → 25% knocks "
            "5–8 years off your timeline.",
        ),
        (
            "Should I include my house in 'current corpus'?",
            "No. Only <b>liquid investments</b> — mutual funds, stocks, ETFs, "
            "fixed deposits, gold ETFs. Your primary home doesn't generate "
            "withdrawal income.",
        ),
        (
            "The expected return seems high — is that realistic?",
            "It's a 20–30 year nominal average for your country's main index. "
            "Short periods will be lower or higher. The 4% rule is built to "
            "survive bad decades.",
        ),
    ]
    for q, a in faqs:
        story.append(Paragraph(f"<b>{q}</b>", S_H2))
        story.append(Paragraph(a, S_BODY))

    # ---- Disclaimer ---------------------------------------------------------
    story.append(Spacer(1, 12))
    story.append(
        callout(
            "<b>Disclaimer.</b> BCR FIRE is an educational tool by "
            "BibinCutRiver. Numbers are illustrative approximations using "
            "publicly available country data. <b>This is not investment "
            "advice.</b> Consult a SEBI / SCA / FCA / SEC-registered "
            "advisor before acting. Past performance does not guarantee "
            "future returns."
        )
    )

    doc.build(story)


if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "BCR_FIRE_User_Manual.pdf"
    build(out)
    print(f"Wrote {out} ({out.stat().st_size / 1024:.1f} KiB)")
