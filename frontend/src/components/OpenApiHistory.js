import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function OpenApiHistory() {
  const { orgId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(orgId).then(data => {
      if (data.length === 0) {
        // 如果数据为空，设置默认值
        setData([{ reqHeaders: [], reqParams: [], reqBody: [] }]);
      } else {
        const transformedData = data.map(item => ({
          ...item,
          org: `${item.organization_id} - ${item.organization_name}`,
        }));
        setData(transformedData);
      }
      setLoading(false);
    }).catch(error => {
      setError(error.message);
      setLoading(false);
    });
  }, [orgId]);

  const handleRowClick = (item) => {
    navigate(`/inbound/history/detail/${item.id}`, { state: { detail: item } });
  }

  const renderAlertSymbol = (alertValue) => {
    switch(alertValue) {
      case 1:
        return <span style={{ color: 'red' }}>&#9888;</span>;  
      case -1:
        return <span style={{ color: '#FFD700' }}>&#9888;</span>;  
      case 0:
        return <span style={{ color: 'green' }}>&#10004;</span>;
      default:
        return <span>N/A</span>
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const columnNames = {
    "id": "ID",
    "org": "Org",
    "request_status": "Request Status",
    "response_object_id": "Response Object ID",
    "created_time": "Created Time"
  };

  let columns = ['id', 'org', 'request_status', 'response_object_id', 'created_time'];

  return (
    <div>
      <h2>OpenAPI History for Organization {orgId}</h2>
      <table className="table-bordered">
        <thead>
          <tr>
            {columns.map(column => <th key={column}>{columnNames[column]}</th>)}
            <th>Alert</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="table-row-clickable" onClick={() => handleRowClick(item)}>
              {columns.map(column => <td key={column}>{item[column] || 'N/A'}</td>)}
              <td>{renderAlertSymbol(item.alert)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function fetchData(orgId) {
  const response = await fetch(`http://127.0.0.1:5000/inbound/history?inOrganizationId=${orgId}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}

export default OpenApiHistory;
