import { useState, useEffect } from 'react'
import './App.css'
import { SubjectCard } from './components/SubjectCard'
import { initialSubjects } from './data/sampleData'
import type { Subject, UserVote } from './types'

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [userVotes, setUserVotes] = useState<UserVote[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sessionId = ApiService.getSessionId()

  // Initialize connection and load data
  useEffect(() => {
    let mounted = true

    const initializeApp = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check server connection
        const connected = await ApiService.checkConnection()
        
        if (!connected) {
          // Fallback to localStorage if server is not available
          console.warn('🔴 Server not available, using offline mode')
          loadOfflineData()
          setIsConnected(false)
          return
        }

        setIsConnected(true)
        
        // Initialize socket connection
        ApiService.initializeSocket()
        
        // Load data from server
        const { subjects: serverSubjects } = await ApiService.getSubjects()
        
        if (mounted) {
          setSubjects(serverSubjects || [])
          
          // Load user votes from localStorage for this session
          const savedVotes = localStorage.getItem('userVotes')
          if (savedVotes) {
            setUserVotes(JSON.parse(savedVotes))
          }
        }

        // Set up real-time listeners
        ApiService.onVoteUpdate((data) => {
          if (mounted) {
            setSubjects(data.subjects)
            console.log('📊 Real-time update received:', data)
          }
        })

        ApiService.onDataUpdate((data) => {
          if (mounted) {
            setSubjects(data.subjects)
          }
        })

      } catch (err) {
        console.error('❌ Failed to initialize app:', err)
        if (mounted) {
          setError('Failed to connect to server. Using offline mode.')
          loadOfflineData()
          setIsConnected(false)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    const loadOfflineData = () => {
      const savedSubjects = localStorage.getItem('subjects')
      const savedVotes = localStorage.getItem('userVotes')
      
      setSubjects(savedSubjects ? JSON.parse(savedSubjects) : initialSubjects)
      setUserVotes(savedVotes ? JSON.parse(savedVotes) : [])
    }

    initializeApp()

    return () => {
      mounted = false
      ApiService.removeListeners()
    }
  }, [])

  const handleVote = async (subjectId: string, rating: number) => {
    // Check if user has already voted for this subject locally
    const existingVote = userVotes.find(vote => vote.subjectId === subjectId)
    
    if (existingVote) {
      console.log('⚠️ User has already voted for this subject')
      return
    }

    try {
      if (isConnected) {
        // Submit vote to server
        const result = await ApiService.submitVote(subjectId, rating, sessionId)
        
        // Update local user votes
        const newUserVote = {
          subjectId,
          rating,
          timestamp: new Date().toISOString()
        }
        
        const newUserVotes = [...userVotes, newUserVote]
        setUserVotes(newUserVotes)
        
        // Save to localStorage as backup
        localStorage.setItem('userVotes', JSON.stringify(newUserVotes))
        
        console.log('✅ Vote submitted successfully:', result)
        
      } else {
        // Offline mode - use localStorage
        const updatedSubjects = subjects.map(subject => {
          if (subject.id === subjectId) {
            const newTotalRating = subject.rating * subject.votes + rating
            const newVotes = subject.votes + 1
            const newRating = newTotalRating / newVotes
            
            console.log(`📊 Offline vote recorded for ${subject.name}:`, {
              previousRating: subject.rating,
              newRating: newRating,
              previousVotes: subject.votes,
              newVotes: newVotes,
              userRating: rating
            })
            
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
        const newUserVotes = [...userVotes, newUserVote]
        setUserVotes(newUserVotes)
        
        // Save to localStorage
        localStorage.setItem('subjects', JSON.stringify(updatedSubjects))
        localStorage.setItem('userVotes', JSON.stringify(newUserVotes))
        
        console.log('� Vote saved offline')
      }
    } catch (error: any) {
      console.error('❌ Error submitting vote:', error)
      alert(error.message || 'Failed to submit vote. Please try again.')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-800 flex flex-col justify-center items-center py-16 px-4 sm:px-6" style={{backgroundSize: '300% 300%', animation: 'gradientAnimation 15s ease infinite'}}>
        <div className="w-full max-w-6xl backdrop-blur-md bg-white/10 rounded-3xl shadow-2xl sm:p-10 border border-white/20 glass-effect">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 sm:text-6xl lg:text-7xl mb-4">
              Subject Coolness Meter
            </h1>
            <p className="mt-6 text-2xl font-light text-white/80 max-w-2xl mx-auto">
              How <span className="font-semibold italic">cool</span> are these university subjects? Cast your vote!
            </p>
            {/* Hidden developer hint */}
            <p className="text-xs text-white/30 mt-2 opacity-20">
              v1.0
            </p>
            
            {/* Connection Status */}
            <div className="mt-4 flex justify-center">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isLoading 
                  ? 'bg-yellow-600/20 text-yellow-300'
                  : isConnected 
                    ? 'bg-green-600/20 text-green-300'
                    : 'bg-orange-600/20 text-orange-300'
              }`}>
                {isLoading 
                  ? '🔄 Connecting...' 
                  : isConnected 
                    ? '🟢 Live Server Connected'
                    : '🟡 Offline Mode'
                }
              </div>
            </div>
            
            {error && (
              <p className="text-red-400 text-sm mt-2">
                {error}
              </p>
            )}
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
      
      {/* Simple Admin Panel - Only show export when there are votes */}
      {subjects.some(s => s.votes > 0) && (
        <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white border border-white/20">
          <h3 className="text-sm font-bold mb-3 text-green-400">📊 Admin Export</h3>
          <button
            onClick={() => window.open(`${ApiService.getBaseUrl()}/api/admin/export/csv`, '_blank')}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors mb-2"
          >
            📄 Export CSV
          </button>
          <button
            onClick={() => window.open(`${ApiService.getBaseUrl()}/api/admin/export/json`, '_blank')}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
          >
            💾 Export JSON
          </button>
        </div>
      )}
    </>
  )
}

export default App
