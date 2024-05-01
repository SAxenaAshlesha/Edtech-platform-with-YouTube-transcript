// Replace with your YouTube API key
const apiKey = 'AIzaSyCo6fxI-bVN9dlgoZyxISd_zsZ2QPHRDV8';
const videoId = "";

// Function to fetch playlists for a subject
async function fetchPlaylists(subject) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${subject}&type=playlist&key=${apiKey}`);
    const data = await response.json();
    return data.items;
}

// Function to display playlists
async function displayPlaylists(subject) {
    const playlists = await fetchPlaylists(subject);
    const playlistList = document.getElementById('playlist-list');
    playlistList.innerHTML = '';
    playlists.forEach(playlist => {
        const listItem = document.createElement('li');
        listItem.textContent = playlist.snippet.title;
        listItem.addEventListener('click', () => {
            const playlistId = playlist.id.playlistId;
            displayPlaylist(playlistId);
        });
        playlistList.appendChild(listItem);
    });
}

// Function to display YouTube playlist
async function displayPlaylist(playlistId) {
    const player = document.getElementById('youtube-player');
    player.src = `https://www.youtube.com/embed?listType=playlist&list=${playlistId}`;

    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}`);
    const data = await response.json();
    const videos = data.items;

    // Display transcript summary for each video in the playlist
    for (const video of videos) {
        const videoId = video.snippet.resourceId.videoId;
        await fetchTranscript(videoId);
    }
}

// Function to fetch transcript for a video
async function fetchTranscript(videoId) {
    try {
        const response = await fetch(`https://video.google.com/timedtext?lang=en&v=${videoId}`);
        if (response.status === 200) {
            const data = await response.text();
            // Parse transcript XML data
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            // Extract text content of <text> elements
            const texts = Array.from(xmlDoc.getElementsByTagName('text'));
            let transcript = '';
            texts.forEach(textNode => {
                transcript += textNode.textContent + ' ';
            });
            // Display transcript
            const transcriptDiv = document.getElementById('transcript');
            transcriptDiv.innerHTML += `<p><strong>Video ID: ${videoId}</strong><br>${transcript}</p>`;
            console.log(transcript);
        } else {
            throw new Error('Transcript not available');
        }
    } catch (error) {
        console.error(`Error fetching transcript for video ${videoId}:`, error);
        // Display error message
        const transcriptDiv = document.getElementById('transcript');
        transcriptDiv.innerHTML += `<p><strong>Video ID: ${videoId}</strong><br>Transcript not available</p>`;
    }
}

// Initial setup
window.onload = function() {
    const subjects = document.querySelectorAll('.subject');
    subjects.forEach(subject => {
        subject.addEventListener('click', async () => {
            const subjectName = subject.dataset.subject;
            displayPlaylists(subjectName);
        });
    });
};

document.getElementById('feedback-button').addEventListener('click', function() {
    document.getElementById('feedback-form').style.display = 'block';
});
