import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';

function RequestAnalysis() {
  const { requestId } = useParams();
  const location = useLocation();
  const [detail, setDetail] = useState({ reqHeaders: null, reqParams: null, reqBody: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 使用 useCallback 包裹 fetchData 函数
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
  }, [requestId]); // 添加 requestId 作为依赖

  useEffect(() => {
    // 检查location.state是否已经有数据
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
              <th>Match</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {sectionData.map((item, index) => (
              <tr key={index}>
                <td>{item.fieldName}</td>
                <td>{typeof item.request_value === 'object' ? JSON.stringify(item.request_value) : item.request_value || 'N/A'}</td>
                <td>{typeof item.response_value === 'object' ? JSON.stringify(item.response_value) : item.response_value || 'N/A'}</td>
                <td>{item.match ? '✅' : '⚠️'}</td>
                <td>{typeof item.reason === 'object' ? JSON.stringify(item.reason) : item.reason || 'N/A'}</td>
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
