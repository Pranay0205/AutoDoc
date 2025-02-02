/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { ScrollText, Code2, ArrowRight } from "lucide-react";

const Documentation = ({ documentation }) => {
  const {
    projectName = "Project Documentation",
    projectDescription = "Generated documentation for the project",
    overview = "",
    functions = [],
    timestamp = new Date().toLocaleString(),
  } = documentation;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">{projectName}</h1>
          <p className="text-xl opacity-90">{projectDescription}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Overview Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <ScrollText className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
          </div>
          <div className="prose max-w-none">
            {overview.split("\n").map((paragraph, idx) => (
              <p key={idx} className="text-gray-600 mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Functions Section */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <Code2 className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Functions</h2>
          </div>

          <div className="space-y-8">
            {functions.map((func, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">{func.name}</h3>

                <div className="space-y-2 mb-6">
                  {func.description.map((desc, descIdx) => (
                    <p key={descIdx} className="text-gray-700">
                      {desc}
                    </p>
                  ))}
                </div>

                {func.parameters.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Parameters</h4>
                    <ul className="space-y-2">
                      {func.parameters.map((param, paramIdx) => (
                        <li key={paramIdx} className="flex items-start">
                          <ArrowRight className="w-5 h-5 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{param}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {func.returns.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Returns</h4>
                    <ul className="space-y-2">
                      {func.returns.map((ret, retIdx) => (
                        <li key={retIdx} className="flex items-start">
                          <ArrowRight className="w-5 h-5 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{ret}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Timestamp */}
        <div className="mt-8 text-right text-gray-500 text-sm">Generated on {timestamp}</div>
      </div>
    </div>
  );
};

export default Documentation;
