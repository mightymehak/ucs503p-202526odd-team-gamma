

--------------------------------------------------------
CAMPUS-WIDE LOST AND FOUND PLATFORM : QUICK START
--------------------------------------------------------

1. Open the deployment link in your browser:
   - [https://expert-telegram-4jggv9qx6g6wh7v5-8000.app.github.dev/]

2. Once the homepage loads, go to the built-in API documentation:
   - Append `/docs` at the end of your link.
   - Example: https://expert-telegram-4jggv9qx6g6wh7v5-8000.app.github.dev/docs

   This will open the FastAPI Swagger UI where you can interactively test all project endpoints.

--------------------------------------------------------
TESTING THE ENDPOINTS USING SWAGGER UI
--------------------------------------------------------

---------------------------------------
A. USER COMPLAINT (LOST ITEM)
---------------------------------------
Endpoint: `/user/complaint`
Purpose: A user uploads a photo of their lost item, along with location and date.

Steps:
  1. In Swagger UI, scroll down and find `POST /user/complaint`.
  2. Click "Try it out".
  3. For "file", click "Choose File" and select an image file of your lost item (e.g. a JPEG or PNG).
  4. For "location", enter the location where it was lost (e.g. `LT102`).
  5. For "date", enter the loss date in YYYY-MM-DD format (e.g. `2025-10-12`).
  6. Click "Execute".

Expected outputs:
- If a similar image ("found_report") is already uploaded:  
  • Status: `high_confidence` or `medium_confidence`  
  • Message: "Match found! Please report to Lost & Found department." or "Potential match found! Please check with Lost & Found department."
- If no match is found:  
  • Status: `no_match`  
  • Message: "No match found; your complaint has been filed."  
  • The new lost item is saved in the database for future searches.

---------------------------------------
B. ADMIN FOUND (FOUND ITEM)
---------------------------------------
Endpoint: `/admin/found`
Purpose: An admin uploads details about a found item to potentially help match against lost item reports.

Steps:
  1. In Swagger UI, find `POST /admin/found`.
  2. Click "Try it out".
  3. For "file", click "Choose File" and select an image file of the found item.
  4. For "location", enter the location where it was found.
  5. For "date", enter the date it was found in YYYY-MM-DD format.
  6. Click "Execute".

Expected outputs:
- If there are similar images ("lost_report") already in the database:  
  • Status: `high_confidence` or `medium_confidence`  
  • Matches: A list of lost item reports with confidence scores.
- If no match is found:  
  • Status: `no_match`  
  • Message: "No match found; found item has been added to the database."

---------------------------------------
C. VIEW AND VERIFY RESPONSES
---------------------------------------
- After each request, Swagger shows the full JSON response.
- Look for relevant info: `status`, `message`, `matches` (details and scores), and filenames/paths.
- Each uploaded image is stored server-side for future matching.

--------------------------------------------------------
BEST PRACTICES & TROUBLESHOOTING
--------------------------------------------------------
- Always use "Choose File" for the file field when testing file upload endpoints.
- If you see `422 Unprocessable Entity`, double-check that you have selected a file and filled all required fields.
- Images should be <15 MB ideally, but the server may support more if not constrained by hosting platform.
- The results depend on what is already in the database—the more items reported, the better and more meaningful the matching.
- You may reset the database by deleting all stored items and images if needed (consult project setup for instructions).

--------------------------------------------------------
NOTES
--------------------------------------------------------
- This API does NOT yet support direct frontend integration—please use only Swagger UI or similar API tools for demonstration.
- Only image uploads, location, and date are required for current endpoints.
- Admin and user endpoints support full automated testing.
