import React from 'react';
import Squares from './Squares';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Vimeo from '@vimeo/player';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function Hero() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const options = ['Your own face', 'Title to Thumbnail', 'Thumbnail to Thumbnail'];

  // Show launch offer toast
  useEffect(() => {
    // Small delay to ensure component is mounted
    const showToast = () => {
      const toastId = toast(
        <div className="flex flex-col gap-3 min-w-[300px]">
          {/* Header */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 text-lg font-semibold">
              <span className="text-xl">🎉</span>
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                LAUNCH OFFER!
              </span>
            </div>
            <p className="text-sm text-gray-100/90 mt-1">
              50% OFF on all plans
            </p>
          </div>

          {/* Coupon Section */}
          <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-500/10 rounded-md">
                <svg className="w-4 h-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.91 8.84 8.56 21.16a4.25 4.25 0 0 1-6.29-5.72L14.84 2.84a4.25 4.25 0 0 1 6.29 5.72"></path>
                  <path d="M6 19 2 23"></path>
                  <path d="m2 6 20 12"></path>
                </svg>
              </div>
              <code className="text-base font-mono font-bold text-indigo-300 tracking-wide">
                WELCOME50
              </code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('WELCOME50');
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.9, x: 0.9 },
                  colors: ['#818CF8', '#C7D2FE', '#E0E7FF']
                });
                toast.dismiss(toastId);
                toast.message('Code WELCOME50 copied to clipboard!', {
                  duration: 2000,
                  icon: '✨',
                  style: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    color: '#4ade80'
                  }
                });
              }}
              className="px-3.5 py-2 text-xs font-medium bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-md transition-colors flex items-center gap-1.5"
            >
              Copy
              <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            </button>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-400/90">
              Starting at just <span className="text-indigo-400 font-semibold">$5</span>
            </p>
          </div>
        </div>,
        {
          duration: 0,
          className: 'bg-gray-900/95 backdrop-blur-md border border-white/10 p-4 shadow-xl',
        }
      );
    };

    // Show toast after a short delay
    const timer = setTimeout(showToast, 1500);
    return () => clearTimeout(timer);
  }, []); // Only run once when component mounts

  useEffect(() => {
    const baseText = 'Generate Thumbnails using ';
    let currentText = baseText;
    let charIndex = 0;
    
    if (isTyping) {
      const typingInterval = setInterval(() => {
        if (charIndex < options[currentOptionIndex].length) {
          currentText += options[currentOptionIndex][charIndex];
          setDisplayText(currentText);
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setIsTyping(false);
          }, 1500);
        }
      }, 100);
      
      return () => clearInterval(typingInterval);
    } else {
      const deletingInterval = setInterval(() => {
        if (currentText.length > baseText.length) {
          currentText = currentText.slice(0, -1);
          setDisplayText(currentText);
        } else {
          clearInterval(deletingInterval);
          setCurrentOptionIndex((prev) => (prev + 1) % options.length);
          setIsTyping(true);
        }
      }, 50);
      
      return () => clearInterval(deletingInterval);
    }
  }, [currentOptionIndex, isTyping]);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
      {/* Animated Squares Background */}
      <div className="absolute inset-0 overflow-hidden">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='rgba(59, 130, 246, 0.1)'
          hoverFillColor='rgba(59, 130, 246, 0.1)'
        />
      </div>
    <div className="relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 font-medium text-sm mb-8 mt-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Top-Ranked in AI Thumbnails
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-8 mt-6">
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  Viral Thumbnails
                </span>
                <br />
                <span className="drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  in Seconds
                </span>
              </h1>
              
              <p className="text-lg mb-10 mt-6 max-w-lg relative">
                <span className="text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  {displayText}
                  <span className="inline-block w-0.5 h-5 ml-0.5 bg-white animate-[blink_1s_infinite] align-middle">
                    &nbsp;
                  </span>
                </span>
              </p>
              
              <div className="flex flex-wrap gap-3 mb-10 lg:mb-14 lg:gap-4 mt-8">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base bg-blue-600 hover:bg-blue-700 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25"
                >
                  Try for Free
                  <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400 -mt-6 mb-10">No credit card required</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-6">
                <span>Trusted by</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">53,948</span>
                  <span>Users</span>
                </div>
              </div>
            </div>

            {/* Right Column - Video */}
            <div className="relative mt-8 lg:mt-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl group w-full">
              <div className="relative w-full aspect-video">
                <iframe
                  src="https://player.vimeo.com/video/1059410338?background=1&autoplay=1&loop=1&byline=0&title=0&controls=1&transparent=0&dnt=1"
                  className="absolute inset-0 w-full h-full video-player-iframe"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  title="Promotional Video"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-end gap-4 p-4 opacity-0 group-hover:opacity-100">
                  <button 
                    className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    onClick={() => {
                      const iframe = document.querySelector('iframe');
                      if (iframe) {
                        const player = new Vimeo(iframe);
                        player.getMuted().then((muted: boolean) => {
                          player.setMuted(!muted);
                        }).catch((error: Error) => {
                          console.error('Error toggling mute:', error);
                        });
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                  </button>
                  <button 
                    className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    onClick={() => {
                      const iframe = document.querySelector('.video-player-iframe');
                      if (iframe) {
                        try {
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else {
                            if (iframe.requestFullscreen) {
                              iframe.requestFullscreen();
                            } else if (iframe.webkitRequestFullscreen) {
                              iframe.webkitRequestFullscreen();
                            } else if (iframe.mozRequestFullScreen) {
                              iframe.mozRequestFullScreen();
                            } else if (iframe.msRequestFullscreen) {
                              iframe.msRequestFullscreen();
                            }
                          }
                        } catch (error) {
                          console.error('Error toggling fullscreen:', error);
                        }
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                      <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                      <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
                      <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}