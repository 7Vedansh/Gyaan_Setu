import pypdf

reader = pypdf.PdfReader("docs/science.pdf")
print(f"Number of pages: {len(reader.pages)}")
for i, page in enumerate(reader.pages[:2]):
    text = page.extract_text()
    print(f"Page {i} text: {text[:200]}...")
