import type { FoundSkill, SkillCategory, SkillDef } from "@/lib/types";

function skill(
  label: string,
  category: SkillCategory,
  aliases: string[],
  caseAliases?: string[],
): SkillDef {
  const id = label
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/#/g, "-sharp")
    .replace(/\+\+/g, "-plus")
    .replace(/\./g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    id,
    label,
    category,
    aliases: aliases.map((alias) => alias.toLowerCase()),
    caseAliases,
  };
}

export const SKILLS: SkillDef[] = [
  skill("AI", "ml", ["ai"]),
  skill("Machine learning", "ml", ["machine learning", "ml"]),
  skill("Deep learning", "ml", ["deep learning"]),
  skill("Neural networks", "ml", ["neural network", "neural networks"]),
  skill("PyTorch", "ml", ["pytorch"]),
  skill("TensorFlow", "ml", ["tensorflow"]),
  skill("Keras", "ml", ["keras"]),
  skill("JAX", "ml", ["jax"]),
  skill("scikit-learn", "ml", ["scikit-learn", "sklearn"]),
  skill("Hugging Face", "ml", ["hugging face", "huggingface"]),
  skill("Transformers", "ml", ["transformers"]),
  skill("LLM", "ml", ["llm", "llms", "large language model", "large language models"]),
  skill("RAG", "ml", ["rag", "retrieval-augmented generation", "retrieval augmented generation"]),
  skill("LangChain", "ml", ["langchain"]),
  skill("LlamaIndex", "ml", ["llamaindex", "llama index", "llama-index"]),
  skill("Prompt engineering", "ml", ["prompt engineering"]),
  skill("Fine-tuning", "ml", ["fine-tuning", "fine tuning", "lora", "qlora"]),
  skill("PEFT", "ml", ["peft"]),
  skill("RLHF", "ml", ["rlhf"]),
  skill("Embeddings", "ml", ["embeddings", "text embeddings"]),
  skill("Vector databases", "ml", ["vector database", "vector databases", "vector store", "vector stores"]),
  skill("Pinecone", "ml", ["pinecone"]),
  skill("FAISS", "ml", ["faiss"]),
  skill("Weaviate", "ml", ["weaviate"]),
  skill("Chroma", "ml", ["chromadb", "chroma db"]),
  skill("NLP", "ml", ["nlp", "natural language processing"]),
  skill("Generative AI", "ml", ["generative ai", "genai"]),
  skill("Diffusion models", "ml", ["diffusion model", "diffusion models"]),
  skill("CUDA", "ml", ["cuda"]),
  skill("XGBoost", "ml", ["xgboost"]),
  skill("MLflow", "ml", ["mlflow"]),
  skill("Weights & Biases", "ml", ["weights & biases", "wandb"]),
  skill("Model evaluation", "ml", ["model evaluation", "model benchmarking"]),
  skill("Federated learning", "ml", ["federated learning"]),
  skill("Differential privacy", "ml", ["differential privacy"]),
  skill("Flower", "ml", ["flower", "flwr"]),
  skill("Reinforcement learning", "ml", ["reinforcement learning"]),
  skill("pandas", "data", ["pandas"]),
  skill("NumPy", "data", ["numpy"]),
  skill("Computer vision", "vision", ["computer vision", "cv"]),
  skill("Object detection", "vision", ["object detection"]),
  skill("Small-object detection", "vision", ["small-object detection", "small object detection"]),
  skill("Semantic segmentation", "vision", ["semantic segmentation", "instance segmentation"]),
  skill("Image classification", "vision", ["image classification"]),
  skill("OCR", "vision", ["ocr", "optical character recognition"]),
  skill("Super-resolution", "vision", ["super-resolution", "super resolution"]),
  skill("OpenCV", "vision", ["opencv"]),
  skill("YOLO", "vision", ["yolo"]),
  skill("Hyperspectral imaging", "vision", ["hyperspectral"]),
  skill("Vision-language models", "vision", ["vision-language model", "vision-language models", "vlm", "vlms"]),
  skill("Experimental design", "research", ["experimental design", "research design"]),
  skill("Ablation studies", "research", ["ablation study", "ablation studies"]),
  skill("Docker", "deployment", ["docker", "dockerfile"]),
  skill("Kubernetes", "deployment", ["kubernetes", "k8s"]),
  skill("TensorRT", "deployment", ["tensorrt"]),
  skill("ONNX", "deployment", ["onnx"]),
  skill("Edge deployment", "deployment", ["edge deployment", "edge inference"]),
  skill("Jetson", "deployment", ["jetson", "jetson orin", "jetson orin nano"]),
  skill("CI/CD", "deployment", ["ci/cd", "cicd", "continuous integration", "continuous delivery"]),
  skill("GitHub Actions", "deployment", ["github actions"]),
  skill("Terraform", "deployment", ["terraform"]),
  skill("Linux", "deployment", ["linux"]),
  skill("MLOps", "deployment", ["mlops"]),
  skill("Flask", "deployment", ["flask"]),
  skill("gRPC", "deployment", ["grpc"]),
  skill("AWS", "deployment", ["aws", "amazon web services"]),
  skill("GCP", "deployment", ["gcp", "google cloud"]),
  skill("Azure", "deployment", ["azure", "microsoft azure"]),
  skill("Python", "ml", ["python"]),
  skill("FastAPI", "backend", ["fastapi"]),
  skill("Django", "backend", ["django"]),
  skill("Node.js", "backend", ["node.js", "nodejs"]),
  skill("TypeScript", "backend", ["typescript"]),
  skill("JavaScript", "backend", ["javascript"]),
  skill("Java", "backend", ["java"]),
  skill("Spring", "backend", ["spring boot", "spring framework"]),
  skill("Go", "backend", ["golang", "goroutines"]),
  skill("Rust", "backend", ["rust"]),
  skill("C#", "backend", ["c#", "c sharp", "csharp"]),
  skill("C++", "backend", ["c++", "cpp"]),
  skill(".NET", "backend", [".net", "dotnet", "asp.net", ".net core"]),
  skill("REST APIs", "backend", ["rest api", "rest apis", "restful", "restful api"], ["REST"]),
  skill("APIs", "backend", ["api", "apis"]),
  skill("GraphQL", "backend", ["graphql"]),
  skill("Redis", "backend", ["redis"]),
  skill("Kafka", "backend", ["kafka", "apache kafka"]),
  skill("Entity Framework", "backend", ["entity framework", "ef core"]),
  skill("Blazor", "backend", ["blazor"]),
  skill("Laravel", "backend", ["laravel"]),
  skill("Microservices", "backend", ["microservices", "micro services"]),
  skill("SQL", "sql", ["sql"]),
  skill("SQL Server", "sql", ["sql server", "mssql"]),
  skill("PostgreSQL", "sql", ["postgresql", "postgres"]),
  skill("MySQL", "sql", ["mysql"]),
  skill("SQLite", "sql", ["sqlite"]),
  skill("MongoDB", "sql", ["mongodb", "mongo"]),
  skill("Stored procedures", "sql", ["stored procedure", "stored procedures"]),
  skill("ETL", "data", ["etl"]),
  skill("Spark", "data", ["apache spark", "pyspark"]),
  skill("Airflow", "data", ["airflow", "apache airflow"]),
  skill("dbt", "data", ["dbt"]),
  skill("Data pipelines", "data", ["data pipeline", "data pipelines"]),
  skill("Healthcare document parsing", "healthcare", [
    "healthcare document parsing",
    "healthcare parsing",
    "medical document parsing",
  ]),
  skill("HIPAA", "healthcare", ["hipaa"]),
  skill("HL7", "healthcare", ["hl7"]),
  skill("FHIR", "healthcare", ["fhir"]),
  skill("Medical coding", "healthcare", ["medical coding", "icd-10", "icd 10"]),
  skill("SaaS", "general", ["saas", "software as a service"]),
  skill("Git", "general", ["git"]),
  skill("GitHub", "general", ["github"]),
  skill("pytest", "general", ["pytest"]),
  skill("NUnit", "general", ["nunit"]),
  skill("Selenium", "general", ["selenium"]),
  skill("System design", "general", ["system design"]),
  skill("Jupyter", "general", ["jupyter", "jupyterlab", "jupyter notebook"]),
];

