/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useRef } from "react";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";

const DocumentationViewer = ({ documentation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const element = contentRef.current;
      const opt = {
        margin: [10, 10],
        filename: `${documentation.projectName || "documentation"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
      console.error("PDF generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!documentation) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "#6B7280" }}>No documentation available</p>
      </div>
    );
  }

  const files = documentation.files || [];
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "#6B7280" }}>No Python files found in the directory</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Download Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={generatePDF}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#60A5FA" : "#2563EB",
            color: "white",
            opacity: loading ? 0.5 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>{loading ? "Generating PDF..." : "Download PDF"}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded" style={{ backgroundColor: "#FEE2E2", borderLeft: "4px solid #EF4444" }}>
          <p style={{ color: "#B91C1C" }}>{error}</p>
        </div>
      )}

      {/* Documentation Content */}
      <div
        ref={contentRef}
        className="rounded-lg"
        style={{ backgroundColor: "white", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}
      >
        <div className="px-6 py-8 rounded-t-lg" style={{ backgroundColor: "#2563EB" }}>
          <h1 className="text-3xl font-bold" style={{ color: "white" }}>
            {documentation.projectName}
          </h1>
          <p className="mt-2" style={{ color: "#BFDBFE" }}>
            {documentation.projectDescription}
          </p>
        </div>

        <div className="p-6">
          {files.map((file, fileIndex) => (
            <div
              key={fileIndex}
              className="mb-8 pb-8"
              style={{
                borderBottom: fileIndex !== files.length - 1 ? "1px solid #E5E7EB" : "none",
              }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1F2937" }}>
                {file.fileName}
              </h2>

              {file.overview && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: "#374151" }}>
                    Overview
                  </h3>
                  <div style={{ color: "#4B5563" }}>
                    {file.overview.split("\n").map((paragraph, idx) => (
                      <p key={idx} className="mb-2">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {file.functions && file.functions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "#374151" }}>
                    Functions
                  </h3>
                  <div className="space-y-6">
                    {file.functions.map((func, funcIndex) => (
                      <div
                        key={funcIndex}
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        <h4 className="text-lg font-medium mb-2" style={{ color: "#2563EB" }}>
                          {func.name}
                        </h4>

                        {func.description && func.description.length > 0 && (
                          <div className="mb-4">
                            {func.description.map((desc, descIdx) => (
                              <p key={descIdx} className="mb-2" style={{ color: "#4B5563" }}>
                                {desc}
                              </p>
                            ))}
                          </div>
                        )}

                        {func.parameters && func.parameters.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                              Parameters
                            </h5>
                            <ul className="space-y-2">
                              {func.parameters.map((param, paramIdx) => (
                                <li
                                  key={paramIdx}
                                  className="pl-4"
                                  style={{
                                    color: "#4B5563",
                                    borderLeft: "2px solid #60A5FA",
                                  }}
                                >
                                  {param}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {func.returns && func.returns.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                              Returns
                            </h5>
                            <ul className="space-y-2">
                              {func.returns.map((ret, retIdx) => (
                                <li
                                  key={retIdx}
                                  className="pl-4"
                                  style={{
                                    color: "#4B5563",
                                    borderLeft: "2px solid #34D399",
                                  }}
                                >
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

        <div
          className="px-6 py-4 rounded-b-lg"
          style={{
            backgroundColor: "#F9FAFB",
            borderTop: "1px solid #E5E7EB",
            color: "#6B7280",
          }}
        >
          <p className="text-sm">Generated on {documentation.timestamp}</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentationViewer;
