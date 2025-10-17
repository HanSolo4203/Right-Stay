#!/bin/bash
# Quick extraction helper script

echo "🔍 WebArchive Extractor"
echo "======================="
echo ""

# Check if webarchive file is provided
if [ -z "$1" ]; then
    echo "❌ No webarchive file specified"
    echo ""
    echo "Usage: ./extract.sh <webarchive_file> [output_directory]"
    echo ""
    echo "Example:"
    echo "  ./extract.sh mysite.webarchive"
    echo "  ./extract.sh mysite.webarchive my_website"
    echo ""
    
    # List available webarchive files
    webarchives=(*.webarchive)
    if [ -e "${webarchives[0]}" ]; then
        echo "📦 Found webarchive files in this directory:"
        for file in *.webarchive; do
            echo "  - $file"
        done
        echo ""
        echo "Try: ./extract.sh ${webarchives[0]}"
    fi
    exit 1
fi

WEBARCHIVE="$1"
OUTPUT_DIR="${2:-extracted_site}"

# Check if file exists
if [ ! -f "$WEBARCHIVE" ]; then
    echo "❌ File not found: $WEBARCHIVE"
    exit 1
fi

echo "📄 Input:  $WEBARCHIVE"
echo "📁 Output: $OUTPUT_DIR"
echo ""

# Run the extraction script
python3 extract_webarchive.py "$WEBARCHIVE" "$OUTPUT_DIR"

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! Your website has been extracted."
    echo ""
    echo "Next steps:"
    echo "  1. Open the site:  open $OUTPUT_DIR/index.html"
    echo "  2. Start server:   cd $OUTPUT_DIR && python3 -m http.server 8000"
    echo "  3. View summary:   cat $OUTPUT_DIR/EXTRACTION_SUMMARY.txt"
fi

