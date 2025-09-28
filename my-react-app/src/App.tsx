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
    const newUserVote = { 
      subjectId, 
      rating,
      timestamp: new Date().toISOString()
    }
    setUserVotes([...userVotes, newUserVote])
  }

  // Export functions
  const exportToCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    
    // Create CSV content for subjects data
    let csvContent = 'Subject Name,Average Rating,Total Votes,Rating Percentage\n'
    
    subjects.forEach(subject => {
      const ratingPercentage = subject.votes > 0 ? ((subject.rating / 5) * 100).toFixed(1) : '0'
      csvContent += `"${subject.name}",${subject.rating.toFixed(2)},${subject.votes},${ratingPercentage}%\n`
    })
    
    // Add user votes section with timestamps
    csvContent += '\n\nDetailed User Votes:\n'
    csvContent += 'Subject Name,User Rating,Vote Date,Vote Time\n'
    
    userVotes.forEach(vote => {
      const subject = subjects.find(s => s.id === vote.subjectId)
      if (subject && vote.timestamp) {
        const voteDate = new Date(vote.timestamp)
        const dateStr = voteDate.toLocaleDateString()
        const timeStr = voteDate.toLocaleTimeString()
        csvContent += `"${subject.name}",${vote.rating},"${dateStr}","${timeStr}"\n`
      } else if (subject) {
        csvContent += `"${subject.name}",${vote.rating},"No timestamp","No timestamp"\n`
      }
    })
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `voting_results_${timestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    const timestamp = new Date().toISOString()
    
    const exportData = {
      exportDate: timestamp,
      summary: {
        totalSubjects: subjects.length,
        totalVotes: subjects.reduce((sum, subject) => sum + subject.votes, 0),
        totalUserVotes: userVotes.length
      },
      subjects: subjects,
      userVotes: userVotes,
      statistics: subjects.map(subject => ({
        name: subject.name,
        averageRating: subject.rating,
        totalVotes: subject.votes,
        ratingPercentage: subject.votes > 0 ? ((subject.rating / 5) * 100) : 0
      }))
    }
    
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `voting_data_${timestamp.split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalVotes = subjects.reduce((sum, subject) => sum + subject.votes, 0)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-800 flex flex-col justify-center items-center py-16 px-4 sm:px-6 gradient-animation">
        <div className="w-full max-w-6xl backdrop-blur-md bg-white/10 rounded-3xl shadow-2xl sm:p-10 border border-white/20 glass-effect">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 sm:text-6xl lg:text-7xl mb-4">
              Subject Coolness Meter
            </h1>
            <p className="mt-6 text-2xl font-light text-white/80 max-w-2xl mx-auto">
              How <span className="font-semibold italic">cool</span> are these university subjects? Cast your vote!
            </p>
            <p className="text-xs text-white/30 mt-2 opacity-20">
              v1.0 - Simple Edition
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
      
      {/* Simple Admin Export Panel - Only show when there are votes */}
      {totalVotes > 0 && (
        <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white border border-white/20">
          <h3 className="text-sm font-bold mb-3 text-green-400">📊 Export Data</h3>
          <div className="space-y-2">
            <button
              onClick={exportToCSV}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors"
            >
              📄 Download CSV
            </button>
            <button
              onClick={exportToJSON}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
            >
              💾 Download JSON
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {totalVotes} total votes
          </p>
        </div>
      )}
    </>
  )
}

export default App