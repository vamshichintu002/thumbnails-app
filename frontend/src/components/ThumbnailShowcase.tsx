import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

const exampleThumbnails = [
  {
    imageUrl: "https://ujsjwovfdifsdavzwiec.supabase.co/storage/v1/object/public/Image-share//a-dramatic-scene-where-a-massive-asteroi_AQ4wdOHRRTWpYNsThDbLZg_DSGy6Bb2SH2JlsBWZqX2eQ.png",
    title: ""
  },
  {
    imageUrl: "https://ujsjwovfdifsdavzwiec.supabase.co/storage/v1/object/public/Image-share//cZ-BL8xKTYmZf1KZWXEg9w.webp",
    title: ""
  },
  {
    imageUrl: "https://ujsjwovfdifsdavzwiec.supabase.co/storage/v1/object/public/Image-share//a-dramatic-scene-of-an-airplane-engulfed_02mbsP0RRVmPsAWyZuAIsA_4F4FwO_8Q6qinU9m1wL2fg.png",
    title: ""
  },
  {
    imageUrl: "https://ujsjwovfdifsdavzwiec.supabase.co/storage/v1/object/public/Image-share//ftyWrqtESKedrCo0vAlJEA.webp",
    title: ""
  },
  {
    imageUrl: "https://ujsjwovfdifsdavzwiec.supabase.co/storage/v1/object/public/Image-share//a-man-in-a-red-shirt-with-a-surprised-ex_Ua-L-c0DRUKbFgAKktAI_w_AKVpxvFPR7qzDCUEyVFTkA.png",
    title: ""
  }
];

export const ThumbnailShowcase = () => {
  return (
    <section className="w-full py-12 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
        Our Generated Thumbnails
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