const PHRASE_STOP = new Set([
  "and", "the", "for", "are", "you", "our", "not", "but", "all", "any", "can",
  "will", "must", "may", "job", "team", "work", "role", "year", "years", "with",
  "from", "this", "that", "have", "been", "were", "your", "into", "over", "such",
  "than", "then", "them", "they", "also", "plus", "able", "each", "both", "more",
  "most", "other", "about", "these", "those", "what", "when", "where", "which",
  "while", "their", "there", "should", "could", "would", "using", "used", "use",
  "new", "one", "two", "inc", "llc", "ltd", "usa", "phd", "msc", "gpa", "eeo",
  "doe", "tbd", "via", "per", "etc", "required", "preferred", "including",
  "skills", "strong", "solid", "deep", "well", "good", "high", "low", "full",
  "time", "part", "remote", "hybrid", "onsite", "bonus", "equal", "opportunity",
  "employer", "status", "experience", "ability", "knowledge", "working", "build",
  "built", "help", "make", "take", "give", "look", "need", "want", "join",
  "apply", "click", "here", "best", "fast", "open", "close", "across", "within",
  "under", "after", "before", "during", "above", "below", "first", "based",
  "level", "senior", "junior", "staff", "lead", "head", "hands", "stack", "tools",
  "tool", "data", "software", "engineer", "engineering", "science", "research",
  "learning", "model", "models", "system", "systems", "design", "product",
  "business", "customer", "client", "support", "degree", "master", "bachelor",
  "computer", "fps", "mba", "usd", "est", "pst", "cst", "gmt", "gpu", "cpu",
  "ram", "api", "apis", "sql", "aws", "gcp", "nlp", "llm", "rag", "ocr", "etl",
  "git", "pdf", "tex", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug",
  "sep", "sept", "oct", "nov", "dec", "linkedin", "youtube", "mckinsey",
  "powerpoint", "latex", "monday", "tuesday", "wednesday", "thursday", "friday",
  "saturday", "sunday", "us", "uk", "eu", "pa", "tx", "sd", "ny", "ca", "wa",
  "dc", "nj", "ma", "ii", "iii", "iv", "vi", "vii", "llc", "inc",
]);

