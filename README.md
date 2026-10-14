# Auburn Grove Community Website — Preview

This is a static public website built for GitHub Pages. It uses the original entrance-sign photo in `assets/entrance-sign.jpg` without altering the image.

## Publish on GitHub Pages
1. Create a new GitHub repository, such as `auburn-grove`.
2. Upload the contents of this folder to the root of the repository (not the ZIP file itself).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. GitHub will display the public website URL after deployment.

## Security / next phase
GitHub Pages is public static hosting. It cannot enforce secure logins or protect files placed in the repository. Do **not** commit private resident documents, contact lists, credentials, or access tokens to this repository.

The resident login in this preview is intentionally disabled. For a real private portal, integrate a managed authentication and authorization service (e.g. Supabase Auth) and **private** object storage with server-enforced row-level/storage policies. Require administrator approval for homeowner accounts and multifactor authentication for administrators. Test unauthorized access before publishing private data.

## Editing
- `index.html` contains the text and sections.
- `styles.css` controls colors, layout, and responsive appearance.
- `script.js` handles mobile navigation.
- `assets/entrance-sign.jpg` is the original uploaded entrance sign.

All HOA rules and official documents are placeholders until verified materials are supplied.
