# Samajh Suraksha Saathi

Build a web app called "Samajh" using Supabase as the backend.

User can upload a photo/PDF of a document (rent agreement, loan letter, bank notice, insurance policy, hospital bill) or paste its text.

Backend: create a Supabase Edge Function called "analyze-document" that receives the document (image or text), calls an AI model, and returns JSON with: a 5-line summary in simple Hindi, a list of risky clauses (each with clause text and a simple Hindi explanation of why it's risky), 3 questions to ask before signing, and a verdict: "green", "yellow" or "red". The AI API key must stay in the edge function secrets, never in frontend code.

Database: create a Supabase table "analyses" (id, created_at, document_type, verdict, summary, risky_clauses as jsonb, questions as jsonb). Save every result there. Enable RLS with a policy allowing public insert and select (no login).

Frontend: clean mobile-friendly cards. Big colored verdict card on top (green/yellow/red), then summary, risky clauses highlighted in red, then the questions. Show a "Recent analyses" section from the database. Loading spinner while processing. Footer disclaimer: "This is not legal advice."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://samajh-suraksha-saathi.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b258b419-2fee-4915-bb9c-8dd1f08eb4d8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
