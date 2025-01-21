import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { AnimatedGallery } from '../components/ui/animated-gallery';
import { 
  Zap, 
  Upload, 
  Plus,
  ArrowRight,
  LayoutGrid,
  Users as UsersIcon,
  CreditCard,
  Image as ImageIcon, 
  Coins, 
  Youtube, 
  Type, 
  FileVideo, 
  AlertCircle,
  LogOut,
  User,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../components/UserProfile';
import { GenerationHistory } from '../components/GenerationHistory';

type GenerationType = 'title' | 'image' | 'youtube' | 'custom';
type AspectRatio = '16:9' | '9:16';
type MenuSection = 'create' | 'creations' | 'referrals' | 'subscription' | 'logout';

// YouTube URL regex pattern
const YOUTUBE_URL_PATTERN = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function Dashboard() {
  const [credits] = useState(100);
  const [activeSection, setActiveSection] = useState<MenuSection>('create');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [imageText, setImageText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('gaming');
  const [youtubePreview, setYoutubePreview] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<GenerationType>('title');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [generationOption, setGenerationOption] = useState<'style' | 'recreate'>('style');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setUser({
            ...user,
            profile_data: profile || {},
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const templateOptions = [
    { value: 'gaming', label: 'Gaming Thumbnail' },
    { value: 'vlog', label: 'Vlog Cover' },
    { value: 'tutorial', label: 'Tutorial Thumbnail' },
    { value: 'review', label: 'Review Cover' },
    { value: 'music', label: 'Music Cover' },
  ];

  // Extract YouTube video ID and get thumbnail
  const getYoutubeThumbnail = (url: string) => {
    const videoId = url.match(YOUTUBE_URL_PATTERN)?.[1];
    if (!videoId) {
      setYoutubeError('Please enter a valid YouTube URL');
      setYoutubePreview(null);
      return;
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    setYoutubePreview(thumbnailUrl);
    setYoutubeError(null);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (youtubeUrl) {
        getYoutubeThumbnail(youtubeUrl);
      } else {
        setYoutubePreview(null);
        setYoutubeError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [youtubeUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'creations', label: 'My Creations', icon: LayoutGrid },
    { id: 'referrals', label: 'Referrals', icon: UsersIcon },
    { id: 'subscription', label: 'My Subscription', icon: CreditCard },
    { id: 'logout', label: 'Logout', icon: LogOut, onClick: handleLogout },
  ];
  
  const tabs = [
    { id: 'title', label: 'From Title', icon: Type },
    { id: 'image', label: 'From Image', icon: ImageIcon },
    { id: 'youtube', label: 'From YouTube', icon: Youtube },
 
  ];

  const getSelectionClasses = (isActive: boolean) => 
    isActive 
      ? 'relative before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-[#3749be] before:animate-[border-pulse_2s_linear_infinite] bg-transparent' 
      : 'border border-white/10 hover:border-[#3749be] bg-transparent';
  const renderContent = () => {
    switch (activeSection) {
      case 'create':
        return (
          <>
            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-3 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = generationType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setGenerationType(tab.id as GenerationType)}
                      className={`relative flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                        getSelectionClasses(isActive)
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="mt-6 bg-transparent border border-white/10 rounded-xl p-4 md:p-6">
                {generationType === 'title' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white/80">Video Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your video title"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                )}

                {generationType === 'image' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Image Description</label>
                      <input
                        type="text"
                        value={imageText}
                        onChange={(e) => setImageText(e.target.value)}
                        placeholder="Describe what you want in the image"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Reference Image (Optional)</label>
                      <div className="border-2 border-dashed border-white/10 rounded-lg p-4 md:p-8 text-center hover:border-[#3749be] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="w-10 h-10 mx-auto mb-4 text-white/70" />
                          <p className="text-sm text-white/70 mb-1">
                            Drop image or click to browse
                          </p>
                          <p className="text-xs text-white/40">
                            Supports JPG, PNG, WEBP
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {generationType === 'youtube' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-white/80">YouTube URL</label>
                        <input
                          type="text"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="Enter YouTube video URL"
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        {youtubeError && (
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {youtubeError}
                          </div>
                        )}
                        
                        {/* YouTube Preview */}
                        {youtubeUrl && (
                          <div className="aspect-video w-full max-w-sm rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                            {youtubePreview ? (
                              <img
                                src={youtubePreview}
                                alt="YouTube Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/40">
                                <FileVideo className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Your Photo (Optional)
                            <span className="block text-xs text-white/60 mt-1">
                              If you want to be in the thumbnail
                            </span>
                          </label>
                          <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-[#3749be] transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto mb-3 text-white/70" />
                              <p className="text-sm text-white/70 mb-1">
                                Drop photo or click to browse
                              </p>
                              <p className="text-xs text-white/40">
                                Supports JPG, PNG, WEBP
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* YouTube Generation Options */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-white/80">Choose Generation Option</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setGenerationOption('style')}
                          className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                            generationOption === 'style'
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-white/10 bg-white/5 text-white/80 hover:border-blue-500/50'
                          }`}
                        >
                          Use this youtube style and theme
                        </button>
                        <button
                          type="button"
                          onClick={() => setGenerationOption('recreate')}
                          className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                            generationOption === 'recreate'
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-white/10 bg-white/5 text-white/80 hover:border-blue-500/50'
                          }`}
                        >
                          Recreate this youtube thumbnail
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                
              </div>
            </div>
            
            {/* Aspect Ratio Selection */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                Select Ratio
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedRatio('16:9')}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                    getSelectionClasses(selectedRatio === '16:9')
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="6" width="20" height="11.25" rx="2" />
                    </svg>
                    <span className="text-sm">16:9</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedRatio('9:16')}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                    getSelectionClasses(selectedRatio === '9:16')
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="6" y="2" width="11.25" height="20" rx="2" />
                    </svg>
                    <span className="text-sm">9:16</span>
                  </div>
                </button>
              </div>
            </div>

             {/* Generate Button */}
             <button className="relative w-full inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 mb-8">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#a2aeff_0%,#3749be_50%,#a2aeff_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full dark:bg-[#070e41] bg-[#ffffff] px-8 py-1 text-sm font-medium dark:text-gray-50 text-black backdrop-blur-3xl">
                <Zap className="w-5 h-5 mr-2" />
                Generate Thumbnails
              </span>
            </button>

            {/* Recent Creations */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Creations</h2>
                <button 
                  onClick={() => setActiveSection('creations')}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    id: 101,
                    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
                    title: 'React Development',
                    aspectRatio: '16:9',
                    gridSpan: 'sm:col-span-2 md:col-span-1'
                  },
                  {
                    id: 102,
                    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3',
                    title: 'Mobile Development',
                    aspectRatio: '16:9',
                    gridSpan: 'md:col-span-1'
                  },
                  {
                    id: 103,
                    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                    title: 'Web Design',
                    aspectRatio: '16:9',
                    gridSpan: 'sm:col-span-2 md:col-span-1'
                  },
                  {
                    id: 104,
                    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3',
                    title: 'UI/UX Design',
                    aspectRatio: '16:9',
                    gridSpan: 'md:col-span-1'
                  }
                ].map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setZoomedImage({ url: item.url, title: item.title })}
                    className={cn(
                      "group relative rounded-xl overflow-hidden cursor-zoom-in h-full",
                      "bg-white/5 backdrop-blur-sm border border-white/10",
                      "hover:border-[#3749be] hover:shadow-lg hover:shadow-[#3749be]/20",
                      "transition-all duration-300",
                      item.aspectRatio === "16:9" ? "aspect-video" : "aspect-[9/16]",
                      item.gridSpan
                    )}
                  >
                    <motion.img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <p className="text-white text-sm font-medium">{item.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Image Zoom Modal */}
              {zoomedImage && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                  onClick={() => setZoomedImage(null)}
                >
                  <div className="relative max-w-[90vw] max-h-[90vh]">
                    <motion.img
                      src={zoomedImage.url}
                      alt={zoomedImage.title}
                      className="w-full h-full object-contain rounded-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                    <button
                      className="absolute top-4 right-4 text-white/80 hover:text-white"
                      onClick={() => setZoomedImage(null)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        );
      case 'creations':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Creations</h2>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-lg border border-white/10 hover:border-[#3749be] transition-colors text-sm">
                  Filter
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  New Thumbnail
                </button>
              </div>
            </div>
            <AnimatedGallery 
              items={[
                {
                  id: 201,
                  url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
                  title: 'React Development Tips',
                  description: 'Advanced React patterns and best practices',
                  aspectRatio: '16:9'
                },
                {
                  id: 202,
                  url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3',
                  title: 'Mobile App Development',
                  description: 'Building cross-platform mobile applications',
                  aspectRatio: '16:9'
                },
                {
                  id: 203,
                  url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                  title: 'Web Design Trends 2024',
                  description: 'Latest trends in modern web design',
                  aspectRatio: '16:9'
                },
                {
                  id: 204,
                  url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3',
                  title: 'UI/UX Design Process',
                  description: 'Complete guide to design workflow',
                  aspectRatio: '16:9'
                },
                {
                  id: 205,
                  url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713',
                  title: 'Code Review Best Practices',
                  description: 'How to conduct effective code reviews',
                  aspectRatio: '16:9'
                },
                {
                  id: 206,
                  url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
                  title: 'DevOps Pipeline Setup',
                  description: 'Building a modern CI/CD pipeline',
                  aspectRatio: '16:9'
                },
                {
                  id: 207,
                  url: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd',
                  title: 'Database Design',
                  description: 'Optimizing database architecture',
                  aspectRatio: '16:9'
                }
              ]}
              onDownload={(item) => {
                console.log('Downloading:', item);
                // Handle download logic
              }}
            />
          </div>
        );
      case 'referrals':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Referrals</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Your Referral Link</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="https://thumbai.app/ref/user123"
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                  />
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Copy
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm text-white/60 mb-1">Total Referrals</h4>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm text-white/60 mb-1">Active Users</h4>
                  <p className="text-2xl font-bold">18</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm text-white/60 mb-1">Credits Earned</h4>
                  <p className="text-2xl font-bold">240</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'subscription':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Subscription</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Current Plan</h3>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Active</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">$24.99</span>
                  <span className="text-white/60">/month</span>
                </div>
                <p className="text-white/60 mb-4">Creator Plan</p>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Upgrade Plan
                </button>
              </div>
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">Creator Plan</p>
                        <p className="text-sm text-white/60">{new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$24.99</p>
                        <p className="text-sm text-green-400">Paid</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'logout':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Logout</h2>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Side Menu */}
      <div className="fixed top-0 bottom-0 left-0 z-50 w-64 bg-background/30 backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 hidden lg:block">
        <div className="h-full flex flex-col p-4 pt-8">
          {/* User Profile Display */}
          <div className="mb-4 px-4 py-3 bg-[#070e41]/30 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border border-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                  <User className="w-5 h-5 text-white/60" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-white">
                  {user?.user_metadata?.full_name || 'User'}
                </h3>
              </div>
            </div>
          </div>

          {/* Credits Display */}
          <div className="mb-8 px-4 py-3 bg-[#070e41]/30 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-lg">{credits}</span>
            </div>
            <span className="text-sm text-white/60">Available Credits</span>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      setActiveSection(item.id as MenuSection);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-[#3749be] before:animate-[border-pulse_2s_linear_infinite] text-white bg-transparent' 
                      : 'text-white/60 hover:text-white hover:bg-white/5 bg-transparent'
                    } hover:scale-[1.02]
                    ${item.id === 'logout' ? 'mt-auto text-red-400 hover:text-red-300' : ''}
                  `}
                >
                  <Icon className="w-6 h-6" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Glassmorphic Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/60 to-background/40 backdrop-blur-xl border-t border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        </div>

        {/* Credits Display for Mobile */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-[#070e41]/80 backdrop-blur-sm border border-white/10 flex items-center gap-2">
          <Coins className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-white">{credits}</span>
          <span className="text-sm text-white/60">credits</span>
        </div>

        <div className="flex items-center justify-around p-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            // Center create button
            if (index === 0) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as MenuSection)}
                  className="relative -mt-8 p-4 rounded-full bg-gradient-to-tr from-[#3749be] to-[#4d5ed7] text-white shadow-[0_8px_20px_-6px_rgba(55,73,190,0.6)] hover:shadow-[0_8px_24px_-4px_rgba(55,73,190,0.8)] transition-all duration-300 hover:scale-105 flex items-center justify-center"
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    setActiveSection(item.id as MenuSection);
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  relative p-2
                  ${isActive 
                    ? 'text-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-blue-400 after:shadow-[0_0_8px_rgba(96,165,250,0.6)]' 
                    : 'text-white/60 hover:text-white/80'
                  }
                  transition-all duration-300 hover:scale-105
                `}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <UserProfile />
          <div className="mt-8">
            <GenerationHistory />
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}