import os
import fitz  # PyMuPDF

# ABSOLUTE DIRECTORY PATHS (WARLORD STANDARD)
PDF_PATH = r"C:\Warlord_Inc\Warlord_WASP\WASP Documents\Final WASP Docs\MCNC_Master_Architecture_Playbook.pdf"
MD_PATH = r"C:\Warlord_Inc\Warlord_WASP\WASP Documents\Final WASP Docs\MCNC_Master_Architecture_Playbook.md"

def extract_playbook():
    print(f"TARGET ACQUIRED: {PDF_PATH}")
    
    # ZERO-STATE CHECK: Verify target exists before execution
    if not os.path.exists(PDF_PATH):
        print("ERROR: PDF not found at the specified absolute path. Halt execution and verify directory.")
        return

    print("INITIATING EXTRACTION...")
    
    try:
        # Open PDF and initialize clean text string
        doc = fitz.open(PDF_PATH)
        full_text = "# MCNC MASTER ARCHITECTURE PLAYBOOK\n\n"
        
        # Loop through pages and extract raw text
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            full_text += page.get_text("text") + "\n\n"
            
        # Write extracted text to a new Markdown file
        with open(MD_PATH, "w", encoding="utf-8") as md_file:
            md_file.write(full_text)
            
        print(f"EXTRACTION COMPLETE. TEXT SAVED TO: {MD_PATH}")
        print(f"TOTAL PAGES PROCESSED: {len(doc)}")
        
    except Exception as e:
        print(f"CRITICAL FAILURE DURING EXTRACTION: {e}")

if __name__ == "__main__":
    extract_playbook()