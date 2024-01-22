import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';

function RequestAnalysis() {
  const { requestId } = useParams();
  const location = useLocation();
  const [detail, setDetail] = useState({ reqHeaders: null, reqParams: null, reqBody: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:5000/inbound/history/detail?id=${requestId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const parsedData = JSON.parse(data[0]['parsed_result']);
      setDetail({
        reqHeaders: parsedData.reqHeaders,
        reqParams: parsedData.reqParams,
        reqBody: parsedData.reqBody
      });
    } catch (fetchError) {
      setError(fetchError.message);
    }
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    if (location.state?.detail) {
      try {
        const parsedData = JSON.parse(location.state.detail.parsed_result);
        setDetail({
          reqHeaders: parsedData.reqHeaders,
          reqParams: parsedData.reqParams,
          reqBody: parsedData.reqBody
        });
      } catch (parseError) {
        setError('Error parsing data from the location state');
      }
      setLoading(false);
    } else {
      fetchData();
    }
  }, [fetchData, location.state]);

  const renderMatchSymbol = (item) => {
    // 检查 important 是否为 true
    if (item.important === true) {
      return <span style={{ color: 'red' }}>&#9888;</span>; // 红色警告
    }
    // 保持原有逻辑，对于 important 为 false 或 null 的情况
    return item.match ? <span style={{ color: 'green' }}>&#10004;</span> : <span style={{ color: '#FFD700' }}>&#9888;</span>;
  };

  const renderSection = (title, sectionData) => {
    if (!sectionData || !Array.isArray(sectionData)) {
      return <p>Data is not available or in an unexpected format for {title}.</p>;
    }

    return (
      <div>
        <h3>{title}</h3>
        <table className="table-bordered">
          <thead>
            <tr>
              <th>Field Name</th>
              <th>Request Value</th>
              <th>Response Value</th>
              <th>Important</th>
              <th>Match</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {sectionData.map((item, index) => (
              <tr key={index}>
                <td className="table-cell">{item.fieldName}</td>
                <td className="table-cell">{typeof item.request_value === 'object' ? JSON.stringify(item.request_value) : item.request_value || 'N/A'}</td>
                <td className="table-cell">{typeof item.response_value === 'object' ? JSON.stringify(item.response_value) : item.response_value || 'N/A'}</td>
                <td className="table-cell">{item.important ? 'Yes' : 'No'}</td>
                <td className="table-cell">{renderMatchSymbol(item)}</td>
                <td className="table-cell">{typeof item.reason === 'object' ? JSON.stringify(item.reason) : item.reason || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Details for Request {requestId}</h2>
      {detail.reqHeaders || detail.reqParams || detail.reqBody ? (
        <>
          {renderSection('Request Headers', detail.reqHeaders)}
          {renderSection('Request Parameters', detail.reqParams)}
          {renderSection('Request Body', detail.reqBody)}
        </>
      ) : (
        <p>No data available to display.</p>
      )}
    </div>
  );
}

export default RequestAnalysis;
