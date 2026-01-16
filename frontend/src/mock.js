// Mock YouTube video data
export const mockVideoData = [
  {
    id: "dQw4w9WgXcQ",
    title: "Building Scalable Microservices with Docker and Kubernetes",
    description: "Learn how to build and deploy scalable microservices using Docker containers and Kubernetes orchestration. This comprehensive tutorial covers everything from basics to advanced deployment strategies.",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=480&h=270&fit=crop",
    publishedAt: "2024-12-15T10:30:00Z",
    viewCount: 1250000,
    likeCount: 45000,
    commentCount: 3200,
    duration: "PT25M42S"
  },
  {
    id: "xvFZjo5PgG0",
    title: "React 19 New Features: Server Components Deep Dive",
    description: "Explore the revolutionary server components in React 19. This video breaks down how server components work, their benefits, and real-world implementation examples.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=480&h=270&fit=crop",
    publishedAt: "2024-12-10T14:20:00Z",
    viewCount: 890000,
    likeCount: 38000,
    commentCount: 2100,
    duration: "PT18M15S"
  },
  {
    id: "y8Kyi0WNg40",
    title: "AI-Powered Code Review: The Future of Software Development",
    description: "Discover how artificial intelligence is transforming code review processes. We'll explore AI tools that can catch bugs, suggest improvements, and maintain code quality automatically.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=480&h=270&fit=crop",
    publishedAt: "2024-12-08T09:45:00Z",
    viewCount: 2100000,
    likeCount: 72000,
    commentCount: 5400,
    duration: "PT32M08S"
  },
  {
    id: "9bZkp7q19f0",
    title: "PostgreSQL Performance Optimization: Advanced Techniques",
    description: "Master advanced PostgreSQL optimization techniques including query planning, indexing strategies, and connection pooling for high-performance applications.",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=480&h=270&fit=crop",
    publishedAt: "2024-12-05T16:00:00Z",
    viewCount: 450000,
    likeCount: 19000,
    commentCount: 1800,
    duration: "PT28M33S"
  },
  {
    id: "3JZ_D3ELwOQ",
    title: "Web3 Development: Building Your First DApp",
    description: "Step-by-step guide to creating your first decentralized application (DApp) using Ethereum, Solidity, and Web3.js. Perfect for beginners entering the blockchain space.",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=480&h=270&fit=crop",
    publishedAt: "2024-12-03T11:15:00Z",
    viewCount: 680000,
    likeCount: 28000,
    commentCount: 2900,
    duration: "PT41M20S"
  },
  {
    id: "kJQP7kiw5Fk",
    title: "TypeScript 5.0: What's New and How to Migrate",
    description: "Complete overview of TypeScript 5.0 new features including decorators, const type parameters, and improved type inference. Includes migration guide from 4.x.",
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=480&h=270&fit=crop",
    publishedAt: "2024-12-01T13:30:00Z",
    viewCount: 520000,
    likeCount: 22000,
    commentCount: 1600,
    duration: "PT22M47S"
  },
  {
    id: "L3wKzyIN1yk",
    title: "System Design Interview: Design Instagram",
    description: "Complete system design interview walkthrough for designing Instagram. Covers architecture, database design, caching, CDN, and scalability considerations.",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=480&h=270&fit=crop",
    publishedAt: "2024-11-28T08:00:00Z",
    viewCount: 1850000,
    likeCount: 68000,
    commentCount: 4500,
    duration: "PT45M12S"
  },
  {
    id: "pRpeEdMmmQ0",
    title: "Cloud Security Best Practices for AWS",
    description: "Essential security practices for AWS cloud infrastructure. Learn about IAM policies, encryption, VPC configuration, and compliance frameworks.",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=480&h=270&fit=crop",
    publishedAt: "2024-11-25T15:45:00Z",
    viewCount: 390000,
    likeCount: 16000,
    commentCount: 1200,
    duration: "PT30M55S"
  }
];

export const getChannelMockData = (videoCount = 10) => {
  return mockVideoData.slice(0, Math.min(videoCount, mockVideoData.length));
};

// Helper function to parse ISO 8601 duration to readable format
export const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
};

// Format numbers with commas
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Calculate engagement rate
export const calculateEngagement = (likes, views) => {
  return ((likes / views) * 100).toFixed(2);
};

// Calculate time ago
export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
};