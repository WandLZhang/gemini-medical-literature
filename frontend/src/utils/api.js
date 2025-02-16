// src/utils/api.js

export const retrieveAndAnalyzeArticles = async (disease, events, methodologyContent, onProgress) => {
  try {
    // Step 1: Get PMIDs and analysis from first cloud function
    const response = await fetch(`${API_BASE_URL}/capricorn-retrieve-full-articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events_text: events.join('\n'),
        methodology_content: methodologyContent,
        disease: disease
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let pmids = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // Add new chunk to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      let lineEnd = buffer.indexOf('\n');
      while (lineEnd !== -1) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (!line) continue;

        try {
          const data = JSON.parse(line);
          
          // Validate and process the data
          if (data && typeof data === 'object' && data.type) {
            onProgress(data);
            
            if (data.type === 'pmids' && data.data && Array.isArray(data.data.pmids)) {
              pmids = data.data.pmids;
            }
          }
        } catch (parseError) {
          console.error('Error parsing line:', line);
          console.error('Parse error:', parseError);
        }

        lineEnd = buffer.indexOf('\n');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const API_BASE_URL = 'https://us-central1-gemini-med-lit-review.cloudfunctions.net';
const GENERATE_CASE_URL = process.env.REACT_APP_GENERATE_CASE_URL;

export const extractDisease = async (text) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pubmed-search-tester-extract-disease`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return data.trim();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const extractEvents = async (text, promptContent) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pubmed-search-tester-extract-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: `${promptContent}\n\nCase input:\n${text}` }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return data.split('"').filter(event => event.trim() && event !== ' ');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

/**
 * Fetches documents based on the given query and template
 * @param {string} query - The search query
 * @param {string} template - The template content
 * @returns {Promise<Array>} - A promise that resolves to an array of document objects
 */
export const fetchDocuments = async (query, template) => {
  try {
    const response = await fetch(`${API_BASE_URL}?query=${encodeURIComponent(query)}&type=documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, template }),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(JSON.stringify(errorData) || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error; // Throw the original error object
  }
};

/**
 * Fetches analysis based on the given query and template
 * @param {string} query - The search query
 * @param {string} template - The template content
 * @returns {Promise<string>} - A promise that resolves to the analysis result
 */
export const fetchAnalysis = async (query, template) => {
  try {
    const response = await fetch(`${API_BASE_URL}?query=${encodeURIComponent(query)}&type=analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, template }),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw new Error(`Failed to fetch analysis: ${error.message}`);
  }
};

/**
 * Generates a sample medical case
 * @returns {Promise<string>} - A promise that resolves to a generated sample medical case
 */
export const generateSampleCase = async () => {
  try {
    const response = await fetch(GENERATE_CASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.medical_case;
  } catch (error) {
    console.error('Error generating sample case:', error);
    throw new Error(`Failed to generate sample case: ${error.message}`);
  }
};

/**
 * Saves a new template or updates an existing one
 * @param {Object} template - The template object to save
 * @returns {Promise<Object>} - A promise that resolves to the saved template object
 */
export const saveTemplate = async (template) => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Error saving template:', error);
    throw new Error(`Failed to save template: ${error.message}`);
  }
};

/**
 * Fetches all saved templates
 * @returns {Promise<Array>} - A promise that resolves to an array of template objects
 */
export const fetchTemplates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }
};

/**
 * Deletes a template
 * @param {string} templateId - The ID of the template to delete
 * @returns {Promise<void>}
 */
export const deleteTemplate = async (templateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    throw new Error(`Failed to delete template: ${error.message}`);
  }
};

/**
 * Generates a final analysis based on case notes, disease, events, and analyzed articles
 * @param {string} caseNotes - The patient's case notes
 * @param {string} disease - The extracted disease
 * @param {Array} events - The extracted actionable events
 * @param {Array} analyzedArticles - The analyzed articles with their metadata
 * @returns {Promise<Object>} - A promise that resolves to the final analysis object
 */
export const generateFinalAnalysis = async (caseNotes, disease, events, analyzedArticles) => {
  try {
    const response = await fetch(`${API_BASE_URL}/capricorn-final-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        case_notes: caseNotes,
        disease,
        events,
        analyzed_articles: analyzedArticles
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error generating final analysis:', error);
    throw new Error(`Failed to generate final analysis: ${error.message}`);
  }
};
