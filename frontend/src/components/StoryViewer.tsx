import { useState, useEffect, useCallback } from "react";
import { StoryGroup } from "../types";
import { CloseIcon } from "./Icons";

interface Props {
  stories: StoryGroup[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: Props) {
  const [groupIdx, setGroupIdx] = useState(initialIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const group = stories[groupIdx];
  const currentStory = group?.stories[storyIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0;
        return p + 1;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [groupIdx, storyIdx]);

  useEffect(() => {
    if (progress >= 100) {
      if (storyIdx < (group?.stories.length || 1) - 1) {
        setStoryIdx((i) => i + 1);
        setProgress(0);
      } else if (groupIdx < stories.length - 1) {
        setGroupIdx((i) => i + 1);
        setStoryIdx(0);
        setProgress(0);
      } else {
        onClose();
      }
    }
  }, [progress, storyIdx, groupIdx, group, stories, onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const goPrev = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx((i) => i - 1);
      setProgress(0);
    } else if (groupIdx > 0) {
      setGroupIdx((i) => i - 1);
      setStoryIdx(stories[groupIdx - 1]?.stories.length - 1 || 0);
      setProgress(0);
    }
  }, [storyIdx, groupIdx, stories]);

  const goNext = useCallback(() => {
    if (storyIdx < (group?.stories.length || 1) - 1) {
      setStoryIdx((i) => i + 1);
      setProgress(0);
    } else if (groupIdx < stories.length - 1) {
      setGroupIdx((i) => i + 1);
      setStoryIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIdx, groupIdx, group, stories, onClose]);

  if (!group || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black" onClick={onClose}>
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-75"
              style={{
                width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-3 left-0 right-0 z-10 flex items-center gap-3 px-4">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
          {group.user.displayName?.[0] || group.user.username[0]}
        </div>
        <span className="text-white text-sm font-semibold">{group.user.displayName || group.user.username}</span>
        <button onClick={onClose} className="ml-auto text-white/70 hover:text-white">
          <CloseIcon size={22} />
        </button>
      </div>

      {/* Image */}
      <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={currentStory.imageUrl}
          alt=""
          className="max-w-full max-h-full object-contain"
          onClick={goNext}
        />
        {currentStory.caption && (
          <div className="absolute bottom-20 left-0 right-0 text-center px-8">
            <p className="text-white/80 text-sm bg-black/30 rounded-full py-2 px-4 inline-block backdrop-blur-sm">
              {currentStory.caption}
            </p>
          </div>
        )}
      </div>

      {/* Tap zones */}
      <div className="absolute inset-0 flex" onClick={(e) => e.stopPropagation()}>
        <div className="w-1/3 h-full" onClick={goPrev} />
        <div className="w-1/3 h-full" onClick={goNext} />
        <div className="w-1/3 h-full" onClick={goNext} />
      </div>
    </div>
  );
}
