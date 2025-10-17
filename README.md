# WebArchive Extractor

A Python script to extract and replicate websites from Safari `.webarchive` files.

## Features

- ✅ Extracts HTML, CSS, JavaScript, images, fonts, and other resources
- ✅ Automatically organizes files into appropriate folders
- ✅ Updates resource references in HTML to use local paths
- ✅ Handles various MIME types and file formats
- ✅ Creates a clean, browsable directory structure

## Prerequisites

- Python 3.6 or higher (comes pre-installed on macOS)
- A `.webarchive` file from Safari

## Quick Start

### 1. Get Your WebArchive File

If you don't have one yet, create a webarchive in Safari:
1. Open the webpage in Safari
2. Go to **File → Save As...**
3. Choose **Format: Web Archive**
4. Save the file

### 2. Place the WebArchive File

Move your `.webarchive` file into this directory:
```bash
# Example:
mv ~/Downloads/mysite.webarchive "/Users/fareedsolomons/Documents/UI DESIGN TEST/"
```

### 3. Run the Extraction Script

```bash
# Basic usage (creates 'extracted_site' folder)
python3 extract_webarchive.py mysite.webarchive

# Specify custom output directory
python3 extract_webarchive.py mysite.webarchive my_website
```

### 4. View the Result

Open the extracted HTML file:
```bash
open extracted_site/index.html
```

## Output Structure

The script creates the following directory structure:

```
extracted_site/
├── index.html              # Main HTML file
├── css/                    # Stylesheets
│   └── styles.css
├── js/                     # JavaScript files
│   └── script.js
├── images/                 # Images (PNG, JPG, SVG, etc.)
│   ├── logo.png
│   └── hero.jpg
├── fonts/                  # Web fonts
│   └── custom-font.woff2
├── assets/                 # Other resources
└── EXTRACTION_SUMMARY.txt  # Resource mapping details
```

## What the Script Does

1. **Reads the webarchive** - Parses the binary plist format
2. **Extracts main HTML** - Saves as `index.html`
3. **Extracts sub-resources** - Saves CSS, JS, images, fonts, etc.
4. **Organizes files** - Places resources in appropriate folders
5. **Updates references** - Rewrites URLs to point to local files
6. **Creates summary** - Documents what was extracted

## Troubleshooting

### "No module named 'plistlib'"
This module is built into Python 3, so make sure you're using `python3`:
```bash
python3 extract_webarchive.py mysite.webarchive
```

### Resources not loading
Check the browser console for 404 errors, and review `EXTRACTION_SUMMARY.txt` to see the resource mapping.

### Permission denied
Make the script executable:
```bash
chmod +x extract_webarchive.py
./extract_webarchive.py mysite.webarchive
```

## Next Steps After Extraction

Once extracted, you can:
- Edit the HTML, CSS, and JavaScript files
- Add new features or modify the design
- Deploy to a web server or hosting platform
- Use with build tools like Vite, webpack, etc.

## Example Workflow

```bash
# 1. Extract the webarchive
python3 extract_webarchive.py mysite.webarchive my_project

# 2. Navigate to the output
cd my_project

# 3. View in browser
open index.html

# 4. Start a local server (optional, for better testing)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

## Supported File Types

- **HTML** - Main page structure
- **CSS** - Stylesheets
- **JavaScript** - Scripts and JSON
- **Images** - PNG, JPG, GIF, SVG, WebP, ICO
- **Fonts** - WOFF, WOFF2, TTF, OTF
- **Other** - XML, plain text, and binary resources

## Tips

1. **Check the summary** - Review `EXTRACTION_SUMMARY.txt` to see all extracted resources
2. **Test locally** - Use a local server to test (browsers restrict file:// protocol)
3. **Inspect changes** - Compare original webarchive with extracted files
4. **Keep original** - Don't delete the original `.webarchive` file

## License

Free to use and modify for any purpose.

