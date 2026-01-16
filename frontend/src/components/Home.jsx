import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Youtube, Sparkles, TrendingUp, BarChart3, Download } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const createBubbles = (count, viewport) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * viewport.width,
    y: Math.random() * viewport.height,
    vx: (Math.random() - 0.5) * 1.8,
    vy: (Math.random() - 0.5) * 1.8,
    size: 15 + Math.random() * 15
  }));
};

const Home = () => {
  const [channelInput, setChannelInput] = useState('');
  const [videoCount, setVideoCount] = useState("1");
  const [bubbles, setBubbles] = useState([]);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

useEffect(() => {
  const handleResize = () => {
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
  if (bubbles.length === 0) {
    setBubbles(createBubbles(30, viewport));
  }
}, [viewport, bubbles.length]);

const SPEED_MULTIPLIER = 0.9;


useEffect(() => {
  let animationId;

  const moveBubbles = () => {
    setBubbles(prev =>
      prev.map(b => {
        let { x, y, vx, vy, size } = b;

        x += vx;
        y += vy;

        const maxX = viewport.width - size;
        const maxY = viewport.height - size;

        if (x <= 0 || x >= maxX) vx *= -1;
        if (y <= 0 || y >= maxY) vy *= -1;

        return { ...b, x, y, vx, vy };
      })
    );

    animationId = requestAnimationFrame(moveBubbles);
  };

  animationId = requestAnimationFrame(moveBubbles);
  return () => cancelAnimationFrame(animationId);
}, [viewport]);


  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!channelInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a channel URL or ID",
        variant: "destructive"
      });
      return;
    }

    const count = parseInt(videoCount, 10);

if (isNaN(count) || count < 1 || count > 500) {
  toast({
    title: "Error",
    description: "Please enter a video count between 1 and 500",
    variant: "destructive"
  });
  return;
}

    navigate(
  `/results?channel=${encodeURIComponent(channelInput)}&count=${count}`
);
};


  // Variants for staggered feature cards
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen">
      {/* Animated Gradient Background */}
      <motion.div
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-[length:400%_400%] -z-10"
      />

      {/* Floating YouTube Bubbles */}
<div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
  {bubbles.map(b => (
    <motion.div
  key={b.id}
  style={{
    position: "absolute",
    top: b.y,
    left: b.x,
    width: b.size,
    height: b.size,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff0000, #ff5a5a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px rgba(255,0,0,0.25)"
  }}
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{
    duration: 2 + Math.random() * 2, // random duration for each bubble
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <Youtube
    className="text-white"
    style={{ width: b.size * 0.55, height: b.size * 0.55 }}
  />
</motion.div>
  ))}
</div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 min-h-screen"
      >
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-4"
            >
              <Youtube className="w-20 h-20 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent"
            >
              YouTube Channel Analyzer
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Get comprehensive insights into any YouTube channel's latest videos with advanced analytics and engagement metrics
            </motion.p>
          </div>

          <AdBanner />

          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto shadow-2xl border-2 border-blue-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl">Enter Channel Details</CardTitle>
                <CardDescription>
                  Provide the YouTube channel URL or ID and specify how many recent videos to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="channel" className="text-base font-medium">
                      Channel URL or ID
                    </Label>
                    <Input
                      id="channel"
                      type="text"
                      placeholder="e.g., https://youtube.com/@channelname or UC1234567890"
                      value={channelInput}
                      onChange={(e) => setChannelInput(e.target.value)}
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-gray-500">
                      Paste the full channel URL or just the channel ID
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="count" className="text-base font-medium">
                      Number of Videos (1-500)
                    </Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="500"
                      value={videoCount}
                      onChange={(e) => setVideoCount(e.target.value)}
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-gray-500">
                      How many recent videos would you like to analyze?
                    </p>
                  </div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Channel
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto"
          >
            {/* Feature 1 */}
            <motion.div variants={featureVariants}>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Trending Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify hot videos with high engagement rates
                </p>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={featureVariants}>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-cyan-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900 mb-4">
                  <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Detailed Metrics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Views, likes, comments, and engagement data
                </p>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={featureVariants}>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Sorting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sort by date, views, likes, or engagement
                </p>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={featureVariants}>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download video data in CSV format
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
