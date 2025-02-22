import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

const exampleThumbnails = [
  {
    imageUrl: "https://picsum.photos/640/360?random=1",
    title: "Create Engaging YouTube Thumbnails"
  },
  {
    imageUrl: "https://picsum.photos/640/360?random=2",
    title: "AI-Powered Thumbnail Generation"
  },
  {
    imageUrl: "https://picsum.photos/640/360?random=3",
    title: "Stand Out From The Crowd"
  },
  {
    imageUrl: "https://picsum.photos/640/360?random=4",
    title: "Professional Quality Designs"
  },
  {
    imageUrl: "https://picsum.photos/640/360?random=5",
    title: "Boost Your Channel Growth"
  }
];

export const ThumbnailShowcase = () => {
  return (
    <section className="w-full py-12 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          AI-Generated Thumbnails That Convert
        </h2>
        <InfiniteMovingCards
          items={exampleThumbnails}
          direction="right"
          speed="slow"
          pauseOnHover={true}
        />
      </div>
    </section>
  );
};