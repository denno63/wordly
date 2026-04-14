
  // DOM elements
  const searchBtn = document.getElementById('search-btn');
  const wordInput = document.getElementById('word-input');
  const resultsDiv = document.getElementById('results');

  // Function to clear previous results and show loading
  function showLoading() {
    resultsDiv.innerHTML = '<div class="result-card" style="text-align:center;">🔎 Searching...</div>';
  }

  // Function to display error message
  function showError(message) {
    resultsDiv.innerHTML = `<div class="error">⚠️ ${message}</div>`;
  }

  // Function to display the word data
  function displayWordData(data, searchedWord) {
    // data is an array of entries (one per meaning group)
    if (!data || data.length === 0) {
      showError(`No definitions found for "${searchedWord}".`);
      return;
    }

    const firstEntry = data[0];  // main entry
    const word = firstEntry.word || searchedWord;
    const phonetic = firstEntry.phonetic || '';
    const phoneticsArray = firstEntry.phonetics || [];
    // find audio URL if any
    let audioUrl = '';
    for (let ph of phoneticsArray) {
      if (ph.audio) {
        audioUrl = ph.audio;
        break;
      }
    }

    // Build HTML
    let html = `<div class="result-card">
                  <div class="word-title">${word}</div>`;

    if (phonetic) {
      html += `<div class="pronunciation">/${phonetic}/</div>`;
    }
    if (audioUrl) {
      html += `<button class="audio-btn" id="play-audio">🔊 Listen Pronunciation</button>`;
    }

    // Loop through meanings (definitions, synonyms, examples)
    const meanings = firstEntry.meanings || [];
    meanings.forEach(meaning => {
      const partOfSpeech = meaning.partOfSpeech || '';
      const definitions = meaning.definitions || [];
      definitions.forEach(def => {
        html += `<div class="definition">
                    <div class="part-of-speech">${partOfSpeech}</div>
                    <div>📘 ${def.definition}</div>`;
        if (def.example) {
          html += `<div class="example">💬 "${def.example}"</div>`;
        }
        if (def.synonyms && def.synonyms.length > 0) {
          html += `<div class="synonyms"><strong>Synonyms:</strong> `;
          def.synonyms.forEach(syn => {
            html += `<span class="synonym-badge">${syn}</span>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
      });
    });

    html += `</div>`;
    resultsDiv.innerHTML = html;

    // Attach audio event if audio button exists
    if (audioUrl) {
      const audioBtn = document.getElementById('play-audio');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          const audio = new Audio(audioUrl);
          audio.play().catch(e => console.log("Audio play failed:", e));
        });
      }
    }
  }

  // Main fetch function using async/await
  async function fetchWordDefinition(word) {
    if (!word.trim()) {
      showError("Please enter a word.");
      return;
    }
    showLoading();
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Word "${word}" not found.`);
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      }
      const data = await response.json();
      displayWordData(data, word);
    } catch (error) {
      showError(error.message);
      console.error("Fetch error:", error);
    }
  }

  // Event listener for search button
  searchBtn.addEventListener('click', () => {
    fetchWordDefinition(wordInput.value);
  });

  // Allow pressing Enter key in input field
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchWordDefinition(wordInput.value);
    }
  });