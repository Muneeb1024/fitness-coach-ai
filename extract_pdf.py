import pdfplumber
import sys
import os

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

output_path = r"e:\WORKSPACE\SMIT-HACKATHON\blueprint_text.txt"

with pdfplumber.open(r"e:\WORKSPACE\SMIT-HACKATHON\AI Fitness Coach Master Blueprint.pdf") as pdf:
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                f.write(f"\n===== PAGE {i+1} =====\n")
                f.write(text)
                f.write("\n")

print(f"Extracted to {output_path}")
print(f"File size: {os.path.getsize(output_path)} bytes")
