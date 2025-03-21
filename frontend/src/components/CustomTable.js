// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';

const CustomTable = ({ children }) => (
  <div className="overflow-x-auto max-w-full">
    <table className="min-w-full bg-white border border-gray-300">
      {children}
    </table>
  </div>
);

const CustomTableCell = ({ children, isHeader }) => {
  const content = React.Children.map(children, child => {
    if (typeof child === 'string' && child.startsWith('https://')) {
      return <a href={child} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">[Link]</a>;
    }
    return child;
  });

  const Tag = isHeader ? 'th' : 'td';
  const baseClasses = "px-4 py-2 text-sm border-t";
  const headerClasses = isHeader ? "font-semibold text-gray-600 uppercase tracking-wider bg-gray-100" : "text-gray-500";

  return (
    <Tag className={`${baseClasses} ${headerClasses}`}>
      {content}
    </Tag>
  );
};

const CustomTableRow = ({ children, isHeader }) => (
  <tr>
    {React.Children.map(children, child => (
      <CustomTableCell isHeader={isHeader}>{child}</CustomTableCell>
    ))}
  </tr>
);

const CustomTableBody = ({ children }) => <tbody>{children}</tbody>;

const CustomTableHead = ({ children }) => <thead>{children}</thead>;

export { CustomTable, CustomTableCell, CustomTableRow, CustomTableBody, CustomTableHead };