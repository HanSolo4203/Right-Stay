#!/usr/bin/env python3
"""
WebArchive Extractor
Extracts HTML, CSS, JS, images, and other resources from Safari .webarchive files
"""

import plistlib
import base64
import os
import sys
import re
from pathlib import Path
from urllib.parse import urlparse, unquote

def get_mime_extension(mime_type):
    """Map MIME types to file extensions"""
    mime_map = {
        'text/html': '.html',
        'text/css': '.css',
        'text/javascript': '.js',
        'application/javascript': '.js',
        'application/x-javascript': '.js',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/svg+xml': '.svg',
        'image/webp': '.webp',
        'image/x-icon': '.ico',
        'font/woff': '.woff',
        'font/woff2': '.woff2',
        'font/ttf': '.ttf',
        'font/otf': '.otf',
        'application/font-woff': '.woff',
        'application/font-woff2': '.woff2',
        'application/json': '.json',
        'application/xml': '.xml',
        'text/plain': '.txt',
    }
    return mime_map.get(mime_type, '.bin')

def sanitize_filename(url, extension=''):
    """Create a safe filename from a URL"""
    # Parse URL
    parsed = urlparse(url)
    path = unquote(parsed.path)
    
    # Get filename from path
    if path and path != '/':
        filename = os.path.basename(path)
        if not filename:
            filename = 'index'
    else:
        filename = 'index'
    
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # If no extension in filename, add it
    if extension and not os.path.splitext(filename)[1]:
        filename += extension
    
    return filename

def categorize_resource(mime_type, url):
    """Determine which folder a resource should go in"""
    if mime_type.startswith('image/'):
        return 'images'
    elif mime_type in ['text/css']:
        return 'css'
    elif 'javascript' in mime_type or 'json' in mime_type:
        return 'js'
    elif mime_type.startswith('font/') or 'font' in mime_type:
        return 'fonts'
    else:
        return 'assets'

def extract_webarchive(webarchive_path, output_dir='extracted_site'):
    """Extract all resources from a webarchive file"""
    
    # Read the webarchive file
    print(f"Reading webarchive: {webarchive_path}")
    try:
        with open(webarchive_path, 'rb') as f:
            plist = plistlib.load(f)
    except Exception as e:
        print(f"Error reading webarchive: {e}")
        return False
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Create subdirectories
    (output_path / 'css').mkdir(exist_ok=True)
    (output_path / 'js').mkdir(exist_ok=True)
    (output_path / 'images').mkdir(exist_ok=True)
    (output_path / 'fonts').mkdir(exist_ok=True)
    (output_path / 'assets').mkdir(exist_ok=True)
    
    print(f"Extracting to: {output_path.absolute()}")
    
    # Track extracted resources for URL mapping
    resource_map = {}  # original URL -> extracted file path
    
    # Extract main resource (HTML)
    main_resource = plist.get('WebMainResource')
    if main_resource:
        print("\nExtracting main HTML resource...")
        mime_type = main_resource.get('WebResourceMIMEType', 'text/html')
        url = main_resource.get('WebResourceURL', 'index.html')
        data = main_resource.get('WebResourceData')
        
        if data:
            # Decode if it's bytes
            if isinstance(data, bytes):
                try:
                    html_content = data.decode('utf-8')
                except:
                    html_content = data.decode('latin-1')
            else:
                html_content = str(data)
            
            main_html_path = output_path / 'index.html'
            resource_map[url] = 'index.html'
            print(f"  ✓ Main HTML: {url}")
    
    # Extract sub-resources
    sub_resources = plist.get('WebSubresources', [])
    if sub_resources:
        print(f"\nExtracting {len(sub_resources)} sub-resources...")
        
        for idx, resource in enumerate(sub_resources):
            mime_type = resource.get('WebResourceMIMEType', 'application/octet-stream')
            url = resource.get('WebResourceURL', f'resource_{idx}')
            data = resource.get('WebResourceData')
            
            if not data:
                continue
            
            # Determine file extension and category
            extension = get_mime_extension(mime_type)
            category = categorize_resource(mime_type, url)
            
            # Create filename
            filename = sanitize_filename(url, extension)
            
            # Handle duplicate filenames
            base_filename = filename
            counter = 1
            while (output_path / category / filename).exists():
                name, ext = os.path.splitext(base_filename)
                filename = f"{name}_{counter}{ext}"
                counter += 1
            
            # Save file
            file_path = output_path / category / filename
            relative_path = f"{category}/{filename}"
            
            try:
                if isinstance(data, bytes):
                    with open(file_path, 'wb') as f:
                        f.write(data)
                else:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(str(data))
                
                resource_map[url] = relative_path
                print(f"  ✓ {mime_type:30s} → {relative_path}")
            except Exception as e:
                print(f"  ✗ Error saving {filename}: {e}")
    
    # Update HTML with correct resource paths
    print("\nUpdating resource references in HTML...")
    for original_url, new_path in resource_map.items():
        if original_url != resource_map.get(main_resource.get('WebResourceURL')):
            # Replace absolute URLs with relative paths
            html_content = html_content.replace(original_url, new_path)
            # Also try URL-encoded version
            html_content = html_content.replace(original_url.replace(' ', '%20'), new_path)
    
    # Save the updated HTML
    with open(main_html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n✅ Extraction complete!")
    print(f"📁 Output directory: {output_path.absolute()}")
    print(f"🌐 Open {main_html_path.absolute()} in your browser")
    
    # Create a summary file
    summary_path = output_path / 'EXTRACTION_SUMMARY.txt'
    with open(summary_path, 'w') as f:
        f.write(f"WebArchive Extraction Summary\n")
        f.write(f"=" * 50 + "\n\n")
        f.write(f"Source: {webarchive_path}\n")
        f.write(f"Output: {output_path.absolute()}\n\n")
        f.write(f"Resources extracted:\n")
        f.write(f"  - Main HTML: index.html\n")
        f.write(f"  - Sub-resources: {len(sub_resources)}\n\n")
        f.write(f"Resource mapping:\n")
        for orig, new in sorted(resource_map.items()):
            f.write(f"  {orig}\n    → {new}\n")
    
    return True

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python extract_webarchive.py <webarchive_file> [output_directory]")
        print("\nExample:")
        print("  python extract_webarchive.py mysite.webarchive")
        print("  python extract_webarchive.py mysite.webarchive my_extracted_site")
        sys.exit(1)
    
    webarchive_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'extracted_site'
    
    if not os.path.exists(webarchive_path):
        print(f"Error: File not found: {webarchive_path}")
        sys.exit(1)
    
    success = extract_webarchive(webarchive_path, output_dir)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()

