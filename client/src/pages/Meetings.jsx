import { useEffect, useState } from 'react';
import { meetingsAPI } from '../api/meetings';
import { tasksAPI } from '../api/tasks';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Meetings = () => {
  const { theme } = useTheme();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    participants: '',
    description: '',
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await meetingsAPI.getMeetings();
      setMeetings(response.data.meetings || []);
    } catch (error) {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    
    if (!newMeeting.title.trim()) {
      toast.error('Please provide a meeting title');
      return;
    }

    try {
      if (useAI) {
        // Create meeting with AI-generated description
        setGeneratingDescription(true);
        toast.loading('AI is generating meeting description...');
        
        await meetingsAPI.createMeetingWithAI({
          title: newMeeting.title,
          participants: newMeeting.participants
            .split(',')
            .map(p => p.trim())
            .filter(p => p),
        });
        
        toast.dismiss();
        toast.success('Meeting created with AI-generated description!');
      } else {
        // Create meeting with manual description
        await meetingsAPI.createMeeting({
          title: newMeeting.title,
          participants: newMeeting.participants
            .split(',')
            .map(p => p.trim())
            .filter(p => p),
          summary: newMeeting.description,
        });
        
        toast.success('Meeting created successfully!');
      }
      
      setNewMeeting({ title: '', participants: '', description: '' });
      fetchMeetings();
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Failed to create meeting');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleConvertActionItem = async (meetingId, actionItemId) => {
    try {
      await meetingsAPI.convertActionItemToTask(meetingId, actionItemId);
      toast.success('Action item converted to task!');
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to convert action item');
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;

    try {
      await meetingsAPI.deleteMeeting(id);
      toast.success('Meeting deleted!');
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading meetings...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Meetings
        </h1>
        <p
          className={`mt-1 text-sm sm:text-base ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Record and transcribe your meetings
        </p>
      </div>

      {/* Create Meeting */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Create New Meeting</h2>
          {useAI && (
            <span className="px-2 py-1 bg-primary-600 text-white rounded text-xs font-medium w-fit">
              🤖 AI-Generated Description
            </span>
          )}
        </div>
        
        {/* Toggle between AI and Manual */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setUseAI(true)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              useAI
                ? 'bg-primary-600 text-white font-medium'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🤖 Use AI
          </button>
          <button
            type="button"
            onClick={() => setUseAI(false)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !useAI
                ? 'bg-primary-600 text-white font-medium'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✍️ Write Manually
          </button>
        </div>

        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {useAI 
            ? 'Just provide a meeting title and AI will automatically generate a detailed description, agenda, and key points.'
            : 'Write your own meeting description and details.'}
        </p>
        
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Meeting Title
            </label>
            <input
              type="text"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              className="input-field"
              placeholder="e.g., Q1 Budget Review Meeting"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Participants (comma-separated)
            </label>
            <input
              type="text"
              value={newMeeting.participants}
              onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
              className="input-field"
              placeholder="John Doe, Jane Smith"
            />
          </div>
          
          {!useAI && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Enter meeting description, agenda, and notes..."
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={generatingDescription}
          >
            {generatingDescription ? '🤖 Generating...' : useAI ? 'Create Meeting with AI' : 'Create Meeting'}
          </button>
        </form>
      </div>

      {/* Meetings List */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Meetings</h2>
        {meetings.length === 0 ? (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No meetings yet. Create one above!</p>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{meeting.title}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(meeting.date).toLocaleDateString()}
                    </p>
                    {meeting.participants && meeting.participants.length > 0 && (
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Participants: {meeting.participants.join(', ')}
                      </p>
                    )}
                    {meeting.summary && (
                      <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {meeting.summary.length > 180 ? `${meeting.summary.slice(0, 180)}…` : meeting.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMeeting(selectedMeeting?._id === meeting._id ? null : meeting)}
                      className="text-sm btn-secondary"
                    >
                      {selectedMeeting?._id === meeting._id ? 'Hide Details' : 'View Details'}
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Meeting Details */}
                {selectedMeeting?._id === meeting._id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {meeting.summary && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {meeting.isAIGenerated ? '🤖 AI-Generated Description' : '📝 Meeting Description'}
                          </h4>
                          {meeting.isAIGenerated && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                              GPT-4 Generated
                            </span>
                          )}
                        </div>
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {meeting.summary}
                        </p>
                      </div>
                    )}
                    {!meeting.summary && (
                      <div className={`p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>No description available for this meeting.</p>
                      </div>
                    )}
                    {meeting.keyPoints && meeting.keyPoints.length > 0 && (
                      <div>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Meeting Agenda & Key Points</h4>
                        <ul className={`list-disc list-inside text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {meeting.keyPoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {meeting.actionItems && meeting.actionItems.length > 0 && (
                      <div>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Suggested Action Items</h4>
                        <div className="space-y-2">
                          {meeting.actionItems.map((item) => (
                            <div
                              key={item._id}
                              className={`flex items-center justify-between p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                            >
                              <div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{item.description}</p>
                                {item.assignedTo && (
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Assigned to: {item.assignedTo}
                                  </p>
                                )}
                              </div>
                              {!item.convertedToTask && (
                                <button
                                  onClick={() => handleConvertActionItem(meeting._id, item._id)}
                                  className="text-xs btn-primary"
                                >
                                  Convert to Task
                                </button>
                              )}
                              {item.convertedToTask && (
                                <span className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>✓ Converted to Task</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meetings;

