export const SITE = {
  name: "AI-Pulse",
  tagline: "Your real-time pulse on AI — videos, docs & breakthroughs",
  url: "https://www.quanturatech.com",
};

export const TOPIC_QUERIES = [
  {
    id: "agentic-ai",
    title: "Agentic AI",
    description: "Autonomous agents, multi-step reasoning & AI workflows",
    icon: "Bot",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    query: "agentic AI agents autonomous 2026",
  },
  {
    id: "rag",
    title: "RAG & Retrieval",
    description: "Retrieval-augmented generation, vector DBs & knowledge bases",
    icon: "Database",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    query: "RAG retrieval augmented generation tutorial",
  },
  {
    id: "ai-tools",
    title: "AI Tools",
    description: "Latest frameworks, SDKs & developer tools",
    icon: "Wrench",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    query: "new AI tools framework SDK 2026",
  },
  {
    id: "llms",
    title: "LLMs",
    description: "Large language models, fine-tuning & inference",
    icon: "Brain",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    query: "large language model LLM latest",
  },
  {
    id: "multimodal",
    title: "Multimodal AI",
    description: "Vision, audio, video & cross-modal intelligence",
    icon: "Layers",
    gradient: "from-rose-500 via-pink-500 to-purple-500",
    query: "multimodal AI vision audio video",
  },
  {
    id: "ai-news",
    title: "AI News",
    description: "Breaking announcements & industry updates",
    icon: "Newspaper",
    gradient: "from-red-500 via-orange-500 to-amber-500",
    query: "artificial intelligence news breakthrough 2026",
  },
  {
    id: "ai-security",
    title: "AI Security",
    description: "LLM security, red teaming, adversarial ML, prompt injection & AI safety",
    icon: "Shield",
    gradient: "from-red-600 via-rose-600 to-pink-600",
    query: "AI security LLM red team adversarial machine learning prompt injection",
  },
] as const;

export const GITHUB_REPO_SEARCHES = [
  "AI security stars:>100",
  "LLM security prompt injection",
  "adversarial machine learning security",
  "AI red team LLM",
  "machine learning security toolkit",
] as const;

export const GITHUB_REPOS_LIMIT = 10;

export const QUANTUM_QUERIES = [
  {
    id: "quantum-computing",
    title: "Quantum Computing",
    description: "Latest hardware, breakthroughs, qubits & quantum-AI convergence",
    icon: "Atom",
    gradient: "from-sky-500 via-indigo-500 to-violet-600",
    query: "quantum computing breakthrough hardware qubits 2026",
  },
  {
    id: "quantum-crypto",
    title: "Quantum Crypto",
    description: "Post-quantum cryptography, quantum-safe encryption & security",
    icon: "LockKeyhole",
    gradient: "from-teal-500 via-emerald-500 to-green-600",
    query: "quantum cryptography post-quantum encryption security",
  },
  {
    id: "learn-quantum",
    title: "Learn Quantum",
    description: "Tutorials, courses & explainers to master quantum concepts",
    icon: "GraduationCap",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    query: "learn quantum computing tutorial course explained",
  },
] as const;

export const VENDOR_CHANNELS = [
  {
    id: "azure",
    name: "Microsoft Azure",
    channelId: "UC0m-80FnNY2Qb7obvTL_2fA",
    handle: "MicrosoftAzure",
    logo: "☁️",
    accent: "#0078D4",
    channelUrl: "https://www.youtube.com/@MicrosoftAzure",
    fallbackQuery: "Microsoft Azure AI cloud",
  },
  {
    id: "aws",
    name: "AWS",
    channelId: "UCd6MoB9NC6uYN2grvUNT-Zg",
    handle: "AmazonWebServices",
    logo: "🟠",
    accent: "#FF9900",
    channelUrl: "https://www.youtube.com/@AmazonWebServices",
    fallbackQuery: "AWS artificial intelligence machine learning",
  },
  {
    id: "google",
    name: "Google Cloud",
    channelId: "UCTMRxtyHoE3LPcrl-kT4AQQ",
    handle: "googlecloud",
    logo: "🔵",
    accent: "#4285F4",
    channelUrl: "https://www.youtube.com/@googlecloud",
    fallbackQuery: "Google Cloud AI",
  },
  {
    id: "openai",
    name: "OpenAI",
    channelId: "UCXZCJLdBC09xxGZ6gcdrc6A",
    handle: "OpenAI",
    logo: "🤖",
    accent: "#10A37F",
    channelUrl: "https://www.youtube.com/@OpenAI",
    fallbackQuery: "OpenAI official",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    channelId: "UCrDwWp7EBBv4NwvScIpBDOA",
    handle: "anthropic-ai",
    logo: "🧠",
    accent: "#D4A574",
    channelUrl: "https://www.youtube.com/@anthropic-ai",
    fallbackQuery: "Anthropic Claude AI official",
  },
] as const;

export const RSS_FEEDS = [
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/" },
  { name: "OpenAI Blog", url: "https://openai.com/blog/rss.xml" },
  { name: "AWS ML Blog", url: "https://aws.amazon.com/blogs/machine-learning/feed/" },
  { name: "Azure Blog", url: "https://azure.microsoft.com/en-us/blog/feed/" },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed" },
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
  { name: "arXiv cs.AI", url: "https://rss.arxiv.org/rss/cs.AI" },
] as const;

export const TAVILY_QUERIES = [
  "latest AI documentation releases 2026",
  "new AI research papers and tools this week",
  "AI agent frameworks and RAG tutorials",
  "quantum computing AI research news",
  "AI security tools github repositories",
] as const;

export const VIDEOS_PER_SECTION = 6;
export const MIN_VIDEO_DURATION_SECONDS = 8 * 60; // 8 minutes minimum
export const VIDEO_SEARCH_POOL_SIZE = 50; // fetch extra candidates to filter by duration
export const ARTICLES_PER_FEED = 4;
export const TAVILY_RESULTS_PER_QUERY = 5;