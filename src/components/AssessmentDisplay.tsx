import React from "react";

type AssessmentData = {
  summary: string;
  care_type: string;
  risk_factors: string[];
  estimated_cost: {
    yearly: number;
    monthly: number;
    location: string;
  };
  recommendations: string[];
};

interface AssessmentDisplayProps {
  assessment: AssessmentData;
}

export default function AssessmentDisplay({
  assessment,
}: AssessmentDisplayProps) {
  if (!assessment) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-500">No assessment data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          Assessment Summary
        </h3>
        <p className="text-gray-700 leading-relaxed">{assessment.summary}</p>
      </div>

      {/* Care Type Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-green-800 mb-3">
          Recommended Care Type
        </h3>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-900 font-medium">{assessment.care_type}</p>
        </div>
      </div>

      {/* Risk Factors Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-red-800 mb-3">
          Risk Factors
        </h3>
        <ul className="space-y-2">
          {assessment.risk_factors.map((factor, index) => (
            <li key={index} className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">•</span>
              <span className="text-gray-700">{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Estimated Cost Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">
          Estimated Costs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">
              Monthly Cost
            </div>
            <div className="text-2xl font-bold text-purple-900">
              PKR {assessment.estimated_cost.monthly.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">
              Yearly Cost
            </div>
            <div className="text-2xl font-bold text-purple-900">
              PKR {assessment.estimated_cost.yearly.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Location: {assessment.estimated_cost.location}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-indigo-800 mb-3">
          Recommendations
        </h3>
        <ol className="space-y-3">
          {assessment.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="bg-indigo-100 text-indigo-800 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-700 leading-relaxed">
                {recommendation}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
