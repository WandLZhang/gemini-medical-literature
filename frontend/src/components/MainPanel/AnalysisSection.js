import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

const AnalysisSection = ({
  extractedDisease,
  extractedEvents,
  isRetrieving,
  handleRetrieve,
  isBox3Hovered,
  setIsBox3Hovered,
  isPromptExpanded,
  setIsPromptExpanded,
  promptContent,
  setPromptContent,
  currentProgress,
  articles
}) => (
  <div 
    className={`bg-white shadow rounded-lg p-4 ${(!extractedDisease || !extractedEvents.length) ? 'opacity-25' : ''}`}
    onMouseEnter={() => extractedDisease && extractedEvents.length && setIsBox3Hovered(true)}
    onMouseLeave={() => setIsBox3Hovered(false)}
  >
    <div className="mb-1 flex justify-between items-center">
      <h2 className="text-xs font-medium text-gray-700">3 - Press Retrieve to analyze relevant papers</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={handleRetrieve}
          disabled={isRetrieving || !extractedDisease || !extractedEvents.length}
          className={`text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            (isRetrieving || !extractedDisease || !extractedEvents.length) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isRetrieving ? <LoadingSpinner /> : 'Retrieve'}
        </button>
        <button 
          onClick={() => setIsPromptExpanded(!isPromptExpanded)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {isPromptExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>
    </div>
    {isPromptExpanded && (
      <>
        <div className="flex items-start gap-2 mb-2">
          <label className="text-[10px] font-light text-gray-700 w-20 pt-1.5">Analysis instructions</label>
          <textarea
            className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-[11rem]"
            value={promptContent}
            onChange={(e) => setPromptContent(e.target.value)}
            placeholder="Enter prompt content here..."
          />
        </div>
        {currentProgress && (
          <div className="mt-2">
            <div className="text-xs flex items-center gap-2 mb-1">
              <span className={`${currentProgress.includes('final analysis') ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {currentProgress}
              </span>
              {currentProgress.includes('final analysis') && <LoadingSpinner />}
            </div>
            {currentProgress.includes('Processing article') && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  id="article-progress-bar"
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '0%' }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Display Analyzed Articles */}
        {articles.length > 0 && (
          <div className="mt-4 overflow-x-scroll" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-max bg-white border border-gray-300" style={{ minWidth: '150%' }}>
              <thead>
                <tr>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">PMID</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Title</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Year</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Type of Cancer</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Paper Type</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Actionable Events</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Drugs Tested</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Drug Results</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Full Article</th>
                  <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Points</th>
                </tr>
              </thead>
              <tbody>
                {[...articles].sort((a, b) => b.points - a.points).map((article, index) => {
                  const pointsBreakdown = Object.entries(article.point_breakdown || {})
                    .map(([k,v]) => `${k.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: ${v > 0 ? '+' : ''}${v}`)
                    .join(' | ');

                  return (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {article.pmid}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">{article.title}</td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">{article.year}</td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">{article.cancer}</td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">{article.type}</td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">
                        {article.events.map((event, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && ', '}
                            <span className={event.matches_query ? 'font-bold text-green-600' : ''}>
                              {event.event}
                            </span>
                          </React.Fragment>
                        ))}
                      </td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">{article.drugs_tested ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">{article.drug_results?.join(', ') || 'None'}</td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">
                        <button
                          onClick={() => {
                            const width = 800;
                            const height = 600;
                            const left = (window.screen.width - width) / 2;
                            const top = (window.screen.height - height) / 2;
                            const newWindow = window.open('', '_blank', 
                              `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
                            );
                            newWindow.document.write(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Full Article</title>
                                  <script src="https://cdn.tailwindcss.com"></script>
                                </head>
                                <body>
                                  <div class="min-h-screen bg-gray-50 py-8 px-4">
                                    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                                      <button onclick="window.close()" class="mb-4 text-blue-500 hover:text-blue-700">← Back to Table</button>
                                      <div class="prose max-w-none">
                                        <p class="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">${article.content}</p>
                                      </div>
                                    </div>
                                  </div>
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          View Article
                        </button>
                      </td>
                      <td className="px-4 py-2 text-sm border-t text-gray-500">
                        <button
                          onClick={() => {
                            const width = 800;
                            const height = 600;
                            const left = (window.screen.width - width) / 2;
                            const top = (window.screen.height - height) / 2;
                            const newWindow = window.open('', '_blank', 
                              `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
                            );
                            newWindow.document.write(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Points Details</title>
                                  <script src="https://cdn.tailwindcss.com"></script>
                                </head>
                                <body>
                                  <div class="min-h-screen bg-gray-50 py-8 px-4">
                                    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                                      <button onclick="window.close()" class="mb-4 text-blue-500 hover:text-blue-700">← Back to Table</button>
                                      <div class="space-y-4">
                                        <h2 class="text-2xl font-bold text-gray-800">Points Details</h2>
                                        <div class="text-4xl font-bold text-blue-600">${Math.round(article.points)} Points</div>
                                        <div class="space-y-2">
                                          ${pointsBreakdown.split(' | ').map(item => {
                                            const [label, value] = item.split(': ');
                                            return `
                                              <div class="flex justify-between items-center py-2 border-b">
                                                <span class="text-gray-600">${label}</span>
                                                <span class="font-semibold ${value.startsWith('+') ? 'text-green-600' : 'text-red-600'}">${value}</span>
                                              </div>
                                            `;
                                          }).join('')}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }}
                          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                        >
                          <span className="font-bold">{Math.round(article.points)}</span>
                          <span className="text-blue-500">ℹ️</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    )}
  </div>
);

export default AnalysisSection;
