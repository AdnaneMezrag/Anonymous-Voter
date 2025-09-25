import { useState, useEffect } from 'react'
import './App.css'
import { SubjectCard } from './components/SubjectCard'
import { initialSubjects } from './data/sampleData'
import type { Subject, UserVote } from './types'

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [userVotes, setUserVotes] = useState<UserVote[]>([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem('subjects')
    const savedVotes = localStorage.getItem('userVotes')
    
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects))
    } else {
      setSubjects(initialSubjects)
    }
    
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (subjects.length > 0) {
      localStorage.setItem('subjects', JSON.stringify(subjects))
    }
    
    if (userVotes.length > 0) {
      localStorage.setItem('userVotes', JSON.stringify(userVotes))
    }
  }, [subjects, userVotes])

  const handleVote = (subjectId: string, rating: number) => {
    // Check if user has already voted for this subject
    const existingVote = userVotes.find(vote => vote.subjectId === subjectId)
    
    if (existingVote) {
      return // User has already voted for this subject
    }
    
    // Update subjects with the new vote
    const updatedSubjects = subjects.map(subject => {
      if (subject.id === subjectId) {
        const newTotalRating = subject.rating * subject.votes + rating
        const newVotes = subject.votes + 1
        const newRating = newTotalRating / newVotes
        
        return {
          ...subject,
          rating: newRating,
          votes: newVotes
        }
      }
      return subject
    })
    
    setSubjects(updatedSubjects)
    
    // Record the user's vote
    const newUserVote = { subjectId, rating }
    setUserVotes([...userVotes, newUserVote])
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-800 flex flex-col justify-center items-center py-16 px-4 sm:px-6" style={{backgroundSize: '300% 300%', animation: 'gradientAnimation 15s ease infinite'}}>
      <div className="w-full max-w-6xl backdrop-blur-md bg-white/10 rounded-3xl shadow-2xl sm:p-10 border border-white/20 glass-effect">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 sm:text-6xl lg:text-7xl mb-4">
            Subject Coolness Meter
          </h1>
          <p className="mt-6 text-2xl font-light text-white/80 max-w-2xl mx-auto">
            How <span className="font-semibold italic">cool</span> are these university subjects? Cast your vote!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onVote={handleVote}
              userVotes={userVotes}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
