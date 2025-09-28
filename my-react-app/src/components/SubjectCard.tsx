import { useState, useEffect } from 'react';
import type { Subject, UserVote } from '../types';
import { StarRating } from './StarRating';

interface SubjectCardProps {
  subject: Subject;
  onVote: (subjectId: string, rating: number) => void;
  userVotes: UserVote[];
}

export const SubjectCard = ({ subject, onVote, userVotes }: SubjectCardProps) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  
  // Calculate rating percentage (out of 100)
  const ratingPercentage = subject.votes > 0 
    ? Math.round((subject.rating / 5) * 100) 
    : 0;
  
  useEffect(() => {
    const existingVote = userVotes.find(vote => vote.subjectId === subject.id);
    if (existingVote) {
      setHasVoted(true);
      setUserRating(existingVote.rating);
    }
  }, [subject.id, userVotes]);

  const handleRatingChange = (rating: number) => {
    onVote(subject.id, rating);
  };

  return (
    <div className="backdrop-blur-md bg-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-white/30 flex flex-col relative group floating-element">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Rating percentage display as circular indicator */}
      <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30 z-10">
        <div className="text-white font-bold">
          {ratingPercentage}%
        </div>
      </div>
      
      <div className="p-6 relative z-0 flex-grow">
        <div className="flex items-center justify-center gap-3 mb-4">
          {subject.image && (
            <span className="text-4xl" role="img" aria-label={subject.name}>
              {subject.image}
            </span>
          )}
          <h3 className="text-2xl font-bold text-white text-center">{subject.name}</h3>
        </div>
        
        {subject.description && (
          <p className="text-sm text-white/80 text-center mb-4 italic">
            {subject.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm font-medium text-white/70">
            Coolness factor
          </div>
          <div className="text-sm text-white/70">
            {subject.votes} {subject.votes === 1 ? 'vote' : 'votes'}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex flex-col gap-3 items-center">
            <p className="text-sm text-white/80 font-medium">
              {hasVoted ? `Your rating: ${userRating}/5` : 'Rate this subject:'}
            </p>
            <StarRating
              initialRating={userRating}
              onRatingChange={handleRatingChange}
              disabled={hasVoted}
            />
            {hasVoted && (
              <p className="text-xs text-white/60 mt-2 italic text-center">
                You've already voted for this subject
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar for the rating - more visually appealing */}
      <div className="w-full h-3 bg-black/20">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 relative"
          style={{ width: `${ratingPercentage}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30"></div>
        </div>
      </div>
    </div>
  );
};