import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, ThumbsUp, MessageSquare, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { parseDuration, formatNumber, calculateEngagement, timeAgo, formatExactDateTime } from '../utils';

const VideoCard = ({ video }) => {
  const engagement = calculateEngagement(video.likeCount, video.viewCount);
  const duration = parseDuration(video.duration);
  const publishedTime = timeAgo(video.publishedAt);
  const publishedExact = formatExactDateTime(video.publishedAt);

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </div>
        </div>
        {parseFloat(engagement) > 4 && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
              <TrendingUp className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {video.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {video.description}
        </p>
        
        <div className="text-xs text-gray-500 dark:text-gray-500">
  {publishedTime}
  <br />
  <span className="font-medium text-gray-700 dark:text-gray-300">
    Posted on: {publishedExact}
  </span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1 text-sm">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{formatNumber(video.viewCount)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            <span className="font-medium">{formatNumber(video.likeCount)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <span className="font-medium">{formatNumber(video.commentCount)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
  <DollarSign className="w-4 h-4 text-yellow-500" />
  <span className="font-medium">
    ${video.estimatedRevenue?.toFixed(2)}
  </span>
</div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="text-xs">
            Engagement: {engagement}%
          </Badge>
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Watch →
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;