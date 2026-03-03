import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const ChatInput = ({ onSend, placeholder = "Type a message..." }) => {
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [attachment, setAttachment] = useState(null); // { type: 'image' | 'audio', url: string, file: File }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() || attachment) {
            onSend(text, attachment);
            setText('');
            setAttachment(null);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAttachment({ type: 'image', url, file });
        }
    };

    const { openModal } = useData();

    const handleAudioClick = () => {
        // Mock audio recording
        const mockAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Placeholder
        setAttachment({ type: 'audio', url: mockAudioUrl });
        openModal({
            title: "Audio Recorded",
            message: "Mock audio has been recorded and attached.",
            type: 'info'
        });
    };

    const addEmoji = (emoji) => {
        setText(prev => prev + emoji);
        setShowEmoji(false);
    };

    return (
        <div style={{ padding: '12px 16px', background: 'transparent' }}>
            {attachment && (
                <div className="fade-in" style={{ padding: '16px', background: 'var(--bg-blueprint)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    {attachment.type === 'image' && <img src={attachment.url} alt="Attachment" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '12px' }} />}
                    {attachment.type === 'audio' && <span className="material-icons" style={{ color: 'var(--primary)' }}>mic</span>}
                    <span style={{ fontSize: '0.875rem', flex: 1, fontWeight: '600', color: 'var(--text-main)' }}>{attachment.type === 'image' ? 'Image Attached' : 'Audio Recorded'}</span>
                    <button onClick={() => setAttachment(null)} style={{ border: 'none', background: 'var(--bg-app)', color: 'var(--error)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
            )}

            {showEmoji && (
                <div className="fade-in" style={{
                    position: 'absolute', bottom: '100%', left: '24px', marginBottom: '16px',
                    background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', padding: '16px',
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    borderRadius: '24px',
                    zIndex: 10
                }}>
                    {['😀', '😂', '🤔', '👍', '🔥', '🎉', '❤️', '👀', '🚀', '💯'].map(e => (
                        <button
                            key={e}
                            onClick={() => addEmoji(e)}
                            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'var(--transition-smooth)' }}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={handleAudioClick} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', boxShadow: 'var(--shadow-soft)' }}>
                        <span className="material-icons" style={{ fontSize: '1.25rem' }}>mic</span>
                    </button>
                    <button type="button" onClick={() => document.getElementById('img-upload').click()} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', boxShadow: 'var(--shadow-soft)' }}>
                        <span className="material-icons" style={{ fontSize: '1.25rem' }}>image</span>
                    </button>
                </div>

                <input type="file" id="img-upload" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />

                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            flex: 1,
                            padding: '16px 24px',
                            paddingRight: '56px',
                            border: '1px solid var(--border)',
                            background: 'white',
                            fontWeight: '500',
                            fontSize: '1rem',
                            borderRadius: '32px',
                            color: 'var(--text-main)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    />
                    <button type="button" onClick={() => setShowEmoji(!showEmoji)} style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
                        <span className="material-icons" style={{ fontSize: '1.5rem' }}>sentiment_satisfied_alt</span>
                    </button>
                </div>

                <button type="submit" style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 20px rgba(45, 48, 71, 0.2)',
                    transition: 'var(--transition-smooth)'
                }}>
                    <span className="material-icons">send</span>
                </button>
            </form>
        </div>
    );
};

export default ChatInput; // Ensure default export
