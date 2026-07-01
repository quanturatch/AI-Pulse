export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
  durationSeconds?: number;
  durationLabel?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  image?: string;
}

export interface TopicSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  videos: VideoItem[];
}

export interface RepoItem {
  id: string;
  name: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  starsLabel: string;
  forksLabel: string;
  language?: string;
  topics: string[];
  updatedAt: string;
  openIssues: number;
  rank?: number;
}

export interface VendorSection {
  id: string;
  name: string;
  logo: string;
  accent: string;
  channelUrl: string;
  videos: VideoItem[];
}

export interface AggregatedData {
  topics: TopicSection[];
  quantum: TopicSection[];
  vendors: VendorSection[];
  articles: ArticleItem[];
  tavilyArticles: ArticleItem[];
  githubRepos: RepoItem[];
  lastUpdated: string;
  stats: {
    totalVideos: number;
    totalArticles: number;
    totalRepos: number;
    sources: number;
  };
  youtubeConfigured?: boolean;
  youtubeCachedAt?: string;
  cacheVersion?: number;
}