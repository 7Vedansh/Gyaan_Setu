import re

def clean_text(text: str) -> str:
    # Original regex from ingest.py
    print(f"Original length: {len(text)}")
    text_with_fig = re.sub(r"Fig\.\s*\d+(\.\d+)*:.*", "", text)
    print(f"After Fig removal: {len(text_with_fig)}")
    
    # This is the suspicious one
    text_after_aggressive = re.sub(r"^[A-Za-z0-9\s=\-\+\(\)\.\^]+$", "", text_with_fig, flags=re.MULTILINE)
    print(f"After aggressive clean: {len(text_after_aggressive)}")
    
    deleted_lines = []
    for line in text_with_fig.split('\n'):
        if re.match(r"^[A-Za-z0-9\s=\-\+\(\)\.\^]+$", line):
            deleted_lines.append(line)
    
    print(f"Deleted {len(deleted_lines)} lines.")
    if deleted_lines:
        print("Sample deleted lines:")
        for dl in deleted_lines[:10]:
            print(f"  '{dl}'")

    text_final = text_after_aggressive.replace("\n", " ")
    text_final = re.sub(r"\s+", " ", text_final)
    return text_final.strip()

def is_valid_chunk(text: str) -> bool:
    if len(text) < 150:
        return False
    if text.count(".") < 2:
        return False
    return True

# Simulating some text from the PDF
sample_text = """
moving  charges  ?  What are  rest  charges  and  moving  charges  ?  Moving  charges  and  statically  charged  particles  are  not  the  same  thing.
Static electricity is the result of charges collecting on the surface of an object.
Current electricity is the flow of electrons through a conductor.
Fig. 1.1: A simple circuit.
This is another line with no special symbols.
"""

cleaned = clean_text(sample_text)
print(f"Cleaned text: '{cleaned}'")
print(f"Is valid: {is_valid_chunk(cleaned)}")
