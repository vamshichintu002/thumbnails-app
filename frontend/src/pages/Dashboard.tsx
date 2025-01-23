import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { 
  Zap, 
  Upload, 
  Plus,
  ArrowRight,
  LayoutGrid,
  CreditCard,
  Image as ImageIcon, 
  Youtube, 
  Type, 
  FileVideo, 
  AlertCircle,
  LogOut,
  User,
  Gem,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../components/UserProfile';
import { MyCreations } from '../components/MyCreations';
import { Subscription } from '../components/Subscription';
import toast, { Toaster } from 'react-hot-toast';

type GenerationType = 'title' | 'image' | 'youtube' | 'custom';
type AspectRatio = '16:9' | '9:16';
type MenuSection = 'create' | 'creations' | 'subscription' | 'logout';

// YouTube URL regex pattern
const YOUTUBE_URL_PATTERN = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function Dashboard() {
  const [credits, setCredits] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<MenuSection>('create');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [imageText, setImageText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<GenerationType>('image');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [generationOption, setGenerationOption] = useState<'style' | 'recreate'>('style');
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showGeneratedPopup, setShowGeneratedPopup] = useState(false);
  const [userGenerations, setUserGenerations] = useState<Array<{
    id: string;
    output_image_url: string;
    created_at: string;
    generation_type: string;
  }>>([]);
  const [allGenerations, setAllGenerations] = useState<any[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [existingImages, setExistingImages] = useState<Array<{id: string; image_url: string}>>([]);
  const [selectedExistingImage, setSelectedExistingImage] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching credits:', error);
          return;
        }

        if (data) {
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCredits();
  }, [user]);

  useEffect(() => {
    const fetchUserGenerations = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserGenerations(data || []);
      } catch (error) {
        console.error('Error fetching generations:', error);
      }
    };

    fetchUserGenerations();
  }, [user]);

  useEffect(() => {
    if (activeSection === 'creations') {
      fetchAllGenerations();
    }
  }, [activeSection]);

  useEffect(() => {
    if (user) {
      fetchExistingImages();
    }
  }, [user]);

  const fetchAllGenerations = async () => {
    if (!user) return;
    setIsLoadingGenerations(true);
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllGenerations(data || []);
    } catch (error) {
      console.error('Error fetching generations:', error);
    } finally {
      setIsLoadingGenerations(false);
    }
  };

  const fetchExistingImages = async () => {
    try {
      const { data, error } = await supabase
        .from('user_images')
        .select('id, image_url')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingImages(data || []);
    } catch (err) {
      console.error('Error fetching images:', err);
      toast.error('Failed to load existing images');
    }
  };

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

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !user) {
      setError('Please select an image first');
      return;
    }

    try {
      // Generate a unique file name
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to user_images bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user_images')
        .getPublicUrl(fileName);

      // Store the URL in user_images table
      const { data: imageData, error: dbError } = await supabase
        .from('user_images')
        .insert({
          profile_id: user.id,
          image_url: publicUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Show success toast
      toast.success('Image uploaded successfully!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#070e41',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });

      // Clear preview and selected file
      setPreviewImage(null);
      setSelectedFile(null);

    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload image', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#070e41',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
    }
  };

  const handleExistingImageSelect = (imageUrl: string) => {
    // If clicking the same image, unselect it
    if (selectedExistingImage === imageUrl) {
      setSelectedExistingImage(null);
    } else {
      // Otherwise, select the new image
      setSelectedExistingImage(imageUrl);
      setPreviewImage(null);
      setSelectedFile(null);
    }
  };

  const menuItems = [
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'creations', label: 'My Creations', icon: LayoutGrid },
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
            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Generate Thumbnail</h1>
                <p className="text-white/60">
                  Create stunning thumbnails for your content using AI.
                </p>
              </div>

              {/* Generation Type Selector */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Generation Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Generation type buttons */}
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
              </div>

              {/* Generation Options */}
              {generationType === 'title' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/80">Video Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your prompt"
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
                    
                    {/* Existing Images Section */}
                    {existingImages.length > 0 && (
                      <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-sm font-medium text-white/80 mb-3">Your Uploaded Images</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {existingImages.map((img) => (
                            <div
                              key={img.id}
                              className={cn(
                                "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                                selectedExistingImage === img.image_url
                                  ? "border-blue-500 ring-2 ring-blue-500"
                                  : "border-transparent hover:border-white/20"
                              )}
                              onClick={() => handleExistingImageSelect(img.image_url)}
                            >
                              <img
                                src={img.image_url}
                                alt="User uploaded"
                                className="w-full h-full object-cover"
                              />
                              {selectedExistingImage === img.image_url && (
                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                  <div className="bg-blue-500 rounded-full p-1">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload New Image Section */}
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-4 md:p-8 text-center hover:border-[#3749be] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFileSelect(e.target.files[0]);
                            setSelectedExistingImage(null);
                          }
                        }}
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
                        {previewImage && (
                          <div className="mt-4">
                            <img src={previewImage} alt="Preview" className="max-w-md max-h-64 rounded-lg mx-auto" />
                            <button
                              onClick={handleImageUpload}
                              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                              Upload Image
                            </button>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {generationType === 'youtube' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Video Title Input */}
                      <div>
                        <label className="block text-sm font-medium text-white/80">Video Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter your video title"
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        <p className="mt-1 text-xs text-white/60">
                          This will help generate a more relevant thumbnail
                        </p>
                      </div>

                      {/* YouTube URL Input */}
                      <div>
                        <label className="block text-sm font-medium text-white/80">YouTube URL</label>
                        <input
                          type="text"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="Enter YouTube video URL"
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        {youtubeError && (
                          <div className="flex items-center gap-2 text-red-400 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {youtubeError}
                          </div>
                        )}
                      </div>
                      
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

                        {/* Existing Images Section */}
                        {existingImages.length > 0 && (
                          <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                            <h3 className="text-sm font-medium text-white/80 mb-3">Your Uploaded Photos</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {existingImages.map((img) => (
                                <div
                                  key={img.id}
                                  className={cn(
                                    "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                                    selectedExistingImage === img.image_url
                                      ? "border-blue-500 ring-2 ring-blue-500"
                                      : "border-transparent hover:border-white/20"
                                  )}
                                  onClick={() => handleExistingImageSelect(img.image_url)}
                                >
                                  <img
                                    src={img.image_url}
                                    alt="User uploaded"
                                    className="w-full h-full object-cover"
                                  />
                                  {selectedExistingImage === img.image_url && (
                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                      <div className="bg-blue-500 rounded-full p-1">
                                        <svg
                                          className="w-4 h-4 text-white"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Upload New Photo Section */}
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-[#3749be] transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileSelect(e.target.files[0]);
                                setSelectedExistingImage(null);
                              }
                            }}
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
                            {previewImage && (
                              <div className="mt-4">
                                <img src={previewImage} alt="Preview" className="max-w-xs max-h-64 rounded-lg mx-auto" />
                                <button
                                  onClick={handleImageUpload}
                                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                  Upload Photo
                                </button>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Generation Options */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white/80">Choose Generation Option</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
               <button 
                onClick={handleGenerate}
                disabled={isGenerating || !user}
                className="relative w-full inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 mb-8 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#a2aeff_0%,#3749be_50%,#a2aeff_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full dark:bg-[#070e41] bg-[#ffffff] px-8 py-1 text-sm font-medium dark:text-gray-50 text-black backdrop-blur-3xl">
                  <Zap className="w-5 h-5 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Thumbnails'}
                </span>
              </button>
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Recent Creations */}
            <div className="mt-12 space-y-6">
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
                {userGenerations.slice(0, 4).map((generation) => (
                  <div
                    key={generation.id}
                    className={cn(
                      "group relative rounded-xl overflow-hidden cursor-zoom-in h-full",
                      "bg-white/5 backdrop-blur-sm border border-white/10",
                      "hover:border-[#3749be] hover:shadow-lg hover:shadow-[#3749be]/20",
                      "transition-all duration-300",
                      "aspect-video"
                    )}
                    onClick={() => setZoomedImage({ 
                      url: generation.output_image_url, 
                      title: new Date(generation.created_at).toLocaleDateString() 
                    })}
                  >
                    <img
                      src={generation.output_image_url}
                      alt={`Generated on ${new Date(generation.created_at).toLocaleDateString()}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <p className="text-white text-sm font-medium">
                          {new Date(generation.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-white/60 text-xs">
                          {generation.generation_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Zoom Modal */}
            {zoomedImage && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                onClick={() => setZoomedImage(null)}
              >
                <div 
                  className="relative w-full h-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="relative max-w-full max-h-full flex items-center justify-center"
                  >
                    <img
                      src={zoomedImage.url}
                      alt={zoomedImage.title}
                      className="max-h-[85vh] max-w-[85vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
                      style={{ 
                        minHeight: '200px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)'
                      }}
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(
                            zoomedImage.url,
                            `thumbnail-${zoomedImage.title}.png`
                          );
                        }}
                        className="p-2 rounded-full bg-black/80 text-white/80 hover:text-white hover:bg-black shadow-lg hover:shadow-xl transition-all duration-200 border border-white/10 flex items-center gap-2"
                        title="Download Image"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImage(null);
                        }}
                        className="p-2 rounded-full bg-black/80 text-white/80 hover:text-white hover:bg-black shadow-lg hover:shadow-xl transition-all duration-200 border border-white/10"
                        title="Close"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                      <p className="text-white/90 text-sm bg-black/50 backdrop-blur-sm rounded-full py-2 px-6 shadow-lg border border-white/10">
                        Generated on {zoomedImage.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case 'creations':
        return (
          <MyCreations 
            isLoading={isLoadingGenerations}
            generations={userGenerations}
            onNewThumbnail={() => setActiveSection('create')}
            onZoomImage={setZoomedImage}
            onDownload={handleDownload}
            zoomedImage={zoomedImage}
            onCloseZoom={() => setZoomedImage(null)}
          />
        );
      case 'subscription':
        return (
          <Subscription 
            credits={credits}
            isLoadingCredits={isLoadingGenerations}
            onUpgrade={() => {
              // TODO: Implement upgrade flow
              console.log('Upgrade to pro clicked');
            }}
          />
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

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please sign in to generate thumbnails');
      return;
    }

    if (!selectedRatio) {
      toast.error('Please select an aspect ratio');
      return;
    }

    let requestData: any = {
      userId: user.id,
      aspectRatio: selectedRatio
    };

    // Validate and prepare data based on generation type
    switch (generationType) {
      case 'image':
        if (!imageText) {
          toast.error('Please provide an image description');
          return;
        }
        requestData = {
          ...requestData,
          generationType: 'image_to_thumbnail',
          prompt: imageText,
          referenceImageUrl: selectedExistingImage
        };
        break;

      case 'title':
        if (!title) {
          toast.error('Please enter a title');
          return;
        }
        requestData = {
          ...requestData,
          generationType: 'text_to_thumbnail',
          prompt: title
        };
        break;

      case 'youtube':
        if (!youtubeUrl) {
          toast.error('Please enter a YouTube URL');
          return;
        }
        if (!title) {
          toast.error('Please enter a video title');
          return;
        }
        requestData = {
          ...requestData,
          generationType: 'youtube_to_thumbnail',
          youtubeUrl: youtubeUrl,
          videoTitle: title,
          generationOption,
          referenceImageUrl: selectedExistingImage
        };
        break;

      default:
        toast.error('Invalid generation type');
        return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate-thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate thumbnail');
      }

      // Add the new generation to the list
      setUserGenerations(prev => [data, ...prev]);
      
      // Set the generated image and show popup
      setGeneratedImages([data.output_image_url]);
      setShowGeneratedPopup(true);

      // Clear inputs based on generation type
      switch (generationType) {
        case 'image':
          setImageText('');
          setSelectedExistingImage(null);
          setPreviewImage(null);
          setSelectedFile(null);
          break;
        case 'title':
          setTitle('');
          break;
        case 'youtube':
          setYoutubeUrl('');
          setYoutubePreview(null);
          break;
      }

      // Show success message
      toast.success('Thumbnail generated successfully!');

    } catch (err: any) {
      console.error('Generation error:', err);
      toast.error(err.message || 'Failed to generate thumbnail');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  // Generated Images Popup Component
  const GeneratedImagesPopup = () => {
    if (!showGeneratedPopup || generatedImages.length === 0) return null;

    // Close popup when clicking outside
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        setShowGeneratedPopup(false);
      }
    };

    // Close popup with escape key
    useEffect(() => {
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowGeneratedPopup(false);
        }
      };

      window.addEventListener('keydown', handleEscKey);
      return () => window.removeEventListener('keydown', handleEscKey);
    }, []);

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6"
        onClick={handleBackdropClick}
      >
        <div className="relative max-w-4xl w-full bg-gradient-to-b from-[#0f1729] to-[#070e41] rounded-xl overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Absolute positioned close button for mobile */}
          <button
            onClick={() => setShowGeneratedPopup(false)}
            className="absolute top-2 right-2 z-10 p-2 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all duration-200 md:hidden"
            aria-label="Close popup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="p-4 md:p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Generated Thumbnails
              </h3>
              {/* Desktop close button */}
              <button
                onClick={() => setShowGeneratedPopup(false)}
                className="hidden md:flex text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content - Scrollable */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-grow">
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-1">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Generated thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(imageUrl, `thumbnail-${index + 1}.png`);
                          }}
                          className="px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center space-x-2 transform hover:-translate-y-0.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-white/10 bg-black/20">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <p className="text-sm text-white/60 text-center md:text-left">
                Click the download button to save your thumbnail
              </p>
              <button
                onClick={() => setShowGeneratedPopup(false)}
                className="w-full md:w-auto px-4 py-2 text-sm text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Toaster />
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
              <Gem className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-lg">{credits ?? '...'}</span>
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
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'text-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-blue-400 after:shadow-[0_0_8px_rgba(96,165,250,0.6)]' 
                      : 'text-white/60 hover:text-white/80'
                    }
                    transition-all duration-300 hover:scale-105
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
          <Gem className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-white">{credits ?? '...'}</span>
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
          {renderContent()}
        </div>
      </div>
      <GeneratedImagesPopup />
    </div>
  );
}