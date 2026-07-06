# Workspace Rules

- **Git Workflow (Testing via Vercel):** Whenever you make fixes or the user asks you to push code, you MUST push the changes to the user's personal remote (`personal`) on the `main` branch so they can immediately preview it on Vercel. For example, use `git push personal HEAD:main` or `git push --force personal HEAD:main`. **DO NOT** push directly to the team's remote (`origin`) unless the user explicitly instructs you to do so for a Pull Request.
