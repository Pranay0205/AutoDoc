/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

const DocumentationViewer = ({ documentation }) => {
  console.log("Documentation received:", documentation);

  if (!documentation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No documentation available</p>
      </div>
    );
  }

  // Ensure files array exists
  const files = documentation.files || [];
  console.log("Files array:", files);

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No Python files found in the directory</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-8 rounded-t-lg">
        <h1 className="text-3xl font-bold">{documentation.projectName}</h1>
        <p className="mt-2 text-blue-100">{documentation.projectDescription}</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {files.map((file, fileIndex) => (
          <div key={fileIndex} className="mb-8 pb-8 border-b border-gray-200 last:border-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{file.fileName}</h2>

            {/* Overview */}
            {file.overview && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Overview</h3>
                <div className="prose text-gray-600">
                  {file.overview.split("\n").map((paragraph, idx) => (
                    <p key={idx} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Functions */}
            {file.functions && file.functions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Functions</h3>
                <div className="space-y-6">
                  {file.functions.map((func, funcIndex) => (
                    <div key={funcIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-lg font-medium text-blue-600 mb-2">{func.name}</h4>

                      {/* Description */}
                      {func.description && func.description.length > 0 && (
                        <div className="mb-4">
                          {func.description.map((desc, descIdx) => (
                            <p key={descIdx} className="text-gray-600 mb-2">
                              {desc}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Parameters */}
                      {func.parameters && func.parameters.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Parameters</h5>
                          <ul className="list-none space-y-2">
                            {func.parameters.map((param, paramIdx) => (
                              <li key={paramIdx} className="text-gray-600 pl-4 border-l-2 border-blue-400">
                                {param}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Returns */}
                      {func.returns && func.returns.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Returns</h5>
                          <ul className="list-none space-y-2">
                            {func.returns.map((ret, retIdx) => (
                              <li key={retIdx} className="text-gray-600 pl-4 border-l-2 border-green-400">
                                {ret}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 text-gray-500 text-sm rounded-b-lg border-t border-gray-200">
        Generated on {documentation.timestamp}
      </div>
    </div>
  );
};

export default DocumentationViewer;
