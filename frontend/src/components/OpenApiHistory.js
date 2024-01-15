import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function OpenApiHistory() {
  const { orgId } = useParams();
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // fetch data from backend server
    fetchData(orgId).then(data => {
      // convert and merge columns
      const transformedData = data.map(item => ({
        ...item,
        org: `${item.organization_id} - ${item.organization_name}`, // merge org_id and org_name
      }));
      setData(transformedData);
    });
  }, [orgId]);

  const handleRowClick = (item) => {
    console.log(item);
    navigate(`/inbound/history/detail/${item.id}`, {state: {detail: item}});
  }

  if (data.length === 0) {
    return <div>Loading...</div>;
  }

  // customize columnNames
  const columnNames = {
    "id": "ID",
    "org": "Org",
    "request_status": "Request Status",
    "response_object_id": "Response Object ID",
    "created_time": "Created Time"
  };

  // define column name
  let columns = ['id', 'org', 'request_status', 'response_object_id', 'created_time'];

  return (
    <div>
      <h2>OpenAPI History for Organization {orgId}</h2>
      <table className="table-bordered">
        <thead>
          <tr>
            {columns.map(column => <th key={column}>{columnNames[column]}</th>)}
            <th>Alert</th> {/* Alert 列标题 */}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="table-row-clickable" onClick={() => handleRowClick(item)}>
              {columns.map(column => <td key={column}>{item[column]}</td>)}
              <td>{item.alert ? '⚠️' : '✅'}</td> {/* 显示不同符号 */}
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
