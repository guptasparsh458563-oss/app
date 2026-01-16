import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import VideoCard from './VideoCard';
import { formatNumber } from '../utils';
import { fetchChannelVideos } from '../services/api';
import {
  ArrowLeft,
  Search,
  Download,
  SortAsc,
  Eye,
  ThumbsUp,
  TrendingUp,
  Calendar,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

const formatDuration = (iso) => {
  if (!iso) return '';

  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  const hours = parseInt(match?.[1] || 0);
  const minutes = parseInt(match?.[2] || 0);
  const seconds = parseInt(match?.[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const channelId = searchParams.get('channel');
  const requestedCount = parseInt(searchParams.get('count')) || 10;

  const [videos, setVideos] = useState([]);
  const [channelTitle, setChannelTitle] = useState('');
  const [lifetimeRevenue, setLifetimeRevenue] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchChannelVideos(channelId, requestedCount);

        if (!result.success) {
          throw new Error(result.error || 'Unknown error');
        }

        const normalizedVideos = result.videos.map(v => ({
          ...v,
          estimatedRevenue: Number(v.estimatedRevenue ?? v.estimated_revenue ?? 0)
        }));

        setVideos(normalizedVideos);
        setChannelTitle(result.channel_title || channelId);
        setLifetimeRevenue(Number(result.lifetime_estimated_revenue ?? 0));

        toast({
          title: 'Success',
          description: `Loaded ${normalizedVideos.length} videos`
        });
      } catch (err) {
        setError(err.message);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [channelId, requestedCount]);

  const stats = useMemo(() => {
    const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
    const totalLikes = videos.reduce((s, v) => s + v.likeCount, 0);
    const totalComments = videos.reduce((s, v) => s + v.commentCount, 0);
    const totalFetchedRevenue = videos.reduce((s, v) => s + v.estimatedRevenue, 0);

    const avgEngagement =
      totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : '0.00';

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalFetchedRevenue,
      avgEngagement,
      videoCount: videos.length
    };
  }, [videos]);

  const filteredVideos = useMemo(() => {
    const filtered = videos.filter(v =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'views':
        return [...filtered].sort((a, b) => b.viewCount - a.viewCount);
      case 'likes':
        return [...filtered].sort((a, b) => b.likeCount - a.likeCount);
      case 'engagement':
        return [...filtered].sort(
          (a, b) =>
            (b.likeCount / b.viewCount || 0) -
            (a.likeCount / a.viewCount || 0)
        );
      default:
        return [...filtered].sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
    }
  }, [videos, searchQuery, sortBy]);

  const handleExport = () => {
   const csv = [
  ['Channel', channelTitle].join(','),
  '',
    ['Channel Lifetime Revenue (USD)', lifetimeRevenue.toFixed(2)].join(','),
  ['Fetched Videos Revenue (USD)', stats.totalFetchedRevenue.toFixed(2)].join(','),
  '',
      [
        'Title',
        'Views',
        'Likes',
        'Comments',
        'Engagement %',
        'Estimated Revenue (USD)',
        'Published Date & Time',
        'Duration',
        'Video URL'
      ].join(','),
      ...filteredVideos.map(v =>
        [
          `"${v.title.replace(/"/g, '""')}"`,
          v.viewCount,
          v.likeCount,
          v.commentCount,
          v.viewCount > 0
          ? ((v.likeCount / v.viewCount) * 100).toFixed(2)
          : '0.00',
          v.estimatedRevenue.toFixed(2),
          `"${new Date(v.publishedAt).toLocaleString()}"`,
          `'${formatDuration(v.duration)}'`,
          `https://youtube.com/watch?v=${v.id}`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-channel-${Date.now()}.csv`;
    a.click();

    URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: 'CSV downloaded' });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Badge variant="outline">{channelTitle}</Badge>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">

  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
    <CardHeader><CardTitle>Total Videos</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold">{stats.videoCount}</CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
    <CardHeader><CardTitle>Channel Revenue</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold">
      ${lifetimeRevenue.toFixed(2)}
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
    <CardHeader><CardTitle>Fetched Revenue</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold">
      ${stats.totalFetchedRevenue.toFixed(2)}
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
    <CardHeader><CardTitle>Total Views</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold">
      {formatNumber(stats.totalViews)}
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
    <CardHeader><CardTitle>Total Likes</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold">
      {formatNumber(stats.totalLikes)}
    </CardContent>
  </Card>

  {/* ✅ THIS WAS MISSING */}
  <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
    <CardHeader><CardTitle>Total Comments</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold">
      {formatNumber(stats.totalComments)}
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white">
    <CardHeader><CardTitle>Avg Engagement</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold">
      {stats.avgEngagement}%
    </CardContent>
  </Card>

</div>

{/* Revenue Disclaimer */}
<div className="mb-8">
  <div className="flex items-start gap-2 text-sm text-gray-500 max-w-3xl">
    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
    <p>
      Revenue figures shown are <strong>estimates only</strong>. Actual earnings may vary
      depending on monetization status, CPM, audience geography, content category,
      and YouTube policies.
    </p>
  </div>
</div>

        {/* FILTER BAR */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Latest</SelectItem>
              <SelectItem value="views">Views</SelectItem>
              <SelectItem value="likes">Likes</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* VIDEOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map(v => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
