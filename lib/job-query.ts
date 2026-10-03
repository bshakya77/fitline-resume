import { SKILLS, skillAppearsIn } from "@/lib/skills";
import type { FoundSkill, ParsedResume, SkillCategory } from "@/lib/types";

const ROLE_PHRASES = ["AI researcher", "AI engineer", "computer vision"];

const SKIP = new Set(["ai", "computer vision", "git", "github", "jupyter"]);

const WEIGHT: Record<SkillCategory, number> = {
  vision: 5,
  ml: 4,
  research: 3,
  deployment: 3,
  data: 2,
  backend: 1,
  sql: 1,
  healthcare: 1,
  general: 0,
};

function asFound(skill: (typeof SKILLS)[number]): FoundSkill {
  return { id: skill.id, label: skill.label, category: skill.category, source: "catalog" };
}

const QUERY_LIMIT = 600;

export function experienceSearchQuery(resume: ParsedResume): string {
  const experienceIds = new Set(
    resume.sections.filter((section) => section.kind === "experience").flatMap((section) => section.roleIds),
  );
  const titles: string[] = [];
  const bullets: string[] = [];
  for (const role of resume.roles) {
    if (!experienceIds.has(role.id)) continue;
    const title = role.title.replace(/\s+/g, " ").trim();
    if (title) titles.push(title);
    for (const bullet of role.bullets) {
      const line = bullet.replace(/\s+/g, " ").trim();
      if (line) bullets.push(line);
    }
  }
  return [...titles, ...bullets].join(" ").replace(/\s+/g, " ").trim().slice(0, QUERY_LIMIT);
}

export function defaultJobQuery(resume: ParsedResume): string {
  const focus = [
    ...resume.sections.filter((section) => section.kind === "experience").map((section) => section.text),
    ...resume.roles.map((role) => `${role.title} ${role.bullets.join(" ")}`),
  ].join("\n");
  const ranked = SKILLS.filter((skill) => skillAppearsIn(asFound(skill), resume.plainText))
    .filter((skill) => !SKIP.has(skill.label.toLowerCase()))
    .map((skill) => ({
      label: skill.label,
      score: WEIGHT[skill.category] + (skillAppearsIn(asFound(skill), focus) ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  const skills: string[] = [];
  for (const item of ranked) {
    if (skills.length === 4) break;
    skills.push(item.label);
  }
  return [...ROLE_PHRASES, ...skills].join(", ");
}

export function portalSearchLinks(query: string): { name: string; href: string }[] {
  const q = encodeURIComponent(query.trim());
  const loc = encodeURIComponent("United States");
  return [
    { name: "LinkedIn", href: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}` },
    { name: "Monster.com", href: `https://www.monster.com/jobs/search?q=${q}&where=${loc}` },
    { name: "Y Combinator", href: `https://www.workatastartup.com/jobs?query=${q}` },
    { name: "HigherEdJobs", href: `https://www.higheredjobs.com/search/advanced_action.cfm?Keyword=${q}` },
    { name: "SDBOR", href: `https://yourfuture.sdbor.edu/postings/search?query=${q}` },
  ];
}
