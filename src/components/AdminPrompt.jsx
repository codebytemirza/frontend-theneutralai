import React, { useState, useEffect } from 'react';
import './AdminPrompt.css';
import { apiService } from '@/lib/api-service';

const AdminPrompt = () => {
    const [prompt, setPrompt] = useState('');
    const [savedPrompt, setSavedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        fetchCurrentPrompt();
    }, []);

    const fetchCurrentPrompt = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.getPrompt();
            setSavedPrompt(data.prompt);
            setPrompt(data.prompt);
        } catch (error) {
            console.error('Detailed error:', error);
            setError('Failed to load current prompt. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
        setIsDirty(true);
    };

    const handleSavePrompt = async () => {
        if (!prompt.trim()) {
            alert('Prompt cannot be empty');
            return;
        }

        if (!window.confirm('Are you sure you want to update the system prompt?')) {
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const data = await apiService.updatePrompt(prompt.trim());
            if (data.status === 'success') {
                setSavedPrompt(prompt);
                setIsDirty(false);
                alert('Prompt saved successfully!');
            }
        } catch (error) {
            console.error('Save error details:', error);
            setError('Failed to save prompt. Please try again later.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="admin-prompt-container loading">Loading...</div>;
    }

    return (
        <div className="admin-prompt-container">
            <h2>Manage System Prompt</h2>
            
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            <div className="current-prompt">
                <h3>Current Prompt:</h3>
                <p>{savedPrompt || 'No prompt saved'}</p>
            </div>

            <div className="prompt-editor">
                <h3>Edit Prompt:</h3>
                <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    rows="6"
                    cols="50"
                    disabled={isSaving}
                    placeholder="Enter system prompt here..."
                />
                <div className="button-container">
                    <button 
                        onClick={handleSavePrompt}
                        disabled={isSaving || !isDirty}
                        className={`save-button ${isSaving ? 'saving' : ''}`}
                    >
                        {isSaving ? 'Saving...' : 'Save Prompt'}
                    </button>
                    {isDirty && (
                        <button 
                            onClick={() => {
                                setPrompt(savedPrompt);
                                setIsDirty(false);
                            }}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPrompt;
