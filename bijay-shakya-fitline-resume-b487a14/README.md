# Fitline

Fitline scores how well a LaTeX or PDF resume matches a job posting and lists the skills that are missing. Matching uses a built-in list of AI, research, and software skills plus technical phrases from the posting. It does not call an external language model and it does not need an API key. It does not rewrite the resume.

The score is out of 100. It is the average of four equal parts, rounded to a whole number: keywords, domain, technologies, and experience required. A pasted description and a listed job use that same score. If the posting names no years and no seniority, the experience part is 50.

## Run locally

```bash
npm install
npm run dev -- --hostname 0.0.0.0 --port 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## What you do in the app

1. Paste a job description, or paste a link and fetch it. If the site blocks the fetch, paste the posting into the text box.
2. Upload a `.tex` or `.pdf` resume.
3. Read the match score, then the missing skills in red. Suggested bullets sit under that, one per missing skill, grouped on the closest role already on the resume. Each bullet is about two sentences: a concrete verb, the missing skill once, and the kind of work that role already describes. A result appears only when that role already states one. Company names and links in the posting are not treated as skills. The file is not rewritten, and nothing is downloaded.
4. Type job-position keywords, select LinkedIn, Remotive, Remote OK, Y Combinator, or HigherEdJobs, and search. Each listing uses the same 0–100 score as a pasted job description: keywords, domain, technologies, and experience. Jobs under 10, jobs with no score, and jobs that require US citizenship, a green card, or a security clearance stay hidden. Copy link copies that posting’s URL. Copy description copies the requirements text already used for the score, and it stays disabled when a listing has no description. A portal that returns nothing is named. The keyword box is not filled from the resume.
