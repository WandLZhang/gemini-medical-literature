import React from 'react';

const StreamedArticleResults = ({ currentProgress, article }) => {
  // Extract progress numbers from currentProgress if available
  const progressMatch = currentProgress?.match(/Processing article (\d+) of (\d+)/);
  const currentArticle = progressMatch ? parseInt(progressMatch[1]) : 0;
  const totalArticles = progressMatch ? parseInt(progressMatch[2]) : 0;
  const progressPercentage = totalArticles > 0 ? (currentArticle / totalArticles) * 100 : 0;

  if (!article) {
    return null;
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mt-2">
        <div className="text-xs flex items-center gap-2 mb-1">
          <span className="text-gray-600">{currentProgress}</span>
          {totalArticles > 0 && (
            <span className="text-blue-600 font-medium">
              {progressPercentage.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Current article table */}
      <div className="mt-4 overflow-x-scroll" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="min-w-max bg-white border border-gray-300" style={{ minWidth: '120%' }}>
          <thead>
            <tr>
              <th className="px-4 py-2 text-xs border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">PMID</th>
              <th className="px-4 py-2 text-xs border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Title</th>
              <th className="px-4 py-2 text-xs border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Year</th>
              <th className="px-4 py-2 text-xs border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Type of Cancer</th>
              <th className="px-4 py-2 text-xs border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Paper Type</th>
              <th className="px-4 py-2 text-xs border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Actionable Events</th>
              <th className="px-4 py-2 text-xs border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Drugs Tested</th>
              <th className="px-4 py-2 text-xs border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Drug Results</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 text-xs border-t text-gray-500 max-h-20 overflow-y-auto">
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {article.pmid}
                </a>
              </td>
              <td className="px-4 py-2 text-xs border-t text-gray-500" style={{ maxHeight: '80px', overflowY: 'auto', display: 'block', minWidth: '200px', padding: '8px 16px' }}>{article.title}</td>
              <td className="px-4 py-2 text-xs border-t text-gray-500">{article.year}</td>
              <td className="px-4 py-2 text-xs border-t text-gray-500" style={{ maxHeight: '80px', overflowY: 'auto', display: 'block', minWidth: '150px', padding: '8px 16px' }}>{article.cancer}</td>
              <td className="px-4 py-2 text-xs border-t text-gray-500">{article.type}</td>
              <td className="px-4 py-2 text-xs border-t text-gray-500" style={{ maxHeight: '80px', overflowY: 'auto', display: 'block', minWidth: '200px', padding: '8px 16px' }}>
                {article.events?.map((event, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && ', '}
                    <span className={event.matches_query ? 'font-bold text-green-600' : ''}>
                      {event.event}
                    </span>
                  </React.Fragment>
                ))}
              </td>
              <td className="px-4 py-2 text-xs border-t text-gray-500">{article.drugs_tested ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2 text-xs border-t text-gray-500" style={{ maxHeight: '80px', overflowY: 'auto', display: 'block', minWidth: '250px', padding: '8px 16px' }}>{article.drug_results?.join(', ') || 'None'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StreamedArticleResults;
