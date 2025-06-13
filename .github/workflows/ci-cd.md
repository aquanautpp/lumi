# CI/CD Setup

This project uses GitHub Actions for testing and optional deployment to Render.

## Adding Render Secrets
1. Go to your GitHub repository's **Settings** > **Secrets and variables** > **Actions**.
2. Add a new secret named `RENDER_API_KEY` with your Render API key.
3. Add another secret named `RENDER_SERVICE_ID` containing your service ID.

These secrets allow the deploy workflow to trigger a redeploy via Render's Deploy Hook API.

## Disable GitHub Deploy Workflow
If you rely solely on Render's native Git auto-deploy feature, simply remove the `deploy.yml` workflow file or disable the workflow in GitHub.
