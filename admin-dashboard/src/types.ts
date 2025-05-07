export interface ImageDisplay {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  createdAt: string;
  userId: string;
  userName: string;
  status: string;
  thumbnailUrl: string;
  aspectRatio?: '16:9' | '9:16';
} 