function escapeReg(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fold(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ");
}

export function containsPhrase(haystack: string, phrase: string): boolean {
  const h = fold(haystack);
  const p = fold(phrase);
  if (p.length < 2) return false;
  const re = new RegExp(`(^|[^a-z0-9])${escapeReg(p)}([^a-z0-9]|$)`, "i");
  return re.test(h);
}

function containsCase(haystack: string, phrase: string): boolean {
  const re = new RegExp(`(^|[^A-Za-z0-9])${escapeReg(phrase)}([^A-Za-z0-9]|$)`);
  return re.test(haystack);
}

export function skillAppearsIn(skill: FoundSkill, text: string): boolean {
  const catalog = SKILLS.find((item) => item.id === skill.id);
  if (catalog) {
    if (catalog.aliases.some((alias) => containsPhrase(text, alias))) return true;
    if (catalog.caseAliases?.some((alias) => containsCase(text, alias))) return true;
    return false;
  }
  return containsPhrase(text, skill.label);
}

function inferCategory(label: string, posting: string): SkillCategory {
  const token = label.toLowerCase();
  const idx = posting.toLowerCase().indexOf(token);
  const window =
    idx >= 0
      ? posting.toLowerCase().slice(Math.max(0, idx - 90), idx + token.length + 90)
      : posting.toLowerCase();
  const blob = `${token} ${window}`;
  if (/hipaa|fhir|hl7|clinical|healthcare|medical|patient/.test(blob)) return "healthcare";
  if (/kubernetes|k8s|docker|deploy|terraform|ci\/cd|devops|mlops|infra/.test(blob)) return "deployment";
  if (/sql|postgres|mysql|database|query/.test(blob)) return "sql";
  if (/vision|detect|segment|opencv|image|yolo/.test(blob)) return "vision";
  if (/pytorch|tensorflow|model|llm|transformer|embedding|neural|train/.test(blob)) return "ml";
  if (/api|backend|server|microservice|endpoint|fastapi|django/.test(blob)) return "backend";
  if (/research|experiment|paper|benchmark/.test(blob)) return "research";
  if (/pipeline|etl|spark|warehouse/.test(blob)) return "data";
  return "general";
}

function looksLikeUrl(label: string): boolean {
  const value = label.trim();
  if (/^https?:\/\//i.test(value) || /^www\./i.test(value)) return true;
  if (/\//.test(value)) return true;
  const parts = value.split(".");
  return (
    parts.length >= 2 &&
    /^(com|org|io|ai|net|dev|app|co|edu|gov|info|me|us)$/i.test(parts[parts.length - 1] ?? "")
  );
}

function isBareName(label: string): boolean {
  if (/^[A-Z]{2,6}$/.test(label)) return true;
  if (/^[A-Z][a-z]+(?:[A-Z][A-Za-z0-9]+)+$/.test(label)) return true;
  if (/^[a-z]+[A-Z][A-Za-z0-9]+$/.test(label)) return true;
  return false;
}

/** True only when this token is the object of a skill phrase, not a neighbor in a list. */
function hasSkillContext(before: string): boolean {
  const lineBefore = before.split("\n").pop() ?? before;
  return /(experience with|experience in|proficient in|proficient with|familiar with|knowledge of|hands-on with|working with|using|skills in|tools such as|such as)\s*$/i.test(
    lineBefore,
  );
}

function isEmployerOrBareName(label: string, posting: string): boolean {
  if (!isBareName(label)) return false;
  const re = new RegExp(`(^|[^A-Za-z0-9])(${escapeReg(label)})(?=[^A-Za-z0-9]|$)`, "gi");
  for (const match of posting.matchAll(re)) {
    const index = (match.index ?? 0) + match[1].length;
    const before = posting.slice(Math.max(0, index - 80), index);
    if (hasSkillContext(before)) return false;
  }
  return true;
}

/** URLs, domains, and employer names that are not tools. Catalog skills never reach here. */
function isNoisePhrase(label: string, posting: string): boolean {
  if (looksLikeUrl(label)) return true;
  return isEmployerOrBareName(label, posting);
}

function extractTechnicalPhrases(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const known = new Set<string>();
  for (const item of SKILLS) {
    known.add(item.label.toLowerCase());
    for (const alias of item.aliases) known.add(alias);
    for (const alias of item.caseAliases ?? []) known.add(alias.toLowerCase());
  }

  function add(raw: string) {
    const label = raw.trim().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9+#]+$/g, "");
    const key = label.toLowerCase();
    if (label.length < 2 || label.length > 40) return;
    if (seen.has(key) || PHRASE_STOP.has(key) || known.has(key)) return;
    if (isNoisePhrase(label, text)) return;
    if (/^(com|org|edu|gov|io|net)$/i.test(label.split(".").pop() ?? "") && label[0] === label[0]?.toLowerCase()) {
      return;
    }
    seen.add(key);
    found.push(label);
  }

  const patterns = [
    /\b[A-Z][a-z]+(?:[A-Z][A-Za-z0-9]*)+\b/g,
    /\b[A-Z]{2,}[a-z][A-Za-z0-9]*\b/g,
    /\b[a-z]+[A-Z][A-Za-z0-9]+\b/g,
    /\b[A-Za-z][A-Za-z0-9]*\.[A-Za-z]{2,}\b/g,
    /\b[A-Z]{2,}[a-z]?-?\d+(?:\.\d+)?\b/g,
    /\b[A-Z]{3,6}\b/g,
    /\b[A-Z]\+\+|\b[A-Z]#/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) add(match[0]);
  }
  return found.slice(0, 12);
}

export function findPostingSkills(text: string): FoundSkill[] {
  const found: FoundSkill[] = [];
  for (const item of SKILLS) {
    const aliasHit = item.aliases.some((alias) => containsPhrase(text, alias));
    const caseHit = item.caseAliases?.some((alias) => containsCase(text, alias)) ?? false;
    if (!aliasHit && !caseHit) continue;
    found.push({
      id: item.id,
      label: item.label,
      category: item.category,
      source: "catalog",
    });
  }
  for (const phrase of extractTechnicalPhrases(text)) {
    const id = `phrase-${phrase.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    if (found.some((item) => item.id === id || item.label.toLowerCase() === phrase.toLowerCase())) continue;
    found.push({
      id,
      label: phrase,
      category: inferCategory(phrase, text),
      source: "posting",
    });
  }
  return found;
}
