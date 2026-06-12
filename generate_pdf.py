from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

questions = [
    ("Sweet cravings", "Salty/savory cravings", "Sweet", "Salty"),
    ("Morning sickness", "No morning sickness", "Morning sickness", "No morning sickness"),
    ("Carrying high", "Carrying low", "High", "Low"),
    ("Glowing skin", "Breaking out", "Glowing", "Breaking out"),
    ("Heart rate above 140", "Heart rate below 140", "Above 140", "Below 140"),
    ("Moody & emotional", "Calm & chill", "Moody", "Calm"),
    ("Hair getting thinner", "Hair getting thicker & fuller", "Thinner", "Thicker"),
    ("Cold feet", "Warm feet", "Warm", "Cold"),
    ("Craving fruit", "Craving meat & cheese", "Fruit", "Meat & cheese"),
    ("Bump out front (like a ball)", "Bump spread wide", "Out front", "Wide"),
    ("Sleeping on your left side", "Sleeping on your right side", "Left", "Right"),
    ("Headaches often", "No headaches", "No headaches", "Headaches"),
    ("Craving orange juice", "Craving apple juice", "Orange juice", "Apple juice"),
    ("Dad gaining weight too", "Dad staying the same", "Dad gaining", "Dad same"),
    ("Dry hands", "Soft hands", "Soft", "Dry"),
    ("Bump low & like a watermelon", "Bump neat & like a basketball", "Watermelon", "Basketball"),
    ("Nails growing fast & strong", "Nails weak & brittle", "Strong nails", "Brittle nails"),
    ("Leg hair growing faster", "Leg hair same as usual", "Same", "Faster"),
    ("More tired than ever", "Energy levels normal", "More tired", "Normal energy"),
    ("Nose spreading/getting wider", "Nose staying the same", "Same nose", "Nose spreading"),
]

doc = SimpleDocTemplate(
    "/home/user/gender-reveal/This_or_That_Gender_Reveal.pdf",
    pagesize=letter,
    topMargin=0.5 * inch,
    bottomMargin=0.5 * inch,
)

styles = getSampleStyleSheet()
title_style = ParagraphStyle("title", parent=styles["Title"], alignment=TA_CENTER)
intro_style = ParagraphStyle("intro", parent=styles["Normal"], alignment=TA_CENTER, spaceAfter=12)
cell_style = ParagraphStyle("cell", parent=styles["Normal"], fontSize=9, leading=11)
header_style = ParagraphStyle("header", parent=styles["Normal"], fontSize=10, leading=12, textColor=colors.white, fontName="Helvetica-Bold")

elements = []
elements.append(Paragraph("This or That - Gender Reveal Edition", title_style))
elements.append(Spacer(1, 8))
elements.append(Paragraph(
    "Tahnee picks an answer for each pair below. Each option points to either "
    "a Girl or a Boy. Tally up the results to reveal the prediction!",
    intro_style,
))

data = [[Paragraph(h, header_style) for h in ["#", "This", "That", "Girl Answer", "Boy Answer"]]]
for i, (this, that, girl, boy) in enumerate(questions, start=1):
    data.append([
        Paragraph(str(i), cell_style),
        Paragraph(this, cell_style),
        Paragraph(that, cell_style),
        Paragraph(girl, cell_style),
        Paragraph(boy, cell_style),
    ])

col_widths = [0.35 * inch, 1.95 * inch, 1.95 * inch, 1.4 * inch, 1.4 * inch]
table = Table(data, colWidths=col_widths, repeatRows=1)
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4472C4")),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F2F2F2")]),
    ("ALIGN", (0, 0), (0, -1), "CENTER"),
]))

elements.append(table)
doc.build(elements)
print("done")
