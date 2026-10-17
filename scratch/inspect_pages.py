import pypdf

reader = pypdf.PdfReader('e:/hrsolution/GULF_HR_PAYROLL_SOLUTION_FUNCTIONALITY_DOCUMENT.pdf')
print(f"Total pages: {len(reader.pages)}")

for i, p in enumerate(reader.pages):
    lines = [line.strip() for line in p.extract_text().splitlines() if line.strip()]
    first = lines[0] if lines else "EMPTY"
    last = lines[-1] if lines else "EMPTY"
    print(f"Page {i+1:02d}: First -> '{first[:60]}' | Last -> '{last[:60]}'")
