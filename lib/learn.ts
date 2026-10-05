import type { FoundSkill } from "@/lib/types";

type Resource = {
  title: string;
  href: string;
  publisher: string;
};

export type LearningStep = Resource & {
  id: string;
  label: string;
};

const RESOURCES: Record<string, Resource> = {
  python: { title: "The Python Tutorial", href: "https://docs.python.org/3/tutorial/", publisher: "Python Software Foundation" },
  javascript: { title: "JavaScript — Learn web development", href: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript", publisher: "MDN" },
  typescript: { title: "TypeScript Handbook", href: "https://www.typescriptlang.org/docs/handbook/intro.html", publisher: "TypeScript" },
  java: { title: "Learn Java", href: "https://dev.java/learn/", publisher: "Oracle" },
  "c-sharp": { title: "Tour of C#", href: "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/", publisher: "Microsoft Learn" },
  "c-plus": { title: "Learn C++", href: "https://www.learncpp.com/", publisher: "LearnCpp" },
  go: { title: "A Tour of Go", href: "https://go.dev/tour/", publisher: "Go" },
  rust: { title: "The Rust Programming Language", href: "https://doc.rust-lang.org/book/", publisher: "Rust" },
  sql: { title: "SQLBolt", href: "https://sqlbolt.com/", publisher: "SQLBolt" },
  linux: { title: "The Linux command line for beginners", href: "https://ubuntu.com/tutorials/command-line-for-beginners", publisher: "Ubuntu" },
  git: { title: "Git Tutorial", href: "https://git-scm.com/docs/gittutorial", publisher: "Git" },
  github: { title: "Hello World", href: "https://docs.github.com/en/get-started/start-your-journey/hello-world", publisher: "GitHub Docs" },
  numpy: { title: "NumPy for absolute beginners", href: "https://numpy.org/doc/stable/user/absolute_beginners.html", publisher: "NumPy" },
  pandas: { title: "10 minutes to pandas", href: "https://pandas.pydata.org/docs/user_guide/10min.html", publisher: "pandas" },
  jupyter: { title: "JupyterLab documentation", href: "https://jupyterlab.readthedocs.io/en/stable/getting_started/overview.html", publisher: "Jupyter" },
  "sql-server": { title: "Write Transact-SQL statements", href: "https://learn.microsoft.com/en-us/sql/t-sql/tutorial-writing-transact-sql-statements?view=sql-server-ver16", publisher: "Microsoft Learn" },
  postgresql: { title: "PostgreSQL Tutorial", href: "https://www.postgresql.org/docs/current/tutorial.html", publisher: "PostgreSQL" },
  mysql: { title: "MySQL Getting Started", href: "https://dev.mysql.com/doc/mysql-getting-started/en/", publisher: "MySQL" },
  sqlite: { title: "SQLite Quickstart", href: "https://www.sqlite.org/quickstart.html", publisher: "SQLite" },
  mongodb: { title: "Getting Started with MongoDB", href: "https://www.mongodb.com/docs/manual/tutorial/getting-started/", publisher: "MongoDB" },
  "stored-procedures": { title: "Create a stored procedure", href: "https://learn.microsoft.com/en-us/sql/relational-databases/stored-procedures/create-a-stored-procedure?view=sql-server-ver16", publisher: "Microsoft Learn" },
  ai: { title: "Elements of AI", href: "https://www.elementsofai.com/", publisher: "University of Helsinki" },
  "machine-learning": { title: "Machine Learning Crash Course", href: "https://developers.google.com/machine-learning/crash-course", publisher: "Google" },
  "deep-learning": { title: "Practical Deep Learning for Coders", href: "https://course.fast.ai/", publisher: "fast.ai" },
  "neural-networks": { title: "Neural networks", href: "https://www.3blue1brown.com/topics/neural-networks", publisher: "3Blue1Brown" },
  "model-evaluation": { title: "Metrics and scoring", href: "https://scikit-learn.org/stable/modules/model_evaluation.html", publisher: "scikit-learn" },
  "experimental-design": { title: "Process Improvement (experimental design)", href: "https://www.itl.nist.gov/div898/handbook/pri/pri.htm", publisher: "NIST" },
  "scikit-learn": { title: "Getting started", href: "https://scikit-learn.org/stable/getting_started.html", publisher: "scikit-learn" },
  xgboost: { title: "Get started with XGBoost", href: "https://xgboost.readthedocs.io/en/stable/get_started.html", publisher: "XGBoost" },
  pytorch: { title: "Learn the Basics", href: "https://pytorch.org/tutorials/beginner/basics/intro.html", publisher: "PyTorch" },
  tensorflow: { title: "TensorFlow tutorials", href: "https://www.tensorflow.org/tutorials", publisher: "TensorFlow" },
  keras: { title: "Getting started with Keras", href: "https://keras.io/getting_started/", publisher: "Keras" },
  jax: { title: "JAX Quickstart", href: "https://docs.jax.dev/en/latest/quickstart.html", publisher: "JAX" },
  cuda: { title: "An Even Easier Introduction to CUDA", href: "https://developer.nvidia.com/blog/even-easier-introduction-cuda/", publisher: "NVIDIA" },
  "computer-vision": { title: "CS231n: Deep Learning for Computer Vision", href: "http://cs231n.stanford.edu/", publisher: "Stanford" },
  opencv: { title: "OpenCV tutorials", href: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html", publisher: "OpenCV" },
  "image-classification": { title: "Training a classifier", href: "https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html", publisher: "PyTorch" },
  "object-detection": { title: "Object detection", href: "https://docs.ultralytics.com/tasks/detect/", publisher: "Ultralytics" },
  "small-object-detection": { title: "Towards Large-Scale Small Object Detection", href: "https://arxiv.org/abs/2207.14096", publisher: "arXiv" },
  "semantic-segmentation": { title: "Instance segmentation", href: "https://docs.ultralytics.com/tasks/segment/", publisher: "Ultralytics" },
  yolo: { title: "Ultralytics YOLO quickstart", href: "https://docs.ultralytics.com/quickstart/", publisher: "Ultralytics" },
  ocr: { title: "Tesseract documentation", href: "https://tesseract-ocr.github.io/", publisher: "Tesseract" },
  "super-resolution": { title: "Real-ESRGAN", href: "https://github.com/xinntao/Real-ESRGAN", publisher: "Real-ESRGAN" },
  "hyperspectral-imaging": { title: "Hyperspectral and Multispectral Imaging", href: "https://www.edmundoptics.com/knowledge-center/application-notes/imaging/hyperspectral-and-multispectral-imaging/", publisher: "Edmund Optics" },
  "vision-language-models": { title: "CLIP", href: "https://huggingface.co/docs/transformers/model_doc/clip", publisher: "Hugging Face" },
  nlp: { title: "NLP Course", href: "https://huggingface.co/learn/nlp-course/chapter1/1", publisher: "Hugging Face" },
  embeddings: { title: "Embeddings guide", href: "https://platform.openai.com/docs/guides/embeddings", publisher: "OpenAI" },
  llm: { title: "LLM Course", href: "https://huggingface.co/learn/llm-course/chapter1/1", publisher: "Hugging Face" },
  transformers: { title: "Transformers quick tour", href: "https://huggingface.co/docs/transformers/quicktour", publisher: "Hugging Face" },
  "hugging-face": { title: "Hugging Face Learn", href: "https://huggingface.co/learn", publisher: "Hugging Face" },
  "prompt-engineering": { title: "Prompt engineering overview", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", publisher: "Anthropic" },
  "generative-ai": { title: "Generative AI for Everyone", href: "https://www.deeplearning.ai/courses/generative-ai-for-everyone/", publisher: "DeepLearning.AI" },
  rag: { title: "Build a RAG agent", href: "https://python.langchain.com/docs/tutorials/rag/", publisher: "LangChain" },
  langchain: { title: "LangChain tutorials", href: "https://python.langchain.com/docs/tutorials/", publisher: "LangChain" },
  llamaindex: { title: "Starter tutorial", href: "https://docs.llamaindex.ai/en/stable/getting_started/starter_example/", publisher: "LlamaIndex" },
  "fine-tuning": { title: "Fine-tune a pretrained model", href: "https://huggingface.co/docs/transformers/training", publisher: "Hugging Face" },
  peft: { title: "PEFT documentation", href: "https://huggingface.co/docs/peft/index", publisher: "Hugging Face" },
  rlhf: { title: "Illustrating Reinforcement Learning from Human Feedback", href: "https://huggingface.co/blog/rlhf", publisher: "Hugging Face" },
  "diffusion-models": { title: "The Annotated Diffusion Model", href: "https://huggingface.co/blog/annotated-diffusion", publisher: "Hugging Face" },
  "reinforcement-learning": { title: "Spinning Up in Deep RL", href: "https://spinningup.openai.com/en/latest/", publisher: "OpenAI" },
  "vector-databases": { title: "What is a vector database?", href: "https://www.pinecone.io/learn/vector-database/", publisher: "Pinecone" },
  pinecone: { title: "Pinecone quickstart", href: "https://docs.pinecone.io/guides/get-started/quickstart", publisher: "Pinecone" },
  faiss: { title: "Getting started with Faiss", href: "https://github.com/facebookresearch/faiss/wiki/Getting-started", publisher: "Faiss" },
  weaviate: { title: "Weaviate quickstart", href: "https://docs.weaviate.io/weaviate/quickstart", publisher: "Weaviate" },
  chroma: { title: "Chroma getting started", href: "https://docs.trychroma.com/docs/overview/getting-started", publisher: "Chroma" },
  mlflow: { title: "MLflow getting started", href: "https://mlflow.org/docs/latest/getting-started/", publisher: "MLflow" },
  "weights-and-biases": { title: "W&B Quickstart", href: "https://docs.wandb.ai/quickstart", publisher: "Weights & Biases" },
  flower: { title: "Flower quickstart", href: "https://flower.ai/docs/framework/tutorial-quickstart.html", publisher: "Flower" },
  "federated-learning": { title: "What is federated learning?", href: "https://flower.ai/docs/framework/tutorial-series-what-is-federated-learning.html", publisher: "Flower" },
  "differential-privacy": { title: "A friendly introduction to differential privacy", href: "https://desfontain.es/blog/friendly-intro-to-differential-privacy.html", publisher: "Damien Desfontain" },
  "ablation-studies": { title: "Ablation Studies in Artificial Neural Networks", href: "https://arxiv.org/abs/1901.08644", publisher: "arXiv" },
  docker: { title: "Docker get started", href: "https://docs.docker.com/get-started/", publisher: "Docker" },
  kubernetes: { title: "Learn Kubernetes Basics", href: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", publisher: "Kubernetes" },
  aws: { title: "Getting started with AWS", href: "https://aws.amazon.com/getting-started/", publisher: "Amazon Web Services" },
  gcp: { title: "Get started with Google Cloud", href: "https://cloud.google.com/docs/get-started", publisher: "Google Cloud" },
  azure: { title: "Azure for developers", href: "https://learn.microsoft.com/en-us/azure/developer/", publisher: "Microsoft Learn" },
  terraform: { title: "Get started with Terraform on AWS", href: "https://developer.hashicorp.com/terraform/tutorials/aws-get-started", publisher: "HashiCorp" },
  "ci-cd": { title: "Understand GitHub Actions", href: "https://docs.github.com/en/actions/get-started/understand-github-actions", publisher: "GitHub Docs" },
  "github-actions": { title: "GitHub Actions quickstart", href: "https://docs.github.com/en/actions/get-started/quickstart", publisher: "GitHub Docs" },
  mlops: { title: "MLOps guide", href: "https://ml-ops.org/", publisher: "ml-ops.org" },
  onnx: { title: "Get started with ONNX Runtime", href: "https://onnxruntime.ai/docs/get-started/with-python.html", publisher: "ONNX Runtime" },
  tensorrt: { title: "TensorRT documentation", href: "https://docs.nvidia.com/deeplearning/tensorrt/latest/index.html", publisher: "NVIDIA" },
  "edge-deployment": { title: "Hello AI World", href: "https://github.com/dusty-nv/jetson-inference", publisher: "NVIDIA" },
  jetson: { title: "Jetson developer kits", href: "https://developer.nvidia.com/embedded/jetson-developer-kits", publisher: "NVIDIA" },
  flask: { title: "Flask quickstart", href: "https://flask.palletsprojects.com/en/stable/quickstart/", publisher: "Pallets" },
  fastapi: { title: "FastAPI tutorial", href: "https://fastapi.tiangolo.com/tutorial/", publisher: "FastAPI" },
  grpc: { title: "gRPC Python quickstart", href: "https://grpc.io/docs/languages/python/quickstart/", publisher: "gRPC" },
  "node-js": { title: "Introduction to Node.js", href: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", publisher: "Node.js" },
  django: { title: "Writing your first Django app", href: "https://docs.djangoproject.com/en/stable/intro/tutorial01/", publisher: "Django" },
  spring: { title: "Building an Application with Spring Boot", href: "https://spring.io/guides/gs/spring-boot", publisher: "Spring" },
  net: { title: "Get started with .NET", href: "https://learn.microsoft.com/en-us/dotnet/core/get-started", publisher: "Microsoft Learn" },
  "rest-apis": { title: "What is REST?", href: "https://restfulapi.net/", publisher: "REST API Tutorial" },
  apis: { title: "Introduction to web APIs", href: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Introduction", publisher: "MDN" },
  graphql: { title: "Introduction to GraphQL", href: "https://graphql.org/learn/", publisher: "GraphQL" },
  redis: { title: "Redis get started", href: "https://redis.io/docs/latest/develop/get-started/", publisher: "Redis" },
  kafka: { title: "Apache Kafka quickstart", href: "https://kafka.apache.org/quickstart", publisher: "Apache Kafka" },
  "entity-framework": { title: "Get started with EF Core", href: "https://learn.microsoft.com/en-us/ef/core/get-started/overview/first-app", publisher: "Microsoft Learn" },
  blazor: { title: "ASP.NET Core Blazor", href: "https://learn.microsoft.com/en-us/aspnet/core/blazor/", publisher: "Microsoft Learn" },
  laravel: { title: "Laravel Bootcamp", href: "https://bootcamp.laravel.com/", publisher: "Laravel" },
  microservices: { title: "What are microservices?", href: "https://microservices.io/patterns/microservices.html", publisher: "microservices.io" },
  "data-pipelines": { title: "Data pipelines tutorial", href: "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html", publisher: "Apache Airflow" },
  etl: { title: "What is ETL?", href: "https://www.ibm.com/think/topics/etl", publisher: "IBM" },
  spark: { title: "Spark quick start", href: "https://spark.apache.org/docs/latest/quick-start.html", publisher: "Apache Spark" },
  airflow: { title: "Airflow tutorial", href: "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html", publisher: "Apache Airflow" },
  dbt: { title: "About dbt", href: "https://docs.getdbt.com/docs/introduction", publisher: "dbt" },
  pytest: { title: "Get started with pytest", href: "https://docs.pytest.org/en/stable/getting-started.html", publisher: "pytest" },
  nunit: { title: "Getting started with NUnit", href: "https://docs.nunit.org/articles/nunit/getting-started/installation.html", publisher: "NUnit" },
  selenium: { title: "Selenium WebDriver", href: "https://www.selenium.dev/documentation/webdriver/", publisher: "Selenium" },
  "system-design": { title: "System Design Primer", href: "https://github.com/donnemartin/system-design-primer", publisher: "Donne Martin" },
  saas: { title: "What is SaaS?", href: "https://aws.amazon.com/what-is/saas/", publisher: "Amazon Web Services" },
  hipaa: { title: "HIPAA for professionals", href: "https://www.hhs.gov/hipaa/for-professionals/index.html", publisher: "HHS" },
  hl7: { title: "HL7 standards", href: "https://www.hl7.org/implement/standards/", publisher: "HL7" },
  fhir: { title: "FHIR overview", href: "https://www.hl7.org/fhir/overview.html", publisher: "HL7" },
  "medical-coding": { title: "ICD-10-CM", href: "https://www.cdc.gov/nchs/icd/icd-10-cm/index.html", publisher: "CDC" },
  "healthcare-document-parsing": { title: "FHIR documents", href: "https://www.hl7.org/fhir/documents.html", publisher: "HL7" },
};

const LEARN_ORDER = [
  "python", "javascript", "typescript", "java", "c-sharp", "c-plus", "go", "rust", "sql", "linux", "git", "github",
  "numpy", "pandas", "jupyter", "sql-server", "postgresql", "mysql", "sqlite", "mongodb", "stored-procedures",
  "ai", "machine-learning", "deep-learning", "neural-networks", "model-evaluation", "experimental-design",
  "scikit-learn", "xgboost", "pytorch", "tensorflow", "keras", "jax", "cuda",
  "computer-vision", "opencv", "image-classification", "object-detection", "small-object-detection", "semantic-segmentation", "yolo", "ocr", "super-resolution", "hyperspectral-imaging", "vision-language-models",
  "nlp", "embeddings", "llm", "transformers", "hugging-face", "prompt-engineering", "generative-ai", "rag", "langchain", "llamaindex", "fine-tuning", "peft", "rlhf", "diffusion-models", "reinforcement-learning",
  "vector-databases", "pinecone", "faiss", "weaviate", "chroma", "mlflow", "weights-and-biases", "flower", "federated-learning", "differential-privacy", "ablation-studies",
  "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ci-cd", "github-actions", "mlops", "onnx", "tensorrt", "edge-deployment", "jetson", "flask", "fastapi", "grpc",
  "node-js", "django", "spring", "net", "rest-apis", "apis", "graphql", "redis", "kafka", "entity-framework", "blazor", "laravel", "microservices", "data-pipelines", "etl", "spark", "airflow", "dbt", "pytest", "nunit", "selenium", "system-design", "saas",
  "hipaa", "hl7", "fhir", "medical-coding", "healthcare-document-parsing",
];

const RANK = new Map(LEARN_ORDER.map((id, index) => [id, index]));

export function learningRoadmap(skills: FoundSkill[]): LearningStep[] {
  return [...skills]
    .filter((skill) => RESOURCES[skill.id])
    .sort((a, b) => (RANK.get(a.id) ?? LEARN_ORDER.length) - (RANK.get(b.id) ?? LEARN_ORDER.length))
    .map((skill) => ({ id: skill.id, label: skill.label, ...RESOURCES[skill.id] }));
}

export type PilotUse = {
  id: string;
  label: string;
  how: string;
};

export type PilotProject = {
  theme: string;
  detail: string;
  uses: PilotUse[];
};

type Cluster = {
  priority: number;
  domain: string[];
  support: string[];
  build: (skills: FoundSkill[]) => PilotProject | null;
};

type Scenario = {
  theme: string;
  detail: string;
  /** Each inner list must contain at least one skill that is present. */
  any?: string[][];
  roles: Record<string, string>;
};

function has(skills: FoundSkill[], id: string): boolean {
  return skills.some((skill) => skill.id === id);
}

function onlyFirst(skills: FoundSkill[], ids: string[]): FoundSkill[] {
  const winner = ids.find((id) => has(skills, id));
  if (!winner) return skills;
  const group = new Set(ids);
  return skills.filter((skill) => !group.has(skill.id) || skill.id === winner);
}

function rolesFor(skills: FoundSkill[], roles: Record<string, string>): PilotUse[] {
  return [...skills]
    .filter((skill) => roles[skill.id])
    .sort((a, b) => (RANK.get(a.id) ?? LEARN_ORDER.length) - (RANK.get(b.id) ?? LEARN_ORDER.length))
    .map((skill) => ({ id: skill.id, label: skill.label, how: roles[skill.id] }));
}

function pickScenario(skills: FoundSkill[], scenarios: Scenario[]): PilotProject | null {
  let best: PilotProject | null = null;
  for (const scenario of scenarios) {
    if (scenario.any && !scenario.any.every((group) => group.some((id) => has(skills, id)))) continue;
    const uses = rolesFor(skills, scenario.roles);
    if (!uses.length) continue;
    if (!best || uses.length > best.uses.length) {
      best = { theme: scenario.theme, detail: scenario.detail, uses };
    }
  }
  return best;
}

function hostRoles(item: string): Record<string, string> {
  return {
    docker: `Packages the service that accepts a new ${item}.`,
    fastapi: `Receives one ${item} and returns the result.`,
    flask: `Receives one ${item} and returns the result.`,
    grpc: `Receives one ${item} from another service and returns the result.`,
    aws: `Hosts the service so a ${item} can be submitted from anywhere.`,
    gcp: `Hosts the service so a ${item} can be submitted from anywhere.`,
    azure: `Hosts the service so a ${item} can be submitted from anywhere.`,
    python: "Writes the training script and the service.",
    numpy: "Holds the numeric values the model reads.",
    "model-evaluation": "Scores the model on examples it did not train on.",
    mlflow: "Records each training run and the examples it used.",
    "weights-and-biases": "Charts accuracy across those training runs.",
    cuda: "Runs the training on a GPU.",
    onnx: "Saves the trained model so the service can load it.",
    tensorrt: "Speeds that saved model up for a live request.",
    jetson: "Runs the model on a small computer next to the camera.",
    "edge-deployment": "Keeps the check on that device instead of sending every input away.",
  };
}

function trainRoles(subject: string): Record<string, string> {
  return {
    pytorch: `Trains the ${subject}.`,
    tensorflow: `Trains the ${subject}.`,
    keras: `Defines the ${subject} and runs the training.`,
    jax: `Trains the ${subject} with fast array math.`,
    "scikit-learn": `Fits the ${subject} on the table.`,
    xgboost: `Fits a boosted-tree ${subject} on the table.`,
    "hugging-face": `Loads the pretrained ${subject}.`,
    transformers: `Supplies the model architecture.`,
  };
}

function visionPilot(skills: FoundSkill[]): PilotProject | null {
  const photo = {
    opencv: "Crops and resizes the photo before the model runs.",
    "computer-vision": "Interprets the photo instead of storing it as a file.",
    ...trainRoles("model"),
    ...hostRoles("photo"),
  };
  return pickScenario(onlyFirst(skills, ["aws", "gcp", "azure"]), [
    {
      theme: "Price-tag reader",
      detail: "A shelf photo is scanned, each price tag is located, and the printed price is read.",
      any: [["yolo", "object-detection", "small-object-detection"], ["ocr"]],
      roles: {
        ...photo,
        yolo: "Finds each price tag in the shelf photo.",
        "object-detection": "Locates every tag in the photo.",
        "small-object-detection": "Keeps tiny tags from being skipped.",
        ocr: "Reads the price printed on the tag that was found.",
        pytorch: "Trains the tag finder on labeled shelf photos.",
        tensorflow: "Trains the tag finder on labeled shelf photos.",
        docker: "Packages the service that accepts a new shelf photo.",
        aws: "Hosts the service so a phone can upload a shelf photo.",
        gcp: "Hosts the service so a phone can upload a shelf photo.",
        azure: "Hosts the service so a phone can upload a shelf photo.",
      },
    },
    {
      theme: "Shelf inspector",
      detail: "A phone photo of a store shelf is checked for missing products.",
      any: [["yolo", "object-detection", "small-object-detection"]],
      roles: {
        ...photo,
        yolo: "Draws a box around each product on the shelf.",
        "object-detection": "Finds every product in the shelf photo.",
        "small-object-detection": "Catches thin packages that a coarse detector skips.",
        pytorch: "Trains the detector on labeled shelf photos.",
        tensorflow: "Trains the detector on labeled shelf photos.",
        fastapi: "Receives a shelf photo and returns the products that are missing.",
        flask: "Receives a shelf photo and returns the products that are missing.",
        docker: "Packages the service that accepts a new shelf photo.",
        aws: "Hosts the service so a phone can upload a shelf photo.",
        gcp: "Hosts the service so a phone can upload a shelf photo.",
        azure: "Hosts the service so a phone can upload a shelf photo.",
      },
    },
    {
      theme: "Room mapper",
      detail: "A room photo is split into floor, wall, and furniture regions.",
      any: [["semantic-segmentation"]],
      roles: {
        ...photo,
        "semantic-segmentation": "Paints floor, wall, and furniture as separate regions.",
      },
    },
    {
      theme: "Receipt reader",
      detail: "A photo of a paper receipt is turned into merchant, date, and line items.",
      any: [["ocr"]],
      roles: {
        ...photo,
        ocr: "Reads the merchant, date, and line items off the receipt.",
        opencv: "Straightens and crops the receipt before the text is read.",
      },
    },
    {
      theme: "Photo restorer",
      detail: "A small blurry photo is enlarged into a sharper one.",
      any: [["super-resolution"]],
      roles: {
        ...photo,
        "super-resolution": "Rebuilds a larger image from the small blurry input.",
      },
    },
    {
      theme: "Crop scanner",
      detail: "A field image is read for plant stress that an ordinary photo hides.",
      any: [["hyperspectral-imaging"]],
      roles: {
        ...photo,
        "hyperspectral-imaging": "Reads wavelength bands that show which plants are stressed.",
      },
    },
    {
      theme: "Photo desk",
      detail: "A person asks one question about a photo and gets a short answer.",
      any: [["vision-language-models"]],
      roles: {
        ...photo,
        "vision-language-models": "Answers the written question from what is in the photo.",
      },
    },
    {
      theme: "Part sorter",
      detail: "A photo of one hardware part is matched to a catalog item.",
      any: [["image-classification"]],
      roles: {
        ...photo,
        "image-classification": "Assigns the part photo to one catalog class.",
      },
    },
    {
      theme: "Photo bench",
      detail: "Incoming photos are cropped and sharpened before anything else uses them.",
      any: [["opencv", "computer-vision"]],
      roles: photo,
    },
    {
      theme: "Live photo check",
      detail: "A saved image model is packed so a new photo can be scored quickly.",
      roles: photo,
    },
  ]);
}

function ragPilot(skills: FoundSkill[]): PilotProject | null {
  const narrowed = onlyFirst(onlyFirst(skills, ["aws", "gcp", "azure"]), ["pinecone", "weaviate", "chroma", "faiss"]);
  const handbook = {
    ...trainRoles("answer model"),
    ...hostRoles("question"),
    docker: "Packages the service that accepts a handbook question.",
    fastapi: "Receives a question and returns the answer with the pages it used.",
  };
  return pickScenario(narrowed, [
    {
      theme: "Handbook assistant",
      detail: "A question about a company handbook is answered from the pages that support it.",
      any: [["rag", "langchain", "llamaindex", "embeddings", "vector-databases", "pinecone", "weaviate", "chroma", "faiss", "llm", "nlp", "hugging-face", "transformers", "prompt-engineering", "generative-ai"]],
      roles: {
        ...handbook,
        rag: "Retrieves the handbook pages that can answer the question.",
        langchain: "Connects the question, the page search, and the written answer.",
        llamaindex: "Indexes the handbook and fetches the pages for a question.",
        embeddings: "Turns each page and the question into numbers that can be compared.",
        "vector-databases": "Stores those page numbers so the closest pages can be found.",
        pinecone: "Holds the page numbers for the nearest-page search.",
        weaviate: "Holds the page numbers for the nearest-page search.",
        chroma: "Holds the page numbers for the nearest-page search.",
        faiss: "Searches the page numbers on the same machine.",
        llm: "Writes the answer using only the retrieved pages.",
        nlp: "Splits the handbook into passages and cleans the text.",
        "hugging-face": "Supplies the model that writes the answer.",
        transformers: "Loads that model and runs the answer step.",
        "prompt-engineering": "Instructs the model to answer only from the retrieved pages.",
        "generative-ai": "Produces the written answer.",
        "fine-tuning": "Adapts the model on example questions from this handbook.",
        peft: "Trains a small add-on instead of the whole model.",
        rlhf: "Ranks sample answers so cited ones are preferred.",
      },
    },
    {
      theme: "Answer tuner",
      detail: "A model is adjusted so its handbook answers stay tied to the source pages.",
      any: [["fine-tuning", "peft", "rlhf"]],
      roles: {
        ...handbook,
        "fine-tuning": "Adapts the model on example questions and cited answers.",
        peft: "Trains a small add-on instead of the whole model.",
        rlhf: "Ranks sample answers so the cited ones score higher.",
        pytorch: "Runs that adaptation.",
        tensorflow: "Runs that adaptation.",
      },
    },
  ]);
}

function diffusionPilot(skills: FoundSkill[]): PilotProject | null {
  return pickScenario(skills, [
    {
      theme: "Icon workshop",
      detail: "A short text prompt produces a few simple icons.",
      roles: {
        "diffusion-models": "Creates each icon from the text prompt.",
        pytorch: "Runs the generation.",
        "hugging-face": "Loads the pretrained generator.",
        python: "The script that sends the prompt and saves the icons.",
        cuda: "Runs generation on a GPU.",
        docker: "Packages the script so the same prompt produces the same setup elsewhere.",
      },
    },
  ]);
}

function frameworkPilot(skills: FoundSkill[]): PilotProject | null {
  const narrowed = onlyFirst(skills, ["aws", "gcp", "azure"]);
  const tabular = has(skills, "scikit-learn") || has(skills, "xgboost") || has(skills, "pandas");
  if (tabular) {
    return pickScenario(narrowed, [
      {
        theme: "Churn scorer",
        detail: "A small table of past customers is used to estimate who will leave.",
        roles: {
          ...trainRoles("scorer"),
          ...hostRoles("customer row"),
          ai: "The scoring task: estimate a future outcome from past rows.",
          "machine-learning": "Learns the estimate from historical customer rows.",
          "deep-learning": "Tries a neural net beside the table model.",
          "neural-networks": "The net that reads the customer row.",
          pandas: "Loads the customer table and fixes missing values.",
          numpy: "Holds the numeric columns the model reads.",
          jupyter: "The notebook where the models are compared.",
          "scikit-learn": "Fits a baseline scorer on the table.",
          xgboost: "Fits a tree scorer on the same table.",
          "model-evaluation": "Compares scorers on customers held out of training.",
          docker: "Packages a form that accepts one customer row and returns the estimate.",
          fastapi: "Receives one customer row and returns the estimate.",
        },
      },
    ]);
  }
  return pickScenario(narrowed, [
    {
      theme: "Digit reader",
      detail: "A model learns to read handwritten digits from a small public set.",
      roles: {
        ...trainRoles("digit model"),
        ...hostRoles("digit image"),
        ai: "The task of recognizing a handwritten digit.",
        "machine-learning": "Learns the digit classes from labeled images.",
        "deep-learning": "Uses a neural net for the digit images.",
        "neural-networks": "The net that maps pixels to a digit.",
        "model-evaluation": "Scores the net on digits it did not train on.",
        jupyter: "The notebook where training and the score are written.",
        pandas: "Loads the label file that pairs each image with its digit.",
        numpy: "Holds the pixel values.",
        docker: "Packages a page where a drawn digit is classified.",
        fastapi: "Receives a drawn digit and returns the predicted class.",
      },
    },
  ]);
}

function healthcarePilot(skills: FoundSkill[]): PilotProject | null {
  return pickScenario(skills, [
    {
      theme: "Referral inbox",
      detail: "A sample referral letter is parsed, coded, and checked before it would be stored.",
      roles: {
        "healthcare-document-parsing": "Pulls the patient, date, and reason out of the letter.",
        fhir: "Stores those fields as a FHIR document.",
        hl7: "Maps the same fields into an HL7 message a clinic system could accept.",
        "medical-coding": "Assigns a code to the reason for the visit.",
        hipaa: "Keeps the sample to the minimum fields and out of a public repository.",
        python: "Writes the letter parser.",
        fastapi: "Accepts one uploaded letter and returns the parsed fields.",
        docker: "Packages the parser so it runs the same way on another machine.",
      },
    },
  ]);
}

function dataPilot(skills: FoundSkill[]): PilotProject | null {
  const narrowed = onlyFirst(onlyFirst(skills, ["postgresql", "mysql", "sql-server", "sqlite", "mongodb", "sql"]), ["aws", "gcp", "azure"]);
  return pickScenario(narrowed, [
    {
      theme: "Sales cleanup",
      detail: "A month of messy sales rows is cleaned and loaded into a table that can be queried.",
      roles: {
        pandas: "Loads the sales file and fixes types, blanks, and duplicates.",
        numpy: "Computes the numeric totals while the rows are cleaned.",
        spark: "Cleans the file when it is too large for one machine's memory.",
        jupyter: "The notebook where the cleanup steps are written and checked.",
        airflow: "Runs the cleanup whenever a new sales file arrives.",
        dbt: "Defines the final monthly sales table from the cleaned rows.",
        etl: "The path from the raw file, through cleaning, into the table.",
        "data-pipelines": "Connects the file drop to the cleaned table.",
        postgresql: "Stores the cleaned sales rows.",
        mysql: "Stores the cleaned sales rows.",
        "sql-server": "Stores the cleaned sales rows.",
        sqlite: "Stores the cleaned sales rows in one file.",
        mongodb: "Stores the cleaned sales rows as documents.",
        sql: "Queries the cleaned table for the monthly total.",
        "stored-procedures": "Builds the monthly total inside the database.",
        python: "Writes the cleanup script.",
        docker: "Packages the cleanup job so the schedule can run it.",
        aws: "Runs the scheduled cleanup.",
        gcp: "Runs the scheduled cleanup.",
        azure: "Runs the scheduled cleanup.",
      },
    },
  ]);
}

function federatedPilot(skills: FoundSkill[]): PilotProject | null {
  return pickScenario(skills, [
    {
      theme: "Shared trainer",
      detail: "Three laptops train one small model without sending their raw rows to each other.",
      roles: {
        "federated-learning": "Each laptop trains locally and shares only the model update.",
        flower: "Coordinates the three laptops and averages their updates.",
        "differential-privacy": "Adds noise so one laptop's rows cannot be recovered from the update.",
        pytorch: "The model each laptop trains.",
        python: "The training loop on each laptop.",
      },
    },
  ]);
}

function reinforcementPilot(skills: FoundSkill[]): PilotProject | null {
  return pickScenario(skills, [
    {
      theme: "Pole balancer",
      detail: "An agent learns to keep a pole upright in a simple simulator.",
      roles: {
        "reinforcement-learning": "The loop of action, reward, and the next state.",
        pytorch: "The network that chooses the next push.",
        python: "Runs the simulator and the learning loop.",
      },
    },
  ]);
}

function studyPilot(skills: FoundSkill[]): PilotProject | null {
  return pickScenario(skills, [
    {
      theme: "Model write-up",
      detail: "Two tiny models are compared, including what happens when one piece is removed.",
      roles: {
        "experimental-design": "Decides what is compared and what stays fixed.",
        "ablation-studies": "Removes one piece at a time and records the drop in score.",
        pytorch: "Trains the two models being compared.",
        "scikit-learn": "Fits the simpler of the two models.",
        jupyter: "Where the comparison and the removed-piece table are written.",
        python: "The scripts that train and score the models.",
      },
    },
  ]);
}

function backendPilot(skills: FoundSkill[]): PilotProject | null {
  const narrowed = onlyFirst(
    onlyFirst(onlyFirst(skills, ["fastapi", "django", "flask", "spring", "laravel", "node-js", "net", "blazor", "grpc"]), ["rest-apis", "graphql", "apis"]),
    ["postgresql", "mysql", "sql-server", "sqlite", "mongodb", "sql"],
  );
  return pickScenario(narrowed, [
    {
      theme: "Ticket desk",
      detail: "A one-page form creates a support ticket and reads that ticket back.",
      roles: {
        fastapi: "Creates a ticket and returns it when the form asks.",
        django: "Creates a ticket and renders the page that lists it.",
        flask: "Creates a ticket and returns it when the form asks.",
        spring: "Creates a ticket and returns it to the form.",
        laravel: "Creates a ticket and renders the page that lists it.",
        "node-js": "Creates a ticket and returns it when the form asks.",
        net: "Creates a ticket and returns it to the form.",
        blazor: "The page that submits a ticket and shows it afterward.",
        grpc: "The call another service uses to create a ticket.",
        "rest-apis": "The create-ticket and read-ticket calls the form uses.",
        graphql: "One query the form uses to create a ticket and read it back.",
        apis: "The create-ticket and read-ticket calls the form uses.",
        redis: "Remembers the newest ticket for a few minutes so the page reloads quickly.",
        kafka: "Publishes “ticket created” for a worker that would send the email.",
        "entity-framework": "Reads and writes the ticket row.",
        docker: "Packages the ticket service.",
        postgresql: "Stores the tickets.",
        mysql: "Stores the tickets.",
        "sql-server": "Stores the tickets.",
        sqlite: "Stores the tickets in one file.",
        mongodb: "Stores each ticket as a document.",
        sql: "The query that lists open tickets.",
        python: "Writes the ticket service.",
        typescript: "Writes the form and the request code.",
        javascript: "Writes the form that submits a ticket.",
        java: "Writes the ticket service.",
        "c-sharp": "Writes the ticket service.",
        microservices: "Splits “save the ticket” from “send the email” into two small services.",
      },
    },
  ]);
}

function devopsPilot(skills: FoundSkill[]): PilotProject | null {
  const narrowed = onlyFirst(skills, ["aws", "gcp", "azure"]);
  const deploy = ["docker", "kubernetes", "terraform", "mlops", "ci-cd", "github-actions", "linux", "aws", "gcp", "azure"].some((id) => has(skills, id));
  if (deploy) {
    return pickScenario(narrowed, [
      {
        theme: "Status-page publish",
        detail: "A one-page status site is built and published the same way every time the repository changes.",
        roles: {
          docker: "Builds the status page into an image.",
          kubernetes: "Runs that image.",
          terraform: "Creates the host where the image runs.",
          aws: "The account that owns the host.",
          gcp: "The account that owns the host.",
          azure: "The account that owns the host.",
          "ci-cd": "Starts the publish when the page changes.",
          "github-actions": "Runs that publish from the repository.",
          linux: "The host operating system the page runs on.",
          mlops: "Retrains a tiny status model, then publishes the page that shows its score.",
          git: "Records each change to the page.",
          github: "Stores the page source and shows the publish history.",
        },
      },
    ]);
  }
  return pickScenario(skills, [
    {
      theme: "Recipe card",
      detail: "A one-page recipe is saved, edited, and published from a repository.",
      any: [["git", "github"]],
      roles: {
        git: "Records each edit to the recipe.",
        github: "Stores the recipe and publishes the page.",
      },
    },
  ]);
}

function testPilot(skills: FoundSkill[]): PilotProject | null {
  return pickScenario(skills, [
    {
      theme: "Signup check",
      detail: "The signup form is checked so an empty email is rejected and a valid one is accepted.",
      roles: {
        pytest: "Checks the function that accepts or rejects an email.",
        nunit: "Checks the function that accepts or rejects an email.",
        selenium: "Opens the signup page in a browser and submits one email.",
      },
    },
  ]);
}

function designPilot(skills: FoundSkill[]): PilotProject | null {
  return pickScenario(skills, [
    {
      theme: "Booking desk",
      detail: "A visitor requests a time, and the owner sees that request on a second page.",
      roles: {
        "system-design": "Draws the path from the request form to the stored booking and the owner's page.",
        saas: "Describes how that desk would later be offered as an account with a monthly plan.",
      },
    },
  ]);
}

function languagePilot(skills: FoundSkill[]): PilotProject | null {
  const ordered = ["python", "javascript", "typescript", "java", "c-sharp", "c-plus", "go", "rust"].filter((id) => has(skills, id));
  const keep = new Set(ordered.includes("javascript") && ordered.includes("typescript") ? ["javascript", "typescript"] : ordered.slice(0, 1));
  const narrowed = skills.filter((skill) => keep.has(skill.id));
  return pickScenario(narrowed, [
    {
      theme: "Sales glance",
      detail: "A tiny sales file is read, then the row count and the largest total are printed.",
      roles: {
        python: "Reads the file and prints the count and the largest total.",
        javascript: "Reads the file and prints the count and the largest total.",
        typescript: "Describes the shape of each sales row so a missing column fails before the totals print.",
        java: "Reads the file and prints the count and the largest total.",
        "c-sharp": "Reads the file and prints the count and the largest total.",
        "c-plus": "Reads the file and prints the count and the largest total.",
        go: "Reads the file and prints the count and the largest total.",
        rust: "Reads the file and prints the count and the largest total.",
      },
    },
  ]);
}

const CLUSTERS: Cluster[] = [
  {
    priority: 9,
    domain: ["computer-vision", "opencv", "image-classification", "object-detection", "small-object-detection", "semantic-segmentation", "yolo", "ocr", "super-resolution", "hyperspectral-imaging", "vision-language-models", "cuda", "onnx", "tensorrt"],
    support: ["pytorch", "tensorflow", "keras", "jax", "model-evaluation", "docker", "fastapi", "flask", "grpc", "aws", "gcp", "azure", "jetson", "edge-deployment", "mlflow", "weights-and-biases", "python", "numpy"],
    build: visionPilot,
  },
  {
    priority: 8,
    domain: ["rag", "langchain", "llamaindex", "embeddings", "vector-databases", "pinecone", "faiss", "weaviate", "chroma", "llm", "nlp", "hugging-face", "transformers", "prompt-engineering", "generative-ai", "fine-tuning", "peft", "rlhf"],
    support: ["pytorch", "tensorflow", "python", "docker", "fastapi", "aws", "gcp", "azure"],
    build: ragPilot,
  },
  {
    priority: 7,
    domain: ["diffusion-models"],
    support: ["pytorch", "hugging-face", "python", "cuda", "docker"],
    build: diffusionPilot,
  },
  {
    priority: 6,
    domain: ["pytorch", "tensorflow", "keras", "jax", "scikit-learn", "xgboost", "machine-learning", "deep-learning", "neural-networks", "ai", "model-evaluation"],
    support: ["python", "numpy", "pandas", "jupyter", "docker", "mlflow", "weights-and-biases", "cuda", "aws", "gcp", "azure"],
    build: frameworkPilot,
  },
  {
    priority: 5,
    domain: ["hipaa", "hl7", "fhir", "medical-coding", "healthcare-document-parsing"],
    support: ["python", "fastapi", "docker"],
    build: healthcarePilot,
  },
  {
    priority: 4,
    domain: ["pandas", "numpy", "spark", "airflow", "dbt", "etl", "data-pipelines", "sql", "postgresql", "mysql", "sql-server", "sqlite", "mongodb", "stored-procedures", "jupyter"],
    support: ["python", "docker", "aws", "gcp", "azure"],
    build: dataPilot,
  },
  {
    priority: 4,
    domain: ["federated-learning", "flower", "differential-privacy"],
    support: ["pytorch", "python"],
    build: federatedPilot,
  },
  {
    priority: 4,
    domain: ["reinforcement-learning"],
    support: ["pytorch", "python"],
    build: reinforcementPilot,
  },
  {
    priority: 3,
    domain: ["experimental-design", "ablation-studies"],
    support: ["pytorch", "scikit-learn", "python", "jupyter"],
    build: studyPilot,
  },
  {
    priority: 3,
    domain: ["fastapi", "django", "flask", "node-js", "spring", "net", "rest-apis", "apis", "graphql", "redis", "kafka", "entity-framework", "blazor", "laravel", "microservices", "grpc"],
    support: ["docker", "postgresql", "mysql", "sql-server", "sqlite", "mongodb", "sql", "python", "typescript", "javascript", "java", "c-sharp"],
    build: backendPilot,
  },
  {
    priority: 2,
    domain: ["docker", "kubernetes", "terraform", "ci-cd", "github-actions", "aws", "gcp", "azure", "linux", "mlops", "git", "github"],
    support: [],
    build: devopsPilot,
  },
  {
    priority: 2,
    domain: ["pytest", "nunit", "selenium"],
    support: [],
    build: testPilot,
  },
  {
    priority: 2,
    domain: ["system-design", "saas"],
    support: [],
    build: designPilot,
  },
  {
    priority: 1,
    domain: ["python", "javascript", "typescript", "java", "c-sharp", "c-plus", "go", "rust"],
    support: [],
    build: languagePilot,
  },
];

export function pilotProject(skills: FoundSkill[]): PilotProject | null {
  let best: { cluster: Cluster; chosen: FoundSkill[]; score: number } | null = null;
  for (const cluster of CLUSTERS) {
    const domain = new Set(cluster.domain);
    const support = new Set(cluster.support);
    const domainHits = skills.filter((skill) => domain.has(skill.id));
    if (!domainHits.length) continue;
    const supportHits = skills.filter((skill) => support.has(skill.id));
    const chosen = [...domainHits, ...supportHits];
    const score = chosen.length * 10 + cluster.priority;
    if (!best || score > best.score) best = { cluster, chosen, score };
  }
  if (!best) return null;
  const project = best.cluster.build(best.chosen);
  if (!project || project.uses.length === 0) return null;
  return project;
}
